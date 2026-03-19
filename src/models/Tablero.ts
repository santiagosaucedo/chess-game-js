// src/models/Tablero.ts
import { Pieza } from './Pieza.js';
import { Reina } from './Reina.js';
import { Torre } from './Torre.js';
import { Alfil } from './Alfil.js';
import { Caballo } from './Caballo.js';
import { Rey } from './Rey.js';
import { Peon } from './Peon.js';  
import { Posicion, TipoPieza, Color, Movimiento } from './types.js';


export class Tablero {
    /**
     * INV. REP.:
     * * _casillas es una matriz cuadrada de exactamente 8x8.
     * * Cada elemento puede ser una instancia de una Pieza o null (casilla vacía).
     */
    private _casillas: (Pieza | null)[][];
    
    // NUEVA PROPIEDAD: Control de turnos
    private _turnoActual: Color;

    private _ultimoMovimiento: Movimiento | null;

    constructor() {
        // Inicializamos el tablero al crear la instancia
        this._casillas = this.inicializarTableroVacio();
        this._turnoActual = Color.BLANCO;
        this._ultimoMovimiento = null;
    }

    inicializarPartidaClasica(): void {
        /*
        Propósito:
         * Posicionar las 32 piezas del ajedrez en sus coordenadas iniciales reglamentarias
           y reiniciar el estado temporal del juego (turnos y memoria).
        
        Precondición:
         * Ninguna. Puede llamarse al crear un nuevo juego o para reiniciar una partida en curso.
        
        Parámetros:
         * Ninguno.
        
        Tipo:
         * Void
        
        Observaciones:
         * Operación UPDATE masiva sobre el estado del Tablero.
         * Fila 0 y 1 reservadas para Blancas. Fila 6 y 7 reservadas para Negras.
         * Se reutiliza el método 'colocarPieza' para mantener encapsulada la lógica de inyección.
        */

        // 1. Reset (Operación DELETE lógica / Limpieza del estado)
        this._casillas = this.inicializarTableroVacio();
        this._turnoActual = Color.BLANCO;
        this._ultimoMovimiento = null;

        // 2. Operación CREATE masiva: Inyección de Peones mediante iteración
        for (let c = 0; c < 8; c++) {
            this.colocarPieza(new Peon(Color.BLANCO, { fila: 1, columna: c }));
            this.colocarPieza(new Peon(Color.NEGRO, { fila: 6, columna: c }));
        }

        // 3. Operación CREATE masiva: Piezas Mayores y Menores
        // Se utiliza una estructura de configuración para evitar repetir código entre ambos colores
        const configuracionesDeColor = [
            { color: Color.BLANCO, fila: 0 },
            { color: Color.NEGRO, fila: 7 }
        ];

        for (const config of configuracionesDeColor) {
            const { color, fila } = config;
            
            this.colocarPieza(new Torre(color, { fila: fila, columna: 0 }));
            this.colocarPieza(new Caballo(color, { fila: fila, columna: 1 }));
            this.colocarPieza(new Alfil(color, { fila: fila, columna: 2 }));
            
            // La Reina matemática siempre va en la columna 3 (casilla 'd')
            this.colocarPieza(new Reina(color, { fila: fila, columna: 3 }));
            
            // El Rey matemático siempre va en la columna 4 (casilla 'e')
            this.colocarPieza(new Rey(color, { fila: fila, columna: 4 }));
            
            this.colocarPieza(new Alfil(color, { fila: fila, columna: 5 }));
            this.colocarPieza(new Caballo(color, { fila: fila, columna: 6 }));
            this.colocarPieza(new Torre(color, { fila: fila, columna: 7 }));
        }
        
        console.log("Partida clásica inicializada lógicamente.");
    }

    /**
     * PROPÓSITO: Crea una matriz de 8x8 llena de valores 'null'.
     * TIPO DE RETORNO: Matriz bidimensional de Pieza o null.
     */
    private inicializarTableroVacio(): (Pieza | null)[][] {
        const tablero: (Pieza | null)[][] = [];
        for (let i = 0; i < 8; i++) {
            // Creamos 8 columnas por cada fila, llenas de null
            tablero[i] = new Array(8).fill(null);
        }
        return tablero;
    }

    // Getter para poder consultar de quién es el turno desde afuera
    get turnoActual(): Color {
        return this._turnoActual;
    }

    /**
     * PROPÓSITO: Ubicar una pieza en el tablero durante el setup inicial.
     * PRECONDICIÓN: La posición interna de la pieza debe ser válida (0-7).
     * PARÁMETROS:
     * * pieza: Pieza
     */
    colocarPieza(pieza: Pieza): void {
        const { fila, columna } = pieza.posicion;
        this._casillas[fila]![columna] = pieza;
    }

