// src/main.ts
import { MotorIA } from './models/MotorIA.js';
import { Tablero } from './models/Tablero.js'; 
import { Posicion, Color, TipoPieza } from './models/types.js'; 
import { Rey } from './models/Rey.js';

/* ====================================================================
    INSTANCIAS GLOBALES (MODELO Y VISTA)
====================================================================
*/
const juego = new Tablero();
const contenedorTablero = document.getElementById('tablero-web');
// NUEVO: Referencia al texto del turno en el HTML
const elementoTextoTurno = document.getElementById('turno-texto');


// Referencias al DOM para la interfaz de jugadores y audio
const etiquetaColorLocal = document.getElementById('color-local');
const etiquetaColorRival = document.getElementById('color-rival');
const btnMusica = document.getElementById('btn-musica') as HTMLButtonElement;
const audioFondo = document.getElementById('audio-fondo') as HTMLAudioElement;

// Asignación de rol matemática (Operación CREATE de estado inicial)
let colorJugadorLocal: Color;
let colorOponente: Color;

if (Math.random() < 0.5) {
    colorJugadorLocal = Color.BLANCO;
    colorOponente = Color.NEGRO;
} else {
    colorJugadorLocal = Color.NEGRO;
    colorOponente = Color.BLANCO;
}


/*
PROPÓSITO: Memoria a corto plazo del Controlador. 
INV. REP.: 
 * Si es 'null', el usuario está en Estado de Selección (buscando qué mover).
 * Si tiene una Posicion, el usuario está en Estado de Acción (buscando a dónde mover).
*/
let posicionOrigenSeleccionada: Posicion | null = null;
// NUEVO: Memoria temporal de los movimientos válidos para pintar los puntos verdes
let destinosValidos: Posicion[] = [];

// NUEVO: Bloqueo de la máquina de estados durante la coronación
let coordenadaPromocion: Posicion | null = null;


// NUEVO: Bandera global para detener el motor cuando finaliza la partida
let juegoTerminado: boolean = false;


// NUEVO: Sistema de Puntuación para el futuro Ranking BD
let puntajeBlancas = 0;
let puntajeNegras = 0;

/*
PROPÓSITO: Modelar el diccionario visual que traduce tipos lógicos a rutas de archivos gráficos.
INV. REP.:
 * Todo color válido (BLANCO, NEGRO) debe existir como clave principal.
 * Toda pieza válida (TipoPieza) debe existir mapeada a un String (Ruta relativa válida en /assets).
*/
const DICCIONARIO_PIEZAS: Record<Color, Record<TipoPieza, string>> = {
    [Color.BLANCO]: {
        [TipoPieza.REY]: './assets/reiBlanco.png', 
        [TipoPieza.REINA]: './assets/reinaBlanca.png', 
        [TipoPieza.TORRE]: './assets/torreBlanca.png',
        [TipoPieza.ALFIL]: './assets/alfilBlanco.png', 
        [TipoPieza.CABALLO]: './assets/caballoBlanco.png', 
        [TipoPieza.PEON]: './assets/peonBlanco.png'
    },
    [Color.NEGRO]: {
        [TipoPieza.REY]: './assets/reiNegro.png', 
        [TipoPieza.REINA]: './assets/reinaNegra.png', 
        [TipoPieza.TORRE]: './assets/torreNegra.png',
        [TipoPieza.ALFIL]: './assets/alfilNegro.png', 
        [TipoPieza.CABALLO]: './assets/caballoNegro.png', 
        [TipoPieza.PEON]: './assets/peonNegro.png'
    }
};

