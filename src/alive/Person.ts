///<reference path="../../../../libs/dts/easeljs/index.d.ts"/>

import {Tls} from "./../Tools";
import {IGameObject} from "./IGameObject";
import {Missile} from "./Missile";
import {rect_t} from "../MokonaGame";
import {vadd} from "../Tools";
import {S} from "../../../../src/utils/S";

interface IParams {
    x?: number,
    y?: number,
}

const MAX_VX = 10;
const DVX = 3;
const DVY = 30;
const G = 4;

const WIDTH = 55;
const HEIGHT = 75;

const RAD_A = WIDTH * 15/55;
const BOUNDS: rect_t = [-WIDTH / 2 - RAD_A, -HEIGHT * 0.95, WIDTH - RAD_A * 2, HEIGHT * 0.95];

/** @return IGameObject */
export function Person(params: IParams)
{
    let floorAlive: IGameObject = null;
    let floor = () => floorAlive !== null
        ? floorAlive.getShape().y + floorAlive.getBounds()[1]
        : 999999999999999999;

    let castingFireball = false;

    let vx = 0;
    let vy = -20;

    // game logic info
    let health = 100;
    let mana = 100;

    let healthBar = new createjs.Shape();
    let manaBar = new createjs.Shape();
    let vectorMarker = new createjs.Shape();
    vectorMarker.graphics.beginFill('#ff0').drawCircle(0,0,3);
    vectorMarker.alpha = 0.4;

    let spriteSheet = new createjs.SpriteSheet({
        images: ['imgs/run_sprite/spritesheet_55x75.png'],
        frames: {width: WIDTH, height: HEIGHT},
        animations: {
            run: {
                // there are 6 cols in 5 rows of sprites and last 1 is same as the first
                frames: S.range(0, 6 * 5 - 1),
                speed: 1,
            },
        },
        framerate: 45,
    });
    let animation = new createjs.Sprite(spriteSheet, 'run');
    animation.regX = 30;

    let faceForward = true;
    let isDead = false;

    let changeMana = function(n: number)
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

    let changeHealth = function(n: number)
    {
        health += n;
        healthBar.graphics.clear().beginFill('#f00')
            .rect(BOUNDS[0] -WIDTH / 8, -HEIGHT - 12, health/100 * WIDTH / 2, 5);

        if (health <= 0) {
            isDead = true;
        }
    };

    let makePersonShape = function()
    {
        let cont = new createjs.Container();

        animation.x = -WIDTH * 6/11;
        animation.y = -HEIGHT;

        cont.addChild(animation);

        let aura = new createjs.Shape();

        let [x,y,w,h] = BOUNDS;
        aura.graphics.beginStroke('#88f').rect(x,y,w,h);

        cont.addChild(aura);
        cont.addChild(healthBar);
        cont.addChild(manaBar);
        cont.addChild(vectorMarker);

        cont.x = params.x || 50;
        cont.y = params.y || 50;

        return cont;
    };

    let updateVectorMarker = function()
    {
        let [x,y,w,h] = BOUNDS;

        vectorMarker.x = x + w / 2 + vx * 4;
        vectorMarker.y = y + h / 1/4 + vy * 4;
    };

    let shape = makePersonShape();

    let sign = (a: number) => a > 0 ? +1 : (a < 0 ? -1 : 0);

    let haste = function(dvx: number,dvy: number) {
        if (faceForward && dvx < 0) {
            faceForward = false;
            animation.scaleX *= -1;
        } else if (!faceForward && dvx > 0) {
            faceForward = true;
            animation.scaleX *= -1;
        }

        let isFalling = floorAlive === null;
        let mult = isFalling ? 0.50 : 1;
        vx += DVX * dvx * mult;
        if (!isFalling) {
            vy += DVY * dvy;
        }
        vx = sign(vx) * Math.min(MAX_VX, Math.abs(vx));
    };

    let getVector = (): [number, number] => floorAlive !== null
        ? vadd([vx, vy], floorAlive.getVector())
        : [vx, vy];

    let applyGravity = function()
    {
        if (shape.y >= floor()) {
            vy = 0;
            shape.y = floor();
        }

        shape.y < floor()
            ? vy += G
            : vx = Tls.toZero(vx, DVX / 2);

        if (floorAlive !== null && (
            floorAlive.isDead() ||
            shape.y !== floorAlive.getShape().y + floorAlive.getBounds()[1] ||
            shape.x + BOUNDS[0] + BOUNDS[2] < floorAlive.getShape().x + floorAlive.getBounds()[0] ||
            shape.x + BOUNDS[0] > floorAlive.getShape().x + floorAlive.getBounds()[0] + floorAlive.getBounds()[2]
        )) {
            let [fvx,fvy] = floorAlive.getVector();
            [vx,vy] = [vx + fvx / 10, vy + fvy / 10];
            floorAlive = null;
        }
    };

    let interactWith = function(collides: IGameObject[], prevPos: [number, number])
    {
        let [adx,ady,aw,ah] = BOUNDS;
        let [ax,ay] = vadd(prevPos, [adx,ady]);

        // resolves collision (does not allow unit walk through a wall)
        // current implementation has two major problems:
        // 1) it does not take into account that unit may collide with multiple walls in
        // same frame (say if you tried to go between =-like tunnel which is smaller than you)
        // 2) it does not handle walls with negative height/width properly

        collides.forEach(other => {
            let [bdx,bdy,bw,bh] = other.getBounds();
            let [bx,by] = vadd([other.getShape().x, other.getShape().y], [bdx,bdy]);

            if (ay + ah <= by) {
                // move this top
                shape.y = by - ady - ah;
                floorAlive = other;
                other.takeDamage(Math.sqrt(vy * vy + vx * vx) * 1.0);
                //vy = -Math.abs(vy);
            } else if (ay >= by + bh) {
                // move this bottom
                //vy = +Math.abs(vy);
                shape.y = by + bh - ady;
                vy = Math.max(0, vy);
                shape.x -= vx; // TODO: we should do moving _after_ collision resolution (foreseen) to avoid that
                changeHealth(-10);
            } else if (ax + aw <= bx) {
                // move this right
                shape.x = bx - adx - aw;
                // nullify velocity if moving towards the obstacle
                vx = Math.min(vx, 0);
            } else if (ax >= bx + bw) {
                // move this left
                shape.x = bx + bw - adx;
                // nullify velocity if moving towards the obstacle
                vx = Math.max(vx, 0);
            } else {
                console.log('should not happen!');
            }
        });
    };

    let live = function()
    {
        let producedChildren: IGameObject[] = [];

        applyGravity();
        updateVectorMarker();

        if (castingFireball) {
            castingFireball = false;
            if (changeMana(-33)) {
                let v = 2;
                let args = faceForward
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
        takeDamage: (n: number) => changeHealth(-n),
        getVector: getVector,
        serialize: () => 1 && {
            class: Person.name,
            args: [<valid_json_t>params],
        },

        // game logic methods
        haste: haste,
        fireball: () => castingFireball = true,
    };
}

let dummy = 0?Person(null):null;
export type IPerson = typeof dummy;
let dummy2: IGameObject = 0?Person(null):null;
