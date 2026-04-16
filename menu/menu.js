document.addEventListener('DOMContentLoaded', async () => {

  // 🔐 PROTEGER ACCESO (solo admin puede ver este menú)
  const rol = await protegerPagina(['admin']);

  if (!rol) return;

  console.log('Acceso permitido al menú (admin)');

  // ─── BOTÓN LOGOUT ─────────────────────────────────────────
  const btnLogout = document.getElementById('btn-logout');

  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await cerrarSesion();
    });
  }

  // ─── (OPCIONAL) CONTROL DE MÓDULOS POR ROL ────────────────
  // Por ahora solo admin entra aquí, pero te dejo esto listo
  // por si después permitís más roles en el menú

  if (rol !== 'admin') {

    const modCalles = document.getElementById('modulo-calles');
    const modEspacios = document.getElementById('modulo-espacios-publicos');
    const modPlanMol = document.getElementById('modulo-plan-mol');
    const modCentros = document.getElementById('modulo-centros-votacion');

    if (modCalles) modCalles.style.display = 'none';
    if (modEspacios) modEspacios.style.display = 'none';
    if (modPlanMol) modPlanMol.style.display = 'none';
    if (modCentros) modCentros.style.display = 'none';
  }

});