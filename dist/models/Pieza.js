export class Pieza {
    /**
     * INV. REP.:
     * * El _color y _tipo son inmutables una vez instanciada la pieza.
     * * La _posicion actual debe ser siempre una casilla válida del tablero (0-7).
     */
    _color;
    _tipo;
    _posicion;
    _seHaMovido;
    /**
     * PROPÓSITO: Construir una nueva instancia de una Pieza.
     * PRECONDICIÓN: La posición inicial debe estar dentro de los límites del tablero.
     * PARÁMETROS:
     * * color: Color
     * * tipo: TipoPieza
     * * posicionInicial: Posicion
     */
    constructor(color, tipo, posicionInicial) {
        this._color = color;
        this._tipo = tipo;
        this._posicion = posicionInicial;
        this._seHaMovido = false;
    }
    // --- Getters (Encapsulamiento) ---
    get color() { return this._color; }
    get tipo() { return this._tipo; }
    get posicion() { return this._posicion; }
    get seHaHaMovido() { return this._seHaMovido; }
    /**
     * PROPÓSITO: Actualizar la ubicación interna de la pieza en el tablero.
     * PRECONDICIÓN: El movimiento hacia la nuevaPosicion debe haber sido validado previamente.
     * PARÁMETROS:
     * * nuevaPosicion: Posicion
     * TIPO DE RETORNO: void
     */
    mover(nuevaPosicion) {
        this._posicion = nuevaPosicion;
        this._seHaMovido = true; // Cuando se mueve, se marca como que se ha movido al menos una vez.
    }
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
    cambiarPosicionInterna(nuevaPosicion) {
        this._posicion = nuevaPosicion;
    }
}
//# sourceMappingURL=Pieza.js.map