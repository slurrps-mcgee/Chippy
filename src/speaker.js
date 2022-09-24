//Class to be exported to other classes
export class Speaker {
    //Called when creating an instance of the class
    constructor() {
        //Speaker properties
        this.isMute = false;
        this.soundEnabled = false; //Holds whether the sound is enabled or not. Object defined in speaker init function
        this.volumeLevel = 0.3; //Holds the volume level of the speaker
        this.wave = "square"; //Holds the wave of the oscillator

        //Initialize speaker
        speakerInit(this);
    }

    //Funtions
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
        //Set audio level to 0
        this.volumeLevel = 0.0;
    }

    unMute(value) {
        //Set audio level to incoming value
        //This will help when volume has been changed while the speaker is muted
        this.volumeLevel = value;
    }

    //Play Sound based on sound timer value
    playSound(st) {
        if (st > 0) {
            //Play
            this.enableSound();
        } else {
            //Stop
            this.disableSound();
        }
    }
}

//Initialization function
//This creates the property soundEnabled for the speaker as well as creating the gain and audio context. It does not need to be exported.
function speakerInit(speaker) {
    //Check if browser supports audio context
    if ("AudioContext" in window || "webkitAudioContext" in window) {
        //Create audioContext and masterGain
        const audioContext = new(AudioContext || webkitAudioContext)(); //Create an audio Context
        const masterGain = new GainNode(audioContext); //Create a masterGain GainNode

        //connect the masterGain to the audio context
        masterGain.connect(audioContext.destination);

        //Create variables soundEnabled and Oscillator
        let soundEnabled = false;
        let oscillator;

        //Create an object and define its properties to speaker
        Object.defineProperties(speaker, {
            //Sound Enabled Property
            soundEnabled: {
                //Getter
                get: function() {
                    return soundEnabled;
                },
                //Setter
                set: function(value) {
                    //if incomming value already is equal to soundEnabled exit function
                    if (value === soundEnabled) {
                        return
                    }

                    //Set soundEnabled to incoming value
                    soundEnabled = value;

                    //Check soundEnabled true
                    if (soundEnabled) {
                        //Set masterGain gain value here so volume control works
                        masterGain.gain.value = speaker.volumeLevel;
                        //Start Oscillator giving it the audiocontext and the wave
                        oscillator = new OscillatorNode(audioContext, {
                            type: speaker.wave
                        });
                        //Connect the oscillator to the mastergain
                        oscillator.connect(masterGain);
                        //Start the oscillator
                        oscillator.start();
                    } else {
                        //Stop the Oscillator
                        oscillator.stop();
                    }
                }
            }
        })
    }
}