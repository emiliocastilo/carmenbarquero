// Performance Loader - Carga recursos no críticos de forma asíncrona
(function() {
  'use strict';
  
  // Función para cargar scripts de forma asíncrona
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Función para cargar CSS de forma asíncrona si no está ya cargado
  function loadCSS(href) {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing && existing.media !== 'print') return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  // Cargar recursos cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    
    // Registrar Service Worker para cache
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
    
    // Verificar si los CSS se cargaron correctamente (fallback)
    setTimeout(() => {
      const stylesheets = [
        'css/fonts.css',
        'css/base.css', 
        'css/layout.css',
        'css/menu-superior.css',
        'css/menu-responsive.css',
        'css/whatsapp-float.css',
        'css/animacion-sobre-mi.css',
        'css/modal.css'
      ];
      
      stylesheets.forEach(css => {
        const link = document.querySelector(`link[href="${css}"]`);
        if (link && link.media === 'print') {
          link.media = 'all';
        }
      });
    }, 100);

  });

  // Optimizar imágenes lazy con Intersection Observer
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });

    // Observar imágenes lazy
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    });
  }

  // Preload de recursos para navegación futura
  function preloadNextPage() {
    const links = document.querySelectorAll('a[href$=".html"]');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = href;
          document.head.appendChild(prefetchLink);
        }
      }, { once: true });
    });
  }

  // Inicializar preload en hover
  document.addEventListener('DOMContentLoaded', preloadNextPage);

})();