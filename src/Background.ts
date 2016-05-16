
///<reference path="../libs/d.ts/easeljs.d.ts"/>

import {Tls} from "./Tools";
interface IHouse {
    distance: number,
    draw: () => void,
}

export function Background(offsetKoef: number, onlyHouses?: boolean)
{
    onlyHouses = onlyHouses || false;

    /** @params l - left index inclusive, r - right index exclusive */
    var range = (l: number, r: number): Array<number> =>
        Array.apply(null, Array(r - l)).map((nop: void, i: number) => l + i);

    var bg = new createjs.Container();

    var bgcolor = new createjs.Shape();
    bgcolor.graphics.beginFill('#90efff').rect(0,0,1920,1080).endFill();

    var makeRoad = function()
    {
        var street = new createjs.Container();
        var road = new createjs.Shape();
        street.addChild(road);

        // mid of canvas, for now hardcoded TODO: make it variable
        var w = 1000, h = 500;

        var voidPoint = {x: w / 2, y: h / 2};

        var houses: IHouse[] = [];

        var divCount = 50;
        var lastX: number = null;
        range(0, divCount).forEach(function(i)
        {
            var x1 = w * (i * 4 / divCount) - 1 * w;
            var x2 = w * ((i + 1) * 4 / divCount) - 1 * w;

            var x = x2;

            onlyHouses || road.graphics.beginStroke('#ccc').beginFill('#bbb')
                .moveTo(voidPoint.x, voidPoint.y)
                .lineTo(x1, h)
                .lineTo(x2, h)
                .endFill().endStroke();

            if (lastX !== null) {
                var lineHouseCount = Math.random() * 1.5 | 0;
                range(0, lineHouseCount).forEach(function(j)
                {
                    var minDistance = 0.3;
                    var maxDistance = 0.9;
                    //var distance = Math.random() * (maxDistance - minDistance) + minDistance;
                    var distance = offsetKoef;

                    var x1 = lastX - (lastX - voidPoint.x) * distance;
                    var y1 = h - (h - voidPoint.y) * distance;
                    var wh = (x - lastX) * (1 - distance) * (Math.random() > 0.5 ? 2 : 1);
                    var hh = (300 + Math.random() * 300) * (1 - distance);

                    var offset = (distance - minDistance) / (maxDistance - minDistance);
                    var color = '#' + Tls.getBetween([192,192,192], [32,32,32], distance)
                            .map(n => n.toString(16)).join('');

                    houses.push({
                        distance: distance,
                        draw: function() {
                            var house = new createjs.Shape();
                            street.addChild(house);
                            house.x = x1; house.y = h;
                            house.graphics.beginStroke('#ccc').beginFill(color).rect(0,0,wh,-hh);
                        }
                    });
                });
            }
            lastX = x;
        });

        onlyHouses && houses.sort((h1,h2) => h2.distance - h1.distance).forEach(h => h.draw());
        //street.cache(0,0,w,h);
        //street.y = 0;

        return street;
    };

    var makeSun = function()
    {
        var sun = new createjs.Shape();

        var x0: number, y0: number, r = 500;
        x0 = y0 = 70;

        var rayCount = 24;
        for (var i = 0; i < rayCount; ++i)
        {
            var angle = (i / rayCount) * 2 * Math.PI;
            var x = Math.sin(angle) * r;
            var y = Math.cos(angle) * r;

            sun.graphics.moveTo(0,0).beginStroke('#f88').drawCircle(x, y, r);
            sun.x = x0; sun.y = y0;
        }

        var blurFilter = new createjs.BlurFilter(40,40,1);
        sun.filters = [blurFilter];
        sun.cache(-100, -100, 1000, 500);

        return sun;
    };

    onlyHouses || bg.addChild(bgcolor);
    onlyHouses || range(0,15).forEach(i => bg.addChild(makeSun()));

    bg.addChild(makeRoad());

    //bg.cache(0, 0, 1000, 500);

    return bg;
};
