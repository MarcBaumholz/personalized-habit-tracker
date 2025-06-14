
-- Enable RLS on habit_completions table if not already enabled
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can update their own completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Users can delete their own completions" ON public.habit_completions;

-- Create comprehensive RLS policies for habit_completions
CREATE POLICY "Users can view their own completions" 
  ON public.habit_completions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" 
  ON public.habit_completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" 
  ON public.habit_completions 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions" 
  ON public.habit_completions 
  FOR DELETE 
  USING (auth.uid() = user_id);
