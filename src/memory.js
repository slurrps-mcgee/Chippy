//Imports from constants folder
import { MEMORY_SIZE, SPRITE_SET_ADDRESS } from "./Constants/MemoryConstants.js";
import { SPRITES } from "./Constants/CharSet.js";

//Export Class
export class Memory {
    //Called when a new instance of the class is created
    constructor() {
        //Memory properties
        //Create a new Uint8Array called memory and set it's size to 4kb of memory
        this.memory = new Uint8Array(MEMORY_SIZE);
        //Call reset on creation
        this.reset();
    }

    //Reset Memory
    reset() {
        //Clear out the array by filling it with 0
        this.memory.fill(0)
        //Load sprites into the array at the sprite_set_address
        this.memory.set(SPRITES, SPRITE_SET_ADDRESS);
    }

    //Set Memory at location index
    setMemory(index, value) {
        //Verify memory location
        this.assertMemory(index);
        //Set location value
        this.memory[index] = value;
    }

    //Get Memory at location index
    getMemory(index) {
        //Verify memory location
        this.assertMemory(index);
        //Return memory location value
        return this.memory[index];
    }

    //Get Opcode from memory at location index
    //Opcodes are two bytes
    getOpCode(index) {
        //Get the high byte from the index
        const highByte = this.getMemory(index);
        //Get the low byte from the index + 1
        const lowByte = this.getMemory(index + 1);
        //Return the opcode
        return (highByte << 8) | lowByte;
    }

    //Verify Memory is within the bounds of the array
    assertMemory(index) {
        console.assert(index >= 0 && index < MEMORY_SIZE, `Error trying to access memory at index ${index}`);
    }
}