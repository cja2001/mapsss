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

  // ─── Mostrar / ocultar contraseña ──────────────────────────────────────────
  const togglePassword = $('togglePassword');
  const passwordInput = $('password');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const esPassword = passwordInput.getAttribute('type') === 'password';

      passwordInput.setAttribute('type', esPassword ? 'text' : 'password');
      togglePassword.textContent = esPassword ? '🙈' : '👁️';
      togglePassword.setAttribute(
        'aria-label',
        esPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
      );
    });
  }

  // ─── Validación cliente ────────────────────────────────────────────────────
  function validate() {
    let ok = true;
    const usuario = $('usuario').value.trim();
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

  // ─── Obtener rol desde tabla usuarios + roles ─────────────────────────────
  async function obtenerRolUsuario(authUserId) {
  // 1. Buscar perfil del usuario
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .select('activo, rol_id, email, auth_user_id')
    .eq('auth_user_id', authUserId)
    .single();

  console.log('perfil:', perfil);
  console.log('perfilError:', perfilError);

  if (perfilError || !perfil) {
    throw new Error('No se pudo obtener el perfil del usuario.');
  }

  if (!perfil.activo) {
    throw new Error('Tu usuario está inactivo.');
  }

  // 2. Buscar el nombre del rol
  const { data: rolData, error: rolError } = await supabase
    .from('roles')
    .select('nombre')
    .eq('id', perfil.rol_id)
    .single();

  console.log('rolData:', rolData);
  console.log('rolError:', rolError);

  if (rolError || !rolData) {
    throw new Error('No se pudo obtener el rol del usuario.');
  }

  return rolData.nombre;
}

  // ─── Redirección por rol ───────────────────────────────────────────────────
  function redirigirSegunRol(rol) {
    if (rol === 'admin') {
      window.location.href = 'menu/menu.html';
      return;
    }

    if (rol === 'editor_luminarias') {
      window.location.href = 'menu/reporte_luminarias/rluminarias.html';
      return;
    }

    throw new Error('No tienes permisos para acceder al sistema.');
  }

  // ─── Lógica principal ──────────────────────────────────────────────────────
  async function handleLogin() {
    clearErrors();

    if (!validate()) return;

    setLoading(true);

    const email = $('usuario').value.trim();
    const password = $('password').value;

    try {
      // 1) Login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        const msg = loginError.message.includes('Invalid login credentials')
          ? 'Credenciales incorrectas.'
          : loginError.message;

        showGlobalAlert(msg);
        setLoading(false);
        return;
      }

      // 2) Obtener usuario autenticado
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        showGlobalAlert('No se pudo obtener la sesión del usuario.');
        setLoading(false);
        return;
      }

      // 3) Obtener rol
      const rol = await obtenerRolUsuario(authData.user.id);

      showGlobalAlert('✓ Acceso concedido. Redirigiendo...', 'success');

      // 4) Redirigir según rol
      setTimeout(() => {
        try {
          redirigirSegunRol(rol);
        } catch (err) {
          console.error(err);
          showGlobalAlert(err.message || 'No autorizado.');
          setLoading(false);
        }
      }, 300);

    } catch (err) {
      console.error(err);
      showGlobalAlert(err.message || 'Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  }

  // ─── Event listeners ───────────────────────────────────────────────────────
  $('btn-login').addEventListener('click', handleLogin);

  ['usuario', 'password'].forEach(id => {
    $(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') handleLogin();
    });
  });

});