///<reference path="../../libs/d.ts/easeljs.d.ts"/>

import {Tls} from "./../Tools";
import {IAlive} from "./IAlive";
import {IMissile} from "./Missile";
import {Missile} from "./Missile";
import {rect_t} from "../MokonaGame";
import {vadd} from "../Tools";

interface IParams {
    x?: number,
    y?: number,
}

const MAX_VX = 7.5;
const DVX = 2;
const DVY = 30;
const G = 4;

const HEIGHT = 75;
const WIDTH = 55;

const BOUNDS: rect_t = [-WIDTH / 2 -WIDTH * 10/55, -HEIGHT * 9/10, WIDTH * 16/55, HEIGHT * 9/10];

export function Person(params: IParams): IPerson
{
    var floorAlive: IAlive = null;
    var floor = () => floorAlive !== null
        ? floorAlive.getShape().y + floorAlive.getBounds()[1]
        : 999999999999999999;

    var boostX = 0;
    var boostY = 0;
    var castingFireball = false;

    var vx = 0;
    var vy = -20;

    // game logic info
    var health = 100;
    var mana = 100;

    var healthBar = new createjs.Shape();
    var manaBar = new createjs.Shape();
    var vectorMarker = new createjs.Shape();
    vectorMarker.graphics.beginFill('#ff0').drawCircle(0,0,3);
    vectorMarker.alpha = 0.4;

    var spriteSheet = new createjs.SpriteSheet({
        images: ['imgs/run_sprite/spritesheet.png'],
        frames: {width: WIDTH, height: HEIGHT},
        animations: {
            run: {
                frames: [0,1,2,3,4,5,6,7,8,9,10,11],
                speed: 0.5,
            },
        },
        framerate: 45,
    });
    var animation = new createjs.Sprite(spriteSheet, 'run');
    animation.regX = 30;

    var faceForward = true;
    var isDead = false;

    var changeMana = function(n: number)
    {
        if (mana + n >= 0 && mana + n <= 100) {
            mana += n;
            manaBar.graphics.clear().beginFill('#44f')
                .rect(BOUNDS[0] -WIDTH / 8, -HEIGHT - 5, mana / 100 * WIDTH / 2, 5);
            return true;
        } else {
            return false;
        }
    };

    var changeHealth = function(n: number)
    {
        health += n;
        healthBar.graphics.clear().beginFill('#f00')
            .rect(BOUNDS[0] -WIDTH / 8, -HEIGHT - 12, health/100 * WIDTH / 2, 5);

        if (health <= 0) {
            isDead = true;
        }
    };

    var makePersonShape = function()
    {
        var cont = new createjs.Container();

        animation.x = -WIDTH * 6/11;
        animation.y = -HEIGHT;

        cont.addChild(animation);

        var aura = new createjs.Shape();

        var [x,y,w,h] = BOUNDS;
        aura.graphics.beginStroke('#88f').rect(x,y,w,h);

        cont.addChild(aura);
        cont.addChild(healthBar);
        cont.addChild(manaBar);
        cont.addChild(vectorMarker);

        cont.x = params.x || 50;
        cont.y = params.y || 50;

        return cont;
    };

    var updateVectorMarker = function()
    {
        var [x,y,w,h] = BOUNDS;

        vectorMarker.x = x + w / 2 + vx * 4;
        vectorMarker.y = y + h / 1/4 + vy * 4;
    };

    var shape = makePersonShape();

    var haste = function(dvx: number,dvy: number) {
        if (faceForward && dvx < 0) {
            faceForward = false;
            animation.scaleX *= -1;
        } else if (!faceForward && dvx > 0) {
            faceForward = true;
            animation.scaleX *= -1;
        }

        boostX = dvx;
        boostY = dvy;
    };

    var getVector = (): [number, number] => floorAlive !== null
        ? vadd([vx, vy], floorAlive.getVector())
        : [vx, vy];

    var applyGravity = function()
    {
        if (shape.y >= floor()) {
            vy = 0;
            shape.y = floor();
        }

        shape.y < floor()
            ? vy += G
            : vx = Tls.lim(Tls.toZero(vx, DVX / 2), -MAX_VX, MAX_VX);

        if (floorAlive !== null && (
            floorAlive.isDead() ||
            shape.y !== floorAlive.getShape().y + floorAlive.getBounds()[1] ||
            shape.x + BOUNDS[0] + BOUNDS[2] < floorAlive.getShape().x + floorAlive.getBounds()[0] ||
            shape.x + BOUNDS[0] > floorAlive.getShape().x + floorAlive.getBounds()[0] + floorAlive.getBounds()[2]
        )) {
            var [fvx,fvy] = floorAlive.getVector();
            [vx,vy] = [vx + fvx / 10, vy + fvy / 10];
            floorAlive = null;
        }

        if (floorAlive !== null) {
            vx += DVX * boostX; boostX = 0;
            vy += DVY * boostY; boostY = 0;
        } else {
            boostX = boostY = 0;
        }
    };

    var interactWith = function(other: IAlive, prevPos: [number, number])
    {
        var [adx,ady,aw,ah] = BOUNDS;
        var [bdx,bdy,bw,bh] = other.getBounds();

        var [wasX, wasY] = prevPos;

        if (wasY + ady + ah <= other.getShape().y + bdy) {
            // move this top
            shape.y = other.getShape().y + bdy - ady - ah;
            floorAlive = other;

        } else if (wasY + ady >= other.getShape().y + bdy + bh) {
            // move this bottom
            shape.y = other.getShape().y + bdy + bh - ady;

        } else if (wasX + adx + aw <= other.getShape().x + bdx) {
            // move this left
            shape.x = other.getShape().x + bdx - adx - aw;

        } else if (wasX + adx >= other.getShape().x + bdx + bw) {
            // move this right
            shape.x = other.getShape().x + bdx + bw - adx;
        }
    };

    var live = function()
    {
        var producedChildren: IAlive[] = [];

        applyGravity();
        updateVectorMarker();

        if (castingFireball) {
            castingFireball = false;
            if (changeMana(-33)) {
                var v = 2;
                var args = faceForward
                    ? [shape.x + BOUNDS[0] - 50 - 10, shape.y - HEIGHT * 3 / 4, v, 0]
                    : [shape.x + BOUNDS[0] + BOUNDS[2] + 10, shape.y - HEIGHT * 3 / 4, -v, 0];
                producedChildren.push(Missile.apply(this, args));
            } else {
                alert('Out of mana');
            }
        }

        changeMana(1);

        return producedChildren;
    };

    return {
        live: live,
        getShape: () => shape,
        isDead: () => isDead,
        getBounds: () => BOUNDS,
        interactWith: interactWith,
        takeDamage: (n) => changeHealth(-n),
        getVector: getVector,

        // game logic methods
        haste: haste,
        fireball: () => castingFireball = true,
    };
};

export interface IPerson extends IAlive {
    haste: (dvx: number, dvy: number) => void,
    fireball: () => void,
}