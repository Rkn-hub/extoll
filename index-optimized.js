/* =========================================================
EXTOLL – SINGLE SOURCE OF TRUTH (OPTIMIZED)
========================================================= */

/* ---------- DOM CACHE ---------- */
const DOM = {
  heroTitle: () => document.querySelector("#home h1"),
  heroSubtitle: () => document.querySelector("#home .text-primary"),
  heroDescription: () => document.querySelector("#home h2.text-gray-400"),
  phoneText: () => document.getElementById("indexPhoneText"),
  phoneLink: () => document.getElementById("indexPhoneLink"),
  emailText: () => document.getElementById("indexEmailText"),
  emailLink: () => document.getElementById("indexEmailLink"),
  whatsappText: () => document.getElementById("indexWhatsappText"),
  whatsappLink: () => document.getElementById("indexWhatsappLink"),
  navLinks: () => document.querySelectorAll(".nav-link[data-section]"),
  mobileBtn: () => document.getElementById("mobileMenuBtn"),
  mobileMenu: () => document.getElementById("mobileMenu"),
  portfolioGrid: () => document.getElementById("portfolio-grid"),
  logoElement: () => document.querySelector(".website-logo"),
  bannerElement: () => document.querySelector(".hero-banner"),

};

/* ---------- DATA CACHE ---------- */
const CACHE = {
  projects: null,
  logoUrl: null,
  bannerUrl: null,
  websiteContent: null
};

/* ---------- CMS CONTENT (SAFE, ONCE) ---------- */
async function loadWebsiteContentOnce() {
  try {
    if (!initializeSupabase()) {
      console.warn('⚠️ Supabase not initialized, skipping CMS content load');
      return;
    }

    // Try new path first (website-config/website-content.json)
    let contentPath = `${SUPABASE_CONFIG.globalSettings.folder}/${SUPABASE_CONFIG.globalSettings.files.content}`;

    // Add cache-busting parameter to force fresh load
    const cacheBuster = `?t=${Date.now()}`;

    let { data, error } = await configSupabase.storage
      .from(SUPABASE_CONFIG.bucket)
      .download(contentPath + cacheBuster);

    // Fallback to old path (website-content.json) for backward compatibility
    if (error || !data) {
      const legacyResult = await configSupabase.storage
        .from(SUPABASE_CONFIG.bucket)
        .download('website-content.json' + cacheBuster);

      data = legacyResult.data;
      error = legacyResult.error;
    }

    if (error) {
      console.error('❌ Error downloading CMS content:', error);
      return;
    }

    if (!data) {
      console.warn('⚠️ No CMS content data received');
      return;
    }

    const content = JSON.parse(await data.text());
    CACHE.websiteContent = content;

    /* Hero */
    const heroTitle = DOM.heroTitle();
    const heroSubtitle = DOM.heroSubtitle();
    const heroDescription = DOM.heroDescription();

    if (content.heroTitle && heroTitle) {
      heroTitle.textContent = content.heroTitle;
    } else {
      console.warn('⚠️ Could not update hero title. Content:', content.heroTitle, 'Element:', heroTitle);
    }

    if (content.heroSubtitle && heroSubtitle) {
      heroSubtitle.textContent = content.heroSubtitle;
    } else {
      console.warn('⚠️ Could not update hero subtitle. Content:', content.heroSubtitle, 'Element:', heroSubtitle);
    }

    if (content.heroDescription && heroDescription) {
      heroDescription.textContent = content.heroDescription;
    } else {
      console.warn('⚠️ Could not update hero description. Content:', content.heroDescription, 'Element:', heroDescription);
    }

    /* Contact */
    if (content.contactPhone && DOM.phoneText()) {
      DOM.phoneText().textContent = content.contactPhone;
      DOM.phoneLink().href = "tel:" + content.contactPhone.replace(/[^\d+]/g, "");
    }
    if (content.contactEmail && DOM.emailText()) {
      DOM.emailText().textContent = content.contactEmail;
      DOM.emailLink().href = "mailto:" + content.contactEmail;
    }
    if (content.whatsappNumber && DOM.whatsappText()) {
      DOM.whatsappText().textContent = content.whatsappNumber;
      DOM.whatsappLink().href = "https://wa.me/" + content.whatsappNumber.replace(/[^\d]/g, "");
    }
  } catch (error) {
    console.error('❌ Failed to load website content:', error);
  }
}

