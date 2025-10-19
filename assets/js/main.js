console.log('🚀 JavaScript file loaded at:', new Date().toLocaleTimeString());

document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM Content Loaded - initializing app...');
    initializeApp();
});

async function initializeApp() {
    console.log('🎯 initializeApp() called - starting initialization...');

    testFunctionCall();

    // Wait for all data to load first
    await loadAllData();
    console.log('📊 All data loaded, now initializing components...');

    loadExperience();
    loadProjects();
    loadPersonalInfo();
    loadSkills();
    loadEducation();
    loadPublications();
    loadNavigation();
    loadFooter();
    loadErrorPage();
    setupThemeToggle();
    setupModal();
    setupNavigation();
    setupMobileMenu();
    setupProjectFiltering();
    setupSmoothScrolling();
    setupIntersectionObserver();
    optimizeImages();

    console.log('✅ initializeApp() completed');
}

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;

    const applyTheme = (theme) => {
        root.classList.remove('light', 'dark');
        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.add('dark');
        }
        localStorage.setItem('theme', theme);
        updateThemeButton(theme);
    };

    const updateThemeButton = (theme) => {
        themeToggle.textContent = theme === 'light' ? '🌙' : '🌞';
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
    };

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = root.classList.contains('light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });
}

// Navigation functionality
function setupNavigation() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add/remove header shadow
        if (currentScrollY > 10) {
            header.style.boxShadow = 'var(--shadow)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScrollY = currentScrollY;
        updateActiveLink();
    });
}

// Active link highlighting
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (mobileToggle && navList) {
        mobileToggle.addEventListener('click', () => {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            
            mobileToggle.setAttribute('aria-expanded', !isExpanded);
            navList.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = mobileToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navList.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });

        // Close menu when clicking on links
        navList.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                mobileToggle.setAttribute('aria-expanded', 'false');
                navList.classList.remove('active');
                
                const spans = mobileToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            }
        });
    }
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Project filtering
function setupProjectFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Intersection Observer for animations
function setupIntersectionObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, options);

    // Function to observe elements
    const observeElements = () => {
        document.querySelectorAll('.project-card, .skill-card, .experience-item').forEach(el => {
            // Only set initial styles if not already visible
            if (el.style.opacity !== '1') {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            }
        });
    };

    // Initial observation
    observeElements();

    // Re-observe after a delay to catch dynamically loaded content
    setTimeout(observeElements, 100);
    setTimeout(observeElements, 500);
    setTimeout(observeElements, 1000);
}

// Image optimization and lazy loading
function optimizeImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Load experience data
function loadExperience() {
    const list = document.getElementById('experience-list');
    if (!list) return;

    // Check if data is loaded
    if (!window.experienceData) {
        console.warn('Experience data not loaded yet');
        return;
    }

    try {
        const items = window.experienceData;
        list.innerHTML = items.map(job => `
            <div class="experience-item">
                <h3>${job.title}</h3>
                <p><strong>${job.company}</strong> • ${job.location} • ${job.dates}</p>
                <ul>
                    ${job.points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    } catch (e) {
        console.error('Failed to load experience:', e);
        list.innerHTML = '<p>Failed to load experience data.</p>';
    }
}

// Initialize experience when data is loaded
function initializeExperience() {
    loadExperience();
}

function testFunctionCall() {
    console.log('🧪 testFunctionCall() called - JavaScript is working!');
}

// Load all JSON data files
async function loadAllData() {
    console.log('🔄 loadAllData() called');
    try {
        console.log('Starting to load configuration...');
        const response = await fetch('assets/data/config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const configText = await response.text();
        console.log('Config response received, length:', configText.length);

        const config = JSON.parse(configText);
        console.log('Config parsed successfully:', Object.keys(config.dataFiles));

        // Load all data files in parallel
        const promises = Object.entries(config.dataFiles).map(async ([key, path]) => {
            try {
                console.log(`Loading ${key} from ${path}...`);
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${path}`);
                }
                const data = await response.json();
                window[key + 'Data'] = data;
                console.log(`Loaded ${key} data successfully, ${Object.keys(data).length} keys`);
                return data;
            } catch (error) {
                console.error(`Failed to load ${key} data from ${path}:`, error);
                return null;
            }
        });

        await Promise.all(promises);
        console.log('All data loading promises completed');

        // Verify data was loaded
        console.log('Checking loaded data:');
        console.log('- skillsData:', window.skillsData ? 'loaded' : 'missing');
        console.log('- educationData:', window.educationData ? 'loaded' : 'missing');
        console.log('- publicationsData:', window.publicationsData ? 'loaded' : 'missing');

    } catch (error) {
        console.error('Failed to load configuration:', error);
    }
}

