document.addEventListener('DOMContentLoaded', async () => {

  // PROTEGER ACCESO (admin y editor_luminarias pueden ver este menú)
  const rol = await protegerPagina(['admin', 'editor_luminarias']);

  if (!rol) return;

  console.log('Acceso permitido al menú, rol:', rol);

  // ─── BOTÓN LOGOUT ─────────────────────────────────────────
  const btnLogout = document.getElementById('btn-logout');

  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      await cerrarSesion();
    });
  }

  // ─── CONTROL DE MÓDULOS POR ROL ────────────────────────────
  // editor_luminarias solo ve Censo Luminarias y Reporte de Luminarias
  if (rol === 'editor_luminarias') {
    const modPlanMol = document.getElementById('modulo-plan-mol');
    const modCentros = document.getElementById('centros-de-votacion');
    const modAdmin = document.getElementById('modulo-admin-usuarios');

    if (modPlanMol) modPlanMol.style.display = 'none';
    if (modCentros) modCentros.style.display = 'none';
    if (modAdmin) modAdmin.style.display = 'none';
  }

});