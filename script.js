document.addEventListener('DOMContentLoaded', () => {

    // 1. Bloqueo de clic derecho
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2. Bloqueo de atajos de teclado de copia/guardado
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && ['c', 'u', 's', 'a', 'p'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    });

    // 3. Cargar proyectos desde "proyectos/config.txt"
    fetch('proyectos/config.txt')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo encontrar proyectos/config.txt');
            return response.text();
        })
        .then(data => {
            const projects = parseConfig(data);
            renderProjectsByYear(projects);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('projects-container').innerHTML = 
                `<p style="color: #ef4444; margin-top: 30px;">Error al cargar los proyectos. Revisa que el archivo <code>proyectos/config.txt</code> exista.</p>`;
        });
});

// Parsea la estructura de config.txt
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
        const fecha = getProp('fecha') || '01/01/2026';
        const descargable = getProp('descargable').toLowerCase() === 'true';
        const abrirHTML = getProp('abrirHTML').toLowerCase() === 'true';

        // Extraer año de la fecha (ej: "15/10/2026" -> "2026")
        const yearMatch = fecha.match(/\d{4}/);
        const year = yearMatch ? yearMatch[0] : 'Otros';

        projects.push({ file, titulo, descripcion, fecha, year, descargable, abrirHTML });
    });

    return projects;
}

// Renderiza proyectos agrupados por Año (Ej: Proyectos 2026, Proyectos 2025)
function renderProjectsByYear(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    if (projects.length === 0) {
        container.innerHTML = '<p class="loading-text">No hay proyectos para mostrar.</p>';
        return;
    }

    // Agrupar por año
    const grouped = {};
    projects.forEach(p => {
        if (!grouped[p.year]) grouped[p.year] = [];
        grouped[p.year].push(p);
    });

    // Ordenar años de forma descendente (2026, 2025...)
    const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    sortedYears.forEach(year => {
        const yearSection = document.createElement('section');
        yearSection.className = 'year-group';

        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = `Proyectos ${year}`;
        yearSection.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'projects-grid';

        grouped[year].forEach(proj => {
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
            grid.appendChild(card);
        });

        yearSection.appendChild(grid);
        container.appendChild(yearSection);
    });
}

// Control de Modal / Vista Completa
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
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    const iframe = document.getElementById('modal-iframe');
    iframe.src = '';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.getElementById('modal-close-btn').addEventListener('click', closeModal);