/* ---------- PORTFOLIO (FEATURED PROJECTS) ---------- */
async function loadFeaturedProjects() {
  const grid = DOM.portfolioGrid();
  if (!grid) return;

  try {
    // Check cache first
    if (CACHE.projects) {
      renderProjects(CACHE.projects.slice(0, 6));
      return;
    }

    // Show loading state
    grid.innerHTML = '<div class="col-span-full text-center py-20"><div class="text-4xl mb-4">⏳</div><p class="text-gray-400">Loading featured projects...</p></div>';

    // Try Supabase first
    if (initializeSupabase()) {
      const result = await getProjectsPublic();
      if (result.success && result.data?.length > 0) {
        CACHE.projects = result.data;
        localStorage.setItem('projects', JSON.stringify(result.data));
        renderProjects(result.data.slice(0, 6));
        return;
      }
    }

    // Fallback to localStorage
    const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    if (localProjects.length > 0) {
      CACHE.projects = localProjects;
      renderProjects(localProjects.slice(0, 6));
      return;
    }

    // Show empty state
    showEmptyPortfolio();

  } catch (error) {
    console.warn('Portfolio loading failed:', error);
    showEmptyPortfolio();
  }
}

function renderProjects(projects) {
  const grid = DOM.portfolioGrid();
  if (!grid || !projects.length) return;

  const fragment = document.createDocumentFragment();

  projects.forEach(project => {
    const card = createProjectCard(project);
    fragment.appendChild(card);
  });

  grid.innerHTML = '';
  grid.appendChild(fragment);

  // Add click handlers
  grid.addEventListener('click', handleProjectClick);
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'glass-card flex flex-col gap-3 rounded-xl overflow-hidden group portfolio-item cursor-pointer';
  card.setAttribute('data-category', project.category);
  card.setAttribute('data-project', project.key);

  const thumbnailHtml = project.thumbnail_url
    ? `<img src="${project.thumbnail_url}" alt="${project.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async">`
    : createPlaceholderThumbnail(project);

  card.innerHTML = `
    <div class="w-full h-40 overflow-hidden relative">
      ${thumbnailHtml}
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
    </div>
    <div class="p-5 flex flex-col gap-1">
      <p class="text-gray-900 dark:text-white text-lg font-bold leading-tight">${project.title}</p>
      <p class="text-gray-600 dark:text-neutral-400 text-sm">${getCategoryDisplayName(project.category)} • ${project.count || 0} ${getFileTypeLabel(project.category)}</p>
      <p class="text-gray-500 dark:text-neutral-500 text-xs mt-2">${project.description}</p>
    </div>
  `;

  return card;
}

function createPlaceholderThumbnail(project) {
  const categoryIcons = {
    'graphics': '🎨', 'ui': '📱', 'product': '💼', 'animation': '🎬', 'video': '🎥'
  };

  const icon = categoryIcons[project.category] || '📁';

  return `
    <div class="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
      <div class="relative z-10 text-center">
        <div class="text-4xl mb-2">${icon}</div>
        <span class="text-white text-sm font-bold">${project.title}</span>
      </div>
    </div>
  `;
}

function getCategoryDisplayName(category) {
  const categoryMap = {
    'graphics': 'Graphics Design', 'ui': 'UI/UX Design', 'product': 'Product Design',
    'animation': '2D Animation', 'video': 'Video Editing'
  };
  return categoryMap[category] || category;
}

function getFileTypeLabel(category) {
  return (category === 'animation' || category === 'video') ? 'Files' : 'Images';
}

function handleProjectClick(e) {
  const projectCard = e.target.closest('.portfolio-item');
  if (projectCard) {
    const projectKey = projectCard.getAttribute('data-project');
    if (projectKey) {
      window.location.href = `project.html?project=${projectKey}`;
    }
  }
}

function showEmptyPortfolio() {
  const grid = DOM.portfolioGrid();
  if (!grid) return;

  grid.innerHTML = `
    <div class="col-span-full text-center py-20">
      <div class="glass-card p-12 rounded-xl max-w-md mx-auto">
        <div class="text-6xl mb-6">🎨</div>
        <h3 class="text-2xl font-bold text-navy dark:text-white mb-4">No Projects Yet</h3>
        <p class="text-purple dark:text-gray-400 mb-6">Check back soon for our latest creative work and projects.</p>
      </div>
    </div>
  `;
}

/* ---------- LOGO LOADING ---------- */
async function loadLogo() {
  try {
    // Check cache first
    if (CACHE.logoUrl) {
      updateLogo(CACHE.logoUrl);
      return;
    }

    if (!initializeSupabase()) {
      updateLogo(getFallbackLogo());
      return;
    }

    // Try new location first
    const newPath = `${SUPABASE_CONFIG.websiteAssets.folder}/${SUPABASE_CONFIG.websiteAssets.subfolders.logo}`;
    let logoUrl = await tryLoadLogoFromPath(newPath);

    // Fallback to old location
    if (!logoUrl) {
      logoUrl = await tryLoadLogoFromPath('logo');
    }

    // Use fallback if all fails
    if (!logoUrl) {
      logoUrl = getFallbackLogo();
    }

    CACHE.logoUrl = logoUrl;
    updateLogo(logoUrl);

  } catch (error) {
    console.warn('Logo loading failed:', error);
    updateLogo(getFallbackLogo());
  }
}

