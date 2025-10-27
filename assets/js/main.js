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
    // setupProjectFiltering() is called from generateFilterButtons() after projects load
    setupSmoothScrolling();
    setupDemoLinkScrollToTop();
    setupIntersectionObserver();
    optimizeImages();

        // Initialize RAG panel (non-blocking)
        initializeRag();
        setupRagModal();

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

// Intercept "Demo" links to scroll to top when they point to this site
function setupDemoLinkScrollToTop() {
    // Use capture to run before project-card click handler
    document.addEventListener('click', (e) => {
        const anchor = e.target && e.target.closest && e.target.closest('a');
        if (!anchor) return;

        const label = (anchor.textContent || '').trim().toLowerCase();
        if (label !== 'demo') return;

        const href = anchor.getAttribute('href') || '';
        try {
            const url = new URL(href, window.location.href);
            const isSameOrigin = url.origin === window.location.origin;
            const isOwnDomainAlias = /(^|\.)is-a\.dev$/i.test(url.hostname) && /rahul-krishnan/i.test(url.hostname);

            if (isSameOrigin || isOwnDomainAlias) {
                e.preventDefault();
                e.stopPropagation();

                // Close project modal if open
                const modal = document.getElementById('project-modal');
                if (modal && modal.style.display === 'block') {
                    modal.style.display = 'none';
                    modal.setAttribute('aria-hidden', 'true');
                }

                // Prefer hero section if available, else scroll to very top
                const header = document.querySelector('.header');
                const hero = document.getElementById('hero');
                if (hero) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetTop = Math.max(0, hero.offsetTop - headerHeight - 20);
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        } catch (_) {
            // If URL parsing fails, do nothing
        }
    }, true);
}

// Project filtering
function setupProjectFiltering() {
    // Remove existing event listeners to prevent duplicates
    const existingButtons = document.querySelectorAll('.filter-btn');
    existingButtons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });

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
        
        // Project filters are now dynamically generated from projects.json
        // See generateFilterButtons() function
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

        // Generate filter buttons after projects are loaded
        console.log('🎯 About to generate filter buttons...');
        generateFilterButtons();
    } catch (e) {
        console.error('Failed to load projects:', e);
        list.innerHTML = '<p>Failed to load project data.</p>';
    }
}

