/**
 * PROPÓSITO: Modelar los colores permitidos en el juego.
 */
export declare enum Color {
    BLANCO = "Blanco",
    NEGRO = "Negro"
}
/**
 * PROPÓSITO: Modelar los tipos de piezas de ajedrez disponibles.
 */
export declare enum TipoPieza {
    PEON = "Pe\u00F3n",
    TORRE = "Torre",
    CABALLO = "Caballo",
    ALFIL = "Alfil",
    REINA = "Reina",
    REY = "Rey"
}
/**
 * PROPÓSITO: Modelar una coordenada exacta dentro del tablero de ajedrez.
 * * INV. REP.:
 * * fila debe estar entre 0 y 7.
 * * columna debe estar entre 0 y 7.
 */
export interface Posicion {
    fila: number;
    columna: number;
}
/**
 * PROPÓSITO: Registrar los datos clave del último movimiento realizado en el tablero.
 * OBSERVACIONES: Fundamental para evaluar la regla del "Peón al Paso".
 */
export interface Movimiento {
    piezaMovida: TipoPieza;
    color: Color;
    origen: Posicion;
    destino: Posicion;
}
//# sourceMappingURL=types.d.ts.map