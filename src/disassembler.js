//Imports
import { INSTRUCTION_SET } from './Constants/InstructionSet.js';

//Export class
export class Disassembler {

  //Disassemble a given opcode
  disassemble(opcode) {
    try {
        //Constants
        //instruction set to found instruction from the InstructionSet
        const instruction = INSTRUCTION_SET.find(
        //opcode & bitwise instruction.mask === instruction.pattern
        (instruction) => (opcode & instruction.mask) === instruction.pattern
        );
        //args = instruction.argurments
        const args = instruction.arguments.map(
        //opcode & arg.mask >> arg.shift
        (arg) => (opcode & arg.mask) >> arg.shift
        );
        //Return instruction, args
        return {
            instruction,
            args
        };
    }
    catch {
        console.log(`opcode not found ${opcode}`)
        return {
            instruction: null,
            args: null
        }
    }      
  }
}