import { Pieza } from './Pieza.js';
import { Posicion, TipoPieza, Color } from './types.js';
export declare class Tablero {
    /**
     * INV. REP.:
     * * _casillas es una matriz cuadrada de exactamente 8x8.
     * * Cada elemento puede ser una instancia de una Pieza o null (casilla vacía).
     */
    private _casillas;
    private _turnoActual;
    private _ultimoMovimiento;
    constructor();
    inicializarPartidaClasica(): void;
    /**
     * PROPÓSITO: Crea una matriz de 8x8 llena de valores 'null'.
     * TIPO DE RETORNO: Matriz bidimensional de Pieza o null.
     */
    private inicializarTableroVacio;
    get turnoActual(): Color;
    /**
     * PROPÓSITO: Ubicar una pieza en el tablero durante el setup inicial.
     * PRECONDICIÓN: La posición interna de la pieza debe ser válida (0-7).
     * PARÁMETROS:
     * * pieza: Pieza
     */
    colocarPieza(pieza: Pieza): void;
    /**
     * PROPÓSITO: Obtener la pieza ubicada en una coordenada específica.
     * PRECONDICIÓN: La posición debe estar dentro de los límites (0-7).
     * TIPO DE RETORNO: Pieza (si hay una) o null (si está vacía).
     */
    obtenerPieza(posicion: Posicion): Pieza | null;
    moverPieza(origen: Posicion, destino: Posicion): boolean;
    mostrarTablero(): void;
    private caminoEstaLibre;
    coronarPeon(posicion: Posicion, tipoPromocion: TipoPieza): boolean;
    enrocar(color: Color, lado: 'CORTO' | 'LARGO'): boolean;
    private encontrarRey;
    estaEnJaque(colorRey: Color): boolean;
    private dejaAlReyEnJaque;
    private esJugadaLegalSilenciosa;
    tieneMovimientosLegales(color: Color): boolean;
    evaluarEstadoDelJuego(colorTurnoActual: Color): void;
    private avanzarTurno;
    private esCapturaAlPasoValida;
    obtenerMovimientosPosibles(origen: Posicion): Posicion[];
    caminoEstaDespejado(origen: Posicion, destino: Posicion): boolean;
    promoverPeon(posicion: Posicion, nuevoTipo: TipoPieza): void;
}
//# sourceMappingURL=Tablero.d.ts.map