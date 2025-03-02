import { KEYMAP, NUMBER_OF_KEYS } from "./Constants/KeyboardConstants.js";

export class Keyboard {
    constructor() {
        this.keyPressed = new Array(NUMBER_OF_KEYS).fill(false);
        this.onNextKeyPress = null;

        window.addEventListener("keydown", (event) => this.onKeyDown(event));
        window.addEventListener("keyup", (event) => this.onKeyUp(event));
    }

    isKeyPressed(keyCode) {
        return this.keyPressed[keyCode] || false;
    }

    onKeyDown(event) {
        const key = KEYMAP[event.which];
        if (key !== undefined) {
            this.keyPressed[key] = true;
        }
    }

    onKeyUp(event) {
        const key = KEYMAP[event.which];
        if (key !== undefined) {
            this.keyPressed[key] = false;

            if (this.onNextKeyPress) {
                this.onNextKeyPress(parseInt(key));
                this.onNextKeyPress = null;
            }
        }
    }
}
