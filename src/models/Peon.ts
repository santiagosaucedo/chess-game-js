// src/models/Peon.ts
import { Pieza } from './Pieza.js';
import { Color, Posicion, TipoPieza } from './types.js';

export class Peon extends Pieza {
    
    constructor(color: Color, posicionInicial: Posicion) {
        super(color, TipoPieza.PEON, posicionInicial);
    }

    esMovimientoValido(nuevaPosicion: Posicion, esCaptura: boolean = false): boolean {
        /*
        Propósito:
         * Indica si el movimiento respeta las reglas del Peón (avanza 1 o 2 de frente, 
           come 1 en diagonal).
        
        Precondición:
         * nuevaPosicion debe ser una coordenada válida.
        
        Parámetros:
         * nuevaPosicion : Posicion
         * esCaptura : Boolean
        
        Tipo:
         * Boolean
        
        Observaciones:
         * El peón blanco siempre suma filas (+1), el negro siempre resta filas (-1).
        */
        
        const direccion = this.color === Color.BLANCO ? 1 : -1;
        const difFila = nuevaPosicion.fila - this.posicion.fila;
        const difColumna = Math.abs(nuevaPosicion.columna - this.posicion.columna);

        // CASO A: Es un movimiento para capturar a un enemigo
        if (esCaptura) {
            // Debe avanzar exactamente 1 fila hacia adelante y 1 columna hacia el costado
            return difFila === direccion && difColumna === 1;
        } 
        
        // CASO B: Es un movimiento normal (sin comer)
        else {
            // El peón no puede moverse hacia los costados si no está comiendo
            if (difColumna !== 0) {
                return false;
            }

            // Movimiento simple (Avanza 1)
            if (difFila === direccion) {
                return true;
            }

            // Movimiento doble (Solo permitido desde su fila inicial)
            const filaInicial = this.color === Color.BLANCO ? 1 : 6;
            if (this.posicion.fila === filaInicial && difFila === (2 * direccion)) {
                return true;
            }

            return false;
        }
    }
}