// Class to be exported to other classes
export class Speaker {
    // Called when creating an instance of the class
    constructor() {
        // Speaker properties
        this.isMute = false;
        this.soundEnabled = false; // Holds whether the sound is enabled or not
        this.volumeLevel = 0.3; // Holds the volume level of the speaker
        this.wave = "square"; // Holds the wave of the oscillator
        this.audioContext = null; // Placeholder for audio context
        this.masterGain = null;
        this.oscillator = null;

        // Initialize speaker (but delay audioContext creation)
        this.initSpeaker();
    }

    // Initialize function
    initSpeaker() {
        if ("AudioContext" in window || "webkitAudioContext" in window) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
        }
    }

    // Ensures audioContext is resumed before playback
    async ensureAudioContext() {
        if (this.audioContext && this.audioContext.state === "suspended") {
            await this.audioContext.resume();
        }
    }

    // Enables the sound
    async enableSound() {
        await this.ensureAudioContext();
        if (!this.soundEnabled) {
            this.soundEnabled = true;
            this.masterGain.gain.value = this.volumeLevel;
            this.oscillator = new OscillatorNode(this.audioContext, {
                type: this.wave
            });
            this.oscillator.connect(this.masterGain);
            this.oscillator.start();
        }
    }

    // Disables the sound
    disableSound() {
        if (this.soundEnabled && this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
            this.soundEnabled = false;
        }
    }

    // Mute function
    mute() {
        this.volumeLevel = 0.0;
        if (this.masterGain) {
            this.masterGain.gain.value = 0;
        }
    }

    // Unmute function
    unMute(value) {
        this.volumeLevel = value;
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }

    // Play sound based on a timer value
    async playSound(st) {
        if (st > 0) {
            await this.enableSound();
        } else {
            this.disableSound();
        }
    }
}