    /**
     * PROPÓSITO: Obtener la pieza ubicada en una coordenada específica.
     * PRECONDICIÓN: La posición debe estar dentro de los límites (0-7).
     * TIPO DE RETORNO: Pieza (si hay una) o null (si está vacía).
     */
    obtenerPieza(posicion: Posicion): Pieza | null {
        return this._casillas[posicion.fila]?.[posicion.columna] ?? null;
    }
    

    moverPieza(origen: Posicion, destino: Posicion): boolean {
        /*
        Propósito:
         * Evaluar y ejecutar la transición de una pieza desde su origen hacia un destino,
           procesando reglas de captura, enroque, movimiento al paso y colisiones.
        
        Precondición:
         * Las coordenadas de origen y destino deben estar dentro de los límites de la matriz (0-7).
        
        Parámetros:
         * origen : Posicion
         * destino : Posicion
        
        Tipo:
         * Boolean
        
        Observaciones:
         * Operación UPDATE principal del motor lógico.
         * Aplica interceptores estrictos de seguridad para blindar al Rey contra 
           capturas directas y aislar validaciones de Enroque / Al Paso.
        */
        const pieza = this.obtenerPieza(origen);

        if (!pieza) {
            console.log("Error: No hay pieza en origen.");
            return false;
        }

        if (pieza.color !== this._turnoActual) {
            console.log(`Error: Movimiento ilegal. Es el turno de las piezas ${this._turnoActual}s.`);
            return false;
        }

        const piezaEnDestino = this.obtenerPieza(destino);
        
        // REGLA MAESTRA: Prevención absoluta de destrucción de la clase Rey
        if (piezaEnDestino && piezaEnDestino.tipo === TipoPieza.REY) {
            console.log("Error critico: Intento de captura de Rey bloqueado por el motor.");
            return false;
        }

        if (piezaEnDestino && piezaEnDestino.color === pieza.color) {
            console.log("Error: Casilla ocupada por un aliado.");
            return false;
        }

        let esCaptura = piezaEnDestino !== null;
        let esAlPaso = false;
        let esEnroque = false;

        // CAPA DE INTERCEPCIÓN LOGICA
        if (!pieza.esMovimientoValido(destino, esCaptura)) {
            if (this.esCapturaAlPasoValida(origen, destino, pieza)) {
                esAlPaso = true;
                esCaptura = true;
            } 
            else if (pieza.tipo === TipoPieza.REY && Math.abs(destino.columna - origen.columna) === 2 && !pieza.seHaMovido) {
                esEnroque = true;
            } 
            else {
                console.log(`Error: Movimiento ilegal para la clase ${pieza.tipo}.`);
                return false;
            }
        }

        // CAPA DE COLISIONES
        if (pieza.tipo !== TipoPieza.CABALLO && !esEnroque) {
            if (!this.caminoEstaLibre(origen, destino)) {
                console.log("Error: El vector de movimiento se encuentra bloqueado.");
                return false;
            }
        }

        // CAPA ANTI-SUICIDIO TÁCTICO
        if (this.dejaAlReyEnJaque(origen, destino, pieza.color)) {
            console.log("Error: Movimiento Ilegal. Exposicion directa del Rey a un Jaque.");
            return false;
        }

        // DELEGACIÓN DE ENROQUE
        if (esEnroque) {
            const lado = destino.columna > origen.columna ? 'CORTO' : 'LARGO';
            const enroqueValido = this.enrocar(pieza.color, lado);
            
            if (!enroqueValido) return false;
            
            this._ultimoMovimiento = { piezaMovida: pieza.tipo, color: pieza.color, origen, destino };
            this.avanzarTurno();
            return true;
        }

        // EJECUCIÓN DEL FLUJO NORMAL (Operación UPDATE Lógica)
        pieza.mover(destino);
        this._casillas[destino.fila]![destino.columna] = pieza;
        this._casillas[origen.fila]![origen.columna] = null;

        if (esAlPaso) {
            const filaEnemigo = origen.fila; 
            const colEnemigo = destino.columna;
            this._casillas[filaEnemigo]![colEnemigo] = null;
            console.log(`Peon al Paso: La clase ${pieza.color} efectuo la captura.`);
        } else if (esCaptura) { 
            console.log(`Captura valida: ${pieza.tipo} elimina a ${piezaEnDestino!.tipo}.`);
        } else {
            console.log(`Posicion actualizada: ${pieza.tipo}.`);
        }

        // REGISTRO DE MEMORIA A CORTO PLAZO
        this._ultimoMovimiento = {
            piezaMovida: pieza.tipo,
            color: pieza.color,
            origen: origen,
            destino: destino
        };

        this.avanzarTurno();
        return true;
    }
    
