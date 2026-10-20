document.addEventListener("DOMContentLoaded", () => {
    const projectsContainer = document.getElementById("projects-container");

    if (!projectsContainer) {
        return;
    }

    fetch("proyectos/config.txt")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No se pudo cargar proyectos/config.txt");
            }
            return response.text();
        })
        .then((text) => parseProjectsConfig(text))
        .then((projects) => renderProjects(projects, projectsContainer))
        .catch((error) => {
            console.error("Error al cargar proyectos:", error);
            projectsContainer.innerHTML = '<div class="empty-state">No hay proyectos disponibles.</div>';
        });
});

function parseProjectsConfig(text) {
    const projects = [];
    const projectBlocks = [...text.matchAll(/archivo\s*=\s*([^\s{]+)\s*\{([\s\S]*?)\}/g)];

    projectBlocks.forEach(([, archivo, block]) => {
        const getValue = (key) => {
            const simpleMatch = block.match(new RegExp(`${key}\\s*=\\s*["']([^"']*)["']`, "i"));
            if (simpleMatch) {
                return simpleMatch[1].trim();
            }

            const booleanMatch = block.match(new RegExp(`${key}\\s*=\\s*(true|false)`, "i"));
            if (booleanMatch) {
                return booleanMatch[1].toLowerCase() === "true";
            }

            return "";
        };

        const titulo = getValue("titulo");
        const descripcion = getValue("descripcion");
        const fecha = getValue("fecha");
        const descargable = getValue("descargable");

        if (!titulo) {
            return;
        }

        projects.push({
            archivo: archivo.trim(),
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            fecha: fecha.trim(),
            descargable: Boolean(descargable)
        });
    });

    return projects;
}

function renderProjects(projects, container) {
    if (!projects.length) {
        container.innerHTML = '<div class="empty-state">No hay proyectos disponibles.</div>';
        return;
    }

    container.innerHTML = projects
        .map((project) => {
            const action = project.descargable
                ? `<a class="project-download" href="${project.archivo}" download title="Descargar ${project.titulo}"><i class="fa-solid fa-download"></i> Descargar</a>`
                : '<span class="project-disabled">No descargable</span>';

            return `
                <article class="project-card">
                    <div class="project-content">
                        <div class="item-left">
                            <div>
                                <h3>${project.titulo}</h3>
                                <p class="item-sub">${project.fecha}</p>
                                <p class="item-desc">${project.descripcion}</p>
                            </div>
                        </div>
                        <div class="project-links">
                            ${action}
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");
}
