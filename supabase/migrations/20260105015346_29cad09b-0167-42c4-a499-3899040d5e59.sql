-- Add preprocessing column to store language and word count metadata
ALTER TABLE public.analysis_results 
ADD COLUMN preprocessing jsonb DEFAULT '{}'::jsonb;