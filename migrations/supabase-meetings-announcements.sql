-- Create meetings table for announcements and event tracking
-- Run this in your Supabase SQL Editor

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  zoom_link TEXT NOT NULL,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Meeting attendance tracking
CREATE TABLE IF NOT EXISTS meeting_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  attended_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(meeting_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendance ENABLE ROW LEVEL SECURITY;

-- Policies for meetings table
-- Everyone can view active meetings
CREATE POLICY "Anyone can view active meetings"
  ON meetings
  FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- Only admins can insert meetings
CREATE POLICY "Admins can insert meetings"
  ON meetings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can update meetings
CREATE POLICY "Admins can update meetings"
  ON meetings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can delete meetings
CREATE POLICY "Admins can delete meetings"
  ON meetings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Policies for meeting_attendance table
-- Users can view their own attendance
CREATE POLICY "Users can view own attendance"
  ON meeting_attendance
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all attendance
CREATE POLICY "Admins can view all attendance"
  ON meeting_attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Users can insert their own attendance
CREATE POLICY "Users can insert own attendance"
  ON meeting_attendance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for meetings
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_meetings_is_active ON meetings(is_active);
CREATE INDEX idx_meetings_meeting_date ON meetings(meeting_date);
CREATE INDEX idx_meeting_attendance_meeting_id ON meeting_attendance(meeting_id);
CREATE INDEX idx_meeting_attendance_user_id ON meeting_attendance(user_id);

-- Comments
COMMENT ON TABLE meetings IS 'Stores meeting/event information for announcements';
COMMENT ON TABLE meeting_attendance IS 'Tracks user attendance at meetings/events';
COMMENT ON COLUMN meetings.is_active IS 'Whether this meeting should be shown in the announcement bar';
COMMENT ON COLUMN meetings.zoom_link IS 'Zoom or other meeting link URL';
