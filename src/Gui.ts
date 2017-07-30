
import { Dom } from "src/utils/Dom";
import { S } from "src/utils/S";

export let Gui = function(canvasEl: HTMLCanvasElement, editorPalette: HTMLFieldSetElement)
{
    let isDragging = false;
    let pressedKeys = new Set();
    let handlerDict: {[k: string]: () => void} = {};
    canvasEl.onkeydown = (e) => {
        S.opt(handlerDict[e.code]).get = f => f();
        pressedKeys.add(e.code);
    };
    canvasEl.onkeyup = (e) => pressedKeys.delete(e.code);
    canvasEl.onfocus = (e) => {
        isDragging = false;
        pressedKeys.clear();
    };
    canvasEl.onmouseup = (e) => {
        if (e.which === 1) {
            isDragging = false;
        }
    };

    return {
        get selectedTool() {
            return Dom.get(editorPalette).input('[name="selectedTool"]:checked')[0].value;
        },
        isPressed: (code: string) => pressedKeys.has(code),

        set export(f: () => void) {
            Dom.get(editorPalette).button('.export-level')[0].onclick = f;
        },
        listenKey: (n: string, cb: () => void) => handlerDict[n] = cb,
        set drag(down: (x0: number, y0: number) => (x1: number, y1: number) => void) {
            // which = 1, left mouse button
            canvasEl.onmousedown = (e) => {
                if (e.which === 1) {
                    canvasEl.focus();
                    isDragging = true;
                    let drag = down(
                        e.clientX - $(canvasEl).offset().left,
                        e.clientY - $(canvasEl).offset().top
                    );
                    canvasEl.onmousemove = (e) => {
                        if (isDragging) {
                            drag(
                                e.clientX - $(canvasEl).offset().left,
                                e.clientY - $(canvasEl).offset().top
                            );
                        }
                    };
                }
            };
        },
    };
};
