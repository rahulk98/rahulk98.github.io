/*
 * Minimal design renderer.
 *
 * The site ships two designs. config.json decides which one runs:
 *   "design": "classic"  -> the original sectioned portfolio in index.html
 *   "design": "minimal"  -> the single-column researcher page built here
 *
 * Append ?design=classic or ?design=minimal to any URL to override the config
 * for one visit. The resolved choice is cached so repeat visits do not flash
 * the other design.
 */

const MINIMAL_FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&family=IBM+Plex+Mono:wght@400;500&display=swap';
const MINIMAL_TAB_IDS = ['about', 'recent', 'research', 'projects'];

let minimalHeaderEl = null;
let minimalPanels = {};
let minimalTabButtons = {};
let minimalActiveTab = 'about';
let minimalCtx = null;

function resolveDesign(config) {
    const options = (config && config.designOptions) || ['classic', 'minimal'];
    let choice = null;

    try {
        choice = new URLSearchParams(window.location.search).get('design');
    } catch (error) {
        choice = null;
    }

    if (!options.includes(choice)) {
        choice = (config && config.design) || 'classic';
    }
    if (!options.includes(choice)) {
        choice = 'classic';
    }

    try {
        localStorage.setItem('siteDesign', choice);
    } catch (error) {
        // Storage can be unavailable in private mode. The config still decides.
    }

    return choice;
}

function renderMinimal() {
    const root = document.getElementById('minimal-root');
    if (!root) return;

    loadMinimalFonts();

    // The classic markup is removed rather than hidden so that shared element
    // ids (#rag-pane, #theme-toggle) resolve to the minimal page.
    document.querySelectorAll('.header, .main, .footer').forEach(el => el.remove());

    const personal = window.personalData || {};
    const site = window.siteData || {};
    const minimal = window.minimalData || {};

    minimalCtx = { personal, site, minimal };

    const page = document.createElement('div');
    page.className = 'm-page';

    page.appendChild(buildMinimalTopbar(personal, minimal));

    minimalHeaderEl = document.createElement('div');
    page.appendChild(minimalHeaderEl);

    minimalPanels = {};
    const tabs = (minimal.tabs && minimal.tabs.length) ? minimal.tabs : MINIMAL_TAB_IDS.map(id => ({ id }));
    tabs.forEach(tab => {
        const panel = buildMinimalPanel(tab.id, personal, minimal);
        minimalPanels[tab.id] = panel;
        page.appendChild(panel);
    });

    page.appendChild(buildMinimalFooter(site));

    root.innerHTML = '';
    root.appendChild(page);

    minimalActiveTab = resolveMinimalHash();
    switchMinimalTab(minimalActiveTab);

    window.addEventListener('hashchange', () => {
        switchMinimalTab(resolveMinimalHash());
    });
}

