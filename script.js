(function(){
  /* ---------------- OPENING / ENVELOPE ---------------- */
  const opening = document.getElementById('opening');
  const openBtn = document.getElementById('openBtn');
  const musicToggle = document.getElementById('music-toggle');
  const bgm = document.getElementById('bgm');
  let musicOn = false;

  function spawnPetals(){
    for(let i=0;i<26;i++){
      const p = document.createElement('div');
      p.className='petal';
      p.style.left = Math.random()*100+'vw';
      p.style.animationDuration = (3.5+Math.random()*2.5)+'s';
      p.style.width = p.style.height = (6+Math.random()*8)+'px';
      p.style.background = Math.random()>0.5 ? '#D8C79A' : '#F3ECD8';
      document.body.appendChild(p);
      setTimeout(()=>p.remove(), 7000);
    }
  }

  openBtn.addEventListener('click', function(){
    opening.classList.add('opened');
    spawnPetals();
    // Placeholder chime — add a real audio source below (bgm.src = 'your-file.mp3') to enable playback.
    if(bgm.src){
      bgm.play().then(()=>{ musicOn = true; musicToggle.classList.add('show'); }).catch(()=>{ musicToggle.classList.add('show'); });
    } else {
      musicToggle.classList.add('show');
    }
    setTimeout(()=>{ opening.classList.add('closed'); }, 1100);
  });

  musicToggle.addEventListener('click', function(){
    if(!bgm.src){ return; }
    if(musicOn){ bgm.pause(); } else { bgm.play().catch(()=>{}); }
    musicOn = !musicOn;
  });

  /* ---------------- REVEAL ON SCROLL ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); } });
  }, { threshold:0.15 });
  revealEls.forEach(el=>io.observe(el));

  /* ---------------- COUNTDOWN ---------------- */
  const weddingDate = new Date('2026-12-13T00:00:00+08:00').getTime();
  function updateCountdown(){
    const now = Date.now();
    let diff = weddingDate - now;
    if(diff < 0) diff = 0;
    const d = Math.floor(diff/(1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60))%24);
    const m = Math.floor((diff/(1000*60))%60);
    const s = Math.floor((diff/1000)%60);
    document.getElementById('cd-days').textContent = String(d).padStart(2,'0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
    document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------------- GALLERY LIGHTBOX ---------------- */
  const galleryItems = Array.from(document.querySelectorAll('.g-item'));
  const lightbox = document.getElementById('lightbox');
  const lbFill = document.getElementById('lbFill');
  let lbIndex = 0;
  const shapes = [
    'M12 3c-3 5-3 9 0 18C15 12 15 8 12 3Z',
    'M12 4a8 8 0 100 16 8 8 0 000-16Z',
    'M4 18 L12 4 L20 18 Z'
  ];
  const grads = ['linear-gradient(140deg,#f1e6cf,#e5d3ad)','linear-gradient(140deg,#f6e9df,#e9c9c2)','linear-gradient(140deg,#e9ede2,#c9d6c4)','linear-gradient(140deg,#f1e6cf,#d9c090)','linear-gradient(140deg,#f3e2d6,#dcb9a6)','linear-gradient(140deg,#eee6d3,#cbb98c)','linear-gradient(140deg,#eef0e6,#b9cbb2)','linear-gradient(140deg,#f6ece0,#e3ceb6)'];

  function renderLightbox(i){
    lbIndex = (i+galleryItems.length)%galleryItems.length;
    const realPhoto = galleryItems[lbIndex].querySelector('.g-photo');
    if(realPhoto){
      lbFill.style.background = 'transparent';
      lbFill.innerHTML = '<img src="'+realPhoto.getAttribute('src')+'" alt="" style="width:100%;height:100%;object-fit:cover;">';
      return;
    }
    const shape = shapes[lbIndex % shapes.length];
    lbFill.style.background = grads[lbIndex % grads.length];
    lbFill.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#8C7038" stroke-width="1" style="width:70px;height:70px;opacity:.5;"><path d="'+shape+'"/></svg>';
  }
  galleryItems.forEach((item,i)=>{
    item.addEventListener('click', ()=>{ renderLightbox(i); lightbox.classList.add('show'); });
  });
  document.getElementById('lbClose').addEventListener('click', ()=>lightbox.classList.remove('show'));
  document.getElementById('lbPrev').addEventListener('click', ()=>renderLightbox(lbIndex-1));
  document.getElementById('lbNext').addEventListener('click', ()=>renderLightbox(lbIndex+1));
  lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) lightbox.classList.remove('show'); });

  /* ---------------- PERSONALIZATION VIA URL ---------------- */
  const params = new URLSearchParams(window.location.search);
  const guestParam = params.get('guest') || params.get('name');
  if(guestParam){
    document.getElementById('guestName').value = decodeURIComponent(guestParam).replace(/\+/g,' ');
  }

  /* ---------------- RSVP MULTISTEP FORM ---------------- */
  const MAX_GUESTS = 6;
  const form = document.getElementById('rsvpForm');
  const steps = Array.from(form.querySelectorAll('.rsvp-step'));
  const dots = Array.from(document.querySelectorAll('#progressDots span'));
  let attending = null;
  let guestCount = 1;
  let selectedEvents = [];
  let selectedFood = null;

  function goToStep(stepKey){
    steps.forEach(s=> s.classList.toggle('active', s.dataset.step === String(stepKey)));
    const idx = { '1':0,'2':1,'3':2,'4':3,'5':4 }[stepKey];
    dots.forEach((d,i)=> d.classList.toggle('active', idx!==undefined && i===idx));
    if(stepKey === 'confirm'){ dots.forEach(d=>d.classList.remove('active')); }
  }

  document.getElementById('next1').addEventListener('click', ()=>{
    const name = document.getElementById('guestName').value.trim();
    if(!name){ document.getElementById('guestName').focus(); return; }
    goToStep('2');
  });

  document.getElementById('attendYes').addEventListener('click', function(){
    attending = 'yes';
    this.classList.add('selected');
    document.getElementById('attendNo').classList.remove('selected');
    setTimeout(()=>goToStep('3'), 220);
  });
  document.getElementById('attendNo').addEventListener('click', function(){
    attending = 'no';
    this.classList.add('selected');
    document.getElementById('attendYes').classList.remove('selected');
    setTimeout(()=>submitRSVP(), 220);
  });

  document.getElementById('guestMinus').addEventListener('click', ()=>{
    guestCount = Math.max(1, guestCount-1);
    document.getElementById('guestCount').textContent = guestCount;
  });
  document.getElementById('guestPlus').addEventListener('click', ()=>{
    guestCount = Math.min(MAX_GUESTS, guestCount+1);
    document.getElementById('guestCount').textContent = guestCount;
  });

  document.querySelectorAll('#eventChecks .check-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      item.classList.toggle('checked');
      const ev = item.dataset.event;
      if(item.classList.contains('checked')){ selectedEvents.push(ev); }
      else{ selectedEvents = selectedEvents.filter(e=>e!==ev); }
    });
  });

  document.querySelectorAll('#foodRadios .radio-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      document.querySelectorAll('#foodRadios .radio-item').forEach(i=>i.classList.remove('checked'));
      item.classList.add('checked');
      selectedFood = item.dataset.food;
    });
  });

  form.querySelectorAll('[data-next]').forEach(btn=>{
    btn.addEventListener('click', ()=> goToStep(btn.dataset.next));
  });
  form.querySelectorAll('[data-back]').forEach(el=>{
    el.addEventListener('click', ()=> goToStep(el.dataset.back));
  });

  function icsDownloadLink(){
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',
      'DTSTART:20261213T010000Z','DTEND:20261213T140000Z',
      'SUMMARY:Gunarekha & Tinagaran\'s Wedding',
      'LOCATION:SJK(C) Masjid Tanah, Masjid Tanah, Melaka, Malaysia',
      'DESCRIPTION:We would love to have you celebrate with us.',
      'END:VEVENT','END:VCALENDAR'
    ].join('\\n');
    return 'data:text/calendar;charset=utf8,' + encodeURIComponent(ics);
  }

  async function submitRSVP(){
    const name = document.getElementById('guestName').value.trim() || 'Guest';
    const message = document.getElementById('guestMessage') ? document.getElementById('guestMessage').value.trim() : '';
    const record = {
      name, attending: attending === 'yes' ? 'Confirmed' : 'Declined',
      guests: attending === 'yes' ? guestCount : 0,
      events: attending === 'yes' ? selectedEvents : [],
      food: attending === 'yes' ? (selectedFood || '') : '',
      message: message,
      submittedAt: new Date().toISOString()
    };

    try{
      const id = 'rsvp:' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
      await window.storage.set(id, JSON.stringify(record), true);
    }catch(err){
      console.error('Could not save RSVP', err);
    }

    renderConfirmation(record);
    goToStep('confirm');
  }

  function renderConfirmation(record){
    const el = document.getElementById('confirmContent');
    if(record.attending === 'Confirmed'){
      el.innerHTML = `
        <svg class="conf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>
        <h3 class="serif">Thank you, ${escapeHtml(record.name)}</h3>
        <p>We can't wait to celebrate with you.</p>
        <div class="conf-meta">
          <div class="cd serif">13 December 2026</div>
          <div class="cv">SJK(C) Masjid Tanah, Melaka</div>
        </div>
        <div class="conf-btns">
          <a href="${icsDownloadLink()}" download="wedding-invite.ics">Add To Calendar</a>
          <a href="https://maps.app.goo.gl/fBm4dPPNmptnty347" target="_blank" rel="noopener">Get Directions</a>
        </div>`;
    } else {
      el.innerHTML = `
        <svg class="conf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
        <h3 class="serif">Thank you for letting us know</h3>
        <p>You will be missed, but we are grateful for your warm wishes.</p>`;
    }
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    submitRSVP();
  });

  /* ---------------- ADMIN DASHBOARD ---------------- */
  const adminDiv = document.getElementById('admin');
  const siteDiv = document.getElementById('site');
  const openingDiv = document.getElementById('opening');

  async function loadAdmin(){
    let rsvps = [];
    try{
      const listRes = await window.storage.list('rsvp:', true);
      const keys = (listRes && listRes.keys) ? listRes.keys : [];
      const results = await Promise.all(keys.map(k => window.storage.get(k, true).catch(()=>null)));
      rsvps = results.filter(Boolean).map(r => { try{ return JSON.parse(r.value); }catch(e){ return null; } }).filter(Boolean);
    }catch(err){
      console.error('Could not load RSVPs', err);
    }
    renderAdmin(rsvps);
  }

  function renderAdmin(rsvps){
    const confirmed = rsvps.filter(r=>r.attending==='Confirmed');
    const declined = rsvps.filter(r=>r.attending==='Declined');
    const totalGuests = confirmed.reduce((sum,r)=> sum + (Number(r.guests)||0), 0);

    document.getElementById('statTotal').textContent = rsvps.length;
    document.getElementById('statConfirmed').textContent = confirmed.length;
    document.getElementById('statDeclined').textContent = declined.length;
    document.getElementById('statGuests').textContent = totalGuests;

    const eventNames = ['Wedding','Dinner'];
    const evBreak = document.getElementById('eventBreakdown');
    evBreak.innerHTML = eventNames.map(ev=>{
      const count = confirmed.filter(r=> (r.events||[]).includes(ev)).length;
      return `<div class="bd-card"><span>${ev}</span><strong>${count}</strong></div>`;
    }).join('');

    const foodNames = ['Vegetarian','Non-Vegetarian','Halal'];
    const foodBreak = document.getElementById('foodBreakdown');
    foodBreak.innerHTML = foodNames.map(f=>{
      const count = confirmed.filter(r=> r.food === f).length;
      return `<div class="bd-card"><span>${f}</span><strong>${count}</strong></div>`;
    }).join('');

    window._rsvpData = rsvps;
    renderTable();
  }

  function renderTable(){
    const rsvps = window._rsvpData || [];
    const search = (document.getElementById('searchGuest').value || '').toLowerCase();
    const filter = document.getElementById('filterStatus').value;
    let rows = rsvps.filter(r=>{
      const matchesSearch = r.name.toLowerCase().includes(search);
      const matchesFilter = filter==='all' || (filter==='confirmed' && r.attending==='Confirmed') || (filter==='declined' && r.attending==='Declined');
      return matchesSearch && matchesFilter;
    });
    rows.sort((a,b)=> new Date(b.submittedAt) - new Date(a.submittedAt));

    const tbody = document.getElementById('guestTableBody');
    const empty = document.getElementById('adminEmpty');
    if(rows.length === 0){
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = rows.map(r=>`
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${r.guests || 0}</td>
        <td>${(r.events||[]).join(', ') || '—'}</td>
        <td><span class="status-pill ${r.attending==='Confirmed'?'confirmed':'declined'}">${r.attending}</span></td>
        <td>${r.food || '—'}</td>
        <td>${escapeHtml(r.message || '—')}</td>
        <td>${new Date(r.submittedAt).toLocaleDateString()}</td>
      </tr>`).join('');
  }

  document.getElementById('searchGuest').addEventListener('input', renderTable);
  document.getElementById('filterStatus').addEventListener('change', renderTable);

  document.getElementById('exportBtn').addEventListener('click', ()=>{
    const rsvps = window._rsvpData || [];
    const header = ['Name','Guests','Events','RSVP Status','Food Preference','Message','Submitted'];
    const rows = rsvps.map(r=>[
      r.name, r.guests||0, (r.events||[]).join('; '), r.attending, r.food||'', (r.message||'').replace(/\\n/g,' '), r.submittedAt
    ]);
    const csv = [header, ...rows].map(row => row.map(cell=>{
      const v = String(cell ?? '');
      return /[",\\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v;
    }).join(',')).join('\\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'wedding-rsvp-export.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  function showAdmin(){
    siteDiv.style.display = 'none';
    openingDiv.style.display = 'none';
    adminDiv.classList.add('show');
    loadAdmin();
  }
  function hideAdmin(){
    adminDiv.classList.remove('show');
    siteDiv.style.display = '';
  }

  document.getElementById('adminLink').addEventListener('click', (e)=>{ e.preventDefault(); showAdmin(); });
  document.getElementById('adminBack').addEventListener('click', (e)=>{ e.preventDefault(); hideAdmin(); window.scrollTo({top:0}); });

  if(window.location.hash === '#admin'){ showAdmin(); }
})();
