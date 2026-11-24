# AlertaGolpe — Quem ligou pra você?

🔗 **Site no ar:** https://fabiomarcos2058-ship-it.github.io/alerta-golpes/

Aplicação web para **consultar e denunciar números de telefone suspeitos**, feita com
React + Vite, Tailwind CSS v4 e ícones Lucide React. Modo escuro nativo e layout responsivo.

> Sem o Supabase configurado, o site roda em **modo demonstração** com números fictícios.
> Veja "Modo online" abaixo.

## Como rodar

Precisa do [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
npm install
npm run dev      # abre em http://localhost:5173
```

Build de produção (gera a pasta `dist/`, pronta para Netlify, Vercel ou GitHub Pages):

```bash
npm run build
npm run preview  # testa o build localmente
```

**GitHub Pages:** já configurado em `.github/workflows/deploy.yml` — todo push na `main`
gera e publica o site automaticamente (Settings → Pages → Source: GitHub Actions).

**Netlify:** comando de build `npm run build`, pasta de publicação `dist`.

## Funcionalidades

- **Consulta rápida** — digite um número com DDD (máscara automática) ou só o DDD.
  - Selo de status: 🔴 Perigoso · 🟡 Suspeito · 🟢 Seguro
  - Total de denúncias, golpes mais associados (com %), última e primeira denúncia,
    % de relatos graves e os 3 relatos mais recentes.
  - Busca por DDD mostra um panorama da região e os números mais denunciados (mascarados).
- **Nova denúncia** — modal com número, tipo de golpe, nível de periculosidade e relato,
  validação campo a campo e tela de sucesso. As suas denúncias ficam salvas no navegador
  (`localStorage`) e entram na consulta e no feed na hora.
- **Feed ao vivo** — últimas denúncias da comunidade com final do número oculto; novas
  denúncias simuladas chegam a cada 8–18 segundos.
- **Dicas de segurança** + passo a passo para quem caiu num golpe.

## Estrutura

```
src/
├── App.jsx                  # monta a página e controla busca/modal/toast
├── main.jsx
├── index.css                # Tailwind v4 + tema (cores, fontes, animações)
├── components/
│   ├── Header.jsx
│   ├── SearchPanel.jsx      # campo de busca + exemplos
│   ├── ResultCard.jsx       # resultado por número e por DDD (+ skeleton)
│   ├── StatusBadge.jsx
│   ├── ReportModal.jsx      # formulário de denúncia com validação
│   ├── FeedbackModal.jsx    # formulário de feedback (estrelas, tipo, mensagem)
│   ├── ScamSimulator.jsx    # seção com os cenários do simulador
│   ├── CallSimulator.jsx    # tela da ligação simulada
│   ├── RecentFeed.jsx       # feed "ao vivo"
│   ├── SafetyTips.jsx
│   ├── StatsStrip.jsx
│   └── Toast.jsx
├── config.js                # URL e chave do Supabase (vazio = modo demonstração)
├── lib/supabase.js
├── data/
│   ├── constants.js         # categorias, gravidades, status e regra de classificação
│   └── seed.js              # base fictícia do modo demonstração
├── hooks/
│   ├── useReports.js        # busca, denúncia e feed (usa o backend escolhido)
│   └── useNow.js
├── services/
│   ├── backend.js           # escolhe online ou demonstração
│   ├── supabaseBackend.js   # chamadas ao Supabase
│   ├── demoBackend.js       # base fictícia + denúncias simuladas
│   └── stats.js             # cálculos do modo demonstração
└── utils/phone.js           # máscara, 0303, validação de DDD, "há X min"
supabase/schema.sql          # tabela, regras de segurança e funções do banco
```

## Modo online (Supabase) × modo demonstração

- **Sem configuração**, o site roda em **modo demonstração**: base fictícia no navegador.
- **Com o Supabase configurado** em `src/config.js`, as denúncias ficam salvas na nuvem e
  aparecem para todo mundo.

### Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. **Authentication → Sign In / Providers**: ative **Allow anonymous sign-ins**
   (cada navegador vira uma "pessoa" anônima, sem cadastro).
4. Copie a **Project URL** e a **publishable key** (ou *anon key*) e coloque em `src/config.js`.
   Nunca use a *secret / service_role key* no site.

### Segurança e anti-abuso (tudo no banco)

- Ninguém lê nem grava direto na tabela; o site só usa funções (`consultar_numero`,
  `panorama_ddd`, `denuncias_recentes`, `estatisticas_gerais`, `registrar_denuncia`).
- O feed e o panorama por DDD recebem o número **já mascarado** do servidor.
- Cada pessoa pode fazer até **10 denúncias por dia** e só **1 por número a cada 30 dias**.
- Feedbacks: até **5 por pessoa por dia**, e ninguém além de você consegue lê-los.

## Visual e navegação

Tema claro e calmo, com a fonte Atkinson Hyperlegible (feita para ser fácil de ler por
qualquer pessoa). Navegação em abas: **Consultar**, **Simular golpe**, **Analisar mensagem**,
**Dicas** e **Minha área**. No celular as abas ficam numa barra fixa embaixo. O botão
**Texto maior** aumenta tudo e fica salvo no aparelho.

## Novas funções

- **Analisar mensagem:** cole um SMS ou WhatsApp e veja os sinais de golpe marcados no texto.
  A análise roda no aparelho (`src/lib/analyzeMessage.js`); nada é enviado.
- **Minha lista:** salve números para acompanhar o status (fica no aparelho).
- **Pesquisas recentes** embaixo do campo de busca.
- **Avisar família e amigos:** compartilha o alerta do número (WhatsApp ou menu do celular).
- **Conquistas do simulador:** um escudo para cada golpe em que a pessoa se protegeu.
- **Login opcional com o número:** código por SMS. Sem login tudo funciona.
  - Modo demonstração: nenhum SMS é enviado e o código é `123456`.
  - Online: Supabase → Authentication → Sign In / Providers → **Phone**, com um provedor
    de SMS (Twilio, MessageBird, Vonage ou Textlocal). A função `minhas_denuncias` do
    `supabase/schema.sql` mostra as denúncias da pessoa em qualquer aparelho.

## Planos e teste grátis (simulação)

Nenhuma compra é real e nenhum dado é pedido: o plano fica marcado só no aparelho (localStorage).

- **Gratuito**: consultar, denunciar, os 4 golpes principais do simulador, analisar mensagens e dicas. Limites: lista com até 5 números, sem golpes extras, sem relatório do treino e sem painel de turma/equipe.
- **Teste grátis de 7 dias**: libera tudo dos planos pagos uma vez por aparelho e volta sozinho para o Gratuito quando acaba.
- **Escolas e Empresas**: golpes extras no simulador (vaga de emprego falsa e falso fornecedor), relatório do treino, painel de exemplo e lista sem limite.
- A aba **Planos** aparece no menu do celular e do computador, com selo do teste ou dos dias restantes, e há um convite ao teste na página inicial.
- Código: `src/hooks/usePlan.js`, `src/components/UpgradePrompt.jsx`, `src/data/plans.js`.

## Logo

`public/favicon.svg` é a marca (escudo + telefone tocando). As versões completas ficam
fora do repositório, entregues à parte em SVG e PNG.

## Simulador de golpe

Seção "Treine antes que aconteça": a pessoa escolhe um golpe, recebe uma ligação falsa na
tela, lê (e ouve, se o aparelho tiver voz em português) o que o golpista diz e escolhe o que
responder. Cada escolha mostra o sinal de golpe que estava ali, e no final aparece o
resultado com a lista de sinais.

Cenários: falsa central do banco, falso parente, falso empréstimo e código do WhatsApp.
Os roteiros ficam em `src/data/scamScenarios.js`. Todos os nomes, empresas e números
são fictícios. Para criar um cenário novo, copie um existente e mude as falas, as
escolhas e os finais.

## Feedbacks

Botão **Feedback** no cabeçalho (computador), seção "O que você achou do site?" no fim da
página e link no rodapé. O visitante dá uma nota de 1 a 5 estrelas, escolhe o tipo
(sugestão, problema, elogio, outro), escreve a mensagem e, se quiser, deixa um contato.

- **Online:** salvo na tabela `feedbacks`. Só o dono do projeto vê, em
  **Supabase → Table Editor → feedbacks**. Limite de 5 feedbacks por pessoa por dia.
- **Demonstração:** fica salvo só no navegador de quem enviou.

## Regra de status

Conta **pessoas diferentes**, para uma pessoa só não conseguir "queimar" um número:

- sem denúncias → **Seguro**
- 3+ pessoas marcaram "Alto", ou 5+ pessoas e ao menos 1 "Alto" → **Perigoso**
- qualquer outro caso → **Suspeito**

A regra está em `supabase/schema.sql` (`_status_numero`) e espelhada em
`src/data/constants.js` (`classifyCounts`).

Números com prefixo **0303** recebem um aviso de telemarketing. A Anatel reservou esse
prefixo para telemarketing; o uso deixou de ser obrigatório em 2025.

## Próximos passos sugeridos

- Moderação dos relatos (painel para esconder relatos com dados pessoais ou ofensas).
- Captcha no envio (ex.: Cloudflare Turnstile) se aparecer spam.