function mostrarEfectoCaptura(destino: Posicion, piezaComida: TipoPieza, piezaComedora: TipoPieza, colorComedor: Color): void {
    /*
    Propósito:
     * Calcular el valor en puntos de una captura e instanciar un elemento 
       visual temporal en el DOM con estilo Arcade.
    */
    
    // Tabla de valores Arcade
    const valores: Record<string, number> = {
        [TipoPieza.PEON]: 100,
        [TipoPieza.CABALLO]: 300,
        [TipoPieza.ALFIL]: 300,
        [TipoPieza.TORRE]: 500,
        [TipoPieza.REINA]: 900
    };

    let puntosGanados = valores[piezaComida] || 0;

    // Bono de "David vs Goliat": Si una pieza débil come a una fuerte, gana extra
    if ((valores[piezaComedora] ?? 0) < (valores[piezaComida] ?? 0)) {
        puntosGanados += 200; 
    }

    // Actualizamos el modelo de datos temporal (preparación CRUD para la BD)
    if (colorComedor === Color.BLANCO) puntajeBlancas += puntosGanados;
    else puntajeNegras += puntosGanados;

    console.log(`[Marcador] Blancas: ${puntajeBlancas} | Negras: ${puntajeNegras}`);

    // Operación CREATE: Texto flotante en el DOM
    const casillaVisual = document.querySelector(`[data-fila="${destino.fila}"][data-columna="${destino.columna}"]`) as HTMLElement;
    if (casillaVisual) {
        const textoFlotante = document.createElement('div');
        textoFlotante.classList.add('efecto-nom');
        textoFlotante.innerHTML = `ÑOM!<br>+${puntosGanados}`;
        
        casillaVisual.appendChild(textoFlotante);

        // Limpieza de memoria: Destruimos el nodo tras 1 segundo (lo que dura la animación CSS)
        setTimeout(() => {
            textoFlotante.remove();
        }, 1000);
    }
}


function evaluarYMostrarPromocion(destino: Posicion): void {
    /*
    Propósito:
     * Detectar si un Peón llegó al extremo del tablero y generar dinámicamente 
       la interfaz de coronación.
    */
    const pieza = juego.obtenerPieza(destino);
    if (!pieza || pieza.tipo !== TipoPieza.PEON) return;

    // Condición de coronación: Blancas llegan a la fila 7, Negras a la fila 0
    const esCoronacionBlanca = (pieza.color === Color.BLANCO && destino.fila === 7);
    const esCoronacionNegra = (pieza.color === Color.NEGRO && destino.fila === 0);

    if (esCoronacionBlanca || esCoronacionNegra) {
        coordenadaPromocion = destino;
        
        // Operación CREATE: Generamos el menú flotante en el DOM
        const menu = document.createElement('div');
        menu.classList.add('menu-promocion');
        
        const titulo = document.createElement('h3');
        titulo.textContent = 'Elige tu coronacion:';
        menu.appendChild(titulo);

        const contenedorOpciones = document.createElement('div');
        contenedorOpciones.classList.add('opciones-contenedor');

        const opciones = [TipoPieza.REINA, TipoPieza.TORRE, TipoPieza.CABALLO, TipoPieza.ALFIL];

        opciones.forEach(tipo => {
            const btn = document.createElement('div');
            btn.classList.add('opcion-promocion');

            const img = document.createElement('img');
            img.src = DICCIONARIO_PIEZAS[pieza.color][tipo];
            
            const texto = document.createElement('span');
            texto.textContent = tipo;

            btn.appendChild(img);
            btn.appendChild(texto);

            // Escuchador del click para la elección final
            btn.addEventListener('click', () => {
                if (coordenadaPromocion) {
                    juego.promoverPeon(coordenadaPromocion, tipo);
                    coordenadaPromocion = null; // Desbloqueamos el juego
                    menu.remove(); // Operación DELETE visual
                    actualizarPantalla();
                }
            });

            contenedorOpciones.appendChild(btn);
        });

        menu.appendChild(contenedorOpciones);
        contenedorTablero?.appendChild(menu);
    }
}



//Logica encargada del procesamiento de interacciones con el usuario para seguir el orden correcto de un juego de ajedrez 

