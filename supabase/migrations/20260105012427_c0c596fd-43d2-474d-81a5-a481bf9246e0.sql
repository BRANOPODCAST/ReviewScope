-- Add user_id columns to all tables for user-scoped access
ALTER TABLE public.review_batches ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.reviews ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.analysis_results ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public insert access" ON public.review_batches;
DROP POLICY IF EXISTS "Allow public read access" ON public.review_batches;
DROP POLICY IF EXISTS "Allow public update access" ON public.review_batches;

DROP POLICY IF EXISTS "Allow public insert access" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read access" ON public.reviews;

DROP POLICY IF EXISTS "Allow public insert access" ON public.analysis_results;
DROP POLICY IF EXISTS "Allow public read access" ON public.analysis_results;
DROP POLICY IF EXISTS "Allow public update access" ON public.analysis_results;

-- Create user-scoped policies for review_batches
CREATE POLICY "Users can read own batches" 
  ON public.review_batches FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own batches" 
  ON public.review_batches FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own batches" 
  ON public.review_batches FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create user-scoped policies for reviews
CREATE POLICY "Users can read own reviews" 
  ON public.reviews FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reviews" 
  ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create user-scoped policies for analysis_results
CREATE POLICY "Users can read own results" 
  ON public.analysis_results FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own results" 
  ON public.analysis_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" 
  ON public.analysis_results FOR UPDATE 
  USING (auth.uid() = user_id);