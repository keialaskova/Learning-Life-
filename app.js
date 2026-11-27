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
})();
