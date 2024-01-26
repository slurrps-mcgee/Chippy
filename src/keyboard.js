//Imports
import { KEYMAP, NUMBER_OF_KEYS } from "./Constants/KeyboardConstants.js";

//Export Class
export class Keyboard {
    //Called when a new instance of the class is created
    constructor() {
        //Keyboard properties
        //Keymap set to constant KEYMAP
        this.KEYMAP = KEYMAP;
        //keyPressed Array to size of keyboard fill with false
        this.keyPressed = new Array(NUMBER_OF_KEYS).fill(false);

        //Current key
        this.key = undefined;

        //onNextKeyPress to hold 
        this.onNextKeyPress = null;

        //Add keydown and keyup event listeners to the window
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    //check if the provided keycode is pressed(true) in the array
    isKeyPressed(keyCode) {
        //Return value from keyPressed array using the provided value as an index     
        return this.keyPressed[keyCode];
    }

    //onKeyDown Event for the window
    onKeyDown(event) {
        //Get key from keymap
        this.key = this.KEYMAP[event.which];
        //Check that the key exists in the keymap
        if (this.key != undefined) {
            //Set keypressed at index key to true
            this.keyPressed[this.key] = true;
        }
    }

    //onKeyUp Event for the window
    onKeyUp(event) {
        //Get key from keymap
        this.key = this.KEYMAP[event.which];
        //Check that the key exists in the keymap
        if (this.key != undefined) {
            //Set keypressed at index key to true
            this.keyPressed[this.key] = false;

            // Make sure onNextKeyPress is initialized and the pressed key is actually mapped to a Chip-8 key
            if (this.onNextKeyPress !== null && this.key) {
                //parseInt the key pressed for onNextKeyPress
                this.onNextKeyPress(parseInt(this.key));
                
                //Set onNextKeyPress to null
                this.onNextKeyPress = null;
            }
        }
    }
}