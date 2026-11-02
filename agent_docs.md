## Registro del Episodio 1: Inicialización y Dominio
- Objetivo y requisito: Inicializar el proyecto con TypeScript y Jest, e implementar la lógica central de creación de reservas validando reglas de negocio en memoria (rechazar superposiciones, permitir consecutivos, validar solicitante).
- Contexto y extracto de instrucción: Se proporcionó el archivo .windsurfrules con el inventario fijo y reglas de superposición. Instrucción: "inicializa el proyecto Node.js con TypeScript... crea la entidad Reserva y la lógica de validación de disponibilidad en memoria... Crea un test básico en Jest".
- Acción del agente: Generó la configuración base (package.json, tsconfig.json), las entidades Reserva.ts y GestorReservas.ts, y los tests unitarios. Inicialmente preparó todos los archivos de node_modules para ser subidos.
- Decisión humana (Corregir y Aceptar): Se corrigió la acción del agente creando manualmente un .gitignore y haciendo git reset para excluir dependencias pesadas y cumplir con la entrega de solo código y archivos de bloqueo. Luego se aceptó el código de dominio porque los 4 tests automáticos pasaron correctamente.
- Evidencia: Commit [Setup inicial: Node, Typescript, Express y Jest.]

## Registro del Episodio 2: Persistencia y Estados
- Objetivo y requisito: Persistir las reservas y sus estados en un archivo local para recuperarlas al reiniciar la aplicación, garantizando que al cancelar se conserve el registro pero se libere el intervalo de tiempo.  
- Contexto y extracto de instrucción: Se indicó que las reservas deben persistir en JSON. Instrucción: "Modifica GestorReservas.ts para que al instanciarse cargue las reservas desde un archivo data/reservas.json... Crea un test en Jest que simule crear una reserva, cancelar esa reserva, guardar en disco, instanciar un nuevo GestorReservas y verificar...".
- Acción del agente: Implementó los métodos cargarReservas() y guardarReservas() utilizando la librería nativa fs. Modificó el constructor para aceptar un archivo de forma dinámica. Creó el test Persistencia.test.ts y agregó rutinas de limpieza (beforeEach/afterEach) para que las pruebas no colisionen.
- Decisión humana (Aceptar): Se aceptó el resultado sin correcciones.
- Motivo: La implementación es limpia, modular y el testeo comprobó con éxito la recuperación de datos tras una nueva instancia y la liberación del horario de la unidad cancelada.
- Evidencia: Commit [feat: persistencia en JSON y pruebas de estado]