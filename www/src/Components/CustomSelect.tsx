import ReactSelect, { GroupBase, Props, StylesConfig } from 'react-select';

import './CustomSelect.scss';

// Clear react-select's inline backgrounds so our CSS variables take effect
const baseStyles: StylesConfig<any, any, any> = {
	menu: (base) => ({ ...base, backgroundColor: undefined }),
	option: (base) => ({ ...base, backgroundColor: undefined, color: undefined }),
	control: (base) => ({ ...base, backgroundColor: undefined }),
	singleValue: (base) => ({ ...base, color: undefined }),
	menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

function mergeStyles(
	userStyles?: StylesConfig<any, any, any>,
): StylesConfig<any, any, any> {
	if (!userStyles) return baseStyles;
	const merged: any = { ...baseStyles };
	for (const key of Object.keys(userStyles) as (keyof StylesConfig)[]) {
		const baseFn = (baseStyles as any)[key];
		const userFn = (userStyles as any)[key];
		if (baseFn && userFn) {
			merged[key] = (provided: any, state: any) =>
				userFn(baseFn(provided, state), state);
		} else {
			merged[key] = userFn;
		}
	}
	return merged;
}

function CustomSelect<
	Option,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>,
>(props: Props<Option, IsMulti, Group>) {
	return (
		<ReactSelect
			className="react-select__container"
			classNamePrefix="react-select"
			{...props}
			styles={mergeStyles(props.styles as any) as any}
		/>
	);
}

export default CustomSelect;
