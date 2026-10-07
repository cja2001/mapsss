-- Historial de cambios de estado de luminarias (buena / dañada / mantenimiento).
-- Permite al dashboard del reporte contar cuántas se repararon por mes:
-- una reparación es un cambio de "dañada" o "mantenimiento" a "buena".
create table if not exists public.luminarias_historial_estado (
  id bigint generated always as identity primary key,
  luminaria_id bigint not null references public.luminarias (id) on delete cascade,
  estado_anterior text,
  estado_nuevo text,
  cambiado_por uuid default auth.uid(),
  cambiado_por_email text,
  cambiado_en timestamptz not null default now()
);

create index if not exists luminarias_historial_estado_luminaria_idx
  on public.luminarias_historial_estado (luminaria_id, cambiado_en desc);

create index if not exists luminarias_historial_estado_fecha_idx
  on public.luminarias_historial_estado (cambiado_en desc);

alter table public.luminarias_historial_estado enable row level security;

create policy "ver historial de estado por rol"
  on public.luminarias_historial_estado
  for select
  using (public.mi_rol() = any (array['admin'::text, 'editor_luminarias'::text]));

-- Sin políticas de insert/update/delete: solo el trigger escribe en esta tabla.

create or replace function public.registrar_cambio_estado_luminaria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.luminarias_historial_estado
    (luminaria_id, estado_anterior, estado_nuevo, cambiado_por, cambiado_por_email)
  values (
    new.id,
    old.estado,
    new.estado,
    auth.uid(),
    (select u.email from public.usuarios u where u.auth_user_id = auth.uid())
  );
  return new;
end;
$$;

revoke execute on function public.registrar_cambio_estado_luminaria() from public, anon, authenticated;

drop trigger if exists luminarias_registrar_cambio_estado on public.luminarias;
create trigger luminarias_registrar_cambio_estado
  after update of estado on public.luminarias
  for each row
  when (old.estado is distinct from new.estado)
  execute function public.registrar_cambio_estado_luminaria();
