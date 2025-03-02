// Imports
import { INSTRUCTION_SET } from './Constants/InstructionSet.js';

// Export class
export class Disassembler {
  // Disassemble a given opcode
  disassemble(opcode) {
    try {
      // Find the instruction that matches the given opcode
      const instruction = INSTRUCTION_SET.find(
        (instr) => (opcode & instr.mask) === instr.pattern
      );

      if (!instruction) {
        console.error(`Opcode not found: 0x${opcode.toString(16)}`);
        return { instruction: null, args: [] };
      }

      // Extract arguments based on the instruction's argument masks and shifts
      const args = instruction.arguments.map(
        (arg) => (opcode & arg.mask) >> arg.shift
      );

      return { instruction, args };
    } catch (error) {
      console.error(`Error disassembling opcode: 0x${opcode.toString(16)}`, error);
      return { instruction: null, args: [] };
    }
  }
}