function procesarInteraccionUsuario(filaObjetivo: number, columnaObjetivo: number): void {
    /*
    Propósito:
     * Gestionar la máquina de estados de la interfaz al recibir un click, 
       alternando entre la selección de una pieza y la ejecución de un movimiento.
    
    Precondición:
     * Las coordenadas dadas deben estar dentro de los límites del tablero (0-7).
    
    Parámetros:
     * filaObjetivo : Número
     * columnaObjetivo : Número
    
    Tipo:
     * Void
    
    Observaciones:
     * Operación READ sobre el Modelo para validar la propiedad de la pieza y sus destinos.
     * Operación UPDATE sobre el Modelo (moverPieza) si el estado es de Acción.
     * Implementa un bloque Try-Catch para gestionar las precondiciones estrictas 
       del método 'moverPieza' sin interrumpir el flujo visual (limpieza de estado).
    */
    // NUEVO: Candado maestro. Si el juego terminó (Jaque Mate / Empate), congela los clicks.
    if (juegoTerminado) return;

    // Si hay un menú de coronación abierto, ignoramos los clicks en el tablero
    if (coordenadaPromocion !== null) return;

    // NUEVO: Escudo de concurrencia. El jugador no puede tocar nada si es el turno de la IA.
    if (juego.turnoActual === colorOponente) {
        console.log("[Sistema] Bloqueo de UI: Esperando respuesta del agente IA.");
        return;
    }

    // Chivato para saber que el click llegó vivo al TypeScript
    console.log(`\n[Interaccion] Click detectado en -> Fila: ${filaObjetivo}, Columna: ${columnaObjetivo}`);

    const posicionClickeada: Posicion = { fila: filaObjetivo, columna: columnaObjetivo };

    if (posicionOrigenSeleccionada === null) {
        
        // --- ESTADO 1: SELECCIÓN INICIAL ---
        // El usuario quiere agarrar una pieza. Operación READ.
        const piezaTocada = juego.obtenerPieza(posicionClickeada);
        
        if (piezaTocada) {
            // Solo puede seleccionar si hay una pieza y es de su turno
            if (piezaTocada.color === juego.turnoActual) {
                console.log(`[Seleccion] Pieza valida seleccionada: ${piezaTocada.tipo} ${piezaTocada.color}`);
                posicionOrigenSeleccionada = posicionClickeada;
                
                // Operación READ - Le pedimos al modelo los destinos legales para pintarlos
                destinosValidos = juego.obtenerMovimientosPosibles(posicionClickeada); 
                
                actualizarPantalla(); // Forzamos un UPDATE visual para pintar la casilla y los destinos
            } else {
                console.log(`[Alerta] Click ignorado: Es el turno de las ${juego.turnoActual}s.`);
            }
        }

    } else {
        
        // --- ESTADO 2: ACCIÓN ---
        // El usuario ya tiene una pieza en la mano y eligió una coordenada de destino.
        
        // 1. Deselección manual: Si hace click en la misma pieza que ya tenía, la "suelta"
        if (posicionOrigenSeleccionada.fila === filaObjetivo && posicionOrigenSeleccionada.columna === columnaObjetivo) {
            console.log("[Accion] Pieza deseleccionada (Click en la misma casilla).");
            posicionOrigenSeleccionada = null;
            destinosValidos = []; // Limpiamos la memoria de destinos visuales
            actualizarPantalla();
            return;
        }

        // 2. Cambio UX: Si hace click en otra pieza de su MISMO COLOR, cambia la selección
        // Operación READ para validar la propiedad de la nueva pieza tocada
        const piezaEnDestino = juego.obtenerPieza(posicionClickeada);
        if (piezaEnDestino && piezaEnDestino.color === juego.turnoActual) {
            console.log(`[Cambio UX] Cambiando seleccion a: ${piezaEnDestino.tipo} ${piezaEnDestino.color}`);
            posicionOrigenSeleccionada = posicionClickeada;
            destinosValidos = juego.obtenerMovimientosPosibles(posicionClickeada);
            actualizarPantalla();
            return; // Cortamos la ejecución para que no intente mover
        }
        
        // 3. Intento de movimiento (con escudo Try-Catch)
        console.log(`[Accion] Intentando mover al destino -> Fila: ${filaObjetivo}, Columna: ${columnaObjetivo}`);
        
        // Variables temporales para recordar qué pasó antes de limpiar la pantalla
        let movimientoRealizado = false;
        let datosCaptura: { destino: Posicion, comida: TipoPieza, comedora: TipoPieza, color: Color } | null = null;

        try {
            // LECTURA PREVIA: Vemos si hay alguien en la casilla
            const piezaDestino = juego.obtenerPieza(posicionClickeada);
            const piezaOrigen = juego.obtenerPieza(posicionOrigenSeleccionada);
            
            // Si hay un choque de piezas, guardamos temporalmente los datos para la animación
            if (piezaDestino && piezaOrigen) {
                datosCaptura = { 
                    destino: posicionClickeada, 
                    comida: piezaDestino.tipo, 
                    comedora: piezaOrigen.tipo, 
                    color: piezaOrigen.color 
                };
            }

            // Operación UPDATE: Intentamos ejecutar el movimiento lógico.
            // NUEVO: Guardamos el resultado booleano (true/false) en una variable.
            const movimientoExitoso = juego.moverPieza(posicionOrigenSeleccionada, posicionClickeada);
            
            if (movimientoExitoso) {
                // Si el motor dice que fue legal (true), confirmamos el movimiento
                movimientoRealizado = true; 
            } else {
                // Si el motor lo rechazó (ej. suicidio táctico), anulamos los datos 
                // de captura para evitar que el sistema reproduzca sonidos o animaciones
                // de un ataque fantasma.
                datosCaptura = null;
                console.log(`[Alerta] Movimiento rechazado por reglas de seguridad internas.`);
            }
            
        } catch (error) {
            console.log(`[Alerta] Movimiento rechazado por el motor logico.`);
        } finally {
            // 1. Limpiamos la memoria de selección
            posicionOrigenSeleccionada = null;
            destinosValidos = []; 
            
            // 2. Operación DELETE visual y Repintado total 
            // Esto limpia la pantalla y coloca la pieza en su nuevo lugar
            actualizarPantalla();

            // 3. Inyectamos los efectos visuales DESPUÉS de que la pantalla se actualizó
            if (movimientoRealizado) {
                if (datosCaptura) {
                    mostrarEfectoCaptura(
                        datosCaptura.destino, 
                        datosCaptura.comida, 
                        datosCaptura.comedora, 
                        datosCaptura.color
                    );
                }
                
                // Y finalmente evaluamos la coronación sobre el tablero ya redibujado
                evaluarYMostrarPromocion(posicionClickeada);

                // ==========================================
                // EVALUACIÓN DE ESTADO FINAL (Operación READ)
                // ==========================================
            
                // ==========================================
                // EVALUACIÓN DE ESTADO FINAL (Operación READ)
                // ==========================================
                juego.evaluarEstadoDelJuego(juego.turnoActual);

                const enJaque = juego.estaEnJaque(juego.turnoActual);
                const tieneMovimientos = juego.tieneMovimientosLegales(juego.turnoActual);

                if (!tieneMovimientos) {
                    // Condición de Fin de Partida alcanzada
                    if (enJaque) {
                        procesarFinDePartida(juego.turnoActual); // Jaque Mate
                    } else {
                        procesarFinDePartida('EMPATE'); // Rey Ahogado
                    }
                    return; // Cortamos el flujo abruptamente
                } else if (enJaque) {
                    mostrarEfectoJaque(juego.turnoActual);
                }

                // NUEVO: Solo delegamos el control a la IA si el juego NO ha terminado
                if (!juegoTerminado && juego.turnoActual === colorOponente) {
                    procesarTurnoIA();
                }
            }
        }
    }
}
/* ====================================================================
    CONTROLADOR (LÓGICA DE INTERFAZ)
====================================================================
*/

