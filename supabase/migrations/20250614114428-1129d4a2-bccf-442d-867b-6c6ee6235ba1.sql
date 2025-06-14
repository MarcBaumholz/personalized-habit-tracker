
-- Add a status column to the habit_completions table
ALTER TABLE public.habit_completions
ADD COLUMN status TEXT;

-- Add a comment to describe the new column
COMMENT ON COLUMN public.habit_completions.status IS 'The completion status of the habit, e.g., completed, partial.';

-- Backfill status for existing completions based on completion_type
UPDATE public.habit_completions
SET status = 'completed'
WHERE completion_type IN ('check', 'star');

-- Update the daily tracking function to use the new status column for streaks
CREATE OR REPLACE FUNCTION public.reset_daily_tracking()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Archive completed todos and todos from previous days
  INSERT INTO archived_todos (original_todo_id, title, category, completed, completion_date, user_id)
  SELECT id, title, category, completed, CURRENT_DATE - 1, user_id
  FROM todos
  WHERE completed = true OR due_date < CURRENT_DATE;
  
  -- Delete archived todos from main table
  DELETE FROM todos
  WHERE completed = true OR due_date < CURRENT_DATE;
  
  -- Reset habit streaks for users who didn't complete habits yesterday
  UPDATE habits h
  SET streak_count = 0,
      weekly_streak = 0,
      monthly_streak = 0
  WHERE NOT EXISTS (
    SELECT 1 
    FROM habit_completions hc
    WHERE hc.habit_id = h.id 
    AND hc.completed_date = CURRENT_DATE - 1
    AND hc.status IN ('completed', 'partial')
  );

END;
$function$