// Load personal information
function loadPersonalInfo() {
    if (!window.personalData) return;

    const heroSection = document.querySelector('.hero-content');
    if (heroSection) {
        const personal = window.personalData;
        const nameElement = heroSection.querySelector('h1');
        const subtitleElement = heroSection.querySelector('.hero-subtitle');
        const ctaButton = heroSection.querySelector('.cta-button');

        if (nameElement) nameElement.textContent = personal.name;
        if (subtitleElement) subtitleElement.textContent = personal.subtitle;
        if (ctaButton) {
            ctaButton.textContent = personal.ctaButton.text;
            ctaButton.setAttribute('aria-label', personal.ctaButton.ariaLabel);
        }
    }

    const aboutSection = document.querySelector('#about');
    if (aboutSection && window.personalData.bio) {
        const bio = window.personalData.bio;
        const container = aboutSection;

        // Clear existing paragraphs inside About section (only direct <p> children)
        Array.from(container.children).forEach(child => {
            if (child.tagName === 'P') child.remove();
        });

        const paragraphs = Array.isArray(bio.paragraphs) && bio.paragraphs.length > 0
            ? bio.paragraphs
            : (bio.detailed ? [bio.detailed] : []);

        paragraphs.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            container.appendChild(p);
        });
    }
}

// Load skills
function loadSkills() {
    console.log('=== LOADING SKILLS ===');
    const skillsSection = document.querySelector('.skills-grid');
    console.log('Skills section element found:', !!skillsSection);
    console.log('Skills section HTML:', skillsSection ? skillsSection.outerHTML.substring(0, 100) + '...' : 'NOT FOUND');
    console.log('Skills data available:', window.skillsData);

    if (!skillsSection) {
        console.error('Skills section element not found!');
        return;
    }

    if (!window.skillsData) {
        console.error('Skills data not available!');
        return;
    }

    try {
        const skills = window.skillsData;
        console.log('Skills data structure:', skills);
        console.log('Number of categories:', skills.categories.length);

        const html = skills.categories.map(category => `
            <div class="skill-card">
                <h3>${category.title}</h3>
                <p>${category.skills.join(', ')}</p>
            </div>
        `).join('');

        console.log('Generated HTML length:', html.length);
        skillsSection.innerHTML = html;

        // Ensure elements are visible
        const skillCards = skillsSection.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });

        console.log('Skills loaded successfully, elements visible:', skillCards.length);
    } catch (e) {
        console.error('Failed to load skills:', e);
    }
}

// Load education
function loadEducation() {
  const listRoot = document.getElementById('education-list');
  if (!listRoot || !window.educationData) return;

  const entries = window.educationData.education || [];
  const fragment = document.createDocumentFragment();

  entries.forEach((edu, index) => {
    const isCurrent = /present/i.test(edu.to) || /current/i.test(edu.status || '');
    const range = `${edu.from} – ${isCurrent ? 'Present' : edu.to}`;
    const article = document.createElement('article');
    article.className = 'edu-card';
    article.setAttribute('role','listitem');
    article.setAttribute('tabindex','0');
    article.setAttribute('aria-label', `${edu.institution}, ${edu.degree}, ${range}${isCurrent ? ' (In Progress)' : ''}`);

    article.innerHTML = `
      <div class="edu-card__left">
        <div class="edu-card__school">${edu.institution}</div>
        <div class="edu-card__degree">${edu.degree}</div>
      </div>
      <div class="edu-card__right">
        <span class="edu-card__range">${range}</span>
        ${edu.grade ? `<span class="edu-card__grade" aria-label="Grade ${edu.grade}">${edu.grade}</span>` : ''}
        ${edu.achievement ? `<span class="edu-card__note" aria-label="Achievement ${edu.achievement}">${edu.achievement}</span>` : ''}
        ${isCurrent ? '<span class="edu-card__note" aria-label="Status In Progress">In Progress</span>' : ''}
      </div>`;

    fragment.appendChild(article);
  });

  listRoot.innerHTML = '';
  listRoot.appendChild(fragment);
}

// Load publications
function loadPublications() {
    console.log('=== LOADING PUBLICATIONS ===');
    const publicationsSection = document.querySelector('#publications ul');
    console.log('Publications section element found:', !!publicationsSection);
    console.log('Publications section HTML:', publicationsSection ? publicationsSection.outerHTML.substring(0, 100) + '...' : 'NOT FOUND');
    console.log('Publications data available:', window.publicationsData);

    if (!publicationsSection) {
        console.error('Publications section element not found!');
        return;
    }

    if (!window.publicationsData) {
        console.error('Publications data not available!');
        return;
    }

    try {
        const publications = window.publicationsData;
        console.log('Publications data structure:', publications);
        console.log('Number of publications:', publications.publications.length);

        const html = publications.publications.map(pub => `
            <li>
                <strong>${pub.title}</strong> — ${pub.conference} ${pub.year}
                <a class="link" href="${pub.url}" target="_blank" rel="noopener">Read Paper</a>
            </li>
        `).join('');

        console.log('Generated HTML length:', html.length);
        publicationsSection.innerHTML = html;

        // Ensure elements are visible
        const pubItems = publicationsSection.querySelectorAll('li');
        pubItems.forEach(item => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        });

        console.log('Publications loaded successfully, elements visible:', pubItems.length);
    } catch (e) {
        console.error('Failed to load publications:', e);
    }
}