function inicializarTableroVisual(): void {
    /*
    Propósito:
     * Generar dinámicamente la estructura base (Vista) de 64 casillas en el documento HTML
       respetando la perspectiva geométrica del jugador local (rotación de 180 grados si es Negro).
    
    Precondición:
     * El elemento con id 'tablero-web' debe existir en el DOM.
     * La función 'procesarInteraccionUsuario' debe estar definida en el scope.
     * La variable 'colorJugadorLocal' debe estar previamente inicializada.
    
    Parámetros:
     * Ninguno.
    
    Tipo:
     * Void
    
    Observaciones:
     * Operación DELETE sobre el contenedor principal para purgar el estado visual previo.
     * Operación UPDATE sobre el DOM para inyectar los textos en las tarjetas de jugador.
     * Operación CREATE sobre el DOM para renderizar la grilla iterando los arreglos direccionales.
    */

    if (!contenedorTablero) {
        console.error("[Error Critico] No se encontro el contenedor del tablero en el HTML.");
        return;
    }

    // Operación DELETE visual: Limpiamos el contenedor principal
    contenedorTablero.innerHTML = '';

    // Operación UPDATE visual: Asignar textos de facción en las tarjetas
    if (etiquetaColorLocal) etiquetaColorLocal.textContent = `[ ${colorJugadorLocal} ]`;
    if (etiquetaColorRival) etiquetaColorRival.textContent = `[ ${colorOponente} ]`;

    // Lógica de Perspectiva Estricta:
    // Si somos Blancas, la fila inferior (más cercana al usuario) es la 0 y la columna A es la 0.
    // Si somos Negras, la fila inferior es la 7, y las columnas se leen de derecha a izquierda (7 a 0).
    const ordenFilas = colorJugadorLocal === Color.BLANCO ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const ordenColumnas = colorJugadorLocal === Color.BLANCO ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

    for (const f of ordenFilas) {
        for (const c of ordenColumnas) {
            
            // Operación CREATE: Instanciamos el nodo de la casilla
            const casillaVisual = document.createElement('div');
            casillaVisual.classList.add('casilla');

            // Lógica geométrica de paridad para alternar colores de fondo
            const esCasillaNegra = (f + c) % 2 === 0;
            casillaVisual.classList.add(esCasillaNegra ? 'negra' : 'blanca');

            // Almacenamiento de coordenadas lógicas inmutables en la Vista
            casillaVisual.dataset.fila = f.toString();
            casillaVisual.dataset.columna = c.toString();

            // Operación UPDATE: Inyección del escuchador de eventos al nodo
            casillaVisual.addEventListener('click', () => procesarInteraccionUsuario(f, c));

            // Inserción en el árbol DOM
            contenedorTablero.appendChild(casillaVisual);
        }
    }

    console.log(`[Sistema] Tablero visual generado con perspectiva de las piezas ${colorJugadorLocal}s.`);
}
/////////////////////////////////////////

