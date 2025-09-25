// scroll-menu.js
// Scroll suave para el menú superior

document.addEventListener("DOMContentLoaded", function () {
  var menuLinks = document.querySelectorAll('.menu-superior a[href^="#"]');
  menuLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = link.getAttribute("href").replace("#", "");
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        var offset =
          target.getBoundingClientRect().top + window.pageYOffset - 48; // 48px altura menú
        window.scrollTo({
          top: offset,
          behavior: "smooth",
        });
      }
    });
  });
});