    mostrarTablero(): void {


            /**
         * PROPÓSITO: Imprimir una representación visual rudimentaria del tablero en consola.
         * OBSERVACIONES: Muy útil para debuggear y ver que la matriz funcione.
         */
        
        console.log("\n  0 1 2 3 4 5 6 7");
        // Iteramos de arriba hacia abajo (fila 7 a la 0) para que se vea como un tablero real
        for (let f = 7; f >= 0; f--) { 
            let filaStr = `${f} `;
            for (let c = 0; c < 8; c++) {
                const pieza = this._casillas[f]?.[c];
                if (pieza) {
                    // Si hay pieza, imprimimos la primera letra de su tipo (Ej: 'P' para Peón)
                    filaStr += pieza.tipo.charAt(0) + " "; 
                } else {
                    // Si es null, imprimimos un punto
                    filaStr += ". ";
                }
            }
            console.log(filaStr);
        }
        console.log("");
    }
    

    private caminoEstaLibre(origen: Posicion, destino: Posicion): boolean {
        /*
        Propósito:
         * Verifica que no haya ninguna pieza bloqueando el trayecto en línea recta o diagonal 
           entre la posición de origen y destino.
        
        Precondición:
         * origen y destino deben formar una línea recta vertical, horizontal o diagonal perfecta.
        
        Parámetros:
         * origen : Posicion
         * destino : Posicion
        
        Tipo:
         * Boolean
        
        Observaciones:
         * Calcula la dirección del paso (-1, 0, o 1) para filas y columnas, y recorre 
           el camino iterativamente comprobando si hay piezas en la matriz.
         * Implementa un límite estricto de seguridad matemática (pasosMaximos) 
           para prevenir bucles infinitos en el hilo principal del navegador.
        */
        const pieza = this.obtenerPieza(origen);
        if (!pieza) return false;

        // El Caballo ignora las colisiones estructurales por regla de la clase
        if (pieza.tipo === TipoPieza.CABALLO) return true;

        const difFila = destino.fila - origen.fila;
        const difColumna = destino.columna - origen.columna;

        // Normalizamos los valores para calcular el vector direccional
        const pasoFila = difFila === 0 ? 0 : difFila / Math.abs(difFila);
        const pasoCol = difColumna === 0 ? 0 : difColumna / Math.abs(difColumna);

        // Escudo Arquitectónico: Límite estricto de iteraciones basado en distancia absoluta
        const pasosMaximos = Math.max(Math.abs(difFila), Math.abs(difColumna));
        
        let filaActual = origen.fila + pasoFila;
        let colActual = origen.columna + pasoCol;
        let pasosDados = 1;

        // Iteración segura controlada por el límite de pasos
        while (pasosDados < pasosMaximos) {
            if (this._casillas[filaActual]?.[colActual] !== null) {
                return false; // Hay una pieza bloqueando el vector
            }
            filaActual += pasoFila;
            colActual += pasoCol;
            pasosDados++;
        }

        return true; 
    }


    
    coronarPeon(posicion: Posicion, tipoPromocion: TipoPieza): boolean {
        /*
        Propósito:
         * Transforma un Peón que ha llegado a la última fila de su recorrido en una 
           nueva pieza (Reina, Torre, Alfil o Caballo), manteniendo el color original.
        
        Precondición:
         * Debe existir un objeto Peón en la 'posicion' dada.
         * La 'posicion' debe corresponder a la última fila (7 para Blanco, 0 para Negro).
         * El 'tipoPromocion' no puede ser ni PEON ni REY.
        
        Parámetros:
         * posicion : Posicion
         * tipoPromocion : TipoPieza
        
        Tipo:
         * Boolean (true si la coronación se ejecutó con éxito, false en caso contrario)
        
        Observaciones:
         * Instancia un nuevo objeto de la pieza seleccionada y pisa el espacio en la 
           matriz _casillas, permitiendo que el Recolector de Basura (Garbage Collector) 
           elimine al peón anterior de la memoria.
        */

        const piezaActual = this.obtenerPieza(posicion);

        // Validamos que haya una pieza y que efectivamente sea un Peón
        if (!piezaActual || piezaActual.tipo !== TipoPieza.PEON) {
            console.log("Error: No hay un peón en esa posición para coronar.");
            return false;
        }

        // Validamos que haya llegado a la meta según su color
        const filaDeCoronacion = piezaActual.color === Color.BLANCO ? 7 : 0;
        if (posicion.fila !== filaDeCoronacion) {
            console.log("Error: El peón aún no ha llegado a la última fila.");
            return false;
        }

        let nuevaPieza: Pieza;

        // Evaluamos en qué quiere convertirse
        switch (tipoPromocion) {
            case TipoPieza.REINA:
                nuevaPieza = new Reina(piezaActual.color, posicion);
                break;
            case TipoPieza.TORRE:
                nuevaPieza = new Torre(piezaActual.color, posicion);
                break;
            case TipoPieza.ALFIL:
                nuevaPieza = new Alfil(piezaActual.color, posicion);
                break;
            case TipoPieza.CABALLO:
                nuevaPieza = new Caballo(piezaActual.color, posicion);
                break;
            default:
                console.log("Error: No podés coronar un Peón o un Rey.");
                return false;
        }

        // Efectuamos el reemplazo en la matriz
        this._casillas[posicion.fila]![posicion.columna] = nuevaPieza;
        console.log(`¡Coronación oficial exitosa! El Peón ${piezaActual.color} ahora es una ${nuevaPieza.tipo}.`);
        
        return true;
    }
    
