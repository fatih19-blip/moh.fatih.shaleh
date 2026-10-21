(() => {
  const $ = (id) => document.getElementById(id);
  const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeImage = (value = '') => {
    const v = String(value).trim();
    if (v.startsWith('/uploads/')) return v;
    try { const u = new URL(v); if (u.protocol === 'https:' || u.protocol === 'http:') return u.href; } catch (_) {}
    return '';
  };
  const formatDate = (value) => {
    if (!value) return 'Tanggal belum diisi';
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };
  const initials = (name) => String(name || 'Nama Kamu').trim().split(/\s+/).slice(0,2).map(s => s[0] || '').join('').toUpperCase() || 'NK';
  const placeholder = (letter = '✳') => `<span class="cover-mark">${escapeHTML(letter)}</span>`;

  function render(data) {
    const p = data.profile || {};
    document.title = `${p.name || 'Portofolio'} — Portofolio Pribadi`;
    $('profileName').innerHTML = `${escapeHTML(p.name || 'Nama Kamu')}<span class="name-dot">.</span>`;
    $('profileHeadline').textContent = p.headline || 'Mahasiswa • Aktivis Organisasi • Pembelajar';
    $('profileBio').textContent = p.bio || '';
    $('profileLocation').textContent = p.location || 'Indonesia';
    $('profileInitials').textContent = initials(p.name);
    $('footerName').textContent = p.name || 'Nama Kamu';
    const photo = safeImage(p.photo);
    $('profilePhoto').hidden = !photo;
    $('profilePlaceholder').style.display = photo ? 'none' : 'flex';
    if (photo) $('profilePhoto').src = photo; else $('profilePhoto').removeAttribute('src');

    const activities = Array.isArray(data.activities) ? data.activities : [];
    const experiences = Array.isArray(data.experience) ? data.experience : [];
    const education = Array.isArray(data.education) ? data.education : [];
    const organizations = Array.isArray(data.organizations) ? data.organizations : [];
    const gallery = Array.isArray(data.gallery) ? data.gallery : [];
    $('activityCount').textContent = `${String(activities.length).padStart(2,'0')}+ Kegiatan`;
    $('statActivities').textContent = String(activities.length).padStart(2, '0');
    $('statExperience').textContent = String(experiences.length).padStart(2, '0');
    $('statOrganizations').textContent = String(organizations.length).padStart(2, '0');
    $('statGallery').textContent = String(gallery.length).padStart(2, '0');
    $('yearNow').textContent = new Date().getFullYear();

    $('activitiesGrid').innerHTML = activities.length ? activities.map((item, i) => {
      const img = safeImage(item.image);
      return `<article class="activity-card reveal"><div class="activity-cover">${img ? `<img loading="lazy" src="${escapeHTML(img)}" alt="${escapeHTML(item.title)}">` : placeholder(String(i + 1).padStart(2,'0'))}</div><div class="activity-content"><span class="tag">${escapeHTML(item.category || 'Kegiatan')}</span><span class="item-date">${escapeHTML(formatDate(item.date))}</span><h3>${escapeHTML(item.title || 'Kegiatan')}</h3><p>${escapeHTML(item.description || '')}</p></div></article>`;
    }).join('') : '<div class="empty-state">Belum ada kegiatan. Tambahkan kegiatan pertama melalui halaman admin.</div>';

    $('experienceList').innerHTML = experiences.length ? experiences.map((item, i) => `<article class="timeline-item reveal"><span class="timeline-mark">${String(i + 1).padStart(2,'0')}</span><span class="timeline-period">${escapeHTML(item.period || 'Periode belum diisi')}</span><h3>${escapeHTML(item.role || 'Pengalaman')}</h3><h4>${escapeHTML(item.institution || '')}</h4><p>${escapeHTML(item.description || '')}</p></article>`).join('') : '<div class="empty-state">Pengalaman belum ditambahkan.</div>';

    $('educationList').innerHTML = education.length ? education.map(item => `<article class="education-card reveal"><div class="edu-icon">✧</div><div><h3>${escapeHTML(item.institution || 'Institusi pendidikan')}</h3><div class="degree">${escapeHTML(item.degree || '')}</div><div class="period">${escapeHTML(item.period || '')}</div><p>${escapeHTML(item.description || '')}</p></div></article>`).join('') : '<div class="empty-state">Pendidikan belum ditambahkan.</div>';

    $('organizationList').innerHTML = organizations.length ? organizations.map((item, i) => `<article class="organization-card reveal"><div class="org-top"><div class="org-symbol">✳</div><span class="org-period">${escapeHTML(item.period || '')}</span></div><h3>${escapeHTML(item.organization || 'Organisasi')}</h3><div class="org-position">${escapeHTML(item.position || 'Posisi')}</div><p>${escapeHTML(item.description || '')}</p></article>`).join('') : '<div class="empty-state">Organisasi dan posisi belum ditambahkan.</div>';

    $('galleryGrid').innerHTML = gallery.length ? gallery.map((item, i) => {
      const img = safeImage(item.image);
      const title = item.title || 'Dokumentasi kegiatan';
      return `<button class="gallery-item reveal" type="button" data-gallery-index="${i}" aria-label="Lihat ${escapeHTML(title)}">${img ? `<img loading="lazy" src="${escapeHTML(img)}" alt="${escapeHTML(title)}">` : `<span class="gallery-placeholder">${String(i + 1).padStart(2,'0')}</span>`}<span class="gallery-shade"><strong>${escapeHTML(title)}</strong><small>${escapeHTML(item.date ? formatDate(item.date) : item.caption || 'Dokumentasi kegiatan')}</small></span></button>`;
    }).join('') : '<div class="empty-state">Galeri masih kosong. Unggah dokumentasi lewat halaman admin.</div>';

    $('emailLink').href = p.email ? `mailto:${p.email}` : '#kontak';
    $('emailText').textContent = p.email || 'Email belum diisi';
    const wa = String(p.whatsapp || '').replace(/\D/g, '');
    $('whatsappLink').href = wa ? `https://wa.me/${wa}` : '#kontak';
    $('whatsappLink').style.opacity = wa ? '1' : '.55';
    const insta = String(p.instagram || '').trim();
    $('instagramLink').href = /^https?:\/\//i.test(insta) ? insta : 'https://instagram.com/';
    $('instagramLink').style.opacity = insta ? '1' : '.55';
    $('navContact').href = p.whatsapp && wa ? `https://wa.me/${wa}` : '#kontak';

    $('galleryGrid').querySelectorAll('[data-gallery-index]').forEach(btn => btn.addEventListener('click', () => {
      const item = gallery[Number(btn.dataset.galleryIndex)]; if (!item || !safeImage(item.image)) return;
      $('lightboxImage').src = safeImage(item.image);
      $('lightboxCaption').textContent = `${item.title || 'Dokumentasi'}${item.date ? ' — ' + formatDate(item.date) : ''}`;
      $('lightbox').hidden = false;
    }));
  }
  async function init() {
    try {
      const response = await fetch('/api/portfolio', { cache: 'no-store' });
      if (!response.ok) throw new Error('Gagal memuat data');
      render(await response.json());
    } catch (err) {
      console.error(err);
      $('activitiesGrid').innerHTML = '<div class="empty-state">Data belum dapat dimuat. Pastikan server berjalan dan coba muat ulang halaman.</div>';
    }
  }
  $('menuToggle').addEventListener('click', () => {
    const isOpen = $('navLinks').classList.toggle('open');
    $('menuToggle').setAttribute('aria-expanded', String(isOpen));
  });
  $('navLinks').querySelectorAll('a').forEach(a => a.addEventListener('click', () => { $('navLinks').classList.remove('open'); $('menuToggle').setAttribute('aria-expanded','false'); }));
  $('lightboxClose').addEventListener('click', () => { $('lightbox').hidden = true; $('lightboxImage').src = ''; });
  $('lightbox').addEventListener('click', e => { if (e.target === $('lightbox')) { $('lightbox').hidden = true; $('lightboxImage').src = ''; } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('lightbox').hidden = true; });
  window.addEventListener('portfolio-data-updated', () => init());
  init();
})();
