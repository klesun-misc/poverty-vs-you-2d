
///<reference path="../libs/d.ts/easeljs.d.ts"/>

import DisplayObject = createjs.DisplayObject;
import {Person} from "./Person";
import {Background} from "./Background";

declare var Ns: any;

export function MokonaGame(canvasEl: HTMLCanvasElement)
{
    /** dict of objects with method live()
     * the method returns true if something happened... my live would always return false =( */
    var elements: IElement[] = [];

    var stage = new createjs.Stage(canvasEl);
    setInterval(() => {
        elements.forEach(el => el.live());
        stage.update();
    }, 40);
    //setInterval(() => elements.reduce((a,b) => a.live() | b.live()) && stage.update(), 40);

    var handlerDict: {[k: number]: () => void} = {};
    document.onkeydown = (e) =>
        e.keyCode in handlerDict && handlerDict[e.keyCode]();

    var handleKey = (n: number,cb: () => void) => (handlerDict[n] = cb);
    var floor = () => canvasEl.height - 20;

    var addElement = function(element: IElement)
    {
        elements.push(element);
        stage.addChild(element.getShape());

        return element;
    };

    var initKeyHandlers = function(hero: IPerson)
    {
        handleKey(37, () => hero.haste(-1,0));
        handleKey(38, () => hero.haste( 0,-1));
        handleKey(39, () => hero.haste(+1,0));
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

interface IElement {
    getShape: () => DisplayObject,
    live: () => void,
}

interface IPerson extends IElement {
    haste: (dvx: number, dvy: number) => void;
}