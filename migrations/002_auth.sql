-- Migración 002: autenticación + RLS endurecida
-- Run desde Supabase Dashboard → SQL Editor

-- 1) Allowlist de emails pre-aprobados.
--    Vos cargás los emails manualmente (insert) desde el dashboard.
create table if not exists public.allowed_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.allowed_users enable row level security;

-- Cualquier autenticado puede leer la lista (la app la consulta tras el callback
-- de Google para decidir si signOut o dejar entrar).
drop policy if exists "Authenticated can read allowed_users" on public.allowed_users;
create policy "Authenticated can read allowed_users"
  on public.allowed_users
  for select
  to authenticated
  using (true);

-- 2) Tighten RLS de page_layouts: reemplaza la policy abierta (`for all using(true)`)
--    por una que requiere usuario autenticado.
drop policy if exists "Builder full access" on public.page_layouts;
drop policy if exists "Authenticated full access to page_layouts" on public.page_layouts;
create policy "Authenticated full access to page_layouts"
  on public.page_layouts
  for all
  to authenticated
  using (true)
  with check (true);

-- 3) Bootstrap: insertar el email del owner para poder loguearse la primera vez.
--    Descomentar y reemplazar antes de correr en prod, o insertar manualmente.
-- insert into public.allowed_users (email)
-- values ('juanv87@gmail.com')
-- on conflict do nothing;