    enrocar(color: Color, lado: 'CORTO' | 'LARGO'): boolean {
        /*
        Propósito:
         * Ejecuta el movimiento especial de Enroque moviendo simultáneamente al Rey 
           y a la Torre correspondiente, si se cumplen todas las condiciones legales.
        
        Precondición:
         * Las coordenadas de origen deben contener instancias válidas de Rey y Torre.
        
        Parámetros:
         * color : Color (Determina en qué fila buscar las piezas: 0 para Blanco, 7 para Negro)
         * lado : String ('CORTO' o 'LARGO', determina qué torre se utiliza)
        
        Tipo:
         * Boolean (true si el enroque se ejecutó con éxito, false si se rechazó)
        
        Observaciones:
         * Valida que ni el Rey ni la Torre se hayan movido antes en toda la partida.
         * Revisa que el camino entre ambas piezas esté completamente vacío.
         * (Nota: Por ahora no valida si el Rey está en Jaque, se implementará luego).
        */

        const fila = color === Color.BLANCO ? 0 : 7;
        
        // El Rey siempre arranca en la columna 4
        const posRey = { fila: fila, columna: 4 };
        const rey = this.obtenerPieza(posRey);

        // La Torre depende del lado (0 para el Largo, 7 para el Corto)
        const columnaTorre = lado === 'CORTO' ? 7 : 0;
        const posTorre = { fila: fila, columna: columnaTorre };
        const torre = this.obtenerPieza(posTorre);

        // 1. Validar que las piezas existan y sean las correctas
        if (!rey || rey.tipo !== TipoPieza.REY || !torre || torre.tipo !== TipoPieza.TORRE) {
            console.log("Error: Faltan las piezas necesarias para enrocar en sus posiciones originales.");
            return false;
        }

        // 2. Validar el estado histórico (Memoria de las piezas)
        if (rey.seHaMovido || torre.seHaMovido) {
            console.log("Error: No se puede enrocar porque el Rey o la Torre ya se movieron previamente.");
            return false;
        }

        // 3. Validar que el camino esté libre
        // Si es corto, revisamos columnas 5 y 6. Si es largo, revisamos 1, 2 y 3.
        const columnasAVisitar = lado === 'CORTO' ? [5, 6] : [1, 2, 3];
        
        for (const col of columnasAVisitar) {
            if (this._casillas[fila]?.[col] !== null) {
                console.log(`Error: Hay piezas bloqueando el enroque en la columna ${col}.`);
                return false;
            }
        }

        // --- ENROQUE VÁLIDO: PROCEDEMOS A MOVER AMBAS PIEZAS ---

        // Calculamos los destinos
        const destinoRey = { fila: fila, columna: lado === 'CORTO' ? 6 : 2 };
        const destinoTorre = { fila: fila, columna: lado === 'CORTO' ? 5 : 3 };

        // Movemos internamente las piezas
        rey.mover(destinoRey);
        torre.mover(destinoTorre);

        // Actualizamos la matriz del tablero
        this._casillas[destinoRey.fila]![destinoRey.columna] = rey;
        this._casillas[destinoTorre.fila]![destinoTorre.columna] = torre;
        
        // Vaciamos las posiciones originales
        this._casillas[posRey.fila]![posRey.columna] = null;
        this._casillas[posTorre.fila]![posTorre.columna] = null;

        console.log(`¡Enroque ${lado} ejecutado con éxito para las piezas ${color}s!`);
        return true;
    }



    private encontrarRey(color: Color): Posicion | null {
        /*
        Propósito:
         * Escanea la matriz completa del tablero para encontrar la coordenada exacta 
           del Rey del color especificado.
        
        Precondición:
         * Debe existir un Rey del color buscado en el tablero.
        
        Parámetros:
         * color : Color
        
        Tipo:
         * Posicion | null
        */
        for (let f = 0; f < 8; f++) {
            for (let c = 0; c < 8; c++) {
                const pieza = this._casillas[f]?.[c];
                if (pieza && pieza.tipo === TipoPieza.REY && pieza.color === color) {
                    return { fila: f, columna: c };
                }
            }
        }
        return null;
    }

