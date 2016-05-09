
///<reference path="../libs/d.ts/easeljs.d.ts"/>

import DisplayObject = createjs.DisplayObject;
import {Person} from "./alive/Person";
import {Background} from "./Background";
import {IPerson} from "./alive/Person";
import {Kb} from "./KeyCodes";
import {IAlive} from "./alive/IAlive";

declare var Ns: any;

export type rect_t = [number, number, number, number];

var doIntersect = function(a: IAlive, b: IAlive)
{
    var [ax,ay,aw,ah] = a.getBounds();
    var [bx,by,bw,bh] = b.getBounds();

    ax += a.getShape().x;
    ay += a.getShape().y;

    bx += b.getShape().x;
    by += b.getShape().y;

    return (ax >= bx + bw || ax + aw <= bx
        || ay >= by + bh || ay + ah <= by)
        ? false
        : true;
};

export function MokonaGame(canvasEl: HTMLCanvasElement)
{
    /** dict of objects with method live()
     * the method returns true if something happened... my live would always return false =( */
    var elements: IAlive[] = [];
    var stage = new createjs.Stage(canvasEl);

    var addElement = function(element: IAlive)
    {
        elements.push(element);
        stage.addChild(element.getShape());

        return element;
    };

    var newFrame = function()
    {
        // not sure this slice() is ok for performance
        var idxShift = 0;
        elements.slice().forEach((el, i) => {
            if (!el.isDead()) {
                el.live();
                if (el.producedChildren.length) {
                    el.producedChildren
                        .splice(0,el.producedChildren.length)
                        .forEach(addElement);
                }

                elements.filter(other => el !== other && doIntersect(el, other))
                    .forEach(o => el.interactWith(o))
            } else {
                stage.removeChild(el.getShape());
                elements.splice(i + idxShift--, 1);
            }
        });
        stage.update();
    };

    var handlerDict: {[k: number]: () => void} = {};
    document.onkeydown = (e) =>
        e.keyCode in handlerDict && handlerDict[e.keyCode]();

    var listenKey = (n: number,cb: () => void) => (handlerDict[n] = cb);
    var floor = () => canvasEl.height - 20;

    var initKeyHandlers = function(hero: IPerson)
    {
        listenKey(Kb.LEFT, () => hero.haste(-1,0)); // left
        listenKey(Kb.UP, () => hero.haste( 0,-1)); // up
        listenKey(Kb.RIGHT, () => hero.haste(+1,0)); // right
        listenKey(Kb.SPACE, hero.fireball); // space
    };

    var start = function()
    {
        createjs.Ticker.framerate = 24;
        createjs.Ticker.addEventListener('tick', newFrame);

        stage.addChild(Background());
        var hero = Person({x: 100, y: floor(), floor: floor}, true);

        addElement(hero);
        var villain = addElement(Person({x: 600, y: floor(), floor: floor}));

        initKeyHandlers(hero);
    };

    return {
        start: start
    };
};