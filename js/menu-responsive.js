// Menu Responsive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const menuOpenButton = document.getElementById('menu-open');
    const menuCloseButton = document.getElementById('menu-close');
    const mobileMenuContainer = document.getElementById('mobile-menu-container');
    const mobileMenuList = document.getElementById('mobile-menu-list');
    const menuOverlay = document.getElementById('menu-overlay');
    
    if (menuOpenButton && menuCloseButton && mobileMenuContainer && mobileMenuList && menuOverlay) {
        
        function openMenu() {
            mobileMenuContainer.classList.add('show');
            menuOverlay.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
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
});