-- Supabase Database Schema for Extoll Portfolio

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('graphics', 'ui', 'product', 'animation', 'video')),
    description TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_images table for multiple images per project
CREATE TABLE IF NOT EXISTS project_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_name TEXT,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_videos table for multiple videos per project
CREATE TABLE IF NOT EXISTS project_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    video_name TEXT,
    video_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage buckets for structured file organization
INSERT INTO storage.buckets (id, name, public) 
VALUES ('extoll-portfolio', 'extoll-portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;
DROP POLICY IF EXISTS "Public can view project images" ON project_images;
DROP POLICY IF EXISTS "Authenticated users can manage project images" ON project_images;
DROP POLICY IF EXISTS "Public can view project videos" ON project_videos;
DROP POLICY IF EXISTS "Authenticated users can manage project videos" ON project_videos;

-- Recreate policies
-- Allow public read access to projects
CREATE POLICY "Public can view projects" ON projects
    FOR SELECT USING (true);

-- Allow authenticated users to manage projects (admin only)
CREATE POLICY "Authenticated users can manage projects" ON projects
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow public read access to project images
CREATE POLICY "Public can view project images" ON project_images
    FOR SELECT USING (true);

-- Allow authenticated users to manage project images
CREATE POLICY "Authenticated users can manage project images" ON project_images
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow public read access to project videos
CREATE POLICY "Public can view project videos" ON project_videos
    FOR SELECT USING (true);

-- Allow authenticated users to manage project videos
CREATE POLICY "Authenticated users can manage project videos" ON project_videos
    FOR ALL USING (auth.role() = 'authenticated');

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public can view all project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete project files" ON storage.objects;

-- Recreate storage policies for single portfolio bucket
-- Storage policies for public access to all files in portfolio bucket
CREATE POLICY "Public can view all portfolio files" ON storage.objects
    FOR SELECT USING (bucket_id = 'extoll-portfolio');

-- Storage policies for authenticated users (admin) to manage files
CREATE POLICY "Authenticated users can upload portfolio files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'extoll-portfolio' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update portfolio files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'extoll-portfolio' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete portfolio files" ON storage.objects
    FOR DELETE USING (bucket_id = 'extoll-portfolio' AND auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;

-- Add trigger to update updated_at on projects table
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create contact_submissions table for contact form
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    source TEXT DEFAULT 'contact_page',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for contact_submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing contact policies if they exist
DROP POLICY IF EXISTS "Public can submit contact forms" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can read contact submissions" ON contact_submissions;

-- Create policy to allow anonymous users to insert contact submissions
CREATE POLICY "Allow anonymous contact submissions" ON contact_submissions
    FOR INSERT TO anon WITH CHECK (true);

-- Create policy to allow authenticated users to read contact submissions (for admin)
CREATE POLICY "Authenticated users can read contact submissions" ON contact_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete contact submissions (for admin)
DROP POLICY IF EXISTS "Authenticated users can delete contact submissions" ON contact_submissions;
CREATE POLICY "Authenticated users can delete contact submissions" ON contact_submissions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update contact submissions (for admin)
DROP POLICY IF EXISTS "Authenticated users can update contact submissions" ON contact_submissions;
CREATE POLICY "Authenticated users can update contact submissions" ON contact_submissions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Add trigger to update updated_at on contact_submissions table
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();