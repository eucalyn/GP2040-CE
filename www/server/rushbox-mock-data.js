/**
 * Rushbox-specific mock data for the dev server.
 * Separated from app.js to minimize merge conflicts with upstream GP2040-CE.
 */

// RushboxClick pin mapping (GpioAction enum values)
export const rushboxClickPins = {
	pin00: 0,   // ASSIGNED_TO_ADDON (I2C SDA)
	pin01: 0,   // ASSIGNED_TO_ADDON (I2C SCL)
	pin02: 0,   // ASSIGNED_TO_ADDON (LED data)
	pin03: 4,   // BUTTON_PRESS_RIGHT
	pin04: 2,   // BUTTON_PRESS_DOWN
	pin05: 3,   // BUTTON_PRESS_LEFT
	pin06: 0,   // ASSIGNED_TO_ADDON
	pin07: 0,   // ASSIGNED_TO_ADDON
	pin08: 5,   // BUTTON_PRESS_B1
	pin09: 6,   // BUTTON_PRESS_B2
	pin10: 12,  // BUTTON_PRESS_R2
	pin11: 11,  // BUTTON_PRESS_L2
	pin12: 7,   // BUTTON_PRESS_B3
	pin13: 8,   // BUTTON_PRESS_B4
	pin14: 10,  // BUTTON_PRESS_R1
	pin15: 9,   // BUTTON_PRESS_L1
	pin16: 1,   // BUTTON_PRESS_UP
	pin17: -10, // NONE
	pin18: -10, // NONE
	pin19: 14,  // BUTTON_PRESS_S2
	pin20: -10, // NONE
	pin21: -10, // NONE
	pin22: -10, // NONE
	pin23: 17,  // BUTTON_PRESS_L3
	pin24: 18,  // BUTTON_PRESS_R3
	pin25: -10, // NONE
	pin26: 13,  // BUTTON_PRESS_S1
	pin27: 16,  // BUTTON_PRESS_A2
	pin28: 15,  // BUTTON_PRESS_A1
	pin29: 70,  // SUSTAIN_FOCUS_MODE
};

export const firmwareVersion = {
	boardConfigLabel: 'RushboxClick',
	boardConfigFileName: 'GP2040-CE_0.7.12_RushboxClick',
	boardConfig: 'RushboxClick',
	version: '0.7.12-moimate',
	boardArchitecture: 'RP2040',
	boardBuild: 'Release',
	boardBuildType: 'Release',
};
