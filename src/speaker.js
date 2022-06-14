export class Speaker {
    constructor() {
        this.soundEnabled = false;
        this.volumeLevel = 0.3;
        this.wave = "square";

        this.speakerInit();
    }

    speakerInit() {
        if("AudioContext" in window || "webkitAudioContext" in window) {
            const audioContext = new (AudioContext || webkitAudioContext)(); //Create an audio Context
            const masterGain = new GainNode(audioContext); //Create a masterGain GainNode
            masterGain.connect(audioContext.destination); //connect the masterGain to the audio context

            //Variables soundEnabled and Oscillator
            let soundEnabled = false;
            let oscillator;
            //Create an object and define its properties
            Object.defineProperties(this, {
                //Sound Enabled Propert
                soundEnabled: {
                    //Getter
                    get: function() {
                        return soundEnabled;
                    },
                    //Setter
                    set: function(value) {
                        //if incomming value already is equal to soundEnabled exit function
                        if(value === soundEnabled) {
                            return
                        }
                        soundEnabled = value;
                        //Check soundEnabled true
                        if(soundEnabled) {
                            masterGain.gain.value = this.volumeLevel; //Set masterGain gain value here so volume control works
                            //Start Oscillator
                            oscillator = new OscillatorNode(audioContext, {type: this.wave}); //Square Oscillator
                            oscillator.connect(masterGain);
                            oscillator.start();
                        } else {
                            //Stop Oscillator
                            oscillator.stop();
                        }
                    }
                }
            })
        }
    }

    //Enables the sound Card
    enableSound() {
        this.soundEnabled = true;
    }

    //Disables the sound Card
    disableSound() {
        this.soundEnabled = false;
    }

    //User Controlled
    mute() {
        // Mute the audio
        this.volumeLevel = 0.0;
    }

    unMute(value) {
        // Unmute the audio
        this.volumeLevel = value;
    }

}