import { memo } from 'react';

type ProfileTabsProps = {
	profiles: Array<{ profileLabel: string; enabled: boolean }>;
	activeIndex: number;
	onSelect: (index: number) => void;
	onAdd: () => void;
	maxProfiles: number;
};

const ProfileTabs = memo(function ProfileTabs({
	profiles,
	activeIndex,
	onSelect,
	onAdd,
	maxProfiles,
}: ProfileTabsProps) {
	return (
		<div className="profile-tabs">
			{profiles.map(({ profileLabel, enabled }, index) => (
				<button
					key={`profile-${index}`}
					className={`profile-tab ${activeIndex === index ? 'profile-tab--active' : ''} ${!enabled && index > 0 ? 'profile-tab--disabled' : ''}`}
					onClick={() => onSelect(index)}
				>
					<span className="profile-tab__label">
						{profileLabel || `Profile ${index + 1}`}
					</span>
					{!enabled && index > 0 && (
						<span className="profile-tab__badge">OFF</span>
					)}
				</button>
			))}
			{profiles.length < maxProfiles && (
				<button
					className="profile-tab profile-tab--add"
					onClick={onAdd}
				>
					+
				</button>
			)}
		</div>
	);
});

export default ProfileTabs;
