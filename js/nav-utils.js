/* ==============================================
   Navigation Utility - Active Page Detection
   Automatically highlights current page in nav
   ============================================== */

(function() {
  'use strict';

  /**
   * Detects current page and marks active nav link
   * Uses pathname to identify current page
   */
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Handle root path
      if (currentPath === '/' && href === '/') {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
      // Handle other paths
      else if (currentPath.includes(href) && href !== '/') {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
      // Remove active from other links
      else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    });

    // Also set body class for additional styling flexibility
    document.body.classList.remove('page-home', 'page-pacman', 'page-arxiv', 'page-about');
    
    if (currentPath === '/' || currentPath === '/index.html') {
      document.body.classList.add('page-home');
    } else if (currentPath.includes('/pacman/')) {
      document.body.classList.add('page-pacman');
    } else if (currentPath.includes('/arxiv')) {
      document.body.classList.add('page-arxiv');
    } else if (currentPath.includes('#about')) {
      document.body.classList.add('page-about');
    }
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setActiveNavLink);
  } else {
    setActiveNavLink();
  }

  // Run on page history change (for SPAs or client-side navigation)
  window.addEventListener('popstate', setActiveNavLink);
})();
