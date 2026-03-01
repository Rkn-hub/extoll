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

/* ---------- CMS CONTENT (SAFE, ONCE PER SESSION) ---------- */
async function loadWebsiteContentOnce() {
  try {
    // Check sessionStorage cache first — avoids API call on every page navigation
    const sessionCached = sessionStorage.getItem('extoll_cms_content');
    if (sessionCached) {
      try {
        const content = JSON.parse(sessionCached);
        CACHE.websiteContent = content;
        applyCMSContent(content);
        console.log('⚡ CMS content loaded from session cache');
        return;
      } catch (e) { }
    }

    // Guard: initializeSupabase comes from supabase-config.js which depends on Supabase CDN
    if (typeof initializeSupabase !== 'function' || !initializeSupabase()) {
      console.warn('⚠️ Supabase not available, skipping CMS content load');
      return;
    }

    // Single API call to fetch CMS content
    const contentPath = `${SUPABASE_CONFIG.globalSettings.folder}/${SUPABASE_CONFIG.globalSettings.files.content}`;

    const { data, error } = await configSupabase.storage
      .from(SUPABASE_CONFIG.bucket)
      .download(contentPath);

    if (error || !data) {
      console.warn('⚠️ CMS content not available:', error?.message);
      return;
    }

    const content = JSON.parse(await data.text());
    CACHE.websiteContent = content;

    // Cache in sessionStorage for the rest of this browsing session
    sessionStorage.setItem('extoll_cms_content', JSON.stringify(content));

    applyCMSContent(content);

  } catch (error) {
    console.error('❌ Failed to load website content:', error);
  }
}

// Apply CMS content to DOM elements
function applyCMSContent(content) {
  /* Hero */
  const heroTitle = DOM.heroTitle();
  const heroSubtitle = DOM.heroSubtitle();
  const heroDescription = DOM.heroDescription();

  if (content.heroTitle && heroTitle) heroTitle.textContent = content.heroTitle;
  if (content.heroSubtitle && heroSubtitle) heroSubtitle.textContent = content.heroSubtitle;
  if (content.heroDescription && heroDescription) heroDescription.textContent = content.heroDescription;

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
}

/* ---------- PORTFOLIO (FEATURED PROJECTS) ---------- */
async function loadFeaturedProjects() {
  const grid = DOM.portfolioGrid();
  if (!grid) return;

  try {
    // Check cache first - show cached content immediately
    if (CACHE.projects && CACHE.projects.length > 0) {
      renderProjects(CACHE.projects.slice(0, 6));
      return;
    }

    // Check localStorage for instant display
    const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    if (localProjects.length > 0) {
      CACHE.projects = localProjects;
      renderProjects(localProjects.slice(0, 6));
      // Still fetch fresh data in background
      refreshProjectsInBackground();
      return;
    }

    // Show loading state only if no cached data
    grid.innerHTML = '<div class="col-span-full text-center py-20"><div class="text-4xl mb-4">⏳</div><p class="text-gray-400">Loading featured projects...</p></div>';

    // Try fast manifest-based loading first
    if (typeof initializeSupabase === 'function' && initializeSupabase()) {
      const result = typeof getProjectsFast === 'function'
        ? await getProjectsFast()
        : await getProjectsPublic();

      if (result.success && result.data?.length > 0) {
        CACHE.projects = result.data;
        localStorage.setItem('projects', JSON.stringify(result.data));
        renderProjects(result.data.slice(0, 6));
        return;
      }
    }

    // Show empty state
    showEmptyPortfolio();

  } catch (error) {
    console.warn('Portfolio loading failed:', error);
    showEmptyPortfolio();
  }
}

// Background refresh for stale-while-revalidate pattern
async function refreshProjectsInBackground() {
  try {
    if (typeof initializeSupabase !== 'function' || !initializeSupabase()) return;

    const result = typeof getProjectsFast === 'function'
      ? await getProjectsFast()
      : await getProjectsPublic();

    if (result.success && result.data?.length > 0 && !result.fromCache) {
      CACHE.projects = result.data;
      localStorage.setItem('projects', JSON.stringify(result.data));
      console.log('⚡ Projects refreshed in background');
    }
  } catch (e) {
    // Silent fail for background refresh
  }
}

function renderProjects(projects) {
  const grid = DOM.portfolioGrid();
  if (!grid || !projects.length) return;

  const fragment = document.createDocumentFragment();

  projects.forEach((project, index) => {
    const card = createProjectCard(project, index);
    fragment.appendChild(card);
  });

  grid.innerHTML = '';
  grid.appendChild(fragment);

  // Add click handlers
  grid.addEventListener('click', handleProjectClick);
}

function createProjectCard(project, index = 0) {
  const card = document.createElement('div');
  card.className = 'glass-card flex flex-col gap-3 rounded-xl overflow-hidden group portfolio-item cursor-pointer';
  card.setAttribute('data-category', project.category);
  card.setAttribute('data-project', project.key);

  const isPriority = index < 6;
  const loadingAttr = isPriority ? 'eager' : 'lazy';
  const fetchPriority = isPriority ? 'high' : 'auto';

  const thumbnailHtml = project.thumbnail_url
    ? `<img src="${project.thumbnail_url}" alt="${project.title}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="${loadingAttr}" fetchpriority="${fetchPriority}" decoding="${isPriority ? 'sync' : 'async'}">`
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

/* ---------- LOGO LOADING (REMOVED) ---------- */
// Logo is now loaded locally via website-assets.js
// using the dynamic dark/light theme switching.

/* ---------- BANNER LOADING (REMOVED) ---------- */
// Banner is now loaded locally via website-assets.js



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
document.addEventListener("DOMContentLoaded", () => {
  // Initialize interactions IMMEDIATELY - never block on data loading
  initNavigation();
  initMobileMenu();
  initServiceCards();

  // Load data in background - don't block page interactivity
  // Each loader has its own try/catch so one failure doesn't affect others
  loadWebsiteContentOnce().catch(e => console.warn('CMS content load failed:', e));
  loadFeaturedProjects().catch(e => console.warn('Featured projects load failed:', e));

  window.scrollTo(0, 0);
});

/* ---------- CLEANUP ---------- */
