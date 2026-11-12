update public.forms
set draft_definition = jsonb_set(
  draft_definition,
  '{settings}',
  (
    (draft_definition->'settings' - 'purpose' - 'assessment')
    || jsonb_build_object(
      'presentation',
      case
        when jsonb_typeof(draft_definition->'settings'->'presentation') = 'object'
          then draft_definition->'settings'->'presentation'
        else '{"mode":"form"}'::jsonb
      end,
      'respondentAccess',
      case
        when jsonb_typeof(draft_definition->'settings'->'respondentAccess') = 'object'
          then draft_definition->'settings'->'respondentAccess'
        else '{"login":"none","oneResponsePerAccount":false}'::jsonb
      end
    )
  ),
  true
)
where jsonb_typeof(draft_definition->'settings') = 'object'
  and (
    draft_definition->'settings' ? 'purpose'
    or draft_definition->'settings' ? 'assessment'
    or jsonb_typeof(draft_definition->'settings'->'respondentAccess') is distinct from 'object'
  );