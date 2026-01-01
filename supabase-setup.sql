-- SQL commands to run in Supabase SQL Editor

-- 1. Create contact_submissions table
CREATE TABLE contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'contact_page',
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

-- 2. Create page_views table for analytics
CREATE TABLE page_views (
    id BIGSERIAL PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    project_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    session_id VARCHAR(100)
);

-- 3. Create project_interactions table
CREATE TABLE project_interactions (
    id BIGSERIAL PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'view', 'click', 'lightbox_open', 'download'
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(100),
    ip_address INET
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_interactions ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for public access (insert only)
CREATE POLICY "Allow public insert on contact_submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on page_views" ON page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on project_interactions" ON project_interactions
    FOR INSERT WITH CHECK (true);

-- 6. Create indexes for better performance
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX idx_page_views_project_id ON page_views(project_id);
CREATE INDEX idx_project_interactions_project_id ON project_interactions(project_id);
CREATE INDEX idx_project_interactions_timestamp ON project_interactions(timestamp);

-- 7. Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for contact_submissions
CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();