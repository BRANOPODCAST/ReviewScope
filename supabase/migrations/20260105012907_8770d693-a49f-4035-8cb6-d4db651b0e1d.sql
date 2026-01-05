-- Drop user-scoped RLS policies
DROP POLICY IF EXISTS "Users can read own batches" ON public.review_batches;
DROP POLICY IF EXISTS "Users can create own batches" ON public.review_batches;
DROP POLICY IF EXISTS "Users can update own batches" ON public.review_batches;

DROP POLICY IF EXISTS "Users can read own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON public.reviews;

DROP POLICY IF EXISTS "Users can read own results" ON public.analysis_results;
DROP POLICY IF EXISTS "Users can create own results" ON public.analysis_results;
DROP POLICY IF EXISTS "Users can update own results" ON public.analysis_results;

-- Create public access policies
CREATE POLICY "Public read access" ON public.review_batches FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.review_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.review_batches FOR UPDATE USING (true);

CREATE POLICY "Public read access" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access" ON public.analysis_results FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.analysis_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.analysis_results FOR UPDATE USING (true);