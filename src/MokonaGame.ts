
///<reference path="../libs/d.ts/easeljs.d.ts"/>

import DisplayObject = createjs.DisplayObject;
import {Person} from "./alive/Person";
import {Background} from "./Background";
import {IPerson} from "./alive/Person";
import {Kb} from "./KeyCodes";
import {IAlive} from "./alive/IAlive";

declare var Ns: any;

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

    setInterval(() => {
        // not sure this slice() is ok for performance
        elements.slice().forEach((el, i) => {
            if (!el.isDead()) {
                el.live();
                if (el.producedChildren.length) {
                    el.producedChildren
                        .splice(0,el.producedChildren.length)
                        .forEach(addElement);
                }
            } else {
                stage.removeChild(el.getShape());
                elements.splice(i, 1);
            }
        });
        stage.update();
    }, 40);
    //setInterval(() => elements.reduce((a,b) => a.live() | b.live()) && stage.update(), 40);

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
        //createjs.Ticker.setFPS(24);
        //createjs.Ticker.addEventListener('tick', _ => stage.update());

        stage.addChild(Background());
        var hero = Person({x: 100, y: floor(), floor: floor}, true);

        addElement(hero);
        var villain = addElement(Person({x: 200, y: floor(), floor: floor}));

        initKeyHandlers(hero);
    };

    return {
        start: start
    };
};