// Load navigation
function loadNavigation() {
    const navList = document.querySelector('.nav-list');
    if (!navList || !window.navigationData) return;

    try {
        const navigation = window.navigationData;
        navList.innerHTML = navigation.menu.map(item => `
            <li role="menuitem">
                <a href="${item.url}" ${item.download ? 'download' : ''} ${/^https?:\/\//.test(item.url) ? 'target="_blank" rel="noopener"' : ''}>${item.title}</a>
            </li>
        `).join('');
        
        // Load project filters
        const filtersContainer = document.querySelector('.project-filters');
        if (filtersContainer) {
            filtersContainer.innerHTML = navigation.projectFilters.map(filter => `
                <button class="filter-btn ${filter.active ? 'active' : ''}" data-filter="${filter.id}">
                    ${filter.title}
                </button>
            `).join('');
        }
    } catch (e) {
        console.error('Failed to load navigation:', e);
    }
}

// Load footer
function loadFooter() {
    const footer = document.querySelector('.footer p');
    if (!footer || !window.footerData) return;

    try {
        const footerData = window.footerData;
        const year = new Date().getFullYear();
        const copyrightYear = footerData.copyright.year || year;
        footer.innerHTML = `&copy; ${copyrightYear} ${footerData.copyright.text} | <a href="${footerData.links[0].url}">${footerData.links[0].text}</a>`;
    } catch (e) {
        console.error('Failed to load footer:', e);
    }

    // Load project page footer if it exists
    const projectFooter = document.querySelector('.site-footer .container .footer-grid div p.muted');
    if (projectFooter && footerData.projectFooter) {
        projectFooter.textContent = footerData.projectFooter.tagline;
        const nameElement = projectFooter.previousElementSibling || projectFooter.parentNode.querySelector('strong');
        if (nameElement) {
            nameElement.textContent = footerData.projectFooter.name;
        }
    }
}

// Load error page content
function loadErrorPage() {
    if (!window.errorData) return;

    try {
        const errorData = window.errorData;
        const iconElement = document.getElementById('error-icon');
        const titleElement = document.getElementById('error-title');
        const messageElement = document.getElementById('error-message');
        const actionElement = document.getElementById('error-action');

        if (iconElement) iconElement.textContent = errorData[404].icon;
        if (titleElement) titleElement.textContent = errorData[404].title;
        if (messageElement) messageElement.textContent = errorData[404].message;
        if (actionElement) {
            actionElement.textContent = errorData[404].action.text;
            actionElement.href = errorData[404].action.url;
        }
    } catch (e) {
        console.error('Failed to load error page content:', e);
    }
}

// Load and render projects
function loadProjects() {
    const list = document.getElementById('project-list');
    if (!list) return;

    // Check if data is loaded
    if (!window.projectsData) {
        console.warn('Projects data not loaded yet');
        return;
    }

    try {
        const projects = window.projectsData;
        list.innerHTML = projects.map((project, index) => `
            <div class="project-card" data-index="${index}" data-category="${project.category}">
                <div class="project-thumbnail" data-project="${project.slug}"></div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.summary}</p>

                    <div class="project-tags">
                        ${project.stack.map(tech => `<span class="tag">${tech}</span>`).join('')}
                    </div>

                    ${Object.keys(project.links).length > 0 ? `
                        <div class="actions">
                            ${Object.entries(project.links).map(([key, value]) =>
                                `<a href="${value}" target="_blank" rel="noopener" aria-label="View ${project.title} ${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</a>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Failed to load projects:', e);
        list.innerHTML = '<p>Failed to load project data.</p>';
    }
}

// Initialize projects when data is loaded
function initializeProjects() {
    loadProjects();
}

// Modal functionality
function setupModal() {
    const modal = document.getElementById('project-modal');
    const closeButton = document.querySelector('.close-button');

    // Open modal when clicking project cards
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (card) {
            try {
                // Check if data is loaded
                if (!window.projectsData) {
                    console.warn('Projects data not loaded yet');
                    return;
                }

                const projects = window.projectsData;
                const project = projects[card.dataset.index];

                document.getElementById('modal-title').textContent = project.title;
                document.getElementById('modal-summary').textContent = project.summary;
                document.getElementById('modal-description').textContent = project.description || project.summary;

                const stackContainer = document.getElementById('modal-stack');
                if (stackContainer) {
                    stackContainer.innerHTML = project.stack.map(tag => `<span class="tag">${tag}</span>`).join('');
                }

                const linksContainer = document.getElementById('modal-links');
                if (linksContainer) {
                    linksContainer.innerHTML = Object.entries(project.links || {}).map(([key, value]) =>
                        `<a href="${value}" target="_blank" rel="noopener">${key.charAt(0).toUpperCase() + key.slice(1)}</a>`
                    ).join('');
                }

                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
                closeButton.focus();
            } catch (e) {
                console.error('Failed to open project modal:', e);
            }
        }
    });

    // Close modal functionality
    const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    };

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Performance monitoring
function setupPerformanceMonitoring() {
    // Log Web Vitals if available
    if ('web-vital' in window) {
        web-vital.getCLS(console.log);
        web-vital.getFID(console.log);
        web-vital.getFCP(console.log);
        web-vital.getLCP(console.log);
        web-vital.getTTFB(console.log);
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
`;
document.head.appendChild(style);