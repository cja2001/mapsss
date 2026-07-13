document.addEventListener('DOMContentLoaded', async () => {

  // ─── Proteger página (solo admin) ───────────────────
  const rol = await protegerPagina(['admin']);
  if (!rol) return;

  // ─── Estado global ──────────────────────────────────
  let rolesMap = {}; // { id: nombre, ... }

  //Edge Function
  const EDGE_FUNCTION_URL = 'https://nwnlqaohxzxflmxwrtyy.supabase.co/functions/v1/create-user';


  // ─── Helpers ────────────────────────────────────────
  function showMsg(containerId, text, type) {
    const el = document.getElementById(containerId);
    el.textContent = text;
    el.className = `msg msg-${type}`;
    setTimeout(() => {
      el.textContent = '';
      el.className = 'msg';
    }, 5000);
  }

  function setCrearLoading(active) {
    const btn = document.getElementById('btn-crear');
    btn.disabled = active;
    btn.querySelector('.btn-text').textContent = active ? 'Creando…' : 'Crear usuario';
    document.getElementById('spinner-crear').style.display = active ? 'inline-flex' : 'none';
  }

  // ─── Cargar roles ───────────────────────────────────
  async function cargarRoles() {
    const { data, error } = await supabaseClient
      .from('roles')
      .select('id, nombre')
      .order('nombre');

    if (error) {
      showMsg('msg-crear', 'Error al cargar roles: ' + error.message, 'error');
      return;
    }

    rolesMap = {};
    const select = document.getElementById('sel-rol');
    select.innerHTML = '';

    data.forEach(r => {
      rolesMap[r.id] = r.nombre;
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.nombre;
      select.appendChild(opt);
    });
  }

  // ─── Cargar usuarios ───────────────────────────────
  async function cargarUsuarios() {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('auth_user_id, email, nombre, apellido, activo, rol_id, roles(nombre)')
      .order('email');

    const tbody = document.getElementById('tbody-users');

    if (error) {
      tbody.innerHTML = `<tr><td colspan="6" class="loading-cell" style="color:#f87171;">Error: ${error.message}</td></tr>`;
      return;
    }

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No hay usuarios registrados</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    data.forEach(u => {
      const tr = document.createElement('tr');

      // Build role options
      const roleOptions = Object.entries(rolesMap).map(([id, nombre]) =>
        `<option value="${id}" ${String(id) === String(u.rol_id) ? 'selected' : ''}>${nombre}</option>`
      ).join('');

      tr.innerHTML = `
        <td>${u.nombre || '—'}</td>
        <td>${u.apellido || '—'}</td>
        <td>${u.email || 'N/D'}</td>
        <td>
          <select class="rol-select" data-auth-id="${u.auth_user_id}">
            ${roleOptions}
          </select>
        </td>
        <td>
          <span class="badge ${u.activo ? 'badge-active' : 'badge-inactive'}">
            ${u.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td>
          <button class="btn-action ${u.activo ? 'btn-toggle' : 'btn-activate'}"
                  data-auth-id="${u.auth_user_id}"
                  data-activo="${u.activo}">
            ${u.activo ? 'Desactivar' : 'Activar'}
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // ─── Event: cambiar rol ─────────────────────────
    tbody.querySelectorAll('.rol-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const authId = e.target.dataset.authId;
        const nuevoRolId = e.target.value;

        const { error } = await supabaseClient
          .from('usuarios')
          .update({ rol_id: parseInt(nuevoRolId) })
          .eq('auth_user_id', authId);

        if (error) {
          showMsg('msg-tabla', 'Error al cambiar rol: ' + error.message, 'error');
          await cargarUsuarios();
        } else {
          showMsg('msg-tabla', '✓ Rol actualizado', 'success');
        }
      });
    });

    // ─── Event: activar / desactivar ────────────────
    tbody.querySelectorAll('.btn-action').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const authId = e.target.dataset.authId;
        const activo = e.target.dataset.activo === 'true';

        const accion = activo ? 'desactivar' : 'activar';
        if (!confirm(`¿Seguro que deseas ${accion} este usuario?`)) return;

        const { error } = await supabaseClient
          .from('usuarios')
          .update({ activo: !activo })
          .eq('auth_user_id', authId);

        if (error) {
          showMsg('msg-tabla', 'Error: ' + error.message, 'error');
          return;
        }

        showMsg('msg-tabla', activo ? '✓ Usuario desactivado' : '✓ Usuario activado', 'success');
        await cargarUsuarios();
      });
    });
  }

  // ─── Crear usuario vía auth.admin.createUser ───────
  document.getElementById('form-crear').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('inp-email').value.trim();
    const password = document.getElementById('inp-password').value;
    const rol_id = document.getElementById('sel-rol').value;
    const nombre = document.getElementById('inp-nombre').value.trim();
    const apellido = document.getElementById('inp-apellido').value.trim();

    if (!email || !password || !rol_id || !nombre || !apellido) return;

    setCrearLoading(true);

    try {
      // 1. Obtener la sesión y el token de acceso del administrador actual
      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError || !session) {
        throw new Error('No se pudo validar la sesión del administrador. Por favor, vuelve a iniciar sesión.');
      }

      const token = session.access_token;

      // 2. Llamar a la Edge Function segura para crear el usuario
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          password,
          nombre,
          apellido,
          rol_id
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('La función de creación segura de usuarios no está desplegada en tu proyecto de Supabase. Despliégala ejecutando: "supabase functions deploy create-user"');
        }
        throw new Error(resData.error || 'Error al procesar la creación del usuario.');
      }

      // Éxito
      showMsg('msg-crear', '✓ Usuario creado exitosamente', 'success');
      document.getElementById('form-crear').reset();
      await cargarUsuarios();

    } catch (err) {
      let msg = err.message || 'Error desconocido';
      if (msg === 'TypeError: Failed to fetch' || msg === 'Failed to fetch') {
        msg = 'No se pudo conectar con la Edge Function. Esto usualmente significa que no está desplegada en tu proyecto de Supabase. Despliégala con: "supabase functions deploy create-user"';
      }
      showMsg('msg-crear', msg, 'error');
    } finally {
      setCrearLoading(false);
    }
  });

  // ─── Inicializar ───────────────────────────────────
  await cargarRoles();
  await cargarUsuarios();
});
