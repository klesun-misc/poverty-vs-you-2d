/**
 * this probably should be serialized into a JSON file...
 */

import {Person} from "./alive/Person";
import {Wall} from "./alive/Wall";
import {IGameObject} from "./alive/IGameObject";
import {Decor} from "./alive/Decor";

export let Level1 = function(floor: number) {

    let marioTrap = Wall([100, 300, 50, 50]);

    let text = new createjs.Text('Try this, Mario!', "20px Arial", "#ff7700");
    text.x = marioTrap.getShape().x - 200;
    text.y = marioTrap.getShape().y;
    text.textBaseline = "alphabetic";
    let textGobj = Decor(text);

    let arrow = new createjs.Shape();
    arrow.graphics.beginStroke('#c00')
        .beginFill('#c00').moveTo(-100, -10)
        .lineTo(0, 0).lineTo(-5, +5).lineTo(-5, -5).lineTo(0, 0);
    // arrow.rotation = 180;
    arrow.x = marioTrap.getShape().x - 20;
    arrow.y = marioTrap.getShape().y + 20;
    let arrowGobj = Decor(arrow);

    let level = {
        hero: Person({x: 100, y: floor}),
        enemy: Person({x: 600, y: floor}),
        wallMarioTrap: marioTrap,
        wallMarioTrapText: textGobj,
        wallMarioTrapArrow: arrowGobj,
        wallFirstObstacle: Wall([300, 400, 200, 50]),
        wallFloorInitial: Wall([0, 475, 900, 10]),
        wallFloorAfterGap: Wall([1000, 475, 9000, 10]),
    };
    return level;
};