function resolveMinimalHash() {
    const raw = (location.hash || '').replace(/^#/, '');
    return MINIMAL_TAB_IDS.includes(raw) ? raw : 'about';
}

function loadMinimalFonts() {
    if (document.querySelector('link[data-minimal-fonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MINIMAL_FONTS_HREF;
    link.setAttribute('data-minimal-fonts', '');
    document.head.appendChild(link);
}

function buildMinimalTopbar(personal, minimal) {
    const bar = document.createElement('div');
    bar.className = 'm-topbar';

    const name = document.createElement('span');
    name.className = 'm-topbar__name m-mono';
    name.textContent = personal.name || '';
    bar.appendChild(name);

    const tabsWrap = document.createElement('div');
    tabsWrap.className = 'm-tabs';
    minimalTabButtons = {};
    const tabs = (minimal.tabs && minimal.tabs.length) ? minimal.tabs : MINIMAL_TAB_IDS.map(id => ({ id, title: id }));
    tabs.forEach(tab => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'm-tab';
        btn.dataset.tab = tab.id;
        btn.setAttribute('aria-selected', 'false');
        btn.textContent = tab.title || tab.id;
        btn.addEventListener('click', () => {
            location.hash = '#' + tab.id;
        });
        minimalTabButtons[tab.id] = btn;
        tabsWrap.appendChild(btn);
    });
    bar.appendChild(tabsWrap);

    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.type = 'button';
    themeToggle.className = 'm-topbar__theme m-mono';
    themeToggle.textContent = 'Theme';
    bar.appendChild(themeToggle);

    return bar;
}

function buildMinimalIdentity(personal, site, minimal) {
    const wrap = document.createElement('div');
    wrap.className = 'm-identity';

    const image = personal.profileImage || {};
    if (image.src) {
        const photo = document.createElement('img');
        photo.className = 'm-identity__photo';
        photo.src = image.src;
        photo.alt = image.alt || personal.name || '';
        photo.width = 76;
        photo.height = 76;
        photo.loading = 'lazy';
        wrap.appendChild(photo);
    }

    const text = document.createElement('div');
    text.className = 'm-identity__text';

    const heading = document.createElement('h1');
    heading.className = 'm-identity__name';
    heading.textContent = personal.name || '';
    text.appendChild(heading);

    const tagline = document.createElement('p');
    tagline.className = 'm-identity__tagline';
    tagline.textContent = minimal.tagline || personal.subtitle || '';
    text.appendChild(tagline);

    const social = site.social || {};
    const resume = ((window.navigationData || {}).menu || []).find(item => item.download);
    const firstPub = ((window.publicationsData || {}).publications || []).find(pub => pub.url);

    const links = document.createElement('div');
    links.className = 'm-identity__links m-mono';
    const entries = [
        { text: 'Email', url: social.email ? `mailto:${social.email}` : null },
        { text: 'CV', url: resume ? resume.url : null },
        { text: 'arXiv', url: firstPub ? firstPub.url : null },
        { text: 'GitHub', url: social.github }
    ];
    entries.forEach(entry => {
        if (!entry.url) return;
        const a = document.createElement('a');
        a.href = entry.url;
        a.textContent = entry.text;
        links.appendChild(a);
    });

    if (personal.location) {
        const location = document.createElement('span');
        location.className = 'm-identity__location';
        location.textContent = personal.location;
        links.appendChild(location);
    }

    text.appendChild(links);
    wrap.appendChild(text);
    return wrap;
}

function buildMinimalHeader(title, tagline) {
    const header = document.createElement('div');
    header.className = 'm-header';

    const h1 = document.createElement('h1');
    h1.className = 'm-header__title';
    h1.textContent = title || '';
    header.appendChild(h1);

    const p = document.createElement('p');
    p.className = 'm-header__tagline';
    p.textContent = tagline || '';
    header.appendChild(p);

    return header;
}

function switchMinimalTab(tabId) {
    const id = MINIMAL_TAB_IDS.includes(tabId) ? tabId : 'about';
    minimalActiveTab = id;

    const { personal, site, minimal } = minimalCtx || {};
    const tabs = (minimal && minimal.tabs) || [];
    const tabInfo = tabs.find(t => t.id === id) || {};

    Object.keys(minimalTabButtons).forEach(key => {
        minimalTabButtons[key].setAttribute('aria-selected', key === id ? 'true' : 'false');
    });

    if (minimalHeaderEl) {
        minimalHeaderEl.innerHTML = '';
        if (id === 'about') {
            minimalHeaderEl.appendChild(buildMinimalIdentity(personal || {}, site || {}, minimal || {}));
        } else {
            minimalHeaderEl.appendChild(buildMinimalHeader(tabInfo.title, tabInfo.tagline));
        }
    }

    Object.keys(minimalPanels).forEach(key => {
        minimalPanels[key].hidden = key !== id;
    });
}

function buildMinimalPanel(tabId, personal, minimal) {
    const panel = document.createElement('div');
    panel.className = 'm-panel';
    panel.dataset.panel = tabId;
    panel.hidden = true;

    if (tabId === 'about') {
        panel.appendChild(buildMinimalAsk(minimal));
        panel.appendChild(buildMinimalBio(personal, minimal));
    } else if (tabId === 'research') {
        panel.appendChild(buildMinimalPapers());
    } else if (tabId === 'projects') {
        panel.appendChild(buildMinimalProjects());
    } else if (tabId === 'recent') {
        panel.appendChild(buildMinimalNews(minimal));
        panel.appendChild(buildMinimalExperience());
        panel.appendChild(buildMinimalEducation());
    }

    return panel;
}

function buildMinimalAsk(minimal) {
    const ask = minimal.ask || {};
    const section = document.createElement('section');
    section.className = 'm-ask';

    const label = document.createElement('div');
    label.className = 'm-section__label m-mono';
    label.textContent = ask.label || 'Ask about my work';
    section.appendChild(label);

    if (ask.note) {
        const note = document.createElement('p');
        note.className = 'm-ask__note';
        note.textContent = ask.note;
        section.appendChild(note);
    }

    // Same element ids the classic hero used, so initializeRag() runs unchanged.
    const pane = document.createElement('div');
    pane.id = 'rag-pane';
    pane.className = 'rag-pane';
    pane.setAttribute('aria-live', 'polite');
    pane.innerHTML = `
        <div id="rag-thinking" class="rag-thinking" hidden>
            <div class="thinking-stage" id="thinking-retrieval">
                <span class="thinking-text">Retrieving context...</span>
            </div>
            <div class="thinking-stage" id="thinking-generation">
                <span class="thinking-text">Generating answer...</span>
            </div>
        </div>
        <div id="rag-output" class="rag-output"></div>
        <form id="rag-form" class="rag-form" hidden>
            <label class="sr-only" for="rag-input">Ask a question</label>
            <input id="rag-input" type="text" placeholder="What did the KV cache work actually measure?" autocomplete="off">
            <button id="rag-send" type="submit" aria-label="Send">Ask</button>
        </form>
    `;
    section.appendChild(pane);

    return section;
}

function buildMinimalBio(personal, minimal) {
    const bio = document.createElement('div');
    bio.className = 'm-bio';
    const about = (minimal && minimal.about) || null;
    const paragraphs = (about && about.length) ? about : (((personal || {}).bio || {}).paragraphs) || [];
    paragraphs.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        bio.appendChild(p);
    });
    return bio;
}