    estaEnJaque(colorRey: Color): boolean {
        /*
        Propósito:
         * Determina si el Rey del color especificado está bajo amenaza directa de captura 
           por al menos una pieza enemiga.
        
        Precondición:
         * Ninguna.
        
        Parámetros:
         * colorRey : Color
        
        Tipo:
         * Boolean
        
        Observaciones:
         * Recorre todo el tablero buscando piezas del color opuesto. Si encuentra una, 
           simula un ataque hacia la posición actual del Rey. Valida reglas de pieza y colisiones.
        */
        const posRey = this.encontrarRey(colorRey);

        if (!posRey) {
            console.log(`Error crítico: ¡No se encontró el Rey ${colorRey} en el tablero!`);
            return false;
        }

        // Recorremos todo el tablero buscando enemigos
        for (let f = 0; f < 8; f++) {
            for (let c = 0; c < 8; c++) {
                const piezaEnemiga = this._casillas[f]?.[c];

                // Si hay una pieza y es del color contrario...
                if (piezaEnemiga && piezaEnemiga.color !== colorRey) {
                    
                    // 1. ¿Su movimiento básico le permite atacar la casilla del Rey?
                    if (piezaEnemiga.esMovimientoValido(posRey, true)) {
                        
                        // 2. Si es un Caballo, el jaque es directo (salta). 
                        // Si es otra pieza, validamos que no haya escudos en el medio.
                        if (piezaEnemiga.tipo === TipoPieza.CABALLO) {
                            return true; // ¡Jaque!
                        } else {
                            if (this.caminoEstaLibre(piezaEnemiga.posicion, posRey)) {
                                return true; // ¡Jaque!
                            }
                        }
                    }
                }
            }
        }

        return false; // Ningún enemigo amenaza al Rey
    }
    
    private dejaAlReyEnJaque(origen: Posicion, destino: Posicion, color: Color): boolean {
        /*
        Propósito:
         * Simula un movimiento en la matriz para verificar si dicha jugada deja 
           o mantiene al propio Rey en estado de Jaque.
        
        Precondición:
         * origen y destino deben ser válidos. Debe existir una pieza de 'color' en 'origen'.
        
        Parámetros:
         * origen : Posicion
         * destino : Posicion
         * color : Color
        
        Tipo:
         * Boolean (true si el movimiento es suicida, false si es seguro)
        
        Observaciones:
         * Guarda el estado actual de las casillas afectadas, realiza el movimiento lógico 
           mediante 'cambiarPosicionInterna', evalúa 'estaEnJaque', y luego revierte 
           el tablero exactamente a su estado original.
        */

        const piezaAMover = this.obtenerPieza(origen);
        const piezaEnDestino = this.obtenerPieza(destino); // Podría ser un enemigo o null

        if (!piezaAMover || origen.fila === undefined || origen.columna === undefined || destino.fila === undefined || destino.columna === undefined) return false;

        // --- 1. VIAJE AL FUTURO (Simulamos el movimiento) ---
        this._casillas[destino.fila]![destino.columna] = piezaAMover;
        this._casillas[origen.fila]![origen.columna] = null;
        if (piezaAMover) {
            piezaAMover.cambiarPosicionInterna(destino);
        }

        // --- 2. OBSERVAMOS EL RESULTADO ---
        // ¿Nuestro propio rey está amenazado en este futuro hipotético?
        const movimientoEsSuicida = this.estaEnJaque(color);

        // --- 3. VIAJE AL PASADO (Revertimos absolutamente todo) ---
        this._casillas[origen.fila]![origen.columna] = piezaAMover;
        this._casillas[destino.fila]![destino.columna] = piezaEnDestino;
        if (piezaAMover) {
            piezaAMover.cambiarPosicionInterna(origen);
        }

        return movimientoEsSuicida;
    }
    
    private esJugadaLegalSilenciosa(origen: Posicion, destino: Posicion, color: Color): boolean {
        /*
        Propósito:
         * Evalúa matemáticamente si un movimiento es legal sin ejecutarlo ni imprimir errores.
        
        Precondición:
         * origen y destino deben ser coordenadas válidas.
        
        Parámetros:
         * origen : Posicion
         * destino : Posicion
         * color : Color
        
        Tipo:
         * Boolean
        
        Observaciones:
         * Reutiliza la lógica de colisiones, contratos de piezas y la regla anti-suicidio 
           exclusivamente para la predicción de Jaque Mate.
        */
        const pieza = this.obtenerPieza(origen);
        
        // Si no hay pieza o es del enemigo, no nos sirve
        if (!pieza || pieza.color !== color) return false;

        const piezaEnDestino = this.obtenerPieza(destino);
        
        // Fuego amigo
        if (piezaEnDestino && piezaEnDestino.color === color) return false;

        const esCaptura = piezaEnDestino !== null;
        
        // Reglas de la pieza
        if (!pieza.esMovimientoValido(destino, esCaptura)) return false;

        // Colisiones
        if (pieza.tipo !== TipoPieza.CABALLO) {
            if (!this.caminoEstaLibre(origen, destino)) return false;
        }

        // Regla anti-suicidio
        return !this.dejaAlReyEnJaque(origen, destino, color);
    }

