///<reference path="../../libs/d.ts/easeljs.d.ts"/>

import DisplayObject = createjs.DisplayObject;

export interface IAlive {
    getShape: () => DisplayObject,
    live: () => void,
    isDead: () => boolean,
    producedChildren: IAlive[], // TODO: it should be returned by live(), not stored as property!
    getBounds: () => [number,number,number,number],
    interactWith: (other: IAlive, prevPos: [number, number]) => void,
    takeDamage: (n: number) => void,
    getVector: () => [number, number],
}