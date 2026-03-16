import { memo, useCallback } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { MultiValue, SingleValue } from 'react-select';
import CustomSelect from './CustomSelect';
import { ButtonPosition } from '../Data/BoardLayouts';
import { MaskPayload } from '../Store/useProfilesStore';
import {
	groupedOptions,
	getMultiValue,
	buildPinPayload,
	isDisabled as isPinDisabled,
	OptionType,
} from '../Data/PinOptions';

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
			onChange(pinKey, buildPinPayload(selected as OptionType[] | OptionType | null));
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
