//This is the CPU which interacts with the rest of the hardware. It's main task is to performe a CPU Cycle measured in steps per cycle
//Each Cycle will run  10 steps taking in OPCodes and executing them.

import { SPRITES, SPRITE_WIDTH } from "./Constants/CharSet.js";
import { STEP_SPEED } from "./Constants/CPUConstants.js";
import { LOAD_PROGRAM_ADDRESS, MEMORY_SIZE, SPRITE_SET_ADDRESS } from "./Constants/MemoryConstants.js";
import { Memory } from "./memory.js"
import { Registers } from "./registers.js";
import { Debug } from "./debug.js";
import { Disassembler } from './disassembler.js';

export class CPU {
    constructor(display, keyboard, speaker) {
        //Hardware
        this.display = display;
        this.keyboard = keyboard;
        this.speaker = speaker;

        //CPU Memory
        this.memory = new Memory();
        //CPU Registers
        this.registers = new Registers();

        //Holds the current OpCode Instruction
        this.opcode
        //Opcode Disassembler
        this.disassember = new Disassembler();

        //Instruction Speed
        this.speed = STEP_SPEED;
        //Handles Shift Quirk for Variations of Chip 8
        this.quirk = "Shift and Load Qurk";
        
        //Holds whether a pixel was drawn
        this.drawFlag = false;

        //Handles Debug operations
        this.debug = new Debug();
    }

    //Resets the CPU
    reset() {
        //Reset Memory, Registers, and Display
        this.memory.reset();
        this.registers.reset();
        this.display.reset();

        this.debug.reset();

        //Load Sprites into memory
        this.loadSpritesIntoMemory();
    }

    //Handled by requestAnimationFrame() method in chip8 file
    // //Sleep Function used to stop program from freezing
    // sleep(ms = TIME_60_HZ) {
    //     return new Promise((resolve) => setTimeout(resolve, ms));
    // }

    //Load Sprites into memory
    loadSpritesIntoMemory() {
        //Load sprite array into memory starting at the sprite address 0x00
        this.memory.memory.set(SPRITES, SPRITE_SET_ADDRESS);
    }

    ///Loads a selected rom into an arrayBuffer then calls loadRomIntoMemory
    async loadRom(romName) {
        const rom = await fetch(`./roms/${romName}`);

        //Load the Rom
        const arrayBuffer = await rom.arrayBuffer();
        const romBuffer = new Uint8Array(arrayBuffer);

        //console.log(`${romName} loaded`);
        this.loadRomIntoMemory(romBuffer);

    }

    //Load a given romBuffer into memory
    loadRomIntoMemory(romBuffer) {
        this.reset(); //Reset Registers, Memory, and Display

        //Check romBuffer Length + Loader address is less than memory size
        console.assert(romBuffer.length + LOAD_PROGRAM_ADDRESS <= MEMORY_SIZE, "Error rom is too large");

        //Insert rom into memory at location 0x200
        this.memory.memory.set(romBuffer, LOAD_PROGRAM_ADDRESS);
    }

    //A CPU Cycle
    async cycle() {
        for (let i = 0; i < this.speed; i++) {
            if (!this.registers.paused) {
                this.step();

            }
        }

        if (!this.registers.paused) {
            this.updateTimers();
        }

        this.playSound(); //Play sound

        //Render only if flag is true
        if (this.drawFlag) {
            this.display.render(); //Render display
            this.drawFlag = false;
        }
    }

    //A single instruction
    async step() {
        //This is where the memory errors will come from 
        this.opcode = this.memory.getOpCode(this.registers.PC); //Error is here
        //console.log(this.opcode);

        if (this.opcode !== 0) {
            this.executeInstruction(this.opcode);

            //this.debug.log(this.opcode);

            //Debug Purposes all can be turned off with no issue
            await this.debug.DebugRegisters(this);
            this.debug.printLast();
        }
    }

    //Update system timers
    updateTimers() {
        if (this.registers.DT > 0) {
            this.registers.DT -= 1;
        }

        if (this.registers.ST > 0) {
            this.registers.ST -= 1;
        }
    }

    //Play Sound
    playSound() {
        if (this.registers.ST > 0) {
            //Play
            this.speaker.enableSound();
        }
        else {
            //Stop
            this.speaker.disableSound();
        }
    }

