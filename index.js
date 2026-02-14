(function () {
  /** @type {HTMLElement | null} */
  const status = document.querySelector('#status');
  /** @type {HTMLButtonElement | null} */
  const unlockBtn = document.querySelector('#unlock');
  /** @type {HTMLInputElement | null} */
  const hidden = document.querySelector('#passcode-hidden');

  /** @type {HTMLElement[]} */
  const dots = Array.from(document.querySelectorAll('.dot'));

  const CORRECT = '2021';
  const REDIRECT_TO = 'anniversary.html';
  const WRONG_REDIRECT_TO = 'wrong.html';
  const MAX = 4;
  /** @type {string[]} */
  let code = [];

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? 'rgba(130, 25, 55, 0.9)' : 'rgba(40, 20, 40, 0.72)';
  }

  function renderDots() {
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('filled', i < code.length);
    }
    if (hidden) hidden.value = code.join('');
  }

  function clearAll() {
    code = [];
    setStatus('', false);
    renderDots();
  }

  function backspace() {
    if (!code.length) return;
    code.pop();
    setStatus('', false);
    renderDots();
  }

  function tryUnlock() {
    if (code.length < MAX) {
      setStatus('Enter 4 digits.', true);
      return;
    }

    const entered = code.join('');
    if (entered === CORRECT) {
      setStatus('Unlocked. Redirecting…', false);
      window.location.href = REDIRECT_TO;
      return;
    }

    // Wrong passcode: immediately redirect to the "wrong password" page.
    window.location.href = WRONG_REDIRECT_TO;
  }

  function addDigit(d) {
    if (code.length >= MAX) return;
    code.push(d);
    setStatus('', false);
    renderDots();
    if (code.length === MAX) {
      // Match the Apple feel: auto-attempt when 4 digits entered.
      tryUnlock();
    }
  }

  document.addEventListener('click', (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    const key = t?.closest?.('[data-key]');
    if (key) {
      const digit = String(key.getAttribute('data-key') || '').replace(/\D/g, '');
      if (digit.length === 1) addDigit(digit);
      return;
    }

    const action = t?.closest?.('[data-action]');
    if (!action) return;

    const act = action.getAttribute('data-action');
    if (act === 'clear') clearAll();
    if (act === 'back') backspace();
  });

  unlockBtn?.addEventListener('click', tryUnlock);

  // Allow keyboard typing (optional)
  hidden?.addEventListener('input', () => {
    const digits = String(hidden.value || '').replace(/\D/g, '').slice(0, MAX);
    code = digits.split('');
    renderDots();
    if (code.length === MAX) tryUnlock();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') addDigit(e.key);
    if (e.key === 'Backspace') backspace();
    if (e.key === 'Escape') clearAll();
    if (e.key === 'Enter') tryUnlock();
  });

  renderDots();
})();
