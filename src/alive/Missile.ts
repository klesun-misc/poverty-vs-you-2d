
import {IGameObject} from "./IGameObject";
import DisplayObject = createjs.DisplayObject;
import {rect_t} from "../MokonaGame";

const BOUNDS: rect_t = [0,0,50,10];
const MAX_VX = 15;

/** missile is (at least for now) a ball casted by
 * an IPerson, flying by a straight line, that
 * explodes and damages another IPerson on contact */
export function Missile(x: number, y: number, vx: number, vy: number): IGameObject
{
    var isDead = false;
    var fuel = 600;
    var startVelocity = Math.sqrt(vx ** 2 + vy ** 2);

    var makeShape = function(): DisplayObject
    {
        var shape = new createjs.Shape();

        var [dx,dy,w,h] = BOUNDS;
        shape.graphics
            .beginFill('#ff0').drawRect(dx,dy,w,h);

        shape.x = x;
        shape.y = y;

        return shape;
    };
    var shape = makeShape();

    var live = function(): IGameObject[]
    {
        fuel -= Math.sqrt(vx ** 2 + vy ** 2);
        shape.alpha = fuel / 600;

        vx = Math.max(-MAX_VX, Math.min(vx * 1.075, MAX_VX));

        if (fuel <= 0 || shape.x > 1000 || shape.x < 0 || shape.y > 500 || shape.y < 0) {
            isDead = true;
        }

        return [];
    };

    var interactWith = function(collides: IGameObject[], prevPos: [number, number])
    {
        if (collides.length > 0) {
            isDead = true;
            var v = Math.sqrt(vx ** 2 + vy **2);
            collides.forEach(c => c.takeDamage(4 * v));
        }
    };

    return {
        getShape: () => shape,
        live: live,
        isDead: () => isDead,
        getBounds: () => BOUNDS,
        interactWith: interactWith,
        takeDamage: (amount) => {},
        getVector: () => [vx, vy],
    };
}

let dummy = 0?Missile(0,0,0,0):null;
export type IMissile = typeof dummy;