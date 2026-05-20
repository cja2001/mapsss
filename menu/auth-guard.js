const supabaseUrl = 'https://nwnlqaohxzxflmxwrtyy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bmxxYW9oeHp4ZmxteHdydHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDEwNzIsImV4cCI6MjA4NDUxNzA3Mn0.XvSVGUgph3XhiRLoJVqeZwNDZbGrociENpsfvQ6VtB8';

const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Obtener sesión y rol del usuario
async function obtenerSesionYRol() {
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();

  if (authError || !authData.user) {
    return { user: null, rol: null, error: 'No autenticado' };
  }

  const user = authData.user;

  const { data: perfil, error: perfilError } = await supabaseClient
    .from('usuarios')
    .select(`
      activo,
      roles (
        nombre
      )
    `)
    .eq('auth_user_id', user.id)
    .single();

  if (perfilError || !perfil) {
    return { user, rol: null, error: 'Perfil no encontrado' };
  }

  if (!perfil.activo) {
    return { user, rol: null, error: 'Usuario inactivo' };
  }

  const rol = perfil.roles?.nombre || null;

  return { user, rol, error: null };
}

// Proteger página según roles permitidos
async function protegerPagina(rolesPermitidos = []) {
  const { rol, error } = await obtenerSesionYRol();

  if (error) {
    window.location.href = '../index.html';
    return null;
  }

  if (!rolesPermitidos.includes(rol)) {
    await supabaseClient.auth.signOut();
    window.location.href = '../index.html';
    return null;
  }

  return rol;
}

// Cerrar sesión
async function cerrarSesion() {
  await supabaseClient.auth.signOut();
  window.location.href = '../index.html';
}

// Exportar al scope global
window.supabaseClient = supabaseClient;
window.obtenerSesionYRol = obtenerSesionYRol;
window.protegerPagina = protegerPagina;
window.cerrarSesion = cerrarSesion;