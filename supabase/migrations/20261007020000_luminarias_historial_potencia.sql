-- Historial de cambios de potencia de luminarias.
-- Se muestra en el popup junto con el historial de cambios de tipo.
create table if not exists public.luminarias_historial_potencia (
  id bigint generated always as identity primary key,
  luminaria_id bigint not null references public.luminarias (id) on delete cascade,
  potencia_anterior text,
  potencia_nueva text,
  cambiado_por uuid default auth.uid(),
  cambiado_por_email text,
  cambiado_en timestamptz not null default now()
);

create index if not exists luminarias_historial_potencia_luminaria_idx
  on public.luminarias_historial_potencia (luminaria_id, cambiado_en desc);

alter table public.luminarias_historial_potencia enable row level security;

create policy "ver historial de potencia por rol"
  on public.luminarias_historial_potencia
  for select
  using (public.mi_rol() = any (array['admin'::text, 'editor_luminarias'::text]));

-- Sin políticas de insert/update/delete: solo el trigger escribe en esta tabla.

create or replace function public.registrar_cambio_potencia_luminaria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.luminarias_historial_potencia
    (luminaria_id, potencia_anterior, potencia_nueva, cambiado_por, cambiado_por_email)
  values (
    new.id,
    old.potencia,
    new.potencia,
    auth.uid(),
    (select u.email from public.usuarios u where u.auth_user_id = auth.uid())
  );
  return new;
end;
$$;

revoke execute on function public.registrar_cambio_potencia_luminaria() from public, anon, authenticated;

drop trigger if exists luminarias_registrar_cambio_potencia on public.luminarias;
create trigger luminarias_registrar_cambio_potencia
  after update of potencia on public.luminarias
  for each row
  when (old.potencia is distinct from new.potencia)
  execute function public.registrar_cambio_potencia_luminaria();
