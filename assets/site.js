/* silasmoreira.tech — comportamento partilhado (v3) */
{
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const LANG = (document.documentElement.lang || 'pt').slice(0, 2);
  const TXT = ({
    pt: { open: 'Abrir menu', close: 'Fechar menu', copied: 'Copiado' },
    en: { open: 'Open menu', close: 'Close menu', copied: 'Copied' },
    es: { open: 'Abrir menú', close: 'Cerrar menú', copied: 'Copiado' },
    zh: { open: '打开菜单', close: '关闭菜单', copied: '已复制' }
  })[LANG] || {};
  const toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl);
  let toastT; const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2400); };

  /* cabeçalho + progresso */
  const top = $('.top'), rp = $('.read-progress');
  const onScroll = () => {
    const h = document.documentElement, y = h.scrollTop;
    top && top.classList.toggle('scrolled', y > 10);
    rp && rp.style.setProperty('--p', (y / Math.max(1, h.scrollHeight - h.clientHeight)).toFixed(4));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu móvel */
  const mb = $('.menu-btn');
  mb && mb.addEventListener('click', () => {
    const open = top.classList.toggle('open');
    mb.setAttribute('aria-expanded', open); mb.setAttribute('aria-label', open ? TXT.close : TXT.open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  const closeMenu = () => { if (!top || !top.classList.contains('open')) return; top.classList.remove('open'); document.body.style.overflow = ''; mb && (mb.setAttribute('aria-expanded', 'false'), mb.setAttribute('aria-label', TXT.open)); };
  $$('.nav a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  addEventListener('resize', () => { if (innerWidth > 960) closeMenu(); });

  /* revelação + contadores */
  const countUp = el => {
    const end = +el.dataset.count, dur = 1400, t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / dur); el.textContent = Math.round(end * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('in'));

  /* palavra que roda */
  $$('.rotator').forEach(r => {
    const items = $$('span', r); if (items.length < 2 || reduce) { items[0] && items[0].classList.add('on'); return; }
    let i = 0; items[0].classList.add('on');
    setInterval(() => {
      const cur = items[i]; cur.classList.remove('on'); cur.classList.add('out');
      setTimeout(() => cur.classList.remove('out'), 500);
      i = (i + 1) % items.length; items[i].classList.add('on');
    }, 2200);
  });

  /* spotlight */
  if (fine) $$('.spot').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* parallax da órbita */
  const orbit = $('.orbit');
  if (orbit && fine && !reduce) {
    const hero = orbit.closest('section');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      orbit.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    hero.addEventListener('pointerleave', () => orbit.style.transform = '');
  }

  /* carrosséis */
  $$('.car').forEach(car => {
    const track = $('.car-track', car), prev = $('[data-prev]', car), next = $('[data-next]', car), dots = $('.car-dots', car), count = $('.car-count', car);
    const items = [...track.children];
    if (dots) dots.innerHTML = items.map(() => '<i></i>').join('');
    const idx = () => {
      const x = track.scrollLeft; let best = 0, d = Infinity;
      items.forEach((it, i) => { const dd = Math.abs(it.offsetLeft - track.offsetLeft - x); if (dd < d) { d = dd; best = i; } });
      return best;
    };
    const go = i => { const it = items[Math.max(0, Math.min(items.length - 1, i))]; track.scrollTo({ left: it.offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); };
    const sync = () => {
      const i = idx(), max = track.scrollWidth - track.clientWidth - 4;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max;
      if (dots) [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
      if (count) count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    };
    prev && prev.addEventListener('click', () => go(idx() - 1));
    next && next.addEventListener('click', () => go(idx() + 1));
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    track.tabIndex = 0;
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(idx() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx() - 1); } });
    /* arrastar com o rato */
    if (fine) {
      let down = false, sx = 0, sl = 0, moved = false;
      track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
      addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; track.classList.add('drag'); } track.scrollLeft = sl - dx; });
      addEventListener('pointerup', () => { if (!down) return; down = false; if (moved) { track.classList.remove('drag'); go(idx()); } });
      track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    }
    addEventListener('resize', sync); sync();
  });

  /* menu suspenso de idioma */
  $$('.lang-dd').forEach(dd => {
    const btn = $('.lang-btn', dd), links = $$('.langs a', dd);
    const set = o => { dd.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); };
    btn.addEventListener('click', e => { e.stopPropagation(); const o = !dd.classList.contains('open'); set(o); if (o) (links.find(a => !a.classList.contains('on')) || links[0]).focus({ preventScroll: true }); });
    document.addEventListener('click', e => { if (!dd.contains(e.target)) set(false); });
    dd.addEventListener('keydown', e => {
      if (e.key === 'Escape' && dd.classList.contains('open')) { set(false); btn.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const i = links.indexOf(document.activeElement); const n = (i + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length; if (!dd.classList.contains('open')) set(true); links[n].focus(); }
    });
    dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) set(false); });
  });

  /* percurso em órbita: o cartão ao centro fica ativo */
  $$('[data-orb]').forEach(orb => {
    const track = $('.orb-track', orb), items = [...track.children], prev = $('[data-prev]', orb), next = $('[data-next]', orb);
    const count = $('.orb-count', orb.closest('section'));
    let cur = 0;
    const center = () => { const c = track.scrollLeft + track.clientWidth / 2; let b = 0, d = Infinity; items.forEach((it, i) => { const dd = Math.abs(it.offsetLeft + it.offsetWidth / 2 - c); if (dd < d) { d = dd; b = i; } }); return b; };
    const go = i => { i = Math.max(0, Math.min(items.length - 1, i)); const it = items[i]; track.scrollTo({ left: it.offsetLeft - (track.clientWidth - it.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); };
    const sync = () => {
      cur = center();
      items.forEach((it, k) => it.classList.toggle('on', k === cur));
      if (prev) prev.disabled = cur === 0;
      if (next) next.disabled = cur === items.length - 1;
      if (count) count.textContent = `${String(cur + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    };
    prev && prev.addEventListener('click', () => go(cur - 1));
    next && next.addEventListener('click', () => go(cur + 1));
    items.forEach((it, i) => it.addEventListener('click', e => { if (i !== cur && !e.target.closest('a')) { e.preventDefault(); go(i); } }));
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync); sync();
  });

  /* tabs */
  $$('[data-tabs]').forEach(w => {
    const tabs = $$('[role="tab"]', w), panels = $$('[role="tabpanel"]', w), bar = $$('.layer-bar i', w);
    const sel = i => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => p.hidden = k !== i);
      bar.forEach((b, k) => b.classList.toggle('on', k <= i));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => sel(i));
      t.addEventListener('keydown', e => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); const n = (i + d + tabs.length) % tabs.length; sel(n); tabs[n].focus(); }
      });
    });
    sel(0);
  });

  /* índice da página que acompanha o scroll */
  const toc = $$('.scroll-toc a');
  if (toc.length && 'IntersectionObserver' in window) {
    const map = new Map(toc.map(a => [a.getAttribute('href').split('#')[1], a]));
    const tio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { toc.forEach(a => a.classList.remove('on')); const a = map.get(e.target.id); a && a.classList.add('on'); }
    }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((a, id) => { const s = document.getElementById(id); s && tio.observe(s); });
  }

  /* copiar */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); toast(b.dataset.done || TXT.copied); }
    catch (e) { toast(b.dataset.copy); }
  }));

  /* privacidade */
  const dlg = $('dialog.privacy');
  $$('[data-open-privacy]').forEach(b => b.addEventListener('click', () => dlg && dlg.showModal()));
  dlg && dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  /* consentimento de estatísticas: o Umami só carrega depois de "Aceitar" */
  const UMAMI_ID = document.documentElement.dataset.umami || '';
  const loadUmami = () => {
    if (!UMAMI_ID || document.getElementById('umami')) return;
    const s = document.createElement('script'); s.id = 'umami'; s.defer = true; s.src = 'https://cloud.umami.is/script.js'; s.dataset.websiteId = UMAMI_ID; document.head.appendChild(s);
  };
  const consent = $('.consent'), choice = store.get('sm-analytics');
  if (choice === 'yes') loadUmami(); else if (!choice && consent) setTimeout(() => consent.classList.add('show'), 1800);
  $$('[data-consent]').forEach(b => b.addEventListener('click', () => {
    store.set('sm-analytics', b.dataset.consent); consent && consent.classList.remove('show'); if (b.dataset.consent === 'yes') loadUmami();
  }));
  $$('[data-open-consent]').forEach(b => b.addEventListener('click', () => consent && consent.classList.add('show')));

  /* idioma: guarda a escolha ao mudar */
  $$('.langs a[hreflang]').forEach(a => a.addEventListener('click', () => store.set('sm-lang', a.getAttribute('hreflang'))));

  /* formulário: assunto a partir do link e envio */
  const sel = $('#assunto');
  if (sel) {
    const q = new URLSearchParams(location.search);
    const map = { speaker: 'Convite para palestra', moderator: 'Moderação de debate', host: 'Mestre de cerimónias' };
    const want = map[q.get('formato')] || ({ palestra: 'Convite para palestra', oportunidade: 'Oportunidade profissional' })[q.get('assunto')];
    if (want) sel.value = want;
    const subj = $('input[name="_subject"]');
    sel.addEventListener('change', () => subj && (subj.value = 'silasmoreira.tech: ' + sel.value));
  }
  $$('form.form:not(.eb-form)').forEach(f => f.addEventListener('submit', e => {
    window.umami && umami.track('contacto-enviado', { origem: f.dataset.track || '' });
    if (!/silasmoreira\.tech$/.test(location.hostname)) {   // pré-visualização: o envio real só funciona no domínio
      e.preventDefault();
      const note = $('.form-note', f); note && note.classList.add('show');
    }
  }));

    /* faixa do e-book: discreta, some ao fechar (lembra a escolha) e não aparece nas páginas do próprio e-book */
  {
    const EB = ({
      pt: { href: '/o-cerebro-alugado/', tag: 'E-book grátis', t: 'O cérebro alugado: o que as redes e a IA fazem à nossa atenção.', go: 'Ler agora', x: 'Fechar aviso' },
      en: { href: '/en/brain-for-rent/', tag: 'Free e-book', t: 'Brain for Rent: what social media and AI do to our attention.', go: 'Read it', x: 'Close notice' },
      es: { href: '/en/brain-for-rent/', tag: 'E-book gratis (en inglés)', t: 'Brain for Rent: lo que las redes y la IA hacen con nuestra atención.', go: 'Leer', x: 'Cerrar aviso' },
      zh: { href: '/en/brain-for-rent/', tag: '免费电子书（英文）', t: 'Brain for Rent：社交媒体和 AI 如何影响我们的注意力。', go: '阅读', x: '关闭' }
    })[LANG];
    const onBook = /\/(o-cerebro-alugado|brain-for-rent)\//.test(location.pathname);
    const top = $('header.top');
    if (EB && top && !onBook && store.get('sm-ebook-bar') !== 'closed') {
      const bar = document.createElement('div');
      bar.className = 'ebar';
      bar.innerHTML = `<div class="wrap"><a href="${EB.href}" data-umami-event="ebook-faixa"><b>${EB.tag}</b><span>${EB.t}</span><em>${EB.go} →</em></a><button type="button" aria-label="${EB.x}">×</button></div>`;
      top.parentNode.insertBefore(bar, top);
      $('button', bar).addEventListener('click', () => { store.set('sm-ebook-bar', 'closed'); bar.remove(); });
    }
  }

  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}