async function tryLoadLogoFromPath(path) {
  try {
    const { data: files } = await configSupabase.storage
      .from(SUPABASE_CONFIG.bucket)
      .list(path);

    if (files && files.length > 0) {
      const logoFile = files[0].name;
      const { data: urlData } = configSupabase.storage
        .from(SUPABASE_CONFIG.bucket)
        .getPublicUrl(`${path}/${logoFile}`);

      return urlData.publicUrl;
    }
  } catch (error) {
    console.warn(`Failed to load logo from ${path}:`, error);
  }
  return null;
}

function getFallbackLogo() {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwZWE1ZTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkV4dG9sbDwvdGV4dD4KPHN2Zz4=";
}

function updateLogo(logoUrl) {
  const logoElement = DOM.logoElement();
  if (logoElement && logoUrl) {
    logoElement.src = logoUrl;
  }
}

/* ---------- BANNER LOADING ---------- */
async function loadBanner() {
  try {
    // Check cache first
    if (CACHE.bannerUrl) {
      updateBanner(CACHE.bannerUrl);
      return;
    }

    if (!initializeSupabase()) {
      updateBanner(getFallbackBanner());
      return;
    }

    // Try new location first
    const newPath = `${SUPABASE_CONFIG.websiteAssets.folder}/${SUPABASE_CONFIG.websiteAssets.subfolders.banner}`;
    let bannerUrl = await tryLoadBannerFromPath(newPath);

    // Fallback to old location
    if (!bannerUrl) {
      bannerUrl = await tryLoadBannerFromPath('banner');
    }

    // Use fallback if all fails
    if (!bannerUrl) {
      bannerUrl = getFallbackBanner();
    }

    CACHE.bannerUrl = bannerUrl;
    updateBanner(bannerUrl);

  } catch (error) {
    console.warn('❌ Banner loading failed:', error);
    updateBanner(getFallbackBanner());
  }
}

async function tryLoadBannerFromPath(path) {
  try {
    const { data: files } = await configSupabase.storage
      .from(SUPABASE_CONFIG.bucket)
      .list(path);

    if (files && files.length > 0) {
      const bannerFile = files[0].name;
      const { data: urlData } = configSupabase.storage
        .from(SUPABASE_CONFIG.bucket)
        .getPublicUrl(`${path}/${bannerFile}`);

      return urlData.publicUrl;
    }
  } catch (error) {
    console.warn(`Failed to load banner from ${path}:`, error);
  }
  return null;
}

function getFallbackBanner() {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGXYZ2lhbCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMEEwQTBEO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFhMWEyZTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTYyMTNlO3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+Cjx0ZXh0IHg9Ijk2MCIgeT0iNTQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZTVlN2ViIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Zb3VyIEJhbm5lciBIZXJlPC90ZXh0Pgo8L3N2Zz4=";
}

function updateBanner(bannerUrl) {
  const bannerElement = DOM.bannerElement();
  if (bannerElement && bannerUrl) {
    bannerElement.src = bannerUrl;
  } else {
    console.warn('❌ Banner element not found or no URL provided');
  }
}



/* ---------- NAVIGATION ---------- */
function initNavigation() {
  DOM.navLinks().forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.section);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth" });
      setActiveNav(link.dataset.section);
    });
  });
}

function setActiveNav(activeSection) {
  DOM.navLinks().forEach(link => {
    link.classList.toggle("nav-active", link.dataset.section === activeSection);
  });
}

/* ---------- MOBILE MENU ---------- */
function initMobileMenu() {
  const btn = DOM.mobileBtn();
  const menu = DOM.mobileMenu();
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isHidden = menu.classList.contains("hidden");
    if (isHidden) {
      menu.classList.remove("hidden");
      requestAnimationFrame(() => menu.classList.add("show"));
    } else {
      menu.classList.remove("show");
      setTimeout(() => menu.classList.add("hidden"), 300);
    }
  });
}

/* ---------- SERVICE CARD NAVIGATION ---------- */
const SERVICE_ROUTES = {
  'graphics': 'graphic-design.html',
  'ui': 'ui-ux-design.html',
  'product': 'services.html', // Product design routes to main services
  'video': 'video-editing.html',
  '3d': '3d-modeling.html',
  'animation': '2d-animation.html'
};

function initServiceCards() {
  const serviceCards = document.querySelectorAll('[data-service]');
  serviceCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const service = card.getAttribute('data-service');
      const route = SERVICE_ROUTES[service];
      if (route) {
        window.location.href = route;
      }
    });
  });
}

/* ---------- ENTRY POINT ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  // Load all content in parallel
  await Promise.all([
    loadWebsiteContentOnce(),
    loadFeaturedProjects(),
    loadLogo(),
    loadBanner()
  ]);

  // Initialize interactions
  initNavigation();
  initMobileMenu();
  initServiceCards();

  window.scrollTo(0, 0);
});

/* ---------- CLEANUP ---------- */

