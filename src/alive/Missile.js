define(["require", "exports"], function (require, exports) {
    var BOUNDS = [0, 0, 50, 10];
    var MAX_VX = 15;
    /** missile is (at least for now) a ball casted by
     * an IPerson, flying by a straight line, that
     * explodes and damages another IPerson on contact */
    function Missile(x, y, vx, vy) {
        var isDead = false;
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
            shape.x += vx;
            shape.y += vy;
            vx = Math.max(-MAX_VX, Math.min(vx * 1.075, MAX_VX));
            if (shape.x > 1000 || shape.x < 0 || shape.y > 500 || shape.y < 0) {
                isDead = true;
            }
        };
        var interactWith = function (other, prevPos) {
            isDead = true;
            other.takeDamage(40);
        };
        return {
            getShape: function () { return shape; },
            live: live,
            isDead: function () { return isDead; },
            producedChildren: [],
            getBounds: function () { return BOUNDS; },
            interactWith: interactWith,
            takeDamage: function () { return isDead = true; },
            getVector: function () { return [vx, vy]; }
        };
    }
    exports.Missile = Missile;
});
