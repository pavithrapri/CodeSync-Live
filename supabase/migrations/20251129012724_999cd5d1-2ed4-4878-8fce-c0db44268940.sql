-- Create code_versions table for version history
CREATE TABLE public.code_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  code_content TEXT NOT NULL,
  language TEXT NOT NULL,
  saved_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version_name TEXT
);

-- Enable RLS
ALTER TABLE public.code_versions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view versions
CREATE POLICY "Anyone can view code versions"
ON public.code_versions
FOR SELECT
USING (true);

-- Allow anyone to create versions
CREATE POLICY "Anyone can create code versions"
ON public.code_versions
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_code_versions_room_id ON public.code_versions(room_id);
CREATE INDEX idx_code_versions_created_at ON public.code_versions(created_at DESC);