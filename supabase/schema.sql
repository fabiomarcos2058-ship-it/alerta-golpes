-- =====================================================================
--  Alerta Golpe — estrutura do banco de dados (Supabase / PostgreSQL)
--  Como usar: Supabase → SQL Editor → New query → cole TUDO → Run.
--  Pode rodar de novo sem problema (o script é idempotente).
-- =====================================================================

-- 1) Tabela de denúncias ------------------------------------------------
create table if not exists public.denuncias (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null
              check (phone ~ '^([1-9][0-9]{9,10}|0303[0-9]{6,8})$'),
  category    text not null
              check (category in ('telemarketing','falso-banco','pix','emprestimo',
                                  'extorsao','robocall','whatsapp','falso-parente','outro')),
  severity    text not null check (severity in ('leve','moderado','alto')),
  description text not null check (char_length(description) between 20 and 600),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Código derivado do IP de quem denunciou (não dá para voltar ao IP). Serve só para o limite contra abuso.
alter table public.denuncias add column if not exists ip_hash text;

create index if not exists denuncias_phone_idx    on public.denuncias (phone, created_at desc);
create index if not exists denuncias_ip_idx       on public.denuncias (ip_hash, created_at desc);
create index if not exists denuncias_created_idx  on public.denuncias (created_at desc);
create index if not exists denuncias_reporter_idx on public.denuncias (reporter_id, created_at desc);

-- Ninguém lê nem grava direto na tabela: tudo passa pelas funções abaixo.
-- Assim o identificador de quem denunciou nunca sai do banco.
alter table public.denuncias enable row level security;
revoke all on public.denuncias from anon, authenticated;

-- Números cujas denúncias foram apagadas depois de um pedido de revisão aceito
-- (criada aqui porque consultar_numero, abaixo, usa esta tabela).
create table if not exists public.numeros_revisados (
  phone       text primary key,
  revisado_em timestamptz not null default now()
);

-- 2) Funções auxiliares ------------------------------------------------
-- Regra de status (espelhada em src/data/constants.js → classify):
--   sem denúncias                                        → seguro
--   3+ pessoas marcaram "Alto", ou 5+ pessoas e 1 "Alto" → perigoso
--   qualquer outro caso                                  → suspeito
create or replace function public._status_numero(p_total int, p_reporters int, p_reporters_alto int)
returns text
language sql immutable
set search_path = public
as $$
  select case
    when p_total = 0 then 'seguro'
    when p_reporters_alto >= 3 or (p_reporters >= 5 and p_reporters_alto >= 1) then 'perigoso'
    else 'suspeito'
  end
$$;

-- Número sem os 2 últimos dígitos (para exibir mascarado).
create or replace function public._prefixo(p_phone text)
returns text
language sql immutable
set search_path = public
as $$ select left(p_phone, length(p_phone) - 2) $$;

-- 3) Consulta de um número --------------------------------------------
create or replace function public.consultar_numero(p_phone text)
returns json
language sql stable security definer
set search_path = public
as $$
  with d as (
    select * from denuncias where phone = p_phone
  ),
  agg as (
    select
      count(*)::int                                                          as total,
      count(distinct reporter_id)::int                                       as reporters,
      (count(distinct reporter_id) filter (where severity = 'alto'))::int    as reporters_alto,
      (count(*) filter (where severity = 'leve'))::int                       as leve,
      (count(*) filter (where severity = 'moderado'))::int                   as moderado,
      (count(*) filter (where severity = 'alto'))::int                       as alto,
      max(created_at)                                                        as last_at,
      min(created_at)                                                        as first_at
    from d
  )
  select json_build_object(
    'total',          agg.total,
    'reporters',      agg.reporters,
    'reporters_alto', agg.reporters_alto,
    'status',         _status_numero(agg.total, agg.reporters, agg.reporters_alto),
    'severity',       json_build_object('leve', agg.leve, 'moderado', agg.moderado, 'alto', agg.alto),
    'reviewed_at',    (select revisado_em from numeros_revisados where phone = p_phone),
    'last_at',        agg.last_at,
    'first_at',       agg.first_at,
    'categories',     coalesce((
                        select json_agg(c order by c.count desc)
                        from (select category as id, count(*)::int as count
                              from d group by category order by count(*) desc limit 4) c
                      ), '[]'::json),
    'recent',         coalesce((
                        select json_agg(r order by r.created_at desc)
                        from (select id, category, severity, description, created_at
                              from (select distinct on (description) *
                                      from d where description is not null
                                     order by description, created_at desc) u
                             order by created_at desc limit 3) r
                      ), '[]'::json)
  )
  from agg
$$;

