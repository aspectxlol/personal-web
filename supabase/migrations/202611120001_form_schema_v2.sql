alter table public.forms
  add column if not exists owner_id uuid,
  add column if not exists slug text,
  add column if not exists draft_definition jsonb,
  add column if not exists published_version_id uuid,
  add column if not exists accepting_responses boolean;

update public.forms
set owner_id = user_id
where owner_id is null;

update public.forms
set slug = lower(
  regexp_replace(
    coalesce(title, 'form'),
    '[^a-z0-9]+',
    '-',
    'g'
  )
)
  || '-' || left(id::text, 8)
where slug is null;

update public.forms
set draft_definition = jsonb_build_object(
  'schemaVersion', 1,
  'settings', jsonb_build_object(
    'purpose', 'form',
    'presentation', jsonb_build_object('mode', 'form'),
    'assessment', jsonb_build_object(
      'enabled', false,
      'showResults', false,
      'showCorrectAnswers', false,
      'shuffleQuestions', false,
      'timeLimitSeconds', null
    )
  ),
  'blocks', '[]'::jsonb
)
where draft_definition is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'forms'
      and column_name = 'fields'
  ) then
    update public.forms as form
    set draft_definition = jsonb_set(
      form.draft_definition,
      '{blocks}',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', field->>'id',
              'type', 'question',
              'label', field->>'label',
              'kind', field->>'type',
              'required', coalesce((field->>'required')::boolean, false)
            )
          )
          from jsonb_array_elements(coalesce(form.fields, '[]'::jsonb)) as fields(field)
        ),
        '[]'::jsonb
      )
    )
    where form.draft_definition->'blocks' = '[]'::jsonb
      and jsonb_typeof(form.fields) = 'array'
      and jsonb_array_length(form.fields) > 0;
  end if;
end;
$$;

update public.forms
set accepting_responses = true
where accepting_responses is null;

alter table public.forms
  alter column owner_id set not null,
  alter column slug set not null,
  alter column draft_definition set not null,
  alter column accepting_responses set not null,
  alter column accepting_responses set default true;

create unique index if not exists forms_slug_unique
  on public.forms (slug);

create table if not exists public.form_versions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  version_number integer not null,
  definition jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users (id) on delete cascade,
  unique (form_id, version_number)
);

insert into public.form_versions (form_id, version_number, definition, created_at, created_by)
select id, 1, draft_definition, coalesce(updated_at, now()), user_id
from public.forms
where status = 'published'
on conflict (form_id, version_number) do nothing;

update public.forms as form
set published_version_id = version.id
from public.form_versions as version
where form.id = version.form_id
  and version.version_number = 1
  and form.status = 'published'
  and form.published_version_id is null;

alter table public.forms
  drop column if exists close_date,
  drop column if exists fields,
  drop column if exists published_at;

create unique index if not exists form_versions_form_id_id_unique
  on public.form_versions (form_id, id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'forms_published_version_fk'
      and conrelid = 'public.forms'::regclass
  ) then
    alter table public.forms
      add constraint forms_published_version_fk
      foreign key (id, published_version_id)
      references public.form_versions (form_id, id)
      deferrable initially deferred;
  end if;
end;
$$;

create table if not exists public.form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  form_version_id uuid not null,
  answers jsonb not null default '{}'::jsonb,
  respondent_name text,
  respondent_email text,
  submitted_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'form_responses_form_version_fk'
      and conrelid = 'public.form_responses'::regclass
  ) then
    alter table public.form_responses
      add constraint form_responses_form_version_fk
      foreign key (form_id, form_version_id)
      references public.form_versions (form_id, id)
      deferrable initially deferred;
  end if;
end;
$$;

create index if not exists form_responses_form_id_submitted_at_idx
  on public.form_responses (form_id, submitted_at desc);

alter table public.form_versions enable row level security;
alter table public.form_responses enable row level security;

drop policy if exists "Form owners can view versions" on public.form_versions;
create policy "Form owners can view versions"
  on public.form_versions for select
  to authenticated
  using (
    exists (
      select 1
      from public.forms
      where forms.id = form_versions.form_id
        and forms.owner_id = auth.uid()
    )
  );

drop policy if exists "Form owners can view responses" on public.form_responses;
create policy "Form owners can view responses"
  on public.form_responses for select
  to authenticated
  using (
    exists (
      select 1
      from public.forms
      where forms.id = form_responses.form_id
        and forms.owner_id = auth.uid()
    )
  );
