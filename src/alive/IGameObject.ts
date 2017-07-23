///<reference path="../../../../libs/dts/easeljs/index.d.ts"/>

import DisplayObject = createjs.DisplayObject;

export interface IGameObject {
    getShape: () => DisplayObject,
    live: () => IGameObject[],
    isDead: () => boolean,
    getBounds: () => [number,number,number,number],
    interactWith: (collides: IGameObject[], prevPos: [number, number]) => void,
    takeDamage: (n: number) => void,
    getVector: () => [number, number],
}