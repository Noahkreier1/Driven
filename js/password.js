// Password gate IIFE — checks session storage and shows/hides the gate on load
(function() {
  const gate = document.getElementById('passwordGate');
  if (sessionStorage.getItem('driven_unlocked') === '1') {
    gate.style.display = 'none';
    return;
  }
  document.body.style.overflow = 'hidden';
  document.getElementById('pwInput').focus();
})();

// checkPassword — validates the entered password and unlocks the site
function checkPassword() {
  const val = document.getElementById('pwInput').value;
  if (val === 'driven2026') {
    const gate = document.getElementById('passwordGate');
    gate.style.opacity = '0';
    document.body.style.overflow = '';
    sessionStorage.setItem('driven_unlocked', '1');
    setTimeout(function() { gate.style.display = 'none'; }, 420);
  } else {
    document.getElementById('pwError').textContent = 'Incorrect password. Try again.';
    document.getElementById('pwInput').value = '';
    document.getElementById('pwInput').focus();
  }
}
