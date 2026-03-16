import { memo, useCallback, useContext } from 'react';
import { useShallow } from 'zustand/react/shallow';
import omit from 'lodash/omit';
import { MultiValue, SingleValue } from 'react-select';

import { AppContext } from '../Contexts/AppContext';
import useProfilesStore, { MaskPayload } from '../Store/useProfilesStore';
import { getButtonLabels } from '../Data/Buttons';
import CustomSelect from './CustomSelect';
import {
	groupedOptions,
	getMultiValue,
	buildPinPayload,
	isDisabled,
	OptionType,
} from '../Data/PinOptions';

const PinListView = memo(function PinListView({
	profileIndex,
}: {
	profileIndex: number;
}) {
	const setProfilePin = useProfilesStore((state) => state.setProfilePin);
	const pins = useProfilesStore(
		useShallow((state) =>
			omit(state.profiles[profileIndex], ['profileLabel', 'enabled']),
		),
	);
	const { buttonLabels } = useContext(AppContext);
	const { buttonLabelType, swapTpShareLabels } = buttonLabels;
	const CURRENT_BUTTONS = getButtonLabels(buttonLabelType, swapTpShareLabels);
	const buttonNames = omit(CURRENT_BUTTONS, ['label', 'value']);

	const onChange = useCallback(
		(pin: string) =>
			(selected: MultiValue<OptionType> | SingleValue<OptionType>) => {
				setProfilePin(
					profileIndex,
					pin,
					buildPinPayload(selected as OptionType[] | OptionType | null),
				);
			},
		[profileIndex, setProfilePin],
	);

	const getOptionLabel = useCallback(
		(option: OptionType) => {
			const labelKey = option.label?.split('BUTTON_PRESS_')?.pop();
			if (labelKey) {
				if (buttonNames[labelKey]) return buttonNames[labelKey] as string;
				const ciMatch = Object.keys(buttonNames).find(
					(k) => k.toUpperCase() === labelKey,
				);
				if (ciMatch) return buttonNames[ciMatch] as string;
			}
			return option.label
				.replace(/^(BUTTON_PRESS_|SUSTAIN_|CUSTOM_)/, '')
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (c) => c.toUpperCase())
				.replace(/\B\w+/g, (w) => w.toLowerCase());
		},
		[buttonNames],
	);

	return (
		<div className="pin-list-grid">
			{Object.entries(pins).map(([pin, pinData], index) => (
				<div key={`select-${index}`} className="pin-list-row">
					<div className="pin-list-row__label mono">GP{index}</div>
					<CustomSelect
						isClearable
						isMulti={!isDisabled((pinData as MaskPayload).action)}
						options={groupedOptions}
						isDisabled={isDisabled((pinData as MaskPayload).action)}
						getOptionLabel={getOptionLabel}
						onChange={onChange(pin)}
						value={getMultiValue(pinData as MaskPayload)}
					/>
				</div>
			))}
		</div>
	);
});

export default PinListView;
