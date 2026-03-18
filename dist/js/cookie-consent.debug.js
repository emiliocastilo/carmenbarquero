/**
 * Cookie Consent Manager - RGPD/LSSI-CE Compliant
 * Implementa Google Consent Mode v2 con los 4 parámetros requeridos
 */

(function() {
  'use strict';

  // Inicializar dataLayer y gtag INMEDIATAMENTE (antes de cualquier cosa)
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { dataLayer.push(arguments); };

  const CookieConsent = {
    // Configuración
    config: {
      cookieName: 'cb_cookie_consent',
      cookieExpiry: 365, // días
      gaId: 'G-079KKFQZL5'
    },

    // Inicializar Consent Mode v2 ANTES de cargar cualquier script de Google
    initConsentMode: function() {
      // Verificar si hay consentimiento previo
      const previousConsent = this.getConsentStatus();

      // Consent Mode v2 - Estado por defecto con los 4 parámetros OBLIGATORIOS
      // Por defecto: analytics granted (como lo tenías), ads denied
      gtag('consent', 'default', {
        'analytics_storage': previousConsent ? previousConsent.analytics_storage : 'granted',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'wait_for_update': 500
      });

      // Si había consentimiento previo, aplicarlo inmediatamente
      if (previousConsent) {
        this.applyConsent(previousConsent);
      }
    },

    // Verificar si ya existe consentimiento
    getConsentStatus: function() {
      const consent = this.getCookie(this.config.cookieName);
      if (consent) {
        try {
          return JSON.parse(consent);
        } catch(e) {
          return null;
        }
      }
      return null;
    },

    // Mostrar banner si no hay consentimiento previo
    showBannerIfNeeded: function() {
      const consent = this.getConsentStatus();

      if (!consent) {
        // No hay consentimiento, mostrar banner
        this.showBanner();
      }
    },

    // Mostrar el banner
    showBanner: function() {
      const banner = document.getElementById('cookieConsentBanner');
      if (banner) {
        setTimeout(() => {
          banner.classList.add('show');
        }, 500);
      }
    },

    // Ocultar el banner
    hideBanner: function() {
      const banner = document.getElementById('cookieConsentBanner');
      if (banner) {
        banner.classList.remove('show');
      }
    },

    // Aceptar todas las cookies
    acceptAll: function() {
      const consent = {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        timestamp: new Date().toISOString()
      };

      this.saveConsent(consent);
      this.applyConsent(consent);
      this.hideBanner();
    },

    // Rechazar cookies opcionales (solo necesarias)
    rejectAll: function() {
      const consent = {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        timestamp: new Date().toISOString()
      };

      this.saveConsent(consent);
      this.applyConsent(consent);
      this.hideBanner();
    },

    // Guardar preferencias personalizadas
    saveCustomPreferences: function() {
      const analyticsCheckbox = document.getElementById('cookie_analytics');

      const consent = {
        analytics_storage: analyticsCheckbox && analyticsCheckbox.checked ? 'granted' : 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        timestamp: new Date().toISOString()
      };

      this.saveConsent(consent);
      this.applyConsent(consent);
      this.hideSettingsModal();
      this.hideBanner();
    },

    // Guardar consentimiento en cookie
    saveConsent: function(consent) {
      const consentString = JSON.stringify(consent);
      this.setCookie(this.config.cookieName, consentString, this.config.cookieExpiry);
    },

    // Aplicar consentimiento a Google Consent Mode v2
    applyConsent: function(consent) {
      gtag('consent', 'update', {
        'analytics_storage': consent.analytics_storage,
        'ad_storage': consent.ad_storage || 'denied',
        'ad_user_data': consent.ad_user_data || 'denied',
        'ad_personalization': consent.ad_personalization || 'denied'
      });
    },

    // Mostrar modal de configuración
    showSettingsModal: function() {
      const modal = document.getElementById('cookieSettingsModal');
      if (modal) {
        modal.classList.add('show');

        // Cargar preferencias actuales si existen, si no, marcar analytics por defecto
        const consent = this.getConsentStatus();
        const analyticsCheckbox = document.getElementById('cookie_analytics');
        if (analyticsCheckbox) {
          if (consent) {
            analyticsCheckbox.checked = consent.analytics_storage === 'granted';
          } else {
            // Por defecto marcado (coincide con el default 'granted' del consent mode)
            analyticsCheckbox.checked = true;
          }
        }
      }
    },

    // Ocultar modal de configuración
    hideSettingsModal: function() {
      const modal = document.getElementById('cookieSettingsModal');
      if (modal) {
        modal.classList.remove('show');
      }
    },

    // Utilidades de cookies
    setCookie: function(name, value, days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax;Secure';
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

    // Inicializar eventos
    initEvents: function() {
      // Botones del banner
      const acceptBtn = document.getElementById('acceptAllCookies');
      const rejectBtn = document.getElementById('rejectAllCookies');
      const settingsBtn = document.getElementById('cookieSettings');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => this.acceptAll());
      }

      if (rejectBtn) {
        rejectBtn.addEventListener('click', () => this.rejectAll());
      }

      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => this.showSettingsModal());
      }

      // Modal de configuración
      const closeModalBtn = document.getElementById('closeSettingsModal');
      const saveSettingsBtn = document.getElementById('saveCustomPreferences');
      const settingsModal = document.getElementById('cookieSettingsModal');

      if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => this.hideSettingsModal());
      }

      if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => this.saveCustomPreferences());
      }

      // Cerrar modal al hacer clic fuera
      if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
          if (e.target === settingsModal) {
            this.hideSettingsModal();
          }
        });
      }
    },

    // Inicialización principal
    init: function() {
      // 1. Inicializar Consent Mode PRIMERO (antes de GTM)
      this.initConsentMode();

      // 2. Esperar a que el DOM esté listo para eventos
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.initEvents();
          this.showBannerIfNeeded();
        });
      } else {
        this.initEvents();
        this.showBannerIfNeeded();
      }
    }
  };

  // Inicializar inmediatamente
  CookieConsent.init();

  // Exponer globalmente para debugging
  window.CookieConsent = CookieConsent;

})();
