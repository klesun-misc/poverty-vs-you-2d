///<reference path="../../libs/d.ts/easeljs.d.ts"/>

import {Tls} from "./../Tools";
import {IAlive} from "./IAlive";
import {IMissile} from "./Missile";
import {Missile} from "./Missile";
import {rect_t} from "../MokonaGame";

interface IParams {
    // should return y position of floor
    floor: () => number,
    x?: number,
    y?: number,
}

const MAX_VX = 7.5;
const DVX = 2;
const DVY = 30;
const G = 4;

const HEIGHT = 75;
const WIDTH = 55;

const BOUNDS: rect_t = [-WIDTH * 8/55, -HEIGHT, WIDTH * 16/55, HEIGHT];

export function Person(params: IParams, isHero?: boolean): IPerson
{
    var floor = params.floor;
    isHero = isHero || false;

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

    var isDead = false;
    var producedChildren: IAlive[] = [];

    var changeMana = function(n: number)
    {
        if (mana + n >= 0 && mana + n <= 100) {
            mana += n;
            manaBar.graphics.clear().beginFill('#44f')
                .rect(-WIDTH / 4, -HEIGHT - 5, mana / 100 * WIDTH / 2, 5);
            return true;
        } else {
            return false;
        }
    };

    var changeHealth = function(n: number)
    {
        health += n;
        healthBar.graphics.clear().beginFill('#f00')
            .rect(-WIDTH / 4, -HEIGHT - 12, health/100 * WIDTH / 2, 5);

        if (health <= 0) {
            isDead = true;
        }
    };

    var makePersonShape = function()
    {
        var cont = new createjs.Container();

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
        animation.x = -WIDTH * 6/11;
        animation.y = -HEIGHT;

        cont.addChild(animation);

        var aura = new createjs.Shape();

        var [x,y,w,h] = BOUNDS;
        aura.graphics.beginStroke('#88f').rect(x,y,w,h);

        cont.addChild(aura);
        cont.addChild(healthBar);
        cont.addChild(manaBar);

        cont.x = params.x || 50;
        cont.y = params.y || 50;

        return cont;
    };

    var shape = makePersonShape();

    var haste = function(dvx: number,dvy: number) {
        if (shape.y === floor()) {
            boostX = dvx;
            boostY = dvy;
        }
    };

    var applyGravity = function()
    {
        var lived = false;
        //var was = [shape.x, shape.y];

        vx += DVX * boostX; boostX = 0;
        vy += DVY * boostY; boostY = 0;

        if (vx || vy || shape.y < floor()) {
            shape.x += vx;
            shape.y += vy;
            shape.y < floor()
                ? vy += G
                : vx = Tls.lim(Tls.toZero(vx, DVX / 2), -MAX_VX, MAX_VX);


            if (shape.y >= floor()) {
                vy = 0;
                shape.y = floor();
            }
            if (shape.x < 0) {
                vx = 0;
                shape.x = 0;
            }

            lived = true;
        }

        //var lived = [shape.x, shape.y].some((e,i) => e != was[i]);
        return lived;
    };

    var live = function()
    {
        applyGravity();
        if (castingFireball) {
            castingFireball = false;
            if (changeMana(-33)) {
                producedChildren.push(Missile(shape.x + WIDTH / 3, shape.y - HEIGHT * 3 / 4, 15, 0));
            } else {
                alert('Out of mana');
            }
        }

        changeMana(1);
    };

    var interactWith = function(other: IAlive)
    {
        console.log('Person pushed someone', other);
    };

    return {
        live: live,
        getShape: () => shape,
        isDead: () => isDead,
        producedChildren: producedChildren,
        getBounds: () => BOUNDS,
        interactWith: interactWith,
        takeDamage: (n) => changeHealth(-n),

        // game logic methods
        haste: haste,
        fireball: () => castingFireball = true,
    };
};

export interface IPerson extends IAlive {
    haste: (dvx: number, dvy: number) => void,
    fireball: () => void,
}