    //Using Disassembler
    async executeInstruction(opcode) {
        //Increment the program counter for next instruction
        //Each instruction is 2 bytes to increment by 2
        this.registers.PC += 2;

        //Test Disassembler Debug
        const { instruction, args } = this.disassember.disassemble(opcode);
        const { id } = instruction;

        this.debug.logOpcode(`${opcode}: ${id}`)
        // console.log('i', instruction);
        // console.log('a', args);
        // console.log('id', id);

        //Details on each instruction can be found inside the Constants/InstructinoSet.js file
        switch (id) {
            case 'CLS':
                this.display.reset();
                break;
            case 'RET':
                this.registers.PC = this.registers.stackPop();
                break;
            case 'JP_ADDR':
                this.registers.PC = args[0];
                break;
            case 'CALL_ADDR':
                this.registers.stackPush(this.registers.PC);
                this.registers.PC = args[0];
                break;
            case 'SE_VX_KK':
                if (this.registers.V[args[0]] === args[1]) {
                    this.registers.PC += 2;
                }
                break;
            case 'SNE_VX_KK':
                if (this.registers.V[args[0]] !== args[1]) {
                    this.registers.PC += 2;
                }
                break;
            case 'SE_VX_VY':
                if (this.registers.V[args[0]] === this.registers.V[args[1]]) {
                    this.registers.PC += 2;
                }
                break;
            case 'LD_VX_KK':
                this.registers.V[args[0]] = args[1];
                break;
            case 'ADD_VX_KK':
                this.registers.V[args[0]] += args[1];
                break;
            case 'LD_VX_VY':
                this.registers.V[args[0]] = this.registers.V[args[1]];
                break;
            case 'OR_VX_VY':
                this.registers.V[args[0]] |= this.registers.V[args[1]];
                break;
            case 'AND_VX_VY':
                this.registers.V[args[0]] &= this.registers.V[args[1]];
                break;
            case 'XOR_VX_VY':
                this.registers.V[args[0]] ^= this.registers.V[args[1]];
                break;
            case 'ADD_VX_VY':
                let sum = (this.registers.V[args[0]] += this.registers.V[args[1]]);

                this.registers.V[0xF] = 0;

                if (sum > 0xFF) {
                    this.registers.V[0xF] = 1;
                }

                this.registers.V[args[0]] = sum;
                break;
            case 'SUB_VX_VY':
                this.registers.V[0xF] = 0;

                if (this.registers.V[args[0]] > this.registers.V[args[1]]) {
                    this.registers.V[0xF] = 1;
                }

                this.registers.V[args[0]] -= this.registers.V[args[1]];
                break;
            case 'SHR_VX_VY':
                this.registers.V[0xF] = (this.registers.V[args[0]] & 0x1);

                //Quirk Behavior
                if (this.quirk === "No Quirk") {
                    //Original CHIP 8
                    this.registers.V[args[0]] = this.registers.V[args[1]] >>= 1;
                }
                else {
                    //Default
                    //CHIP48 and SCHIP behavior
                    this.registers.V[args[0]] >>= 1;
                }
                break;
            case 'SUBN_VX_VY':
                this.registers.V[0xF] = 0;

                if (this.registers.V[args[1]] > this.registers.V[args[0]]) {
                    this.registers.V[0xF] = 1;
                }

                this.registers.V[args[0]] = this.registers.V[args[1]] - this.registers.V[args[0]];

                break;
            case 'SHL_VX_VY':
                this.registers.V[0xF] = (this.registers.V[args[0]] & 0x80);
                this.registers.V[args[0]] <<= 1;
                break;
            case 'SNE_VX_VY':
                if (this.registers.V[args[0]] !== this.registers.V[args[1]]) {
                    this.registers.PC += 2;
                }
                break;
            case 'LD_I_ADDR':
                this.registers.I = args[0];
                break;
            case 'JP_V0_ADDR':
                this.registers.PC = (args[0]) + this.registers.V[0];
                break;
            case 'RND_VX_KK':
                let rand = Math.floor(Math.random() * 0xFF);

                this.registers.V[args[0]] = rand & (opcode & 0xFF);
                break;
            case 'DRW_VX_VY_N':
                let width = SPRITE_WIDTH;
                let height = (opcode & 0xF);

                this.registers.V[0xF] = 0;

                for (let row = 0; row < height; row++) {
                    let sprite = this.memory.memory[this.registers.I + row];

                    for (let col = 0; col < width; col++) {
                        if ((sprite & 0x80) > 0) {
                            //If setPixel returns 1, a pixel was erased and set VF to 1
                            if (this.display.setPixel(this.registers.V[args[0]] + col, this.registers.V[args[1]] + row)) {
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
            case 'SKP_VX':
                if (this.keyboard.isKeyPressed(this.registers.V[args[0]])) {
                    this.registers.PC += 2;
                }
                break;
            case 'SKNP_VX':
                if (!this.keyboard.isKeyPressed(this.registers.V[args[0]])) {
                    this.registers.PC += 2;
                }
                break;
            case 'LD_VX_DT':
                this.registers.V[args[0]] = this.registers.DT;
                break;
            case 'LD_VX_K':
                this.registers.paused = true;

                this.keyboard.onNextKeyPress = function (key) {
                    this.registers.V[args[0]] = key;
                    this.registers.paused = false;
                }.bind(this);
                break;
            case 'LD_DT_VX':
                this.registers.DT = this.registers.V[args[0]];
                break;
            case 'LD_ST_VX':
                this.registers.ST = this.registers.V[args[0]];
                break;
            case 'ADD_I_VX':
                this.registers.I += this.registers.V[args[0]];
                break;
            case 'LD_F_VX':
                this.registers.I = this.registers.V[args[0]] * 5;
                break;
            case 'LD_B_VX':
                //Get Hundreds place
                this.memory.memory[this.registers.I] = parseInt(this.registers.V[args[0]] / 100);
                //Get Tens place
                this.memory.memory[this.registers.I + 1] = parseInt((this.registers.V[args[0]] % 100) / 10);
                //Get Ones place
                this.memory.memory[this.registers.I + 2] = parseInt(this.registers.V[args[0]] % 10);
                break;
            case 'LD_I_VX':
                //Test for Chip8 variation
                for (let registerIndex = 0; registerIndex <= args[0]; registerIndex++) {
                    this.memory.memory[this.registers.I + registerIndex] = this.registers.V[registerIndex];
                }

                //Check for quirk
                if (this.quirk === "No Quirk") {
                    this.registers.I += args[0] + 1;
                }
                else if (this.quirk === "Shift and Load Quirk") {
                    this.registers.I += args[0];
                }
                break;
            case 'LD_VX_I':
                for (let registerIndex = 0; registerIndex <= args[0]; registerIndex++) {
                    this.registers.V[registerIndex] = this.memory.memory[this.registers.I + registerIndex];
                }

                //Check for quirk
                if (this.quirk === "No Quirk") {
                    this.registers.I += args[0] + 1;
                }
                else if (this.quirk === "Shift and Load Qurk") {
                    this.registers.I += args[0];
                }
                break;
            default:
                console.error(`Instruction with id ${id} not found`, instruction, args);
        }
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