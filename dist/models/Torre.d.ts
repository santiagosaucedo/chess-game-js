import { Pieza } from './Pieza.js';
import { Color, Posicion } from './types.js';
export declare class Torre extends Pieza {
    constructor(color: Color, posicionInicial: Posicion);
    esMovimientoValido(nuevaPosicion: Posicion): boolean;
}
//# sourceMappingURL=Torre.d.ts.map