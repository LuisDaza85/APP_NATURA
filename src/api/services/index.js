// src/api/services/index.js
// Exportaciones centralizadas de servicios

export { default as authService } from './auth.service';
export { default as sensorService } from './sensor.service';
export { default as deviceService } from './device.service';
export { default as orderService } from './order.service';
export { default as producerService } from './producer.service';
export { default as productService } from './product.service';
export { default as carritoService } from './carrito.service';  // 🆕 NUEVO

// Re-exportar helpers
export { getSensorStatusColor, formatSensorValue } from './sensor.service';
export { getOrderStatusLabel, getNextStatus, canUpdateStatus } from './order.service';

// Re-exportar funciones del carrito  // 🆕 NUEVO
export { 
  obtenerCarrito, 
  agregarAlCarrito, 
  actualizarCantidad, 
  eliminarDelCarrito,
  vaciarCarrito,
  obtenerCantidadItems 
} from './carrito.service';