import { ROMS } from "./Constants/EmulatorConstants.js";
import { Settings } from "./settings.js";

//#region Page Controls
//CPU
const speedStepText = document.getElementById('speedStep'); //Changable
const stepCPU = document.getElementById('step');
const pauseBtn = document.getElementById('pause');
const quirk = document.getElementById('quirkType'); //Changable

//Display
const displayScale = document.getElementById('displayScale'); //Changable

//const fpsScale = document.getElementById('fps'); //TODO: may move to cpu

const bgColorInput = document.getElementById('bgColor'); //Changable
const colorInput = document.getElementById('color'); //Changable

const fps = document.getElementById('fpsControl');
const showfps = document.getElementById('showfps');

//Sound
const volumeControl = document.getElementById('volumeControl'); //Changable
const volumeLevel = document.getElementById('volumeNumber');
const oscillatorType = document.getElementById('oscillator'); //Changable
const muteControl = document.getElementById('sound'); //Changable

//ROMS
const fileSelect = document.getElementById('file-input');
const romSelect = document.getElementById('roms');
const loadBtn = document.getElementById('load');

//Debug
const debugChk = document.getElementById('debug');

const settings = new Settings(); //Create new instance of settings
//#endregion

//Variable to hold the CPU instance
var processor;

export class Controls {
    constructor(cpu) {
        //CPU Instance
        processor = cpu;

        //#region Controls Event Listeners
        //CPU
        pauseBtn.addEventListener('click', this.pause);
        stepCPU.addEventListener('click', this.stepNext);
        speedStepText.addEventListener('input', this.ChangeSpeed);
        quirk.addEventListener('click', this.setQuirk)

        //Display
        displayScale.addEventListener('input', this.ChangeScale);
        bgColorInput.addEventListener('change', this.changeBGColor);
        colorInput.addEventListener('change', this.changeColor);
        showfps.addEventListener('click', this.ShowFpsCounter);

        //Sound
        volumeControl.addEventListener('change', this.changeVolume);
        volumeControl.addEventListener('input', this.sliderChange)

        oscillatorType.addEventListener('click', this.changeOscillator);
        muteControl.addEventListener('click', this.MuteAudio);

        //ROMS
        loadBtn.addEventListener('click', this.loadSelectedRom);

        //Debug
        debugChk.addEventListener('click', this.showDebugOptions)

        //Window

        //#endregion

        this.loadControls();
    }

    //Loads the controls with values from the emulator
    loadControls() {
        settings.load(processor); //Load Local Storage int CPU

        //#region Controls Values Load
        //CPU
        speedStepText.value = processor.speed;
        quirk.value = processor.quirk;

        //Display
        displayScale.value = processor.display.scale;

        bgColorInput.value = processor.display.bgColor;
        colorInput.value = processor.display.color;

        //Sound
        volumeControl.value = processor.speaker.volumeLevel;
        volumeLevel.innerHTML = processor.speaker.volumeLevel;

        oscillatorType.value = processor.speaker.wave;

        //#endregion

        //ROMS
        this.loadRomNames(); //Loads the roms from the roms folder
    }



    //////////////////////////Methods to handle the controls///////////////////////////////////////

    //#region Controls Functions
    //#region CPU
    //Pause the CPU
    pause() {
        //Check if CPU is already paused
        if (processor.registers.paused) {
            //Set register to false and change control text to Pause
            processor.registers.paused = false;
            pauseBtn.innerHTML = "Pause";
        } else {
            //Set register to true and change control text to Play
            processor.registers.paused = true;
            pauseBtn.innerHTML = "Play";
        }
    }

    //Step the CPU by one instruction
    stepNext() {
        //call CPU step method
        processor.step();
        //Render the display
        processor.display.render();
    }

    //Change cpu speed
    //This changes how many instructions per CPU cycle
    ChangeSpeed() {
        processor.speed = speedStepText.value;

        settings.save("speed", speedStepText.value); //Save value
    }

    //Turns on or off cpu quirk which handles different types of chip8 cpus
    setQuirk() {
        processor.quirk = quirk.value;

        settings.save("quirk", quirk.value); //Save value
    }
    //#endregion

    //#region  Display
    //Change the scale of the display on the page
    ChangeScale() {
        processor.display.scale = displayScale.value;

        processor.display.render();

        settings.save("scale", displayScale.value);
    }

    //Changes the background color of the display
    changeBGColor() {
        processor.display.bgColor = bgColorInput.value;
        processor.display.render();

        settings.save("bgColor", bgColorInput.value);
    }

    //Changes the foreground color of the display
    changeColor() {
        processor.display.color = colorInput.value;
        processor.display.render();

        settings.save("color", colorInput.value);
    }

    ShowFpsCounter() {
        if (showfps.checked) {
            fps.style.display = "block";
        } else {
            fps.style.display = "none";
        }
    }
    //#endregion

    //#region Sound
    //Changes the volume of the speaker
    changeVolume() {
        //Set the volumeLevel to the Control value
        processor.speaker.volumeLevel = volumeControl.value;
        settings.save("volume", volumeControl.value);
    }
    //Shows the volume level to user
    sliderChange() {
        volumeLevel.innerHTML = volumeControl.value;
    }


    //Changes the Oscillator type in the speaker
    changeOscillator() {
        //Set the wave to the Control value
        processor.speaker.wave = oscillatorType.value;

        settings.save("wave", oscillatorType.value);
    }

    //Mutes the speaker
    MuteAudio() {
        //Check if the control is checked
        if (muteControl.checked) {
            //Mute the speaker. This will set it's volume to 0
            processor.speaker.mute();
            //settings.save("mute", true);
        } else {
            //unmute the speaker giving it the volume control value
            processor.speaker.unMute(volumeControl.value);
            //settings.save("mute", false);
        }
    }
    //#endregion

    //#region ROMS
    //Loads a preset list of rom names from the EmulatorConstants file and adds them to the control
    loadRomNames(cpu) {
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
        this.loadSelectedRom();
    }

    //Loads a selected rom into the program
    //ToDo: Change to take in a value so that user can load their own roms
    async loadSelectedRom() {
        if(fileSelect.files[0] != undefined) {
            processor.loadRom(fileSelect.files[0]);
            fileSelect.value = null;
        }
        else {
            let rom = await fetch(`./roms/${romSelect.value}`)
             //Call the loadRom method from the CPU
            await processor.loadRom(rom);
        }

       
    }
    //#endregion

    //#region Debug
    showDebugOptions() {
        let debugPanel = document.getElementById('debugPanel');

        if (debugChk.checked) {
            debugPanel.style.display = "block"
            processor.debug.Active = true;
        } else {
            debugPanel.style.display = "none"
        }
    }
    //#endregion

    //#endregion
}