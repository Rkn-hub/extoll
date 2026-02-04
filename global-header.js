/**
 * Global Header Component for Extoll.co
 * Include this script on all pages to get a consistent header
 */

(function () {
  // Get current page for active state
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Determine which nav item is active
  function isActive(page) {
    if (page === 'index.html' && (currentPage === '' || currentPage === 'index.html')) return true;
    if (page === 'portfolio.html' && (currentPage === 'portfolio.html' || currentPage === 'project.html')) return true;
    if (page === 'services.html' && (currentPage.includes('services') || currentPage.includes('development') || currentPage.includes('design') || currentPage.includes('animation') || currentPage.includes('editing') || currentPage.includes('modeling'))) return true;
    if (page === 'about.html' && currentPage === 'about.html') return true;
    if (page === 'contact.html' && currentPage === 'contact.html') return true;
    return currentPage === page;
  }

  // Active/inactive class helpers
  function navClass(page) {
    return isActive(page)
      ? 'text-primary text-sm font-medium relative'
      : 'text-slate-600 dark:text-white/70 hover:text-primary transition-colors text-sm font-medium';
  }

  function mobileNavClass(page) {
    return isActive(page)
      ? 'block text-primary text-lg font-medium py-2 px-2'
      : 'block text-slate-600 dark:text-white/80 text-lg font-medium py-2 px-2 hover:text-primary';
  }

  // Header HTML template
  const headerHTML = `
    <header id="global-header" class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background-light/80 dark:bg-background-dark/80 border-b border-gray-200 dark:border-white/10">
      <div class="max-w-[1280px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        <a href="index.html" class="flex items-center gap-4">
          <img src="extoll.png" alt="Extoll.Co Logo" class="h-8 w-8 object-contain" id="navLogo">
          <h2 class="text-lg font-bold tracking-[-0.015em]">Extoll.Co</h2>
        </a>
        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-9">
          <a class="${navClass('index.html')}" href="index.html">
            Home
            ${isActive('index.html') ? '<span class="absolute bottom-[-8px] left-0 w-full h-0.5 bg-primary"></span>' : ''}
          </a>
          <a class="${navClass('portfolio.html')}" href="portfolio.html">
            Portfolio
            ${isActive('portfolio.html') ? '<span class="absolute bottom-[-8px] left-0 w-full h-0.5 bg-primary"></span>' : ''}
          </a>
          <a class="${navClass('services.html')}" href="services.html">
            Services
            ${isActive('services.html') ? '<span class="absolute bottom-[-8px] left-0 w-full h-0.5 bg-primary"></span>' : ''}
          </a>
          <a class="${navClass('about.html')}" href="about.html">
            About
            ${isActive('about.html') ? '<span class="absolute bottom-[-8px] left-0 w-full h-0.5 bg-primary"></span>' : ''}
          </a>
        </nav>
        <div class="flex items-center gap-4">
          <a href="contact.html">
            <button class="hidden md:flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(0,170,255,0.4)]">
              Contact
            </button>
          </a>
          <!-- Theme Toggle -->
          <button onclick="toggleTheme()" class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition-all" title="Toggle theme" aria-label="Toggle dark/light theme">
            <svg class="w-5 h-5 icon-sun hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg class="w-5 h-5 icon-moon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
          <!-- Mobile Menu Button -->
          <button id="globalMobileMenuBtn" class="md:hidden flex items-center justify-center w-10 h-10" aria-label="Toggle mobile menu" aria-expanded="false" aria-controls="globalMobileMenu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
      <!-- Mobile Menu -->
      <div id="globalMobileMenu" class="md:hidden hidden bg-background-light/95 dark:bg-background-dark/95 border-t border-gray-200 dark:border-white/10">
        <div class="px-4 py-6 space-y-4">
          <a class="${mobileNavClass('index.html')}" href="index.html">Home</a>
          <a class="${mobileNavClass('portfolio.html')}" href="portfolio.html">Portfolio</a>
          <a class="${mobileNavClass('services.html')}" href="services.html">Services</a>
          <a class="${mobileNavClass('about.html')}" href="about.html">About</a>
          <a class="${mobileNavClass('contact.html')}" href="contact.html">Contact</a>
          <div class="pt-4 border-t border-gray-200 dark:border-white/10 flex gap-4">
            <button onclick="toggleTheme()" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-sm font-medium">
              <svg class="w-4 h-4 icon-sun hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <svg class="w-4 h-4 icon-moon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
              Theme
            </button>
          </div>
        </div>
      </div>
    </header>
    <!-- Spacer for fixed header -->
    <div id="header-spacer" style="height: 64px;"></div>
  `;

  // Insert header at the beginning of body
  function insertHeader() {
    // Check if header already exists
    if (document.getElementById('global-header')) return;

    // Insert at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Setup mobile menu toggle
    const mobileMenuBtn = document.getElementById('globalMobileMenuBtn');
    const mobileMenu = document.getElementById('globalMobileMenu');

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', function () {
        const isHidden = mobileMenu.classList.toggle('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', !isHidden);
      });

      // Close menu when clicking outside
      document.addEventListener('click', function (e) {
        if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.add('hidden');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Update theme icons based on current theme
    updateThemeIcons();
  }

  // Update theme toggle icons
  function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    document.querySelectorAll('.icon-sun').forEach(el => {
      el.classList.toggle('hidden', !isDark);
    });
    document.querySelectorAll('.icon-moon').forEach(el => {
      el.classList.toggle('hidden', isDark);
    });
  }

  // Global theme toggle function
  window.toggleTheme = function () {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    updateThemeIcons();
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertHeader);
  } else {
    insertHeader();
  }
})();
