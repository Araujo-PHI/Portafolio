function renderProjectsByYear(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    if (projects.length === 0) {
        container.innerHTML = '<p class="loading-text">No hay proyectos para mostrar.</p>';
        return;
    }

    const grouped = {};
    projects.forEach(p => {
        if (!grouped[p.year]) grouped[p.year] = [];
        grouped[p.year].push(p);
    });

    const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    sortedYears.forEach(year => {
        const yearSection = document.createElement('section');
        yearSection.className = 'year-group';

        // Estructura: Línea corta - Título - Línea larga
        const headerRow = document.createElement('div');
        headerRow.className = 'section-header-row';

        const lineShort = document.createElement('div');
        lineShort.className = 'section-line-short';

        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = `Proyectos ${year}`;

        const lineLong = document.createElement('div');
        lineLong.className = 'section-line-long';

        headerRow.appendChild(lineShort);
        headerRow.appendChild(title);
        headerRow.appendChild(lineLong);
        yearSection.appendChild(headerRow);

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
