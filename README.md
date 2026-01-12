# Extoll.Co Portfolio Website

A modern, responsive portfolio website for Extoll.Co - an execution-first freelance collective specializing in Graphics Design, UI/UX Design, Product Design, 2D Animation, and Web Development.

## 🌟 Features

- **Modern Design**: Clean, professional interface with glassmorphism effects
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Dynamic Portfolio**: Projects loaded from Supabase storage with filtering
- **Admin Panel**: Complete project management system
- **Single Bucket Architecture**: Streamlined file organization
- **Real-time Updates**: Dynamic content loading and caching
- **Interactive Effects**: 3D hover effects and animated backgrounds

## 🏗️ Architecture

### Frontend
- **HTML5/CSS3/JavaScript**: Modern web standards
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Progressive Enhancement**: Works without JavaScript

### Backend
- **Supabase**: Backend-as-a-Service for database and storage
- **Single Bucket Storage**: All assets in `extoll-portfolio` bucket
- **Real-time Database**: PostgreSQL with real-time subscriptions
- **Authentication**: Secure admin access

### File Structure
```
extoll-portfolio/
├── project-name/
│   ├── project.json          # Project metadata
│   ├── thumbnail/            # Project thumbnails
│   ├── images/              # Project images
│   └── videos/              # Project videos
├── website-config/
│   ├── website-content.json # Site content
│   └── team-info.json       # Team information
└── website-assets/
    ├── logo/                # Site logos
    └── banner/              # Site banners
```

## 📁 Project Files

### Core Pages
- `index.html` - Main portfolio homepage
- `about.html` - About page
- `services.html` - Services page
- `contact.html` - Contact page
- `project.html` - Individual project viewer
- `4dm1n.html` - Admin panel for project management
- `project-manager.html` - Alternative project manager

### Configuration
- `supabase-config.js` - Supabase configuration and API functions
- `website-assets.js` - Asset loading utilities
- `supabase-schema.sql` - Database schema

### Documentation
- `SUPABASE_SETUP.md` - Supabase setup instructions
- `SUPABASE_USER_MANAGEMENT.md` - User management guide
- `ADMIN_FEATURES.md` - Admin panel features
- `SECURITY_MEASURES.md` - Security implementation details

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/extoll-portfolio.git
cd extoll-portfolio
```

### 2. Setup Supabase
1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql`
3. Create storage bucket named `extoll-portfolio`
4. Update credentials in `supabase-config.js`

### 3. Configure Admin Access
Update admin credentials in `supabase-config.js`:
```javascript
const SUPABASE_CONFIG = {
    url: 'your-supabase-url',
    anonKey: 'your-anon-key',
    adminEmail: 'your-admin-email',
    adminPassword: 'your-admin-password',
    // ...
};
```

### 4. Deploy
Deploy to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## 🔧 Configuration

### Supabase Setup
See `SUPABASE_SETUP.md` for detailed setup instructions including:
- Database schema creation
- Storage bucket configuration
- Row Level Security policies
- Authentication setup

### Admin Panel Access
1. Navigate to `/4dm1n.html`
2. Sign in with admin credentials
3. Manage projects, upload files, and update content

## 📊 Project Management

### Adding Projects
1. Access admin panel (`4dm1n.html`)
2. Click "Create New Project"
3. Fill project details (title, category, description)
4. Upload thumbnail and project files
5. Project appears automatically on main site

### Supported File Types
- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM, MOV
- **Categories**: Graphics Design, UI/UX, Product Design, 2D Animation, Video Editing

## 🎨 Customization

### Styling
- Modify CSS variables in the `<style>` sections
- Update Tailwind classes for layout changes
- Customize glassmorphism effects and animations

### Content
- Update site content through admin panel
- Modify team information in admin settings
- Upload custom logos and banners

### Features
- Add new project categories in `supabase-config.js`
- Extend filtering options in portfolio display
- Customize admin panel functionality

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- Secure admin authentication
- Input validation and sanitization
- HTTPS enforcement
- Content Security Policy headers

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: extoll.co.in@gmail.com
- Phone: +91 9315158312
- WhatsApp: +91 9315158312

## 🏆 Credits

**Extoll.Co Team:**
- **Ritesh** - Graphic Design, 3D Modeling, UI/UX Design, Web Development
- **Nikhil** - 2D Animation, Video Editing, UI/UX Design, Web Development
- **Yuvraj Gupta** - Promotions, Client Coordination, Social Media
- **Arpit** - Web Development, Client Management, Social Media

---

**Extoll.Co** - Execution-first freelance collective. Powered by Startup Ops.