function buildMinimalNews(minimal) {
    const news = (minimal && minimal.news) || [];
    const section = document.createElement('section');
    section.className = 'm-section';
    section.id = 'news';

    const heading = document.createElement('div');
    heading.className = 'm-section__label m-mono';
    heading.textContent = 'News';
    section.appendChild(heading);

    const rows = document.createElement('div');
    rows.className = 'm-rows';
    news.forEach(item => {
        const row = document.createElement('div');
        row.className = 'm-row';

        const metaEl = document.createElement('span');
        metaEl.className = 'm-row__meta m-mono';
        metaEl.textContent = item.date;
        row.appendChild(metaEl);

        const body = document.createElement('div');
        body.className = 'm-row__body';

        const kindEl = document.createElement('span');
        kindEl.className = 'm-row__kind m-mono';
        kindEl.textContent = item.kind || '';
        body.appendChild(kindEl);

        const textEl = document.createElement('p');
        textEl.className = 'm-row__text';
        textEl.textContent = item.text;
        body.appendChild(textEl);

        row.appendChild(body);
        rows.appendChild(row);
    });
    section.appendChild(rows);

    return section;
}

function buildMinimalExperience() {
    const experience = (window.experienceData || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const section = document.createElement('section');
    section.className = 'm-section';
    section.id = 'experience';

    const heading = document.createElement('div');
    heading.className = 'm-section__label m-mono';
    heading.textContent = 'Experience';
    section.appendChild(heading);

    const jobs = document.createElement('div');
    jobs.className = 'm-jobs';

    experience.forEach(entry => {
        const job = document.createElement('div');
        job.className = 'm-job';

        const dates = document.createElement('span');
        dates.className = 'm-job__dates m-mono';
        dates.textContent = entry.dates || '';
        job.appendChild(dates);

        const body = document.createElement('div');
        body.className = 'm-job__body';

        const title = document.createElement('span');
        title.className = 'm-job__title';
        title.textContent = entry.title || '';
        body.appendChild(title);

        const org = document.createElement('span');
        org.className = 'm-job__org m-mono';
        org.textContent = [entry.company, entry.location].filter(Boolean).join('. ');
        body.appendChild(org);

        const points = document.createElement('ul');
        points.className = 'm-job__points';
        (entry.points || []).forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            points.appendChild(li);
        });
        body.appendChild(points);

        job.appendChild(body);
        jobs.appendChild(job);
    });
    section.appendChild(jobs);

    return section;
}

