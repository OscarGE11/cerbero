-- Distinct movement months for the authenticated user (YYYY-MM, newest first)

CREATE OR REPLACE FUNCTION public.list_movement_months()
RETURNS TABLE(month text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT to_char(date, 'YYYY-MM') AS month
  FROM movements
  ORDER BY month DESC;
$$;

GRANT EXECUTE ON FUNCTION public.list_movement_months() TO authenticated;
