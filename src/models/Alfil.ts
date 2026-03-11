// src/models/Alfil.ts
import { Pieza } from './Pieza.js';
import { Color, Posicion, TipoPieza } from './types.js';

export class Alfil extends Pieza {
    
    constructor(color: Color, posicionInicial: Posicion) {
        /*
        Propósito:
         * Construye una instancia de una pieza de tipo Alfil.
        
        Precondición:
         * La posicionInicial debe ser una coordenada válida (0 a 7).
        
        Parámetros:
         * color : Color
         * posicionInicial : Posicion
        
        Tipo:
         * Alfil (Hereda de Pieza)
        */
        super(color, TipoPieza.ALFIL, posicionInicial);
    }

    esMovimientoValido(nuevaPosicion: Posicion): boolean {
        /*
        Propósito:
         * Indica si el movimiento respeta las reglas del Alfil (exclusivamente en diagonal).
        
        Precondición:
         * nuevaPosicion debe ser una coordenada válida dentro del tablero.
        
        Parámetros:
         * nuevaPosicion : Posicion
        
        Tipo:
         * Boolean
        
        Observaciones:
         * Comprueba que la diferencia absoluta de filas sea exactamente igual a la 
           diferencia absoluta de columnas.
        */
        
        const distanciaFila = Math.abs(this.posicion.fila - nuevaPosicion.fila);
        const distanciaColumna = Math.abs(this.posicion.columna - nuevaPosicion.columna);

        // Si la distancia es 0, significa que no se movió. Lo rechazamos.
        if (distanciaFila === 0 && distanciaColumna === 0) {
            return false;
        }

        // Si avanzó 3 filas, DEBE haber avanzado 3 columnas para ser una diagonal válida.
        return distanciaFila === distanciaColumna;
    }
}