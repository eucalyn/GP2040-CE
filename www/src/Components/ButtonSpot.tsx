import { memo } from 'react';
import { ButtonPosition } from '../Data/BoardLayouts';

type ButtonSpotProps = {
	position: ButtonPosition;
	actionLabel: string;
	isSelected: boolean;
	isDisabled: boolean;
	onClick: () => void;
};

const ButtonSpot = memo(function ButtonSpot({
	position,
	actionLabel,
	isSelected,
	isDisabled,
	onClick,
}: ButtonSpotProps) {
	const size = position.size || 'md';

	return (
		<div
			className={[
				'button-spot',
				`button-spot--${position.group}`,
				`button-spot--${size}`,
				isSelected && 'button-spot--selected',
				isDisabled && 'button-spot--disabled',
				actionLabel === '---' && 'button-spot--none',
			]
				.filter(Boolean)
				.join(' ')}
			onClick={isDisabled ? undefined : onClick}
			title={`GP${position.pin} - ${position.label}`}
		>
			<span className="button-spot__label">{actionLabel}</span>
			<span className="button-spot__pin">GP{position.pin}</span>
		</div>
	);
});

export default ButtonSpot;
