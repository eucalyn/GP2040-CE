import rushboxClickLayout from '../../../configs/RushboxClick/BoardLayout.json';
import rushboxLayout from '../../../configs/Rushbox/BoardLayout.json';
import rushboxMiniLayout from '../../../configs/RushboxMini/BoardLayout.json';

export type ButtonPosition = {
	pin: number;
	x: number;
	y: number;
	label: string;
	group: 'dpad' | 'main' | 'aux' | 'trigger' | 'addon';
	size?: 'sm' | 'md' | 'lg';
};

export type BoardLayout = {
	boardLabel: string;
	width: number;
	height: number;
	buttons: ButtonPosition[];
};

const BOARD_LAYOUTS: BoardLayout[] = [
	rushboxClickLayout as BoardLayout,
	rushboxLayout as BoardLayout,
	rushboxMiniLayout as BoardLayout,
];

export function getBoardLayout(boardLabel: string): BoardLayout | null {
	return BOARD_LAYOUTS.find((l) => l.boardLabel === boardLabel) ?? null;
}
