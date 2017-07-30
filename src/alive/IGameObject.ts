///<reference path="../../../../libs/dts/easeljs/index.d.ts"/>

import DisplayObject = createjs.DisplayObject;

class serialized_t {
    class: string;
    args: valid_json_t[];
}

export interface IGameObject {
    getShape: () => DisplayObject,
    live: () => IGameObject[],
    isDead: () => boolean,
    getBounds: () => [number,number,number,number],
    interactWith: (collides: IGameObject[], prevPos: [number, number]) => void,
    takeDamage: (n: number) => void,
    getVector: () => [number, number],
    serialize: () => serialized_t,
    [k: string]: any
}