-- 4) Panorama de um DDD -----------------------------------------------
create or replace function public.panorama_ddd(p_ddd text)
returns json
language sql stable security definer
set search_path = public
as $$
  with d as (
    select * from denuncias
    where p_ddd ~ '^[1-9][0-9]$' and left(phone, 2) = p_ddd
  ),
  por_numero as (
    select phone,
           count(*)::int                                                       as total,
           count(distinct reporter_id)::int                                    as reporters,
           (count(distinct reporter_id) filter (where severity = 'alto'))::int as reporters_alto
    from d group by phone
  ),
  classif as (
    select *, _status_numero(total, reporters, reporters_alto) as status from por_numero
  )
  select json_build_object(
    'total',           (select count(*) from d),
    'numbers_count',   (select count(*) from classif),
    'dangerous_count', (select count(*) from classif where status = 'perigoso'),
    'last_at',         (select max(created_at) from d),
    'categories',      coalesce((
                         select json_agg(c order by c.count desc)
                         from (select category as id, count(*)::int as count
                               from d group by category order by count(*) desc limit 4) c
                       ), '[]'::json),
    'top_numbers',     coalesce((
                         select json_agg(t order by t.total desc)
                         from (select _prefixo(phone) as prefixo, total, status
                               from classif order by total desc limit 5) t
                       ), '[]'::json)
  )
$$;

-- 5) Feed de denúncias recentes (número já sai mascarado) --------------
create or replace function public.denuncias_recentes(p_limit int default 20)
returns table (id uuid, prefixo text, category text, severity text, created_at timestamptz, minha boolean)
language sql stable security definer
set search_path = public
as $$
  select d.id, _prefixo(d.phone), d.category, d.severity, d.created_at,
         coalesce(d.reporter_id = auth.uid(), false)
  from denuncias d
  order by d.created_at desc
  limit least(greatest(coalesce(p_limit, 20), 1), 50)
$$;

-- 6) Números gerais ----------------------------------------------------
create or replace function public.estatisticas_gerais()
returns json
language sql stable security definer
set search_path = public
as $$
  select json_build_object(
    'total',   count(*),
    'numbers', count(distinct phone),
    'last24h', count(*) filter (where created_at > now() - interval '24 hours')
  )
  from denuncias
$$;

-- 7) Registrar denúncia (com limites anti-abuso) -----------------------
-- Números oficiais que não podem ser denunciados (centrais de bancos, órgãos públicos…).
-- Golpistas falsificam esses números na tela (spoofing); denunciá-los prejudicaria o serviço verdadeiro.
-- Cadastre em Table Editor → numeros_protegidos (só dígitos, com DDD).
create table if not exists public.numeros_protegidos (
  phone text primary key,
  nome  text not null
);
alter table public.numeros_protegidos enable row level security;
revoke all on public.numeros_protegidos from anon, authenticated;

-- Código do IP de quem está chamando. O Supabase repassa o IP no cabeçalho x-forwarded-for.
-- Troque o texto 'troque-este-sal' por qualquer frase secreta sua.
create or replace function public.ip_hash_atual()
returns text
language plpgsql stable security definer
set search_path = public
as $$
declare v_ip text;
begin
  v_ip := btrim(split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1));
  if v_ip = '' then return null; end if;
  return encode(extensions.digest(v_ip || 'troque-este-sal', 'sha256'), 'hex');
end $$;
revoke execute on function public.ip_hash_atual() from public, anon, authenticated;

create or replace function public.registrar_denuncia(
  p_phone text, p_category text, p_severity text, p_description text
)
returns json
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_ip  text := ip_hash_atual();
  v_row denuncias;
begin
  if v_uid is null then
    raise exception 'Sessão expirada. Recarregue a página e tente de novo.';
  end if;

  if exists (select 1 from numeros_protegidos where phone = p_phone) then
    raise exception 'Este é um número oficial protegido e não pode ser denunciado. Se alguém usou esse número para te enganar, ele pode ter sido falsificado: avise o seu banco.';
  end if;

  -- Limite por rede: impede que alguém crie várias sessões anônimas para denunciar em massa.
  -- 30 por dia é folgado para redes compartilhadas (escola, empresa, operadora de celular).
  if v_ip is not null and (select count(*) from denuncias
      where ip_hash = v_ip and created_at > now() - interval '24 hours') >= 30 then
    raise exception 'Muitas denúncias saíram desta rede hoje. Tente de novo amanhã.';
  end if;

  if (select count(*) from denuncias
      where reporter_id = v_uid and created_at > now() - interval '24 hours') >= 10 then
    raise exception 'Você atingiu o limite de 10 denúncias por dia. Tente de novo amanhã.';
  end if;

  if exists (select 1 from denuncias
             where reporter_id = v_uid and phone = p_phone
               and created_at > now() - interval '30 days') then
    raise exception 'Você já denunciou este número nos últimos 30 dias.';
  end if;

  insert into denuncias (phone, category, severity, description, reporter_id, ip_hash)
  values (p_phone, p_category, p_severity, btrim(p_description), v_uid, v_ip)
  returning * into v_row;

  return json_build_object('id', v_row.id, 'phone', v_row.phone, 'created_at', v_row.created_at);
