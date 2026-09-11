// Menu Responsive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const menuOpenButton = document.querySelector('.menu-open-button');
    const menuCloseButton = document.querySelector('.menu-close-button');
    const mobileMenuContainer = document.querySelector('.mobile-menu-container');
    const mobileMenuList = document.querySelector('.mobile-menu-list');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (menuOpenButton && menuCloseButton && mobileMenuContainer && mobileMenuList && menuOverlay) {
        
        function openMenu() {
            mobileMenuContainer.classList.add('show');
            menuOverlay.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
            
            // Auto-abrir submenu de servicios siempre que se abra el menú móvil
            autoOpenServiciosSubmenu();
        }
        
        function closeMenu() {
            mobileMenuContainer.classList.remove('show');
            menuOverlay.classList.remove('show');
            document.body.style.overflow = ''; // Restaurar scroll del body
        }

        // Abrir el menú
        menuOpenButton.addEventListener('click', openMenu);

        // Cerrar el menú
        menuCloseButton.addEventListener('click', closeMenu);

        // Cerrar el menú al hacer click en el overlay
        menuOverlay.addEventListener('click', closeMenu);

        // Cerrar el menú al hacer click en un enlace
        const menuLinks = mobileMenuList.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Cerrar el menú al redimensionar la pantalla (si se vuelve a desktop)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });

        // Cerrar el menú con la tecla Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && mobileMenuContainer.classList.contains('show')) {
                closeMenu();
            }
        });
    }
    
    // Función para abrir automáticamente el submenu de servicios
    function autoOpenServiciosSubmenu() {
        const serviciosToggle = document.getElementById('servicios-toggle');
        const serviciosSubmenu = document.getElementById('servicios-submenu');
        
        if (serviciosToggle && serviciosSubmenu) {
            // Pequeño delay para que la animación del menú principal se vea primero
            setTimeout(() => {
                serviciosToggle.classList.add('active');
                serviciosSubmenu.classList.add('show');
            }, 700);
        }
    }

    // Funcionalidad del submenú
    const serviciosToggle = document.getElementById('servicios-toggle');
    const serviciosSubmenu = document.getElementById('servicios-submenu');

    if (serviciosToggle && serviciosSubmenu) {
        serviciosToggle.addEventListener('click', function(event) {
            event.stopPropagation(); // Evitar que se cierre el menú principal

            // Toggle del submenú
            serviciosToggle.classList.toggle('active');
            serviciosSubmenu.classList.toggle('show');
        });

        // Manejar clicks en enlaces del submenú
        const submenuLinks = serviciosSubmenu.querySelectorAll('a');
        submenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Cerrar el submenú y el menú principal cuando se hace click en un enlace del submenú
                serviciosToggle.classList.remove('active');
                serviciosSubmenu.classList.remove('show');
                // El menú principal se cerrará por el event listener ya existente
            });
        });
    }
});