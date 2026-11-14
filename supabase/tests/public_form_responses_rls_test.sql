BEGIN;

SELECT plan(6);

INSERT INTO auth.users (id, aud, role, email)
VALUES (
  '00000000-0000-4000-8000-000000000121',
  'authenticated',
  'authenticated',
  'responses-rls-owner@example.test'
);

INSERT INTO public.forms (
  id, user_id, owner_id, title, description, status, slug,
  draft_definition, accepting_responses
)
VALUES
  (
    '00000000-0000-4000-8000-000000000221',
    '00000000-0000-4000-8000-000000000121',
    '00000000-0000-4000-8000-000000000121',
    'Public form',
    '',
    'published',
    'responses-rls-public',
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[]}'::jsonb,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000222',
    '00000000-0000-4000-8000-000000000121',
    '00000000-0000-4000-8000-000000000121',
    'Account form',
    '',
    'published',
    'responses-rls-account',
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"required","oneResponsePerAccount":true}},"blocks":[]}'::jsonb,
    true
  );

INSERT INTO public.form_versions (
  id, form_id, version_number, definition, created_by
)
VALUES
  (
    '00000000-0000-4000-8000-000000000321',
    '00000000-0000-4000-8000-000000000221',
    1,
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"none","oneResponsePerAccount":false}},"blocks":[{"id":"name","type":"question","label":"Name","kind":"short_text","required":true}]}'::jsonb,
    '00000000-0000-4000-8000-000000000121'
  ),
  (
    '00000000-0000-4000-8000-000000000322',
    '00000000-0000-4000-8000-000000000222',
    1,
    '{"schemaVersion":2,"settings":{"presentation":{"mode":"form"},"respondentAccess":{"login":"required","oneResponsePerAccount":true}},"blocks":[{"id":"email","type":"question","label":"Email","kind":"email","required":true}]}'::jsonb,
    '00000000-0000-4000-8000-000000000121'
  );

UPDATE public.forms
SET published_version_id = CASE id
  WHEN '00000000-0000-4000-8000-000000000221'
    THEN '00000000-0000-4000-8000-000000000321'::uuid
  ELSE '00000000-0000-4000-8000-000000000322'::uuid
END
WHERE id IN (
  '00000000-0000-4000-8000-000000000221',
  '00000000-0000-4000-8000-000000000222'
);

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{}', true);

SELECT lives_ok(
  $$INSERT INTO public.form_responses (form_id, form_version_id, answers)
    VALUES (
      '00000000-0000-4000-8000-000000000221',
      '00000000-0000-4000-8000-000000000321',
      '{"name":"Ada"}'::jsonb
    )$$,
  'anonymous respondents can submit valid answers'
);
SELECT throws_ok(
  $$INSERT INTO public.form_responses (form_id, form_version_id, answers)
    VALUES (
      '00000000-0000-4000-8000-000000000221',
      '00000000-0000-4000-8000-000000000321',
      '{}'::jsonb
    )$$,
  '42501',
  NULL,
  'required answers cannot be omitted'
);
SELECT throws_ok(
  $$INSERT INTO public.form_responses (form_id, form_version_id, answers)
    VALUES (
      '00000000-0000-4000-8000-000000000222',
      '00000000-0000-4000-8000-000000000322',
      '{"email":"person@example.test"}'::jsonb
    )$$,
  '42501',
  NULL,
  'account-required forms reject anonymous responses'
);
SELECT ok(
  NOT has_table_privilege('anon', 'public.form_responses', 'SELECT'),
  'anonymous respondents cannot read stored responses'
);

RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000121","role":"authenticated"}',
  true
);
SELECT lives_ok(
  $$INSERT INTO public.form_responses (
      form_id, form_version_id, respondent_user_id, one_response_per_account, answers
    )
    VALUES (
      '00000000-0000-4000-8000-000000000222',
      '00000000-0000-4000-8000-000000000322',
      '00000000-0000-4000-8000-000000000121',
      true,
      '{"email":"person@example.test"}'::jsonb
    )$$,
  'signed-in respondents can submit one response'
);
SELECT throws_ok(
  $$INSERT INTO public.form_responses (
      form_id, form_version_id, respondent_user_id, one_response_per_account, answers
    )
    VALUES (
      '00000000-0000-4000-8000-000000000222',
      '00000000-0000-4000-8000-000000000322',
      '00000000-0000-4000-8000-000000000121',
      true,
      '{"email":"again@example.test"}'::jsonb
    )$$,
  '23505',
  NULL,
  'one response per account is enforced'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
