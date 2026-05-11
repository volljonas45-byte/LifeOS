-- Add progress tracking columns to milestones
-- Run this in Supabase SQL Editor

ALTER TABLE milestones
  ADD COLUMN IF NOT EXISTS progress_type TEXT NOT NULL DEFAULT 'percent',
  ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS target_value NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS value_unit TEXT DEFAULT NULL;
