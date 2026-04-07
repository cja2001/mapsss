document.addEventListener('DOMContentLoaded', () => {

  // ─── Supabase ──────────────────────────────────────────────────────────────
  const supabase = window.supabase.createClient(
    'https://nwnlqaohxzxflmxwrtyy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bmxxYW9oeHp4ZmxteHdydHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDEwNzIsImV4cCI6MjA4NDUxNzA3Mn0.XvSVGUgph3XhiRLoJVqeZwNDZbGrociENpsfvQ6VtB8'
  );

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  function setLoading(active) {
    const btn = $('btn-login');
    btn.disabled = active;
    $('btn-spinner').style.display = active ? 'inline-flex' : 'none';
    btn.querySelector('.btn-text').textContent = active ? 'Verificando...' : 'Iniciar sesión';
  }

  function clearErrors() {
    ['usuario', 'password'].forEach(k => {
      $(`error-${k}`).textContent = '';
      $(k).classList.remove('input-error');
    });
    const alert = $('alert-global');
    alert.textContent = '';
    alert.className = 'alert';
  }

  function showFieldError(field, msg) {
    $(`error-${field}`).textContent = msg;
    $(field).classList.add('input-error');
  }

  function showGlobalAlert(msg, type = 'error') {
    const alert = $('alert-global');
    alert.textContent = msg;
    alert.className = `alert alert-${type}`;
  }

  // ─── Validación cliente ────────────────────────────────────────────────────
  function validate() {
    let ok = true;
    const usuario  = $('usuario').value.trim();
    const password = $('password').value;

    if (!usuario) {
      showFieldError('usuario', 'El usuario es requerido.');
      ok = false;
    }
    if (!password) {
      showFieldError('password', 'La contraseña es requerida.');
      ok = false;
    } else if (password.length < 6) {
      showFieldError('password', 'Mínimo 6 caracteres.');
      ok = false;
    }
    return ok;
  }

  // ─── Lógica principal ──────────────────────────────────────────────────────
  async function handleLogin() {
    clearErrors();
    if (!validate()) return;

    setLoading(true);

    const email    = $('usuario').value.trim();
    const password = $('password').value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const msg = error.message.includes('Invalid login credentials')
          ? 'Credenciales incorrectas.'
          : error.message;
        showGlobalAlert(msg);
        setLoading(false);
        return;
      }

      showGlobalAlert('✓ Acceso concedido. Redirigiendo...', 'success');
      setTimeout(() => { window.location.href = 'menu/menu.html'; }, 900);s

    } catch (err) {
      showGlobalAlert('Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  }

  // ─── Event listeners ───────────────────────────────────────────────────────
  $('btn-login').addEventListener('click', handleLogin);

  ['usuario', 'password'].forEach(id => {
    $(id).addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  });

});
