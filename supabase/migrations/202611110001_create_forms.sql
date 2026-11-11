create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  fields jsonb not null default '[]'::jsonb
    check (
      case
        when jsonb_typeof(fields) = 'array'
          then status <> 'published' or jsonb_array_length(fields) > 0
        else false
      end
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists forms_user_updated_at_idx
  on public.forms (user_id, updated_at desc);

alter table public.forms enable row level security;

drop policy if exists "Users can view their own forms" on public.forms;
create policy "Users can view their own forms"
  on public.forms for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own forms" on public.forms;
create policy "Users can create their own forms"
  on public.forms for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'draft');

drop policy if exists "Users can update their own forms" on public.forms;
create policy "Users can update their own forms"
  on public.forms for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own forms" on public.forms;
create policy "Users can delete their own forms"
  on public.forms for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_forms_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists forms_set_updated_at on public.forms;
create trigger forms_set_updated_at
  before update on public.forms
  for each row execute function public.set_forms_updated_at();
