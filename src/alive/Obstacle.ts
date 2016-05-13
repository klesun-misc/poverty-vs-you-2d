
import {IAlive} from "./IAlive";
import DisplayObject = createjs.DisplayObject;
import {IMissile} from "./Missile";
import {rect_t} from "../MokonaGame";

const BOUNDS: rect_t = [0,0,10,10];

/* an Obstacle is rectangular unchangeable object that person can
 * stand on also blocks path. you can not go through an Obstacle
 * nor from left, nor from right, nor from bottom*/
export function Obstacle(x: number, y: number, w: number, h: number): IMissile
{
    var makeShape = function(): DisplayObject
    {
        var shape = new createjs.Shape();

        shape.graphics.ss(4)
            .beginFill('#ccc').drawRect(0,0,w,h)
            .beginStroke('#444').drawRect(0,0,w,h);

        shape.x = x;
        shape.y = y;

        return shape;
    };
    var shape = makeShape();

    return {
        getShape: () => shape,
        getBounds: () => [0,0,w,h],
        live: () => [],
        isDead: () => false,
        interactWith: () => {},
        takeDamage: () => {},
        getVector: () => [0,0],
    };
}

export interface IObstacle extends IAlive {

}