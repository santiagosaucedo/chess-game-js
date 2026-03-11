// src/models/types.ts
/**
 * PROPÓSITO: Modelar los colores permitidos en el juego.
 */
export var Color;
(function (Color) {
    Color["BLANCO"] = "Blanco";
    Color["NEGRO"] = "Negro";
})(Color || (Color = {}));
/**
 * PROPÓSITO: Modelar los tipos de piezas de ajedrez disponibles.
 */
export var TipoPieza;
(function (TipoPieza) {
    TipoPieza["PEON"] = "Pe\u00F3n";
    TipoPieza["TORRE"] = "Torre";
    TipoPieza["CABALLO"] = "Caballo";
    TipoPieza["ALFIL"] = "Alfil";
    TipoPieza["REINA"] = "Reina";
    TipoPieza["REY"] = "Rey";
})(TipoPieza || (TipoPieza = {}));
//# sourceMappingURL=types.js.map