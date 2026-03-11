import { Color, TipoPieza, Posicion } from './types.js';
export declare abstract class Pieza {
    /**
     * INV. REP.:
     * * El _color y _tipo son inmutables una vez instanciada la pieza.
     * * La _posicion actual debe ser siempre una casilla válida del tablero (0-7).
     */
    protected readonly _color: Color;
    protected readonly _tipo: TipoPieza;
    protected _posicion: Posicion;
    protected _seHaMovido: boolean;
    /**
     * PROPÓSITO: Construir una nueva instancia de una Pieza.
     * PRECONDICIÓN: La posición inicial debe estar dentro de los límites del tablero.
     * PARÁMETROS:
     * * color: Color
     * * tipo: TipoPieza
     * * posicionInicial: Posicion
     */
    constructor(color: Color, tipo: TipoPieza, posicionInicial: Posicion);
    get color(): Color;
    get tipo(): TipoPieza;
    get posicion(): Posicion;
    get seHaHaMovido(): boolean;
    /**
     * PROPÓSITO: Determinar si el movimiento respeta las reglas de la pieza.
     * PRECONDICIÓN: La nuevaPosicion debe ser válida en el tablero.
     * PARÁMETROS:
     * * nuevaPosicion: Posicion
     * * esCaptura: boolean (Opcional, indica si hay un enemigo en el destino)
     * TIPO DE RETORNO: boolean
     */
    abstract esMovimientoValido(nuevaPosicion: Posicion, esCaptura?: boolean): boolean;
    /**
     * PROPÓSITO: Actualizar la ubicación interna de la pieza en el tablero.
     * PRECONDICIÓN: El movimiento hacia la nuevaPosicion debe haber sido validado previamente.
     * PARÁMETROS:
     * * nuevaPosicion: Posicion
     * TIPO DE RETORNO: void
     */
    mover(nuevaPosicion: Posicion): void;
    /**
     * PROPÓSITO: Actualizar las coordenadas internas de la pieza sin alterar su estado histórico.
     * PRECONDICIÓN: nuevaPosicion debe ser válida dentro del tablero (0 a 7).
     * PARÁMETROS:
     * * nuevaPosicion: Posicion
     * TIPO DE RETORNO: void
     * OBSERVACIONES: Este método es de uso exclusivo para las simulaciones matemáticas del Tablero
     * (ej. evaluar si un movimiento deja al Rey en jaque) y NO debe usarse para mover piezas
     * en el flujo normal del juego.
     */
    cambiarPosicionInterna(nuevaPosicion: Posicion): void;
}
//# sourceMappingURL=Pieza.d.ts.map