    tieneMovimientosLegales(color: Color): boolean {
        /*
        Propósito:
         * Verifica si el jugador del color especificado tiene al menos una jugada 
           legal disponible en el tablero.
        
        Precondición:
         * Ninguna.
        
        Parámetros:
         * color : Color
        
        Tipo:
         * Boolean
        
        Observaciones:
         * Utiliza fuerza bruta iterando sobre las 64 casillas como origen y las 64 
           como destino. Retorna true de forma temprana (Short-Circuit) apenas 
           encuentra la primera jugada válida por cuestiones de rendimiento.
        */
        
        for (let fOrigen = 0; fOrigen < 8; fOrigen++) {
            for (let cOrigen = 0; cOrigen < 8; cOrigen++) {
                
                const pieza = this._casillas[fOrigen]?.[cOrigen];
                
                if (pieza && pieza.color === color) {
                    // Encontramos una pieza nuestra. ¡A probar todos los destinos!
                    for (let fDestino = 0; fDestino < 8; fDestino++) {
                        for (let cDestino = 0; cDestino < 8; cDestino++) {
                            
                            const origen = { fila: fOrigen, columna: cOrigen };
                            const destino = { fila: fDestino, columna: cDestino };
                            
                            // Si UNA sola jugada es legal, el jugador está a salvo
                            if (this.esJugadaLegalSilenciosa(origen, destino, color)) {
                                return true; 
                            }
                        }
                    }
                }
            }
        }
        
        // Si termina de revisar miles de combinaciones y no salió del bucle...
        return false; 
    }

    evaluarEstadoDelJuego(colorTurnoActual: Color): void {
        /*
        Propósito:
         * Dictamina si el juego debe terminar debido a la situación del jugador 
           que debe mover en este turno.
        
        Precondición:
         * Las piezas deben estar posicionadas correctamente.
        
        Parámetros:
         * colorTurnoActual : Color
        
        Tipo:
         * Void (Por ahora imprime en consola, luego devolverá un Estado)
        */
        
        const enJaque = this.estaEnJaque(colorTurnoActual);
        const tieneMovimientos = this.tieneMovimientosLegales(colorTurnoActual);

        if (!tieneMovimientos) {
            if (enJaque) {
                console.log(`\n¡JAQUE MATE! El Rey ${colorTurnoActual} ha caído. Fin de la partida.`);
            } else {
                console.log(`\n¡EMPATE POR REY AHOGADO! Las piezas ${colorTurnoActual}s no están en Jaque, pero no tienen movimientos legales.`);
            }
        } else {
            if (enJaque) {
                console.log(`\n¡JAQUE! El Rey ${colorTurnoActual} está bajo ataque.`);
            } else {
                console.log(`\nEl juego continúa. Turno de las piezas ${colorTurnoActual}s.`);
            }
        }
    }

    private avanzarTurno(): void {
        /*
        Propósito:
         * Alterna el control del turno actual de la partida, pasándolo al color oponente.
        
        Precondición:
         * Ninguna.
        
        Parámetros:
         * Ninguno.
        
        Tipo:
         * Void
        
        Observaciones:
         * Este método solo debe ser llamado por el Tablero internamente tras confirmar 
           y ejecutar exitosamente un movimiento válido.
        */
        this._turnoActual = this._turnoActual === Color.BLANCO ? Color.NEGRO : Color.BLANCO;
    }
    private esCapturaAlPasoValida(origen: Posicion, destino: Posicion, peonAtacante: Pieza): boolean {
        /*
        Propósito:
         * Verifica si un movimiento de Peón califica como captura "Al Paso" (En Passant).
        */
        
        // 1. ¿Somos un peón intentando movernos en diagonal a una casilla vacía?
        const difColumna = Math.abs(destino.columna - origen.columna);
        const casillaDestinoVacia = this._casillas[destino.fila]?.[destino.columna] === null;

        if (peonAtacante.tipo !== TipoPieza.PEON || difColumna !== 1 || !casillaDestinoVacia) {
            return false; 
        }

        // 2. ¿Hubo un movimiento anterior registrado?
        if (!this._ultimoMovimiento) return false;

        const ultimoMovi = this._ultimoMovimiento;

        // 3. ¿La última pieza que se movió fue un peón enemigo?
        if (ultimoMovi.piezaMovida !== TipoPieza.PEON || ultimoMovi.color === peonAtacante.color) {
            return false;
        }

        // 4. ¿Ese peón enemigo hizo su salida doble?
        const hizoSalidaDoble = Math.abs(ultimoMovi.destino.fila - ultimoMovi.origen.fila) === 2;
        if (!hizoSalidaDoble) return false;

        // 5. ¿Ese peón quedó exactamente al lado nuestro en este momento?
        const estanEnMismaFila = ultimoMovi.destino.fila === origen.fila;
        const estanPegados = Math.abs(ultimoMovi.destino.columna - origen.columna) === 1;
        
        // 6. ¿Estamos intentando saltar justo "detrás" de donde quedó el enemigo?
        // (El destino debe coincidir con la columna del peón enemigo)
        const vamosALaColumnaCorrecta = destino.columna === ultimoMovi.destino.columna;

        return estanEnMismaFila && estanPegados && vamosALaColumnaCorrecta;
    }
    

