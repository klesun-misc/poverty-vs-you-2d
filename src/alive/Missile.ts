
import {IAlive} from "./IAlive";
import DisplayObject = createjs.DisplayObject;

/** missile is (at least for now) a ball casted by
 * an IPerson, flying by a straight line, that
 * explodes and damages another IPerson on contact */
export function Missile(x: number, y: number, vx: number, vy: number): IMissile
{
    var isDead = false;

    var makeShape = function(): DisplayObject
    {
        var shape = new createjs.Shape();

        shape.graphics
            .beginFill('#0f0').drawCircle(0,0, 5);

        shape.x = x;
        shape.y = y;

        return shape;
    };
    var shape = makeShape();

    var live = function()
    {
        shape.x += vx;
        shape.y += vy;

        if (shape.x > 1000 || shape.x < 0 || shape.y > 500 || shape.y < 0) {
            isDead = true;
        }
    };

    return {
        getShape: () => shape,
        live: live,
        isDead: () => isDead,
        producedChildren: [],
    };
}

export interface IMissile extends IAlive {

}