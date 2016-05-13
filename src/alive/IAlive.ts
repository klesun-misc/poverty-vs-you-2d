///<reference path="../../libs/d.ts/easeljs.d.ts"/>

import DisplayObject = createjs.DisplayObject;

export interface IAlive {
    getShape: () => DisplayObject,
    live: () => IAlive[],
    isDead: () => boolean,
    getBounds: () => [number,number,number,number],
    interactWith: (other: IAlive, prevPos: [number, number]) => void,
    takeDamage: (n: number) => void,
    getVector: () => [number, number],
}