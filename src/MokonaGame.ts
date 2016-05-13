
///<reference path="../libs/d.ts/easeljs.d.ts"/>

import DisplayObject = createjs.DisplayObject;
import {Person} from "./alive/Person";
import {Background} from "./Background";
import {IPerson} from "./alive/Person";
import {Kb} from "./KeyCodes";
import {IAlive} from "./alive/IAlive";
import {Obstacle} from "./alive/Obstacle";

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
                var prevPos: [number, number] = [el.getShape().x, el.getShape().y];

                el.live().forEach(addElement);

                elements.filter(other => el !== other && doIntersect(el, other))
                    .forEach(o => el.interactWith(o, prevPos));
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

    // supposed to read file with level data.
    // for now just creates hardcoded setup
    var fillStage = function()
    {
        var villain = addElement(Person({x: 600, y: floor(), floor: floor}));
        var flyingBlock = addElement(Obstacle(300, 400,200, 50));
        var flyingBlock2 = addElement(Obstacle(100, 300,50, 50));
        var floorBlock = addElement(Obstacle(0, 475,900, 10));
    };

    var start = function()
    {
        createjs.Ticker.framerate = 24;
        createjs.Ticker.addEventListener('tick', newFrame);

        stage.addChild(Background());
        var hero = Person({x: 100, y: floor(), floor: floor});
        addElement(hero);

        fillStage();

        initKeyHandlers(hero);
    };

    return {
        start: start
    };
};