  obtenerMovimientosPosibles(origen: Posicion): Posicion[] {
        /*
        Propósito:
         * Describir una lista exhaustiva de todas las coordenadas de destino legales 
           a las que puede moverse la pieza ubicada en la coordenada de origen.
        
        Precondición:
         * La coordenada de origen debe contener una pieza válida instanciada.
        
        Parámetros:
         * origen : Posicion
        
        Tipo:
         * Lista de Posicion (Posicion[])
        
        Observaciones:
         * Operación pura de LECTURA (READ). No modifica el estado del tablero.
         * Itera sobre las 64 casillas del tablero realizando una validación predictiva
           basada en las reglas del motor:
           1. Ignora la propia casilla de origen.
           2. Ignora casillas ocupadas por piezas del mismo color (fuego amigo).
           3. Consulta la validación geométrica de la propia pieza.
           4. Verifica que no existan piezas bloqueando el trayecto.
        */
        const destinosLegales: Posicion[] = [];
        const piezaOrigen = this.obtenerPieza(origen);

        if (!piezaOrigen) return destinosLegales;

        // Búsqueda de fuerza bruta sobre la matriz (segura para 8x8)
        for (let f = 0; f < 8; f++) {
            for (let c = 0; c < 8; c++) {
                const destinoTemporal: Posicion = { fila: f, columna: c };
                
                // 1. Ignorar la propia casilla donde estamos parados
                if (origen.fila === f && origen.columna === c) {
                    continue;
                }

                // 2. Operación READ: Verificamos qué hay en la casilla destino temporal
                const piezaEnDestino = this.obtenerPieza(destinoTemporal);

                // 3. Regla universal del ajedrez: No podemos aterrizar sobre una pieza aliada
                if (piezaEnDestino && piezaEnDestino.color === piezaOrigen.color) {
                    continue; // Descartamos este destino y pasamos al siguiente
                }

                // ==========================================
                // 4. VALIDACIÓN GEOMÉTRICA DE LA PIEZA
                // ==========================================
                let esGeometriaValida = false;
                
                // Determinamos si el destino contiene una pieza para informarle a las clases
                const esCaptura = piezaEnDestino !== null;

                // Operación READ: Cálculo geométrico en el ámbito superior para visibilidad global
                const difFila = destinoTemporal.fila - origen.fila;
                const difColumna = Math.abs(destinoTemporal.columna - origen.columna);

                if (piezaOrigen.tipo === TipoPieza.PEON) {
                    const direccion = piezaOrigen.color === Color.BLANCO ? 1 : -1;

                    if (difColumna === 0) {
                        if (!esCaptura) {
                            esGeometriaValida = piezaOrigen.esMovimientoValido(destinoTemporal, esCaptura);
                        }
                    } 
                    else if (difColumna === 1) {
                        if (esCaptura) {
                            if (difFila === direccion) {
                                esGeometriaValida = true;
                            }
                        }
                    }
                } 
                // INTERCEPTOR ESTRICTO PARA PINTAR EL ENROQUE
                // Aplica restricción geométrica: difFila === 0 asegura movimiento estrictamente horizontal
                else if (piezaOrigen.tipo === TipoPieza.REY && difColumna === 2 && difFila === 0) {
                    
                    if (!piezaOrigen.seHaMovido) {
                        const columnaTorre = destinoTemporal.columna > origen.columna ? 7 : 0;
                        const torre = this.obtenerPieza({ fila: origen.fila, columna: columnaTorre });
                        
                        if (torre && torre.tipo === TipoPieza.TORRE && !torre.seHaMovido) {
                            esGeometriaValida = true;
                        }
                    }
                } 
                else {
                    // Delegación de validación al contrato de la clase correspondiente
                    esGeometriaValida = piezaOrigen.esMovimientoValido(destinoTemporal, esCaptura);
                }

                // ==========================================
                // 5. VALIDACIÓN DE COLISIONES (RADAR)
                // ==========================================
                if (esGeometriaValida) {
                    if (this.caminoEstaDespejado(origen, destinoTemporal)) {
                        destinosLegales.push(destinoTemporal);
                    }
                }
            }
        }

        // ==========================================
        // 6. FILTRO DE SEGURIDAD (Simulación)
        // Evita que el usuario seleccione destinos que resulten en suicidio táctico.
        // ==========================================
        const destinosEstrictamenteLegales: Posicion[] = [];
        
        for (const destino of destinosLegales) {
            // Operación READ predictiva: Utilizamos tu método encapsulado para simular
            // el futuro. Si el movimiento NO deja al Rey en Jaque, se aprueba.
            if (!this.dejaAlReyEnJaque(origen, destino, piezaOrigen.color)) {
                destinosEstrictamenteLegales.push(destino);
            }
        }

        return destinosEstrictamenteLegales;
    }

