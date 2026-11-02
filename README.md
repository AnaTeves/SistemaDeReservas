# Sistema de Reservas con Agentes

## 1. Especificación breve

**Problema:**  
La coordinación de un laboratorio necesita gestionar el uso de su equipamiento, registrando reservas sin perder el historial y evitando superposiciones de turnos para una misma unidad. A menudo, las cancelaciones bloqueaban horarios de manera ineficiente, por lo que se requiere un sistema preciso de liberación de disponibilidad.

**Alcance y Reglas de Negocio:** 
- **Inventario fijo y precargado:** MIC-01, MIC-02 (Microscopios), OSC-01 (Osciloscopio), MUL-01 (Multímetro), FUE-01 (Fuente de alimentación).
- **Validaciones:** Se rechazan superposiciones de reservas activas para la misma unidad. Se requiere un solicitante válido (no vacío) y fechas coherentes (inicio anterior a fin).
- **Concurrencia temporal:** Se permiten límites consecutivos (ej. 10:00 a 11:00 y 11:00 a 12:00) y reservas simultáneas de unidades distintas.
- **Cancelaciones:** La cancelación de una reserva conserva sus datos e identificador en el historial, pero libera el intervalo de tiempo.
- **Persistencia:** Las reservas y sus estados persisten en almacenamiento local para recuperarse al reiniciar la aplicación.

**Supuestos:**  
La API está diseñada para consumo local. No se implementó autenticación, roles de usuario, ni una interfaz gráfica compleja, priorizando la solidez del dominio. Los horarios se manejan estrictamente en formato ISO 8601 (UTC).

---

## 2. Solución

**Decisiones Técnicas y Estructura:**  
Se optó por **Node.js con TypeScript** para garantizar tipado estricto en las reglas de negocio, y **Express.js** para construir una API REST local ligera y funcional. Para asegurar la calidad, se utilizó **Jest** cubriendo los casos de uso principales.

```text
📦 Estructura del Proyecto
 ┣ 📂 data           # Almacenamiento local (reservas.json)
 ┣ 📂 src            # Código fuente (Entidades, Gestor y API)
 ┣ 📂 tests          # Pruebas automatizadas (Jest y Supertest)
 ┣ 📜 .windsurfrules # Instrucciones y contexto del agente de IA
 ┣ 📜 package.json   # Dependencias y scripts
 ┗ 📜 README.md      # Documentación principal
 ```
 
---

**Requisitos e Instalación:**

*Requisito: Node.js v18+*

*Instalación de dependencias: npm install*

