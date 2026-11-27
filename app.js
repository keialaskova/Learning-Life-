(() => {
  const form = document.getElementById('welcomeForm');
  const input = document.getElementById('userName');
  const error = document.getElementById('errorMessage');
  const confirmation = document.getElementById('confirmation');
  const greeting = document.getElementById('personalGreeting');
  const editName = document.getElementById('editName');

  try {
    const savedName = localStorage.getItem('learningLifeUserName');
    if (savedName) input.value = savedName;
  } catch (_) { /* Storage may be unavailable in private browsing. */ }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = input.value.trim().replace(/\s+/g, ' ');
    if (!name) {
      error.textContent = 'Please enter your name first ♡';
      input.focus();
      return;
    }
    error.textContent = '';
    try { localStorage.setItem('learningLifeUserName', name); } catch (_) {}
    greeting.textContent = `Hello, ${name}! ♡`;
    confirmation.hidden = false;
  });

  editName.addEventListener('click', () => {
    confirmation.hidden = true;
    input.focus();
  });
})();