function generateFilterButtons() {
    console.log('🔍 generateFilterButtons called');
    const filterContainer = document.getElementById('project-filters');
    if (!filterContainer) {
        console.error('❌ Filter container not found');
        return;
    }
    if (!window.projectsData) {
        console.error('❌ Projects data not loaded');
        return;
    }

    // Get unique categories from projects
    const categories = [...new Set(window.projectsData.map(project => project.category))];
    console.log('📊 Found categories:', categories);
    
    // Create category display mapping
    const categoryDisplayNames = {
        'ml': 'ML',
        'nlp': 'NLP', 
        'recommender': 'Recommender',
        'recommender systems': 'Recommender Systems',
        'computer vision': 'Computer Vision',
        'deployment': 'Deployment',
        'ai': 'AI',
        'data-science': 'Data Science',
        'web': 'Web',
        'mobile': 'Mobile'
    };

    // Generate filter buttons
    const filterButtons = [
        '<button class="filter-btn active" data-filter="all">All</button>',
        ...categories.map(category => {
            // Use lowercase for lookup
            const displayName = categoryDisplayNames[category.toLowerCase()] || category;
            return `<button class="filter-btn" data-filter="${category}">${displayName}</button>`;
        })
    ].join('');

    console.log('🎯 Generated filter buttons:', filterButtons);
    filterContainer.innerHTML = filterButtons;
    console.log('✅ Filter buttons inserted into DOM');

    // Re-setup filtering with new buttons
    setupProjectFiltering();
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
                const modalSummary = document.getElementById('modal-summary');
                const modalDescription = document.getElementById('modal-description');
                const descriptionText = project.description || '';
                modalSummary.textContent = project.summary || '';
                // Show description only if it exists and is not a duplicate of summary
                if (descriptionText && descriptionText.trim() !== (project.summary || '').trim()) {
                    modalDescription.textContent = descriptionText;
                    modalDescription.style.display = '';
                } else {
                    modalDescription.textContent = '';
                    modalDescription.style.display = 'none';
                }

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

                // Render highlights
                const highlightsWrap = document.getElementById('modal-highlights-container');
                const highlightsList = document.getElementById('modal-highlights');
                if (highlightsWrap && highlightsList) {
                    if (Array.isArray(project.highlights) && project.highlights.length) {
                        highlightsList.innerHTML = '';
                        project.highlights.forEach(text => {
                            const li = document.createElement('li');
                            li.textContent = text;
                            highlightsList.appendChild(li);
                        });
                        highlightsWrap.hidden = false;
                    } else {
                        highlightsWrap.hidden = true;
                        highlightsList.innerHTML = '';
                    }
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

// =============================
// RAG Integration
// =============================
function initializeRag() {
    try {
        if (window.__ragInitialized) return; // idempotent guard
        const pane = document.getElementById('rag-pane');
        if (!pane) return; // Not on this page
        window.__ragInitialized = true;

        const loadingEl = pane.querySelector('.rag-loading');
        const bgTitleEl = pane.querySelector('.rag-bg-title');
        const outputEl = pane.querySelector('#rag-output');
        const formEl = pane.querySelector('#rag-form');
        const inputEl = pane.querySelector('#rag-input');
        const sendBtn = pane.querySelector('#rag-send');

        const QUERY_URL = 'https://resume-rag-system-312008307798.europe-west1.run.app/query';

        // Immediately reveal UI without any health checks
        if (loadingEl) loadingEl.style.display = 'none';
        if (formEl) formEl.hidden = false;
        if (bgTitleEl) bgTitleEl.hidden = false;

        // Ensure thinking state is hidden until a submission occurs
        const thinkingEl = pane.querySelector('#rag-thinking');
        if (thinkingEl) {
            thinkingEl.hidden = true;
            thinkingEl.style.display = 'none';
        }

        if (inputEl) inputEl.focus();

        // Prepare a one-time cold-start note (shown only on first submit)
        let ragNoteEl = pane.querySelector('.rag-note');
        if (!ragNoteEl) {
            ragNoteEl = document.createElement('div');
            ragNoteEl.className = 'rag-note';
            ragNoteEl.hidden = true;
            if (formEl) {
                formEl.insertAdjacentElement('afterend', ragNoteEl);
            }
        }

        // Submit handler with enhanced animations
        if (formEl && inputEl && outputEl && sendBtn) {
            formEl.addEventListener('submit', async (e) => {
                e.preventDefault();
                const query = (inputEl.value || '').trim();
                if (!query) {
                    inputEl.focus();
                    return;
                }

                // Hide background title after first interaction
                if (bgTitleEl) bgTitleEl.hidden = true;

                // Disable controls while sending
                inputEl.disabled = true;
                sendBtn.disabled = true;
                const originalBtnText = sendBtn.textContent;
                sendBtn.textContent = 'Sending…';

                // Show a one-time cold-start note for the first request this session
                if (sessionStorage.getItem('ragColdStartShown') !== '1') {
                    if (ragNoteEl) {
                        ragNoteEl.textContent = 'Note: First request may take a few seconds while the API cold starts.';
                        ragNoteEl.hidden = false;
                    }
                }

                // Start enhanced thinking states and pipeline animation (in parallel)
                showEnhancedThinkingStates(pane); // Remove await - let it run in parallel

                try {
                    const resp = await requestWithTimeout(QUERY_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query, top_k: 5 })
                    }, 20000);

                    if (!resp.ok) {
                        throw new Error(`HTTP ${resp.status}`);
                    }
                    const data = await resp.json().catch(() => ({}));
                    const answer = data && (data.answer || data.result || '');
                    
                    // Immediately hide thinking states before rendering answer
                    hideEnhancedThinkingStates(pane, true);
                    resetPipelineAnimation(pane);

                    // Show answer with reveal animation
                    await revealAnswer(outputEl, answer || 'No answer returned.');
                } catch (err) {
                    console.error('RAG query failed:', err);
                    // Hide thinking states before rendering error message
                    hideEnhancedThinkingStates(pane, true);
                    resetPipelineAnimation(pane);
                    await revealAnswer(outputEl, 'Something went wrong while fetching the answer. Please try again.');
                } finally {
                    // Ensure controls are re-enabled
                    inputEl.disabled = false;
                    sendBtn.disabled = false;
                    sendBtn.textContent = originalBtnText;
                    inputEl.value = ''; // Clear the input box
                    
                    // Mark the cold-start note as shown and hide it
                    try { sessionStorage.setItem('ragColdStartShown', '1'); } catch (_) {}
                    if (ragNoteEl) ragNoteEl.hidden = true;

                    // Keep background title hidden since we now have a response
                    if (bgTitleEl) {
                        bgTitleEl.hidden = true;
                    }
                    
                    inputEl.focus();
                }
            });

            // Esc to clear and reset
            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    inputEl.value = '';
                    // Reset to initial state
                    if (outputEl) {
                        outputEl.textContent = '';
                        outputEl.style.opacity = '0';
                    }
                    if (bgTitleEl) {
                        bgTitleEl.hidden = false; // Show "Ask anything about Rahul" again
                    }
                }
            });
        }
    } catch (e) {
        console.error('initializeRag failed:', e);
    }
}

