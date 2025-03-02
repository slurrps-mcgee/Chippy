import { ROMS } from "./Constants/EmulatorConstants.js";
import { Settings } from "./settings.js";

const settings = new Settings(); // Instance of settings
let processor;

export class Controls {
    constructor(cpu) {
        processor = cpu;
        this.setupEventListeners(); // Modularized event listeners
        this.loadControls(); // Initialize control values
    }

    setupEventListeners() {
        //#region Event Listeners
        // CPU Controls
        this.addEvent('click', 'pause', this.togglePause);
        this.addEvent('click', 'step', this.stepNext);
        this.addEvent('input', 'speedStep', this.changeSpeed);
        this.addEvent('click', 'quirkType', this.setQuirk);

        // Display Controls
        this.addEvent('input', 'displayScale', this.changeScale);
        this.addEvent('change', 'bgColor', this.changeBGColor);
        this.addEvent('change', 'color', this.changeColor);
        this.addEvent('click', 'showfps', this.toggleFpsCounter);

        // Sound Controls
        this.addEvent('change', 'volumeControl', this.changeVolume);
        this.addEvent('input', 'volumeControl', this.updateVolumeDisplay);
        this.addEvent('click', 'oscillator', this.changeOscillator);
        this.addEvent('click', 'sound', this.toggleMute);

        // ROM Controls
        this.addEvent('click', 'load', this.loadSelectedRom);

        // Debug Controls
        this.addEvent('click', 'debug', this.toggleDebugOptions);
        this.addEvent('click', 'keypadCheck', this.toggleKeyboard);
        //#endregion
    }

    // Helper function to add event listeners
    addEvent(type, id, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(type, handler.bind(this));
        }
    }

    // Loads control values from the processor and settings
    loadControls() {
        settings.load(processor);
        
        // CPU Controls
        document.getElementById('speedStep').value = processor.speed;
        
        // Display Controls
        document.getElementById('displayScale').value = processor.display.scale;
        document.getElementById('bgColor').value = processor.display.bgColor;
        document.getElementById('color').value = processor.display.color;
        
        // Sound Controls
        document.getElementById('volumeControl').value = processor.speaker.volumeLevel;
        document.getElementById('volumeNumber').innerHTML = processor.speaker.volumeLevel;
        document.getElementById('oscillator').value = processor.speaker.wave;

        this.loadRomNames(); // Loads predefined ROM names
    }

    // CPU Controls
    togglePause() {
        const paused = processor.registers.paused;
        processor.registers.paused = !paused;
        document.getElementById('pause').innerHTML = paused ? "Pause" : "Play";
    }

    stepNext() {
        processor.step();
        processor.display.render();
    }

    changeSpeed() {
        processor.speed = document.getElementById('speedStep').value;
        settings.save("speed", processor.speed);
    }

    setQuirk() {
        // Add logic for CPU quirks if needed
    }

    // Display Controls
    changeScale() {
        processor.display.scale = document.getElementById('displayScale').value;
        processor.display.render();
        settings.save("scale", processor.display.scale);
    }

    changeBGColor() {
        processor.display.bgColor = document.getElementById('bgColor').value;
        processor.display.render();
        settings.save("bgColor", processor.display.bgColor);
    }

    changeColor() {
        processor.display.color = document.getElementById('color').value;
        processor.display.render();
        settings.save("color", processor.display.color);
    }

    toggleFpsCounter() {
        const fps = document.getElementById('fpsControl');
        fps.style.display = document.getElementById('showfps').checked ? "block" : "none";
    }

    // Sound Controls
    changeVolume() {
        processor.speaker.volumeLevel = document.getElementById('volumeControl').value;
        settings.save("volume", processor.speaker.volumeLevel);
    }

    updateVolumeDisplay() {
        document.getElementById('volumeNumber').innerHTML = document.getElementById('volumeControl').value;
    }

    changeOscillator() {
        processor.speaker.wave = document.getElementById('oscillator').value;
        settings.save("wave", processor.speaker.wave);
    }

    toggleMute() {
        const muteChecked = document.getElementById('sound').checked;
        if (muteChecked) {
            processor.speaker.mute();
        } else {
            processor.speaker.unMute(document.getElementById('volumeControl').value);
        }
    }

    // ROM Controls
    loadRomNames() {
        const romSelect = document.getElementById('roms');
        ROMS.forEach(rom => {
            const option = document.createElement("option");
            option.value = rom;
            option.text = rom;
            romSelect.appendChild(option);
        });
        this.loadSelectedRom();
    }

    async loadSelectedRom() {
        const fileSelect = document.getElementById('file-input');
        const romSelect = document.getElementById('roms');

        if (fileSelect.files[0]) {
            await processor.loadRom(fileSelect.files[0]);
            fileSelect.value = null;
        } else {
            const rom = await fetch(`./roms/${romSelect.value}`);
            await processor.loadRom(rom);
        }
    }

    // Debug Controls
    toggleDebugOptions() {
        const debugPanel = document.getElementById('debugPanel');
        const isDebugActive = document.getElementById('debug').checked;
        debugPanel.style.display = isDebugActive ? "block" : "none";
        processor.debug.Active = isDebugActive;
    }

    toggleKeyboard() {
        const keypad = document.getElementById('keypad');
        const isKeypadActive = document.getElementById('keypadCheck').checked;
        keypad.style.display = isKeypadActive ? "block" : "none";
    }
}