function buildMinimalEducation() {
    const education = ((window.educationData || {}).education) || [];
    const section = document.createElement('section');
    section.className = 'm-section';
    section.id = 'education';

    const heading = document.createElement('div');
    heading.className = 'm-section__label m-mono';
    heading.textContent = 'Education';
    section.appendChild(heading);

    const jobs = document.createElement('div');
    jobs.className = 'm-jobs';

    education.forEach(entry => {
        const job = document.createElement('div');
        job.className = 'm-job';

        const dates = document.createElement('span');
        dates.className = 'm-job__dates m-mono';
        dates.textContent = buildEducationDates(entry);
        job.appendChild(dates);

        const body = document.createElement('div');
        body.className = 'm-job__body';

        const title = document.createElement('span');
        title.className = 'm-job__title';
        title.textContent = entry.degree || '';
        body.appendChild(title);

        const org = document.createElement('span');
        org.className = 'm-job__org m-mono';
        org.textContent = entry.institution || '';
        body.appendChild(org);

        const meta = document.createElement('p');
        meta.className = 'm-job__meta';
        meta.textContent = buildEducationMeta(entry);
        body.appendChild(meta);

        job.appendChild(body);
        jobs.appendChild(job);
    });
    section.appendChild(jobs);

    return section;
}

function stripEducationParen(value) {
    return String(value || '').replace(/\s*\([^)]*\)\s*/g, '').trim();
}

function buildEducationDates(entry) {
    const from = stripEducationParen(entry.from);
    const to = stripEducationParen(entry.to);
    return [from, to].filter(Boolean).join(' - ');
}

function buildEducationMeta(entry) {
    if (entry.thesis) {
        const toDate = stripEducationParen(entry.to);
        const statusText = (entry.thesis.status || '').trim();
        const statusLower = statusText ? statusText.charAt(0).toLowerCase() + statusText.slice(1) : '';
        return `Expected ${toDate}. Grade ${entry.grade}, ${entry.creditsCompleted} credits completed. Specialization: ${entry.specialization}. Thesis: ${entry.thesis.title}, ${statusLower}.`;
    }
    const parts = [`Grade ${entry.grade}.`];
    if (entry.achievement) parts.push(`${entry.achievement}.`);
    return parts.join(' ');
}

function buildMinimalPapers() {
    const publications = (window.publicationsData || {}).publications || [];
    const section = document.createElement('section');
    section.className = 'm-section';
    section.id = 'papers';

    const label = document.createElement('div');
    label.className = 'm-section__label m-mono';
    label.textContent = 'Papers';
    section.appendChild(label);

    const list = document.createElement('div');
    list.className = 'm-papers';

    publications.forEach(pub => {
        const item = document.createElement('article');
        item.className = 'm-paper';

        const title = document.createElement(pub.url ? 'a' : 'span');
        title.className = 'm-paper__title';
        title.textContent = pub.title;
        if (pub.url) {
            title.href = pub.url;
            title.rel = 'noopener';
        }
        item.appendChild(title);

        const authors = document.createElement('p');
        authors.className = 'm-paper__authors m-mono';
        authors.textContent = pub.authors || '[AUTHOR LIST]';
        item.appendChild(authors);

        const venue = document.createElement('p');
        venue.className = 'm-paper__venue';
        const venueName = document.createElement('em');
        venueName.textContent = pub.conference || '';
        venue.appendChild(venueName);
        if (pub.year) {
            venue.appendChild(document.createTextNode(`, ${pub.year}`));
        }
        item.appendChild(venue);

        if (pub.description) {
            const desc = document.createElement('p');
            desc.className = 'm-paper__desc';
            desc.textContent = pub.description;
            item.appendChild(desc);
        }

        if (pub.result) {
            const result = document.createElement('div');
            result.className = 'm-paper__result';

            const resultLabel = document.createElement('span');
            resultLabel.className = 'm-paper__result-label m-mono';
            resultLabel.textContent = 'Result';
            result.appendChild(resultLabel);

            const resultText = document.createElement('p');
            resultText.className = 'm-paper__result-text';
            resultText.textContent = pub.result;
            result.appendChild(resultText);

            item.appendChild(result);
        }

        const linkEntries = [];
        if (pub.url) linkEntries.push({ label: labelForPaperLink(pub.url), url: pub.url });
        if (pub.projectPage) linkEntries.push({ label: 'Project page', url: pub.projectPage });

        if (linkEntries.length) {
            const links = document.createElement('div');
            links.className = 'm-paper__links m-mono';
            linkEntries.forEach(entry => {
                const a = document.createElement('a');
                a.href = entry.url;
                if (entry.url === pub.url) a.rel = 'noopener';
                a.textContent = entry.label;
                links.appendChild(a);
            });
            item.appendChild(links);
        }

        list.appendChild(item);
    });

    section.appendChild(list);
    return section;
}

