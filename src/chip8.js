//This is the Emulator Class which will initialize the hardware and also any and all DOM Debug features on the html page

//import { TIME_60_HZ } from "./Constants/CPUConstants.js";
import { ROMS } from "./Constants/EmulatorConstants.js";
import { CPU } from "./cpu.js";
import { Display } from "./display.js";
import { Keyboard } from "./keyboard.js";
import { Speaker } from "./speaker.js";

//#region Initialize
//Create new instances of the hardware
const display = new Display();
const keyboard = new Keyboard();
const speaker = new Speaker();

//Attatch the hardware to a new instance of the CPU
const cpu = new CPU(display, keyboard, speaker);
//#endregion

//#region Page Controls
//CPU
const speedStepText = document.getElementById('speedStep');
const stepCPU = document.getElementById('step');
const pauseBtn = document.getElementById('pause')
const quirk = document.getElementById('quirkType');

//Display

const displayScale = document.getElementById('displayScale');
//const fpsScale = document.getElementById('fps'); //TODO: may move to cpu
const bgColorInput = document.getElementById('bgColor');
const colorInput = document.getElementById('color');

//Sound
const volumeControl = document.getElementById('volumeControl')
const oscillatorType = document.getElementById('oscillator');
const muteControl = document.getElementById('sound');

//ROMS
const romSelect = document.getElementById('roms');
const loadBtn = document.getElementById('load');

//Logging

//#endregion

//#region Controls Event Listeners
//CPU
pauseBtn.addEventListener('click', pause);
stepCPU.addEventListener('click', stepNext);
speedStepText.addEventListener('input', ChangeSpeed);
quirk.addEventListener('click', setQuirk)

//Display
displayScale.addEventListener('input', ChangeScale);
//fpsScale.addEventListener('input', changeFps)
bgColorInput.addEventListener('change', changeBGColor);
colorInput.addEventListener('change', changeColor);

//Sound
volumeControl.addEventListener('change', changeVolume);
oscillatorType.addEventListener('click', changeOscillator);
muteControl.addEventListener('click', MuteAudio);

//ROMS
loadBtn.addEventListener('click', loadSelectedRom);

//Logging


//Window

//#endregion

//Variables for calculating FPS
var fps = 60, now, then, interval, delta;

function init() {
    //#region Controls Values Load
    //CPU
    speedStepText.value = cpu.speed.toFixed(0);
    quirk.value = cpu.quirk;

    //Display
    displayScale.value = cpu.display.scale;
    //fpsScale.value = fps; //affects the timers which is a nono

    bgColorInput.value = cpu.display.bgColor;
    colorInput.value = cpu.display.color;

    //Sound
    volumeControl.value = cpu.speaker.volumeLevel
    oscillatorType.value = cpu.speaker.wave;
    muteControl.value = cpu.speaker.soundEnabled

    //ROMS
    loadRomNames(); //Loads the roms from the roms folder

    //Logging

    //#endregion

    //#region Start Emulator

    //Framerate Calculations
    then = Date.now();
    interval = 1000 / fps;

    //Call the loop
    //Infinite Function
    emuCycle();
    //#endregion
}

//#region EmuCycle
//This should run at 60Hz but can be changed by fps counter
function emuCycle() {

    //Test Set Timeout
    // function tick() {
    //     setTimeout(() => {
    //         window.requestAnimationFrame(tick)
    //         cpu.cycle();
    //     }, interval);
    // }

    // tick();

    //Framerate Calculations
    now = Date.now();
    delta = now - then;

    //This will force 60Hz
    if (delta > interval) {
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
        then = now - (delta % interval);

        //Call the cpu cycle method
        //each cycle is 10 steps
        cpu.cycle();
    }

    //Recursion
    requestAnimationFrame(emuCycle);
}

//#endregion


//#region Controls Functions
//#region CPU
//Pause the CPU
function pause() {
    //Check if CPU is already paused
    if (cpu.registers.paused) {
        //Set register to false and change control text to Pause
        cpu.registers.paused = false;
        pauseBtn.innerHTML = "Pause";
    }
    else {
        //Set register to true and change control text to Play
        cpu.registers.paused = true;
        pauseBtn.innerHTML = "Play";
    }
}

//Step the CPU by one instruction
async function stepNext() {
    //call CPU step method
    await cpu.step();
    //Render the display
    cpu.display.render();
    //Log
    console.log("step");
}

//Change cpu speed
//This changes how many steps per CPU cycle
function ChangeSpeed() {
    this.speedValue = speedStepText.value;

    cpu.speed = this.speedValue;
}

//Turns on or off cpu quirk which handles different types of chip8 cpus
function setQuirk() {
    cpu.quirk = quirk.value;
}
//#endregion

//#region  Display
//Change the scale of the display on the page
function ChangeScale() {
    this.scaleValue = displayScale.value;
    cpu.display.scale = this.scaleValue;

    cpu.display.render();
}

//Change FPS on emuCycle
function changeFps() {
    // fps = fpsScale.value;
    // interval = 1000/fps;
}

//Changes the background color of the display
function changeBGColor() {
    cpu.display.bgColor = bgColorInput.value;
    cpu.display.render();
}

//Changes the foreground color of the display
function changeColor() {
    cpu.display.color = colorInput.value;
    cpu.display.render();
}
//#endregion

//#region ROMS
//Loads a preset list of rom names from the EmulatorConstants file and adds them to the control
function loadRomNames() {
    //Map to the ROMS array
    ROMS.map(rom => {
        //Create a new option element
        var option = document.createElement("option");
        //Fill details
        option.value = rom;
        option.text = rom;
        //Append to the romSelect control
        romSelect.appendChild(option);
    });

    //Call the loadSelectedRom method
    loadSelectedRom();
}

//Loads a selected rom into the program
//ToDo: Change to take in a value so that user can load their own roms
function loadSelectedRom() {
    //Call the loadRom method from the CPU
    cpu.loadRom(romSelect.value);
    //Set the pauseBtn control text to read Pause as loading will unpause the CPU
    pauseBtn.innerHTML = "Pause";
}
//#endregion

//#region Sound
//Changes the volume of the speaker
function changeVolume() {
    //Set the volumeLevel to the Control value
    cpu.speaker.volumeLevel = volumeControl.value;
}

//Changes the Oscillator type in the speaker
function changeOscillator() {
    //Set the wave to the Control value
    cpu.speaker.wave = oscillatorType.value;
}

//Mutes the speaker
function MuteAudio() {
    //Check if the control is checked
    if (muteControl.checked) {
        //Mute the speaker. This will set it's volume to 0
        cpu.speaker.mute();
    }
    else {
        //unmute the speaker giving it the volume control value
        cpu.speaker.unMute(volumeControl.value);
    }
}
//#endregion

//#region Logging

//#endregion

//#endregion

//Call Initialization Function
init();