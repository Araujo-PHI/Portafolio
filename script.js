// script.js - Funcionalidad interactiva básica y logs de bienvenida

document.addEventListener("DOMContentLoaded", () => {
    console.log("Perfil cargado correctamente.");

    // Ejemplo de interactividad: animación sutil al hacer clic en las tarjetas de proyectos
    const projectCards = document.querySelectorAll(".project-card");
    
    projectCards.forEach(card => {
        card.addEventListener("click", (e) => {
            // Evitar que se active si hacen clic directamente en los enlaces externos
            if (e.target.closest("a")) return;
            
            console.log("Tarjeta de proyecto clickeada:", card.querySelector("h3").innerText);
        });
    });

    // Efecto interactivo opcional para copiar el correo al portapapeles al hacer clic
    const emailButtons = document.querySelectorAll("a[href^='mailto:']");
    
    emailButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Opcional: si prefieres que abra el cliente de correo por defecto, comenta esta línea.
            // e.preventDefault();
            // navigator.clipboard.writeText("email@email.com");
            // alert("¡Correo copiado al portapapeles!");
        });
    });
});
