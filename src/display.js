import { BG_COLOR, COLOR, DISPLAY_HEIGHT, DISPLAY_WIDTH, SCALE } from "./Constants/DisplayConstants.js";

export class Display {
    constructor() {
        //Display properties
        this.scale = SCALE; //Screen Scale
        this.bgColor = BG_COLOR; //Background Color
        this.color = COLOR; //Fore Color

        //Get Screen and Context
        this.screen = document.querySelector('canvas'); //Screen
        this.context = this.screen.getContext('2d'); //2D Context

        //Create a frameBuffer to hold all of the pixels
        this.frameBuffer = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT); //Frame Buffer array

        //Call Reset
        this.reset();
    }

    //Reset the display
    reset() {
        //Clear the array of pixels by filling with 0s
        this.frameBuffer.fill(0);
        //Set the fill style to background color
        this.context.fillStyle = this.bgColor;
        //Fill the screen
        this.context.fillRect(0, 0, this.screen.width, this.screen.height);

        //Render display
        this.render();
    }

    //Scales the screen by multiplying the scale against the default height and width
    scaleScreen() {
        //Set screen width and height and scale it
        this.screen.width = DISPLAY_WIDTH * this.scale;
        this.screen.height = DISPLAY_HEIGHT * this.scale;
    }

    //Sets a pixel to 1 or 0 inside the frameBuffer by XOR pixels
    setPixel(x, y) {
        //Constant Pixel X and Pixel Y location
        //Calculate using modulo to handle screen wrap
        const px = x % DISPLAY_WIDTH;
        const py = y % DISPLAY_HEIGHT;

        //Set pixelLocation to px + (py * width of the display constant)
        let pixelLoc = px + (py * DISPLAY_WIDTH);

        //Set pixel inside frameBuffer[pixelLoc as index] to XOR bitwise operation 0 or 1
        this.frameBuffer[pixelLoc] ^= 1;

        //Opposite Return if pixel was erased. 1 true for erased, 0 false for nothing erased
        return !this.frameBuffer[pixelLoc];
    }

    render() {
        //Scale the screen first
        this.scaleScreen();

        //Clear the canvas
        this.context.clearRect(0, 0, this.screen.width, this.screen.height);
        //Set background color
        this.context.fillStyle = this.bgColor;
        //Fill the canvas
        this.context.fillRect(0, 0, this.screen.width, this.screen.height);

        //Loop through the display width * height
        for (let i = 0; i < DISPLAY_WIDTH * DISPLAY_HEIGHT; i++) {
            //Get x location (i mod width) * scale
            let x = (i % DISPLAY_WIDTH) * this.scale;

            //Get y = Math.floor(i divide width) * scale
            let y = Math.floor(i / DISPLAY_WIDTH) * this.scale;

            //Check the frame buffer at location i for 0 or 1
            if (this.frameBuffer[i]) {
                //Set the fillstyle to color
                this.context.fillStyle = this.color;

                //Fill a new rectangle at location x,y setting its size to scale variable
                this.context.fillRect(x, y, this.scale, this.scale);
            }
        }
    }

}