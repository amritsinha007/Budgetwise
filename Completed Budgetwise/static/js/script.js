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
      lbl_currency:'Currency', lbl_language:'Language',
      nav_bills:'Bills', pt_bills:'Bill reminders', ps_bills:'Track upcoming, due-soon, overdue and paid bills — nothing slips through.',
      stat_bills_pending:'Pending bills',
      nav_subs:'Subscriptions', pt_subs:'Subscriptions', ps_subs:'Track recurring subscriptions and see what they cost you each month and year.',
      nav_emi:'EMI', pt_emi:'EMI calculator', ps_emi:'Work out a monthly instalment, then save it as an EMI to track.',
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
      lbl_currency:'मुद्रा', lbl_language:'भाषा',
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
      lbl_currency:'ચલણ', lbl_language:'ભાષા',
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
  const TITLE_KEYS = { dashboard:'nav_dashboard', 'add-income':'nav_add_income', 'add-expense':'nav_add_expense', budget:'nav_budget', bills:'nav_bills', subs:'nav_subs', emi:'nav_emi', reports:'nav_reports', transactions:'nav_transactions', settings:'nav_settings' };

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
  let bills = [];
  let billFilter = 'all';
  let subscriptions = [];
  let subFilter = 'all';
  let emis = [];
  let emiFilter = 'all';
  let profile = { name:'', currency:'₹', darkMode:false, alertsOn:true, email:'', phone:'', photo:'', emailVerified:false, language:'en' };

  // ---------- FLASK + SQLITE STORAGE ----------
  async function storeGet(key, fallback){
    try{
      const r = await fetch('/api/storage?key=' + encodeURIComponent(key), {credentials:'same-origin'});
      if(!r.ok) return fallback;
      const data = await r.json();
      return data.exists ? data.value : fallback;
    }catch(e){ console.error('Database read failed:', e); return fallback; }
  }
  async function storeSet(key, val){
    try{
      const r = await fetch('/api/storage', {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,value:val})});
      if(!r.ok) throw new Error('Database write failed');
      return true;
    }catch(e){ console.error('Database write failed:', e); showToast('Database error','Could not save your changes to SQLite.','danger'); return false; }
  }
  async function loadUsers(){ users = await storeGet('app-users', {}); }
  async function saveUsers(){ await storeSet('app-users', users); }
  async function loadUserData(){
    const [e,b,c,p,bl,sb,em] = await Promise.all([
      storeGet('entries:'+currentUser, []), storeGet('budgets:'+currentUser, {}), storeGet('categories:'+currentUser, []),
      storeGet('profile:'+currentUser, {name:currentUser,currency:'₹',darkMode:false,alertsOn:true,email:'',phone:'',photo:'',emailVerified:false,language:'en'}),
      storeGet('bills:'+currentUser, []), storeGet('subscriptions:'+currentUser, []), storeGet('emis:'+currentUser, [])
    ]);
    entries=e; budgets=b; customCats=c; profile=p; bills=bl; subscriptions=sb; emis=em;
  }
  async function saveEntries(){ await storeSet('entries:'+currentUser, entries); }
  async function saveBudgets(){ await storeSet('budgets:'+currentUser, budgets); }
  async function saveCustomCats(){ await storeSet('categories:'+currentUser, customCats); }
  async function saveProfile(){ await storeSet('profile:'+currentUser, profile); }
  async function saveBills(){ await storeSet('bills:'+currentUser, bills); }
  async function saveSubs(){ await storeSet('subscriptions:'+currentUser, subscriptions); }
  async function saveEmis(){ await storeSet('emis:'+currentUser, emis); }

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
    const u = $('auth-user').value.trim();
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
      showToast('Account created', `Welcome to BudgetWise, ${u}.`, 'success');
      setTimeout(openVerifyModal, 500); // prompt to verify email right after registering
    }else{
      if(!users[u] || users[u] !== p){ err.textContent = 'Incorrect username or password.'; return; }
      currentUser = u;
      await enterApp();
      showToast('Logged in', `Welcome back, ${profile.name || u}.`, 'success');
    }
  }
  const passwordToggle = $('password-toggle');
  if(passwordToggle){
    passwordToggle.addEventListener('click', ()=>{
      const pass = $('auth-pass');
      const icon = $('eye-icon');
      const showing = pass.type === 'text';
      pass.type = showing ? 'password' : 'text';
      passwordToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      if(icon){
        icon.innerHTML = showing
          ? '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"></path><circle cx="12" cy="12" r="2.5"></circle>'
          : '<path d="M3 3l18 18"></path><path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a18.8 18.8 0 0 1-4 4.2"></path><path d="M6.1 6.1C3.5 7.8 2 12 2 12s3.5 6 10 6a10.8 10.8 0 0 0 2-.2"></path>';
      }
    });
  }
  const registerFooterLink = $('register-footer-link');
  if(registerFooterLink){
    registerFooterLink.addEventListener('click', ()=>{
      const registerTab = document.querySelector('.login-tab[data-mode="register"]');
      if(registerTab) registerTab.click();
    });
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
      const u = $('fp-user').value.trim(), email = $('fp-email').value.trim();
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
      const u = $('fp-user').value.trim(), newpass = $('fp-newpass').value;
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
    const u = $('otp-user').value.trim(), phone = $('otp-phone').value.trim();
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
  const screens = ['dashboard','add-income','add-expense','budget','bills','subs','emi','reports','transactions','settings'];
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
    if(name==='bills') renderBills();
    if(name==='subs') renderSubs();
    if(name==='emi') renderEmiList();
    if(name==='reports') renderActiveReportTab();
    if(name==='transactions') renderTransactions();
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

    // pending bills summary
    const unpaidBills = bills.filter(b=>!b.paid);
    const pendingTotal = unpaidBills.reduce((s,b)=>s+b.amount,0);
    $('dash-bills-pending').textContent = fmt(pendingTotal, profile.currency);
    renderDashboardBillsWidget();
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

  // ---------- BILLS ----------
  function billStatus(bill){
    if(bill.paid) return 'paid';
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(bill.dueDate+'T00:00:00');
    const diffDays = Math.round((due-today)/86400000);
    if(diffDays < 0) return 'overdue';
    if(diffDays <= 3) return 'duesoon';
    return 'upcoming';
  }
  const BILL_STATUS_LABEL = { overdue:'Overdue', duesoon:'Due soon', upcoming:'Upcoming', paid:'Paid' };
  function billRowHtml(b, compact){
    const status = billStatus(b);
    const cat = catInfo(b.category);
    const d = new Date(b.dueDate+'T00:00:00');
    return `
      <div class="bill-row" data-bill-row="${b.id}" style="${compact?'padding:10px 0;':''}">
        <span class="cat-dot" style="background:${cat.color}"></span>
        <div class="b-name">${esc(b.name)}${(!compact && b.notes) ? `<div class="b-notes">${esc(b.notes)}</div>` : ''}</div>
        ${compact ? '' : `<span class="b-cat">${cat.name}</span>`}
        <span class="b-due">${d.toLocaleDateString(undefined,{month:'short', day:'numeric', year:'numeric'})}</span>
        <span class="b-amt">${fmt(b.amount, profile.currency)}</span>
        <span class="badge badge-${status}">${BILL_STATUS_LABEL[status]}</span>
        ${compact ? '' : `
        <div class="b-actions">
          ${!b.paid ? `<button type="button" class="btn btn-secondary" data-paid="${b.id}" style="padding:7px 12px; font-size:12px;">Mark paid</button>` : ''}
          <button type="button" class="del-btn" data-edit="${b.id}" aria-label="Edit bill" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
          <button type="button" class="del-btn" data-del="${b.id}" aria-label="Delete bill">&#10005;</button>
        </div>`}
      </div>`;
  }
  function renderBills(){
    const wrap = $('bill-list');
    if(!wrap) return;
    let list = [...bills].sort((a,b)=> a.dueDate.localeCompare(b.dueDate));
    if(billFilter !== 'all') list = list.filter(b=> billStatus(b) === billFilter);
    $('bill-empty').classList.toggle('hidden', list.length > 0);
    wrap.innerHTML = list.map(b=> billRowHtml(b, false)).join('');
    wrap.querySelectorAll('[data-paid]').forEach(btn=> btn.addEventListener('click', ()=> markBillPaid(Number(btn.getAttribute('data-paid')))));
    wrap.querySelectorAll('[data-edit]').forEach(btn=> btn.addEventListener('click', ()=> openBillModal(Number(btn.getAttribute('data-edit')))));
    wrap.querySelectorAll('[data-del]').forEach(btn=> btn.addEventListener('click', ()=> deleteBill(Number(btn.getAttribute('data-del')))));
  }
  function renderDashboardBillsWidget(){
    const wrap = $('dash-bills-widget');
    if(!wrap) return;
    const list = bills.filter(b=>!b.paid).sort((a,b)=> a.dueDate.localeCompare(b.dueDate)).slice(0,5);
    wrap.innerHTML = list.length ? list.map(b=> billRowHtml(b, true)).join('') : '<div class="empty-note">No upcoming bills. Add one to get reminders here.</div>';
  }
  document.querySelectorAll('#bill-tabs .bill-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#bill-tabs .bill-tab').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      billFilter = btn.getAttribute('data-bill-filter');
      renderBills();
    });
  });
  function populateBillCatSelect(){
    const prev = $('bill-cat').value;
    $('bill-cat').innerHTML = allCats().map(c=>`<option value="${c.key}">${c.name}</option>`).join('');
    if(prev && allCats().some(c=>c.key===prev)) $('bill-cat').value = prev;
  }
  function openBillModal(id){
    populateBillCatSelect();
    const bill = id ? bills.find(b=>b.id===id) : null;
    $('bill-modal-title').textContent = bill ? 'Edit bill' : 'Add bill';
    $('bill-id').value = bill ? bill.id : '';
    $('bill-name').value = bill ? bill.name : '';
    $('bill-amt').value = bill ? bill.amount : '';
    if(bill) $('bill-cat').value = bill.category;
    $('bill-due').value = bill ? bill.dueDate : new Date().toISOString().slice(0,10);
    $('bill-notes').value = bill ? (bill.notes || '') : '';
    $('bill-msg').textContent = '';
    $('modal-bill').classList.remove('hidden');
    $('bill-name').focus();
  }
  $('bill-add-btn').addEventListener('click', ()=> openBillModal());
  $('bill-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const name = $('bill-name').value.trim();
    const amount = parseFloat($('bill-amt').value);
    const category = $('bill-cat').value;
    const dueDate = $('bill-due').value;
    const notes = $('bill-notes').value.trim();
    if(!name){ $('bill-msg').textContent = 'Please enter a bill name.'; return; }
    if(!amount || amount <= 0 || isNaN(amount)){ $('bill-msg').textContent = 'Please enter a valid amount.'; return; }
    if(!dueDate){ $('bill-msg').textContent = 'Please choose a due date.'; return; }
    const idVal = $('bill-id').value;
    const id = idVal ? Number(idVal) : Date.now();
    const existingIdx = bills.findIndex(b=> b.id === id);
    const billObj = {
      id, name, amount, category, dueDate, notes,
      paid: existingIdx >= 0 ? bills[existingIdx].paid : false,
      paidDate: existingIdx >= 0 ? bills[existingIdx].paidDate : null,
    };
    if(existingIdx >= 0) bills[existingIdx] = billObj; else bills.push(billObj);
    saveBills().catch(()=>{});
    $('modal-bill').classList.add('hidden');
    renderBills();
    renderDashboard();
    showToast(existingIdx >= 0 ? 'Bill updated' : 'Bill added', `${name} — ${fmt(amount, profile.currency)} due ${new Date(dueDate+'T00:00:00').toLocaleDateString()}`, 'success');
  });
  function markBillPaid(id){
    const b = bills.find(x=> x.id === id);
    if(!b) return;
    b.paid = true; b.paidDate = new Date().toISOString().slice(0,10);
    saveBills().catch(()=>{});
    renderBills();
    renderDashboardBillsWidget();
    renderDashboard();
    showToast('Bill marked paid', `${b.name} is now marked as paid.`, 'success');
  }
  function deleteBill(id){
    const b = bills.find(x=> x.id === id);
    bills = bills.filter(x=> x.id !== id);
    saveBills().catch(()=>{});
    renderBills();
    renderDashboardBillsWidget();
    renderDashboard();
    showToast('Bill deleted', b ? `${b.name} was removed.` : 'Bill removed.', 'info');
  }

  // ---------- SUBSCRIPTION TRACKER ----------
  function subMonthlyCost(s){
    if(s.frequency==='yearly') return s.amount/12;
    if(s.frequency==='weekly') return s.amount*52/12;
    return s.amount; // monthly
  }
  function populateSubCatSelect(){
    const prev = $('sub-cat').value;
    $('sub-cat').innerHTML = allCats().map(c=>`<option value="${c.key}">${c.name}</option>`).join('');
    if(prev && allCats().some(c=>c.key===prev)) $('sub-cat').value = prev;
  }
  function renderSubs(){
    const wrap = $('sub-list');
    let list = [...subscriptions].sort((a,b)=> a.nextDate.localeCompare(b.nextDate));
    if(subFilter !== 'all') list = list.filter(s=> s.status === subFilter);
    $('sub-empty').classList.toggle('hidden', list.length > 0);
    wrap.innerHTML = list.map(s=>{
      const cat = catInfo(s.category);
      const d = new Date(s.nextDate+'T00:00:00');
      return `<div class="sub-row">
        <span class="cat-dot" style="background:${cat.color}"></span>
        <div class="s-name">${esc(s.name)}</div>
        <span class="s-freq">${s.frequency.charAt(0).toUpperCase()+s.frequency.slice(1)}</span>
        <span class="s-next">Next: ${d.toLocaleDateString(undefined,{month:'short', day:'numeric'})}</span>
        <span class="s-amt">${fmt(s.amount, profile.currency)}</span>
        <span class="badge ${s.status==='active'?'badge-upcoming':'badge-paid'}">${s.status==='active'?'Active':'Cancelled'}</span>
        <div class="s-actions">
          <button type="button" class="del-btn" data-sub-edit="${s.id}" aria-label="Edit subscription" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
          <button type="button" class="del-btn" data-sub-del="${s.id}" aria-label="Delete subscription">&#10005;</button>
        </div>
      </div>`;
    }).join('');
    wrap.querySelectorAll('[data-sub-edit]').forEach(btn=> btn.addEventListener('click', ()=> openSubModal(Number(btn.getAttribute('data-sub-edit')))));
    wrap.querySelectorAll('[data-sub-del]').forEach(btn=> btn.addEventListener('click', ()=> deleteSub(Number(btn.getAttribute('data-sub-del')))));
    const activeSubs = subscriptions.filter(s=> s.status === 'active');
    const monthlyTotal = activeSubs.reduce((s,sub)=> s + subMonthlyCost(sub), 0);
    $('sub-monthly-cost').textContent = fmt(monthlyTotal, profile.currency);
    $('sub-yearly-cost').textContent = fmt(monthlyTotal*12, profile.currency);
  }
  document.querySelectorAll('#sub-tabs .bill-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#sub-tabs .bill-tab').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      subFilter = btn.getAttribute('data-sub-filter');
      renderSubs();
    });
  });
  function openSubModal(id){
    populateSubCatSelect();
    const sub = id ? subscriptions.find(s=>s.id===id) : null;
    $('sub-modal-title').textContent = sub ? 'Edit subscription' : 'Add subscription';
    $('sub-id').value = sub ? sub.id : '';
    $('sub-name').value = sub ? sub.name : '';
    $('sub-amt').value = sub ? sub.amount : '';
    $('sub-freq').value = sub ? sub.frequency : 'monthly';
    $('sub-next').value = sub ? sub.nextDate : new Date().toISOString().slice(0,10);
    if(sub) $('sub-cat').value = sub.category;
    $('sub-status').value = sub ? sub.status : 'active';
    $('sub-msg').textContent = '';
    $('modal-sub').classList.remove('hidden');
    $('sub-name').focus();
  }
  $('sub-add-btn').addEventListener('click', ()=> openSubModal());
  $('sub-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const name = $('sub-name').value.trim();
    const amount = parseFloat($('sub-amt').value);
    const frequency = $('sub-freq').value;
    const nextDate = $('sub-next').value;
    const category = $('sub-cat').value;
    const status = $('sub-status').value;
    if(!name){ $('sub-msg').textContent = 'Please enter a subscription name.'; return; }
    if(!amount || amount <= 0 || isNaN(amount)){ $('sub-msg').textContent = 'Please enter a valid amount.'; return; }
    if(!nextDate){ $('sub-msg').textContent = 'Please choose the next payment date.'; return; }
    const idVal = $('sub-id').value;
    const id = idVal ? Number(idVal) : Date.now();
    const idx = subscriptions.findIndex(s=> s.id === id);
    const subObj = { id, name, amount, frequency, nextDate, category, status };
    if(idx >= 0) subscriptions[idx] = subObj; else subscriptions.push(subObj);
    saveSubs().catch(()=>{});
    $('modal-sub').classList.add('hidden');
    renderSubs();
    showToast(idx >= 0 ? 'Subscription updated' : 'Subscription added', `${name} — ${fmt(amount, profile.currency)} / ${frequency}`, 'success');
  });
  function deleteSub(id){
    const s = subscriptions.find(x=> x.id === id);
    subscriptions = subscriptions.filter(x=> x.id !== id);
    saveSubs().catch(()=>{});
    renderSubs();
    showToast('Subscription deleted', s ? `${s.name} was removed.` : 'Subscription removed.', 'info');
  }

  // ---------- EMI MANAGEMENT & CALCULATOR ----------
  function computeEmi(principal, ratePct, tenureMonths){
    const r = (ratePct/12)/100;
    let emi;
    if(r === 0){ emi = principal / tenureMonths; }
    else { emi = principal * r * Math.pow(1+r, tenureMonths) / (Math.pow(1+r, tenureMonths) - 1); }
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;
    return { emi, totalPayment, totalInterest };
  }
  function addMonths(dateStr, n){
    const d = new Date(dateStr+'T00:00:00');
    d.setMonth(d.getMonth() + n);
    return d.toISOString().slice(0,10);
  }
  function emiNextDue(e){ return addMonths(e.startDate, e.paidMonths); }
  function emiStatus(e){
    if(e.paidMonths >= e.tenureMonths) return 'closed';
    const due = new Date(emiNextDue(e)+'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    const diffDays = Math.round((due-today)/86400000);
    if(diffDays < 0 || diffDays <= 7) return 'dueSoon';
    return 'active';
  }
  const EMI_STATUS_LABEL = { active:'Active', dueSoon:'Due soon', closed:'Paid off' };
  function renderEmiList(){
    const wrap = $('emi-list');
    let list = [...emis].sort((a,b)=> emiNextDue(a).localeCompare(emiNextDue(b)));
    if(emiFilter !== 'all') list = list.filter(e=> emiStatus(e) === emiFilter);
    $('emi-empty').classList.toggle('hidden', list.length > 0);
    wrap.innerHTML = list.map(e=>{
      const status = emiStatus(e);
      const remaining = e.emiAmount * Math.max(0, e.tenureMonths - e.paidMonths);
      const due = new Date(emiNextDue(e)+'T00:00:00');
      return `<div class="emi-row">
        <div class="e-name">${esc(e.loanName)}<div class="e-sub">${e.paidMonths}/${e.tenureMonths} instalments paid</div></div>
        <span class="e-due">${status==='closed' ? 'Paid off' : 'Next due: '+due.toLocaleDateString(undefined,{month:'short', day:'numeric'})}</span>
        <span class="e-amt">${fmt(e.emiAmount, profile.currency)}/mo</span>
        <span style="font-size:12px; color:var(--text-soft); min-width:120px;">Remaining: ${fmt(remaining, profile.currency)}</span>
        <span class="badge ${status==='closed'?'badge-paid':(status==='dueSoon'?'badge-duesoon':'badge-upcoming')}">${EMI_STATUS_LABEL[status]}</span>
        <div class="e-actions">
          ${status!=='closed' ? `<button type="button" class="btn btn-secondary" data-emi-paid="${e.id}" style="padding:7px 12px; font-size:12px;">Mark month paid</button>` : ''}
          <button type="button" class="del-btn" data-emi-edit="${e.id}" aria-label="Edit EMI" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
          <button type="button" class="del-btn" data-emi-del="${e.id}" aria-label="Delete EMI">&#10005;</button>
        </div>
      </div>`;
    }).join('');
    wrap.querySelectorAll('[data-emi-paid]').forEach(btn=> btn.addEventListener('click', ()=> markEmiMonthPaid(Number(btn.getAttribute('data-emi-paid')))));
    wrap.querySelectorAll('[data-emi-edit]').forEach(btn=> btn.addEventListener('click', ()=> openEmiModal(Number(btn.getAttribute('data-emi-edit')))));
    wrap.querySelectorAll('[data-emi-del]').forEach(btn=> btn.addEventListener('click', ()=> deleteEmi(Number(btn.getAttribute('data-emi-del')))));
  }
  document.querySelectorAll('#emi-tabs .bill-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#emi-tabs .bill-tab').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      emiFilter = btn.getAttribute('data-emi-filter');
      renderEmiList();
    });
  });
  function openEmiModal(id, prefill){
    const e = id ? emis.find(x=>x.id===id) : null;
    $('emi-modal-title').textContent = e ? 'Edit EMI' : 'Add EMI';
    $('emi-id').value = e ? e.id : '';
    $('emi-name').value = e ? e.loanName : '';
    $('emi-principal').value = e ? e.principal : (prefill ? prefill.p : '');
    $('emi-rate').value = e ? e.rate : (prefill ? prefill.r : '');
    $('emi-tenure').value = e ? e.tenureMonths : (prefill ? prefill.n : '');
    $('emi-start').value = e ? e.startDate : new Date().toISOString().slice(0,10);
    $('emi-msg').textContent = '';
    $('modal-emi').classList.remove('hidden');
    $('emi-name').focus();
  }
  $('emi-add-btn').addEventListener('click', ()=> openEmiModal());
  $('emi-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const loanName = $('emi-name').value.trim();
    const principal = parseFloat($('emi-principal').value);
    const rate = parseFloat($('emi-rate').value);
    const tenureMonths = parseInt($('emi-tenure').value, 10);
    const startDate = $('emi-start').value;
    if(!loanName){ $('emi-msg').textContent = 'Please enter a loan name.'; return; }
    if(!(principal > 0) || isNaN(principal)){ $('emi-msg').textContent = 'Please enter a valid principal amount.'; return; }
    if(isNaN(rate) || rate < 0){ $('emi-msg').textContent = 'Please enter a valid interest rate.'; return; }
    if(!(tenureMonths > 0)){ $('emi-msg').textContent = 'Please enter a valid tenure in months.'; return; }
    if(!startDate){ $('emi-msg').textContent = 'Please choose a start date.'; return; }
    const { emi } = computeEmi(principal, rate, tenureMonths);
    const idVal = $('emi-id').value;
    const id = idVal ? Number(idVal) : Date.now();
    const idx = emis.findIndex(x=> x.id === id);
    const emiObj = {
      id, loanName, principal, rate, tenureMonths, emiAmount: emi, startDate,
      paidMonths: idx >= 0 ? emis[idx].paidMonths : 0,
    };
    if(idx >= 0) emis[idx] = emiObj; else emis.push(emiObj);
    saveEmis().catch(()=>{});
    $('modal-emi').classList.add('hidden');
    renderEmiList();
    showToast(idx >= 0 ? 'EMI updated' : 'EMI added', `${loanName} — ${fmt(emi, profile.currency)}/month`, 'success');
  });
  function markEmiMonthPaid(id){
    const e = emis.find(x=> x.id === id);
    if(!e) return;
    e.paidMonths = Math.min(e.tenureMonths, e.paidMonths + 1);
    saveEmis().catch(()=>{});
    renderEmiList();
    showToast('Instalment marked paid', `${e.loanName}: ${e.paidMonths}/${e.tenureMonths} paid.`, 'success');
  }
  function deleteEmi(id){
    const e = emis.find(x=> x.id === id);
    emis = emis.filter(x=> x.id !== id);
    saveEmis().catch(()=>{});
    renderEmiList();
    showToast('EMI deleted', e ? `${e.loanName} was removed.` : 'EMI removed.', 'info');
  }
  $('emi-calc-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const p = parseFloat($('calc-principal').value);
    const r = parseFloat($('calc-rate').value);
    const n = parseInt($('calc-tenure').value, 10);
    if(!(p > 0) || isNaN(r) || r < 0 || !(n > 0)){
      showToast('Invalid input', 'Please enter a valid loan amount, rate and tenure.', 'warn');
      return;
    }
    const { emi, totalInterest, totalPayment } = computeEmi(p, r, n);
    $('calc-emi-out').textContent = fmt(emi, profile.currency);
    $('calc-interest-out').textContent = fmt(totalInterest, profile.currency);
    $('calc-total-out').textContent = fmt(totalPayment, profile.currency);
    $('emi-calc-result').classList.remove('hidden');
    lastEmiCalc = { p, r, n };
  });
  let lastEmiCalc = null;
  $('calc-use-btn').addEventListener('click', ()=>{
    if(!lastEmiCalc) return;
    openEmiModal(null, lastEmiCalc);
  });

  // ---------- REPORTS ----------
  let reportActiveTab = 'category';
  document.querySelectorAll('#report-tabs .bill-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#report-tabs .bill-tab').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      reportActiveTab = btn.getAttribute('data-report-tab');
      ['category','payment','location','compare','calendar'].forEach(t=>{
        $('report-view-'+t).classList.toggle('hidden', t !== reportActiveTab);
      });
      renderActiveReportTab();
    });
  });
  function renderActiveReportTab(){
    $('reports-month').textContent = new Date().toLocaleDateString(undefined,{month:'long', year:'numeric'});
    if(reportActiveTab === 'category') renderReports();
    else if(reportActiveTab === 'payment') renderPaymentReport();
    else if(reportActiveTab === 'location') renderLocationReport();
    else if(reportActiveTab === 'compare') renderCompareReport();
    else if(reportActiveTab === 'calendar') renderCalendar();
  }
  // Generic grouped donut + legend, reused for payment method / location breakdowns
  function renderGroupedDonut(donutEl, legendEl, list, groupFn, colorFn, emptyMsg){
    const total = list.reduce((s,e)=>s+e.amount,0);
    if(total <= 0){
      donutEl.innerHTML = `<svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="No data"><circle cx="75" cy="75" r="56" fill="none" stroke="var(--border)" stroke-width="16"/><text x="75" y="80" text-anchor="middle" font-family="IBM Plex Mono" font-size="12" fill="var(--text-soft)">no data</text></svg>`;
      legendEl.innerHTML = `<div class="empty-note">${emptyMsg}</div>`;
      return;
    }
    const groups = {};
    list.forEach(e=>{ const key = groupFn(e); groups[key] = (groups[key]||0) + e.amount; });
    const keys = Object.keys(groups).sort((a,b)=> groups[b]-groups[a]);
    const circ = 2*Math.PI*56;
    let offset = 0, segs = '';
    keys.forEach((key,i)=>{
      const val = groups[key], frac = val/total, len = frac*circ;
      segs += `<circle cx="75" cy="75" r="56" fill="none" stroke="${colorFn(key,i)}" stroke-width="16" stroke-dasharray="${len} ${circ-len}" stroke-dashoffset="${-offset}" transform="rotate(-90 75 75)" stroke-linecap="butt"/>`;
      offset += len;
    });
    donutEl.innerHTML = `<svg width="150" height="150" viewBox="0 0 150 150">
      ${segs}
      <text x="75" y="72" text-anchor="middle" font-family="IBM Plex Mono" font-size="10.5" fill="var(--text-soft)">spent</text>
      <text x="75" y="90" text-anchor="middle" font-family="IBM Plex Mono" font-size="14" font-weight="600" fill="var(--text)">${fmt(total, profile.currency)}</text>
    </svg>`;
    legendEl.innerHTML = keys.map((key,i)=>{
      const val = groups[key], pct = ((val/total)*100).toFixed(0);
      return `<div class="legend-row"><span class="cat-dot" style="background:${colorFn(key,i)}"></span>${esc(key)}<span class="legend-amt">${fmt(val, profile.currency)} · ${pct}%</span></div>`;
    }).join('');
  }
  function renderPaymentReport(){
    const list = currentMonthEntries().filter(e=>e.type==='expense');
    renderGroupedDonut($('report-donut-payment'), $('report-legend-payment'), list,
      e=> e.paymentMethod || 'Not specified',
      (key,i)=> CUSTOM_PALETTE[i % CUSTOM_PALETTE.length],
      'No expenses recorded this month.');
  }
  function renderLocationReport(){
    const list = currentMonthEntries().filter(e=>e.type==='expense' && e.location);
    renderGroupedDonut($('report-donut-location'), $('report-legend-location'), list,
      e=> e.location,
      (key,i)=> CUSTOM_PALETTE[i % CUSTOM_PALETTE.length],
      'No expenses with a location recorded this month.');
  }
  function monthEntries(mk){ return entries.filter(e=> e.date.slice(0,7) === mk); }
  function renderCompareReport(){
    const now = new Date();
    const curMk = monthKey(now);
    const prevDate = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const prevMk = monthKey(prevDate);
    const cur = monthEntries(curMk), prev = monthEntries(prevMk);
    const curIncome = cur.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
    const curExpense = cur.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
    const prevIncome = prev.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
    const prevExpense = prev.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
    const curSavings = curIncome - curExpense, prevSavings = prevIncome - prevExpense;
    function diffHtml(curV, prevV){
      const diff = curV - prevV;
      const pct = prevV !== 0 ? Math.round((diff/Math.abs(prevV))*100) : (curV > 0 ? 100 : 0);
      const cls = diff >= 0 ? 'pos' : 'neg';
      const sign = diff >= 0 ? '+' : '';
      return `<span class="c-diff ${cls}">${sign}${fmt(diff, profile.currency)} (${sign}${pct}%)</span>`;
    }
    const monthLabel = d => d.toLocaleDateString(undefined,{month:'long'});
    $('compare-summary').innerHTML = `
      <div class="compare-grid">
        <div class="compare-card">
          <div class="c-label">Income</div>
          <div class="c-values"><span class="c-cur">${fmt(curIncome, profile.currency)}</span>${diffHtml(curIncome, prevIncome)}</div>
          <div class="c-prev">${monthLabel(prevDate)}: ${fmt(prevIncome, profile.currency)}</div>
        </div>
        <div class="compare-card">
          <div class="c-label">Expenses</div>
          <div class="c-values"><span class="c-cur">${fmt(curExpense, profile.currency)}</span>${diffHtml(curExpense, prevExpense)}</div>
          <div class="c-prev">${monthLabel(prevDate)}: ${fmt(prevExpense, profile.currency)}</div>
        </div>
        <div class="compare-card">
          <div class="c-label">Savings</div>
          <div class="c-values"><span class="c-cur">${fmt(curSavings, profile.currency)}</span>${diffHtml(curSavings, prevSavings)}</div>
          <div class="c-prev">${monthLabel(prevDate)}: ${fmt(prevSavings, profile.currency)}</div>
        </div>
      </div>
      <div id="compare-cat-list"></div>
    `;
    const curByCat = {}, prevByCat = {};
    cur.filter(e=>e.type==='expense').forEach(e=> curByCat[e.category]=(curByCat[e.category]||0)+e.amount);
    prev.filter(e=>e.type==='expense').forEach(e=> prevByCat[e.category]=(prevByCat[e.category]||0)+e.amount);
    const allKeys = allCats().map(c=>c.key).filter(k=> curByCat[k] || prevByCat[k]);
    const rows = allKeys.map(key=>{
      const cat = catInfo(key), cv = curByCat[key]||0, pv = prevByCat[key]||0;
      return `<div class="legend-row"><span class="cat-dot" style="background:${cat.color}"></span>${cat.name}<span class="legend-amt">${fmt(cv, profile.currency)} ${diffHtml(cv,pv)}</span></div>`;
    }).join('');
    $('compare-cat-list').innerHTML = rows ? `<div class="page-sub" style="margin:18px 0 8px;">By category vs last month</div>${rows}` : '<div class="empty-note">Nothing to compare yet.</div>';
  }
  let calViewDate = new Date();
  function renderCalendar(){
    const y = calViewDate.getFullYear(), m = calViewDate.getMonth();
    const mk = y+'-'+String(m+1).padStart(2,'0');
    const list = entries.filter(e=> e.type==='expense' && e.date.slice(0,7)===mk);
    const byDay = {};
    list.forEach(e=>{ const day = Number(e.date.slice(8,10)); byDay[day] = (byDay[day]||0) + e.amount; });
    const maxDay = Math.max(0, ...Object.values(byDay));
    $('cal-head').innerHTML = `
      <button type="button" id="cal-prev" aria-label="Previous month">&larr;</button>
      <h4>${calViewDate.toLocaleDateString(undefined,{month:'long', year:'numeric'})}</h4>
      <button type="button" id="cal-next" aria-label="Next month">&rarr;</button>
    `;
    $('cal-prev').addEventListener('click', ()=>{ calViewDate = new Date(y, m-1, 1); renderCalendar(); });
    $('cal-next').addEventListener('click', ()=>{ calViewDate = new Date(y, m+1, 1); renderCalendar(); });
    const firstDow = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let html = dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');
    for(let i=0;i<firstDow;i++) html += `<div class="cal-cell empty"></div>`;
    for(let day=1; day<=daysInMonth; day++){
      const amt = byDay[day] || 0;
      let heat = 0;
      if(maxDay > 0 && amt > 0){
        const frac = amt/maxDay;
        heat = frac > 0.75 ? 4 : frac > 0.5 ? 3 : frac > 0.25 ? 2 : 1;
      }
      html += `<div class="cal-cell cal-heat-${heat}" data-day="${day}"><span class="cal-day-num">${day}</span>${amt>0?`<span class="cal-day-amt">${fmt(amt, profile.currency)}</span>`:''}</div>`;
    }
    $('cal-grid').innerHTML = html;
    $('cal-grid').querySelectorAll('[data-day]').forEach(cell=>{
      cell.addEventListener('click', ()=>{
        $('cal-grid').querySelectorAll('.cal-cell').forEach(c=> c.classList.remove('selected'));
        cell.classList.add('selected');
        const day = Number(cell.getAttribute('data-day'));
        const dateStr = mk+'-'+String(day).padStart(2,'0');
        const dayList = list.filter(e=> e.date === dateStr);
        const total = dayList.reduce((s,e)=>s+e.amount,0);
        $('cal-day-detail').innerHTML = dayList.length ? `
          <div class="page-sub" style="margin:16px 0 8px;">${new Date(dateStr+'T00:00:00').toLocaleDateString(undefined,{weekday:'long', month:'long', day:'numeric'})} — total ${fmt(total, profile.currency)}</div>
          ${dayList.map(e=>`<div class="legend-row"><span class="cat-dot" style="background:${catInfo(e.category).color}"></span>${esc(e.desc)}<span class="legend-amt">${fmt(e.amount, profile.currency)}</span></div>`).join('')}
        ` : `<div class="empty-note">No expenses on this day.</div>`;
      });
    });
    $('cal-day-detail').innerHTML = '';
  }
  function renderReports(){
    const list = currentMonthEntries().filter(e=>e.type==='expense');
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
