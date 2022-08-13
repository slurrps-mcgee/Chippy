//Export Constants
export const MASK_NNN = { mask: 0x0fff }; //NNN
export const MASK_N = { mask: 0x000f }; //Nibble
export const MASK_X = { mask: 0x0f00, shift: 8 }; //X
export const MASK_Y = { mask: 0x00f0, shift: 4 }; //Y
export const MASK_KK = { mask: 0x00ff }; //KK
export const MASK_HIGHEST_BYTE = 0xf000; //High byte
export const MASK_HIGHEST_AND_LOWEST_BYTE = 0xf00f; //High and Low byte
//Instruction Set Array
export const INSTRUCTION_SET = [

  //Clear the display.
  {
    key: 2,
    id: 'CLS',
    name: 'CLS',
    mask: 0xffff,
    pattern: 0x00e0,
    arguments: [],
  },

  //Return from a subroutine
  //The interpreter sets the program counter to the address at the top of the stack, then subtracts 1 from the stack pointer.
  {
    key: 3,
    id: 'RET',
    name: 'RET',
    mask: 0xffff,
    pattern: 0x00ee,
    arguments: [],
  },

  //Jump to location nnn.
  //The interpreter sets the program counter to nnn.
  {
    key: 4,
    id: 'JP_ADDR',
    name: 'JP',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0x1000,
    arguments: [MASK_NNN],
  },

  //Call subroutine at nnn.
  //The interpreter increments the stack pointer, then puts the current PC on the top of the stack. The PC is then set to nnn.
  {
    key: 5,
    id: 'CALL_ADDR',
    name: 'CALL',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0x2000,
    arguments: [MASK_NNN],
  },
  
  //Skip next instruction if Vx = kk.
  //The interpreter compares register Vx to kk, and if they are equal, increments the program counter by 2.
  {
    key: 6,
    id: 'SE_VX_KK',
    name: 'SE',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0x3000,
    arguments: [MASK_X, MASK_KK],
  },

  //Skip next instruction if Vx != kk.
  //The interpreter compares register Vx to kk, and if they are not equal, increments the program counter by 2.
  {
    key: 7,
    id: 'SNE_VX_KK',
    name: 'SNE',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0x4000,
    arguments: [MASK_X, MASK_KK],
  },

  //Skip next instruction if Vx = Vy.
  //The interpreter compares register Vx to register Vy, and if they are equal, increments the program counter by 2.
  {
    key: 8,
    id: 'SE_VX_VY',
    name: 'SE',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x5000,
    arguments: [MASK_X, MASK_Y],
  },

  //Set Vx = kk.
  //The interpreter puts the value kk into register Vx.
  {
    key: 9,
    id: 'LD_VX_KK',
    name: 'LD',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0x6000,
    arguments: [MASK_X, MASK_KK],
  },

  //Set Vx = Vx + kk.
  //Adds the value kk to the value of register Vx, then stores the result in Vx.
  {
    key: 10,
    id: 'ADD_VX_KK',
    name: 'ADD',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0x7000,
    arguments: [MASK_X, MASK_KK],
  },

  //Set Vx = Vy.
  //Stores the value of register Vy in register Vx.
  {
    key: 11,
    id: 'LD_VX_VY',
    name: 'LD',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x8000,
    arguments: [MASK_X, MASK_Y],
  },

  //Set Vx = Vx OR Vy.
  //Performs a bitwise OR on the values of Vx and Vy, then stores the result in Vx. A bitwise OR compares 
  //the corrseponding bits from two values, and if either bit is 1, then the same bit in the result is also 1. Otherwise, it is 0.
  {
    key: 12,
    id: 'OR_VX_VY',
    name: 'OR',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x8001,
    arguments: [MASK_X, MASK_Y],
  },

  //Set Vx = Vx AND Vy.
  //Performs a bitwise AND on the values of Vx and Vy, then stores the result in Vx. A bitwise AND compares the corrseponding 
  //bits from two values, and if both bits are 1, then the same bit in the result is also 1. Otherwise, it is 0.
  {
    key: 13,
    id: 'AND_VX_VY',
    name: 'AND',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x8002,
    arguments: [MASK_X, MASK_Y],
  },

  //Set Vx = Vx XOR Vy.
  //Performs a bitwise exclusive OR on the values of Vx and Vy, then stores the result in Vx. An exclusive OR compares the 
  //corrseponding bits from two values, and if the bits are not both the same, then the corresponding bit in the result is set to 1. Otherwise, it is 0.
  {
    key: 14,
    id: 'XOR_VX_VY',
    name: 'XOR',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x8003,
    arguments: [MASK_X, MASK_Y],
  },

  //Set Vx = Vx + Vy, set VF = carry.
  //The values of Vx and Vy are added together. If the result is greater than 8 bits (i.e., > 255,) VF is set to 1, otherwise 0.
  //Only the lowest 8 bits of the result are kept, and stored in Vx.
  {
    key: 15,
    id: 'ADD_VX_VY',
    name: 'ADD',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x8004,
    arguments: [MASK_X, MASK_Y],
  },

  //Set Vx = Vx - Vy, set VF = NOT borrow.
  //If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from Vx, and the results stored in Vx.
  {
    key: 16,
    id: 'SUB_VX_VY',
    name: 'SUB',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x8005,
    arguments: [MASK_X, MASK_Y],
  },

  //Set Vx = Vx SHR 1.
  //If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2.
  {
    key: 17,
    id: 'SHR_VX_VY',
    name: 'SHR',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x8006,
    arguments: [MASK_X, MASK_Y],
  },

  //Set Vx = Vy - Vx, set VF = NOT borrow.
  //If Vy > Vx, then VF is set to 1, otherwise 0. Then Vx is subtracted from Vy, and the results stored in Vx.
  {
    key: 18,
    id: 'SUBN_VX_VY',
    name: 'SUBN',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x8007,
    arguments: [MASK_X, MASK_Y],
  },

  //Set Vx = Vx SHL 1.
  //If the most-significant bit of Vx is 1, then VF is set to 1, otherwise to 0. Then Vx is multiplied by 2.
  {
    key: 19,
    id: 'SHL_VX_VY',
    name: 'SHL',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x800e,
    arguments: [MASK_X, MASK_Y],
  },

  //Skip next instruction if Vx != Vy.
  //The values of Vx and Vy are compared, and if they are not equal, the program counter is increased by 2.
  {
    key: 20,
    id: 'SNE_VX_VY',
    name: 'SNE',
    mask: MASK_HIGHEST_AND_LOWEST_BYTE,
    pattern: 0x9000,
    arguments: [MASK_X, MASK_Y],
  },

  //Set I = nnn.
  //The value of register I is set to nnn.
  {
    key: 21,
    id: 'LD_I_ADDR',
    name: 'LD',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0xa000,
    arguments: [MASK_NNN],
  },

  //Jump to location nnn + V0.
  //The program counter is set to nnn plus the value of V0.
  {
    key: 22,
    id: 'JP_V0_ADDR',
    name: 'JP',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0xb000,
    arguments: [MASK_NNN],
  },

  //Set Vx = random byte AND kk.
  //The interpreter generates a random number from 0 to 255, which is then ANDed with the value kk. 
  //The results are stored in Vx. See instruction 8xy2 for more information on AND.
  {
    key: 23,
    id: 'RND_VX_KK',
    name: 'RND',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0xc000,
    arguments: [MASK_X, MASK_KK],
  },

  //Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
  //The interpreter reads n bytes from memory, starting at the address stored in I. These bytes are then displayed 
  //as sprites on screen at coordinates (Vx, Vy). Sprites are XORed onto the existing screen. If this causes any pixels 
  //to be erased, VF is set to 1, otherwise it is set to 0. If the sprite is positioned so part of it is outside the coordinates 
  //of the display, it wraps around to the opposite side of the screen. See instruction 8xy3 for more information on XOR, and section 
  //2.4, Display, for more information on the Chip-8 screen and sprites.
  {
    key: 24,
    id: 'DRW_VX_VY_N',
    name: 'DRW',
    mask: MASK_HIGHEST_BYTE,
    pattern: 0xd000,
    arguments: [MASK_X, MASK_Y, MASK_N],
  },

  //Skip next instruction if key with the value of Vx is pressed.
  //Checks the keyboard, and if the key corresponding to the value of Vx is currently in the down position, PC is increased by 2.
  {
    key: 25,
    id: 'SKP_VX',
    name: 'SKP',
    mask: 0xf0ff,
    pattern: 0xe09e,
    arguments: [MASK_X],
  },

  //Skip next instruction if key with the value of Vx is not pressed.
  //Checks the keyboard, and if the key corresponding to the value of Vx is currently in the up position, PC is increased by 2.
  {
    key: 26,
    id: 'SKNP_VX',
    name: 'SKNP',
    mask: 0xf0ff,
    pattern: 0xe0a1,
    arguments: [MASK_X],
  },

  //Set Vx = delay timer value.
  //The value of DT is placed into Vx.
  {
    key: 27,
    id: 'LD_VX_DT',
    name: 'LD',
    mask: 0xf0ff,
    pattern: 0xf007,
    arguments: [MASK_X],
  },

  //Wait for a key press, store the value of the key in Vx.
  //All execution stops until a key is pressed, then the value of that key is stored in Vx.
  {
    key: 28,
    id: 'LD_VX_K',
    name: 'LD',
    mask: 0xf0ff,
    pattern: 0xf00a,
    arguments: [MASK_X],
  },

  //Set delay timer = Vx.
  //DT is set equal to the value of Vx.
  {
    key: 29,
    id: 'LD_DT_VX',
    name: 'LD',
    mask: 0xf0ff,
    pattern: 0xf015,
    arguments: [MASK_X],
  },

  //Set sound timer = Vx.
  //ST is set equal to the value of Vx.
  {
    key: 30,
    id: 'LD_ST_VX',
    name: 'LD',
    mask: 0xf0ff,
    pattern: 0xf018,
    arguments: [MASK_X],
  },

  //Set I = I + Vx.
  //The values of I and Vx are added, and the results are stored in I.
  {
    key: 31,
    id: 'ADD_I_VX',
    name: 'ADD',
    mask: 0xf0ff,
    pattern: 0xf01e,
    arguments: [MASK_X],
  },

  //Set I = location of sprite for digit Vx.
  //The value of I is set to the location for the hexadecimal sprite corresponding to the value 
  //of Vx. See section 2.4, Display, for more information on the Chip-8 hexadecimal font.
  {
    key: 32,
    id: 'LD_F_VX',
    name: 'LD',
    mask: 0xf0ff,
    pattern: 0xf029,
    arguments: [MASK_X],
  },

  //Store BCD representation of Vx in memory locations I, I+1, and I+2.
  //The interpreter takes the decimal value of Vx, and places the hundreds digit in memory at 
  //location in I, the tens digit at location I+1, and the ones digit at location I+2.
  {
    key: 33,
    id: 'LD_B_VX',
    name: 'LD',
    mask: 0xf0ff,
    pattern: 0xf033,
    arguments: [MASK_X],
  },

  //Store registers V0 through Vx in memory starting at location I.
  //The interpreter copies the values of registers V0 through Vx into memory, starting at the address in I.
  {
    key: 34,
    id: 'LD_I_VX',
    name: 'LD',
    mask: 0xf0ff,
    pattern: 0xf055,
    arguments: [MASK_X],
  },

  //Read registers V0 through Vx from memory starting at location I.
  //The interpreter reads values from memory starting at location I into registers V0 through Vx.
  {
    key: 35,
    id: 'LD_VX_I',
    name: 'LD',
    mask: 0xf0ff,
    pattern: 0xf065,
    arguments: [MASK_X],
  },



  //Chip48 Instructions

  {
    key: 36,
    id: 'SCD nibble',
    name: 'SCD',
    mask: MASK_N,
    pattern: 0x00C0,
    arguments: [],
  }
];

//TODO: Add Super chip8 instructions