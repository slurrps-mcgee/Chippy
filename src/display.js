import { BG_COLOR, COLOR, DISPLAY_HEIGHT, DISPLAY_WIDTH, SCALE } from "./Constants/DisplayConstants.js";

export class Display {
    constructor() {
        //Set Properties
        this.scale = SCALE;
        //Add more properties here like color selection
        this.bgColor = BG_COLOR;
        this.color = COLOR;

        //Get Screen and Context
        this.screen = document.querySelector('canvas');
        this.context = this.screen.getContext('2d');

        //Create a frameBuffer to hold all of the pixels
        this.frameBuffer = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT);

        //Render
        this.reset();
    }

    //Reset the display to blank
    reset() {
        //Clear the array of pixels by creating a new instance
        this.frameBuffer = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT);

        //Set the fill style to background color
        this.context.fillStyle = this.bgColor;
        //Fill the screen
        this.context.fillRect(0, 0, this.screen.width, this.screen.height);

        //Render
        this.render();
    }

    scaleScreen() {
        //Set screen width and height and scale it
        this.screen.width = DISPLAY_WIDTH * this.scale;
        this.screen.height = DISPLAY_HEIGHT * this.scale;
    }

    //Sets a pixel to 1 or 0 inside the frameBuffer XOR pixels
    setPixel(x, y) {
        //Calculate using modulo to handle screen wrap
        const px = x % DISPLAY_WIDTH;
        const py = y % DISPLAY_HEIGHT;

        //Get pixe Location
        let pixelLoc = px + (py * DISPLAY_WIDTH);

        //Set pixel inside frameBuffer[pixelLoc] to XOR bitwise operation 0 or 1
        this.frameBuffer[pixelLoc] ^= 1;

        //Return if pixel was erased true for erased false for nothing erased
        return !this.frameBuffer[pixelLoc];
    }

    render() {
        this.scaleScreen();

        this.context.clearRect(0, 0, this.screen.width, this.screen.height);
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.screen.width, this.screen.height);

        for (let i = 0; i < DISPLAY_WIDTH * DISPLAY_HEIGHT; i++) {
            let x = (i % DISPLAY_WIDTH) * this.scale;

            let y = Math.floor(i / DISPLAY_WIDTH) * this.scale;

            if (this.frameBuffer[i]) {
                this.context.fillStyle = this.color;

                this.context.fillRect(x, y, this.scale, this.scale);
            }
        }
    }

}