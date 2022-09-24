//Export Class
//Used to log all debug features
export class Debug {
    //Called when a new instance of the class is created
    constructor() {
        //Debug Properties
        this.opcodeLogs = new Array();

        this.Active = false;
    }

    //Reset function
    reset() {
        this.opcodeLogs.fill(0);
    }

    logOpcode(msg) {
        this.opcodeLogs.push(msg);
    }

    printLast() {
        console.log(this.opcodeLogs[this.opcodeLogs.length - 1]);
    }

    //Updates the Register UI
    DebugRegisters(cpu) {
        //Load Registers
        //16 bit V register
        cpu.registers.V.forEach((x, index) => {
            document.getElementById(`V${index}`).innerHTML = `0x${x.toString(16)}`;
        });
        //I register
        document.getElementById("I").innerHTML = `0x${cpu.registers.I.toString(16)}`;
        //Program Counter
        document.getElementById("PC").innerHTML = `0x${cpu.registers.PC.toString(16)}`;
        //Delay Timer
        document.getElementById("DT").innerHTML = `0x${cpu.registers.DT.toString(16)}`;
        //Sound Timer
        document.getElementById('ST').innerHTML = `0x${cpu.registers.ST.toString(16)}`;
    }

    //Updates the fpsCounter UI
    ShowFPS(fps) {
        //Get DOM element
        let counter = document.getElementById('fpsCounter');

        //Set innerHTML to fps variable
        counter.innerHTML = fps;
    }
}