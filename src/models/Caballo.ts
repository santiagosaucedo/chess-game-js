// src/models/Caballo.ts
import { Pieza } from './Pieza.js';
import { Color, Posicion, TipoPieza } from './types.js';

export class Caballo extends Pieza {
    
    constructor(color: Color, posicionInicial: Posicion) {
        /*
        Propósito:
         * Construye una instancia de una pieza de tipo Caballo.
        
        Precondición:
         * La posicionInicial debe ser una coordenada válida (0 a 7).
        
        Parámetros:
         * color : Color
         * posicionInicial : Posicion
        
        Tipo:
         * Caballo (Hereda de Pieza)
        */
        super(color, TipoPieza.CABALLO, posicionInicial);
    }

    esMovimientoValido(nuevaPosicion: Posicion): boolean {
        /*
        Propósito:
         * Indica si el movimiento respeta las reglas del Caballo (forma de "L").
        
        Precondición:
         * nuevaPosicion debe ser una coordenada válida dentro del tablero.
        
        Parámetros:
         * nuevaPosicion : Posicion
        
        Tipo:
         * Boolean
        
        Observaciones:
         * Calcula la distancia absoluta en filas y columnas. El movimiento es válido 
           si se desplaza exactamente 2 casillas en un eje y 1 en el otro.
        */
        
        const distanciaFila = Math.abs(this.posicion.fila - nuevaPosicion.fila);
        const distanciaColumna = Math.abs(this.posicion.columna - nuevaPosicion.columna);

        // Retorna true si hace "2 vertical y 1 horizontal" O "1 vertical y 2 horizontal"
        return (distanciaFila === 2 && distanciaColumna === 1) || 
               (distanciaFila === 1 && distanciaColumna === 2);
    }
}