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

    const page = document.createElement('div');
    page.className = 'm-page';
    page.appendChild(buildMinimalTopbar(personal, minimal));
    page.appendChild(buildMinimalIdentity(personal, site, minimal));
    page.appendChild(buildMinimalAsk(minimal));
    page.appendChild(buildMinimalBio(personal));

    const news = minimal.news || [];
    if (news.length) {
        page.appendChild(buildMinimalRows('recent', 'Recent', news, item => [item.date, item.text]));
    }

    const threads = minimal.threads || [];
    if (threads.length) {
        page.appendChild(buildMinimalRows('research', 'Research', threads, item => [item.tag, item.text]));
    }

    page.appendChild(buildMinimalPapers());
    page.appendChild(buildMinimalProjects());
    page.appendChild(buildMinimalFooter(site));

    root.innerHTML = '';
    root.appendChild(page);
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

    const links = document.createElement('nav');
    links.className = 'm-topbar__links m-mono';
    (minimal.nav || []).forEach(item => {
        const a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.title;
        links.appendChild(a);
    });

    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.type = 'button';
    themeToggle.className = 'm-topbar__theme m-mono';
    themeToggle.textContent = 'Theme';
    links.appendChild(themeToggle);

    bar.appendChild(links);
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

function buildMinimalBio(personal) {
    const bio = document.createElement('section');
    bio.className = 'm-bio';
    const paragraphs = ((personal.bio || {}).paragraphs) || [];
    paragraphs.forEach(text => {
        const p = document.createElement('p');
        p.textContent = text;
        bio.appendChild(p);
    });
    return bio;
}

function buildMinimalRows(id, label, items, pick) {
    const section = document.createElement('section');
    section.className = 'm-section';
    section.id = id;

    const heading = document.createElement('div');
    heading.className = 'm-section__label m-mono';
    heading.textContent = label;
    section.appendChild(heading);

    const rows = document.createElement('div');
    rows.className = 'm-rows';
    items.forEach(item => {
        const [meta, text] = pick(item);
        const row = document.createElement('div');
        row.className = 'm-row';

        const metaEl = document.createElement('span');
        metaEl.className = 'm-row__meta m-mono';
        metaEl.textContent = meta;
        row.appendChild(metaEl);

        const textEl = document.createElement('p');
        textEl.className = 'm-row__text';
        textEl.textContent = text;
        row.appendChild(textEl);

        rows.appendChild(row);
    });
    section.appendChild(rows);

    return section;
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

        if (pub.url) {
            const links = document.createElement('div');
            links.className = 'm-paper__links m-mono';
            const a = document.createElement('a');
            a.href = pub.url;
            a.rel = 'noopener';
            a.textContent = labelForPaperLink(pub.url);
            links.appendChild(a);
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

function buildMinimalProjects() {
    const projects = (window.projectsData || []).slice().sort(sortMinimalProjects);
    const section = document.createElement('section');
    section.className = 'm-section m-projects';
    section.id = 'projects';

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
