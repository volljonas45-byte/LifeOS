# LifeOS — Projektfortschritt

## Stack
- **Framework**: Next.js 16 App Router + TypeScript
- **Styling**: Tailwind CSS v4
- **Database + Auth**: Supabase (Postgres + Magic Link Auth)
- **UI Primitives**: shadcn/ui
- **Deploy**: Vercel

---

## Phase 0 — Projekt Bootstrap
- [x] Next.js Projekt erstellt
- [x] Dependencies installiert (Supabase, shadcn, date-fns, clsx, tailwind-merge)
- [x] `.env.local` angelegt (Supabase URL + Key eintragen!)
- [x] `lib/supabase/client.ts` + `lib/supabase/server.ts`
- [x] `proxy.ts` Auth Guard (Next.js 16 Konvention)
- [x] `app/globals.css` Design Tokens (cream, ink, terracotta)
- [x] Fonts: Playfair Display + Inter in `app/layout.tsx`
- [x] `lib/types/index.ts` — alle TypeScript Interfaces
- [x] `lib/utils/dates.ts` — Datums-Hilfsfunktionen

## Phase 1 — Auth + App Shell
- [x] Login Page `/login` mit Magic Link (Email OTP)
- [x] `Sidebar.tsx` mit Navigation zu allen 5 Modulen
- [x] `Topbar.tsx`
- [x] `(app)/layout.tsx` — AppShell mit Sidebar
- [x] Route Groups `(auth)` + `(app)`
- [x] Root `page.tsx` redirect → `/dashboard`
- [x] Alle 5 App-Seiten als Grundgerüst angelegt
- [x] Supabase-Projekt erstellen + `.env.local` befüllen
- [ ] Auth Flow end-to-end testen

## Phase 2 — Habit Tracker
- [x] SQL: `habits` + `habit_logs` Tabellen + RLS
- [x] `HabitCircle` UI-Primitive
- [x] `HabitRow` mit 7-Tage Anzeige
- [x] `CheckItem` für Routinen-Checklisten
- [x] `RoutineChecklist` (Morgen- & Abendroutine)
- [x] `DailyHabits` mit optimistischem Check/Uncheck
- [x] `WeeklyHabits` mit Kreis-Grid
- [x] `AddHabitModal`
- [x] `useHabits` Hook

## Phase 3 — Dashboard
- [x] `QuickActions` mit Links
- [x] `TodayHabitsSummary`
- [x] `GoalsSummary`
- [x] `RecentDocuments`
- [x] Dashboard Grid (3-spaltig)

## Phase 4 — Jahresplanung / Ziele
- [x] SQL: `goals` + `milestones` + `projects` + RLS
- [x] `StatusBadge`
- [x] `GoalCard` + 3-Spalten Übersicht
- [x] `MilestonesTable`
- [x] `AddGoalModal` + Meilenstein inline hinzufügen
- [x] `useGoals` Hook

## Phase 5 — Sport Tracking
- [x] SQL: `workouts` + `workout_exercises` + RLS
- [x] Workout-Liste mit Übungen
- [x] `LogWorkoutModal` (dynamische Übungszeilen)
- [x] `useWorkouts` Hook

## Phase 6 — Dokumente + Second Brain
- [x] SQL: `documents` + RLS + `updated_at` Trigger
- [x] `CategorySidebar` (Posteingang, Favoriten, Tagebuch + Kategorien)
- [x] `DocumentCard` + Grid
- [x] Dokument-Detailseite `/dokumente/[id]` mit Auto-Save Editor
- [x] `NewDocumentModal`
- [x] `useDocuments` Hook

## Phase 7 — Polish + Deploy
- [ ] Responsive Layout (Mobile Sidebar als Drawer)
- [ ] Empty States
- [ ] Loading Skeletons
- [ ] Seed-Script für Notion-Daten
- [ ] Vercel Deploy + Env-Vars
- [ ] (Optional) Custom Domain

---

## Supabase Setup (manuell)

### 1. Supabase Projekt erstellen
Unter [supabase.com](https://supabase.com) → New Project

### 2. `.env.local` befüllen
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. SQL ausführen (Supabase SQL Editor)

```sql
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
```

---

## Design Tokens

| Token | Wert | Verwendung |
|---|---|---|
| `cream` | `#FAF9F7` | Seiten-Hintergrund |
| `cream-dark` | `#F3F1EC` | Sidebar, Sekundärbereiche |
| `surface` | `#FFFFFF` | Karten, Modals |
| `ink` | `#1A1814` | Primärer Text |
| `ink-muted` | `#6B6560` | Sekundärer Text |
| `ink-faint` | `#A9A39A` | Labels, Platzhalter |
| `ink-border` | `#E8E4DC` | Rahmen |
| `terracotta` | `#C1693A` | Akzentfarbe, Hover |
| `terracotta-light` | `#F0E0D4` | Akzent-Hintergrund |
