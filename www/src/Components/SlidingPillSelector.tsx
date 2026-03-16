import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

type SlidingPillSelectorProps = {
	label: string;
	options: Array<{ label: string; value: number }>;
	activeValue: number;
	onChange: (value: number) => void;
	disabled?: boolean;
};

export default function SlidingPillSelector({
	label,
	options,
	activeValue,
	onChange,
	disabled,
}: SlidingPillSelectorProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const btnRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
	const [pill, setPill] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

	const updatePill = useCallback(() => {
		const track = trackRef.current;
		const btn = btnRefs.current.get(activeValue);
		if (!track || !btn) return;
		const trackRect = track.getBoundingClientRect();
		const btnRect = btn.getBoundingClientRect();
		setPill({
			left: btnRect.left - trackRect.left,
			top: btnRect.top - trackRect.top,
			width: btnRect.width,
			height: btnRect.height,
			ready: true,
		});
	}, [activeValue]);

	useLayoutEffect(updatePill, [updatePill]);

	useEffect(() => {
		window.addEventListener('resize', updatePill);
		return () => window.removeEventListener('resize', updatePill);
	}, [updatePill]);

	return (
		<div className="pill-selector">
			<span className="pill-selector__label">{label}</span>
			<div className="pill-selector__track" ref={trackRef}>
				{pill.ready && (
					<div
						className="pill-selector__pill"
						style={{
							transform: `translate(${pill.left}px, ${pill.top}px)`,
							width: `${pill.width}px`,
							height: `${pill.height}px`,
						}}
					/>
				)}
				{options.map((opt) => (
					<button
						key={opt.value}
						ref={(el) => {
							if (el) btnRefs.current.set(opt.value, el);
						}}
						className={`pill-selector__btn ${activeValue === opt.value ? 'pill-selector__btn--active' : ''}`}
						onClick={() => onChange(opt.value)}
						disabled={disabled}
					>
						{opt.label}
					</button>
				))}
			</div>
		</div>
	);
}
