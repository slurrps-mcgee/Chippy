export class Debug {
    constructor() {
        this.opcodeLogs = new Array();
    }

    reset() {
        this.opcodeLogs = new Array();
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
        document.getElementById('ST').innerHTML = `0x${cpu.registers.ST.toString(16)}`
    }

    ShowFPS(fps) {
        let counter = document.getElementById('fpsCounter');

        counter.innerHTML = fps;
    }
}