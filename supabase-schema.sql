-- HABITS
CREATE TABLE habits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  category      text,
  frequency     text NOT NULL DEFAULT 'daily',
  type          text NOT NULL DEFAULT 'habit',
  target_count  int  NOT NULL DEFAULT 1,
  sort_order    int  NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits_own" ON habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- HABIT LOGS
CREATE TABLE habit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id    uuid REFERENCES habits(id) ON DELETE CASCADE,
  logged_date date NOT NULL,
  completed   boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (habit_id, logged_date)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habit_logs_own" ON habit_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- GOALS
CREATE TABLE goals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  year        int  NOT NULL,
  status      text NOT NULL DEFAULT 'on_track',
  sort_order  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_own" ON goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MILESTONES
CREATE TABLE milestones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id     uuid REFERENCES goals(id) ON DELETE CASCADE,
  title       text NOT NULL,
  deadline    date,
  start_date  date,
  progress    int  NOT NULL DEFAULT 0,
  status      text NOT NULL DEFAULT 'not_started',
  score_start numeric,
  score_goal  numeric,
  sort_order  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_own" ON milestones FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PROJECTS
CREATE TABLE projects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES milestones(id) ON DELETE CASCADE,
  title        text NOT NULL,
  status       text NOT NULL DEFAULT 'not_started',
  due_date     date,
  sort_order   int  NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_own" ON projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- WORKOUTS
CREATE TABLE workouts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date date NOT NULL,
  title        text,
  notes        text,
  duration_min int,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workouts_own" ON workouts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- WORKOUT EXERCISES
CREATE TABLE workout_exercises (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id  uuid REFERENCES workouts(id) ON DELETE CASCADE,
  exercise    text NOT NULL,
  sets        int,
  reps        int,
  weight_kg   numeric,
  sort_order  int NOT NULL DEFAULT 0
);

-- TODOS
CREATE TABLE todos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  notes        text,
  priority     text NOT NULL DEFAULT 'medium',
  status       text NOT NULL DEFAULT 'open',
  due_date     date,
  tags         text[] DEFAULT '{}',
  sort_order   int  NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "todos_own" ON todos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DOCUMENTS
CREATE TABLE documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  content      text,
  type         text NOT NULL DEFAULT 'notiz',
  category     text,
  genre        text,
  is_favorite  boolean NOT NULL DEFAULT false,
  is_archived  boolean NOT NULL DEFAULT false,
  is_inbox     boolean NOT NULL DEFAULT false,
  tags         text[] DEFAULT '{}',
  linked_docs  uuid[] DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_own" ON documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
