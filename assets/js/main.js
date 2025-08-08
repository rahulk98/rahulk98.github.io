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
})();
