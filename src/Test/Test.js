//Test to act like await Task.Yield() from C#
export const wait = (millis = 0) =>
    new Promise(resolve => setTimeout(resolve, millis))

//Test Class for functions
export class Test {
    constructor() {

    }
    
    //No disassemnbler
    //CPU Instruction Executions via raw opcode
    execute(opcode) {
        //Increment the program counter for next instruction
        //Each instruction is 2 bytes to increment by 2
        this.registers.PC += 2;

        //Test Disassembler Debug
        const { instruction, args } = this.disassember.disassemble(opcode);
        const { id } = instruction;

        console.log('i', instruction);
        console.log('a', args);
        console.log('id', id);



        //Second Value 2nd nibble then shift right by 8
        let x = (opcode & 0x0F00) >> 8;
        //Third Value 3rd nibble then shift right by 4
        let y = (opcode & 0x00F0) >> 4;

        //Use opcode with mask to determine execution
        switch (opcode & 0xF000) {
            case 0x0000:
                switch (opcode) {
                    case 0x00E0:
                        this.display.reset();
                        break;
                    case 0x00EE:
                        this.registers.PC = this.registers.stackPop();
                        break;
                }
                break;
            case 0x1000:
                this.registers.PC = (opcode & 0xFFF);
                break;
            case 0x2000:
                this.registers.stackPush(this.registers.PC);
                this.registers.PC = (opcode & 0xFFF);
                break;
            case 0x3000:
                if (this.registers.V[x] === (opcode & 0xFF)) {
                    this.registers.PC += 2;
                }
                break;
            case 0x4000:
                if (this.registers.V[x] !== (opcode & 0xFF)) {
                    this.registers.PC += 2;
                }
                break;
            case 0x5000:
                if (this.registers.V[x] === this.registers.V[y]) {
                    this.registers.PC += 2;
                }
                break;
            case 0x6000:
                this.registers.V[x] = (opcode & 0xFF);
                break;
            case 0x7000:
                this.registers.V[x] += (opcode & 0xFF);
                break;
            case 0x8000:
                switch (opcode & 0xF) {
                    case 0x0:
                        this.registers.V[x] = this.registers.V[y];
                        break;
                    case 0x1:
                        //Bitwise OR
                        this.registers.V[x] |= this.registers.V[y];
                        break;
                    case 0x2:
                        ///Bitwise AND
                        this.registers.V[x] &= this.registers.V[y];
                        break;
                    case 0x3:
                        //Bitwise XOR
                        this.registers.V[x] ^= this.registers.V[y];
                        break;
                    case 0x4:
                        let sum = (this.registers.V[x] += this.registers.V[y]);

                        this.registers.V[0xF] = 0;

                        if (sum > 0xFF) {
                            this.registers.V[0xF] = 1;
                        }

                        this.registers.V[x] = sum;
                        break;
                    case 0x5:
                        this.registers.V[0xF] = 0;

                        if (this.registers.V[x] > this.registers.V[y]) {
                            this.registers.V[0xF] = 1;
                        }

                        this.registers.V[x] -= this.registers.V[y];
                        break;
                    case 0x6:
                        this.registers.V[0xF] = (this.registers.V[x] & 0x1);

                        //Quirk Behavior
                        if (this.quirk === "No Quirk") {
                            //Original CHIP 8
                            this.registers.V[x] = this.registers.V[y] >>= 1;
                        }
                        else {
                            //Default
                            //CHIP48 and SCHIP behavior
                            this.registers.V[x] >>= 1;
                        }
                        break;
                    case 0x7:
                        this.registers.V[0xF] = 0;

                        if (this.registers.V[y] > this.registers.V[x]) {
                            this.registers.V[0xF] = 1;
                        }

                        this.registers.V[x] = this.registers.V[y] - this.registers.V[x];
                        break;
                    case 0xE:
                        this.registers.V[0xF] = (this.registers.V[x] & 0x80);
                        this.registers.V[x] <<= 1;
                        break;
                }

                break;
            case 0x9000:
                if (this.registers.V[x] !== this.registers.V[y]) {
                    this.registers.PC += 2;
                }
                break;
            case 0xA000:
                this.registers.I = (opcode & 0xFFF);
                break;
            case 0xB000:
                this.registers.PC = (opcode & 0xFFF) + this.registers.V[0];
                break;
            case 0xC000:
                let rand = Math.floor(Math.random() * 0xFF);

                this.registers.V[x] = rand & (opcode & 0xFF);
                break;
            case 0xD000: //Draws Pixels
                let width = SPRITE_WIDTH;
                let height = (opcode & 0xF);

                this.registers.V[0xF] = 0;

                for (let row = 0; row < height; row++) {
                    let sprite = this.memory.memory[this.registers.I + row];

                    for (let col = 0; col < width; col++) {
                        if ((sprite & 0x80) > 0) {
                            //If setPixel returns 1, a pixel was erased and set VF to 1
                            if (this.display.setPixel(this.registers.V[x] + col, this.registers.V[y] + row)) {
                                this.registers.V[0xF] = 1;
                            }
                        }
                        //Shift the sprite left 1, this will move to the next col/bit
                        //Ex. 10010000 << 1 will become 0010000
                        sprite <<= 1;
                    }
                }

                this.drawFlag = true;
                break;
            case 0xE000:
                switch (opcode & 0xFF) {
                    case 0x9E:
                        if (this.keyboard.isKeyPressed(this.registers.V[x])) {
                            this.registers.PC += 2;
                        }
                        break;
                    case 0xA1:
                        if (!this.keyboard.isKeyPressed(this.registers.V[x])) {
                            this.registers.PC += 2;
                        }
                        break;
                }
                break;
            case 0xF000:
                switch (opcode & 0xFF) {
                    case 0x07:
                        this.registers.V[x] = this.registers.DT;
                        break;
                    case 0x0A:
                        this.registers.paused = true;

                        this.keyboard.onNextKeyPress = function (key) {
                            this.registers.V[x] = key;
                            this.registers.paused = false;
                        }.bind(this);
                        break;
                    case 0x15:
                        this.registers.DT = this.registers.V[x];
                        break;
                    case 0x18:
                        this.registers.ST = this.registers.V[x];
                        break;
                    case 0x1E:
                        this.registers.I += this.registers.V[x];
                        break;
                    case 0x29:
                        this.registers.I = this.registers.V[x] * 5;
                        break;
                    case 0x33:
                        //Get Hundreds place
                        this.memory.memory[this.registers.I] = parseInt(this.registers.V[x] / 100);
                        //Get Tens place
                        this.memory.memory[this.registers.I + 1] = parseInt((this.registers.V[x] % 100) / 10);
                        //Get Ones place
                        this.memory.memory[this.registers.I + 2] = parseInt(this.registers.V[x] % 10);
                        break;
                    case 0x55:
                        //Test for Chip8 variation
                        for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
                            this.memory.memory[this.registers.I + registerIndex] = this.registers.V[registerIndex];
                        }

                        //Check for quirk
                        if (this.quirk === "No Quirk") {
                            this.registers.I += x + 1;
                        }
                        else if (this.quirk === "Shift and Load Quirk") {
                            this.registers.I += x;
                        }
                        break;
                    case 0x65:
                        for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
                            this.registers.V[registerIndex] = this.memory.memory[this.registers.I + registerIndex];
                        }

                        //Check for quirk
                        if (this.quirk === "No Quirk") {
                            this.registers.I += x + 1;
                        }
                        else if (this.quirk === "Shift and Load Qurk") {
                            this.registers.I += x;
                        }
                        break;
                }
                break;

            default:
                throw new Error('Unknown opcode ' + opcode);
        }

    }
}
    
