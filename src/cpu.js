import { SPRITE_WIDTH } from "./Constants/CharSet.js";
import { CHIP8_SPEED } from "./Constants/CPUConstants.js";
import { LOAD_PROGRAM_ADDRESS, MEMORY_SIZE } from "./Constants/MemoryConstants.js";
import { Memory } from "./memory.js";
import { Registers } from "./registers.js";
import { Debug } from "./debug.js";
import { Disassembler } from './disassembler.js';


export class CPU {
    constructor(display, keyboard, speaker) {
        // Hardware
        this.display = display;
        this.keyboard = keyboard;
        this.speaker = speaker;
        this.memory = new Memory();
        this.registers = new Registers();
        this.disassembler = new Disassembler();

        // Variables
        this.speed = CHIP8_SPEED;

        // Quirks
        this.noquirk = true;
        this.shiftquirk = false;
        this.loadquirk = false;

        // Opcode
        this.opcode;

        // DrawFlag
        this.drawFlag = false;

        this.debug = new Debug();
    }

    // Resets the CPU
    reset() {
        // Reset Memory, Registers, and Display
        this.memory.reset();
        this.registers.reset();
        this.display.reset();
    }

    // Loads a selected ROM into an arrayBuffer then calls loadRomIntoMemory
    async loadRom(rom) {
        const arrayBuffer = await rom.arrayBuffer();
        const romBuffer = new Uint8Array(arrayBuffer);

        // Load ROM into memory
        this.loadRomIntoMemory(romBuffer);

        // Set pause button text
        document.getElementById('pause').innerHTML = "Pause";
    }

    // Load a given romBuffer into memory
    loadRomIntoMemory(romBuffer) {
        this.reset(); // Reset Registers, Memory, and Display

        // Ensure the ROM size fits within memory
        console.assert(romBuffer.length + LOAD_PROGRAM_ADDRESS <= MEMORY_SIZE, "Error: ROM is too large");

        // Insert ROM into memory starting at address 0x200
        this.memory.memory.set(romBuffer, LOAD_PROGRAM_ADDRESS);
    }

    // CPU Cycle
    cycle() {
        for (let i = 0; i < this.speed; i++) {
            if (!this.registers.paused) {
                this.step();
            }
        }

        // Update timers
        this.registers.updateTimers();

        // Play sound
        this.speaker.playSound(this.registers.ST);

        // Render display if drawFlag is true
        if (this.drawFlag) {
            this.display.render();
            this.drawFlag = false;
        }
    }

    // Executes one Chip8 instruction
    step() {
        // Get opcode from memory (2 bytes)
        this.opcode = this.memory.getOpCode(this.registers.PC);

        if (this.opcode !== 0) {
            // Execute instruction with opcode
            this.executeInstruction(this.opcode);
            this.debug.DebugRegisters(this);
        }
    }

