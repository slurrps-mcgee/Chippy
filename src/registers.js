import { LOAD_PROGRAM_ADDRESS, MEMORY_SIZE } from "./Constants/MemoryConstants.js";
import { NUMBER_OF_REGISTERS, STACK_DEEP } from "./Constants/RegisterConstants.js";

export class Registers {
    constructor() {
        this.V = new Uint8Array(NUMBER_OF_REGISTERS); //16 8-bit registers
        this.I = 0; //Memory Address
        this.stack = new Uint16Array(STACK_DEEP); //Operation Stack
        this.SP = -1;
        this.PC = LOAD_PROGRAM_ADDRESS; //Program Counter

        this.DT = 0; //Delay Timer
        this.ST = 0; //Sound Timer

        this.paused = false;
    }

    reset() {
        this.V = new Uint8Array(NUMBER_OF_REGISTERS); //16 8-bit registers
        this.I = 0; //Memory Address
        this.stack.fill(0); //Operation Stack
        this.SP = -1;
        this.PC = LOAD_PROGRAM_ADDRESS; //Program Counter

        this.DT = 0; //Delay Timer
        this.ST = 0; //Sound Timer

        this.paused = false;
    }

    //Push new value to stack
    stackPush(value) {
        //Increase the Stack Position
        this.SP++;
        //Assert the Stack is not Overflowing
        this.assertStackOverflow();
        //Push a value to the stack at index Stack Position
        this.stack[this.SP] = value
    }

    //Pop a new value from the stack
    stackPop() {
        //Set value to Stack index of Stack Position
        const value = this.stack[this.SP];
        //Decrease Stack Position
        this.SP--;
        //Assert the Stack is not Underflow
        this.assertStackUnderflow();
        //Return the value
        return value;
    }

    //Assert the Stack is not Overflowing
    assertStackOverflow() {
        //Assert the Stack is less than the Stack Depth
        console.assert(this.SP < STACK_DEEP, 'Error stack Overflow')
    }

    //Verify the Stack is not Underflowed
    assertStackUnderflow() {
        //Assert the Stack Position is greater than or equal to -1
        console.assert(this.SP >= -1, 'Error stack underflow')
    }
}