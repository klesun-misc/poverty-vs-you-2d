
///<reference path="../libs/d.ts/easeljs.d.ts"/>
///<reference path="../libs/d.ts/jquery.d.ts"/>

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

export function MokonaGame(canvasEl: HTMLCanvasElement, editorPalette: HTMLFieldSetElement)
{
    /** dict of objects with method live()
     * the method returns true if something happened... my live would always return false =( */
    var elements: IAlive[] = [];
    var stage = new createjs.Stage(canvasEl);
    var background = Background();

    var addElement = function(element: IAlive)
    {
        elements.push(element);
        stage.addChild(element.getShape());

        return element;
    };

    var removeElement = function(element: IAlive)
    {
        stage.removeChild(element.getShape());
        elements.splice(elements.indexOf(element), 1);
    };

    var newFrame = function()
    {
        // not sure this slice() is ok for performance
        var idxShift = 0;
        elements.slice().forEach((el, i) => {

            if (!el.isDead()) {
                var prevPos: [number, number] = [el.getShape().x, el.getShape().y];

                el.getShape().x += el.getVector()[0];
                el.getShape().y += el.getVector()[1];

                el.live().forEach(addElement);

                /** @debug */
                if (elements.filter(other => el !== other && doIntersect(el, other)).length > 1) {
                    console.log('sejchas zastranet');
                }

                var collides = elements.filter(other =>
                    el !== other && doIntersect(el, other));

                el.interactWith(collides, prevPos);
            } else {
                stage.removeChild(el.getShape());
                elements.splice(i + idxShift--, 1);
            }
        });
        stage.update();
    };

    var moveCam = function(dx: number, dy: number)
    {
        background.x -= dx / 2;
        background.y -= dy / 2;

        elements.forEach(a => {
            var sh = a.getShape();
            sh.x -= dx;
            sh.y -= dy;
        });
    };

    /** @debug */
    console.log(123);

    var handlerDict: {[k: number]: () => void} = {};
    canvasEl.onkeydown = (e) => e.keyCode in handlerDict && handlerDict[e.keyCode]();

    var listenKey = (n: number,cb: () => void) => handlerDict[n] = cb;
    var floor = () => canvasEl.height - 20;

    var handleMouseUp = function(x: number, y: number)
    {
    };

    var handleMouseMove = function(x: number, y: number)
    {
    };

    const handleMouseDown = function(x0: number, y0: number)
    {
        canvasEl.focus();
        var selectedTool = $(editorPalette).find('input[name="selectedTool"]:checked').val();

        if (selectedTool === 'draw') {
            var currentObs = addElement(Obstacle(x0, y0, 5, 5));
            var finished = false;

            handleMouseMove = (x1, y1) => {
                if (!finished) {
                    removeElement(currentObs);
                    currentObs = addElement(Obstacle(x0, y0, x1 - x0, y1 - y0));
                }
            };

            handleMouseUp = () => finished = true;
        }
    };

    var initKeyHandlers = function(hero: IPerson)
    {
        listenKey(Kb.LEFT, () => hero.haste(-1,0)); // left
        listenKey(Kb.UP, () => hero.haste( 0,-1)); // up
        listenKey(Kb.RIGHT, () => hero.haste(+1,0)); // right
        listenKey(Kb.SPACE, hero.fireball); // space

        listenKey(Kb.NUMPAD6, () => moveCam(+10,0));
        listenKey(Kb.NUMPAD4, () => moveCam(-10,0));
        listenKey(Kb.NUMPAD8, () => moveCam(0,-10));
        listenKey(Kb.NUMPAD5, () => moveCam(0,+10));

        canvasEl.onmousedown = (e) => e.which === 1 && handleMouseDown(
            e.clientX - $(canvasEl).offset().left,
            e.clientY - $(canvasEl).offset().top
        );
        canvasEl.onmouseup = (e) => e.which === 1 && handleMouseUp(
            e.clientX - $(canvasEl).offset().left,
            e.clientY - $(canvasEl).offset().top
        );
        canvasEl.onmousemove = (e) => handleMouseMove(
            e.clientX - $(canvasEl).offset().left,
            e.clientY - $(canvasEl).offset().top
        );

        setTimeout(() => canvasEl.focus(), 200);
    };

    // supposed to read file with level data.
    // for now just creates hardcoded setup
    var fillStage = function()
    {
        var villain = addElement(Person({x: 600, y: floor()}));
        var flyingBlock = addElement(Obstacle(300, 400,200, 50));
        var flyingBlock2 = addElement(Obstacle(100, 300,50, 50));
        var floorBlock = addElement(Obstacle(0, 475,900, 10));
    };

    var start = function()
    {
        stage.addChild(background);
        var hero = Person({x: 100, y: floor()});

        createjs.Ticker.framerate = 24;
        createjs.Ticker.addEventListener('tick', () => {
            newFrame();

            var sh = hero.getShape();
            var [dx,dy,w,h] = hero.getBounds();
            var heroX = sh.x + dx + w / 2;
            var camCenter = 500;
            if (Math.abs(camCenter - heroX) >= 1) {
                moveCam(heroX - camCenter, 0);
            }
        });

        addElement(hero);

        fillStage();

        initKeyHandlers(hero);
    };

    return {
        start: start
    };
};