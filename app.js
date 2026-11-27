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
   document.querySelectorAll('.bear-animation').forEach(video => {
     video.muted = true; video.loop = true; video.playsInline = true;
     video.play().catch(() => {});
   });
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
 function setPage(page){if(page!=='home'&&page!=='money')page='home';const ds=moneyEl('dashboardScreen'),ms=moneyEl('moneyScreen');const home=page==='home';ds.classList.toggle('money-mode',!home);ms.classList.toggle('hidden',home||page!=='money');document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));if(page==='money'){showMoneyTab('overview');renderMoney()} }
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
