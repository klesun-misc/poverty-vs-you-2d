define(["require", "exports"], function (require, exports) {
    /* an Obstacle is rectangular unchangeable object that person can
     * stand on also blocks path. you can not go through an Obstacle
     * nor from left, nor from right, nor from bottom*/
    function Obstacle(x, y, w, h) {
        var makeShape = function () {
            var shape = new createjs.Shape();
            shape.graphics.ss(4)
                .beginFill('#ccc').drawRect(0, 0, w, h)
                .beginStroke('#444').drawRect(0, 0, w, h);
            shape.x = x;
            shape.y = y;
            return shape;
        };
        var shape = makeShape();
        return {
            getShape: function () { return shape; },
            getBounds: function () { return [0, 0, w, h]; },
            live: function () { return []; },
            isDead: function () { return false; },
            interactWith: function () { },
            takeDamage: function () { },
            getVector: function () { return [0, 0]; }
        };
    }
    exports.Obstacle = Obstacle;
});
