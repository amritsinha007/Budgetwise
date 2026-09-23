window.addEventListener('error', function(e){
  console.error('BudgetWise error:', e.error || e.message);
});
(function(){
  const CATS = [
    { key:'food', name:'Food', color:'#F59E0B' },
    { key:'transport', name:'Transport', color:'#6366F1' },
    { key:'housing', name:'Housing', color:'#10B981' },
    { key:'utilities', name:'Utilities', color:'#06B6D4' },
    { key:'entertain', name:'Entertainment', color:'#EC4899' },
    { key:'health', name:'Health', color:'#14B8A6' },
    { key:'shopping', name:'Shopping', color:'#2563EB' },
    { key:'other', name:'Other', color:'#64748B' }
  ];
  const CUSTOM_PALETTE = ['#8B5CF6','#F97316','#0EA5E9','#84CC16','#D946EF','#F43F5E','#0D9488','#EAB308'];
  let customCats = []; // user-added categories: [{key,name,color}]
  const allCats = () => CATS.concat(customCats);
  const $ = id => document.getElementById(id);
  // Usernames are matched case-insensitively so "Jane" and "jane" are the same account.
  const normUser = u => (u || '').trim().toLowerCase();
  const catInfo = key => allCats().find(c=>c.key===key) || CATS[CATS.length-1];
  const fmt = (n, sym) => sym + Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  const monthKey = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  const esc = s => { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; };
  function slugify(name){
    let base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'category';
    let key = base, n = 1;
    while(allCats().some(c=>c.key===key)) key = base + '-' + (++n);
    return key;
  }

  // ---------- TRANSLATIONS (English / Hindi / Gujarati) ----------
  const TRANSLATIONS = {
    en: {
      nav_dashboard:'Dashboard', nav_add_income:'Add income', nav_add_expense:'Add expense', nav_budget:'Budgets',
      nav_reports:'Reports', nav_transactions:'Transactions', nav_settings:'Settings', nav_logout:'Log out',
      stat_total:'Total balance', stat_income:'Monthly income', stat_expenses:'Monthly expenses', stat_savings:'Savings',
      stat_budget_remaining:'Budget remaining', quick_set_budget:'Set budget',
      pt_add_income:'Add income', ps_add_income:'Record money coming in this month.', btn_add_income:'Add income',
      pt_add_expense:'Add expense', ps_add_expense:'Every entry gets filed under a category and checked against its budget.', btn_add_expense:'Add expense',
      pt_budgets:'Budgets', ps_budgets:'Monthly limits per category. Bars turn amber past 80%, red once exceeded.',
      pt_reports:'Reports', pt_transactions:'Transactions', ps_transactions:'Every entry, searchable, filterable and exportable.',
      pt_settings:'Settings', ps_settings:'Profile, currency and appearance.',
      t_dark_mode:'Dark mode', t_dark_mode_sub:'Switch between light and dark appearance',
      t_budget_alerts:'Budget alerts', t_budget_alerts_sub:'Warn when a category passes 80% of its budget',
      lbl_currency:'Currency', lbl_language:'Language', nav_smart_features:'Smart Features',
    },
    hi: {
      nav_dashboard:'डैशबोर्ड', nav_add_income:'आय जोड़ें', nav_add_expense:'खर्च जोड़ें', nav_budget:'बजट',
      nav_reports:'रिपोर्ट', nav_transactions:'लेनदेन', nav_settings:'सेटिंग्स', nav_logout:'लॉग आउट',
      stat_total:'कुल शेष', stat_income:'मासिक आय', stat_expenses:'मासिक खर्च', stat_savings:'बचत',
      stat_budget_remaining:'शेष बजट', quick_set_budget:'बजट सेट करें',
      pt_add_income:'आय जोड़ें', ps_add_income:'इस महीने आने वाली राशि दर्ज करें।', btn_add_income:'आय जोड़ें',
      pt_add_expense:'खर्च जोड़ें', ps_add_expense:'प्रत्येक प्रविष्टि एक श्रेणी में दर्ज होती है और उसके बजट के विरुद्ध जांची जाती है।', btn_add_expense:'खर्च जोड़ें',
      pt_budgets:'बजट', ps_budgets:'प्रत्येक श्रेणी के लिए मासिक सीमा। 80% के बाद बार एम्बर और सीमा पार होने पर लाल हो जाते हैं।',
      pt_reports:'रिपोर्ट', pt_transactions:'लेनदेन', ps_transactions:'हर प्रविष्टि खोजी, फ़िल्टर और एक्सपोर्ट की जा सकती है।',
      pt_settings:'सेटिंग्स', ps_settings:'प्रोफ़ाइल, मुद्रा और रूप।',
      t_dark_mode:'डार्क मोड', t_dark_mode_sub:'लाइट और डार्क रूप के बीच बदलें',
      t_budget_alerts:'बजट अलर्ट', t_budget_alerts_sub:'जब कोई श्रेणी अपने बजट के 80% को पार करे तो चेतावनी दें',
      lbl_currency:'मुद्रा', lbl_language:'भाषा', nav_smart_features:'स्मार्ट फीचर्स',
    },
    gu: {
      nav_dashboard:'ડેશબોર્ડ', nav_add_income:'આવક ઉમેરો', nav_add_expense:'ખર્ચ ઉમેરો', nav_budget:'બજેટ',
      nav_reports:'અહેવાલો', nav_transactions:'વ્યવહારો', nav_settings:'સેટિંગ્સ', nav_logout:'લૉગ આઉટ',
      stat_total:'કુલ બેલેન્સ', stat_income:'માસિક આવક', stat_expenses:'માસિક ખર્ચ', stat_savings:'બચત',
      stat_budget_remaining:'બાકી બજેટ', quick_set_budget:'બજેટ સેટ કરો',
      pt_add_income:'આવક ઉમેરો', ps_add_income:'આ મહિને આવતી રકમ નોંધો.', btn_add_income:'આવક ઉમેરો',
      pt_add_expense:'ખર્ચ ઉમેરો', ps_add_expense:'દરેક એન્ટ્રી એક કેટેગરીમાં નોંધાય છે અને તેના બજેટ સામે તપાસાય છે.', btn_add_expense:'ખર્ચ ઉમેરો',
      pt_budgets:'બજેટ', ps_budgets:'દરેક કેટેગરી માટે માસિક મર્યાદા. 80% પછી બાર એમ્બર અને મર્યાદા ઓળંગાય ત્યારે લાલ થાય છે.',
      pt_reports:'અહેવાલો', pt_transactions:'વ્યવહારો', ps_transactions:'દરેક એન્ટ્રી શોધી, ફિલ્ટર અને એક્સપોર્ટ કરી શકાય છે.',
      pt_settings:'સેટિંગ્સ', ps_settings:'પ્રોફાઇલ, ચલણ અને દેખાવ.',
      t_dark_mode:'ડાર્ક મોડ', t_dark_mode_sub:'લાઇટ અને ડાર્ક દેખાવ વચ્ચે સ્વિચ કરો',
      t_budget_alerts:'બજેટ ચેતવણીઓ', t_budget_alerts_sub:'જ્યારે કોઈ કેટેગરી તેના બજેટના 80% ને પાર કરે ત્યારે ચેતવણી આપો',
      lbl_currency:'ચલણ', lbl_language:'ભાષા', nav_smart_features:'સ્માર્ટ ફીચર્સ',
    },
  };
  function t(key){
    const lang = (profile && profile.language) || 'en';
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
  }
  function applyLanguage(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    const nameEl = $('topbar-title');
    if(nameEl && currentScreenName) nameEl.textContent = t(TITLE_KEYS[currentScreenName]) || 'BudgetWise';
  }
  let currentScreenName = 'dashboard';
  const TITLE_KEYS = { dashboard:'nav_dashboard', 'add-income':'nav_add_income', 'add-expense':'nav_add_expense', budget:'nav_budget', reports:'nav_reports', transactions:'nav_transactions', 'smart-features':'nav_smart_features', settings:'nav_settings' };

  // ---------- TOAST NOTIFICATIONS ----------
  const TOAST_ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.5 18a1.8 1.8 0 0 0 1.6 2.7h15.8a1.8 1.8 0 0 0 1.6-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0z"/></svg>',
    danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>'
  };
  function showToast(title, msg, kind){
    kind = kind || 'info';
    const stack = $('toast-stack');
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = `
      <span class="t-icon">${TOAST_ICONS[kind] || TOAST_ICONS.info}</span>
      <div class="t-body"><div class="t-title">${esc(title)}</div><div class="t-msg">${esc(msg)}</div></div>
      <button class="t-close" aria-label="Dismiss">&#10005;</button>
    `;
    const remove = ()=>{
      el.classList.add('closing');
      setTimeout(()=> el.remove(), 200);
    };
    el.querySelector('.t-close').addEventListener('click', remove);
    stack.appendChild(el);
    setTimeout(remove, 4000);
  }

  let currentUser = null;
  let users = {};
  let entries = [];
  let budgets = {};
  let profile = { name:'', currency:'₹', darkMode:false, alertsOn:true, email:'', phone:'', photo:'', emailVerified:false, language:'en' };

  // ---------- DATABASE STORAGE (Flask + SQLite) ----------
  // BudgetWise now uses the Flask backend as the primary persistent store.
  // localStorage remains only as a temporary fallback if the backend is unavailable.
  const API_BASE = '/api';
  async function apiStoreGet(key, fallback){
    try{
      const r = await fetch(`${API_BASE}/store/get`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({key})
      });
      if(!r.ok) throw new Error('Database read failed');
      const data = await r.json();
      return data.exists ? data.value : fallback;
    }catch(e){
      try{ const raw = localStorage.getItem('bw:'+key); return raw ? JSON.parse(raw) : fallback; }catch(_){ return fallback; }
    }
  }
  async function apiStoreSet(key, val){
    try{
      const r = await fetch(`${API_BASE}/store/set`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({key, value:val})
      });
      if(!r.ok) throw new Error('Database write failed');
      return;
    }catch(e){
      // Temporary offline fallback; normal operation is SQLite through Flask.
      try{ localStorage.setItem('bw:'+key, JSON.stringify(val)); }catch(_){}
    }
  }
  async function storeGet(key, fallback){ return apiStoreGet(key, fallback); }
  async function storeSet(key, val){ return apiStoreSet(key, val); }

  async function loadUsers(){ users = await storeGet('app-users', {}); }
  async function saveUsers(){ await storeSet('app-users', users); }
  async function loadUserData(){
    const [e, b, c, p] = await Promise.all([
      storeGet('entries:'+currentUser, []),
      storeGet('budgets:'+currentUser, {}),
      storeGet('categories:'+currentUser, []),
      storeGet('profile:'+currentUser, { name: currentUser, currency:'₹', darkMode:false, alertsOn:true, email:'', phone:'', photo:'', emailVerified:false, language:'en' }),
    ]);
    entries = e; budgets = b; customCats = c; profile = p;
  }
  async function saveEntries(){ await storeSet('entries:'+currentUser, entries); }
  async function saveBudgets(){ await storeSet('budgets:'+currentUser, budgets); }
  async function saveCustomCats(){ await storeSet('categories:'+currentUser, customCats); }
  async function saveProfile(){ await storeSet('profile:'+currentUser, profile); }

  // ---------- THEME ----------
  function applyTheme(){
    document.documentElement.setAttribute('data-theme', profile.darkMode ? 'dark' : 'light');
  }
  function toggleTheme(){
    profile.darkMode = !profile.darkMode;
    applyTheme();
    saveProfile();
    showToast(profile.darkMode ? 'Dark mode on' : 'Light mode on', 'Appearance updated.', 'success');
  }
  $('theme-toggle').addEventListener('click', toggleTheme);
  $('theme-toggle-2').addEventListener('click', toggleTheme);
  $('alerts-toggle').addEventListener('click', ()=>{
    profile.alertsOn = !profile.alertsOn;
    $('alerts-toggle').style.opacity = profile.alertsOn ? '1' : '.5';
    saveProfile();
    showToast(profile.alertsOn ? 'Budget alerts on' : 'Budget alerts off', 'Setting updated.', 'success');
  });

  // ---------- MODAL HELPERS ----------
  document.querySelectorAll('[data-close-modal]').forEach(btn=>{
    btn.addEventListener('click', ()=> $(btn.getAttribute('data-close-modal')).classList.add('hidden'));
  });
  document.querySelectorAll('.modal-scrim').forEach(scrim=>{
    scrim.addEventListener('click', (ev)=>{ if(ev.target === scrim) scrim.classList.add('hidden'); });
  });

  // ---------- AUTH ----------
  let authMode = 'login';
  document.querySelectorAll('.login-tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      document.querySelectorAll('.login-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      authMode = tab.getAttribute('data-mode');
      $('auth-submit').textContent = authMode==='login' ? 'Log in' : 'Create account';
      $('auth-error').textContent = '';
    });
  });

  async function submitAuth(){
    const typedName = $('auth-user').value.trim();
    const u = normUser(typedName);
    const p = $('auth-pass').value;
    const err = $('auth-error');
    err.textContent = '';
    if(!u || !p){ err.textContent = 'Enter a username and password.'; return; }
    await loadUsers();
    if(authMode === 'register'){
      if(users[u]){ err.textContent = 'That username is taken. Try logging in.'; return; }
      users[u] = p;
      await saveUsers();
      currentUser = u;
      await enterApp();
      if((profile.name || '') === u) { profile.name = typedName; saveProfile().catch(()=>{}); updateAvatarDisplays(); $('welcome-name').textContent = typedName; }
      showToast('Account created', `Welcome to BudgetWise, ${typedName}.`, 'success');
      setTimeout(openVerifyModal, 500); // prompt to verify email right after registering
    }else{
      if(!users[u] || users[u] !== p){ err.textContent = 'Incorrect username or password.'; return; }
      currentUser = u;
      await enterApp();
      showToast('Logged in', `Welcome back, ${profile.name || typedName}.`, 'success');
    }
  }
  $('auth-submit').addEventListener('click', submitAuth);
  $('auth-user').addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'){ ev.preventDefault(); submitAuth(); } });
  $('auth-pass').addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'){ ev.preventDefault(); submitAuth(); } });

  // ---------- FORGOT PASSWORD ----------
  $('forgot-pw-link').addEventListener('click', ()=>{
    $('fp-user').value = ''; $('fp-email').value = ''; $('fp-newpass').value = '';
    $('fp-newpass-field').classList.add('hidden');
    $('fp-submit').textContent = 'Confirm identity';
    $('fp-msg').textContent = '';
    $('modal-forgot').classList.remove('hidden');
  });
  let fpVerified = false;
  $('fp-submit').addEventListener('click', async ()=>{
    const msg = $('fp-msg');
    if(!fpVerified){
      const u = normUser($('fp-user').value), email = $('fp-email').value.trim();
      if(!u || !email){ msg.textContent = 'Enter your username and email.'; msg.className='form-msg err'; return; }
      const prof = await storeGet('profile:'+u, null);
      await loadUsers();
      if(!users[u] || !prof || !prof.email || prof.email.toLowerCase() !== email.toLowerCase()){
        msg.textContent = 'We couldn\'t match that username and email.'; msg.className='form-msg err'; return;
      }
      fpVerified = true;
      $('fp-newpass-field').classList.remove('hidden');
      $('fp-submit').textContent = 'Set new password';
      msg.textContent = 'Identity confirmed — choose a new password.'; msg.className='form-msg ok';
    } else {
      const u = normUser($('fp-user').value), newpass = $('fp-newpass').value;
      if(newpass.length < 6){ msg.textContent = 'Password must be at least 6 characters.'; msg.className='form-msg err'; return; }
      await loadUsers();
      users[u] = newpass;
      await saveUsers();
      msg.textContent = 'Password reset. You can log in now.'; msg.className='form-msg ok';
      showToast('Password reset', `Password updated for ${u}.`, 'success');
      setTimeout(()=>{ $('modal-forgot').classList.add('hidden'); fpVerified = false; }, 1200);
    }
  });

  // ---------- OTP PHONE LOGIN ----------
  $('otp-login-link').addEventListener('click', ()=>{
    $('password-login-fields').classList.add('hidden');
    $('otp-login-fields').classList.remove('hidden');
    $('otp-code-field').classList.add('hidden');
    $('otp-error').textContent = '';
    $('otp-send-btn').classList.remove('hidden');
  });
  $('otp-back-link').addEventListener('click', ()=>{
    $('otp-login-fields').classList.add('hidden');
    $('password-login-fields').classList.remove('hidden');
  });
  let otpCode = null, otpUser = null;
  $('otp-send-btn').addEventListener('click', async ()=>{
    const u = normUser($('otp-user').value), phone = $('otp-phone').value.trim();
    const err = $('otp-error');
    err.textContent = '';
    if(!u || !phone){ err.textContent = 'Enter your username and phone number.'; return; }
    await loadUsers();
    const prof = await storeGet('profile:'+u, null);
    if(!users[u] || !prof || !prof.phone || prof.phone.replace(/\s+/g,'') !== phone.replace(/\s+/g,'')){
      err.textContent = 'We couldn\'t match that username and phone number.'; return;
    }
    otpCode = String(Math.floor(100000 + Math.random()*900000));
    otpUser = u;
    $('otp-code-field').classList.remove('hidden');
    $('otp-send-btn').classList.add('hidden');
    showToast('OTP sent (simulated)', `No real SMS was sent. Your code is ${otpCode}.`, 'info');
  });
  $('otp-verify-btn').addEventListener('click', async ()=>{
    const err = $('otp-error');
    if($('otp-code').value.trim() !== otpCode){ err.textContent = 'Incorrect code. Please try again.'; return; }
    currentUser = otpUser;
    await enterApp();
    showToast('Logged in', `Welcome back, ${profile.name || currentUser}.`, 'success');
    $('otp-login-fields').classList.add('hidden');
    $('password-login-fields').classList.remove('hidden');
    $('otp-user').value=''; $('otp-phone').value=''; $('otp-code').value=''; otpCode=null; otpUser=null;
  });
  $('otp-phone').addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'){ ev.preventDefault(); $('otp-send-btn').click(); } });
  $('otp-code').addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'){ ev.preventDefault(); $('otp-verify-btn').click(); } });
  $('fp-email').addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'){ ev.preventDefault(); $('fp-submit').click(); } });
  $('fp-newpass').addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'){ ev.preventDefault(); $('fp-submit').click(); } });

  function updateAvatarDisplays(){
    const initials = (profile.name || currentUser).slice(0,2).toUpperCase();
    [$('avatar-circ'), $('settings-avatar')].forEach(el=>{
      if(!el) return;
      if(profile.photo){
        el.style.backgroundImage = `url(${profile.photo})`;
        el.textContent = '';
      } else {
        el.style.backgroundImage = '';
        el.textContent = initials;
      }
    });
  }

  async function enterApp(){
    storeSet('app-session', currentUser).catch(()=>{}); // background; doesn't block entry
    await loadUserData();
    await loadSmartData();
    applyTheme();
    applyLanguage();
    $('alerts-toggle').style.opacity = profile.alertsOn ? '1' : '.5';
    $('screen-login').classList.add('hidden');
    $('app-shell').classList.remove('hidden');
    $('welcome-name').textContent = profile.name || currentUser;
    updateAvatarDisplays();
    populateCatSelects();
    goTo('dashboard');
  }

  $('logout-btn').addEventListener('click', async ()=>{
    await storeSet('app-session', '');
    currentUser = null;
    $('app-shell').classList.add('hidden');
    $('screen-login').classList.remove('hidden');
    $('auth-user').value = ''; $('auth-pass').value = ''; $('auth-error').textContent = '';
    showToast('Logged out', 'Come back soon.', 'info');
  });

  // ---------- SIDEBAR (mobile) ----------
  $('hamburger').addEventListener('click', ()=>{
    $('sidebar').classList.add('open');
    $('sidebar-scrim').classList.add('open');
  });
  $('sidebar-scrim').addEventListener('click', closeSidebar);
  function closeSidebar(){
    $('sidebar').classList.remove('open');
    $('sidebar-scrim').classList.remove('open');
  }

  // ---------- NAVIGATION ----------
  const screens = ['dashboard','add-income','add-expense','budget','reports','transactions','smart-features','settings'];
  function goTo(name){
    screens.forEach(s => $('screen-'+s).classList.toggle('hidden', s !== name));
    document.querySelectorAll('.side-link').forEach(l => l.classList.toggle('active', l.getAttribute('data-nav') === name));
    currentScreenName = name;
    $('topbar-title').textContent = t(TITLE_KEYS[name]) || 'BudgetWise';
    $('back-to-dashboard').classList.toggle('show', name !== 'dashboard');
    closeSidebar();
    if(name==='dashboard') renderDashboard();
    if(name==='add-income'){ $('inc-date').value = new Date().toISOString().slice(0,10); }
    if(name==='add-expense'){
      $('exp-date').value = new Date().toISOString().slice(0,10);
      $('expense-alert-slot').innerHTML='';
      $('new-cat-box').classList.add('hidden');
      $('new-cat-toggle').classList.remove('hidden');
      $('new-cat-name').value = '';
      resetReceiptField();
    }
    if(name==='budget') renderBudgetList();
    if(name==='reports') renderReports();
    if(name==='transactions') renderTransactions();
    if(name==='smart-features') renderSmartFeatures();
    if(name==='settings') renderSettings();
  }
  document.querySelectorAll('[data-nav]').forEach(btn=>{
    btn.addEventListener('click', ()=> goTo(btn.getAttribute('data-nav')));
  });
  $('back-to-dashboard').addEventListener('click', ()=> goTo('dashboard'));

  function populateCatSelects(){
    const prevExp = $('exp-cat').value, prevFilter = $('filter-cat').value;
    $('exp-cat').innerHTML = allCats().map(c=>`<option value="${c.key}">${c.name}</option>`).join('');
    $('filter-cat').innerHTML = '<option value="all">All categories</option>' + allCats().map(c=>`<option value="${c.key}">${c.name}</option>`).join('');
    if(prevExp && allCats().some(c=>c.key===prevExp)) $('exp-cat').value = prevExp;
    if(prevFilter) $('filter-cat').value = prevFilter;
  }

  // ---------- ADD NEW CATEGORY (inline, from Add Expense) ----------
  $('new-cat-toggle').addEventListener('click', ()=>{
    $('new-cat-box').classList.remove('hidden');
    $('new-cat-toggle').classList.add('hidden');
    $('new-cat-name').focus();
  });
  $('new-cat-cancel').addEventListener('click', ()=>{
    $('new-cat-name').value = '';
    $('new-cat-box').classList.add('hidden');
    $('new-cat-toggle').classList.remove('hidden');
  });
  $('new-cat-add').addEventListener('click', ()=>{
    const name = $('new-cat-name').value.trim();
    if(!name){ $('new-cat-name').focus(); return; }
    if(allCats().some(c=>c.name.toLowerCase() === name.toLowerCase())){
      showToast('Category already exists', `"${name}" is already in your category list.`, 'warn');
      return;
    }
    const color = CUSTOM_PALETTE[customCats.length % CUSTOM_PALETTE.length];
    const key = slugify(name);
    customCats.push({ key, name, color });
    saveCustomCats().catch(()=>{});
    populateCatSelects();
    $('exp-cat').value = key;
    $('new-cat-name').value = '';
    $('new-cat-box').classList.add('hidden');
    $('new-cat-toggle').classList.remove('hidden');
    showToast('Category added', `"${name}" is ready to use.`, 'success');
  });
  $('new-cat-name').addEventListener('keydown', (ev)=>{
    if(ev.key === 'Enter'){ ev.preventDefault(); $('new-cat-add').click(); }
  });

  function currentMonthEntries(){
    const mk = monthKey(new Date());
    return entries.filter(e => e.date.slice(0,7) === mk);
  }

  // ---------- animated counters ----------
  function animateValue(el, from, to, prefix, duration){
    const start = performance.now();
    function step(now){
      const t = Math.min(1, (now-start)/duration);
      const eased = 1 - Math.pow(1-t, 3);
      const val = from + (to-from)*eased;
      el.textContent = (val<0?'-':'') + prefix + Math.abs(val).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
      if(t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---------- DASHBOARD ----------
  function renderDashboard(){
    const list = currentMonthEntries();
    const income = list.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
    const spent = list.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
    const savings = income - spent;
    const total = entries.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0) - entries.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
    const totalBudget = Object.values(budgets).reduce((s,v)=>s+v,0);
    const budgetRemaining = totalBudget - spent;

    animateValue($('dash-total'), 0, total, profile.currency, 700);
    animateValue($('dash-income'), 0, income, profile.currency, 700);
    animateValue($('dash-spent'), 0, spent, profile.currency, 700);
    animateValue($('dash-savings'), 0, savings, profile.currency, 700);
    $('dash-savings').className = 's-value ' + (savings<0?'neg':'pos');
    animateValue($('dash-budget-remaining'), 0, budgetRemaining, profile.currency, 700);
    $('dash-budget-remaining').className = 's-value ' + (budgetRemaining<0?'neg':'pos');

    // weekly bar chart (last 7 days of expenses)
    const days = [];
    for(let i=6;i>=0;i--){
      const d = new Date(); d.setDate(d.getDate()-i);
      days.push({ key: d.toISOString().slice(0,10), label: d.toLocaleDateString(undefined,{weekday:'short'}) });
    }
    const byDay = {};
    entries.filter(e=>e.type==='expense').forEach(e=>{ byDay[e.date] = (byDay[e.date]||0) + e.amount; });
    const maxVal = Math.max(1, ...days.map(d=>byDay[d.key]||0));
    const weekTotal = days.reduce((s,d)=>s+(byDay[d.key]||0),0);
    $('week-total-label').textContent = fmt(weekTotal, profile.currency) + ' total';
    const barWrap = $('week-bar-chart');
    barWrap.innerHTML = days.map(d=>{
      const v = byDay[d.key]||0;
      const h = Math.round((v/maxVal)*100);
      return `<div class="bar-col"><div class="bar" style="height:0%" data-h="${h}" title="${fmt(v,profile.currency)}"></div><div class="bar-lab">${d.label}</div></div>`;
    }).join('');
    requestAnimationFrame(()=>{
      barWrap.querySelectorAll('.bar').forEach(b=>{ b.style.height = b.getAttribute('data-h') + '%'; });
    });

    // donut for this month by category
    renderDonutInto($('dash-donut'), list.filter(e=>e.type==='expense'));
  }

  function renderDonutInto(container, list){
    const total = list.reduce((s,e)=>s+e.amount,0);
    if(total <= 0){
      container.innerHTML = `<svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="No spending recorded"><circle cx="75" cy="75" r="56" fill="none" stroke="var(--border)" stroke-width="16"/><text x="75" y="80" text-anchor="middle" font-family="IBM Plex Mono" font-size="12" fill="var(--text-soft)">no spend</text></svg>`;
      return;
    }
    const byCat = {};
    list.forEach(e=> byCat[e.category] = (byCat[e.category]||0) + e.amount);
    const order = allCats().map(c=>c.key).filter(k=>byCat[k]);
    const circ = 2*Math.PI*56;
    let offset = 0, segs = '';
    order.forEach(key=>{
      const val = byCat[key], frac = val/total, len = frac*circ;
      segs += `<circle cx="75" cy="75" r="56" fill="none" stroke="${catInfo(key).color}" stroke-width="16" stroke-dasharray="${len} ${circ-len}" stroke-dashoffset="${-offset}" transform="rotate(-90 75 75)" stroke-linecap="butt"/>`;
      offset += len;
    });
    container.innerHTML = `<svg width="150" height="150" viewBox="0 0 150 150">
      ${segs}
      <text x="75" y="72" text-anchor="middle" font-family="IBM Plex Mono" font-size="10.5" fill="var(--text-soft)">spent</text>
      <text x="75" y="90" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" font-weight="600" fill="var(--text)">${fmt(total, profile.currency)}</text>
    </svg>`;
  }

  // ---------- ADD INCOME ----------
  $('income-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const date = $('inc-date').value, desc = $('inc-desc').value.trim(), amount = parseFloat($('inc-amt').value);
    if(!date || !desc || !(amount>0)) return;
    entries.push({ id: Date.now(), date, desc, category:'income', amount, type:'income' });
    $('inc-desc').value=''; $('inc-amt').value='';
    showToast('Income added', `${desc} · ${fmt(amount, profile.currency)}`, 'success');
    goTo('dashboard');
    saveEntries().catch(()=>{}); // persist in background; UI already updated
  });

  // ---------- RECEIPT UPLOAD (Add Expense) ----------
  let pendingReceipt = '';
  $('exp-receipt-btn').addEventListener('click', ()=> $('exp-receipt').click());
  $('exp-receipt').addEventListener('change', (ev)=>{
    const file = ev.target.files[0];
    if(!file) return;
    if(file.size > 2*1024*1024){
      showToast('Image too large', 'Please choose a bill image under 2MB.', 'warn');
      ev.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = ()=>{
      pendingReceipt = reader.result;
      $('exp-receipt-thumb').src = pendingReceipt;
      $('exp-receipt-preview').classList.remove('hidden');
      $('exp-receipt-filename').textContent = file.name;
    };
    reader.readAsDataURL(file);
  });
  $('exp-receipt-remove').addEventListener('click', ()=>{
    pendingReceipt = '';
    $('exp-receipt').value = '';
    $('exp-receipt-filename').textContent = '';
    $('exp-receipt-preview').classList.add('hidden');
    if($('ocr-status')) $('ocr-status').textContent = '';
  });

  // ---------- RECEIPT OCR ----------
  // Tesseract.js is loaded in index.html. OCR runs in the browser and does not
  // require a BudgetWise backend/database.
  $('exp-ocr-btn').addEventListener('click', async ()=>{
    const file = $('exp-receipt').files[0];
    const status = $('ocr-status');
    if(!file){
      showToast('Upload a bill first','Choose a receipt image, then press Scan OCR.','warn');
      $('exp-receipt').click();
      return;
    }
    if(typeof Tesseract === 'undefined'){
      status.textContent = 'OCR library could not be loaded. Check your internet connection and reload BudgetWise.';
      showToast('OCR unavailable','The OCR library was not loaded.','warn');
      return;
    }

    const setStatus = msg => { if(status) status.textContent = msg; };
    const btn = $('exp-ocr-btn');
    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Scanning…';
    setStatus('Reading receipt… 0%');

    try{
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if(m && m.status === 'recognizing text' && typeof m.progress === 'number'){
            setStatus(`Reading receipt… ${Math.round(m.progress*100)}%`);
          } else if(m && m.status){
            setStatus(`OCR: ${m.status}`);
          }
        }
      });
      const text = (result && result.data && result.data.text || '').replace(/\s+/g,' ').trim();
      if(!text){
        setStatus('No readable text found. Try a clearer, well-lit receipt photo.');
        showToast('OCR found nothing','Try a clearer receipt image.','warn');
        return;
      }

      // Try to extract the most useful fields from common Indian receipts.
      const money = text.match(/(?:₹|Rs\.?|INR\s*)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/ig) || [];
      const numbers = money.map(x=>{
        const m=x.match(/([0-9][0-9,]*(?:\.[0-9]{1,2})?)/); return m ? Number(m[1].replace(/,/g,'')) : 0;
      }).filter(n=>n>0);
      const totalMatches = [
        ...text.matchAll(/(?:grand\s*total|net\s*amount|total\s*(?:amount|due|payable)?|amount\s*payable)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/ig)
      ];
      const total = totalMatches.length
        ? Number(totalMatches[totalMatches.length-1][1].replace(/,/g,''))
        : (numbers.length ? Math.max(...numbers) : 0);

      const dateMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/);
      let parsedDate = '';
      if(dateMatch){
        const raw = dateMatch[1];
        let d,m,y;
        if(/^\d{4}/.test(raw)){ [y,m,d] = raw.split(/[\/\-]/); }
        else { [d,m,y] = raw.split(/[\/\-]/); if(y.length===2) y='20'+y; }
        const iso = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if(!Number.isNaN(new Date(iso).getTime())) parsedDate = iso;
      }

      // Use the first meaningful receipt line as the description/shop name.
      const lines = (result.data.text || '').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
      const shop = lines.find(line=>line.length>=3 && !/^[-:=.\d\s₹$€£]+$/.test(line) && !/^(tax|gst|cgst|sgst|total|subtotal|invoice|receipt|date|time|cash|upi|change)$/i.test(line)) || '';

      if(shop) $('exp-desc').value = shop.slice(0,60);
      if(total>0) $('exp-amt').value = total.toFixed(2);
      if(parsedDate) $('exp-date').value = parsedDate;
      setStatus(`OCR complete${total>0 ? ` · Amount ${fmt(total,profile.currency)}` : ''}${parsedDate ? ` · Date ${parsedDate}` : ''}`);
      showToast('Receipt scanned','Review the extracted details and press Add expense.','success');
    }catch(err){
      console.error('BudgetWise OCR error:', err);
      setStatus('OCR failed. Try a clearer image or reload the page.');
      showToast('OCR failed','The receipt could not be read. Try a clearer image.','warn');
    }finally{
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });

  function resetReceiptField(){
    pendingReceipt = '';
    $('exp-receipt').value = '';
    $('exp-receipt-filename').textContent = '';
    $('exp-receipt-preview').classList.add('hidden');
  }

  // ---------- ADD EXPENSE (+ budget check) ----------
  $('expense-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const date = $('exp-date').value, desc = $('exp-desc').value.trim(), category = $('exp-cat').value, amount = parseFloat($('exp-amt').value);
    const paymentMethod = $('exp-payment').value, location = $('exp-location').value;
    if(!date || !desc || !(amount>0)) return;
    entries.push({ id: Date.now(), date, desc, category, amount, type:'expense', paymentMethod, location, receipt: pendingReceipt });
    saveEntries().catch(()=>{}); // persist in background; UI already updated below
    $('exp-desc').value=''; $('exp-amt').value='';
    resetReceiptField();

    const mk = monthKey(new Date(date+'T00:00:00'));
    const spentInCat = entries.filter(e=>e.type==='expense' && e.category===category && e.date.slice(0,7)===mk)
                               .reduce((s,e)=>s+e.amount,0);
    const budget = budgets[category];
    const slot = $('expense-alert-slot');
    if(profile.alertsOn && budget && spentInCat > budget){
      const cat = catInfo(category);
      slot.innerHTML = `
        <div class="alert-banner">
          <div>
            <div class="a-title">Budget exceeded — ${cat.name}</div>
            <div class="a-body">You've spent ${fmt(spentInCat, profile.currency)} of a ${fmt(budget, profile.currency)} monthly budget.</div>
          </div>
          <button type="button" aria-label="Dismiss">&#10005;</button>
        </div>`;
      slot.querySelector('button').addEventListener('click', ()=> slot.innerHTML = '');
      showToast('Budget exceeded', `${cat.name}: ${fmt(spentInCat, profile.currency)} of ${fmt(budget, profile.currency)}`, 'danger');
    } else if(profile.alertsOn && budget && spentInCat > budget*0.8){
      const cat = catInfo(category);
      slot.innerHTML = `
        <div class="alert-banner warn">
          <div>
            <div class="a-title">Nearing budget — ${cat.name}</div>
            <div class="a-body">You've used ${Math.round((spentInCat/budget)*100)}% of this month's ${fmt(budget, profile.currency)} budget.</div>
          </div>
          <button type="button" aria-label="Dismiss">&#10005;</button>
        </div>`;
      slot.querySelector('button').addEventListener('click', ()=> slot.innerHTML = '');
      showToast('Nearing budget limit', `${cat.name} is at ${Math.round((spentInCat/budget)*100)}% for this month`, 'warn');
    } else {
      slot.innerHTML = `<div class="continue-banner">Entry added. Within budget — all good.</div>`;
      setTimeout(()=>{ slot.innerHTML=''; }, 3500);
      showToast('Expense added', `${desc} · ${fmt(amount, profile.currency)}`, 'success');
    }
  });

  // ---------- SET BUDGET ----------
  function renderBudgetList(){
    const list = currentMonthEntries().filter(e=>e.type==='expense');
    const byCat = {};
    list.forEach(e=> byCat[e.category] = (byCat[e.category]||0) + e.amount);
    const wrap = $('budget-list');
    wrap.innerHTML = '';
    allCats().forEach(cat=>{
      const spent = byCat[cat.key] || 0;
      const budget = budgets[cat.key] || 0;
      const pct = budget > 0 ? Math.min(100, (spent/budget)*100) : 0;
      const over = budget > 0 && spent > budget;
      const warn = budget > 0 && !over && spent > budget*0.8;
      const row = document.createElement('div');
      row.className = 'budget-row';
      row.innerHTML = `
        <span class="cat-dot" style="background:${cat.color}"></span>
        <span class="cat-name">${cat.name}</span>
        <input type="number" min="0" step="1" placeholder="Monthly limit" value="${budgets[cat.key]||''}" data-cat="${cat.key}">
        <div class="bar-track"><div class="bar-fill ${over?'over':(warn?'warn':'')}" style="width:${pct}%"></div></div>
        <span class="spent-note">${fmt(spent, profile.currency)}${budget? ' / '+fmt(budget, profile.currency):''}</span>
      `;
      wrap.appendChild(row);
      const input = row.querySelector('input');
      input.addEventListener('change', ()=>{
        const v = parseFloat(input.value);
        if(v > 0) budgets[cat.key] = v; else delete budgets[cat.key];
        saveBudgets().catch(()=>{});
        renderBudgetList();
        showToast('Budget updated', v>0 ? `${cat.name} limit set to ${fmt(v, profile.currency)}` : `${cat.name} limit removed`, 'success');
      });
    });
  }

  // ---------- REPORTS ----------
  function renderReports(){
    const list = currentMonthEntries().filter(e=>e.type==='expense');
    $('reports-month').textContent = new Date().toLocaleDateString(undefined,{month:'long', year:'numeric'});
    const total = list.reduce((s,e)=>s+e.amount,0);
    renderDonutInto($('report-donut'), list);
    const legend = $('report-legend');
    if(total <= 0){
      legend.innerHTML = '<div class="empty-note">Nothing to report yet this month.</div>';
      return;
    }
    const byCat = {};
    list.forEach(e=> byCat[e.category] = (byCat[e.category]||0) + e.amount);
    const order = allCats().map(c=>c.key).filter(k=>byCat[k]);
    legend.innerHTML = order.map(key=>{
      const cat = catInfo(key), val = byCat[key], pct = ((val/total)*100).toFixed(0);
      return `<div class="legend-row"><span class="cat-dot" style="background:${cat.color}"></span>${cat.name}<span class="legend-amt">${fmt(val, profile.currency)} · ${pct}%</span></div>`;
    }).join('');
  }

  // ---------- TRANSACTIONS ----------
  let lastFilteredTx = []; // used by export/print
  function populateMonthFilter(){
    const months = Array.from(new Set(entries.map(e=>e.date.slice(0,7)))).sort().reverse();
    const prev = $('filter-month').value;
    $('filter-month').innerHTML = '<option value="all">All months</option>' + months.map(m=>{
      const label = new Date(m+'-01T00:00:00').toLocaleDateString(undefined,{month:'long', year:'numeric'});
      return `<option value="${m}">${label}</option>`;
    }).join('');
    if(prev && months.includes(prev)) $('filter-month').value = prev;
  }
  function renderTransactions(){
    populateMonthFilter();
    const typeF = $('filter-type').value, catF = $('filter-cat').value, q = $('filter-search').value.trim().toLowerCase();
    const dateF = $('filter-date').value, monthF = $('filter-month').value, amountF = $('filter-amount').value.trim();
    let list = [...entries].sort((a,b)=> b.date.localeCompare(a.date) || b.id-a.id);
    if(typeF !== 'all') list = list.filter(e=>e.type===typeF);
    if(catF !== 'all') list = list.filter(e=>e.category===catF);
    if(q) list = list.filter(e=>e.desc.toLowerCase().includes(q));
    if(dateF) list = list.filter(e=>e.date === dateF);
    if(monthF && monthF !== 'all') list = list.filter(e=>e.date.slice(0,7) === monthF);
    if(amountF !== '') list = list.filter(e=> Math.abs(e.amount - parseFloat(amountF)) < 0.005);
    lastFilteredTx = list;
    const body = $('tx-body');
    body.innerHTML = '';
    $('tx-empty').classList.toggle('hidden', list.length>0);
    list.forEach(e=>{
      const cat = e.type==='income' ? {name:'Income', color:'#10B981'} : catInfo(e.category);
      const d = new Date(e.date+'T00:00:00');
      const meta = [e.paymentMethod, e.location].filter(Boolean).join(' · ');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.toLocaleDateString(undefined,{month:'short', day:'numeric'})}</td>
        <td>${esc(e.desc)}${meta ? `<div style="font-size:11px; color:var(--text-faint); margin-top:2px;">${esc(meta)}</div>` : ''}</td>
        <td><span class="cat-dot" style="background:${cat.color}; display:inline-block; margin-right:6px;"></span>${cat.name}</td>
        <td class="amt ${e.type==='income'?'pos':'neg'}">${e.type==='income'?'+':'-'}${fmt(e.amount, profile.currency)}</td>
        <td style="white-space:nowrap;">
          ${e.receipt ? `<button class="del-btn" data-receipt="${e.id}" aria-label="View receipt" title="View receipt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;"><path d="M6 4h9l3 3v13H6z"/><circle cx="10" cy="12" r="1.5"/><path d="M8 17l3-3 2 2 3-4"/></svg></button>` : ''}
          <button class="del-btn" data-id="${e.id}" aria-label="Delete">&#10005;</button>
        </td>
      `;
      body.appendChild(tr);
    });
    body.querySelectorAll('[data-receipt]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const entry = entries.find(e=>e.id === Number(btn.getAttribute('data-receipt')));
        if(entry && entry.receipt){
          const win = window.open();
          win.document.write(`<title>Receipt</title><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${entry.receipt}" style="max-width:100%;max-height:100vh;"></body>`);
        }
      });
    });
    body.querySelectorAll('.del-btn[data-id]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        entries = entries.filter(e=> e.id !== Number(btn.getAttribute('data-id')));
        saveEntries().catch(()=>{});
        renderTransactions();
        showToast('Transaction deleted', 'The entry has been removed.', 'info');
      });
    });
  }
  $('filter-type').addEventListener('change', renderTransactions);
  $('filter-cat').addEventListener('change', renderTransactions);
  $('filter-search').addEventListener('input', renderTransactions);
  $('filter-date').addEventListener('change', renderTransactions);
  $('filter-month').addEventListener('change', renderTransactions);
  $('filter-amount').addEventListener('input', renderTransactions);

  // ---------- EXPORT & PRINT ----------
  function exportRows(){
    return lastFilteredTx.map(e=>({
      Date: e.date,
      Description: e.desc,
      Category: e.type==='income' ? 'Income' : catInfo(e.category).name,
      Type: e.type,
      Amount: e.amount,
      PaymentMethod: e.paymentMethod || '',
      Location: e.location || '',
    }));
  }
  $('btn-print-report').addEventListener('click', ()=> window.print());

  $('btn-export-excel').addEventListener('click', ()=>{
    const rows = exportRows();
    if(rows.length === 0){ showToast('Nothing to export', 'No transactions match your current filters.', 'warn'); return; }
    if(typeof XLSX === 'undefined'){ showToast('Export unavailable', 'The Excel export library failed to load. Check your internet connection.', 'danger'); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `budgetwise-transactions-${new Date().toISOString().slice(0,10)}.xlsx`);
    showToast('Excel exported', `${rows.length} transactions exported.`, 'success');
  });

  $('btn-export-pdf').addEventListener('click', ()=>{
    const rows = exportRows();
    if(rows.length === 0){ showToast('Nothing to export', 'No transactions match your current filters.', 'warn'); return; }
    if(typeof window.jspdf === 'undefined'){ showToast('Export unavailable', 'The PDF export library failed to load. Check your internet connection.', 'danger'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text('BudgetWise — Transactions Report', 14, 18);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text(`Generated ${new Date().toLocaleDateString()} · ${rows.length} transactions`, 14, 25);
    let y = 36;
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 14, y); doc.text('Description', 44, y); doc.text('Category', 116, y); doc.text('Amount', 178, y, {align:'right'});
    doc.setFont('helvetica', 'normal');
    y += 6;
    doc.setDrawColor(200); doc.line(14, y-4, 196, y-4);
    rows.forEach(r=>{
      if(y > 280){ doc.addPage(); y = 20; }
      const amtStr = (r.Type==='income'?'+':'-') + profile.currency + Math.abs(r.Amount).toFixed(2);
      doc.text(r.Date, 14, y);
      doc.text(String(r.Description).slice(0,32), 44, y);
      doc.text(r.Category, 116, y);
      doc.text(amtStr, 178, y, {align:'right'});
      y += 7;
    });
    doc.save(`budgetwise-transactions-${new Date().toISOString().slice(0,10)}.pdf`);
    showToast('PDF exported', `${rows.length} transactions exported.`, 'success');
  });

  // ---------- SMART FEATURES / AI ENGINE ----------
  // This is a local, rule-based intelligence layer. It uses the user's own
  // BudgetWise data; no external AI API or server is required.
  const expenseRows = () => entries.filter(e => e.type === 'expense' && Number(e.amount) > 0);
  const monthTotal = mk => expenseRows().filter(e => e.date.slice(0,7) === mk).reduce((s,e)=>s+Number(e.amount),0);
  const monthLabel = mk => new Date(mk+'-01T00:00:00').toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const previousMonthKey = (baseDate = new Date()) => { const d = new Date(baseDate.getFullYear(), baseDate.getMonth()-1, 1); return monthKey(d); };

  function lastCompletedMonthKeys(count=3){
    const out=[]; const d=new Date(); d.setDate(1);
    for(let i=1;i<=count;i++){ d.setMonth(d.getMonth()-1); out.push(monthKey(d)); }
    return out;
  }

  function categoryTotalsForMonth(mk){
    const out={};
    expenseRows().filter(e=>e.date.slice(0,7)===mk).forEach(e=> out[e.category]=(out[e.category]||0)+Number(e.amount));
    return out;
  }

  function smartPrediction(){
    const current = monthTotal(monthKey(new Date()));
    const previous = lastCompletedMonthKeys(3).map(monthTotal);
    const history = previous.filter(v=>v>0);
    if(!history.length) return { value: current, note: current>0 ? 'Using this month\'s spending because there is not enough past history yet.' : 'Add a few expenses first so BudgetWise can learn your spending pattern.' };
    const avg = history.reduce((a,b)=>a+b,0)/history.length;
    // Blend historical average with the current month so a sudden change is noticed.
    const value = current>0 ? (avg*0.6 + current*0.4) : avg;
    return { value, note:`Based on ${history.length} previous month${history.length===1?'':'s'}${current>0?' and your current spending':''}.` };
  }

  function unusualExpenses(){
    const byCat={}; expenseRows().forEach(e=>{ (byCat[e.category] ||= []).push(Number(e.amount)); });
    const flags=[];
    Object.entries(byCat).forEach(([cat,vals])=>{
      if(vals.length<3) return;
      const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
      vals.forEach(v=>{
        if(v > Math.max(avg*2.5, avg+1000)) flags.push({amount:v,category:cat,average:avg});
      });
    });
    return flags.sort((a,b)=>b.amount-a.amount).slice(0,5);
  }

  function smartSuggestions(){
    const mk=monthKey(new Date()), totals=categoryTotalsForMonth(mk), total=Object.values(totals).reduce((a,b)=>a+b,0);
    const suggestions=[];
    Object.entries(totals).sort((a,b)=>b[1]-a[1]).forEach(([cat,val])=>{
      const budget=Number(budgets[cat]||0);
      if(budget>0 && val>budget){ suggestions.push(`Your ${catInfo(cat).name} spending is over budget. Cutting it by 10% could save about ${fmt(val*0.10,profile.currency)}.`); }
      else if(total>0 && val/total>=0.25){ suggestions.push(`${catInfo(cat).name} is one of your biggest expenses. Reducing it by 10% could save about ${fmt(val*0.10,profile.currency)}.`); }
    });
    if(!suggestions.length && total>0) suggestions.push(`You are currently spending ${fmt(total,profile.currency)} this month. Try setting a budget for your top category to control future spending.`);
    if(!suggestions.length) suggestions.push('Add more expenses and budgets to receive personalized saving suggestions.');
    return suggestions.slice(0,3);
  }

  function smartBudgetRecommendations(){
    const keys=lastCompletedMonthKeys(3); const all={};
    keys.forEach(mk=>{ const t=categoryTotalsForMonth(mk); Object.entries(t).forEach(([cat,v])=>{ (all[cat] ||= []).push(v); }); });
    return Object.entries(all).map(([cat,vals])=>{
      const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
      return {cat, value:Math.ceil((avg*1.10)/100)*100};
    }).sort((a,b)=>b.value-a.value).slice(0,8);
  }

  function monthlySummaryHTML(){
    const mk=monthKey(new Date()), cur=entries.filter(e=>e.date.slice(0,7)===mk), prev=previousMonthKey();
    const income=cur.filter(e=>e.type==='income').reduce((s,e)=>s+Number(e.amount),0);
    const expense=cur.filter(e=>e.type==='expense').reduce((s,e)=>s+Number(e.amount),0);
    const prevExpense=monthTotal(prev), change=prevExpense ? ((expense-prevExpense)/prevExpense)*100 : null;
    const totals=categoryTotalsForMonth(mk); const top=Object.entries(totals).sort((a,b)=>b[1]-a[1])[0];
    return `<div class="smart-summary-grid">
      <div><span>Income</span><strong>${fmt(income,profile.currency)}</strong></div>
      <div><span>Expenses</span><strong>${fmt(expense,profile.currency)}</strong></div>
      <div><span>Savings</span><strong>${fmt(income-expense,profile.currency)}</strong></div>
      <div><span>Top category</span><strong>${top ? esc(catInfo(top[0]).name) : '—'}</strong></div>
    </div>
    <p>${change===null ? `No previous-month comparison is available yet.` : `Compared with ${monthLabel(prev)}, expenses are ${Math.abs(change).toFixed(0)}% ${change>0?'higher':'lower'}.`}</p>`;
  }

  function renderSmartFeatures(){
    if($('reminder-list')) renderReminders();
    if($('subscription-list')) renderSubscriptions();
    if($('emi-list')) renderEMIs();
    renderExpenseCalendar(); renderSmartAnalytics();
  }

  // Lightweight local storage for the non-transaction smart modules.
  let smartData = {reminders:[],subscriptions:[],emis:[]};
  async function loadSmartData(){ smartData = await storeGet('smart:'+currentUser,{reminders:[],subscriptions:[],emis:[]}); }
  async function saveSmartData(){ await storeSet('smart:'+currentUser,smartData); }

  function renderReminders(){
    const el=$('reminder-list'); if(!el) return;
    el.innerHTML=smartData.reminders.length ? smartData.reminders.map((r,i)=>`<div class="mini-row"><div><strong>${esc(r.name)}</strong><small>${r.date} · ${r.amount?fmt(r.amount,profile.currency):'Amount not set'} · ${r.frequency}</small></div><button class="link-btn" data-reminder="${i}">Delete</button></div>`).join('') : '<div class="empty-note">No reminders yet.</div>';
    el.querySelectorAll('[data-reminder]').forEach(b=>b.onclick=async()=>{smartData.reminders.splice(Number(b.dataset.reminder),1);await saveSmartData();renderReminders();});
  }
  function renderSubscriptions(){
    const el=$('subscription-list'); if(!el) return;
    const monthly=smartData.subscriptions.reduce((s,x)=>s+(x.cycle==='monthly'?x.amount:x.amount/12),0);
    el.innerHTML=`<div class="mini-total">Monthly cost: <strong>${fmt(monthly,profile.currency)}</strong> · Yearly: <strong>${fmt(monthly*12,profile.currency)}</strong></div>` + (smartData.subscriptions.length ? smartData.subscriptions.map((r,i)=>`<div class="mini-row"><div><strong>${esc(r.name)}</strong><small>${fmt(r.amount,profile.currency)} · ${r.cycle} · next ${r.nextDate}</small></div><button class="link-btn" data-sub="${i}">Delete</button></div>`).join('') : '<div class="empty-note">No subscriptions yet.</div>');
    el.querySelectorAll('[data-sub]').forEach(b=>b.onclick=async()=>{smartData.subscriptions.splice(Number(b.dataset.sub),1);await saveSmartData();renderSubscriptions();});
  }
  function renderEMIs(){
    const el=$('emi-list'); if(!el) return;
    el.innerHTML=smartData.emis.length ? smartData.emis.map((e,i)=>{const paid=Math.min(e.paid,e.total), pending=Math.max(0,e.total-paid), remaining=Math.max(0,e.loan-e.monthly*paid); return `<div class="mini-row"><div><strong>${esc(e.name)}</strong><small>${fmt(e.monthly,profile.currency)}/month · Paid ${paid}/${e.total} · Pending ${pending} · Remaining ${fmt(remaining,profile.currency)}</small></div><button class="link-btn" data-emi="${i}">Delete</button></div>`;}).join('') : '<div class="empty-note">No EMIs added yet.</div>';
    el.querySelectorAll('[data-emi]').forEach(b=>b.onclick=async()=>{smartData.emis.splice(Number(b.dataset.emi),1);await saveSmartData();renderEMIs();});
  }

  function renderExpenseCalendar(){
    const wrap=$('expense-calendar'); if(!wrap) return;
    if(!window._bwCal) window._bwCal={date:new Date()};
    const d=window._bwCal.date, y=d.getFullYear(), m=d.getMonth();
    $('cal-title').textContent=d.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate();
    const totals={}; expenseRows().forEach(e=>{if(e.date.slice(0,7)===`${y}-${String(m+1).padStart(2,'0')}`) totals[Number(e.date.slice(8,10))]=(totals[Number(e.date.slice(8,10))]||0)+Number(e.amount);});
    const max=Math.max(1,...Object.values(totals)); let html=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="cal-weekday">${x}</div>`).join('');
    for(let i=0;i<first;i++) html+='<div class="cal-day empty"></div>';
    for(let day=1;day<=days;day++){const v=totals[day]||0,p=Math.min(1,v/max);html+=`<div class="cal-day" style="--heat:${p}"><b>${day}</b>${v?`<small>${fmt(v,profile.currency)}</small>`:''}</div>`;}
    wrap.innerHTML=html;
  }
  function renderSmartAnalytics(){
    const catEl=$('category-analysis'), monEl=$('monthly-comparison'), payEl=$('payment-analysis'), locEl=$('location-analysis');
    const mk=monthKey(new Date()), cur=expenseRows().filter(e=>e.date.slice(0,7)===mk), prev=expenseRows().filter(e=>e.date.slice(0,7)===previousMonthKey());
    const group=(arr,key)=>{const o={};arr.forEach(e=>{const k=e[key]||'Not specified';o[k]=(o[k]||0)+Number(e.amount);});return Object.entries(o).sort((a,b)=>b[1]-a[1]);};
    if(catEl){const rows=group(cur,'category');catEl.innerHTML=rows.length?rows.map(([k,v])=>`<div class="analysis-row"><span>${esc(catInfo(k).name)}</span><strong>${fmt(v,profile.currency)}</strong></div>`).join(''):'<div class="empty-note">No expenses this month.</div>';}
    if(monEl){const vals=[...lastCompletedMonthKeys(4).reverse(),mk].map(k=>[k,monthTotal(k)]);monEl.innerHTML=vals.map(([k,v])=>`<div class="analysis-row"><span>${monthLabel(k)}</span><strong>${fmt(v,profile.currency)}</strong></div>`).join('');}
    if(payEl){const rows=group(cur,'paymentMethod');payEl.innerHTML=rows.length?rows.map(([k,v])=>`<div class="analysis-row"><span>${esc(k)}</span><strong>${fmt(v,profile.currency)}</strong></div>`).join(''):'<div class="empty-note">No payment-method data.</div>';}
    if(locEl){const rows=group(cur,'location');locEl.innerHTML=rows.length?rows.map(([k,v])=>`<div class="analysis-row"><span>${esc(k)}</span><strong>${fmt(v,profile.currency)}</strong></div>`).join(''):'<div class="empty-note">No location data.</div>';}
  }

  $('reminder-form').addEventListener('submit',async ev=>{ev.preventDefault();smartData.reminders.push({name:$('reminder-name').value.trim(),date:$('reminder-date').value,amount:Number($('reminder-amount').value)||0,frequency:$('reminder-frequency').value});await saveSmartData();ev.target.reset();renderReminders();showToast('Reminder added','Your payment reminder was saved.','success');});
  $('subscription-form').addEventListener('submit',async ev=>{ev.preventDefault();smartData.subscriptions.push({name:$('sub-name').value.trim(),amount:Number($('sub-amount').value),cycle:$('sub-cycle').value,nextDate:$('sub-next-date').value});await saveSmartData();ev.target.reset();renderSubscriptions();showToast('Subscription added','Recurring cost is now tracked.','success');});
  $('emi-calc-btn').addEventListener('click',()=>{const P=Number($('emi-principal').value),r=Number($('emi-rate').value)/1200,n=Number($('emi-tenure').value);if(!(P>0&&n>0)){ $('emi-result').textContent='Enter loan amount and tenure.';return;}const emi=r?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):P/n;const total=emi*n; $('emi-result').innerHTML=`Monthly EMI: <strong>${fmt(emi,profile.currency)}</strong><br>Total repayment: <strong>${fmt(total,profile.currency)}</strong><br>Total interest: <strong>${fmt(total-P,profile.currency)}</strong>`;});
  $('emi-form').addEventListener('submit',async ev=>{ev.preventDefault();smartData.emis.push({name:$('emi-name').value.trim(),loan:Number($('emi-loan').value),monthly:Number($('emi-monthly').value),start:$('emi-start').value,dueDay:Number($('emi-due-day').value),paid:Number($('emi-paid').value)||0,total:Number($('emi-total-count').value)});await saveSmartData();ev.target.reset();renderEMIs();showToast('EMI added','Your EMI is now being tracked.','success');});
  $('cal-prev').addEventListener('click',()=>{window._bwCal.date.setMonth(window._bwCal.date.getMonth()-1);renderExpenseCalendar();});
  $('cal-next').addEventListener('click',()=>{window._bwCal.date.setMonth(window._bwCal.date.getMonth()+1);renderExpenseCalendar();});

  $('run-insights-btn').addEventListener('click',()=>{
    const p=smartPrediction(), flags=unusualExpenses(), suggestions=smartSuggestions();
    const flagHtml=flags.length?flags.map(f=>`<div class="insight warn">⚠️ Unusual ${esc(catInfo(f.category).name)} expense: <strong>${fmt(f.amount,profile.currency)}</strong> (usual average ≈ ${fmt(f.average,profile.currency)})</div>`).join(''):'<div class="insight ok">✓ No unusually large expenses detected.</div>';
    $('smart-output').innerHTML=`<div class="insight-grid"><div class="insight"><span>🔮 Predicted next-month spending</span><strong>${fmt(p.value,profile.currency)}</strong><small>${esc(p.note)}</small></div>${flagHtml}</div><h4>💡 Saving suggestions</h4>${suggestions.map(x=>`<div class="insight">${esc(x)}</div>`).join('')}`;
  });
  $('monthly-summary-btn').addEventListener('click',()=>{ $('smart-output').innerHTML=`<h4>📊 ${monthLabel(monthKey(new Date()))} summary</h4>${monthlySummaryHTML()}`; });
  $('smart-budget-btn').addEventListener('click',()=>{const rows=smartBudgetRecommendations();$('smart-output').innerHTML=rows.length?`<h4>💡 Suggested monthly budgets</h4>${rows.map(r=>`<div class="analysis-row"><span>${esc(catInfo(r.cat).name)}</span><strong>${fmt(r.value,profile.currency)}</strong></div>`).join('')}`:'<div class="insight">Add expenses from a few months to get budget recommendations.</div>';});

  // ---------- VOICE EXPENSE ----------
  $('voice-expense-btn').addEventListener('click',()=>{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){
      showToast('Voice unavailable','Speech recognition is not supported by this browser. Use Chrome/Edge and allow microphone access.','warn');
      return;
    }

    const rec = new SR();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    let finished = false;

    const parseVoiceExpense = raw => {
      const text = (raw || '').trim();
      const lower = text.toLowerCase();
      // Handles: "I spent 350 on lunch", "spent rupees 350 on food",
      // "food 350", and common spoken-number forms such as "three hundred fifty".
      const digit = text.match(/(?:₹|rs\.?|inr|rupees?)?\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i);
      let amount = digit ? Number(digit[1].replace(/,/g,'')) : 0;
      if(!amount){
        const words = {zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,thousand:1000};
        const m = lower.match(/(?:spent|cost|paid|pay|rupees?|rs\.?)?\s*((?:[a-z]+\s+){0,5})(?:rupees?|rs\.?)?\s*(?:on|for)?/i);
        if(m && m[1]){
          const ws=m[1].trim().split(/\s+/).filter(Boolean); let total=0, current=0;
          ws.forEach(w=>{if(words[w]===100||words[w]===1000){current=(current||1)*words[w]; total+=current; current=0;}else if(words[w]!=null) current+=words[w];});
          amount=total+current;
        }
      }
      const categories = [
        ['food',['food','lunch','dinner','breakfast','meal','restaurant','grocery','groceries','snack']],
        ['transport',['uber','ola','bus','train','fuel','petrol','diesel','transport','auto','rickshaw','cab']],
        ['shopping',['shopping','clothes','amazon','flipkart','purchase','bought']],
        ['entertain',['movie','netflix','spotify','entertainment','game','gaming']],
        ['health',['medicine','doctor','hospital','health','pharmacy']],
        ['housing',['rent','house','housing']],
        ['utilities',['electricity','electric','water bill','internet','wifi','utility']]
      ];
      const cat = (categories.find(([key,arr])=>arr.some(w=>lower.includes(w))) || ['other'])[0];
      return {text,amount,cat};
    };

    rec.onstart = ()=>showToast('Listening','Say: “I spent 350 rupees on lunch.”','info');
    rec.onresult = ev=>{
      finished = true;
      const result = ev.results[0][0];
      const parsed = parseVoiceExpense(result.transcript);
      $('exp-desc').value = parsed.text.slice(0,60);
      $('exp-amt').value = parsed.amount || '';
      $('exp-cat').value = allCats().some(c=>c.key===parsed.cat) ? parsed.cat : 'other';
      goTo('add-expense');
      if(parsed.amount>0) showToast('Voice captured',`${parsed.text} · ${fmt(parsed.amount,profile.currency)}. Review and press Add expense.`,'success');
      else showToast('Voice captured','I heard you, but could not find an amount. Please enter the amount and press Add expense.','warn');
    };
    rec.onerror = ev=>{
      const map={'not-allowed':'Microphone permission was denied. Allow microphone access for BudgetWise.','no-speech':'No speech was detected. Try speaking closer to the microphone.','audio-capture':'No microphone was found.','network':'Speech recognition needs an internet connection in this browser.','language-not-supported':'English (India) speech recognition is not available.'};
      showToast('Voice input failed',map[ev.error]||'Please try again and allow microphone access.','warn');
    };
    rec.onend = ()=>{ if(!finished) console.log('BudgetWise voice recognition ended without a result.'); };
    try{ rec.start(); }catch(err){ console.error('BudgetWise voice start error:',err); showToast('Voice could not start','Try again after allowing microphone access.','warn'); }
  });

  // ---------- SETTINGS ----------
  function renderSettings(){
    $('prof-name').value = profile.name || currentUser;
    $('prof-currency').value = profile.currency || '₹';
    $('prof-language').value = profile.language || 'en';
    $('prof-email').value = profile.email || '';
    $('prof-phone').value = profile.phone || '';
    updateAvatarDisplays();
    $('alerts-toggle').style.opacity = profile.alertsOn ? '1' : '.5';
    renderVerifyBadge();
    $('pw-msg').textContent = '';
  }
  function renderVerifyBadge(){
    const badge = $('settings-verify-badge');
    if(!profile.email){ badge.innerHTML = ''; return; }
    badge.innerHTML = profile.emailVerified
      ? `<span class="verify-badge yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>Verified</span>`
      : `<span class="verify-badge no">Not verified</span>`;
  }
  $('profile-form').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const newEmail = $('prof-email').value.trim();
    if(newEmail !== profile.email) profile.emailVerified = false; // email changed -> re-verify
    profile.name = $('prof-name').value.trim() || currentUser;
    profile.currency = $('prof-currency').value || '₹';
    profile.language = $('prof-language').value || 'en';
    profile.email = newEmail;
    profile.phone = $('prof-phone').value.trim();
    await saveProfile();
    $('welcome-name').textContent = profile.name;
    updateAvatarDisplays();
    applyLanguage();
    renderSettings();
    showToast('Settings saved', 'Your profile changes have been saved.', 'success');
  });
  // Apply language instantly on change, without waiting for Save
  $('prof-language').addEventListener('change', async ()=>{
    profile.language = $('prof-language').value;
    await saveProfile();
    applyLanguage();
  });
  $('prof-currency').addEventListener('change', async ()=>{
    profile.currency = $('prof-currency').value;
    await saveProfile();
    showToast('Currency updated', `Now showing amounts in ${profile.currency}.`, 'success');
  });

  // ---------- PROFILE PICTURE ----------
  $('avatar-upload-btn').addEventListener('click', ()=> $('avatar-file-input').click());
  $('avatar-file-input').addEventListener('change', async (ev)=>{
    const file = ev.target.files[0];
    if(!file) return;
    if(file.size > 1.5*1024*1024){
      showToast('Image too large', 'Please choose an image under 1.5MB.', 'warn');
      return;
    }
    const reader = new FileReader();
    reader.onload = async ()=>{
      profile.photo = reader.result;
      await saveProfile();
      updateAvatarDisplays();
      showToast('Photo updated', 'Your profile picture has been changed.', 'success');
    };
    reader.readAsDataURL(file);
  });
  $('avatar-remove-btn').addEventListener('click', async ()=>{
    profile.photo = '';
    await saveProfile();
    updateAvatarDisplays();
    showToast('Photo removed', 'Reverted to initials avatar.', 'info');
  });

  // ---------- CHANGE PASSWORD ----------
  $('password-form').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const cur = $('pw-current').value, next = $('pw-new').value, confirm = $('pw-confirm').value;
    const msg = $('pw-msg');
    await loadUsers();
    if(users[currentUser] !== cur){ msg.textContent = 'Current password is incorrect.'; msg.className='form-msg err'; return; }
    if(next.length < 6){ msg.textContent = 'New password must be at least 6 characters.'; msg.className='form-msg err'; return; }
    if(next !== confirm){ msg.textContent = 'New password and confirmation do not match.'; msg.className='form-msg err'; return; }
    users[currentUser] = next;
    await saveUsers();
    msg.textContent = 'Password updated.'; msg.className='form-msg ok';
    $('pw-current').value=''; $('pw-new').value=''; $('pw-confirm').value='';
    showToast('Password changed', 'Your password has been updated.', 'success');
  });

  // ---------- EMAIL VERIFICATION ----------
  let pendingVerifyCode = null;
  function openVerifyModal(){
    $('ve-email').value = profile.email || '';
    $('verify-email-code-block').classList.add('hidden');
    $('verify-email-input-field').classList.remove('hidden');
    $('ve-action-btn').textContent = 'Send code';
    $('ve-msg').textContent = '';
    pendingVerifyCode = null;
    $('modal-verify-email').classList.remove('hidden');
  }
  $('settings-verify-btn').addEventListener('click', openVerifyModal);
  $('ve-action-btn').addEventListener('click', async ()=>{
    const msg = $('ve-msg');
    if(pendingVerifyCode === null){
      const email = $('ve-email').value.trim();
      if(!email || !email.includes('@')){ msg.textContent = 'Enter a valid email address.'; msg.className='form-msg err'; return; }
      pendingVerifyCode = String(Math.floor(100000 + Math.random()*900000));
      $('ve-generated-code').textContent = pendingVerifyCode;
      $('verify-email-code-block').classList.remove('hidden');
      $('verify-email-input-field').classList.add('hidden');
      $('ve-action-btn').textContent = 'Confirm code';
      msg.textContent = ''; msg.className='form-msg';
      profile.email = email;
    } else {
      const entered = $('ve-code').value.trim();
      if(entered !== pendingVerifyCode){ msg.textContent = 'That code doesn\'t match. Try again.'; msg.className='form-msg err'; return; }
      profile.emailVerified = true;
      await saveProfile();
      renderVerifyBadge();
      $('modal-verify-email').classList.add('hidden');
      showToast('Email verified', `${profile.email} is now confirmed.`, 'success');
    }
  });

  // ---------- INIT: resume session if present ----------
  async function init(){
    const [u, session] = await Promise.all([
      storeGet('app-users', {}),
      storeGet('app-session', ''),
    ]);
    users = u;
    if(session && users[session]){
      currentUser = session;
      await enterApp();
    }
  }
  init();
})();
