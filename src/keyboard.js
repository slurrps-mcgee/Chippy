import { KEYMAP, DigitalKeyMapping, NUMBER_OF_KEYS } from "./Constants/KeyboardConstants.js";

export class Keyboard {
    constructor() {
        this.keyPressed = new Array(NUMBER_OF_KEYS).fill(false);
        this.onNextKeyPress = null;

        window.addEventListener("keydown", (event) => this.onKeyDown(event));
        window.addEventListener("keyup", (event) => this.onKeyUp(event));

        // Digital keypad event listeners for virtual key presses
        this.setupVirtualKeypadEvents();
    }

    setupVirtualKeypadEvents() {
        // For each button in the keypad, add keydown and keyup simulation
        for (let [buttonId, keyCode] of Object.entries(DigitalKeyMapping)) {
            const button = document.getElementById(buttonId);

            if (button) {
                button.addEventListener("mousedown", () => this.triggerKeyEvent(keyCode, 'keydown'));
                button.addEventListener("mouseup", () => this.triggerKeyEvent(keyCode, 'keyup'));
                button.addEventListener("touchstart", () => this.triggerKeyEvent(keyCode, 'keydown')); // For mobile
                button.addEventListener("touchend", () => this.triggerKeyEvent(keyCode, 'keyup'));   // For mobile
            }
        }
    }

    isKeyPressed(keyCode) {
        return this.keyPressed[keyCode] || false;
    }

    onKeyDown(event) {
        const key = KEYMAP[event.which];
        if (key !== undefined) {
            this.keyPressed[key] = true;
            console.log(event)
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

    // Simulate keydown or keyup event
    triggerKeyEvent(keyCode, eventType) {
        // Create a new keyboard event with the appropriate type (keydown or keyup)
        const event = new KeyboardEvent(eventType, {
            key: keyCode.toString(),
            keyCode: keyCode,
            charCode: 0,
            bubbles: true,
        });

        if(eventType === 'keydown') {
            this.onKeyDown(event);
        }
        else {
            this.onKeyUp(event);
        }
    }

    // // Simulate keydown event for virtual keypad button
    // simulateKeyDown(keyCode) {
    //     this.keyPressed[keyCode] = true;
    // }

    // // Simulate keyup event for virtual keypad button
    // simulateKeyUp(keyCode) {
    //     this.keyPressed[keyCode] = false;

    //     if (this.onNextKeyPress) {
    //         this.onNextKeyPress(parseInt(keyCode));
    //         this.onNextKeyPress = null;
    //     }
    // }
}
