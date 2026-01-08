// Website Assets Dynamic Loading
// This file handles loading and updating website assets like logo and banner

// Configuration for website assets
const WEBSITE_ASSETS_CONFIG = {
    // Default fallback assets
    defaults: {
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwZWE1ZTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkV4dG9sbDwvdGV4dD4KPHN2Zz4=',
        banner: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGXYZ2lhbCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMEEwQTBEO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFhMWEyZTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYyMTNlO3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+Cjx0ZXh0IHg9Ijk2MCIgeT0iNTQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZTVlN2ViIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Zb3VyIEJhbm5lciBIZXJlPC90ZXh0Pgo8L3N2Zz4='
    },
    
    // Storage keys for localStorage fallback
    storageKeys: {
        logo: 'website_logo_url',
        banner: 'website_banner_url'
    }
};

// Load website assets on page load
async function loadWebsiteAssetsForSite() {
    try {
        // Try to load from Supabase first
        if (typeof getWebsiteAssets === 'function') {
            const result = await getWebsiteAssets();
            
            if (result.success) {
                const assets = result.data;
                
                // Update logo
                if (assets.logo && assets.logo.length > 0) {
                    const logoUrl = assets.logo[0].url; // Most recent
                    updateWebsiteLogo(logoUrl);
                    localStorage.setItem(WEBSITE_ASSETS_CONFIG.storageKeys.logo, logoUrl);
                }
                
                // Update banner
                if (assets.banner && assets.banner.length > 0) {
                    const bannerUrl = assets.banner[0].url; // Most recent
                    updateWebsiteBanner(bannerUrl);
                    localStorage.setItem(WEBSITE_ASSETS_CONFIG.storageKeys.banner, bannerUrl);
                }
                
                console.log('✅ Website assets loaded from Supabase');
                return;
            }
        }
        
        // Fallback to localStorage
        const logoUrl = localStorage.getItem(WEBSITE_ASSETS_CONFIG.storageKeys.logo);
        const bannerUrl = localStorage.getItem(WEBSITE_ASSETS_CONFIG.storageKeys.banner);
        
        if (logoUrl) {
            updateWebsiteLogo(logoUrl);
        }
        
        if (bannerUrl) {
            updateWebsiteBanner(bannerUrl);
        }
        
        console.log('✅ Website assets loaded from localStorage');
        
    } catch (error) {
        console.error('❌ Failed to load website assets:', error);
        // Use defaults if everything fails
        updateWebsiteLogo(WEBSITE_ASSETS_CONFIG.defaults.logo);
        updateWebsiteBanner(WEBSITE_ASSETS_CONFIG.defaults.banner);
    }
}

// Update website logo
function updateWebsiteLogo(logoUrl) {
    // Update all logo elements on the page
    const logoElements = document.querySelectorAll('.website-logo, [data-logo], .logo');
    
    logoElements.forEach(element => {
        if (element.tagName === 'IMG') {
            element.src = logoUrl;
            element.alt = 'Extoll.Co Logo';
        } else {
            // For non-img elements, set as background or create img
            element.innerHTML = `<img src="${logoUrl}" alt="Extoll.Co Logo" class="h-full w-auto object-contain">`;
        }
    });
    
    // Update favicon if logo is suitable
    updateFavicon(logoUrl);
    
    console.log('✅ Website logo updated:', logoUrl);
}

// Update website banner
function updateWebsiteBanner(bannerUrl) {
    // Update all banner elements on the page
    const bannerElements = document.querySelectorAll('.hero-banner, [data-banner], .banner-bg');
    
    bannerElements.forEach(element => {
        if (element.tagName === 'IMG') {
            element.src = bannerUrl;
            element.alt = 'Hero Banner';
        } else {
            // Set as background image
            element.style.backgroundImage = `url('${bannerUrl}')`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
            element.style.backgroundRepeat = 'no-repeat';
        }
    });
    
    console.log('✅ Website banner updated:', bannerUrl);
}

// Update favicon
function updateFavicon(logoUrl) {
    try {
        // Only update if it's not a data URL (SVG default)
        if (!logoUrl.startsWith('data:')) {
            let favicon = document.querySelector('link[rel="icon"]');
            
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            
            favicon.href = logoUrl;
            console.log('✅ Favicon updated');
        }
    } catch (error) {
        console.log('⚠️ Could not update favicon:', error.message);
    }
}

// Initialize website assets when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        loadWebsiteAssetsForSite();
    }, 500);
});

// Export functions for use in admin panel
if (typeof window !== 'undefined') {
    window.updateWebsiteLogo = updateWebsiteLogo;
    window.updateWebsiteBanner = updateWebsiteBanner;
    window.loadWebsiteAssetsForSite = loadWebsiteAssetsForSite;
}