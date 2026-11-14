BEGIN;

SELECT plan(5);

INSERT INTO auth.users (id, aud, role, email)
VALUES (
  '00000000-0000-4000-8000-000000000111',
  'authenticated',
  'authenticated',
  'versions-rls-owner@example.test'
),
(
  '00000000-0000-4000-8000-000000000112',
  'authenticated',
  'authenticated',
  'versions-rls-viewer@example.test'
);

INSERT INTO public.forms (
  id, user_id, owner_id, title, description, status, slug,
  draft_definition, accepting_responses
)
VALUES
  (
    '00000000-0000-4000-8000-000000000211',
    '00000000-0000-4000-8000-000000000111',
    '00000000-0000-4000-8000-000000000111',
    'Versioned form',
    '',
    'published',
    'versions-rls-published',
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[]}'::jsonb,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000212',
    '00000000-0000-4000-8000-000000000111',
    '00000000-0000-4000-8000-000000000111',
    'Draft form',
    '',
    'draft',
    'versions-rls-draft',
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[]}'::jsonb,
    true
  );

INSERT INTO public.form_versions (
  id, form_id, version_number, definition, created_by
)
VALUES
  (
    '00000000-0000-4000-8000-000000000311',
    '00000000-0000-4000-8000-000000000211',
    1,
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[{"id":"old-question","type":"question","label":"Old question","kind":"short_text","required":true}]}'::jsonb,
    '00000000-0000-4000-8000-000000000111'
  ),
  (
    '00000000-0000-4000-8000-000000000312',
    '00000000-0000-4000-8000-000000000211',
    2,
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[{"id":"new-question","type":"question","label":"New question","kind":"short_text","required":true}]}'::jsonb,
    '00000000-0000-4000-8000-000000000111'
  );

UPDATE public.forms
SET published_version_id = '00000000-0000-4000-8000-000000000312'
WHERE id = '00000000-0000-4000-8000-000000000211';

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{}', true);

SELECT is(
  (SELECT count(*)::integer FROM public.form_versions
   WHERE id = '00000000-0000-4000-8000-000000000311'),
  0,
  'anonymous visitors cannot read old published versions'
);
SELECT is(
  (SELECT count(*)::integer FROM public.form_versions
   WHERE id = '00000000-0000-4000-8000-000000000312'),
  1,
  'anonymous visitors can read the current published version'
);
SELECT ok(
  NOT has_column_privilege('anon', 'public.form_versions', 'created_by', 'SELECT'),
  'anonymous visitors cannot read version ownership'
);

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000112","role":"authenticated"}',
  true
);
SELECT is(
  (SELECT count(*)::integer FROM public.form_versions
   WHERE id = '00000000-0000-4000-8000-000000000312'),
  0,
  'signed-in non-owners cannot read published definitions'
);

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000111","role":"authenticated"}',
  true
);
SELECT lives_ok(
  $$INSERT INTO public.form_versions (form_id, version_number, definition, created_by)
    VALUES (
      '00000000-0000-4000-8000-000000000212',
      1,
      '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[{"id":"draft-question","type":"question","label":"Draft question","kind":"short_text","required":true}]}'::jsonb,
      '00000000-0000-4000-8000-000000000111'
    )$$,
  'form owners can create published versions during publishing'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
