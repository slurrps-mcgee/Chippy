import { MEMORY_SIZE, SPRITE_SET_ADDRESS } from "./Constants/MemoryConstants.js";
import { SPRITES } from "./Constants/CharSet.js";

export class Memory {
    constructor() {
        //4kb of memory
        this.memory = new Uint8Array(MEMORY_SIZE);
        this.reset();
    }

    reset() {
        this.memory.fill(0)
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
        const highByte = this.getMemory(index);
        const lowByte = this.getMemory(index + 1);
        return (highByte << 8) | lowByte;
    }

    assertMemory(index) {
        console.assert(index >= 0 && index < MEMORY_SIZE, `Error trying to access memory at index ${index}`);
    }
}