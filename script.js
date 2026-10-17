document.addEventListener('DOMContentLoaded', () => {

    // 1. Bloqueo de clic derecho para evitar inspeccionar / copiar
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2. Bloqueo de atajos de teclado de copia/guardado (Ctrl+C, Ctrl+U, Ctrl+S)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && ['c', 'u', 's', 'a', 'p'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    });

    // 3. Cargar proyectos desde "proyectos/config.txt" (según la carpeta de tu captura)
    fetch('proyectos/config.txt')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo encontrar proyectos/config.txt');
            return response.text();
        })
        .then(data => {
            const projects = parseConfig(data);
            renderProjects(projects);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('projects-container').innerHTML = 
                `<p style="color: #ff5555;">Error al cargar los proyectos. Revisa que el archivo <code>proyectos/config.txt</code> exista.</p>`;
        });
});

// Función para parsear el formato en el archivo config.txt
function parseConfig(text) {
    const projects = [];
    const blocks = text.split(/archivo\s*=\s*/g).filter(b => b.trim() !== '');

    blocks.forEach(block => {
        const filePathMatch = block.match(/^([^{\s]+)/);
        if (!filePathMatch) return;

        const file = filePathMatch[1].trim();

        const getProp = (propName) => {
            const regex = new RegExp(`${propName}\\s*=\\s*["']?([^"'\n}]+)["']?`, 'i');
            const match = block.match(regex);
            return match ? match[1].trim() : '';
        };

        const titulo = getProp('titulo') || 'Proyecto Sin Título';
        const descripcion = getProp('descripcion') || 'Sin descripción disponible.';
        const fecha = getProp('fecha') || '2026';
        const descargable = getProp('descargable').toLowerCase() === 'true';
        const abrirHTML = getProp('abrirHTML').toLowerCase() === 'true';

        projects.push({ file, titulo, descripcion, fecha, descargable, abrirHTML });
    });

    return projects;
}

// Función para renderizar las tarjetas de los proyectos
function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    if (projects.length === 0) {
        container.innerHTML = '<p>No se encontraron proyectos configurados.</p>';
        return;
    }

    projects.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'project-card';

        card.innerHTML = `
            <div class="preview-container">
                <iframe src="${proj.file}" class="preview-iframe" loading="lazy" tabindex="-1"></iframe>
            </div>
            <div class="project-details">
                <span class="project-date">${proj.fecha}</span>
                <h3 class="project-title">${proj.titulo}</h3>
                <p class="project-desc">${proj.descripcion}</p>
                <div class="project-actions">
                    ${proj.abrirHTML 
                        ? `<button class="btn btn-open" onclick="openModal('${proj.file}', '${encodeURIComponent(proj.titulo)}',${proj.descargable})">Ver Proyecto</button>` 
                        : ''}
                    ${proj.descargable 
                        ? `<a href="${proj.file}" download class="btn btn-download-icon" title="Descargar HTML">⬇</a>` 
                        : ''}
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Funciones para el Modal (Vista completa del archivo HTML)
function openModal(filePath, title, isDownloadable) {
    const modal = document.getElementById('project-modal');
    const iframe = document.getElementById('modal-iframe');
    const titleElem = document.getElementById('modal-title');
    const downloadBtn = document.getElementById('modal-download-btn');

    iframe.src = filePath;
    titleElem.textContent = decodeURIComponent(title);

    if (isDownloadable) {
        downloadBtn.style.display = 'inline-block';
        downloadBtn.href = filePath;
    } else {
        downloadBtn.style.display = 'none';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    const iframe = document.getElementById('modal-iframe');
    iframe.src = '';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restaura el scroll
}

document.getElementById('modal-close-btn').addEventListener('click', closeModal);
