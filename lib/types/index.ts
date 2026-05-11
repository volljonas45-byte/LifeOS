export type HabitFrequency = "daily" | "weekly";
export type HabitType = "habit" | "morning_routine" | "evening_routine";
export type GoalStatus = "achieved" | "on_track" | "at_risk" | "not_started";
export type DocumentType =
  | "notiz"
  | "tagebuch"
  | "artikel"
  | "buch"
  | "film"
  | "podcast"
  | "ressource"
  | "sonstiges";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  frequency: HabitFrequency;
  type: HabitType;
  target_count: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  logged_date: string;
  completed: boolean;
  created_at: string;
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[];
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  year: number;
  status: GoalStatus;
  sort_order: number;
  created_at: string;
  milestones?: Milestone[];
}

export type MilestoneProgressType = "percent" | "value";

export interface Milestone {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  deadline: string | null;
  start_date: string | null;
  progress: number;
  progress_type: MilestoneProgressType;
  current_value: number | null;
  target_value: number | null;
  value_unit: string | null;
  status: GoalStatus;
  score_start: number | null;
  score_goal: number | null;
  sort_order: number;
  created_at: string;
  projects?: Project[];
}

export interface Project {
  id: string;
  user_id: string;
  milestone_id: string;
  title: string;
  status: GoalStatus;
  due_date: string | null;
  sort_order: number;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  workout_date: string;
  title: string | null;
  notes: string | null;
  duration_min: number | null;
  created_at: string;
  exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  sort_order: number;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  type: DocumentType;
  category: string | null;
  genre: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  is_inbox: boolean;
  tags: string[];
  linked_docs: string[];
  created_at: string;
  updated_at: string;
}
