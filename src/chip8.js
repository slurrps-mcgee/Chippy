//This is the Emulator Class which will initialize the hardware and also any and all DOM Debug features on the html page

//import { TIME_60_HZ } from "./Constants/CPUConstants.js";
import { TIME_60_HZ } from "./Constants/CPUConstants.js";
import { ROMS } from "./Constants/EmulatorConstants.js";
import { CPU } from "./cpu.js";
import { Display } from "./display.js";
import { Keyboard } from "./keyboard.js";
import { Speaker } from "./speaker.js";

///////////////SETUP//////////////////
//Create new instances of the hardware
const display = new Display();
const keyboard = new Keyboard();
const speaker = new Speaker();

//Attatch the hardware to a new instance of the CPU
const cpu = new CPU(display, keyboard, speaker);
//////////////////////////////////////

////////////////////Page Controls Constants////////////////////

//CPU
const speedStepText = document.getElementById('speedStep');
const stepCPU = document.getElementById('step');
const pauseBtn = document.getElementById('pause')
const quirk = document.getElementById('quirkType');

//Display
const displayScale = document.getElementById('displayScale');
const fpsScale = document.getElementById('fps');
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

/////////////////////////////////////////////////////////////

///////////////////////Controls Event listeners////////////////////////////
//CPU
pauseBtn.addEventListener('click', pause);
stepCPU.addEventListener('click', stepNext);
speedStepText.addEventListener('input', ChangeSpeed);
quirk.addEventListener('click', setQuirk)

//Display
displayScale.addEventListener('input', ChangeScale);
fpsScale.addEventListener('input', changeFps)
bgColorInput.addEventListener('change', changeBGColor);
colorInput.addEventListener('change', changeColor);

//Sound
volumeControl.addEventListener('change', changeVolume);
oscillatorType.addEventListener('click', changeOscillator);
muteControl.addEventListener('click', MuteAudio);

//ROMS
loadBtn.addEventListener('click', loadSelectedRom);

//Logging

/////////////////////////////////////////////////////////////////////////

//Variables for calculating FPS
var fps = TIME_60_HZ, now, then, interval, delta;

function init() {
    //////////////Load Controls values//////////////////
    //CPU
    speedStepText.value = cpu.speed.toFixed(0);
    quirk.value = cpu.quirk;

    //Display
    displayScale.value = cpu.display.scale;
    fpsScale.value = fps;
    bgColorInput.value = cpu.display.bgColor;
    colorInput.value = cpu.display.color;

    //Sound
    volumeControl.value = cpu.speaker.volumeLevel
    oscillatorType.value = cpu.speaker.wave;
    muteControl.value = cpu.speaker.soundEnabled

    //ROMS
    loadRomNames(); //Loads the roms from the roms folder

    //Logging

    //////////////////////////////////////////////////////

    //////////Start Emulator//////////

    //Framerate Calculations
    then = Date.now();
    interval = 1000/fps;
    
    //Call the loop
    //Infinite Function
    emuCycle();
    ////////////////////////////////
}

//Recursive Function for Stepping through a CPU Cycle
async function emuCycle() {
    //Recursion
    requestAnimationFrame(emuCycle);

    //Framerate Calculations
    now = Date.now();
    delta = now - then;

    //Loop
    if(delta > interval) {
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
}



////////////////////////Event Listener Functions/////////////////////
///////////////////CPU
//Pause the Console
function pause() {
    if (cpu.registers.paused) {
        cpu.registers.paused = false;
        pauseBtn.innerHTML = "Pause";
    }
    else {
        cpu.registers.paused = true;
        pauseBtn.innerHTML = "Play";
    }
}

//Step the CPU
async function stepNext() {
    //await cpu.sleep();
    await cpu.step();
    cpu.display.render();
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


////////////////////Display
//Change the scale of the display on the page
function ChangeScale() {
    this.scaleValue = displayScale.value;
    cpu.display.scale = this.scaleValue;

    cpu.display.render();
}

//Change FPS on emuCycle
function changeFps() {
    fps = fpsScale.value;
    interval = 1000/fps;
}

//Changes the background color of the display
function changeBGColor() {
    cpu.display.bgColor = bgColorInput.value;
}

//Changes the foreground color of the display
function changeColor() {
    cpu.display.color = colorInput.value;
}

////////////////////ROMS

function loadRomNames() {
    ROMS.map(rom => {
        var option = document.createElement("option");
        option.value = rom;
        option.text = rom;
        romSelect.appendChild(option);
    });

    loadSelectedRom();
}

function loadSelectedRom() {
    cpu.loadRom(romSelect.value);
    pauseBtn.innerHTML = "Pause";
}


////////////////////Sound

function changeVolume() {
    cpu.speaker.volumeLevel = volumeControl.value;
}

function changeOscillator() {
    cpu.speaker.wave = oscillatorType.value;
}

function MuteAudio() {
    if(muteControl.checked) {
        cpu.speaker.mute();
    }
    else {
        cpu.speaker.unMute(volumeControl.value);
    }
}

//////////////////Logging

////////////////////////////////////////////////////////////

//Call Initialization Function
init();