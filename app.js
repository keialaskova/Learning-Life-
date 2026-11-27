(() => {
 const $ = id => document.getElementById(id);
 const loading = $('loadingScreen'), welcome = $('welcomeScreen'), dashboard = $('dashboardScreen');
 const savedName = localStorage.getItem('learningLifeName') || '';
 const show = screen => [loading,welcome,dashboard].forEach(s => s.classList.toggle('hidden',s !== screen));
 let progress = 0;
 const fill = $('progressFill');
 show(loading);
 const progressTimer = setInterval(() => {
   progress = Math.min(100, progress + 5);
   fill.style.width = progress + '%';
   if (progress >= 100) {
     clearInterval(progressTimer);
     setTimeout(() => {
       if (savedName.trim()) openDashboard(savedName.trim());
       else show(welcome);
     }, 180);
   }
 }, 55);
 $('welcomeForm').addEventListener('submit', event => {
   event.preventDefault();
   const name = $('nameInput').value.trim();
   if (!name) { $('nameInput').focus(); return; }
   localStorage.setItem('learningLifeName', name);
   openDashboard(name);
 });
 function openDashboard(name) {
   show(dashboard);
   const hour = new Date().getHours();
   const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
   $('greeting').innerHTML = `${greeting}, ${escapeHtml(name)}! <span>♡</span>`;
   updateDateTime();
   const cooking = $('welcomeVideo'); cooking.muted = true; cooking.play().catch(() => {});
 }
 function escapeHtml(value) { return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
 function updateDateTime() {
   const now = new Date();
   $('todayDate').textContent = new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(now);
   $('clock').textContent = new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(now);
 }
 setInterval(updateDateTime,30000);
 const checks = [...document.querySelectorAll('.task-check')];
 function updateCount() { $('taskCount').textContent = checks.filter(c => c.checked).length + '/' + checks.length; }
 checks.forEach(c => c.addEventListener('change',updateCount)); updateCount();
 $('soundToggle').addEventListener('click', () => {
   const video = $('welcomeVideo'); video.muted = !video.muted;
   $('soundToggle').textContent = video.muted ? '♪' : '♫';
   $('soundToggle').setAttribute('aria-label',video.muted ? 'Turn sound on' : 'Mute video');
   video.play().catch(() => {});
 });

 // Money Tracker: persistent browser-local records, separate from savings records.
 const moneyKey='learningLifeMoneyV1';
 const defaultWallets=[{id:'cash',name:'Cash',icon:'👛',balance:0},{id:'gcash',name:'GCash',icon:'📘',balance:0},{id:'maya',name:'Maya',icon:'💵',balance:0}];
 let moneyData;
 try{moneyData=JSON.parse(localStorage.getItem(moneyKey))||{wallets:defaultWallets,transactions:[]}}catch{moneyData={wallets:defaultWallets,transactions:[]}}
 if(!Array.isArray(moneyData.wallets)||!moneyData.wallets.length)moneyData.wallets=defaultWallets;
 if(!Array.isArray(moneyData.transactions))moneyData.transactions=[];
 let moneyType='income',moneyFilter='all';
 const peso=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
 const saveMoney=()=>localStorage.setItem(moneyKey,JSON.stringify(moneyData));
 const moneyEl=id=>document.getElementById(id);
 const walletById=id=>moneyData.wallets.find(w=>w.id===id);
 function savingsAmount(){
   try{const v=JSON.parse(localStorage.getItem('learningLifeSavings')||'null');if(Array.isArray(v))return v.reduce((s,x)=>s+Number(x.amount||0),0);if(typeof v==='number')return v;
   const n=JSON.parse(localStorage.getItem('learningLifeSavingsTotal')||'0');return Number(n)||0}catch{return 0}
 }
 function fillWalletSelect(id,selected){const el=moneyEl(id);if(!el)return;el.innerHTML='';moneyData.wallets.forEach(w=>{const o=document.createElement('option');o.value=w.id;o.textContent=w.name;el.append(o)});if(selected&&walletById(selected))el.value=selected}
 function walletRow(w){const row=document.createElement('div');row.className='wallet-row';const icon=document.createElement('span');icon.className='wallet-emoji';icon.textContent=w.icon||'👛';const name=document.createElement('span');name.className='wallet-name';name.textContent=w.name;const balance=document.createElement('strong');balance.className='wallet-balance';balance.textContent=peso(w.balance);row.append(icon,name,balance);return row}
 function renderMoney(){
   moneyData.wallets.forEach(w=>w.balance=0);
   moneyData.transactions.forEach(t=>{if(t.kind==='income'){const w=walletById(t.wallet);if(w)w.balance+=t.amount}else if(t.kind==='expense'){const w=walletById(t.wallet);if(w)w.balance-=t.amount}else if(t.kind==='transfer'){const a=walletById(t.from),b=walletById(t.to);if(a)a.balance-=t.amount;if(b)b.balance+=t.amount}});
   saveMoney();
   const income=moneyData.transactions.filter(t=>t.kind==='income').reduce((s,t)=>s+t.amount,0);
   const expense=moneyData.transactions.filter(t=>t.kind==='expense').reduce((s,t)=>s+t.amount,0);
   moneyEl('incomeTotal').textContent=peso(income);moneyEl('expenseTotal').textContent=peso(expense);moneyEl('savingsTotal').textContent=peso(savingsAmount());
   const overview=moneyEl('walletOverview'),manager=moneyEl('walletManager');overview.innerHTML='';manager.innerHTML='';
   moneyData.wallets.forEach(w=>{overview.append(walletRow(w));manager.append(walletRow(w))});
   fillWalletSelect('moneyWallet');fillWalletSelect('fromWallet');fillWalletSelect('toWallet',moneyData.wallets[1]?.id);
   const list=moneyEl('transactionList');list.innerHTML='';
   const items=[...moneyData.transactions].reverse().filter(t=>moneyFilter==='all'||t.kind===moneyFilter);
   if(!items.length){const empty=document.createElement('p');empty.className='money-hint';empty.textContent='No transactions yet. Add income or expenses to get started.';list.append(empty)}
   items.forEach(t=>{const row=document.createElement('div');row.className='money-transaction';const sym=document.createElement('span');sym.className='transaction-symbol';sym.textContent=t.kind==='income'?'⬆':t.kind==='expense'?'⬇':'⇄';const info=document.createElement('div');info.className='transaction-info';const title=document.createElement('b');title.textContent=t.description;const sub=document.createElement('small');sub.textContent=t.date+' · '+(t.kind==='transfer'?`${walletById(t.from)?.name||'Wallet'} → ${walletById(t.to)?.name||'Wallet'}`:(walletById(t.wallet)?.name||'Wallet'));info.append(title,sub);const value=document.createElement('strong');value.className='transaction-value '+(t.kind==='income'?'income':t.kind==='expense'?'expense':'');value.textContent=(t.kind==='income'?'+':t.kind==='expense'?'−':'')+peso(t.amount);row.append(sym,info,value);list.append(row)});
 }
 function showMoneyTab(tab){document.querySelectorAll('.money-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));['overview','transactions','wallets'].forEach(k=>moneyEl('money-'+k).classList.toggle('hidden',k!==tab))}
 function setPage(page){if(!['home','calendar','money','more'].includes(page))page='home';
   const ds=moneyEl('dashboardScreen'),ms=moneyEl('moneyScreen'),cs=moneyEl('calendarScreen');
   const home=page==='home',calendar=page==='calendar',money=page==='money';
   ds.classList.toggle('hidden',!home);ds.classList.remove('money-mode');
   ms.classList.toggle('hidden',!money);cs.classList.toggle('hidden',!calendar);
   document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
   if(money){showMoneyTab('overview');renderMoney()}
   if(calendar)renderCalendar();
 }

 // Calendar: month navigation, date selection, and saved daily schedule entries.
 const calendarStoreKey='learningLifeCalendarEventsV1';
 let calendarEvents=[];
 try{calendarEvents=JSON.parse(localStorage.getItem(calendarStoreKey)||'[]');if(!Array.isArray(calendarEvents))calendarEvents=[]}catch{calendarEvents=[]}
 let calendarCursor=new Date();calendarCursor.setDate(1);
 let selectedCalendarDate=new Date();selectedCalendarDate.setHours(12,0,0,0);
 const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const prettyDay=d=>new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric'}).format(d);
 function renderCalendar(){
   const label=moneyEl('monthLabel'),grid=moneyEl('calendarDays'),dayLabel=moneyEl('selectedDateLabel'),list=moneyEl('scheduleList');
   if(!label||!grid||!list)return;
   label.textContent=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(calendarCursor);
   grid.innerHTML='';
   const year=calendarCursor.getFullYear(),month=calendarCursor.getMonth();
   const first=new Date(year,month,1),start=first.getDay(),days=new Date(year,month+1,0).getDate();
   for(let i=0;i<start;i++){const blank=document.createElement('span');blank.className='calendar-day blank';blank.setAttribute('aria-hidden','true');grid.append(blank)}
   for(let n=1;n<=days;n++){
     const date=new Date(year,month,n,12),key=dateKey(date),btn=document.createElement('button');
     btn.type='button';btn.className='calendar-day'+(key===dateKey(selectedCalendarDate)?' selected':'')+(key===dateKey(new Date())?' today':'');
     btn.textContent=String(n);btn.setAttribute('role','gridcell');btn.setAttribute('aria-label',prettyDay(date));
     if(calendarEvents.some(e=>e.date===key))btn.classList.add('has-event');
     btn.addEventListener('click',()=>{selectedCalendarDate=date;renderCalendar()});grid.append(btn);
   }
   dayLabel.textContent=prettyDay(selectedCalendarDate);
   list.innerHTML='';
   const entries=calendarEvents.filter(e=>e.date===dateKey(selectedCalendarDate)).sort((a,b)=>a.time.localeCompare(b.time));
   if(!entries.length){const empty=document.createElement('p');empty.className='schedule-empty';empty.textContent='Nothing planned yet. Add a little plan for this day ♡';list.append(empty)}
   entries.forEach(e=>{const row=document.createElement('div');row.className='schedule-row';const dot=document.createElement('span');dot.className='schedule-dot';const time=document.createElement('strong');time.textContent=new Date('2000-01-01T'+e.time).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});const title=document.createElement('span');title.className='schedule-event-title';title.textContent=e.title;const del=document.createElement('button');del.type='button';del.className='schedule-delete';del.textContent='×';del.setAttribute('aria-label','Delete '+e.title);del.addEventListener('click',()=>{calendarEvents=calendarEvents.filter(x=>x.id!==e.id);localStorage.setItem(calendarStoreKey,JSON.stringify(calendarEvents));renderCalendar()});row.append(dot,time,title,del);list.append(row)});
 }
 moneyEl('prevMonth').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderCalendar()});
 moneyEl('nextMonth').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderCalendar()});
 function closeSchedule(){moneyEl('scheduleModal').classList.add('hidden')}
 moneyEl('addSchedule').addEventListener('click',()=>{moneyEl('scheduleTime').value='09:00';moneyEl('scheduleTitle').value='';moneyEl('scheduleModal').classList.remove('hidden')});
 ['closeScheduleModal','cancelSchedule'].forEach(id=>moneyEl(id).addEventListener('click',closeSchedule));
 moneyEl('scheduleForm').addEventListener('submit',e=>{e.preventDefault();const title=moneyEl('scheduleTitle').value.trim(),time=moneyEl('scheduleTime').value;if(!title||!time)return;calendarEvents.push({id:Date.now(),date:dateKey(selectedCalendarDate),time,title});localStorage.setItem(calendarStoreKey,JSON.stringify(calendarEvents));closeSchedule();renderCalendar()});

 document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page||'home')));
 document.querySelectorAll('.money-tab').forEach(b=>b.addEventListener('click',()=>showMoneyTab(b.dataset.tab)));
 function openTransaction(kind){moneyType=kind;moneyEl('moneyModalTitle').textContent=kind==='income'?'Add Income':'Add Expense';moneyEl('moneyDescription').value='';moneyEl('moneyAmount').value='';moneyEl('moneyDate').value=new Date().toISOString().slice(0,10);fillWalletSelect('moneyWallet');moneyEl('moneyModal').classList.remove('hidden')}
 ['openIncome','transactionAdd'].forEach(id=>moneyEl(id).addEventListener('click',()=>openTransaction('income')));
 moneyEl('openExpense').addEventListener('click',()=>openTransaction('expense'));
 function closeModal(id){moneyEl(id).classList.add('hidden')}
 ['closeMoneyModal','cancelMoney'].forEach(id=>moneyEl(id).addEventListener('click',()=>closeModal('moneyModal')));
 moneyEl('moneyForm').addEventListener('submit',e=>{e.preventDefault();const amount=Number(moneyEl('moneyAmount').value);if(!(amount>0))return;moneyData.transactions.push({id:Date.now(),kind:moneyType,description:moneyEl('moneyDescription').value.trim(),amount,wallet:moneyEl('moneyWallet').value,date:moneyEl('moneyDate').value});saveMoney();closeModal('moneyModal');renderMoney();showMoneyTab('transactions')});
 moneyEl('openTransfer').addEventListener('click',()=>{moneyEl('transferDate').value=new Date().toISOString().slice(0,10);fillWalletSelect('fromWallet');fillWalletSelect('toWallet',moneyData.wallets[1]?.id);moneyEl('transferModal').classList.remove('hidden')});
 ['closeTransferModal','cancelTransfer'].forEach(id=>moneyEl(id).addEventListener('click',()=>closeModal('transferModal')));
 moneyEl('transferForm').addEventListener('submit',e=>{e.preventDefault();const from=moneyEl('fromWallet').value,to=moneyEl('toWallet').value,amount=Number(moneyEl('transferAmount').value);if(from===to){alert('Choose two different wallets.');return}if(!(amount>0)){return}renderMoney();const source=walletById(from);if(!source||source.balance<amount){alert('This wallet does not have enough balance for that transfer.');return}moneyData.transactions.push({id:Date.now(),kind:'transfer',description:'Wallet transfer',amount,from,to,date:moneyEl('transferDate').value});saveMoney();closeModal('transferModal');renderMoney();showMoneyTab('transactions')});
 moneyEl('addWallet').addEventListener('click',()=>{const name=prompt('Wallet name (for example, Seabank):');if(!name||!name.trim())return;const clean=name.trim();if(moneyData.wallets.some(w=>w.name.toLowerCase()===clean.toLowerCase())){alert('That wallet already exists.');return}moneyData.wallets.push({id:'wallet-'+Date.now(),name:clean,icon:'👛',balance:0});saveMoney();renderMoney()});
 document.querySelectorAll('.filter-chip').forEach(b=>b.addEventListener('click',()=>{moneyFilter=b.dataset.filter;document.querySelectorAll('.filter-chip').forEach(x=>x.classList.toggle('active',x===b));renderMoney()}));

})();
