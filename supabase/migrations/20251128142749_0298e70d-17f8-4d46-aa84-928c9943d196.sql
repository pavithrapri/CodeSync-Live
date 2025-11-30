-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat messages
CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster room message lookups
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable realtime for chat messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add user tracking to rooms for better presence
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS active_users JSONB DEFAULT '[]'::jsonb;