define(["require", "exports"], function (require, exports) {
    /** missile is (at least for now) a ball casted by
     * an IPerson, flying by a straight line, that
     * explodes and damages another IPerson on contact */
    function Missile(x, y, vx, vy) {
        var isDead = false;
        var makeShape = function () {
            var shape = new createjs.Shape();
            shape.graphics
                .beginFill('#0f0').drawCircle(0, 0, 5);
            shape.x = x;
            shape.y = y;
            return shape;
        };
        var shape = makeShape();
        var live = function () {
            shape.x += vx;
            shape.y += vy;
            if (shape.x > 1000 || shape.x < 0 || shape.y > 500 || shape.y < 0) {
                isDead = true;
            }
        };
        return {
            getShape: function () { return shape; },
            live: live,
            isDead: function () { return isDead; },
            producedChildren: []
        };
    }
    exports.Missile = Missile;
});