async function pollRagHealth(url) {
    const maxAttempts = 8; // ~ up to ~2m with backoff
    let delay = 2000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const resp = await requestWithTimeout(url, { method: 'GET' }, 12000);
            if (resp.ok) {
                const data = await resp.json().catch(() => ({}));
                if (data && (data.status === 'ok' || data.status === 'OK')) {
                    return true;
                }
            }
        } catch (e) {
            // ignore and retry
        }
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * 2, 10000);
    }
    return false;
}

function requestWithTimeout(resource, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const { signal: _ignored, ...rest } = options || {};
    const timerId = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(resource, { ...rest, signal: controller.signal })
        .finally(() => clearTimeout(timerId))
        .catch((err) => {
            if (err && err.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw err;
        });
}

// =============================
// Enhanced RAG Animation Functions
// =============================

async function showEnhancedThinkingStates(pane) {
    const thinkingEl = pane.querySelector('#rag-thinking');
    const pipelineEl = pane.querySelector('.rag-pipeline');
    const bgTitleEl = pane.querySelector('.rag-bg-title');

    // Proceed even if pipeline UI is not present
    if (!thinkingEl) return;

    // Ensure the helper title is hidden during processing
    if (bgTitleEl) bgTitleEl.hidden = true;

    // Show thinking states (robust toggle)
    thinkingEl.hidden = false;
    thinkingEl.style.display = 'flex';
    thinkingEl.style.opacity = '0';
    thinkingEl.style.transform = 'translateY(10px)';

    // Animate in
    requestAnimationFrame(() => {
        thinkingEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        thinkingEl.style.opacity = '1';
        thinkingEl.style.transform = 'translateY(0)';
    });

    // Start pipeline animation if present
    if (pipelineEl) startPipelineAnimation(pipelineEl);
    
    // Stage 1: Retrieval (1.5s)
    const retrievalStage = thinkingEl.querySelector('#thinking-retrieval');
    if (retrievalStage) {
        retrievalStage.classList.add('active');
        if (pipelineEl) activatePipelineNode(pipelineEl, 'retrieval');
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Stage 2: Generation — keep highlighted until response completes
    if (retrievalStage) retrievalStage.classList.remove('active');
    const generationStage = thinkingEl.querySelector('#thinking-generation');
    if (generationStage) {
        generationStage.classList.add('active');
        if (pipelineEl) activatePipelineNode(pipelineEl, 'llm');
    }
    // Do not auto-clear the generation highlight here; it will be cleared
    // when hideEnhancedThinkingStates() is called after the response arrives.
}

function hideEnhancedThinkingStates(pane, immediate = false) {
    const thinkingEl = pane.querySelector('#rag-thinking');
    if (!thinkingEl) return;
    
    if (immediate) {
        thinkingEl.hidden = true;
        thinkingEl.style.display = 'none';
        thinkingEl.style.opacity = '0';
        thinkingEl.style.transform = 'translateY(0)';
        const stages = thinkingEl.querySelectorAll('.thinking-stage');
        stages.forEach(stage => stage.classList.remove('active'));
        return;
    }

    thinkingEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    thinkingEl.style.opacity = '0';
    thinkingEl.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        thinkingEl.hidden = true;
        thinkingEl.style.display = 'none';
        // Reset all stages
        const stages = thinkingEl.querySelectorAll('.thinking-stage');
        stages.forEach(stage => stage.classList.remove('active'));
    }, 300);
}

