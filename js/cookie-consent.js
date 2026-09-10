/**
 * Cookie Consent Manager - LSSI-CE (art. 22.2) / RGPD
 *
 * - No se carga Google Tag Manager (ni, por tanto, Google Analytics) hasta que la
 *   persona acepta las cookies analíticas. Consent Mode v2 queda en 'denied' por
 *   defecto como segunda barrera.
 * - El banner y el panel de configuración se generan desde aquí para que el texto
 *   sea el mismo en todas las páginas.
 * - Cualquier elemento con [data-cookie-settings] abre el panel (enlace del footer,
 *   botón de la política de cookies), para poder cambiar o retirar el consentimiento.
 */

(function() {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { dataLayer.push(arguments); };

  const CookieConsent = {
    // Configuración
    config: {
      cookieName: 'cb_cookie_consent',
      cookieExpiry: 365, // días
      // Subir si cambian las cookies o sus finalidades: invalida lo guardado y se vuelve a preguntar
      version: 2,
      gtmId: 'GTM-NRQPJ7XJ',
      gaId: 'G-079KKFQZL5',
      policyUrl: '/politica-cookies'
    },

    gtmLoaded: false,
    lastFocus: null,

    // Consent Mode v2: todo denegado hasta que haya una decisión
    initConsentMode: function() {
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });

      if (this.hasAnalyticsConsent()) {
        this.applyConsent(true);
      } else {
        // Bloquea GA aunque algo lo cargara y limpia cookies que quedaran de antes
        window['ga-disable-' + this.config.gaId] = true;
        this.deleteAnalyticsCookies();
      }
    },

    // Consentimiento guardado; null si no hay o es de una versión anterior del aviso
    getConsentStatus: function() {
      const consent = this.getCookie(this.config.cookieName);
      if (consent) {
        try {
          const parsed = JSON.parse(consent);
          return parsed.version === this.config.version ? parsed : null;
        } catch(e) {
          return null;
        }
      }
      return null;
    },

    hasAnalyticsConsent: function() {
      const consent = this.getConsentStatus();
      return !!consent && consent.analytics_storage === 'granted';
    },

    // Guarda la decisión, la aplica y cierra banner y panel
    setAnalyticsConsent: function(granted) {
      this.saveConsent({
        analytics_storage: granted ? 'granted' : 'denied',
        version: this.config.version,
        timestamp: new Date().toISOString()
      });
      this.applyConsent(granted);
      this.hideSettingsModal();
      this.hideBanner();
    },

    saveConsent: function(consent) {
      this.setCookie(this.config.cookieName, JSON.stringify(consent), this.config.cookieExpiry);
    },

    applyConsent: function(granted) {
      window['ga-disable-' + this.config.gaId] = !granted;
      gtag('consent', 'update', {
        'analytics_storage': granted ? 'granted' : 'denied'
      });

      if (granted) {
        this.loadGTM();
      } else {
        this.deleteAnalyticsCookies();
      }
    },

    loadGTM: function() {
      if (this.gtmLoaded) return;
      this.gtmLoaded = true;

      dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtm.js?id=' + this.config.gtmId;
      document.head.appendChild(script);
    },

    // Borra _ga, _ga_<ID> y similares, en el host y en los dominios padre donde GA las guarda
    deleteAnalyticsCookies: function() {
      const names = document.cookie.split(';')
        .map(c => c.split('=')[0].trim())
        .filter(name => /^(_ga|_gid|_gat|_gcl)/.test(name));
      if (!names.length) return;

      const parts = location.hostname.split('.');
      const domains = [''];
      for (let i = 0; i < parts.length - 1; i++) {
        domains.push(';domain=.' + parts.slice(i).join('.'));
      }

      names.forEach(name => {
        domains.forEach(domain => {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + domain;
        });
      });
    },

    // Crea banner y panel. El banner va al principio del <body> para que sea lo primero
    // al navegar con teclado, aunque se vea abajo.
    render: function() {
      const policyUrl = this.config.policyUrl;

      const banner = document.createElement('div');
      banner.id = 'cookieConsentBanner';
      banner.className = 'cookie-consent-banner';
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-labelledby', 'cookieConsentTitle');
      banner.innerHTML =
        '<div class="cookie-consent-content">' +
          '<div class="cookie-consent-text">' +
            '<p id="cookieConsentTitle" class="cookie-consent-title">Cookies en esta web</p>' +
            '<p>En Carmen Barquero Psicología usamos una cookie técnica propia para recordar tu elección y, ' +
            'solo si lo aceptas, cookies analíticas de terceros (Google Analytics) para saber cuántas personas ' +
            'visitan la web y qué páginas consultan. ' +
            'No usamos cookies publicitarias. Puedes cambiar tu elección cuando quieras desde ' +
            '«Configurar cookies», al pie de cada página. ' +
            'Más información en la <a href="' + policyUrl + '">política de cookies</a>.</p>' +
          '</div>' +
          '<div class="cookie-consent-buttons">' +
            '<button type="button" class="cookie-consent-btn cookie-consent-btn-choice" data-cc="accept">Aceptar todas</button>' +
            '<button type="button" class="cookie-consent-btn cookie-consent-btn-choice" data-cc="reject">Rechazar todas</button>' +
            '<button type="button" class="cookie-consent-btn cookie-consent-btn-settings" data-cookie-settings>Configurar</button>' +
          '</div>' +
        '</div>';

      const modal = document.createElement('div');
      modal.id = 'cookieSettingsModal';
      modal.className = 'cookie-settings-modal';
      modal.innerHTML =
        '<div class="cookie-settings-content" role="dialog" aria-modal="true" aria-labelledby="cookieSettingsTitle">' +
          '<div class="cookie-settings-header">' +
            '<h2 id="cookieSettingsTitle">Configuración de cookies</h2>' +
            '<button type="button" class="cookie-settings-close" data-cc="close" aria-label="Cerrar">×</button>' +
          '</div>' +
          '<div class="cookie-category">' +
            '<div class="cookie-category-header">' +
              '<h3 class="cookie-category-title">Técnicas</h3>' +
              '<span class="cookie-category-status">Siempre activas</span>' +
            '</div>' +
            '<p class="cookie-category-description">Guardan tu elección sobre las cookies durante 12 meses ' +
            '(cookie <code>cb_cookie_consent</code>). Sin ella tendríamos que preguntarte en cada visita.</p>' +
          '</div>' +
          '<div class="cookie-category">' +
            '<div class="cookie-category-header">' +
              '<h3 class="cookie-category-title" id="cookieAnalyticsTitle">Analíticas (Google Analytics)</h3>' +
              '<label class="cookie-toggle">' +
                '<input type="checkbox" id="cookie_analytics" aria-labelledby="cookieAnalyticsTitle">' +
                '<span class="cookie-toggle-slider"></span>' +
              '</label>' +
            '</div>' +
            '<p class="cookie-category-description">Nos dicen cuántas visitas recibe la web, qué páginas se ' +
            'consultan y desde qué tipo de dispositivo, sin identificarte por tu nombre. ' +
            'Proveedor: Google. Duración: hasta 2 años. Solo se activan si las aceptas.</p>' +
          '</div>' +
          '<div class="cookie-settings-footer">' +
            '<button type="button" class="cookie-consent-btn cookie-consent-btn-modal" data-cc="reject">Rechazar todas</button>' +
            '<button type="button" class="cookie-consent-btn cookie-consent-btn-modal" data-cc="save">Guardar preferencias</button>' +
          '</div>' +
        '</div>';

      document.body.insertBefore(banner, document.body.firstChild);
      document.body.appendChild(modal);
    },

    showBannerIfNeeded: function() {
      if (!this.getConsentStatus()) {
        this.showBanner();
      }
    },

    showBanner: function() {
      const banner = document.getElementById('cookieConsentBanner');
      if (banner) {
        setTimeout(() => {
          banner.classList.add('show');
        }, 500);
      }
    },

    hideBanner: function() {
      const banner = document.getElementById('cookieConsentBanner');
      if (banner) {
        banner.classList.remove('show');
      }
    },

    // Mostrar panel de configuración con el estado actual (sin nada marcado si no hay decisión)
    showSettingsModal: function() {
      const modal = document.getElementById('cookieSettingsModal');
      if (!modal) return;

      this.lastFocus = document.activeElement;
      document.getElementById('cookie_analytics').checked = this.hasAnalyticsConsent();
      modal.classList.add('show');
      modal.querySelector('.cookie-settings-close').focus();
    },

    hideSettingsModal: function() {
      const modal = document.getElementById('cookieSettingsModal');
      if (!modal || !modal.classList.contains('show')) return;

      modal.classList.remove('show');
      if (this.lastFocus && this.lastFocus.offsetParent !== null) {
        this.lastFocus.focus();
      }
      this.lastFocus = null;
    },

    // Mantiene el foco dentro del panel mientras está abierto
    trapFocus: function(e) {
      const modal = document.getElementById('cookieSettingsModal');
      const focusable = modal.querySelectorAll('button, input, a[href]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },

    // Utilidades de cookies
    setCookie: function(name, value, days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      const secure = location.protocol === 'https:' ? ';Secure' : '';
      document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax' + secure;
    },

    getCookie: function(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          try {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
          } catch(e) {
            return c.substring(nameEQ.length, c.length);
          }
        }
      }
      return null;
    },

    // Eventos delegados: sirven para el banner, el panel y los enlaces [data-cookie-settings]
    initEvents: function() {
      document.addEventListener('click', (e) => {
        const modal = document.getElementById('cookieSettingsModal');
        if (e.target === modal) {
          this.hideSettingsModal();
          return;
        }

        const trigger = e.target.closest('[data-cookie-settings], [data-cc]');
        if (!trigger) return;

        if (trigger.hasAttribute('data-cookie-settings')) {
          e.preventDefault();
          this.showSettingsModal();
          return;
        }

        switch (trigger.getAttribute('data-cc')) {
          case 'accept':
            this.setAnalyticsConsent(true);
            break;
          case 'reject':
            this.setAnalyticsConsent(false);
            break;
          case 'save':
            this.setAnalyticsConsent(document.getElementById('cookie_analytics').checked);
            break;
          case 'close':
            this.hideSettingsModal();
            break;
        }
      });

      document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('cookieSettingsModal');
        if (!modal || !modal.classList.contains('show')) return;

        if (e.key === 'Escape') {
          this.hideSettingsModal();
        } else if (e.key === 'Tab') {
          this.trapFocus(e);
        }
      });
    },

    // Inicialización principal
    init: function() {
      this.initConsentMode();

      const start = () => {
        this.render();
        this.initEvents();
        this.showBannerIfNeeded();
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
      } else {
        start();
      }
    }
  };

  CookieConsent.init();

  // Exponer globalmente para debugging
  window.CookieConsent = CookieConsent;

})();
