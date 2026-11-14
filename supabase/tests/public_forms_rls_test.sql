BEGIN;

SELECT plan(5);

INSERT INTO auth.users (id, aud, role, email)
VALUES
  (
    '00000000-0000-4000-8000-000000000101',
    'authenticated',
    'authenticated',
    'forms-rls-owner@example.test'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'authenticated',
    'authenticated',
    'forms-rls-viewer@example.test'
  );

INSERT INTO public.forms (
  id, user_id, owner_id, title, description, status, slug,
  draft_definition, accepting_responses
)
VALUES
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000101',
    'Published form',
    'Public description',
    'published',
    'forms-rls-published',
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[]}'::jsonb,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000101',
    'Draft form',
    'Private description',
    'draft',
    'forms-rls-draft',
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[]}'::jsonb,
    true
  );

INSERT INTO public.form_versions (
  id, form_id, version_number, definition, created_by
)
VALUES (
  '00000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000201',
  1,
  '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[{"id":"question-one","type":"question","label":"Question","kind":"short_text","required":true}]}'::jsonb,
  '00000000-0000-4000-8000-000000000101'
);

UPDATE public.forms
SET published_version_id = '00000000-0000-4000-8000-000000000301'
WHERE id = '00000000-0000-4000-8000-000000000201';

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{}', true);

SELECT is(
  (SELECT count(*)::integer FROM public.forms
   WHERE id = '00000000-0000-4000-8000-000000000201'),
  1,
  'anonymous visitors can see accepting published forms'
);
SELECT is(
  (SELECT count(*)::integer FROM public.forms
   WHERE id = '00000000-0000-4000-8000-000000000202'),
  0,
  'anonymous visitors cannot see drafts'
);
SELECT ok(
  NOT has_column_privilege('anon', 'public.forms', 'draft_definition', 'SELECT'),
  'anonymous visitors cannot read draft definitions'
);
SELECT ok(
  NOT has_column_privilege('anon', 'public.forms', 'owner_id', 'SELECT'),
  'anonymous visitors cannot read form ownership'
);

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000102","role":"authenticated"}',
  true
);
SELECT is(
  (SELECT count(*)::integer FROM public.forms
   WHERE id = '00000000-0000-4000-8000-000000000201'),
  0,
  'signed-in non-owners cannot read form drafts'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
