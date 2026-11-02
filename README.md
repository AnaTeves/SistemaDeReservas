# Sistema de Reservas con Agentes

## 1. Especificación breve
**Problema:** El laboratorio necesita gestionar el uso de su equipamiento, registrando reservas sin perder el historial y evitando superposiciones de turnos.
**Alcance y Reglas:** 
- Inventario fijo (MIC-01, MIC-02, OSC-01, MUL-01, FUE-01).
- Se rechazan superposiciones de reservas activas para la misma unidad.
- Se permiten límites consecutivos y reservas simultáneas de unidades distintas.
- La cancelación conserva los datos pero libera el intervalo.
- Las reservas deben persistir al reiniciar la aplicación.
**Supuestos:** La API se consumirá de forma local, por lo que no se implementó autenticación. Los horarios se manejan en formato ISO 8601 (UTC).

## 2. Solución
**Estructura y Decisiones Técnicas:**
Se optó por **Node.js con TypeScript** y **Express.js** para construir una API REST local ligera, y **Jest** para las pruebas automáticas. La persistencia se resolvió mediante un archivo JSON (`data/reservas.json`), que se lee al iniciar y se sobreescribe al crear/cancelar reservas.
- **Requisitos:** Node.js v18+
- **Instalación:** `npm install`
- **Ejecución:** `npm start` (El servidor corre en http://localhost:3000)
- **Pruebas:** `npm test`
- **Persistencia:** Los datos se guardan en `data/reservas.json`. *Advertencia: Si se elimina este archivo manualmente, se perderá el historial de reservas.*

**Ejemplo de Entrada/Salida (POST /reservas):**
```json
// Request
{ "unidad": "MIC-01", "solicitante": "Juan", "inicio": "2026-11-10T10:00:00Z", "fin": "2026-11-10T11:00:00Z" }
// Response (201 Created)
{ "id": "12345", "unidad": "MIC-01", "activa": true, ... }

## 3. Preparación del Agente
**Entorno:** Se utilizó el IDE Windsurf (Cascade) interactuando directamente con el repositorio local.
**Instrucciones y Contexto:** Se configuró el comportamiento base del agente mediante un archivo .windsurfrules que incluyó el inventario fijo, las reglas de negocio, la arquitectura esperada (Express/Jest) y la restricción de persistir datos localmente.

## 4. Registro de decisiones y delegacion
**Registro del Episodio 1: Inicialización y Dominio**
- Objetivo y requisito: Inicializar el proyecto con TypeScript y Jest, e implementar la lógica central de creación de reservas validando reglas de negocio en memoria (rechazar superposiciones, permitir consecutivos, validar solicitante).
- Contexto y extracto de instrucción: Se proporcionó el archivo .windsurfrules con el inventario fijo y reglas de superposición. Instrucción: "inicializa el proyecto Node.js con TypeScript... crea la entidad Reserva y la lógica de validación de disponibilidad en memoria... Crea un test básico en Jest".
- Acción del agente: Generó la configuración base (package.json, tsconfig.json), las entidades Reserva.ts y GestorReservas.ts, y los tests unitarios. Inicialmente preparó todos los archivos de node_modules para ser subidos.
- Decisión humana (Corregir y Aceptar): Se corrigió la acción del agente creando manualmente un .gitignore y haciendo git reset para excluir dependencias pesadas y cumplir con la entrega de solo código y archivos de bloqueo. Luego se aceptó el código de dominio porque los 4 tests automáticos pasaron correctamente.
- Evidencia: Commit [5fe2ceb8459e0c7b81fdbbda4e5a408ba7aba095]

**Registro del Episodio 2: Persistencia y Estados**
- Objetivo y requisito: Persistir las reservas y sus estados en un archivo local para recuperarlas al reiniciar la aplicación, garantizando que al cancelar se conserve el registro pero se libere el intervalo de tiempo.  
- Contexto y extracto de instrucción: Se indicó que las reservas deben persistir en JSON. Instrucción: "Modifica GestorReservas.ts para que al instanciarse cargue las reservas desde un archivo data/reservas.json... Crea un test en Jest que simule crear una reserva, cancelar esa reserva, guardar en disco, instanciar un nuevo GestorReservas y verificar...".
- Acción del agente: Implementó los métodos cargarReservas() y guardarReservas() utilizando la librería nativa fs. Modificó el constructor para aceptar un archivo de forma dinámica. Creó el test Persistencia.test.ts y agregó rutinas de limpieza (beforeEach/afterEach) para que las pruebas no colisionen.
- Decisión humana (Aceptar): Se aceptó el resultado sin correcciones.
- Motivo: La implementación es limpia, modular y el testeo comprobó con éxito la recuperación de datos tras una nueva instancia y la liberación del horario de la unidad cancelada.
- Evidencia: Commit [57cc567e63c9d38ba09bbfafee3998c6cdff4888]

**Registro del Episodio 3: Interfaz API REST local**
- Objetivo y requisito: Exponer las funcionalidades del sistema mediante una API local para interactuar con el dominio de reservas (consultar disponibilidad, reservar, cancelar).  
- Contexto y extracto de instrucción: Se indicó que la interfaz fuera una API simple. Instrucción: "Crea un archivo src/api.ts o src/server.ts que instancie Express... exponer 3 endpoints REST... Implementa manejo de errores básico devolviendo HTTP 400...".
- Acción del agente: Instaló dependencias (supertest), creó server.ts con una arquitectura inyectable (createApp(gestor)) que evita colisiones de puertos en testing, implementó los 3 endpoints con sus códigos de error HTTP, y programó 6 tests de integración. Actualizó el package.json con el script de inicio.
- Decisión humana (Aceptar): Se validó y aceptó el código resultante.
- Motivo: La estructura propuesta facilita el testing unitario y cubre completamente la necesidad de una interfaz sin depender de despliegues complejos.  
- Evidencia: Commit [0e0f1da89adfac5d4e28e7f8f342d94f487c96eb]

## Verificacion de persistencia
Se comprobó mediante un procedimiento manual reproducible creando una reserva vía POST, deteniendo el servidor, reiniciándolo e intentando consultar la disponibilidad vía GET, arrojando el estado ocupado esperado.