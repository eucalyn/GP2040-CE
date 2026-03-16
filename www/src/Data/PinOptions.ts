// ============================================================================
// Pin Options — shared logic extracted from PinMapping.tsx
// Keeps PinMapping.tsx closer to upstream GP2040-CE for easier merges.
// ============================================================================

import invert from 'lodash/invert';
import { BUTTON_MASKS, DPAD_MASKS } from './Buttons';
import { BUTTON_ACTIONS, PinActionValues } from './Pins';
import { MaskPayload } from '../Store/useProfilesStore';

export type OptionType = {
	label: string;
	value: PinActionValues;
	type: string;
	customButtonMask: number;
	customDpadMask: number;
};

const disabledOptions = [
	BUTTON_ACTIONS.RESERVED,
	BUTTON_ACTIONS.ASSIGNED_TO_ADDON,
] as PinActionValues[];

const getMask = (maskArr: { label: string; value: number }[], key: string) =>
	maskArr.find(
		({ label }) => label?.toUpperCase() === key.split('BUTTON_PRESS_')?.pop(),
	);

const isNonSelectable = (action: PinActionValues) =>
	[
		BUTTON_ACTIONS.NONE,
		BUTTON_ACTIONS.CUSTOM_BUTTON_COMBO,
		...disabledOptions,
	].includes(action);

export const isDisabled = (action: PinActionValues) =>
	disabledOptions.includes(action);

const options = Object.entries(BUTTON_ACTIONS)
	.filter(([, value]) => !isNonSelectable(value))
	.map(([key, value]) => {
		const buttonMask = getMask(BUTTON_MASKS, key);
		const dpadMask = getMask(DPAD_MASKS, key);

		return {
			label: key,
			value,
			type: buttonMask
				? 'customButtonMask'
				: dpadMask
					? 'customDpadMask'
					: 'action',
			customButtonMask: buttonMask?.value || 0,
			customDpadMask: dpadMask?.value || 0,
		};
	});

export const groupedOptions = [
	{
		label: 'Buttons',
		options: options.filter(({ type }) => type !== 'action'),
	},
	{
		label: 'Actions',
		options: options.filter(({ type }) => type === 'action'),
	},
];

/**
 * Convert a react-select selection into a MaskPayload.
 * Shared between PinAssignmentPopover and PinListView to avoid duplication.
 */
export const buildPinPayload = (
	selected: readonly OptionType[] | OptionType | null | undefined,
): MaskPayload => {
	if (!selected || (Array.isArray(selected) && !selected.length)) {
		return { action: BUTTON_ACTIONS.NONE, customButtonMask: 0, customDpadMask: 0 };
	}

	const arr = Array.isArray(selected) ? selected : [selected];

	if (arr.length > 1) {
		const last = arr[arr.length - 1];
		if (last.type === 'action') {
			return { action: last.value, customButtonMask: 0, customDpadMask: 0 };
		}
		return arr.reduce(
			(masks, option) => ({
				...masks,
				customButtonMask:
					option.type === 'customButtonMask'
						? masks.customButtonMask ^ option.customButtonMask
						: masks.customButtonMask,
				customDpadMask:
					option.type === 'customDpadMask'
						? masks.customDpadMask ^ option.customDpadMask
						: masks.customDpadMask,
			}),
			{
				action: BUTTON_ACTIONS.CUSTOM_BUTTON_COMBO as PinActionValues,
				customButtonMask: 0,
				customDpadMask: 0,
			},
		);
	}

	return { action: arr[0].value, customButtonMask: 0, customDpadMask: 0 };
};

export const getMultiValue = (pinData: MaskPayload) => {
	if (pinData.action === BUTTON_ACTIONS.NONE) return;
	if (isDisabled(pinData.action)) {
		const actionKey = invert(BUTTON_ACTIONS)[pinData.action];
		return [
			{
				label: actionKey,
				value: pinData.action,
				type: 'action',
				customButtonMask: pinData.customButtonMask,
				customDpadMask: pinData.customDpadMask,
			},
		];
	}

	return pinData.action === BUTTON_ACTIONS.CUSTOM_BUTTON_COMBO
		? options.filter(
				({ type, customButtonMask, customDpadMask }) =>
					(pinData.customButtonMask & customButtonMask &&
						type === 'customButtonMask') ||
					(pinData.customDpadMask & customDpadMask &&
						type === 'customDpadMask'),
			)
		: options.filter((option) => option.value === pinData.action);
};
