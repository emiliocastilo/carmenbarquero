/**
 * Cookie Consent Manager - RGPD/LSSI-CE Compliant
 * Implementa Google Consent Mode v2 con los 4 parámetros requeridos
 */

(function() {
  'use strict';

  const CookieConsent = {
    // Configuración
    config: {
      cookieName: 'cb_cookie_consent',
      cookieExpiry: 365, // días
      gtmId: 'GTM-NRQPJ7XJ'
    },

    // Inicializar Consent Mode v2 ANTES de GTM
    initConsentMode: function() {
      // Configuración por defecto: TODO DENEGADO (RGPD compliant)
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      
      // Consent Mode - Estado por defecto
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'wait_for_update': 500
      });

      // Configuración adicional de GTM
      gtag('js', new Date());
      gtag('config', this.config.gtmId);
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
      
      if (consent) {
        // Ya hay consentimiento previo, aplicarlo
        this.applyConsent(consent);
      } else {
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
        analytics_storage: analyticsCheckbox.checked ? 'granted' : 'denied',
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

    // Aplicar consentimiento a Google Consent Mode
    applyConsent: function(consent) {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      
      // Actualizar Consent Mode
      gtag('consent', 'update', {
        'analytics_storage': consent.analytics_storage
      });
    },

    // Mostrar modal de configuración
    showSettingsModal: function() {
      const modal = document.getElementById('cookieSettingsModal');
      if (modal) {
        modal.classList.add('show');
        
        // Cargar preferencias actuales si existen
        const consent = this.getConsentStatus();
        if (consent) {
          document.getElementById('cookie_analytics').checked = consent.analytics_storage === 'granted';
          document.getElementById('cookie_advertising').checked = consent.ad_storage === 'granted';
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
      document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
    },

    getCookie: function(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
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
      
      // 2. Esperar a que el DOM esté listo
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
