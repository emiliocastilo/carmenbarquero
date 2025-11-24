# 🍪 Sistema de Consentimiento de Cookies - RGPD Compliant

Sistema completo de gestión de cookies conforme al **RGPD** (Reglamento General de Protección de Datos) y **LSSI-CE** (Ley de Servicios de la Sociedad de la Información), implementado con **Google Consent Mode v2**.

---

## 📋 Contenido

1. [Características](#características)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Archivos Involucrados](#archivos-involucrados)
4. [Cómo Funciona](#cómo-funciona)
5. [Google Consent Mode v2](#google-consent-mode-v2)
6. [Testing y Verificación](#testing-y-verificación)
7. [Cumplimiento Legal](#cumplimiento-legal)
8. [Mantenimiento](#mantenimiento)

---

## ✨ Características

- ✅ **RGPD Compliant**: Cumple con el Reglamento General de Protección de Datos
- ✅ **LSSI-CE Compliant**: Cumple con la legislación española de cookies
- ✅ **Google Consent Mode v2**: Implementación completa con los 4 parámetros requeridos
- ✅ **Banner Responsive**: Adaptado a móviles, tablets y escritorio
- ✅ **Configuración Granular**: Los usuarios pueden elegir qué cookies aceptar
- ✅ **Persistencia de Preferencias**: Las preferencias se guardan por 365 días
- ✅ **No Bloquea GTM**: Usa Consent Mode para gestionar el consentimiento sin bloquear tags
- ✅ **Accesibilidad**: Navegable por teclado y compatible con lectores de pantalla

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CARGA DE LA PÁGINA                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  1. cookie-consent.js SE CARGA PRIMERO (antes de GTM)      │
│     - Inicializa Consent Mode con TODO DENEGADO            │
│     - Verifica si existe consentimiento previo              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Google Tag Manager SE CARGA                             │
│     - Respeta los estados de Consent Mode                   │
│     - NO envía datos hasta tener consentimiento             │
└─────────────────────────────────────────────────────────────┘
                          ↓
         ┌────────────────┴─────────────────┐
         │                                  │
    ¿Hay consentimiento previo?            NO
         │                                  │
        SÍ                                  ↓
         │                    ┌─────────────────────────────┐
         │                    │  3. MOSTRAR BANNER          │
         │                    │     Usuario elige:          │
         │                    │     - Aceptar todas         │
         │                    │     - Rechazar opcionales   │
         │                    │     - Configurar            │
         │                    └─────────────────────────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  4. ACTUALIZAR CONSENT MODE                                 │
│     gtag('consent', 'update', {                             │
│       analytics_storage: 'granted/denied',                  │
│       ad_storage: 'granted/denied',                         │
│       ad_user_data: 'granted/denied',                       │
│       ad_personalization: 'granted/denied'                  │
│     })                                                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  5. GTM ACTÚA SEGÚN EL CONSENTIMIENTO                       │
│     - Si granted: Activa Google Analytics y Ads             │
│     - Si denied: Envía pings sin datos identificables       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos Involucrados

### JavaScript
```
js/cookie-consent.js
```
- **Propósito**: Gestión completa del consentimiento de cookies
- **Funciones principales**:
  - `initConsentMode()`: Inicializa Consent Mode v2 con estados por defecto
  - `showBannerIfNeeded()`: Muestra el banner si no hay consentimiento previo
  - `acceptAll()`: Usuario acepta todas las cookies
  - `rejectAll()`: Usuario rechaza cookies opcionales
  - `saveCustomPreferences()`: Guarda preferencias personalizadas
  - `applyConsent()`: Actualiza Consent Mode según preferencias

### CSS
```
css/cookie-consent.css
```
- **Propósito**: Estilos del banner y modal de configuración
- **Componentes**:
  - Banner inferior con animación de entrada
  - Modal de configuración con toggles
  - Diseño responsive para todos los dispositivos
  - Accesibilidad (foco, hover states)

### HTML
Cada página HTML incluye:

1. **En `<head>` (ANTES de GTM):**
```html
<script src="js/cookie-consent.js"></script>
```

2. **En `<head>` (después de CSS):**
```html
<link rel="stylesheet" href="css/cookie-consent.css" />
```

3. **Antes de `</body>`:**
```html
<!-- Banner de Consentimiento de Cookies -->
<div id="cookieConsentBanner" class="cookie-consent-banner">
  <!-- Contenido del banner -->
</div>

<!-- Modal de Configuración de Cookies -->
<div id="cookieSettingsModal" class="cookie-settings-modal">
  <!-- Contenido del modal -->
</div>
```

### Páginas con implementación:
- ✅ `index.html`
- ✅ `contacto.html`
- ✅ `reserva-cita.html`
- ✅ `consentimientoinformado.html`
- ✅ `politica-privacidad.html`
- ✅ `politica-cookies.html`
- ✅ `servicios/terapia-individual.html`
- ✅ `servicios/terapia-pareja.html`
- ✅ `servicios/neuropsicologia-clinica.html`

---

## ⚙️ Cómo Funciona

### 1. Primera Visita del Usuario

```javascript
// El script detecta que no hay cookie de consentimiento
const consent = this.getCookie('cb_cookie_consent');
if (!consent) {
  this.showBanner(); // Muestra el banner después de 500ms
}
```

### 2. Estado por Defecto (Todo Denegado)

```javascript
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});
```

**Cumplimiento RGPD**: Por defecto, NO se recopilan datos personales hasta que el usuario dé su consentimiento explícito.

### 3. Usuario Acepta Cookies

```javascript
acceptAll: function() {
  const consent = {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    timestamp: new Date().toISOString()
  };
  
  // Guardar en cookie
  this.saveConsent(consent);
  
  // Actualizar Consent Mode
  gtag('consent', 'update', {
    'analytics_storage': 'granted',
    'ad_storage': 'granted',
    'ad_user_data': 'granted',
    'ad_personalization': 'granted'
  });
}
```

### 4. Preferencias Personalizadas

El usuario puede elegir qué cookies acepta:
- **Cookies Necesarias**: Siempre activas (no se pueden desactivar)
- **Cookies Analíticas**: Google Analytics (opcional)
- **Cookies de Publicidad**: Google Ads (opcional)

---

## 🔐 Google Consent Mode v2

### ¿Qué es Consent Mode?

Google Consent Mode es una API que permite a los tags de Google (Analytics, Ads) adaptar su comportamiento según el consentimiento del usuario.

### Modos de Funcionamiento

#### **Modo Básico** (Basic Mode)
- GTM NO se carga hasta tener consentimiento
- No se envían datos a Google
- ❌ No usado en este proyecto

#### **Modo Avanzado** (Advanced Mode) ⭐ **USADO AQUÍ**
- GTM se carga siempre
- Si `denied`: Envía "pings" anónimos sin cookies ni IDs
- Si `granted`: Envía datos completos con cookies
- ✅ Mejor para medición y conversiones

### Los 4 Parámetros de Consent Mode v2

| Parámetro | Descripción | Impacto |
|-----------|-------------|---------|
| `analytics_storage` | Cookies de Google Analytics | Medición del tráfico web |
| `ad_storage` | Cookies de Google Ads | Remarketing y conversiones |
| `ad_user_data` | Datos del usuario para publicidad | Personalización de anuncios |
| `ad_personalization` | Personalización de anuncios | Anuncios basados en intereses |

### Implementación en el Código

```javascript
// Estado por defecto (antes de consentimiento)
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});

// Actualización tras consentimiento del usuario
gtag('consent', 'update', {
  'analytics_storage': 'granted', // Usuario aceptó Analytics
  'ad_storage': 'granted',        // Usuario aceptó Ads
  'ad_user_data': 'granted',      // Usuario aceptó datos personales
  'ad_personalization': 'granted' // Usuario aceptó personalización
});
```

---

## 🧪 Testing y Verificación

### 1. Verificar que Consent Mode Funciona

**Herramientas de Desarrollo de Chrome:**

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Escribe: `dataLayer`
4. Busca eventos de tipo `'consent'`:

```javascript
// Deberías ver algo así:
[
  {
    '0': 'consent',
    '1': 'default',
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  }
]
```

### 2. Verificar Cookies Almacenadas

**Application > Cookies:**

Antes de aceptar:
- ✅ Solo debe existir: `cb_cookie_consent` (si ya aceptaste antes)

Después de aceptar:
- ✅ `_ga`, `_ga_*`, `_gid` (Google Analytics)
- ✅ `_gcl_au` (Google Ads)

### 3. Verificar en Google Tag Manager

1. Ve a [Google Tag Manager](https://tagmanager.google.com/)
2. Abre tu contenedor (`GTM-NRQPJ7XJ`)
3. Usa el modo **Preview** para ver los eventos en tiempo real
4. Verifica que los tags respeten el Consent Mode

### 4. Testing Manual

#### **Escenario 1: Primera Visita**
1. Abre el sitio en modo incógnito
2. ✅ El banner debe aparecer después de ~500ms
3. ✅ No deben existir cookies de Google Analytics

#### **Escenario 2: Aceptar Todas**
1. Haz clic en "Aceptar todas"
2. ✅ El banner desaparece
3. ✅ Se crean cookies: `_ga`, `_gid`, `_gcl_au`
4. ✅ Google Analytics empieza a rastrear

#### **Escenario 3: Rechazar Opcionales**
1. Haz clic en "Rechazar opcionales"
2. ✅ El banner desaparece
3. ✅ NO se crean cookies de Google Analytics/Ads
4. ✅ Se envían pings sin identificadores a Google

#### **Escenario 4: Configuración Personalizada**
1. Haz clic en "Configurar cookies"
2. ✅ Se abre el modal
3. Activa solo "Cookies Analíticas"
4. Haz clic en "Guardar preferencias"
5. ✅ Solo se crean cookies de Analytics, NO de Ads

---

## ⚖️ Cumplimiento Legal

### RGPD (Reglamento General de Protección de Datos)

✅ **Artículo 6.1.a**: Consentimiento explícito del usuario
- El banner solicita consentimiento ANTES de almacenar cookies

✅ **Artículo 7**: Condiciones para el consentimiento
- El usuario puede retirar el consentimiento en cualquier momento
- Opción "Rechazar opcionales" tan accesible como "Aceptar"

✅ **Artículo 13**: Información al interesado
- Enlace a la Política de Cookies con información detallada
- Descripción clara de qué cookies se usan y para qué

### LSSI-CE (Ley de Servicios de la Sociedad de la Información)

✅ **Artículo 22.2**: Información y consentimiento sobre cookies
- Información clara sobre las cookies utilizadas
- Mecanismo para aceptar o rechazar cookies no necesarias

### ePrivacy Directive

✅ **Directiva 2002/58/CE**: Cookies y dispositivos terminales
- Consentimiento previo para cookies no esenciales
- Excepción solo para cookies técnicamente necesarias

---

## 🔧 Mantenimiento

### Actualizar Preferencias de Cookies

Si necesitas cambiar qué cookies se usan, modifica:

**1. JavaScript (`js/cookie-consent.js`):**
```javascript
// Línea ~85: Añadir nuevos parámetros de consentimiento
const consent = {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  // Añade aquí nuevos parámetros si Google los introduce
  timestamp: new Date().toISOString()
};
```

**2. HTML del Modal:**
Añade nuevas categorías de cookies en el modal de configuración de cada página.

**3. Política de Cookies (`politica-cookies.html`):**
Documenta las nuevas cookies en la tabla correspondiente.

### Cambiar Duración de la Cookie de Consentimiento

```javascript
// js/cookie-consent.js - Línea 14
config: {
  cookieName: 'cb_cookie_consent',
  cookieExpiry: 365, // Cambiar este valor (días)
  gtmId: 'GTM-NRQPJ7XJ'
}
```

### Depuración

Para ver logs de depuración en consola:

```javascript
// Añadir al final de js/cookie-consent.js
console.log('Cookie Consent initialized');
console.log('Current consent:', CookieConsent.getConsentStatus());
```

---

## 📚 Referencias

- [Google Consent Mode Documentation](https://developers.google.com/tag-platform/security/guides/consent)
- [RGPD - Reglamento (UE) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [LSSI-CE - Ley 34/2002](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758)
- [ePrivacy Directive](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:02002L0058-20091219)

---

## 🆘 Soporte

Si tienes problemas con el sistema de cookies:

1. **Verifica la consola del navegador** (F12) en busca de errores
2. **Borra las cookies** del sitio y vuelve a probar
3. **Comprueba que `cookie-consent.js` se carga ANTES de GTM**
4. **Revisa que el GTM ID sea correcto**: `GTM-NRQPJ7XJ`

---

## ✅ Checklist de Implementación

- [x] `cookie-consent.js` creado e implementado
- [x] `cookie-consent.css` creado e implementado
- [x] Banner HTML añadido a todas las páginas
- [x] Modal de configuración añadido a todas las páginas
- [x] Script carga ANTES de GTM en todas las páginas
- [x] Enlaces a política de cookies actualizados
- [x] `politica-cookies.html` creada con información completa
- [x] Google Consent Mode v2 implementado con 4 parámetros
- [x] Testing en Chrome DevTools
- [x] Verificación de cookies almacenadas
- [x] Cumplimiento RGPD verificado
- [x] Cumplimiento LSSI-CE verificado

---

**Última actualización**: 29 de enero de 2025  
**Versión**: 1.0.0  
**Autor**: Sistema de Gestión de Cookies - Carmen Barquero Psicología
