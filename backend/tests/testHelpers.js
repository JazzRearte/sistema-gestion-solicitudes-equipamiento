const fs = require('fs');
const path = require('path');

const HASH = '$2a$10$K34nDS.qjPOKKh6WYkxdBeAqPJp93iBRRHPeu8dc6eoWyEMGGFCIi';
const DATA_DIR = path.join(__dirname, '../data');

function resetearDatos() {
  const usuarios = [
    { id: 'usr-001', nombre: 'Admin Test', email: 'admin@test.com', passwordHash: HASH, rol: 'admin', activo: true },
    { id: 'usr-002', nombre: 'Encargado Test', email: 'encargado@test.com', passwordHash: HASH, rol: 'encargado', activo: true },
    { id: 'usr-003', nombre: 'Usuario Test', email: 'usuario@test.com', passwordHash: HASH, rol: 'usuario', activo: true },
  ];
  const equipos = [
    { id: 'eq-001', codigoInventario: 'INV-T-001', nombre: 'Notebook Test A', categoria: 'notebook', estado: 'disponible', ubicacion: 'Lab Test', requiereAutorizacion: false },
    { id: 'eq-002', codigoInventario: 'INV-T-002', nombre: 'Proyector Test', categoria: 'proyector', estado: 'disponible', ubicacion: 'Aula Test', requiereAutorizacion: false },
    { id: 'eq-003', codigoInventario: 'INV-T-003', nombre: 'Camara Test', categoria: 'camara', estado: 'disponible', ubicacion: 'Deposito Test', requiereAutorizacion: true },
    { id: 'eq-004', codigoInventario: 'INV-T-004', nombre: 'Notebook Test B', categoria: 'notebook', estado: 'mantenimiento', ubicacion: 'Taller Test', requiereAutorizacion: false },
  ];
  const solicitudes = [
    { id: 'sol-001', equipoId: 'eq-001', usuarioId: 'usr-003', fechaRetiro: '2026-07-01', fechaDevolucion: '2026-07-05', motivo: 'Test pendiente', estado: 'pendiente', autorizadoPor: null },
    { id: 'sol-002', equipoId: 'eq-002', usuarioId: 'usr-003', fechaRetiro: '2026-07-10', fechaDevolucion: '2026-07-15', motivo: 'Test aprobada', estado: 'aprobada', autorizadoPor: 'usr-001' },
    { id: 'sol-003', equipoId: 'eq-001', usuarioId: 'usr-003', fechaRetiro: '2026-08-01', fechaDevolucion: '2026-08-05', motivo: 'Test rechazada', estado: 'rechazada', autorizadoPor: null },
    { id: 'sol-004', equipoId: 'eq-002', usuarioId: 'usr-003', fechaRetiro: '2026-05-01', fechaDevolucion: '2026-05-05', motivo: 'Test vencida', estado: 'aprobada', autorizadoPor: 'usr-001' },
  ];
  const historial = [
    { id: 'hist-001', solicitudId: 'sol-001', usuarioId: 'usr-003', accion: 'creacion', fechaHora: '2026-06-01T10:00:00', valorAnterior: null, valorNuevo: { estado: 'pendiente' } },
  ];
  fs.writeFileSync(path.join(DATA_DIR, 'usuarios.json'), JSON.stringify(usuarios, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'equipos.json'), JSON.stringify(equipos, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'solicitudes.json'), JSON.stringify(solicitudes, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'historial.json'), JSON.stringify(historial, null, 2));
}

module.exports = { resetearDatos };
