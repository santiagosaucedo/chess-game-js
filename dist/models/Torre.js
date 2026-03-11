// src/models/Torre.ts
import { Pieza } from './Pieza.js';
import { TipoPieza } from './types.js';
export class Torre extends Pieza {
    constructor(color, posicionInicial) {
        /*
        Propósito:
         * Construye una instancia de una pieza de tipo Torre.
        
        Precondición:
         * La posicionInicial debe ser una coordenada válida dentro del tablero (0 a 7).
        
        Parámetros:
         * color : Color
         * posicionInicial : Posicion
        
        Tipo:
         * Torre (Hereda de Pieza)
        */
        super(color, TipoPieza.TORRE, posicionInicial);
    }
    esMovimientoValido(nuevaPosicion) {
        /*
        Propósito:
         * Indica si el movimiento hacia la **nuevaPosicion** respeta las reglas
           de movimiento de la Torre (exclusivamente en línea recta horizontal o vertical).
        
        Precondición:
         * **nuevaPosicion** debe ser una coordenada válida dentro del tablero (0 a 7).
        
        Parámetros:
         * nuevaPosicion : Posicion
        
        Tipo:
         * Boolean
        
        Observaciones:
         * Hago una evaluación lógica comprobando si la fila de destino es igual a la actual,
           o si la columna de destino es igual a la actual. Devuelve falso si la posición
           de destino es exactamente la misma que la de origen.
        */
        const mismaFila = this.posicion.fila === nuevaPosicion.fila;
        const mismaColumna = this.posicion.columna === nuevaPosicion.columna;
        // Si no se movió de su lugar, es inválido
        if (mismaFila && mismaColumna) {
            return false;
        }
        return mismaFila || mismaColumna;
    }
}
//# sourceMappingURL=Torre.js.map