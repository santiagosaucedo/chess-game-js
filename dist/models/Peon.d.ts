import { Pieza } from './Pieza.js';
import { Color, Posicion } from './types.js';
export declare class Peon extends Pieza {
    constructor(color: Color, posicionInicial: Posicion);
    esMovimientoValido(nuevaPosicion: Posicion, esCaptura?: boolean): boolean;
}
//# sourceMappingURL=Peon.d.ts.map