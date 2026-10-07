-- 1) Servicio nuevo / antiguo. NULL = sin clasificar (luminarias ya existentes).
alter table public.luminarias
  add column if not exists servicio text
  constraint luminarias_servicio_check check (servicio in ('nuevo', 'antiguo'));

-- 2) Historial de cambios de tipo de luminaria.
create table if not exists public.luminarias_historial_tipo (
  id bigint generated always as identity primary key,
  luminaria_id bigint not null references public.luminarias (id) on delete cascade,
  tipo_anterior text,
  tipo_nuevo text,
  cambiado_por uuid default auth.uid(),
  cambiado_por_email text,
  cambiado_en timestamptz not null default now()
);

create index if not exists luminarias_historial_tipo_luminaria_idx
  on public.luminarias_historial_tipo (luminaria_id, cambiado_en desc);

alter table public.luminarias_historial_tipo enable row level security;

create policy "ver historial de tipo por rol"
  on public.luminarias_historial_tipo
  for select
  using (public.mi_rol() = any (array['admin'::text, 'editor_luminarias'::text]));

-- Sin políticas de insert/update/delete: solo el trigger escribe en esta tabla.

create or replace function public.registrar_cambio_tipo_luminaria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.luminarias_historial_tipo
    (luminaria_id, tipo_anterior, tipo_nuevo, cambiado_por, cambiado_por_email)
  values (
    new.id,
    old.tipo,
    new.tipo,
    auth.uid(),
    (select u.email from public.usuarios u where u.auth_user_id = auth.uid())
  );
  return new;
end;
$$;

revoke execute on function public.registrar_cambio_tipo_luminaria() from public, anon, authenticated;

drop trigger if exists luminarias_registrar_cambio_tipo on public.luminarias;
create trigger luminarias_registrar_cambio_tipo
  after update of tipo on public.luminarias
  for each row
  when (old.tipo is distinct from new.tipo)
  execute function public.registrar_cambio_tipo_luminaria();
