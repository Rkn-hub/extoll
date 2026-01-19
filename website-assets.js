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

// State for logo management
let currentDarkLogo = 'extoll.png';
const LIGHT_THEME_LOGO = 'extoll-light.png';

// Update website logo (internal handler)
function updateWebsiteLogo(logoUrl) {
    // Store the URL as the dark/default logo
    currentDarkLogo = logoUrl;

    // Apply the correct logo based on current theme
    updateThemeLogo();

    // Update favicon if logo is suitable (keep using the dynamic one for now)
    updateFavicon(logoUrl);

    console.log('✅ Website logo updated (stored as dark/default):', logoUrl);
}

// Apply logo based on current theme
function updateThemeLogo() {
    const isDark = document.documentElement.classList.contains('dark');
    const activeLogo = isDark ? currentDarkLogo : LIGHT_THEME_LOGO;

    // Select all potential logo elements
    const logoElements = document.querySelectorAll('.website-logo, [data-logo], .logo, .nav-logo, #navLogo, #footerLogo');

    logoElements.forEach(element => {
        if (element.tagName === 'IMG') {
            element.src = activeLogo;
            element.alt = 'Extoll.Co Logo';
        } else {
            // For non-img elements, set as background or create img
            element.innerHTML = `<img src="${activeLogo}" alt="Extoll.Co Logo" class="h-full w-auto object-contain">`;
        }
    });
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
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Theme
    initTheme();

    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        loadWebsiteAssetsForSite();
    }, 100); // Reduced from 500ms for faster loading
});

// Theme Management
const THEME_CONFIG = {
    key: 'theme',
    darkClass: 'dark',
    default: 'dark'
};

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_CONFIG.key);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Default to dark if no preference or if system prefers dark
    // But explicitly check if 'light' was saved
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && true); // Default to dark for this specific site aesthetic

    if (shouldBeDark) {
        document.documentElement.classList.add(THEME_CONFIG.darkClass);
    } else {
        document.documentElement.classList.remove(THEME_CONFIG.darkClass);
    }

    updateThemeToggleIcons(shouldBeDark);
    updateThemeLogo();
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains(THEME_CONFIG.darkClass);

    if (isDark) {
        html.classList.remove(THEME_CONFIG.darkClass);
        localStorage.setItem(THEME_CONFIG.key, 'light');
        updateThemeToggleIcons(false);
    } else {
        html.classList.add(THEME_CONFIG.darkClass);
        localStorage.setItem(THEME_CONFIG.key, 'dark');
        updateThemeToggleIcons(true);
    }
    // Update logo immediately without reload
    updateThemeLogo();
}

function updateThemeToggleIcons(isDark) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        const sunIcon = toggle.querySelector('.icon-sun');
        const moonIcon = toggle.querySelector('.icon-moon');

        if (sunIcon && moonIcon) {
            if (isDark) {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            } else {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            }
        }
    });

    // Also support checking for ID based toggles if class based not found or specific overrides
    const sunIcons = document.querySelectorAll('.icon-sun');
    const moonIcons = document.querySelectorAll('.icon-moon');

    if (toggles.length === 0 && sunIcons.length > 0) {
        if (isDark) {
            sunIcons.forEach(el => el.classList.remove('hidden'));
            moonIcons.forEach(el => el.classList.add('hidden'));
        } else {
            sunIcons.forEach(el => el.classList.add('hidden'));
            moonIcons.forEach(el => el.classList.remove('hidden'));
        }
    }
}


// Export functions for use in admin panel and global scope
if (typeof window !== 'undefined') {
    window.updateWebsiteLogo = updateWebsiteLogo;
    window.updateWebsiteBanner = updateWebsiteBanner;
    window.loadWebsiteAssetsForSite = loadWebsiteAssetsForSite;
    window.toggleTheme = toggleTheme;
    window.initTheme = initTheme;
}