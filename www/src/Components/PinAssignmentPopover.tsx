import { memo, useCallback, useRef } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { MultiValue, SingleValue } from 'react-select';
import CustomSelect from './CustomSelect';
import { ButtonPosition } from '../Data/BoardLayouts';
import { MaskPayload } from '../Store/useProfilesStore';
import {
	groupedOptions,
	getMultiValue,
	isDisabled as isPinDisabled,
	OptionType,
} from '../Pages/PinMapping';
import { BUTTON_ACTIONS } from '../Data/Pins';

type PinAssignmentPopoverProps = {
	position: ButtonPosition;
	pinData: MaskPayload;
	targetRef: HTMLElement | null;
	onClose: () => void;
	onChange: (pin: string, payload: MaskPayload) => void;
	getOptionLabel: (option: OptionType) => string;
};

const PinAssignmentPopover = memo(function PinAssignmentPopover({
	position,
	pinData,
	targetRef,
	onClose,
	onChange,
	getOptionLabel,
}: PinAssignmentPopoverProps) {
	const pinKey = `pin${String(position.pin).padStart(2, '0')}`;

	const handleChange = useCallback(
		(selected: MultiValue<OptionType> | SingleValue<OptionType>) => {
			if (!selected || (Array.isArray(selected) && !selected.length)) {
				onChange(pinKey, {
					action: BUTTON_ACTIONS.NONE,
					customButtonMask: 0,
					customDpadMask: 0,
				});
			} else if (Array.isArray(selected) && selected.length > 1) {
				const lastSelected = selected[selected.length - 1];
				if (lastSelected.type === 'action') {
					onChange(pinKey, {
						action: lastSelected.value,
						customButtonMask: 0,
						customDpadMask: 0,
					});
				} else {
					onChange(
						pinKey,
						selected.reduce(
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
								action: BUTTON_ACTIONS.CUSTOM_BUTTON_COMBO,
								customButtonMask: 0,
								customDpadMask: 0,
							},
						),
					);
				}
			} else {
				const sel = Array.isArray(selected) ? selected[0] : selected;
				if (sel) {
					onChange(pinKey, {
						action: sel.value,
						customButtonMask: 0,
						customDpadMask: 0,
					});
				}
			}
		},
		[pinKey, onChange],
	);

	return (
		<Overlay
			target={targetRef}
			show={!!targetRef}
			placement="auto"
			rootClose
			onHide={onClose}
		>
			<Popover id={`popover-pin-${position.pin}`} className="pin-popover">
				<Popover.Header as="h6">
					GP{position.pin} - {position.label}
				</Popover.Header>
				<Popover.Body>
					<CustomSelect
						isClearable
						isMulti={!isPinDisabled(pinData.action)}
						options={groupedOptions}
						isDisabled={isPinDisabled(pinData.action)}
						getOptionLabel={getOptionLabel}
						onChange={handleChange}
						value={getMultiValue(pinData)}
						menuPortalTarget={document.body}
						menuPosition="fixed"
					/>
				</Popover.Body>
			</Popover>
		</Overlay>
	);
});

export default PinAssignmentPopover;
