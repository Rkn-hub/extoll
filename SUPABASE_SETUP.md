# Supabase Setup Guide for Extoll Portfolio

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `extoll-portfolio`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your location
6. Click "Create new project"
7. Wait for project to be ready (2-3 minutes)

## 🔧 Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 📊 Step 3: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire content from `supabase-schema.sql`
4. Paste it in the SQL editor
5. Click "Run" to execute the schema
6. You should see: "Success. No rows returned"

## 🔐 Step 4: Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user"
3. Fill in:
   - **Email**: `admin@extoll.co` (or your preferred admin email)
   - **Password**: Choose a secure password
   - **Email Confirm**: Toggle OFF (so you don't need email verification)
4. Click "Create user"

## 📁 Step 5: Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Create **two buckets**:

### Bucket 1: Public Files (extoll-portfolio)
- Click "Create bucket"
- Name: `extoll-portfolio`
- Set to **Public**
- This stores project files (images, videos, thumbnails)

### Bucket 2: Private Metadata (extoll-metadata)  
- Click "Create bucket"
- Name: `extoll-metadata`
- Set to **Private**
- This stores project metadata as JSON files

3. The system will automatically create this folder structure:

```
extoll-portfolio/ (PUBLIC)
├── website-assets/          # Website logo, banner, icons
│   ├── logo/
│   ├── banner/
│   └── icons/
├── project-name-1/          # Individual project folders
│   ├── images/
│   └── videos/
├── project-name-2/
│   ├── images/
│   └── videos/
└── ...

extoll-metadata/ (PRIVATE)
├── projects/                # Project metadata files
│   ├── project-key-1.json
│   ├── project-key-2.json
│   └── ...
```

## ⚙️ Step 6: Configure Your App

Your credentials are already configured in `supabase-config.js`:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://lvtkoryorwzknxzfpyzz.supabase.co',
    anonKey: 'your-anon-key-here',
    
    adminEmail: 'admin@extoll.co',
    adminPassword: 'extoll2024',
    
    // Two buckets: public for files, private for metadata
    bucket: 'extoll-portfolio',        // Public bucket for files
    metadataBucket: 'extoll-metadata', // Private bucket for project metadata
    folders: {
        images: 'images', 
        videos: 'videos'
    },
    websiteAssets: {
        folder: 'website-assets',
        subfolders: {
            logo: 'logo',
            banner: 'banner',
            icons: 'icons'
        }
    }
};
```

## 🔗 Step 7: Add Supabase to Your HTML

Add this script tag to the `<head>` section of your HTML files:

```html
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
```

## ✅ Step 8: Test Connection

1. Open your browser's developer console (F12)
2. Open `admin.html`
3. You should see: "✅ Supabase initialized successfully"
4. Try logging in with your admin credentials
5. Try adding a test project

## 🔒 Security Notes

- **Never commit your actual credentials to Git**
- **Use environment variables in production**
- **The anon key is safe to expose (it's public)**
- **Admin credentials should be kept secure**

## 🚀 Production Deployment

For production, consider:
1. Using environment variables for credentials
2. Setting up proper domain authentication
3. Configuring CORS settings in Supabase
4. Setting up proper backup policies

## 🆘 Troubleshooting

### Common Issues:

1. **"Failed to fetch"**: Check your Project URL and anon key
2. **"Invalid login credentials"**: Verify admin email/password
3. **"Row Level Security"**: Make sure RLS policies are set up correctly
4. **File upload fails**: Check storage bucket permissions

### Debug Steps:

1. Open browser console (F12)
2. Look for error messages
3. Check Network tab for failed requests
4. Verify Supabase dashboard for data

## 📞 Need Help?

- Check Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- Join Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- Check the browser console for detailed error messages