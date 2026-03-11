// src/models/Reina.ts
import { Pieza } from './Pieza.js';
import { Color, Posicion, TipoPieza } from './types.js';

export class Reina extends Pieza {
    
    constructor(color: Color, posicionInicial: Posicion) {
        /* ... Contratos de inicialización de la Reina ... */
        super(color, TipoPieza.REINA, posicionInicial);
    }

    esMovimientoValido(nuevaPosicion: Posicion): boolean {
        /*
        Propósito:
         * Indica si el movimiento respeta las reglas de la Reina 
           (recto como Torre o diagonal como Alfil).
        
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
            return false; // No se movió
        }

        const movimientoComoTorre = (this.posicion.fila === nuevaPosicion.fila) || (this.posicion.columna === nuevaPosicion.columna);
        const movimientoComoAlfil = (distanciaFila === distanciaColumna);

        // Es válido si cumple la regla de la Torre O la regla del Alfil
        return movimientoComoTorre || movimientoComoAlfil;
    }
}