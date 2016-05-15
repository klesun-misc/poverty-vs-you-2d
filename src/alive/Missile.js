define(["require", "exports"], function (require, exports) {
    var BOUNDS = [0, 0, 50, 10];
    var MAX_VX = 15;
    /** missile is (at least for now) a ball casted by
     * an IPerson, flying by a straight line, that
     * explodes and damages another IPerson on contact */
    function Missile(x, y, vx, vy) {
        var isDead = false;
        var fuel = 600;
        var startVelocity = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
        var makeShape = function () {
            var shape = new createjs.Shape();
            var dx = BOUNDS[0], dy = BOUNDS[1], w = BOUNDS[2], h = BOUNDS[3];
            shape.graphics
                .beginFill('#ff0').drawRect(dx, dy, w, h);
            shape.x = x;
            shape.y = y;
            return shape;
        };
        var shape = makeShape();
        var live = function () {
            fuel -= Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
            shape.alpha = fuel / 600;
            vx = Math.max(-MAX_VX, Math.min(vx * 1.075, MAX_VX));
            if (fuel <= 0 || shape.x > 1000 || shape.x < 0 || shape.y > 500 || shape.y < 0) {
                isDead = true;
            }
            return [];
        };
        var interactWith = function (collides, prevPos) {
            if (collides.length > 0) {
                isDead = true;
                var v = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
                collides.forEach(function (c) { return c.takeDamage(4 * v); });
            }
        };
        return {
            getShape: function () { return shape; },
            live: live,
            isDead: function () { return isDead; },
            getBounds: function () { return BOUNDS; },
            interactWith: interactWith,
            takeDamage: function () { return isDead = true; },
            getVector: function () { return [vx, vy]; }
        };
    }
    exports.Missile = Missile;
});
