///<reference path="../../libs/d.ts/easeljs.d.ts"/>

import DisplayObject = createjs.DisplayObject;

export interface IAlive {
    getShape: () => DisplayObject,
    live: () => void,
    isDead: () => boolean,
    producedChildren: IAlive[],
}