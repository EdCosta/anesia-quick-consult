-- Automatic audit trail for drugs/procedures updates.

CREATE OR REPLACE FUNCTION public.build_content_revision_diff(old_row jsonb, new_row jsonb)
RETURNS jsonb
LANGUAGE sql
AS $$
  WITH old_values AS (
    SELECT key, value
    FROM jsonb_each(COALESCE(old_row, '{}'::jsonb))
    WHERE key NOT IN ('updated_at', 'created_at')
  ),
  new_values AS (
    SELECT key, value
    FROM jsonb_each(COALESCE(new_row, '{}'::jsonb))
    WHERE key NOT IN ('updated_at', 'created_at')
  ),
  merged AS (
    SELECT COALESCE(new_values.key, old_values.key) AS key,
           old_values.value AS old_value,
           new_values.value AS new_value
    FROM old_values
    FULL OUTER JOIN new_values USING (key)
  )
  SELECT COALESCE(
    jsonb_object_agg(key, jsonb_build_array(old_value, new_value))
      FILTER (WHERE old_value IS DISTINCT FROM new_value),
    '{}'::jsonb
  )
  FROM merged;
$$;

CREATE OR REPLACE FUNCTION public.log_content_revision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  computed_diff jsonb;
  resolved_entity_type text;
BEGIN
  computed_diff := public.build_content_revision_diff(to_jsonb(OLD), to_jsonb(NEW));

  IF computed_diff = '{}'::jsonb THEN
    RETURN NEW;
  END IF;

  resolved_entity_type := CASE TG_TABLE_NAME
    WHEN 'drugs' THEN 'drug'
    WHEN 'procedures' THEN 'procedure'
    ELSE TG_TABLE_NAME
  END;

  INSERT INTO public.content_revisions (entity_type, entity_id, diff, author_id)
  VALUES (resolved_entity_type, COALESCE(NEW.id, OLD.id), computed_diff, auth.uid());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_drug_content_revision ON public.drugs;
CREATE TRIGGER log_drug_content_revision
  AFTER UPDATE ON public.drugs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_content_revision();

DROP TRIGGER IF EXISTS log_procedure_content_revision ON public.procedures;
CREATE TRIGGER log_procedure_content_revision
  AFTER UPDATE ON public.procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.log_content_revision();
