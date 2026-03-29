/// ─── Helpers ────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://nwnlqaohxzxflmxwrtyy.supabase.co', 'sb_publishable_XjDNrEjB-cbw1_zOlmOCpQ_WCmFjSXr')

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
    $(`${k}`).classList.remove('input-error');
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

// ─── Validación cliente ──────────────────────────────────────────────────────
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

// ─── Lógica principal ────────────────────────────────────────────────────────
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

    // Login exitoso — data.session contiene el JWT
    showGlobalAlert('✓ Acceso concedido. Redirigiendo...', 'success');
    setTimeout(() => { window.location.href = 'maps/maps.html'; }, 900);

  } catch (err) {
    showGlobalAlert('Error de conexión. Intenta de nuevo.');
    setLoading(false);
  }
}

// ─── Enter key support ───────────────────────────────────────────────────────
['usuario', 'password'].forEach(id => {
  $(id).addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
});