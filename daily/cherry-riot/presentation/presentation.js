(() => {
  // Each frame embeds a real responsive storefront page instead of a static mockup.
  function sizeFrames() {
    document.querySelectorAll('.device-shell[data-device]').forEach(device => {
      const display = device.querySelector('.device-screen');
      const frame = device.querySelector('iframe');
      if (!display || !frame) return;
      const mobile = device.dataset.device === 'phone';
      const sourceWidth = mobile ? 390 : 1360;
      const sourceHeight = mobile ? 840 : 850;
      const scale = display.getBoundingClientRect().width / sourceWidth;
      frame.style.width = sourceWidth + 'px';
      frame.style.height = sourceHeight + 'px';
      frame.style.transform = 'scale(' + scale + ')';
    });
    const final = document.querySelector('.final-frame');
    if (final) {
      const frame = final.querySelector('iframe');
      if (frame) frame.style.transform = 'scale(' + final.clientWidth / 1360 + ')';
    }
  }
  const observer = 'ResizeObserver' in window ? new ResizeObserver(sizeFrames) : null;
  if(observer) document.querySelectorAll('.device-screen,.final-frame').forEach(screen => observer.observe(screen));
  window.addEventListener('resize',sizeFrames,{passive:true});
  window.addEventListener('load',sizeFrames);
  sizeFrames();
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.side-nav a')];
  if ('IntersectionObserver' in window) {
    const watcher = new IntersectionObserver(entries => {
      const incoming=entries.filter(entry => entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
      if (!incoming.length) return;
      const id=incoming[0].target.id;
      links.forEach(link => {
        const active=link.getAttribute('href')==='#'+id;
        link.classList.toggle('active',active);
        if(active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
      });
    },{rootMargin:'-20% 0px -58% 0px',threshold:[0,.1,.3,.6]});
    sections.forEach(section=>watcher.observe(section));
  }
})();