// src/index.ts
import { Peon } from './models/Peon';
import { Tablero } from './models/Tablero';
import { Color } from './models/types';

function simularPeonAlPaso(): void {
    /*
    Propósito:
     * Demostrar la correcta ejecución de la regla 'En Passant', validando la 
       memoria a corto plazo del Tablero y el respeto estricto del sistema de turnos.
    */
    const miTablero = new Tablero();

    // 1. Preparamos los actores
    const peonBlancoAtacante = new Peon(Color.BLANCO, { fila: 1, columna: 3 });
    const peonNegroDistraccion = new Peon(Color.NEGRO, { fila: 6, columna: 0 }); 
    const peonNegroVictima = new Peon(Color.NEGRO, { fila: 6, columna: 4 });

    miTablero.colocarPieza(peonBlancoAtacante);
    miTablero.colocarPieza(peonNegroDistraccion);
    miTablero.colocarPieza(peonNegroVictima);

    console.log("--- TABLERO INICIAL ---");
    miTablero.mostrarTablero();

    // --- RONDA 1 ---
    console.log("\n➡️ TURNO BLANCO: Salida doble.");
    miTablero.moverPieza({ fila: 1, columna: 3 }, { fila: 3, columna: 3 });

    console.log("\n➡️ TURNO NEGRO: Movimiento de distracción.");
    miTablero.moverPieza({ fila: 6, columna: 0 }, { fila: 5, columna: 0 });

    // --- RONDA 2 ---
    console.log("\n➡️ TURNO BLANCO: El peón llega a la zona de acecho (Fila 4).");
    miTablero.moverPieza({ fila: 3, columna: 3 }, { fila: 4, columna: 3 });

    console.log("\n➡️ TURNO NEGRO: Salida doble del Peón Negro (¡Queda regalado al paso!).");
    miTablero.moverPieza({ fila: 6, columna: 4 }, { fila: 4, columna: 4 });

    console.log("\n--- TABLERO ANTES DEL ZARPAZO ---");
    miTablero.mostrarTablero();

    // --- RONDA 3 (LA MAGIA) ---
    console.log("\nTURNO BLANCO: ¡EJECUTANDO PEÓN AL PASO!");
    // El peón blanco (4,3) ataca en diagonal hacia una casilla vacía (5,4)
    miTablero.moverPieza({ fila: 4, columna: 3 }, { fila: 5, columna: 4 });

    console.log("\n--- TABLERO DESPUÉS DE LA CAPTURA ---");
    miTablero.mostrarTablero();
}

simularPeonAlPaso();