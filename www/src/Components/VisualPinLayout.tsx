import { memo, useCallback, useContext, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import omit from 'lodash/omit';
import invert from 'lodash/invert';
import { useTranslation } from 'react-i18next';

import { AppContext } from '../Contexts/AppContext';
import useProfilesStore, { MaskPayload } from '../Store/useProfilesStore';
import { BoardLayout } from '../Data/BoardLayouts';
import { BUTTON_ACTIONS, PinActionValues } from '../Data/Pins';
import { getButtonLabels } from '../Data/Buttons';
import { getMultiValue, OptionType } from '../Pages/PinMapping';

import ButtonSpot from './ButtonSpot';
import PinAssignmentPopover from './PinAssignmentPopover';

type VisualPinLayoutProps = {
	profileIndex: number;
	layout: BoardLayout;
};

const disabledActions = [
	BUTTON_ACTIONS.RESERVED,
	BUTTON_ACTIONS.ASSIGNED_TO_ADDON,
] as PinActionValues[];

const VisualPinLayout = memo(function VisualPinLayout({
	profileIndex,
	layout,
}: VisualPinLayoutProps) {
	const { t } = useTranslation('');
	const { buttonLabels } = useContext(AppContext);
	const { buttonLabelType, swapTpShareLabels } = buttonLabels;
	const CURRENT_BUTTONS = getButtonLabels(buttonLabelType, swapTpShareLabels);
	const buttonNames = omit(CURRENT_BUTTONS, ['label', 'value']);

	const setProfilePin = useProfilesStore((state) => state.setProfilePin);
	const pins = useProfilesStore(
		useShallow((state) =>
			omit(state.profiles[profileIndex], ['profileLabel', 'enabled']),
		),
	);

	const [selectedPin, setSelectedPin] = useState<number | null>(null);
	const buttonRefs = useRef<Record<number, HTMLElement | null>>({});

	const getActionLabel = useCallback(
		(pinData: MaskPayload): string => {
			if (!pinData || pinData.action === BUTTON_ACTIONS.NONE) return '---';
			if (pinData.action === BUTTON_ACTIONS.ASSIGNED_TO_ADDON) return 'Addon';
			if (pinData.action === BUTTON_ACTIONS.RESERVED) return 'Rsvd';

			const multiValue = getMultiValue(pinData);
			if (!multiValue || multiValue.length === 0) return '---';
			if (multiValue.length > 1) return 'Combo';

			const option = multiValue[0];
			const labelKey = option.label?.split('BUTTON_PRESS_')?.pop();
			if (labelKey && buttonNames[labelKey]) {
				return buttonNames[labelKey] as string;
			}
			return labelKey || '?';
		},
		[buttonNames],
	);

	const getOptionLabel = useCallback(
		(option: OptionType) => {
			const labelKey = option.label?.split('BUTTON_PRESS_')?.pop();
			return (
				(labelKey && (buttonNames[labelKey] as string)) ||
				t(`Proto:GpioAction.${option.label}`)
			);
		},
		[buttonNames, t],
	);

	const handlePinChange = useCallback(
		(pin: string, payload: MaskPayload) => {
			setProfilePin(profileIndex, pin, payload);
		},
		[profileIndex, setProfilePin],
	);

	const selectedPinKey = selectedPin !== null
		? `pin${String(selectedPin).padStart(2, '0')}`
		: null;
	const selectedPinData = selectedPinKey ? pins[selectedPinKey] : null;
	const selectedPosition = selectedPin !== null
		? layout.buttons.find((b) => b.pin === selectedPin)
		: null;

	return (
		<div className="visual-pin-layout mt-2">
			<div
				className="visual-pin-layout__container"
				style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
			>
				{layout.buttons.map((pos) => {
					const pinKey = `pin${String(pos.pin).padStart(2, '0')}`;
					const pinData = pins[pinKey] as MaskPayload | undefined;
					if (!pinData) return null;

					return (
						<div
							key={`${pos.pin}-${pos.x}-${pos.y}`}
							ref={(el) => {
								buttonRefs.current[pos.pin] = el;
							}}
							style={{
								position: 'absolute',
								left: `${(pos.x / layout.width) * 100}%`,
								top: `${(pos.y / layout.height) * 100}%`,
								transform: 'translate(-50%, -50%)',
							}}
						>
							<ButtonSpot
								position={pos}
								actionLabel={getActionLabel(pinData)}
								isSelected={selectedPin === pos.pin}
								isDisabled={disabledActions.includes(pinData.action)}
								onClick={() =>
									setSelectedPin(
										selectedPin === pos.pin ? null : pos.pin,
									)
								}
							/>
						</div>
					);
				})}
			</div>

			{selectedPin !== null && selectedPinData && selectedPosition && (
				<PinAssignmentPopover
					position={selectedPosition}
					pinData={selectedPinData}
					targetRef={buttonRefs.current[selectedPin]}
					onClose={() => setSelectedPin(null)}
					onChange={handlePinChange}
					getOptionLabel={getOptionLabel}
				/>
			)}
		</div>
	);
});

export default VisualPinLayout;
