///<reference path="../../libs/d.ts/easeljs.d.ts"/>
define(["require", "exports", "./../Tools", "./Missile"], function (require, exports, Tools_1, Missile_1) {
    var MAX_VX = 7.5;
    var DVX = 2;
    var DVY = 30;
    var G = 4;
    var HEIGHT = 75;
    var WIDTH = 55;
    var BOUNDS = [-WIDTH * 8 / 55, -HEIGHT, WIDTH * 16 / 55, HEIGHT];
    function Person(params, isHero) {
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
        var producedChildren = [];
        var changeMana = function (n) {
            if (mana + n >= 0 && mana + n <= 100) {
                mana += n;
                manaBar.graphics.clear().beginFill('#44f')
                    .rect(-WIDTH / 4, -HEIGHT - 5, mana / 100 * WIDTH / 2, 5);
                return true;
            }
            else {
                return false;
            }
        };
        var changeHealth = function (n) {
            health += n;
            healthBar.graphics.clear().beginFill('#f00')
                .rect(-WIDTH / 4, -HEIGHT - 12, health / 100 * WIDTH / 2, 5);
            if (health <= 0) {
                isDead = true;
            }
        };
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
            var x = BOUNDS[0], y = BOUNDS[1], w = BOUNDS[2], h = BOUNDS[3];
            aura.graphics.beginStroke('#88f').rect(x, y, w, h);
            cont.addChild(aura);
            cont.addChild(healthBar);
            cont.addChild(manaBar);
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
                if (changeMana(-33)) {
                    producedChildren.push(Missile_1.Missile(shape.x + WIDTH / 3, shape.y - HEIGHT * 3 / 4, 15, 0));
                }
                else {
                    alert('Out of mana');
                }
            }
            changeMana(1);
        };
        var interactWith = function (other) {
            console.log('Person pushed someone', other);
        };
        return {
            live: live,
            getShape: function () { return shape; },
            isDead: function () { return isDead; },
            producedChildren: producedChildren,
            getBounds: function () { return BOUNDS; },
            interactWith: interactWith,
            takeDamage: function (n) { return changeHealth(-n); },
            // game logic methods
            haste: haste,
            fireball: function () { return castingFireball = true; }
        };
    }
    exports.Person = Person;
    ;
});
