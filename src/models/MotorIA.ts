// src/models/MotorIA.ts
import { Tablero } from './Tablero.js';
import { Posicion, Color, TipoPieza } from './types.js';

export class MotorIA {
    static ejecutarMovimientoGreedy(tablero: Tablero, colorIA: Color): { origen: Posicion, destino: Posicion } | null {
        /*
        Propósito:
         * Analizar el estado actual del tablero y calcular la jugada táctica más 
           favorable para la IA en el turno vigente.
        
        Precondición:
         * El tablero debe estar inicializado y debe ser el turno del color de la IA.
        
        Parámetros:
         * tablero : Tablero (Instancia por referencia para operaciones READ)
         * colorIA : Color
        
        Tipo:
         * Objeto con coordenadas origen y destino, o null si no hay jugadas.
        
        Observaciones:
         * Operación READ intensiva. Escanea la matriz completa, recopila todos 
           los destinos legales de todas las piezas vivas de la IA y les asigna un peso.
        */
        
        const jugadasDisponibles: { origen: Posicion, destino: Posicion, peso: number }[] = [];
        
        const valoresPiezas: Record<string, number> = {
            [TipoPieza.PEON]: 10,
            [TipoPieza.CABALLO]: 30,
            [TipoPieza.ALFIL]: 30,
            [TipoPieza.TORRE]: 50,
            [TipoPieza.REINA]: 90,
            [TipoPieza.REY]: 900
        };

        // 1. Operación READ: Mapeo total del estado
        for (let f = 0; f < 8; f++) {
            for (let c = 0; c < 8; c++) {
                const origen: Posicion = { fila: f, columna: c };
                const pieza = tablero.obtenerPieza(origen);

                if (pieza && pieza.color === colorIA) {
                    const destinosLegales = tablero.obtenerMovimientosPosibles(origen);
                    
                    for (const destino of destinosLegales) {
                        let pesoJugada = 0;
                        const piezaEnDestino = tablero.obtenerPieza(destino);
                        
                        // Sistema de recompensa: Priorizar capturas
                        if (piezaEnDestino) {
                            pesoJugada = valoresPiezas[piezaEnDestino.tipo] || 0;
                        }
                        
                        // Añadimos un factor de aleatoriedad leve para que no sea determinista y aburrida
                        pesoJugada += Math.random(); 

                        jugadasDisponibles.push({ origen, destino, peso: pesoJugada });
                    }
                }
            }
        }

        if (jugadasDisponibles.length === 0) return null;

        // 2. Ordenamiento y Selección
        jugadasDisponibles.sort((a, b) => b.peso - a.peso);
        
        // Operación READ estructurada: Extraemos la jugada con mayor puntaje
        const jugadaElegida = jugadasDisponibles[0];
        
        // Escudo de seguridad para satisfacer la validación estricta de TypeScript
        if (!jugadaElegida) return null; 

        // Retornamos exactamente el objeto que dicta la firma de la función, descartando el 'peso'
        return {
            origen: jugadaElegida.origen,
            destino: jugadaElegida.destino
        };
    }
}