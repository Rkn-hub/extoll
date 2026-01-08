# 🔐 Supabase Authentication Setup Guide

## Step 1: Configure Authentication Settings

### In Supabase Dashboard:

1. **Go to Authentication → Settings**
2. **Site URL**: Set to your domain (for local development: `http://localhost` or `http://127.0.0.1`)
3. **Redirect URLs**: Add your admin panel URL
4. **Email Auth**: Enable
5. **Confirm email**: **DISABLE** (for easier setup)
6. **Email templates**: Use default

## Step 2: Create Admin User

### Method 1: Via Dashboard (Recommended)
1. Go to **Authentication → Users**
2. Click **"Add user"**
3. Fill in:
   - **Email**: `admin@extoll.co`
   - **Password**: `extoll2024`
   - **Email Confirm**: **Toggle OFF**
   - **Phone Confirm**: **Toggle OFF**
4. Click **"Create user"**

### Method 2: Via SQL (Alternative)
```sql
-- Insert admin user directly
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@extoll.co',
    crypt('extoll2024', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);
```

## Step 3: Verify Authentication Configuration

### Check supabase-config.js:
```javascript
const SUPABASE_CONFIG = {
    url: 'https://lvtkoryorwzknxzfpyzz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    
    // These MUST match the user you created
    adminEmail: 'admin@extoll.co',
    adminPassword: 'extoll2024',
    
    bucket: 'extoll-portfolio',
    metadataBucket: 'extoll-metadata'
};
```

## Step 4: Test Authentication

### Debug Authentication:
1. Open browser console (F12)
2. Go to admin.html
3. Login with admin/extoll2024
4. Look for these messages:
   - ✅ "Admin signed in successfully"
   - ✅ "Metadata bucket access enabled"

### Common Issues & Solutions:

**Issue**: "Invalid login credentials"
- **Solution**: Verify user exists in Authentication → Users
- **Check**: Email and password match exactly

**Issue**: "User not confirmed"
- **Solution**: In user details, set email_confirmed_at to current timestamp

**Issue**: "Access denied to bucket"
- **Solution**: Check bucket policies are applied correctly

**Issue**: "signInAdmin is not a function"
- **Solution**: Ensure supabase-config.js is loaded before admin.html

## Step 5: Bucket Policies Verification

### Check Storage Policies:
1. Go to **Storage → Policies**
2. Verify policies exist for `extoll-metadata` bucket
3. Policies should allow authenticated users to read/write

### If policies are missing, run this SQL:
```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Metadata bucket policies
CREATE POLICY "Authenticated users can read metadata" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'extoll-metadata' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can upload metadata" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'extoll-metadata' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update metadata" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'extoll-metadata' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can delete metadata" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'extoll-metadata' 
        AND auth.role() = 'authenticated'
    );
```

## Step 6: Test Complete Workflow

### Full Test Sequence:
1. **Login**: admin.html → Login with admin/extoll2024
2. **Create Project**: Fill form → Upload thumbnail → Create
3. **Verify Storage**: Check both buckets have files
4. **Check Portfolio**: index.html should show project from metadata bucket

### Expected Console Messages:
```
🔐 Login attempt started
✅ Login successful
🔐 Attempting Supabase authentication for metadata access...
✅ Admin signed in successfully
✅ Supabase authentication successful - metadata bucket access enabled
✅ Loaded projects from metadata bucket: X projects
```

## Troubleshooting Commands

### Check if user exists:
```sql
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'admin@extoll.co';
```

### Confirm user email manually:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@extoll.co';
```

### Check bucket policies:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### Test bucket access:
```sql
SELECT bucket_id, name, created_at 
FROM storage.objects 
WHERE bucket_id = 'extoll-metadata' 
LIMIT 5;
```