function procesarTurnoIA(): void {
    /*
    Propósito:
     * Orquestar la ejecución autónoma del turno de la Inteligencia Artificial.
    */
    if (juego.turnoActual !== colorOponente) return;

    console.log("[Motor IA] Calculando matriz de decisiones...");
    
    // Retraso artificial para simular "pensamiento" y mejorar la UX
    setTimeout(() => {
        const jugadaOptima = MotorIA.ejecutarMovimientoGreedy(juego, colorOponente);

        if (jugadaOptima) {
            // Evaluamos si la IA captura algo para mostrar los efectos
            const piezaDestino = juego.obtenerPieza(jugadaOptima.destino);
            const piezaOrigen = juego.obtenerPieza(jugadaOptima.origen);

            // Operación UPDATE: La IA ejecuta su movimiento en el Modelo
            juego.moverPieza(jugadaOptima.origen, jugadaOptima.destino);

            if (piezaDestino && piezaOrigen) {
                mostrarEfectoCaptura(jugadaOptima.destino, piezaDestino.tipo, piezaOrigen.tipo, piezaOrigen.color);
            }

            // Auto-coronación simple para la IA (siempre elige Reina por defecto)
            const piezaMovida = juego.obtenerPieza(jugadaOptima.destino);
            if (piezaMovida && piezaMovida.tipo === TipoPieza.PEON) {
                const filaCoronacion = colorOponente === Color.BLANCO ? 7 : 0;
                if (jugadaOptima.destino.fila === filaCoronacion) {
                    juego.promoverPeon(jugadaOptima.destino, TipoPieza.REINA);
                }
            }

            // Operación DELETE y Repintado
            actualizarPantalla();
            juego.evaluarEstadoDelJuego(juego.turnoActual);

            // Verificación de fin de partida o jaque
            // Verificación de fin de partida o jaque
        if (juego.estaEnJaque(juego.turnoActual)) {
            // Operación READ: Si está en jaque y NO tiene movimientos legales, es Mate.
            if (!juego.tieneMovimientosLegales(juego.turnoActual)) {
                procesarFinDePartida(juego.turnoActual);
            } else {
                mostrarEfectoJaque(juego.turnoActual);
            }
        }

        } else {
            console.log("[Motor IA] Falla crítica: No se encontraron movimientos legales.");
        }
    }, 800); // 800ms de retraso
}

