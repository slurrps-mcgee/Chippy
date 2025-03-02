import { BG_COLOR, COLOR, DISPLAY_HEIGHT, DISPLAY_WIDTH, SCALE } from "./Constants/DisplayConstants.js";

export class Display {
    constructor() {
        this.scale = SCALE;
        this.bgColor = BG_COLOR;
        this.color = COLOR;
        this.screen = document.querySelector("canvas");
        this.context = this.screen.getContext("2d");
        this.frameBuffer = new Array(DISPLAY_WIDTH * DISPLAY_HEIGHT).fill(0);

        this.scaleScreen();
        this.reset();
    }

    reset() {
        this.frameBuffer.fill(0);
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.screen.width, this.screen.height);
        this.render();
    }

    scaleScreen() {
        this.screen.width = DISPLAY_WIDTH * this.scale;
        this.screen.height = DISPLAY_HEIGHT * this.scale;
    }

    setPixel(x, y) {
        const px = x % DISPLAY_WIDTH;
        const py = y % DISPLAY_HEIGHT;
        const pixelLoc = px + py * DISPLAY_WIDTH;

        this.frameBuffer[pixelLoc] ^= 1;
        return !this.frameBuffer[pixelLoc]; // Returns `true` if the pixel was erased
    }

    render() {
        this.scaleScreen();
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.screen.width, this.screen.height);

        this.context.fillStyle = this.color;
        for (let i = 0; i < this.frameBuffer.length; i++) {
            if (this.frameBuffer[i]) {
                const x = (i % DISPLAY_WIDTH) * this.scale;
                const y = Math.floor(i / DISPLAY_WIDTH) * this.scale;
                this.context.fillRect(x, y, this.scale, this.scale);
            }
        }
    }
}