function startPipelineAnimation(pipelineEl) {
    if (!pipelineEl) return;
    
    // Add subtle pulse to query node
    const queryNode = pipelineEl.querySelector('[data-stage="query"]');
    if (queryNode) {
        queryNode.classList.add('active');
    }
}

function activatePipelineNode(pipelineEl, stage) {
    if (!pipelineEl) return;
    
    // Remove all active states
    const nodes = pipelineEl.querySelectorAll('.pipeline-node');
    nodes.forEach(node => {
        node.classList.remove('active', 'processing');
    });
    
    // Activate current stage
    const activeNode = pipelineEl.querySelector(`[data-stage="${stage}"]`);
    if (activeNode) {
        activeNode.classList.add('processing');
    }
}

function resetPipelineAnimation(pane) {
    const pipelineEl = pane.querySelector('.rag-pipeline');
    if (!pipelineEl) return;
    
    const nodes = pipelineEl.querySelectorAll('.pipeline-node');
    nodes.forEach(node => {
        node.classList.remove('active', 'processing');
    });
}

async function revealAnswer(outputEl, answer) {
    if (!outputEl) return;
    
    // Clear and prepare for animation
    outputEl.textContent = '';
    outputEl.style.opacity = '0';
    outputEl.style.transform = 'translateY(20px)';
    
    // Set the answer
    outputEl.textContent = answer;
    
    // Animate in
    requestAnimationFrame(() => {
        outputEl.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        outputEl.style.opacity = '1';
        outputEl.style.transform = 'translateY(0)';
    });
    
    // Small delay for the animation
    await new Promise(resolve => setTimeout(resolve, 500));
}

// =============================
// RAG Modal Functions
// =============================

function setupRagModal() {
    try {
        const infoBtn = document.getElementById('rag-info-btn');
        const modal = document.getElementById('rag-info-modal');
        const closeBtn = document.getElementById('rag-modal-close');
        const geminiLink = document.getElementById('gemini-link');
        const techStackLink = document.getElementById('tech-stack-link');
        
        // Info button click
        if (infoBtn && modal) {
            infoBtn.addEventListener('click', () => {
                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
                if (closeBtn) closeBtn.focus();
            });
        }
        
        // Close modal
        const closeModal = () => {
            if (modal) {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
        };
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Close on outside click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
        
        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                closeModal();
            }
        });
        
        // Interactive credits
        if (geminiLink) {
            geminiLink.addEventListener('click', () => {
                if (modal) {
                    modal.style.display = 'block';
                    modal.setAttribute('aria-hidden', 'false');
                    if (closeBtn) closeBtn.focus();
                }
            });
        }
        
        if (techStackLink) {
            techStackLink.addEventListener('click', () => {
                if (modal) {
                    modal.style.display = 'block';
                    modal.setAttribute('aria-hidden', 'false');
                    if (closeBtn) closeBtn.focus();
                }
            });
        }
        
    } catch (e) {
        console.error('Failed to setup RAG modal:', e);
    }
}