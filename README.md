# Extoll.Co - Portfolio Website

## Project Overview
Extoll.Co is a professional portfolio website showcasing design and development services. The site features a modern, responsive design with optimized performance and SEO.

## Website Structure

### Main Pages
- **index.html** - Homepage with hero section, portfolio gallery, services, about, and contact
- **about.html** - Detailed about page with team information and company philosophy
- **services.html** - Services page with interactive service tiles
- **contact.html** - Contact page with form integration and multiple contact methods
- **project.html** - Dynamic project details page with lightbox gallery

### Key Features
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **SEO Optimized** - Meta tags, Open Graph, Twitter cards, structured data
- **Performance Optimized** - Lazy loading, optimized images, resource hints
- **Interactive Elements** - 3D hover effects, smooth animations, lightbox gallery
- **Contact Integration** - Supabase database integration with FormSubmit.co fallback
- **Service Navigation** - Click-to-filter functionality from services to portfolio

### Technical Stack
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL database)
- **Deployment**: Vercel
- **Assets**: Supabase Storage for images and media

### Configuration Files
- **package.json** - Project dependencies and scripts
- **vercel.json** - Deployment configuration
- **supabase-setup.sql** - Database schema and setup
- **supabase-form-handler.js** - Contact form functionality
- **SUPABASE_SETUP_GUIDE.md** - Database setup instructions

### Asset Directories
- **supabase/** - Supabase configuration files
- **food processor/** - Food processor project images
- **smart pet collar/** - Smart pet collar project images
- **logo.png** - Company logo

## Performance Optimizations
- Lazy loading for portfolio images
- Resource hints for faster loading
- Optimized image alt texts for SEO
- Minified and optimized CSS/JS delivery
- Proper meta tags and structured data

## Contact Integration
- Primary: Supabase database storage
- Fallback: FormSubmit.co email service
- Multiple contact methods: Phone, Email, WhatsApp, Instagram

## Deployment
The website is configured for deployment on Vercel with automatic builds from the main branch.

---

**Extoll.Co** - Execution-first freelance collective. Powered by Startup Ops.