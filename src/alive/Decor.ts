
import DisplayObject = createjs.DisplayObject;
import {IGameObject} from "./IGameObject";

/* anything that serves just for decoration
 * can be wrapped in this class to follow camera */
export function Decor(disObj: DisplayObject): IGameObject
{
    return {
        getShape: () => disObj,
        getBounds: () => [0,0,0,0],
        live: () => [],
        isDead: () => false,
        interactWith: () => {},
        takeDamage: () => {},
        getVector: () => [0,0],
        serialize: () => 1 && {
            class: Decor.name,
            args: [],
        },
    };
}

let dummy = 0?Decor(null):null;
export type IWall = typeof dummy;
