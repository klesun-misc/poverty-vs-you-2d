define(["require", "exports"], function (require, exports) {
    var BOUNDS = [0, 0, 10, 10];
    /* an Obstacle is rectangular unchangeable object that person can
     * stand on also blocks path. you can not go through an Obstacle
     * nor from left, nor from right, nor from bottom*/
    function Obstacle(x, y, w, h) {
        var makeShape = function () {
            var shape = new createjs.Shape();
            shape.graphics.ss(4)
                .beginStroke('#0f0').drawRect(0, 0, w, h);
            shape.x = x;
            shape.y = y;
            return shape;
        };
        var shape = makeShape();
        return {
            getShape: function () { return shape; },
            getBounds: function () { return [0, 0, w, h]; },
            producedChildren: [],
            live: function () { },
            isDead: function () { return false; },
            interactWith: function () { },
            takeDamage: function () { },
            getVector: function () { return [0, 0]; }
        };
    }
    exports.Obstacle = Obstacle;
});