//////////////////////////////////////
function actualizarPantalla(): void {
    /*
    Proposito:
     * Sincronizar el estado de la Vista con el estado actual del Modelo (Tablero lógico).
    
    Precondicion:
     * La función 'inicializarTableroVisual' debió haberse ejecutado previamente.
     * Las imágenes deben existir en las rutas declaradas en DICCIONARIO_PIEZAS.
    
    Parametros:
     * Ninguno.
    
    Tipo:
     * Void
    
    Observaciones:
     * Operación DELETE masiva: Limpia todas las clases de estado visual previo.
     * Operación READ sobre el Modelo para repintar la realidad actual. Se recorre la matriz,
       y si se encuentra una pieza lógica, se realiza una operación CREATE inyectando
       un elemento <img> en el nodo DOM correspondiente.
    */

    // Operación UPDATE - Sincronizamos el texto del panel inferior
    if (elementoTextoTurno) {
        elementoTextoTurno.textContent = juego.turnoActual;
    }

    for (let f = 0; f < 8; f++) {
        for (let c = 0; c < 8; c++) {
            
            const casillaVisual = document.querySelector(`[data-fila="${f}"][data-columna="${c}"]`) as HTMLElement;
            if (!casillaVisual) continue;

            // Operación READ
            const piezaLogica = juego.obtenerPieza({ fila: f, columna: c });

            // ==========================================
            // LIMPIEZA TOTAL (Operación DELETE visual)
            // Previene el bug de los rastros residuales
            // ==========================================
            casillaVisual.innerHTML = '';
            casillaVisual.classList.remove('seleccionada');
            casillaVisual.classList.remove('movimiento-valido'); 
            // NUEVO: Limpiamos también el láser rojo para que no quede marcado en el tablero
            casillaVisual.classList.remove('captura-valida'); 

            // ==========================================
            // REPINTADO DE ESTADOS (Operación READ)
            // ==========================================
            
            // Si esta coordenada es exactamente la que el usuario tiene en la mano, la pintamos
            if (posicionOrigenSeleccionada && 
                posicionOrigenSeleccionada.fila === f && 
                posicionOrigenSeleccionada.columna === c) {
                casillaVisual.classList.add('seleccionada');
            }

            // Operación READ - Si la coordenada actual existe en nuestra lista de destinos, pintamos
            const esDestinoValido = destinosValidos.some(destino => destino.fila === f && destino.columna === c);
            if (esDestinoValido) {
                // NUEVA LÓGICA: ¿Hay un enemigo en este destino válido?
                if (piezaLogica !== null) {
                    casillaVisual.classList.add('captura-valida'); // Neón Rojo
                } else {
                    casillaVisual.classList.add('movimiento-valido'); // Neón Verde
                }
            }

            // ==========================================
            // INYECCIÓN DE PIEZAS (Operación CREATE)
            // ==========================================
            if (piezaLogica) {
                const imagenPieza = document.createElement('img');
                imagenPieza.src = DICCIONARIO_PIEZAS[piezaLogica.color][piezaLogica.tipo];
                imagenPieza.classList.add('pieza-img');
                imagenPieza.alt = `${piezaLogica.tipo} ${piezaLogica.color}`;
                
                casillaVisual.appendChild(imagenPieza);
            }
        }
    }

}




