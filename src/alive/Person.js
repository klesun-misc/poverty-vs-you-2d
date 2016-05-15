///<reference path="../../libs/d.ts/easeljs.d.ts"/>
define(["require", "exports", "./../Tools", "./Missile", "../Tools"], function (require, exports, Tools_1, Missile_1, Tools_2) {
    var MAX_VX = 10;
    var DVX = 3;
    var DVY = 30;
    var G = 4;
    var HEIGHT = 75;
    var WIDTH = 55;
    var BOUNDS = [-WIDTH / 2 - WIDTH * 10 / 55, -HEIGHT * 9 / 10, WIDTH * 16 / 55, HEIGHT * 9 / 10];
    function Person(params) {
        var floorAlive = null;
        var floor = function () { return floorAlive !== null
            ? floorAlive.getShape().y + floorAlive.getBounds()[1]
            : 999999999999999999; };
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
        vectorMarker.graphics.beginFill('#ff0').drawCircle(0, 0, 3);
        vectorMarker.alpha = 0.4;
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
        animation.regX = 30;
        var faceForward = true;
        var isDead = false;
        var changeMana = function (n) {
            if (mana + n >= 0 && mana + n <= 100) {
                mana += n;
                manaBar.graphics.clear().beginFill('#44f')
                    .rect(BOUNDS[0] - WIDTH / 8, -HEIGHT - 5, mana / 100 * WIDTH / 2, 5);
                return true;
            }
            else {
                return false;
            }
        };
        var changeHealth = function (n) {
            health += n;
            healthBar.graphics.clear().beginFill('#f00')
                .rect(BOUNDS[0] - WIDTH / 8, -HEIGHT - 12, health / 100 * WIDTH / 2, 5);
            if (health <= 0) {
                isDead = true;
            }
        };
        var makePersonShape = function () {
            var cont = new createjs.Container();
            animation.x = -WIDTH * 6 / 11;
            animation.y = -HEIGHT;
            cont.addChild(animation);
            var aura = new createjs.Shape();
            var x = BOUNDS[0], y = BOUNDS[1], w = BOUNDS[2], h = BOUNDS[3];
            aura.graphics.beginStroke('#88f').rect(x, y, w, h);
            cont.addChild(aura);
            cont.addChild(healthBar);
            cont.addChild(manaBar);
            cont.addChild(vectorMarker);
            cont.x = params.x || 50;
            cont.y = params.y || 50;
            return cont;
        };
        var updateVectorMarker = function () {
            var x = BOUNDS[0], y = BOUNDS[1], w = BOUNDS[2], h = BOUNDS[3];
            vectorMarker.x = x + w / 2 + vx * 4;
            vectorMarker.y = y + h / 1 / 4 + vy * 4;
        };
        var shape = makePersonShape();
        var haste = function (dvx, dvy) {
            if (faceForward && dvx < 0) {
                faceForward = false;
                animation.scaleX *= -1;
            }
            else if (!faceForward && dvx > 0) {
                faceForward = true;
                animation.scaleX *= -1;
            }
            boostX = dvx;
            boostY = dvy;
        };
        var getVector = function () { return floorAlive !== null
            ? Tools_2.vadd([vx, vy], floorAlive.getVector())
            : [vx, vy]; };
        var applyGravity = function () {
            if (shape.y >= floor()) {
                vy = 0;
                shape.y = floor();
            }
            shape.y < floor()
                ? vy += G
                : vx = Tools_1.Tls.toZero(vx, DVX / 2);
            if (floorAlive !== null && (floorAlive.isDead() ||
                shape.y !== floorAlive.getShape().y + floorAlive.getBounds()[1] ||
                shape.x + BOUNDS[0] + BOUNDS[2] < floorAlive.getShape().x + floorAlive.getBounds()[0] ||
                shape.x + BOUNDS[0] > floorAlive.getShape().x + floorAlive.getBounds()[0] + floorAlive.getBounds()[2])) {
                var _a = floorAlive.getVector(), fvx = _a[0], fvy = _a[1];
                _b = [vx + fvx / 10, vy + fvy / 10], vx = _b[0], vy = _b[1];
                floorAlive = null;
            }
            if (floorAlive !== null) {
                boostX && Math.abs(vx) <= MAX_VX && (vx += DVX * boostX);
                boostX = 0;
                vy += DVY * boostY;
                boostY = 0;
            }
            else {
                boostX = boostY = 0;
            }
            var _b;
        };
        var interactWith = function (collides, prevPos) {
            var adx = BOUNDS[0], ady = BOUNDS[1], aw = BOUNDS[2], ah = BOUNDS[3];
            var _a = Tools_2.vadd(prevPos, [adx, ady]), ax = _a[0], ay = _a[1];
            collides.forEach(function (other) {
                var _a = other.getBounds(), bdx = _a[0], bdy = _a[1], bw = _a[2], bh = _a[3];
                var _b = Tools_2.vadd([other.getShape().x, other.getShape().y], [bdx, bdy]), bx = _b[0], by = _b[1];
                if (ay + ah <= by) {
                    // move this top
                    shape.y = by - ady - ah;
                    floorAlive = other;
                }
                else if (ay >= by + bh) {
                    // move this bottom
                    //vy = +Math.abs(vy);
                    shape.y = by + bh - ady;
                    vy = Math.max(0, vy);
                    shape.x -= vx; // TODO: we should do moving _after_ collision resolution (foreseen) to avoid that
                    changeHealth(-10);
                }
                else if (ax + aw <= bx) {
                    // move this left
                    //vx = -Math.abs(vx);
                    shape.x = bx - adx - aw;
                }
                else if (ax >= bx + bw) {
                    // move this right
                    //vx = +Math.abs(vx);
                    shape.x = bx + bw - adx;
                }
                else {
                    console.log('should not happen!');
                }
            });
        };
        var live = function () {
            var producedChildren = [];
            applyGravity();
            updateVectorMarker();
            if (castingFireball) {
                castingFireball = false;
                if (changeMana(-33)) {
                    var v = 2;
                    var args = faceForward
                        ? [shape.x + BOUNDS[0] - 50 - 10, shape.y - HEIGHT * 3 / 4, v, 0]
                        : [shape.x + BOUNDS[0] + BOUNDS[2] + 10, shape.y - HEIGHT * 3 / 4, -v, 0];
                    producedChildren.push(Missile_1.Missile.apply(this, args));
                }
                else {
                    alert('Out of mana');
                }
            }
            changeMana(1);
            return producedChildren;
        };
        return {
            live: live,
            getShape: function () { return shape; },
            isDead: function () { return isDead; },
            getBounds: function () { return BOUNDS; },
            interactWith: interactWith,
            takeDamage: function (n) { return changeHealth(-n); },
            getVector: getVector,
            // game logic methods
            haste: haste,
            fireball: function () { return castingFireball = true; }
        };
    }
    exports.Person = Person;
    ;
});