function labelForPaperLink(url) {
    if (url.includes('arxiv')) return 'arXiv';
    if (url.includes('ieee')) return 'IEEE';
    if (url.includes('doi.org')) return 'DOI';
    return 'Link';
}

function hasLinkedPublication(project) {
    const links = project.links || {};
    return Object.prototype.hasOwnProperty.call(links, 'preprint') || Object.prototype.hasOwnProperty.call(links, 'paper');
}

function buildMinimalProjects() {
    const projects = (window.projectsData || [])
        .filter(project => !hasLinkedPublication(project))
        .slice()
        .sort(sortMinimalProjects);
    const section = document.createElement('section');
    section.className = 'm-section m-projects';
    section.id = 'projects-list';

    const label = document.createElement('div');
    label.className = 'm-section__label m-mono';
    label.textContent = 'Projects';
    section.appendChild(label);

    projects.forEach(project => {
        const item = document.createElement('article');
        item.className = 'm-project';

        const head = document.createElement('div');
        head.className = 'm-project__head';

        const title = document.createElement(project.slug ? 'a' : 'span');
        title.className = 'm-project__title';
        title.textContent = project.title;
        if (project.slug) {
            title.href = `project.html?slug=${encodeURIComponent(project.slug)}`;
        }
        head.appendChild(title);

        if (project.year) {
            const year = document.createElement('span');
            year.className = 'm-project__year m-mono';
            year.textContent = project.year;
            head.appendChild(year);
        }
        item.appendChild(head);

        if (project.outcome) {
            const outcome = document.createElement('p');
            outcome.className = 'm-project__outcome';
            outcome.textContent = project.outcome;
            item.appendChild(outcome);
        }

        const tags = (project.tags || project.stack || []).slice(0, 4);
        if (tags.length) {
            const stack = document.createElement('div');
            stack.className = 'm-project__stack m-mono';
            tags.forEach(tag => {
                const span = document.createElement('span');
                span.textContent = tag;
                stack.appendChild(span);
            });
            item.appendChild(stack);
        }

        section.appendChild(item);
    });

    return section;
}

function sortMinimalProjects(a, b) {
    if (Boolean(a.featured) !== Boolean(b.featured)) {
        return a.featured ? -1 : 1;
    }
    return String(b.date || '').localeCompare(String(a.date || ''));
}

function buildMinimalFooter(site) {
    const footerData = window.footerData || {};
    const copyright = footerData.copyright || {};
    const social = site.social || {};

    const footer = document.createElement('footer');
    footer.className = 'm-footer m-mono';

    const left = document.createElement('span');
    left.textContent = `${copyright.text ? copyright.text.replace(/\.\s*All rights reserved\.?$/, '') : ''}, ${new Date().getFullYear()}`.trim();
    footer.appendChild(left);

    const links = document.createElement('div');
    links.className = 'm-footer__links';
    const entries = [
        { text: 'GitHub', url: social.github },
        { text: 'Email', url: social.email ? `mailto:${social.email}` : null }
    ].concat(footerData.links || []);

    entries.forEach(entry => {
        if (!entry.url) return;
        const a = document.createElement('a');
        a.href = entry.url;
        a.textContent = entry.text;
        links.appendChild(a);
    });
    footer.appendChild(links);

    return footer;
}