end
$$;

-- 8) Permissões --------------------------------------------------------
revoke execute on function public.registrar_denuncia(text, text, text, text) from public, anon;
grant  execute on function public.registrar_denuncia(text, text, text, text) to authenticated;

grant execute on function public.consultar_numero(text)  to anon, authenticated;
grant execute on function public.panorama_ddd(text)      to anon, authenticated;
grant execute on function public.denuncias_recentes(int) to anon, authenticated;
grant execute on function public.estatisticas_gerais()   to anon, authenticated;

-- =====================================================================
--  FEEDBACKS dos visitantes sobre o site
--  Só você vê: Supabase → Table Editor → feedbacks
-- =====================================================================

create table if not exists public.feedbacks (
  id          uuid primary key default gen_random_uuid(),
  rating      smallint not null check (rating between 1 and 5),
  kind        text not null check (kind in ('sugestao','problema','elogio','outro')),
  message     text not null check (char_length(message) between 10 and 1000),
  contact     text check (contact is null or char_length(contact) <= 120),
  page        text check (page is null or char_length(page) <= 200),
  user_agent  text check (user_agent is null or char_length(user_agent) <= 300),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists feedbacks_created_idx  on public.feedbacks (created_at desc);
create index if not exists feedbacks_reporter_idx on public.feedbacks (reporter_id, created_at desc);

-- Visitantes não leem nem gravam direto: só pela função abaixo.
alter table public.feedbacks enable row level security;
revoke all on public.feedbacks from anon, authenticated;

create or replace function public.enviar_feedback(
  p_rating int, p_kind text, p_message text, p_contact text default null,
  p_page text default null, p_user_agent text default null
)
returns json
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'Sessão expirada. Recarregue a página e tente de novo.';
  end if;

  if (select count(*) from feedbacks
      where reporter_id = v_uid and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'Você já enviou 5 feedbacks hoje. Obrigado! Tente de novo amanhã.';
  end if;

  insert into feedbacks (rating, kind, message, contact, page, user_agent, reporter_id)
  values (p_rating, p_kind, btrim(p_message),
          nullif(btrim(coalesce(p_contact, '')), ''),
          left(p_page, 200), left(p_user_agent, 300), v_uid)
  returning id into v_id;

  return json_build_object('id', v_id);
end
$$;

revoke execute on function public.enviar_feedback(int, text, text, text, text, text) from public, anon;
grant  execute on function public.enviar_feedback(int, text, text, text, text, text) to authenticated;

-- =====================================================================
--  LOGIN OPCIONAL + "Minhas denúncias"
--  Para o login com número: Authentication → Sign In / Providers → Phone
--  (precisa de um provedor de SMS, como Twilio). Sem isso o site funciona
--  normalmente, só o botão "Entrar" avisa que o login não está ativo.
-- =====================================================================
create or replace function public.minhas_denuncias()
returns table (id uuid, phone text, category text, severity text, description text, created_at timestamptz)
language sql stable security definer
set search_path = public
as $$
  select d.id, d.phone, d.category, d.severity, d.description, d.created_at
  from denuncias d
  where d.reporter_id = auth.uid()
  order by d.created_at desc
  limit 100
$$;

revoke execute on function public.minhas_denuncias() from public, anon;
grant  execute on function public.minhas_denuncias() to authenticated;


-- =====================================================================
--  MODERAÇÃO: pedidos de revisão e denúncias apagadas
--  Para virar moderador: Table Editor → moderadores → Insert row →
--  cole o seu user id (Authentication → Users). Depois entre no site
--  com o seu número e abra #moderacao.
-- =====================================================================
create table if not exists public.moderadores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.pedidos_revisao (
  id           uuid primary key default gen_random_uuid(),
  phone        text not null check (phone ~ '^([1-9][0-9]{9,10}|0303[0-9]{6,8})$'),
  reason       text not null check (reason in ('meu','clonado','novo','empresa')),
  status       text not null default 'pendente' check (status in ('pendente','aprovado','recusado')),
  requester_id uuid not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  decided_at   timestamptz,
  decided_by   uuid references auth.users (id)
);

-- Denúncias apagadas saem da tabela principal (as consultas não mudam) e ficam guardadas aqui.
create table if not exists public.denuncias_apagadas (
  like public.denuncias,
  apagada_em  timestamptz not null default now(),
  apagada_por uuid,
  motivo      text not null
);
alter table public.denuncias_apagadas add column if not exists ip_hash text;

alter table public.moderadores        enable row level security;
alter table public.numeros_revisados  enable row level security;
alter table public.pedidos_revisao    enable row level security;
alter table public.denuncias_apagadas enable row level security;
revoke all on public.moderadores, public.numeros_revisados, public.pedidos_revisao, public.denuncias_apagadas from anon, authenticated;

create or replace function public.sou_moderador()
returns boolean
language sql stable security definer
set search_path = public
as $$ select exists (select 1 from moderadores where user_id = auth.uid()) $$;

create or replace function public.pedir_revisao(p_phone text, p_reason text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then
    raise exception 'Sessão expirada. Recarregue a página e tente de novo.';
  end if;
  if (select count(*) from pedidos_revisao
      where requester_id = v_uid and created_at > now() - interval '24 hours') >= 3 then
    raise exception 'Você já enviou 3 pedidos de revisão hoje. Tente de novo amanhã.';
  end if;
  if exists (select 1 from pedidos_revisao where phone = p_phone and status = 'pendente') then
    raise exception 'Já existe um pedido de revisão em análise para este número.';
  end if;
  insert into pedidos_revisao (phone, reason, requester_id) values (p_phone, p_reason, v_uid)
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.moderacao_listar()
returns json
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not sou_moderador() then raise exception 'Área só para moderadores.'; end if;
  return json_build_object(
    'revisoes', coalesce((select json_agg(r order by r.created_at desc) from (
        select id, phone, reason, status, created_at, decided_at from pedidos_revisao
        order by created_at desc limit 100) r), '[]'::json),
    'denuncias', coalesce((select json_agg(d order by d.created_at desc) from (
        select id, phone, category, severity, description, created_at from denuncias
        order by created_at desc limit 50) d), '[]'::json)
  );
end $$;

create or replace function public.decidir_revisao(p_id uuid, p_aprovar boolean)
returns void
language plpgsql security definer
set search_path = public
as $$
declare v_phone text;
begin
  if not sou_moderador() then raise exception 'Área só para moderadores.'; end if;
  update pedidos_revisao
     set status = case when p_aprovar then 'aprovado' else 'recusado' end,
         decided_at = now(), decided_by = auth.uid()
   where id = p_id and status = 'pendente'
  returning phone into v_phone;
  if v_phone is null then raise exception 'Pedido não encontrado ou já decidido.'; end if;
  if p_aprovar then
    with moved as (delete from denuncias where phone = v_phone returning *)
    insert into denuncias_apagadas (id, phone, category, severity, description, reporter_id, created_at, ip_hash, apagada_em, apagada_por, motivo)
    select id, phone, category, severity, description, reporter_id, created_at, ip_hash, now(), auth.uid(), 'revisao' from moved;
    insert into numeros_revisados (phone) values (v_phone)
      on conflict (phone) do update set revisado_em = now();
  end if;
end $$;

create or replace function public.apagar_denuncia(p_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not sou_moderador() then raise exception 'Área só para moderadores.'; end if;
  with moved as (delete from denuncias where id = p_id returning *)
  insert into denuncias_apagadas (id, phone, category, severity, description, reporter_id, created_at, ip_hash, apagada_em, apagada_por, motivo)
  select id, phone, category, severity, description, reporter_id, created_at, ip_hash, now(), auth.uid(), 'moderacao' from moved;
end $$;

revoke execute on function public.sou_moderador(), public.pedir_revisao(text, text), public.moderacao_listar(),
  public.decidir_revisao(uuid, boolean), public.apagar_denuncia(uuid) from public, anon;
grant execute on function public.sou_moderador(), public.pedir_revisao(text, text), public.moderacao_listar(),
  public.decidir_revisao(uuid, boolean), public.apagar_denuncia(uuid) to authenticated;

-- =====================================================================
--  RETENÇÃO (o que a Política de privacidade promete)
--  Rode à mão de vez em quando, ou agende com a extensão pg_cron:
--    select cron.schedule('limpeza-diaria', '0 4 * * *', 'select public.limpar_dados_antigos()');
-- =====================================================================
create or replace function public.limpar_dados_antigos()
returns json
language plpgsql security definer
set search_path = public
as $$
declare a int; b int; c int; d int;
begin
  delete from denuncias          where created_at < now() - interval '2 years';  get diagnostics a = row_count;
  delete from denuncias_apagadas where apagada_em < now() - interval '6 months'; get diagnostics b = row_count;
  delete from feedbacks          where created_at < now() - interval '1 year';   get diagnostics c = row_count;
  delete from pedidos_revisao    where created_at < now() - interval '1 year';   get diagnostics d = row_count;
  return json_build_object('denuncias', a, 'apagadas', b, 'feedbacks', c, 'revisoes', d);
end $$;

revoke execute on function public.limpar_dados_antigos() from public, anon, authenticated;
