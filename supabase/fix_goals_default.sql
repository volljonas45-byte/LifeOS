-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hmvfdfgnnzkwrarmwscq/sql

-- Set user_id to auto-fill from auth session (same as habits table likely has)
ALTER TABLE goals ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE milestones ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE projects ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Drop and recreate policies cleanly
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
  DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
  DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
  DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_insert" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_select" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goals_update" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete" ON goals FOR DELETE USING (auth.uid() = user_id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert their own milestones" ON milestones;
  DROP POLICY IF EXISTS "Users can view their own milestones" ON milestones;
  DROP POLICY IF EXISTS "Users can update their own milestones" ON milestones;
  DROP POLICY IF EXISTS "Users can delete their own milestones" ON milestones;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_insert" ON milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "milestones_select" ON milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "milestones_update" ON milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "milestones_delete" ON milestones FOR DELETE USING (auth.uid() = user_id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_select" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (auth.uid() = user_id);
