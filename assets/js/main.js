document.addEventListener('DOMContentLoaded', () => {
    loadExperience();
    loadProjects();
    setupThemeToggle();
    setupModal();
});

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;

    const applyTheme = (theme) => {
        root.classList.remove('light', 'dark'); // Remove both to ensure clean state
        if (theme === 'light') {
            root.classList.add('light');
        } else {
            // 'dark' is the default if 'light' is not present
        }
        localStorage.setItem('theme', theme);
    };

    // Initial theme setup
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        applyTheme('light');
    } else {
        applyTheme('dark'); // Default to dark if no preference and system is not light
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = root.classList.contains('light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });
}

function loadExperience() {
    const list = document.getElementById('experience-list');
    if (!list) return;

    try {
        const items = JSON.parse(document.getElementById('experience-data').textContent);
        list.innerHTML = items.map(job => `
            <div class="experience-item">
                <h3>${job.title}</h3>
                <p><strong>${job.company}</strong> | ${job.dates}</p>
                <ul>
                    ${job.points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<p>Failed to load experience.</p>';
    }
}

function loadProjects() {
    const list = document.getElementById('project-list');
    if (!list) return;

    try {
        const projects = JSON.parse(document.getElementById('projects-data').textContent);
        list.innerHTML = projects.map((p, index) => `
            <div class="card" data-index="${index}">
                <h3>${p.title}</h3>
                <p>${p.summary}</p>
                <div class="tags">${p.stack.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<p>Failed to load projects.</p>';
    }
}

function setupModal() {
    const modal = document.getElementById('project-modal');
    const closeButton = document.querySelector('.close-button');

    document.getElementById('project-list').addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card) {
            const projects = JSON.parse(document.getElementById('projects-data').textContent);
            const project = projects[card.dataset.index];
            
            document.getElementById('modal-title').textContent = project.title;
            document.getElementById('modal-summary').textContent = project.summary;
            document.getElementById('modal-description').textContent = project.description;
            
            const stackContainer = document.getElementById('modal-stack');
            stackContainer.innerHTML = project.stack.map(tag => `<span class="tag">${tag}</span>`).join('');

            const linksContainer = document.getElementById('modal-links');
            linksContainer.innerHTML = Object.entries(project.links).map(([key, value]) => 
                `<a href="${value}" target="_blank">${key.charAt(0).toUpperCase() + key.slice(1)}</a>`
            ).join('');

            modal.style.display = 'block';
        }
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}