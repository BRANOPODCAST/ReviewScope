-- ReviewScope Database Schema

-- Table for storing review batches
CREATE TABLE public.review_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT,
  review_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed'))
);

-- Enable RLS but allow public access for this demo app
ALTER TABLE public.review_batches ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required per requirements)
CREATE POLICY "Allow public read access" ON public.review_batches FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.review_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.review_batches FOR UPDATE USING (true);

-- Table for storing individual reviews within a batch
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.review_batches(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_date TIMESTAMP WITH TIME ZONE,
  language TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.reviews FOR INSERT WITH CHECK (true);

-- Table for storing analysis results
CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.review_batches(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Stage 1: Pattern Discovery results
  pattern_discovery JSONB,
  
  -- Stage 2: Coordination Analysis results  
  coordination_analysis JSONB,
  
  -- Stage 3: Integrity Assessment results
  integrity_assessment JSONB,
  
  -- Final computed values
  manipulation_band TEXT CHECK (manipulation_band IN ('Low', 'Medium', 'High')),
  key_signals JSONB,
  confidence_explanation TEXT,
  review_clusters JSONB,
  timeline_data JSONB
);

ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.analysis_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.analysis_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.analysis_results FOR UPDATE USING (true);

-- Index for faster lookups
CREATE INDEX idx_reviews_batch_id ON public.reviews(batch_id);
CREATE INDEX idx_analysis_results_batch_id ON public.analysis_results(batch_id);