// src/models/Rey.ts
import { Pieza } from './Pieza.js';
import { Color, Posicion, TipoPieza } from './types.js';

export class Rey extends Pieza {
    
    constructor(color: Color, posicionInicial: Posicion) {
        /* ... Contratos de inicialización del Rey ... */
        super(color, TipoPieza.REY, posicionInicial);
    }

    esMovimientoValido(nuevaPosicion: Posicion): boolean {
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

        // --- NUEVO: EXCEPCIÓN PARA EL ENROQUE ---
        // Permitimos que el Rey se mueva 2 columnas a los lados (solo en su misma fila)
        if (distanciaFila === 0 && distanciaColumna === 2) {
            return true;
        }

        // Su distancia máxima en cualquier eje (X o Y) no puede ser mayor a 1
        return distanciaFila <= 1 && distanciaColumna <= 1;
    }
}