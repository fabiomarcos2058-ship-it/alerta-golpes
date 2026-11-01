# AlertaGolpe — Quem ligou pra você?

🔗 **Site no ar:** https://fabiomarcos2058-ship-it.github.io/alerta-golpes/

Aplicação web para **consultar e denunciar números de telefone suspeitos**, feita com
React + Vite, Tailwind CSS v4 e ícones Lucide React. Modo escuro nativo e layout responsivo.

> ⚠️ Versão de demonstração: o "banco de dados" é simulado no navegador e todos os números
> da base são fictícios. Veja abaixo como ligar num backend real.

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
│   ├── RecentFeed.jsx       # feed "ao vivo"
│   ├── SafetyTips.jsx
│   ├── StatsStrip.jsx
│   └── Toast.jsx
├── data/
│   ├── constants.js         # categorias, gravidades, status e regra de classificação
│   └── seed.js              # base fictícia
├── hooks/
│   ├── useReports.js        # "banco de dados" simulado (busca, denúncia, tempo real)
│   └── useNow.js
├── services/stats.js        # cálculo das estatísticas
└── utils/phone.js           # máscara, validação de DDD, "há X min"
```

## Regra de status

Cada denúncia vale pontos pela gravidade (Leve 1, Moderado 2, Alto 4):

- sem denúncias → **Seguro**
- 3 ou mais denúncias "Alto", ou 1 "Alto" + 12 pontos → **Perigoso**
- qualquer outro caso → **Suspeito**

Ajuste em `src/data/constants.js` → `classify()`.

## Ligando num backend real

Tudo passa por `src/hooks/useReports.js`:

- `search(query)` → troque por `fetch('/api/numeros/' + numero)`
- `addReport(form)` → troque por `fetch('/api/denuncias', { method: 'POST', ... })`
- o `setTimeout` do feed → troque por WebSocket/SSE ou polling

Opções simples: Supabase ou Firebase (banco + tempo real prontos).

Antes de publicar de verdade, pense em: moderação dos relatos, limite de denúncias por
usuário (evitar que alguém "queime" o número de outra pessoa) e LGPD — os relatos são
opiniões de usuários e o site deve deixar isso claro.
