//This is the Emulator Class which will initialize the hardware and also any and all DOM Debug features on the html page

import { TIME_60_HZ } from "./Constants/CPUConstants.js";
import { CPU } from "./cpu.js";
import { Display } from "./display.js";
import { Keyboard } from "./keyboard.js";
import { PageControls } from "./PageControls.js";
import { Speaker } from "./speaker.js";

//#region Initialize
//Create new instances of the hardware
const display = new Display();
const keyboard = new Keyboard();
const speaker = new Speaker();

//Attatch the hardware to a new instance of the CPU
const cpu = new CPU(display, keyboard, speaker);
//#endregion

const controls = new PageControls(cpu);

//Variables for calculating FPS
var now, then, delta;

function init() {
    //#region Start Emulator
    //Get Start
    then = Date.now();

    //Call the loop
    //Infinite Function
    emuCycle();
    //#endregion
}

//#region EmuCycle
//This should run at 60Hz but can be changed by fps counter
function emuCycle() {
    var timePassed = (Date.now() - now) / 1000;
    //Framerate Calculations
    now = Date.now();
    delta = now - then;
    var fps = Math.round(1 / timePassed);

    //This will force 60Hz
    if (delta > TIME_60_HZ) {
        //Contextual Comments from https://gist.github.com/elundmark
        // update time stuffs
        // Just `then = now` is not enough.
        // Lets say we set fps at 10 which means
        // each frame must take 100ms
        // Now frame executes in 16ms (60fps) so
        // the loop iterates 7 times (16*7 = 112ms) until
        // delta > interval === true
        // Eventually this lowers down the FPS as
        // 112*10 = 1120ms (NOT 1000ms).
        // So we have to get rid of that extra 12ms
        // by subtracting delta (112) % interval (100).
        // Hope that makes sense.
        then = now - (delta % TIME_60_HZ);

        //Call the cpu cycle method
        //each cycle is 10 steps
        cpu.cycle();
        cpu.debug.ShowFPS(fps);
    }

    //Recursion
    requestAnimationFrame(emuCycle);
}

//#endregion

//Call Initialization Function
init();