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

create index if not exists denuncias_phone_idx    on public.denuncias (phone, created_at desc);
create index if not exists denuncias_created_idx  on public.denuncias (created_at desc);
create index if not exists denuncias_reporter_idx on public.denuncias (reporter_id, created_at desc);

-- Ninguém lê nem grava direto na tabela: tudo passa pelas funções abaixo.
-- Assim o identificador de quem denunciou nunca sai do banco.
alter table public.denuncias enable row level security;
revoke all on public.denuncias from anon, authenticated;

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
                              from d order by created_at desc limit 3) r
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
create or replace function public.registrar_denuncia(
  p_phone text, p_category text, p_severity text, p_description text
)
returns json
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row denuncias;
begin
  if v_uid is null then
    raise exception 'Sessão expirada. Recarregue a página e tente de novo.';
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

  insert into denuncias (phone, category, severity, description, reporter_id)
  values (p_phone, p_category, p_severity, btrim(p_description), v_uid)
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
