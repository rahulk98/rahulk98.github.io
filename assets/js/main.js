(function(){
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme');
  const initial = saved || (prefersDark ? 'dark' : 'light');
  if(initial === 'light') root.classList.add('light');

  const themeBtn = document.getElementById('theme-toggle');
  themeBtn?.addEventListener('click', ()=>{
    root.classList.toggle('light');
    const now = root.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('theme', now);
  });

  const menuBtn = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  menuBtn?.addEventListener('click', ()=>{
    const open = menu?.classList.toggle('show');
    if(menuBtn) menuBtn.setAttribute('aria-expanded', String(!!open));
  });

  // AOS-lite
  const observer = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    }
  },{threshold:0.08});

  document.querySelectorAll('[data-animate]')?.forEach(el=>observer.observe(el));

  // Projects: load from generated JSON
async function loadProjectsJSON() {
  const list = document.getElementById("project-list");
  const toggleBtn = document.getElementById("toggle-projects");
  if (!list) return;

  try {
    const res = await fetch("assets/data/projects.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();

    let expanded = false;
    function render() {
      const toShow = expanded ? items : items.slice(0, 3);
      list.innerHTML = toShow.map(cardHTML).join("");
      if (toggleBtn) {
        toggleBtn.style.display = items.length > 3 ? "inline-flex" : "none";
        toggleBtn.textContent = expanded ? "Show less" : "Show more";
        toggleBtn.setAttribute("aria-expanded", String(expanded));
      }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          expanded = !expanded;
          render();
        });
    }

    render();
  } catch (e) {
    console.error("Projects load failed", e);
    list.innerHTML = `<p class="muted">Failed to load projects.</p>`;
    if (toggleBtn) toggleBtn.style.display = "none";
  }
}

function cardHTML(p) {
  const links = Object.entries(p.links || {})
    .map(([key, val]) => `<a class="btn small" href="${val}" target="_blank" rel="noopener">${key.charAt(0).toUpperCase() + key.slice(1)}</a>`)
    .join("");
  const tags = (p.stack || [])
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");
  return `
    <article class="card" tabindex="0" role="link" data-href="project.html?id=${p.slug}">
      <header>
        <h3>${p.title}</h3>
        <span class="muted">${p.year}</span>
      </header>
      <p>${p.summary}</p>
      <div class="tags">${tags}</div>
      <div class="actions">${links}</div>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", loadProjectsJSON);

// Make project cards clickable without breaking inner buttons/links
function handleCardClick(e) {
  const card = e.target.closest('article.card[data-href]');
  if (!card) return;
  
  // Prevent click action if an interactive element inside the card was clicked
  const isInteractive = e.target.closest('a, button, [role="button"], input, textarea, select');
  if (isInteractive) return;

  const href = card.getAttribute('data-href');
  if (href) window.location.href = href;
}

function handleCardKeydown(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('article.card[data-href]');
  if (!card) return;
  
  e.preventDefault(); // Prevent space from scrolling
  const href = card.getAttribute('data-href');
  if (href) window.location.href = href;
}

document.addEventListener('click', handleCardClick);
document.addEventListener('keydown', handleCardKeydown);

})(); // End of main IIFE
