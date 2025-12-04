-- Create quizzes table to store all quiz data
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  key_entities JSONB DEFAULT '{}',
  sections TEXT[] DEFAULT '{}',
  quiz JSONB DEFAULT '[]',
  related_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view quizzes)
CREATE POLICY "Anyone can view quizzes" 
ON public.quizzes 
FOR SELECT 
USING (true);

-- Create policy for public insert (anyone can create quizzes)
CREATE POLICY "Anyone can create quizzes" 
ON public.quizzes 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster URL lookups
CREATE INDEX idx_quizzes_url ON public.quizzes(url);
CREATE INDEX idx_quizzes_created_at ON public.quizzes(created_at DESC);