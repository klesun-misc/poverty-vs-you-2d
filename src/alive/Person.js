///<reference path="../../libs/d.ts/easeljs.d.ts"/>
define(["require", "exports", "./../Tools", "./Missile"], function (require, exports, Tools_1, Missile_1) {
    function Person(params, isHero) {
        var floor = params.floor;
        isHero = isHero || false;
        var MAX_VX = 10;
        var DVX = 2;
        var DVY = 30;
        var G = 4;
        var boostX = 0;
        var boostY = 0;
        var castingFireball = false;
        var vx = 0;
        var vy = -20;
        var HEIGHT = 75;
        var WIDTH = 55;
        // game logic info
        var health = 100;
        var mana = 100;
        var isAlive = true;
        var producedChildren = [];
        var makePersonShape = function () {
            var cont = new createjs.Container();
            var spriteSheet = new createjs.SpriteSheet({
                images: ['imgs/run_sprite/spritesheet.png'],
                frames: { width: WIDTH, height: HEIGHT },
                animations: {
                    run: {
                        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                        speed: 0.5
                    }
                },
                framerate: 45
            });
            var animation = new createjs.Sprite(spriteSheet, 'run');
            animation.x = -WIDTH * 6 / 11;
            animation.y = -HEIGHT;
            cont.addChild(animation);
            var aura = new createjs.Shape();
            var r = 8; // head radius
            var t = r * 4; // torso length
            //
            //shape.graphics
            //    .beginFill('#f00').drawCircle(0, -t * 2 - r, r) // head
            //    .beginFill(isHero ? '#f80' : 'black').rect(-r, -t * 2, r * 2, t) // torso
            //    .beginFill('#00f').rect(-r, -t, r * 2/3, t) // leg 1
            //    .beginFill('#00f').rect(r * 1/3, -t, r * 2/3, t); // leg 2
            //
            //shape.graphics.beginFill('#ff0').rect(-1, -1, 2, 2);
            aura.graphics.endFill().beginStroke('#88f').rect(-r, -2 * t - 2 * r, r * 2, r * 2 + t * 2);
            cont.addChild(aura);
            cont.x = params.x || 50;
            cont.y = params.y || 50;
            return cont;
        };
        var shape = makePersonShape();
        var haste = function (dvx, dvy) {
            if (shape.y === floor()) {
                boostX = dvx;
                boostY = dvy;
            }
        };
        var applyGravity = function () {
            var lived = false;
            //var was = [shape.x, shape.y];
            vx += DVX * boostX;
            boostX = 0;
            vy += DVY * boostY;
            boostY = 0;
            if (vx || vy || shape.y < floor()) {
                shape.x += vx;
                shape.y += vy;
                shape.y < floor()
                    ? vy += G
                    : vx = Tools_1.Tls.lim(Tools_1.Tls.toZero(vx, DVX / 2), -MAX_VX, MAX_VX);
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
        var live = function () {
            applyGravity();
            if (castingFireball) {
                castingFireball = false;
                producedChildren.push(Missile_1.Missile(shape.x, shape.y - HEIGHT * 3 / 4, 15, 0));
            }
        };
        return {
            live: live,
            getShape: function () { return shape; },
            isDead: function () { return false; },
            producedChildren: producedChildren,
            // game logic methods
            haste: haste,
            fireball: function () { return castingFireball = true; }
        };
    }
    exports.Person = Person;
    ;
});
