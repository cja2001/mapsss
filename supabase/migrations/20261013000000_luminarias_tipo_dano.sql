-- Tipo de daño de una luminaria cuando su estado es "dañada".
-- Solo tiene valor mientras la luminaria está dañada; la app lo limpia al cambiar a otro estado.
alter table public.luminarias
  add column if not exists tipo_dano text;

alter table public.luminarias
  drop constraint if exists luminarias_tipo_dano_check;

alter table public.luminarias
  add constraint luminarias_tipo_dano_check
  check (tipo_dano is null or tipo_dano in ('lampara_quemada', 'brazo_danado', 'fotocelda_danada', 'cables_danados'));
