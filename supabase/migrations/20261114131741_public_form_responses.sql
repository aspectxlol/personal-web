alter table public.form_responses
  add column if not exists respondent_user_id uuid
  references auth.users (id) on delete set null,
  add column if not exists one_response_per_account boolean not null default false;

create unique index if not exists form_responses_one_per_account_idx
  on public.form_responses (form_id, respondent_user_id)
  where respondent_user_id is not null
    and one_response_per_account;

alter table public.forms enable row level security;
alter table public.form_versions enable row level security;
alter table public.form_responses enable row level security;

drop policy if exists "Anyone can view accepting published forms"
  on public.forms;
create policy "Anyone can view accepting published forms"
  on public.forms for select
  to anon
  using (
    status = 'published'
    and accepting_responses
    and published_version_id is not null
  );

drop policy if exists "Form owners can create versions"
  on public.form_versions;
create policy "Form owners can create versions"
  on public.form_versions for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1
      from public.forms
      where forms.id = form_versions.form_id
        and forms.owner_id = (select auth.uid())
    )
  );

drop policy if exists "Anyone can view current accepting form versions"
  on public.form_versions;
create policy "Anyone can view current accepting form versions"
  on public.form_versions for select
  to anon
  using (
    exists (
      select 1
      from public.forms
      where forms.id = form_versions.form_id
        and forms.status = 'published'
        and forms.accepting_responses
        and forms.published_version_id = form_versions.id
    )
  );

-- Keep response checks out of the exposed Data API schemas.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

create or replace function private.is_valid_form_response(
  p_form_id uuid,
  p_form_version_id uuid,
  p_answers jsonb,
  p_respondent_user_id uuid,
  p_one_response_per_account boolean
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_definition jsonb;
  v_user_id uuid := auth.uid();
  v_answer record;
  v_block jsonb;
  v_kind text;
  v_value text;
  v_one_response_per_account boolean;
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    return false;
  end if;

  select version.definition
  into v_definition
  from public.forms as form
  join public.form_versions as version
    on version.form_id = form.id
   and version.id = p_form_version_id
  where form.id = p_form_id
    and form.status = 'published'
    and form.accepting_responses
    and form.published_version_id = version.id;

  if not found or jsonb_typeof(v_definition->'blocks') <> 'array' then
    return false;
  end if;

  if coalesce(
    v_definition #>> '{settings,respondentAccess,login}',
    'none'
  ) = 'required' and v_user_id is null then
    return false;
  end if;

  if p_respondent_user_id is not null
    and p_respondent_user_id is distinct from v_user_id then
    return false;
  end if;

  v_one_response_per_account := coalesce(
    v_definition #>> '{settings,respondentAccess,oneResponsePerAccount}',
    'false'
  ) = 'true';

  if p_one_response_per_account is distinct from v_one_response_per_account then
    return false;
  end if;

  if coalesce(
    v_definition #>> '{settings,respondentAccess,login}',
    'none'
  ) = 'required'
    and (
      v_user_id is null
      or p_respondent_user_id is distinct from v_user_id
    ) then
    return false;
  end if;

  if v_one_response_per_account and (
    v_user_id is null
    or p_respondent_user_id is distinct from v_user_id
  ) then
    return false;
  end if;

  for v_answer in
    select key, value
    from pg_catalog.jsonb_each(p_answers)
  loop
    select block->>'kind'
    into v_kind
    from pg_catalog.jsonb_array_elements(v_definition->'blocks') as item(block)
    where block->>'type' = 'question'
      and block->>'id' = v_answer.key
    limit 1;

    if not found then
      return false;
    end if;

    v_value := v_answer.value #>> '{}';
    case v_kind
      when 'checkbox' then
        if jsonb_typeof(v_answer.value) <> 'boolean' then
          return false;
        end if;
      when 'short_text' then
        if jsonb_typeof(v_answer.value) <> 'string'
          or char_length(v_value) > 1000 then
          return false;
        end if;
      when 'long_text' then
        if jsonb_typeof(v_answer.value) <> 'string'
          or char_length(v_value) > 10000 then
          return false;
        end if;
      when 'email' then
        if jsonb_typeof(v_answer.value) <> 'string'
          or char_length(v_value) > 254
          or (
            v_value <> ''
            and v_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
          ) then
          return false;
        end if;
      else
        return false;
    end case;
  end loop;

  for v_block in
    select block
    from pg_catalog.jsonb_array_elements(v_definition->'blocks') as item(block)
    where block->>'type' = 'question'
      and block->>'required' = 'true'
  loop
    if not (p_answers ? (v_block->>'id')) then
      return false;
    end if;

    if v_block->>'kind' = 'checkbox' then
      if p_answers->(v_block->>'id') <> 'true'::jsonb then
        return false;
      end if;
    elsif nullif(
      pg_catalog.regexp_replace(
        p_answers->>(v_block->>'id'),
        '[[:space:]]',
        '',
        'g'
      ),
      ''
    ) is null then
      return false;
    end if;
  end loop;

  return true;
end
$function$;

revoke all on function private.is_valid_form_response(uuid, uuid, jsonb, uuid, boolean)
  from public, anon, authenticated;
grant execute on function private.is_valid_form_response(uuid, uuid, jsonb, uuid, boolean)
  to anon, authenticated;

drop policy if exists "Respondents can submit current form responses"
  on public.form_responses;
create policy "Respondents can submit current form responses"
  on public.form_responses for insert
  to anon, authenticated
  with check (
    private.is_valid_form_response(
      form_id,
      form_version_id,
      answers,
      respondent_user_id,
      one_response_per_account
    )
  );

revoke all on table public.forms from anon;
grant select (
  id,
  slug,
  title,
  description,
  status,
  accepting_responses,
  published_version_id
) on table public.forms to anon;

revoke all on table public.form_versions from anon;
grant select (id, form_id, definition)
  on table public.form_versions to anon;

revoke all on table public.form_versions from authenticated;
grant select on table public.form_versions to authenticated;
grant insert (form_id, version_number, definition, created_by)
  on table public.form_versions to authenticated;

revoke all on table public.form_responses from anon;
grant insert (
  form_id,
  form_version_id,
  respondent_user_id,
  one_response_per_account,
  answers
)
  on table public.form_responses to anon;

revoke all on table public.form_responses from authenticated;
grant select on table public.form_responses to authenticated;
grant insert (
  form_id,
  form_version_id,
  respondent_user_id,
  one_response_per_account,
  answers
)
  on table public.form_responses to authenticated;