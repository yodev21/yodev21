(() => {
  const emailLink = document.querySelector('[data-copy-email]');
  const status = document.querySelector('[data-email-status]');

  if (!emailLink || !status) return;

  let clearTimer;
  emailLink.addEventListener('click', async (event) => {
    if (!navigator.clipboard?.writeText) return;

    event.preventDefault();
    try {
      await navigator.clipboard.writeText(emailLink.dataset.copyEmail);
      status.textContent = status.dataset.copiedLabel;
      window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(() => {
        status.textContent = '';
      }, 4000);
    } catch {
      window.location.href = emailLink.href;
    }
  });
})();
