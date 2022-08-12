import { KEYMAP, NUMBER_OF_KEYS } from "./Constants/KeyboardConstants.js";

export class Keyboard {
    constructor() {
        this.KEYMAP = KEYMAP;

        this.keyPressed = new Array(NUMBER_OF_KEYS).fill(false);

        this.onNextKeyPress = null;

        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    isKeyPressed(keyCode) {        
        return this.keyPressed[keyCode];
    }

    onKeyDown(event) {
        //console.log(event);

        let key = this.KEYMAP[event.which];
        this.keyPressed[key] = true;
    
        // Make sure onNextKeyPress is initialized and the pressed key is actually mapped to a Chip-8 key
        if (this.onNextKeyPress !== null && key) {
            this.onNextKeyPress(parseInt(key));
            this.onNextKeyPress = null;
        }
    }

    onKeyUp(event) {
        let key = this.KEYMAP[event.which];
        this.keyPressed[key] = false;
    }
}