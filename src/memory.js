//Imports from constants folder
import { MEMORY_SIZE, SPRITE_SET_ADDRESS } from "./Constants/MemoryConstants.js";
import { SPRITES } from "./Constants/CharSet.js";

//Export Class
export class Memory {
    constructor() {
        this.memory = new Uint8Array(MEMORY_SIZE);
        this.reset();
    }

    reset() {
        this.memory.fill(0);
        this.memory.set(SPRITES, SPRITE_SET_ADDRESS);
    }

    setMemory(index, value) {
        this.assertMemory(index);
        this.memory[index] = value;
    }

    getMemory(index) {
        this.assertMemory(index);
        return this.memory[index];
    }


    getOpCode(index) {
        this.assertMemory(index + 1); // Ensure the next byte is within bounds
        return (this.memory[index] << 8) | this.memory[index + 1];
    }

    assertMemory(index) {
        if (index < 0 || index >= MEMORY_SIZE) {
            throw new Error(`Memory access out of bounds at index ${index}`);
        }
    }
}