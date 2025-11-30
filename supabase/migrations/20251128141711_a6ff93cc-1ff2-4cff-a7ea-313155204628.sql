-- Create rooms table for collaborative coding sessions
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  name TEXT,
  language TEXT NOT NULL DEFAULT 'python',
  code_content TEXT DEFAULT '# Write your code here...',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for room access (public access for prototype)
CREATE POLICY "Anyone can view rooms"
  ON public.rooms
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create rooms"
  ON public.rooms
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON public.rooms
  FOR UPDATE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster room lookups
CREATE INDEX idx_rooms_room_code ON public.rooms(room_code);

-- Enable realtime for rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;