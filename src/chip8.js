//This is the Emulator Class which will initialize the hardware and also any and all DOM Debug features on the html page
import { TIME_60_HZ } from "./Constants/EmulatorConstants.js";
import { CPU } from "./cpu.js";
import { Display } from "./display.js";
import { Keyboard } from "./keyboard.js";
import { Controls } from "./controls.js";
import { Speaker } from "./speaker.js";

//#region Initialize hardware
const display = new Display();
const keyboard = new Keyboard();
const speaker = new Speaker();
const cpu = new CPU(display, keyboard, speaker); // Attaching hardware to CPU
const controls = new Controls(cpu); // Loads controls
//#endregion

// Variables for FPS calculation
let now, then, delta;

function init() {
    then = Date.now(); // Start time
    emuCycle(); // Start the emulator cycle
}

function emuCycle() {
    now = Date.now();
    delta = now - then;
    const timePassed = delta / 1000; // Calculate time passed in seconds

    // Limit emulation to 60Hz
    if (delta > TIME_60_HZ) {
        // Adjust for 60Hz FPS, accounting for potential frame drops
        then = now - (delta % TIME_60_HZ);
        cpu.cycle(); // Execute CPU cycle
    }

    requestAnimationFrame(emuCycle); // Recursively call to create the loop
}

// Call Initialization Function
init();