function mostrarEfectoJaque(colorEnJaque: Color): void {
    /*
    Propósito:
     * Buscar la coordenada visual del Rey amenazado e inyectar el elemento DOM 
       con la animación de alerta de Jaque.
    
    Observaciones:
     * Operación READ sobre el modelo para hallar al Rey, seguida de una 
       operación CREATE temporal en la Vista.
    */
    for (let f = 0; f < 8; f++) {
        for (let c = 0; c < 8; c++) {
            const pieza = juego.obtenerPieza({ fila: f, columna: c });
            
            // Si encontramos al Rey en peligro...
            if (pieza && pieza.tipo === TipoPieza.REY && pieza.color === colorEnJaque) {
                const casillaVisual = document.querySelector(`[data-fila="${f}"][data-columna="${c}"]`) as HTMLElement;
                
                if (casillaVisual) {
                    const textoFlotante = document.createElement('div');
                    textoFlotante.classList.add('efecto-jaque');
                    textoFlotante.innerHTML = `¡JAQUE!`;
                    
                    casillaVisual.appendChild(textoFlotante);

                    // Operación DELETE programada tras finalizar la animación
                    setTimeout(() => {
                        textoFlotante.remove();
                    }, 2000);
                }
                return; // Terminamos la búsqueda anticipadamente
            }
        }
    }
 }

////////////////////////////////////////