    //Using Disassembler
    executeInstruction(opcode) {
        // Increment the program counter (2 bytes per instruction)
        this.registers.nextInstruction();

        // Disassemble the opcode
        const { instruction, args } = this.disassembler.disassemble(opcode);

        if (!instruction) {
            console.error(`Invalid opcode: 0x${opcode.toString(16)}`);
            return; // Exit if instruction is null
        }

        const { id } = instruction;


        //To hex or not to hex?
        //this.debug.logOpcode(`${instruction.id}: 0x${opcode.toString(16)}`)

        //Details on each instruction can be found inside the Constants/InstructinoSet.js file
        //This includes name, mask, pattern, and arguments
        switch (id) {
            //Chip8 Instructions
            //00E0
            case 'CLS':
                this.display.reset();
                break;
            //00EE
            case 'RET':
                this.registers.PC = this.registers.stackPop();
                break;
            //1NNN
            case 'JP_ADDR':
                this.registers.PC = args[0];
                break;
            //2NNN
            case 'CALL_ADDR':
                this.registers.stackPush(this.registers.PC);
                this.registers.PC = args[0];
                break;
            //3XKK
            case 'SE_VX_KK':
                if (this.registers.V[args[0]] === args[1]) {
                    this.registers.nextInstruction(); //Skip to next instruction
                }
                break;
            //4XKK
            case 'SNE_VX_KK':
                if (this.registers.V[args[0]] !== args[1]) {
                    this.registers.nextInstruction(); //Skip to next instruction
                }
                break;
            //5XY0
            case 'SE_VX_VY':
                if (this.registers.V[args[0]] === this.registers.V[args[1]]) {
                    this.registers.nextInstruction(); //Skip to next instruction
                }
                break;
            //6XKK
            case 'LD_VX_KK':
                this.registers.V[args[0]] = args[1];
                break;
            //7XKK
            case 'ADD_VX_KK':
                this.registers.V[args[0]] += args[1];
                break;
            //8XY0
            case 'LD_VX_VY':
                this.registers.V[args[0]] = this.registers.V[args[1]];
                break;
            //8XY1
            case 'OR_VX_VY':
                this.registers.V[args[0]] |= this.registers.V[args[1]];
                break;
            //8XY2
            case 'AND_VX_VY':
                this.registers.V[args[0]] &= this.registers.V[args[1]];
                break;
            //8XY3
            case 'XOR_VX_VY':
                this.registers.V[args[0]] ^= this.registers.V[args[1]];
                break;
            //8XY4
            case 'ADD_VX_VY':
                var vf = this.registers.V[args[0]] + this.registers.V[args[1]] > 0xff ? 1 : 0;
                this.registers.V[args[0]] += this.registers.V[args[1]];
                this.registers.V[0xF] = vf;
                break;
            //8XY5
            case 'SUB_VX_VY':
                var vf = this.registers.V[args[0]] >= this.registers.V[args[1]] ? 1 : 0;
                this.registers.V[args[0]] -= this.registers.V[args[1]];
                this.registers.V[0xF] = vf;
                break;
            //8XY6
            case 'SHR_VX_VY':
                //Check for quirk
                // if (this.quirk === "shift") {
                //     //Set Vf to result of (Vx & 0x1)
                //      this.registers.V[0xF] = this.registers.V[args[0]] & 1;
                //      this.registers.V[args[0]]  >>= 1;
                //}    

                //Set Vf to least significant bit and set Vx to Vy shifted right 1 bit
                var vf = this.registers.V[args[1]] & 1;
                this.registers.V[args[0]] = this.registers.V[args[1]] >>= 1;
                this.registers.V[0xF] = vf;
                break;
            //8XY7
            case 'SUBN_VX_VY':
                var vf = this.registers.V[args[1]] >= this.registers.V[args[0]] ? 1 : 0;
                this.registers.V[args[0]] = this.registers.V[args[1]] - this.registers.V[args[0]];
                this.registers.V[0xF] = vf;
                break;
            //8XYE
            case 'SHL_VX_VY':
                //Check for quirk
                // if (this.quirk === "shift") {
                //     //Set Vf to result of (Vx & 0x1)
                //      this.registers.V[0xF] = this.registers.V[args[0]] >> 7;
                //      this.registers.V[args[0]]  <<= 1;
                //} 

                //Set Vf to most significant bit and then set Vx to Vy shifted left 1 bit
                var vf = this.registers.V[args[1]] >> 7;
                this.registers.V[args[0]] = this.registers.V[args[1]] <<= 1;
                this.registers.V[0xF] = vf;
                break;
            //9XY0
            case 'SNE_VX_VY':
                if (this.registers.V[args[0]] !== this.registers.V[args[1]]) {
                    this.registers.PC += 2;
                }
                break;
            //ANNN
            case 'LD_I_ADDR':
                this.registers.I = args[0];
                break;
            //BNNN
            case 'JP_V0_ADDR':
                this.registers.PC = (args[0]) + this.registers.V[0];
                break;
            //CXKK
            case 'RND_VX_KK':
                const rand = Math.floor(Math.random() * 0xFF);

                this.registers.V[args[0]] = rand & (opcode & 0xFF);
                break;
            //DXYN
            //Add checks to avoid OOB
            case 'DRW_VX_VY_N':
                const width = SPRITE_WIDTH;
                const height = (opcode & 0xF);

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
            //EX9E
            case 'SKP_VX':
                if (this.keyboard.isKeyPressed(this.registers.V[args[0]])) {
                    this.registers.nextInstruction(); //Skip to next instruction
                }
                break;
            //EXA1
            case 'SKNP_VX':
                if (!this.keyboard.isKeyPressed(this.registers.V[args[0]])) {
                    this.registers.nextInstruction(); //Skip to next instruction
                }
                break;
            //FX07
            case 'LD_VX_DT':
                this.registers.V[args[0]] = this.registers.DT;
                break;
            //FX0A
            //Need to inquire how to properly stop and wait execution for keypress and release
            case 'LD_VX_K':
                this.registers.paused = true;
                this.keyboard.onNextKeyPress = function (key) {
                    this.registers.V[args[0]] = key;
                    this.registers.paused = false;
                }.bind(this);
                break;
            //FX15
            case 'LD_DT_VX':
                this.registers.DT = this.registers.V[args[0]];
                break;
            //FX18
            case 'LD_ST_VX':
                this.registers.ST = this.registers.V[args[0]];
                break;
            //FX1E
            case 'ADD_I_VX':
                this.registers.I += this.registers.V[args[0]];
                break;
            //FX29
            case 'LD_F_VX':
                this.registers.I = this.registers.V[args[0]] * 5;
                break;
            //FX33
            case 'LD_B_VX':
                //Get Hundreds place
                this.memory.memory[this.registers.I] = parseInt(this.registers.V[args[0]] / 100);
                //Get Tens place
                this.memory.memory[this.registers.I + 1] = parseInt((this.registers.V[args[0]] % 100) / 10);
                //Get Ones place
                this.memory.memory[this.registers.I + 2] = parseInt(this.registers.V[args[0]] % 10);
                break;
            //FX55
            case 'LD_I_VX':
                for (let registerIndex = 0; registerIndex <= args[0]; registerIndex++) {
                    this.memory.memory[this.registers.I + registerIndex] = this.registers.V[registerIndex];
                }

                //Check for quirk
                // if (this.quirk === "loadStore") {
                //     this.registers.I += args[0] + 1;
                //}
                break;
            //FX65
            case 'LD_VX_I':
                for (let registerIndex = 0; registerIndex <= args[0]; registerIndex++) {
                    this.registers.V[registerIndex] = this.memory.memory[this.registers.I + registerIndex];
                }

                //Check for quirk
                // if (this.quirk === "loadStore") {
                //     this.registers.I += args[0] + 1;
                //}
                break;
            //Error invalid opcode
            default:
                console.error(`Instruction with id ${id} not found`, instruction, args);
                break;
        }
    }
}