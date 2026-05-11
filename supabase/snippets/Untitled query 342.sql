ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS privacy_acknowledged BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS recent_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

ALTER TABLE recent_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own activity" ON recent_activity;
CREATE POLICY "Users can view their own activity" 
ON recent_activity FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity" ON recent_activity;
CREATE POLICY "Users can insert their own activity" 
ON recent_activity FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own activity" ON recent_activity;
CREATE POLICY "Users can update their own activity" 
ON recent_activity FOR UPDATE 
USING (auth.uid() = user_id);