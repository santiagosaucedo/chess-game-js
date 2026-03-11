// src/models/Rey.ts
import { Pieza } from './Pieza.js';
import { TipoPieza } from './types.js';
export class Rey extends Pieza {
    constructor(color, posicionInicial) {
        /* ... Contratos de inicialización del Rey ... */
        super(color, TipoPieza.REY, posicionInicial);
    }
    esMovimientoValido(nuevaPosicion) {
        /*
        Propósito:
         * Indica si el movimiento respeta las reglas del Rey (una casilla en cualquier dirección).
        
        Precondición:
         * nuevaPosicion debe ser una coordenada válida.
        
        Parámetros:
         * nuevaPosicion : Posicion
        
        Tipo:
         * Boolean
        */
        const distanciaFila = Math.abs(this.posicion.fila - nuevaPosicion.fila);
        const distanciaColumna = Math.abs(this.posicion.columna - nuevaPosicion.columna);
        if (distanciaFila === 0 && distanciaColumna === 0) {
            return false;
        }
        // Su distancia máxima en cualquier eje (X o Y) no puede ser mayor a 1
        return distanciaFila <= 1 && distanciaColumna <= 1;
    }
}
//# sourceMappingURL=Rey.js.map