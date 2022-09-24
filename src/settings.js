export class Settings {
    constructor() {

    }

    save(name, value) {
        // Check browser support
        if (typeof(Storage) !== "undefined") {
            // Store
            localStorage.setItem(name, value);
            console.log(`${name} ${value}`)

        } else {
            alert("Sorry, your browser does not support Web Storage...");
        }
    }

    load(cpu) {
        // Check browser support
        if (typeof(Storage) !== "undefined") {
            //Load
            if (localStorage.length > 0) {
                //CPU 
                cpu.speed = localStorage.getItem("speed");
                cpu.quirk = localStorage.getItem("quirk");

                // //Display
                cpu.display.scale = localStorage.getItem("scale");

                cpu.display.bgColor = localStorage.getItem("bgColor");
                cpu.display.color = localStorage.getItem("color");

                // // //Sound
                cpu.speaker.volumeLevel = localStorage.getItem("volume");
                cpu.speaker.wave = localStorage.getItem("wave");

                //cpu.speaker.isMute = localStorage.getItem("mute");
            }


        } else {
            alert("Sorry, your browser does not support Web Storage...");
        }
    }
}