
///<reference path="../../../libs/dts/easeljs/index.d.ts"/>
///<reference path="../../../libs/dts/jquery.d.ts"/>

import DisplayObject = createjs.DisplayObject;
import {Person} from "./alive/Person";
import {Background, IBackground} from "./Background";
import {IPerson} from "./alive/Person";
import {Kb} from "./KeyCodes";
import {IGameObject} from "./alive/IGameObject";
import {Wall} from "./alive/Wall";
import {Level1} from "./Level1";
import {S} from "../../../src/utils/S";
import {Decor} from "./alive/Decor";
import { Gui } from "./Gui";

export type rect_t = [number, number, number, number];

let t4 = <T1,T2,T3,T4>(a:T1,b:T2,c:T3,d:T4): [T1,T2,T3,T4] => [a,b,c,d];

/** normalizes rect with negative width/height */
let normRect = function([x,y,w,h]: number[]) {
    if (w < 0) {
        x += w;
        w = -w;
    }
    if (h < 0) {
        y += h;
        h = -h;
    }

    return t4(x,y,w,h);
};

let doIntersect = function(a: IGameObject, b: IGameObject)
{
    let [ax,ay,aw,ah] = normRect(a.getBounds());
    let [bx,by,bw,bh] = normRect(b.getBounds());

    ax += a.getShape().x;
    ay += a.getShape().y;

    bx += b.getShape().x;
    by += b.getShape().y;

    return (ax >= bx + bw || ax + aw <= bx
        || ay >= by + bh || ay + ah <= by)
        ? false
        : true;
};

export function MokonaGame(canvasEl: HTMLCanvasElement, editorPalette: HTMLFieldSetElement)
{
    let gui = Gui(canvasEl, editorPalette);

    /** dict of objects with method live()
     * the method returns true if something happened... my live would always return false =( */
    let elements: IGameObject[] = [];
    let stage = new createjs.Stage(canvasEl);
    // stage.addChild(Background(0)); // sun and sky
    let backgrounds: IBackground[] = [
        // Background(0.1, true),
        // Background(0.2, true),
        // Background(0.31, true),
        // Background(0.4, true),
        // Background(0.5, true),
        // Background(0.6, true),
    ];
    backgrounds.slice().reverse().forEach(b => stage.addChild(b));

    let addGameObject = function(element: IGameObject)
    {
        elements.push(element);
        stage.addChild(element.getShape());

        return element;
    };

    let removeElement = function(element: IGameObject)
    {
        stage.removeChild(element.getShape());
        elements.splice(elements.indexOf(element), 1);
    };

    let newFrame = function()
    {
        // not sure this slice() is ok for performance
        let idxShift = 0;
        elements.slice().forEach((el, i) => {

            if (!el.isDead()) {
                let prevPos: [number, number] = [el.getShape().x, el.getShape().y];

                el.getShape().x += el.getVector()[0];
                el.getShape().y += el.getVector()[1];
                el.live().forEach(addGameObject);

                let collides = elements.filter(other =>
                    el !== other && doIntersect(el, other));

                el.interactWith(collides, prevPos);
            } else {
                stage.removeChild(el.getShape());
                elements.splice(i + idxShift--, 1);
            }
        });
        stage.update();
    };

    let moveCam = function(dx: number, dy: number)
    {
        backgrounds.forEach((b,i) => {
            b.x -= dx / (i + 2);
            b.y -= dy / (i + 2);
        });

        elements.forEach(a => {
            let sh = a.getShape();
            sh.x -= dx;
            sh.y -= dy;
        });
    };

    let floor = () => canvasEl.height - 20;
    let initKeyHandlers = function(hero: IPerson)
    {
        gui.listenKey('Space', hero.fireball); // space

        gui.listenKey('Numpad6', () => moveCam(+10,0));
        gui.listenKey('Numpad4', () => moveCam(-10,0));
        gui.listenKey('Numpad8', () => moveCam(0,-10));
        gui.listenKey('Numpad5', () => moveCam(0,+10));

        gui.drag = (x0, y0) => {
            if (gui.selectedTool === 'draw') {
                let currentObs = addGameObject(Wall([x0, y0, 5, 5]));
                return (x1,y1) => {
                    removeElement(currentObs);
                    currentObs = addGameObject(Wall(normRect([x0, y0, x1 - x0, y1 - y0])));
                };
            } else {
                return () => {};
            }
        };

        gui.export = () => {
            alert('TODO: IMPLEMENT!');
        };

        setTimeout(() => canvasEl.focus(), 200);
        return () => {
            if (gui.isPressed('ArrowLeft')) hero.haste(-1,0);
            if (gui.isPressed('ArrowUp')) hero.haste( 0,-1);
            if (gui.isPressed('ArrowRight')) hero.haste(+1,0);
        };
    };

    // supposed to read file with level data.
    // for now just creates hardcoded setup
    let fillStage = function()
    {
        let level = Level1(floor());
        for (let [name, alive] of Object.entries(level)) {
            addGameObject(alive);
        }
        return level;
    };

    let start = function()
    {
        let level = fillStage();
        let hero = level.hero;

        let handleKeys = initKeyHandlers(hero);

        createjs.Ticker.framerate = 24;
        createjs.Ticker.addEventListener('tick', () => {
            handleKeys();
            newFrame();

            let sh = hero.getShape();
            let [dx,dy,w,h] = hero.getBounds();
            let heroX = sh.x + dx + w / 2;
            let heroY = sh.y + dy + h / 2;
            let camCenterX = 500;
            let camCenterY = 300;

            if (Math.abs(camCenterX - heroX) >= 1 ||
                Math.abs(camCenterY - heroY) >= 1
            ) {
                moveCam(heroX - camCenterX, heroY - camCenterY);
            }
        });
    };

    return {
        start: start
    };
};
