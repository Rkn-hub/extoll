-- Storage policies for extoll-metadata bucket (private metadata storage)

-- Allow authenticated users to read metadata files
CREATE POLICY "Authenticated users can read metadata" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'extoll-metadata' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to upload metadata files
CREATE POLICY "Authenticated users can upload metadata" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'extoll-metadata' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to update metadata files
CREATE POLICY "Authenticated users can update metadata" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'extoll-metadata' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to delete metadata files
CREATE POLICY "Authenticated users can delete metadata" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'extoll-metadata' 
        AND auth.role() = 'authenticated'
    );