    caminoEstaDespejado(origen: Posicion, destino: Posicion): boolean {
        /*
        Propósito:
         * Determinar si el trayecto en línea recta entre dos coordenadas está libre de piezas.
        
        Precondición:
         * El movimiento entre origen y destino debe ser vertical, horizontal o diagonal válido.
        
        Parámetros:
         * origen : Posicion
         * destino : Posicion
        
        Tipo:
         * Boolean (true si está libre, false si hay choque).
        
        Observaciones:
         * Operación READ pura. Calcula el vector de dirección y recorre las casillas intermedias.
         * Excepción a la regla: El Caballo siempre devuelve 'true' porque puede saltar.
        */
        const pieza = this.obtenerPieza(origen);
        if (!pieza) return false;

        // El Caballo ignora las colisiones por regla del juego
        if (pieza.tipo === TipoPieza.CABALLO) return true;

        const difFila = destino.fila - origen.fila;
        const difColumna = destino.columna - origen.columna;

        // Normalizamos el vector para saber la dirección de avance (-1, 0, o 1)
        const pasoFila = difFila === 0 ? 0 : difFila / Math.abs(difFila);
        const pasoCol = difColumna === 0 ? 0 : difColumna / Math.abs(difColumna);

        let filaActual = origen.fila + pasoFila;
        let colActual = origen.columna + pasoCol;

        // Recorremos el camino hasta llegar un paso antes del destino
        while (filaActual !== destino.fila || colActual !== destino.columna) {
            
            // Si encontramos una pieza en el camino intermedio, el camino está bloqueado
            if (this.obtenerPieza({ fila: filaActual, columna: colActual }) !== null) {
                return false; 
            }
            
            filaActual += pasoFila;
            colActual += pasoCol;
        }

        return true;
    }

    promoverPeon(posicion: Posicion, nuevoTipo: TipoPieza): void {
        /*
        Propósito:
         * Reemplazar un Peón que ha alcanzado la última fila por una pieza de rango superior.
        
        Precondición:
         * La coordenada dada debe contener una instancia de Peón.
         * El 'nuevoTipo' debe ser Reina, Torre, Alfil o Caballo.
        
        Parámetros:
         * posicion : Posicion
         * nuevoTipo : TipoPieza
        
        Tipo:
         * Void
        
        Observaciones:
         * Operación UPDATE destructiva. Se sobreescribe la referencia en la matriz 
           instanciando un nuevo objeto que hereda el color y la posición del Peón original.
        */
        const piezaActual = this.obtenerPieza(posicion);
        
        if (!piezaActual || piezaActual.tipo !== TipoPieza.PEON) {
            console.error("[Error] Intento de promocion invalido.");
            return;
        }

        let nuevaPieza: Pieza;
        
        switch (nuevoTipo) {
            case TipoPieza.REINA: 
                nuevaPieza = new Reina(piezaActual.color, posicion); 
                break;
            case TipoPieza.TORRE: 
                nuevaPieza = new Torre(piezaActual.color, posicion); 
                break;
            case TipoPieza.ALFIL: 
                nuevaPieza = new Alfil(piezaActual.color, posicion); 
                break;
            case TipoPieza.CABALLO: 
                nuevaPieza = new Caballo(piezaActual.color, posicion); 
                break;
            default:
                return;
        }

        // Sobrescribimos la matriz directamente con la nueva pieza
        this.colocarPieza(nuevaPieza);
        console.log(`[Sistema] Peon coronado a ${nuevoTipo} ${piezaActual.color}.`);
    }
}