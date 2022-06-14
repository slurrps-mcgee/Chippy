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
    async DebugRegisters(cpu) {
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

    //Gets a given OPCode description for debugging
    getOpcodeDescription(opcode) {
        
        switch (opcode & 0xF000) {
            case 0x0000:
                switch (opcode) {
                    case 0x00E0:
                        
                        break;
                    case 0x00EE:
                        
                        break;
                }

                break;
            case 0x1000:
                
                break;
            case 0x2000:
               
                break;
            case 0x3000:

                break;
            case 0x4000:
                
                break;
            case 0x5000:
                
                break;
            case 0x6000:
                
                break;
            case 0x7000:
                
                break;
            case 0x8000:
                switch (opcode & 0xF) {
                    case 0x0:
                        
                        break;
                    case 0x1:
                        
                        break;
                    case 0x2:
                        
                        break;
                    case 0x3:
                        
                        break;
                    case 0x4:
                        
                        break;
                    case 0x5:
                        
                        break;
                    case 0x6:
                        
                        break;
                    case 0x7:
                        
                        break;
                    case 0xE:
                        
                        break;
                }

                break;
            case 0x9000:
                
                break;
            case 0xA000:
                
                break;
            case 0xB000:
                
                break;
            case 0xC000:
                
                break;
            case 0xD000:
                
                break;
            case 0xE000:
                switch (opcode & 0xFF) {
                    case 0x9E:
                        
                        break;
                    case 0xA1:
                        
                        break;
                }
                break;
            case 0xF000:
                switch (opcode & 0xFF) {
                    case 0x07:
                        
                        break;
                    case 0x0A:
                        
                        break;
                    case 0x15:
                        
                        break;
                    case 0x18:
                        
                        break;
                    case 0x1E:
                        
                        break;
                    case 0x29:
                        
                        break;
                    case 0x33:
                        
                        break;
                    case 0x55:
                        
                        break;
                    case 0x65:
                        
                        break;
                }

                break;

            default:
                throw new Error('Unknown opcode ' + opcode);
        }
    }

    
}