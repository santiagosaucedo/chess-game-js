# TypeScript Chess Engine (MVP)

**Juega el MVP en producción aquí :** [https://chess-game-js-nine.vercel.app](https://chess-game-js-nine.vercel.app)

## Descripción del Proyecto
Este proyecto consiste en un motor de ajedrez funcional desarrollado completamente desde cero utilizando TypeScript en modo estricto. 
Diseñado bajo el patrón de arquitectura Modelo-Vista-Controlador (MVC) y principios de Programación Orientada a Objetos (POO), 
el sistema opera como una Single Page Application (SPA) que gestiona validaciones matemáticas complejas, predicción de estados y
un oponente autónomo (IA) en un entorno local. 

El proyecto se presenta como un Producto Mínimo Viable (MVP) enfocado en demostrar solidez arquitectónica, 
separación de responsabilidades y buenas prácticas de ingeniería de software.

## Tecnologías Utilizadas
* **Lenguaje Core:** TypeScript (Modo Estricto).
* **Paradigma:** Programación Orientada a Objetos (POO).
* **Patrón de Diseño:** MVC (Modelo-Vista-Controlador).
* **Interfaz de Usuario:** HTML5, CSS3 (Flexbox/Grid), manipulación nativa del DOM (Vanilla JS).
* **Control de Versiones:** Git y GitHub (Convención de Commits).
* **Despliegue Continuo (CI/CD):** Vercel.

## Desafíos Técnicos Resueltos
Durante el desarrollo del core lógico, se abordaron y resolvieron las siguientes complejidades de ingeniería:

1. **Manejo de Estados Complejos y Concurrencia:** Sincronización milimétrica entre la matriz lógica de datos (Modelo) y
    su representación gráfica (Vista). Se implementó una máquina de estados para gestionar los flujos de interacción del usuario
   (selección vs. acción) y un escudo de concurrencia que bloquea el input humano mientras el motor de Inteligencia Artificial
    procesa su árbol de decisiones o durante la resolución final de la partida.

2. **Validación Exhaustiva de Reglas de Ajedrez:** Desarrollo de un motor de geometría algorítmica acoplado a un sistema de detección de
    colisiones (ray-casting). El desafío más crítico resuelto fue la programación de un "Radar Predictivo":
    un sistema de simulación de estado temporal (Rollback) que proyecta jugadas futuras en memoria para evaluar amenazas estáticas y
    anular movimientos que expongan al propio Rey (Regla Anti-Suicidio).

3. **Escalabilidad y Salud del Código:** Aislamiento absoluto de la lógica de negocio respecto a la capa de presentación.
   El sistema procesa Jaques, Jaques Mates y empates (Ahogado) operando exclusivamente sobre matrices matemáticas,
   asegurando que la arquitectura base sea exportable directamente a un entorno de servidor sin necesidad de refactorización estructural.

## Instalación y Despliegue Local

Para ejecutar este proyecto en un entorno de desarrollo local, siga los siguientes pasos:

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/santiagosaucedo/chess-game-js.git
2. Instalar las dependencias de compilación:
   ```bash
    npm install
3. Ejecutar el compilador de TypeScript en modo vigilancia:
   ```bash
     npm run watch
4. Levantar el archivo index.html mediante un servidor local (Ej. Live Server).

## Roadmap y Próximos Pasos

El proyecto cuenta con una ruta de escalabilidad planificada para transicionar de un MVP local a una plataforma competitiva online:

 * Integración de Assets Multimedia (Pendiente Inmediato): Inyección de los archivos de audio físicos en la carpeta de producción 
  (explosion.mp3, comer.mp3, musica-arcade.mp3) para habilitar la experiencia inmersiva programada en el controlador DOM.

 * Activación de Temporizadores: Enlace de los relojes digitales de la interfaz con la máquina de estados mediante intervalos asíncronos 
  controlados.

 * Transición a Sistema Distribuido (Multijugador): Migración del núcleo de validación hacia un servidor backend nativo en Node.js, 
  orquestando partidas P2P en tiempo real a través de WebSockets (Socket.io).

 * Persistencia de Datos (Backend): Implementación de una base de datos relacional (PostgreSQL) gestionada por Prisma ORM para establecer el
  modelo CRUD de usuarios, registro de sesiones, historiales de victoria y cálculo de ranking global ELO.

 * Evolución Heurística de la IA: Transición del algoritmo base actual (Greedy) hacia una arquitectura de toma de decisiones basada en 
  árboles Minimax con poda Alfa-Beta, permitiendo el ajuste paramétrico de la dificultad del agente.