*Ejecución del servidor: npm start (El servidor corre en http://localhost:3000)*

*Ejecución de pruebas automáticas: npm test*

**Gestión de Datos y Persistencia:**

*Los datos se guardan en data/reservas.json. El archivo se lee al instanciar el servidor y se sobreescribe de forma segura al crear o cancelar reservas.*

*(Advertencia: Si se elimina este archivo manualmente o se purga el directorio, se perderá el historial de reservas).*

**Verificación Manual de Persistencia (Procedimiento Reproducible):**

*Además de las pruebas en código, la persistencia se comprobó mediante el siguiente procedimiento:*

*Se creó una reserva vía POST /reservas.*

*Se detuvo el proceso del servidor (Ctrl + C).*

*Se reinició el servidor (npm start).*

Se consultó el intervalo vía GET /disponibilidad, confirmando que el sistema arrojó el estado "ocupado" (False), demostrando la correcta recuperación del estado.

## 3. Preparación del Agente
**Entorno:** Se utilizó el IDE Windsurf (Cascade) interactuando directamente con el repositorio local. Se eligió esta herramienta porque permite una integración fluida de lectura/escritura en el sistema de archivos y ejecución de comandos en terminal, cumpliendo el rol de agente autónomo supervisado.

**Instrucciones, Contexto y Adaptacion:** El contexto del agente se fijó a través del archivo .windsurfrules ubicado en la raíz del proyecto. En este documento se inyectaron las reglas de negocio estrictas (inventario, superposiciones, consecutivos), los límites técnicos (no base de datos, no auth) y la directiva de usar TDD (Test-Driven Development) con Jest. Este archivo garantizó que el agente no alucinara herramientas externas y se ciñera al alcance del laboratorio.

## 4. Registro de decisiones y delegacion
**Registro del Episodio 1: Inicialización y Dominio**
- Objetivo y requisito: Inicializar el proyecto con TypeScript y Jest, e implementar la lógica central de creación de reservas validando reglas de negocio en memoria (rechazar superposiciones, permitir consecutivos, validar solicitante).
- Contexto y extracto de instrucción: Se proporcionó el archivo .windsurfrules con el inventario fijo y reglas de superposición. Instrucción: "inicializa el proyecto Node.js con TypeScript... crea la entidad Reserva y la lógica de validación de disponibilidad en memoria... Crea un test básico en Jest".
- Acción del agente: Generó la configuración base (package.json, tsconfig.json), las entidades Reserva.ts y GestorReservas.ts, y los tests unitarios. Inicialmente preparó todos los archivos de node_modules para ser subidos.
- Decisión humana (Corregir y Aceptar): Se corrigió la acción del agente creando manualmente un .gitignore y haciendo git reset para excluir dependencias pesadas y cumplir con la entrega de solo código y archivos de bloqueo. Luego se aceptó el código de dominio porque los 4 tests automáticos pasaron correctamente.
- Evidencia: Commit [episodio1](https://github.com/AnaTeves/agentIA/commit/5fe2ceb8459e0c7b81fdbbda4e5a408ba7aba095)

**Registro del Episodio 2: Persistencia y Estados**
- Objetivo y requisito: Persistir las reservas y sus estados en un archivo local para recuperarlas al reiniciar la aplicación, garantizando que al cancelar se conserve el registro pero se libere el intervalo de tiempo.  
- Contexto y extracto de instrucción: Se indicó que las reservas deben persistir en JSON. Instrucción: "Modifica GestorReservas.ts para que al instanciarse cargue las reservas desde un archivo data/reservas.json... Crea un test en Jest que simule crear una reserva, cancelar esa reserva, guardar en disco, instanciar un nuevo GestorReservas y verificar...".
- Acción del agente: Implementó los métodos cargarReservas() y guardarReservas() utilizando la librería nativa fs. Modificó el constructor para aceptar un archivo de forma dinámica. Creó el test Persistencia.test.ts y agregó rutinas de limpieza (beforeEach/afterEach) para que las pruebas no colisionen.
- Decisión humana (Aceptar): Se aceptó el resultado sin correcciones.
- Motivo: La implementación es limpia, modular y el testeo comprobó con éxito la recuperación de datos tras una nueva instancia y la liberación del horario de la unidad cancelada.
- Evidencia: Commit [episodio2](https://github.com/AnaTeves/agentIA/commit/57cc567e63c9d38ba09bbfafee3998c6cdff4888)

**Registro del Episodio 3: Interfaz API REST local**
- Objetivo y requisito: Exponer las funcionalidades del sistema mediante una API local para interactuar con el dominio de reservas (consultar disponibilidad, reservar, cancelar).  
- Contexto y extracto de instrucción: Se indicó que la interfaz fuera una API simple. Instrucción: "Crea un archivo src/api.ts o src/server.ts que instancie Express... exponer 3 endpoints REST... Implementa manejo de errores básico devolviendo HTTP 400...".
- Acción del agente: Instaló dependencias (supertest), creó server.ts con una arquitectura inyectable (createApp(gestor)) que evita colisiones de puertos en testing, implementó los 3 endpoints con sus códigos de error HTTP, y programó 6 tests de integración. Actualizó el package.json con el script de inicio.
- Decisión humana (Aceptar): Se validó y aceptó el código resultante.
- Motivo: La estructura propuesta facilita el testing unitario y cubre completamente la necesidad de una interfaz sin depender de despliegues complejos.  
- Evidencia: Commit [episodio3](https://github.com/AnaTeves/agentIA/commit/0e0f1da89adfac5d4e28e7f8f342d94f487c96eb)

## Verificacion de persistencia
Se comprobó mediante un procedimiento manual reproducible creando una reserva vía POST, deteniendo el servidor, reiniciándolo e intentando consultar la disponibilidad vía GET, arrojando el estado ocupado esperado.