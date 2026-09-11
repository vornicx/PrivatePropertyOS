# Private Property OS — Match-first MVP

MVP B2B para inmobiliarias de lujo centrado en una pregunta:

> Entra una propiedad nueva. ¿A qué compradores de mi cartera debo ofrecérsela primero?

## Flujo implementado

1. Importar compradores desde CSV (cabeceras habituales ES/EN).
2. Añadir una propiedad.
3. Rankear automáticamente toda la cartera.
4. Explicar el score con presupuesto, zona, tipo, dormitorios y extras.
5. Abrir el detalle del match.
6. Copiar un mensaje comercial listo para WhatsApp/email y registrar que ese comprador ya está en gestión.

## Decisión de producto

Esta iteración es local-first para validar el ahorro de tiempo antes de añadir complejidad de CRM. Los datos se guardan en `localStorage` de la demo. No hay secretos ni credenciales privadas en el cliente.

El backend multi-tenant/Supabase se conectará después de validar el flujo con agencias, manteniendo RLS y autorización en servidor para datos reales.

## Verificación

```bash
npm test
npm run build
```
