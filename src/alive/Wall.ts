
import DisplayObject = createjs.DisplayObject;
import {IGameObject} from "./IGameObject";

/* an Wall is rectangular unchangeable object that person can
 * stand on also blocks path. you can not go through a Wall
 * nor from left, nor from right, nor from bottom*/
export function Wall([x,y,w,h]: number[]): IGameObject
{
    let makeShape = function(): DisplayObject
    {
        var shape = new createjs.Shape();

        shape.graphics.ss(4)
            .beginFill('#ccc').drawRect(0,0,w,h)
            .beginStroke('#444').drawRect(0,0,w,h);

        shape.x = x;
        shape.y = y;

        return shape;
    };
    let shape = makeShape();

    return {
        getShape: () => shape,
        getBounds: () => [0,0,w,h],
        live: () => [],
        isDead: () => false,
        interactWith: () => {},
        takeDamage: () => {},
        getVector: () => [0,0],
        serialize: () => 1 && {
            class: 'Wall',
            args: [x,y,w,h],
        },
    };
}

let dummy = 0?Wall(null):null;
export type IWall = typeof dummy;
