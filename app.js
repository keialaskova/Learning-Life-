(() => {
 const date = new Date();
 const dateEl = document.getElementById('todayDate');
 dateEl.textContent = new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(date);
 const clock = document.getElementById('clock');
 function tick(){clock.textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit'}).format(new Date());}
 tick(); setInterval(tick,30000);
 const h=new Date().getHours();
 document.getElementById('greeting').innerHTML=(h<12?'Good morning, Sky!':h<18?'Good afternoon, Sky!':'Good evening, Sky!')+' <span>♡</span>';
 const checks=[...document.querySelectorAll('.task-check')];
 const count=document.getElementById('taskCount');
 function update(){count.textContent=checks.filter(x=>x.checked).length+'/'+checks.length;}
 checks.forEach(x=>x.addEventListener('change',update)); update();
 const video=document.getElementById('welcomeVideo');
 const sound=document.getElementById('soundToggle');
 video.muted=true; video.play().catch(()=>{});
 sound.addEventListener('click',()=>{video.muted=!video.muted;sound.textContent=video.muted?'♪':'♫';sound.setAttribute('aria-label',video.muted?'Turn sound on':'Mute video');if(!video.paused) return;video.play().catch(()=>{});});
})();
