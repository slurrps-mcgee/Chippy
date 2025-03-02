//Imports
import { LOAD_PROGRAM_ADDRESS } from "./Constants/MemoryConstants.js";
import { NUMBER_OF_REGISTERS, STACK_DEEP } from "./Constants/RegisterConstants.js";

//Export Class
export class Registers {
    constructor() {
        this.V = new Uint8Array(NUMBER_OF_REGISTERS); // 16 8-bit registers
        this.I = 0; // Memory Address
        this.stack = new Uint16Array(STACK_DEEP); // Operation Stack
        this.SP = -1; // Stack pointer
        this.PC = LOAD_PROGRAM_ADDRESS; // Program Counter

        this.DT = 0; // Delay Timer
        this.ST = 0; // Sound Timer

        this.paused = false; // Pause state
    }

    reset() {
        this.V.fill(0);
        this.I = 0;
        this.stack.fill(0);
        this.SP = -1;
        this.PC = LOAD_PROGRAM_ADDRESS;
        this.DT = 0;
        this.ST = 0;
        this.paused = false;
    }

    nextInstruction() {
        this.PC += 2;
    }

    stackPush(value) {
        if (this.SP >= STACK_DEEP - 1) {
            throw new Error("Stack Overflow: Attempted to push beyond stack depth.");
        }
        this.stack[++this.SP] = value;
    }

    stackPop() {
        if (this.SP < 0) {
            throw new Error("Stack Underflow: Attempted to pop from an empty stack.");
        }
        return this.stack[this.SP--];
    }

    updateTimers() {
        this.DT = Math.max(0, this.DT - 1);
        this.ST = Math.max(0, this.ST - 1);
    }
}