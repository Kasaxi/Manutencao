-- ATTACHMENTS FOR ASSETS
CREATE TABLE IF NOT EXISTS asset_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES property_assets(id) ON DELETE CASCADE,
  name TEXT,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BUCKET FOR MAINTENANCE FILES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('maintenance', 'maintenance', true)
ON CONFLICT (id) DO NOTHING;

-- RLS POLICIES FOR STORAGE (Simplified for now)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'maintenance');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'maintenance');