function procesarFinDePartida(resultado: Color | 'EMPATE'): void {
    /*
    Propósito:
     * Ejecutar la secuencia visual de fin de juego (Fatality aleatorio al Rey o Empate)
       y desplegar el menú de estadísticas.
    
    Observaciones:
     * Operación UPDATE global: Congela la máquina de estados estableciendo juegoTerminado en true.
     * Operación READ sobre el Modelo para localizar al Rey en caso de victoria.
     * Operación UPDATE visual para alterar el DOM y desplegar el modal correspondiente.
    */
    juegoTerminado = true; // Operación UPDATE: Congela todo el sistema

    // ==========================================
    // NUEVO: INYECCIÓN VISUAL INMEDIATA (GAME OVER / YOU WIN + INSERT COIN)
    // ==========================================
    const tableroVisual = document.getElementById('tablero-web');
    if (tableroVisual) {
        tableroVisual.style.position = 'relative'; 
        
        // Creamos la pantalla oscura que cubrirá el tablero
        const capaFinal = document.createElement('div');
        capaFinal.classList.add('capa-game-over');

        // Título interactivo (Depende de quién ganó)
        const cartelFinal = document.createElement('h2');
        cartelFinal.classList.add('texto-fin-partida');

        // Operación READ: Lógica de asignación de victoria/derrota
        if (resultado === 'EMPATE') {
            cartelFinal.textContent = '¡EMPATE!';
            cartelFinal.classList.add('texto-empate');
        } else {
            // Si 'resultado' contiene un Color, ese Color es el PERDEDOR.
            if (resultado === colorJugadorLocal) {
                cartelFinal.textContent = 'GAME OVER';
                cartelFinal.classList.add('texto-derrota');
            } else {
                cartelFinal.textContent = 'YOU WIN';
                cartelFinal.classList.add('texto-victoria');
            }
        }
        
        // Operación CREATE: El botón interactivo (Siempre verde)
        const btnReinicio = document.createElement('button');
        btnReinicio.classList.add('btn-insert-coin');
        btnReinicio.textContent = '> INSERT COIN <';
        
        // Operación UPDATE: Simulamos el F5 por código
        btnReinicio.addEventListener('click', () => {
            window.location.reload();
        });

        capaFinal.appendChild(cartelFinal);
        capaFinal.appendChild(btnReinicio);
        tableroVisual.appendChild(capaFinal);
    }

    // Localizamos los elementos del DOM una sola vez para el Modal posterior
    const modal = document.getElementById('modal-fin-partida');
    const tituloModal = modal?.querySelector('.texto-peligro');
    const spanGanador = document.getElementById('nombre-ganador');
    const spanPuntaje = document.getElementById('puntaje-final');

    // ==========================================
    // CASO A: EMPATE POR REY AHOGADO
    // ==========================================
    if (resultado === 'EMPATE') {
        if (tituloModal) tituloModal.textContent = "REY AHOGADO [EMPATE]";
        if (spanGanador) spanGanador.textContent = "Ninguno (Tablas)";
        if (spanPuntaje) spanPuntaje.textContent = `${puntajeBlancas} - ${puntajeNegras}`;
        
        setTimeout(() => {
            if (modal) modal.classList.remove('oculto');
        }, 1000);
        
        return; // Cortamos la ejecución aquí, no hay destrucción de Rey
    }

    // ==========================================
    // CASO B: VICTORIA POR JAQUE MATE
    // ==========================================
    const colorPerdedor = resultado;
    const audioExplosion = document.getElementById('audio-explosion') as HTMLAudioElement;
    let reyEncontrado = false;

    // 1. Operación READ & UPDATE visual (Destrucción del Rey)
    for (let f = 0; f < 8; f++) {
        for (let c = 0; c < 8; c++) {
            const pieza = juego.obtenerPieza({ fila: f, columna: c });
            
            if (pieza && pieza.tipo === TipoPieza.REY && pieza.color === colorPerdedor) {
                const casillaVisual = document.querySelector(`[data-fila="${f}"][data-columna="${c}"]`) as HTMLElement;
                const imgRey = casillaVisual.querySelector('.pieza-img') as HTMLElement;
                
                if (casillaVisual && imgRey) {
                    const esExplosion = Math.random() < 0.5; // 50% de probabilidad
                    
                    if (esExplosion) {
                        // Variante A: Explosión
                        imgRey.style.display = 'none'; // Ocultamos al Rey
                        const divExplosion = document.createElement('div');
                        divExplosion.classList.add('efecto-explosion');
                        casillaVisual.appendChild(divExplosion);
                        
                        if (audioExplosion) {
                            audioExplosion.currentTime = 0;
                            audioExplosion.play();
                        }
                    } else {
                        // Variante B: Derrumbe / Partido
                        imgRey.classList.add('rey-roto');
                    }
                }
                reyEncontrado = true;
                break;
            }
        }
        if (reyEncontrado) break;
    }

    // 2. Operación READ: Recopilar datos para el Modal
    const colorGanador = colorPerdedor === Color.BLANCO ? Color.NEGRO : Color.BLANCO;
    const puntajeGanador = colorGanador === Color.BLANCO ? puntajeBlancas : puntajeNegras;
    const nombreGanador = colorGanador === colorJugadorLocal ? "Jugador Local" : "Rival IA";

    // 3. Operación UPDATE visual (Mostrar Modal tras la animación)
    setTimeout(() => {
        if (tituloModal) tituloModal.textContent = "JAQUE MATE [X_X]"; // Aseguramos el texto por defecto
        if (spanGanador) spanGanador.textContent = nombreGanador;
        if (spanPuntaje) spanPuntaje.textContent = puntajeGanador.toString();
        
        if (modal) modal.classList.remove('oculto');
    }, 2000);
}

/* ====================================================================
    EJECUCIÓN DEL PROGRAMA
====================================================================
*/
// 1. Inicializar la estructura base en el DOM (Crear los 64 divs)
inicializarTableroVisual();

// 2. Operación CREATE lógica: Acomodar las 32 piezas reglamentarias
// Reemplazamos el rey de prueba por la inicialización oficial
juego.inicializarPartidaClasica();

// 3. Renderizar el estado actual (Sincronizar Vista con Modelo)
actualizarPantalla();
// --- CONTROL DE AUDIO (Operación UPDATE local) ---
if (btnMusica && audioFondo) {
    btnMusica.addEventListener('click', () => {
        if (audioFondo.paused) {
            audioFondo.play();
            btnMusica.textContent = "MUSICA: ON";
            btnMusica.style.borderColor = "#39ff14";
            btnMusica.style.color = "#39ff14";
        } else {
            audioFondo.pause();
            btnMusica.textContent = "MUSICA: OFF";
            btnMusica.style.borderColor = "#ff0055";
            btnMusica.style.color = "#ff0055";
        }
    });
}
// NUEVO: Si la aleatoriedad asignó las Blancas a la IA, debe iniciar la partida
if (colorOponente === Color.BLANCO) {
    procesarTurnoIA();
}

