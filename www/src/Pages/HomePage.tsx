import {
	FormEvent,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { Form } from 'react-bootstrap';
import omit from 'lodash/omit';
import invert from 'lodash/invert';

import { AppContext } from '../Contexts/AppContext';
import useProfilesStore, { MAX_PROFILES } from '../Store/useProfilesStore';
import useSystemStats from '../Store/useSystemStats';
import WebApi from '../Services/WebApi';

import VisualPinLayout from '../Components/VisualPinLayout';
import SlidingPillSelector from '../Components/SlidingPillSelector';
import ProfileTabs from '../Components/ProfileTabs';
import PinListView from '../Components/PinListView';
import CaptureButton from '../Components/CaptureButton';
import { getButtonLabels } from '../Data/Buttons';
import {
	BUTTON_ACTIONS,
	PinActionKeys,
} from '../Data/Pins';
import { getBoardLayout } from '../Data/BoardLayouts';

import './HomePage.scss';

// ── Input Mode definitions ────────────────────────────────────────
const INPUT_MODES = [
	{ label: 'XInput', value: 0 },
	{ label: 'PS4', value: 4 },
	{ label: 'Switch', value: 1 },
	{ label: 'Keyboard', value: 3 },
	{ label: 'Xbox One', value: 5 },
];

// ── SOCD Mode definitions ─────────────────────────────────────────
const SOCD_MODES = [
	{ label: 'Neutral', value: 1 },
	{ label: 'Up Priority', value: 0 },
	{ label: 'Last Win', value: 2 },
	{ label: 'First Win', value: 3 },
	{ label: 'Off', value: 4 },
];

// ── Main Home Page ────────────────────────────────────────────────
export default function HomePage() {
	const fetchProfiles = useProfilesStore((state) => state.fetchProfiles);
	const addProfile = useProfilesStore((state) => state.addProfile);
	const profiles = useProfilesStore((state) => state.profiles);
	const loadingProfiles = useProfilesStore((state) => state.loadingProfiles);
	const saveProfiles = useProfilesStore((state) => state.saveProfiles);
	const setProfilePin = useProfilesStore((state) => state.setProfilePin);
	const copyBaseProfile = useProfilesStore((state) => state.copyBaseProfile);
	const toggleProfileEnabled = useProfilesStore((state) => state.toggleProfileEnabled);

	const getSystemStats = useSystemStats((state) => state.getSystemStats);
	const boardLabel = useSystemStats(
		(state) => state.boardConfigProperties.label,
	);
	const currentVersion = useSystemStats((state) => state.currentVersion);

	const { updateUsedPins, buttonLabels, setLoading } = useContext(AppContext);
	const { buttonLabelType, swapTpShareLabels } = buttonLabels;
	const CURRENT_BUTTONS = getButtonLabels(buttonLabelType, swapTpShareLabels);
	const buttonNames = omit(CURRENT_BUTTONS, ['label', 'value']);

	const [selectedProfile, setSelectedProfile] = useState(0);
	const [inputMode, setInputMode] = useState(0);
	const [socdMode, setSocdMode] = useState(0);
	const [optionsLoaded, setOptionsLoaded] = useState(false);
	const [savingOptions, setSavingOptions] = useState(false);
	const [saveMessage, setSaveMessage] = useState('');
	const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual');

	useEffect(() => {
		fetchProfiles();
		getSystemStats();
		loadGamepadOptions();
	}, []);

	const loadGamepadOptions = async () => {
		try {
			const options = await WebApi.getGamepadOptions(setLoading);
			if (options) {
				setInputMode(options.inputMode);
				setSocdMode(options.socdMode);
				setOptionsLoaded(true);
			}
		} catch (e) {
			console.error('Failed to load gamepad options', e);
		}
	};

	const handleInputModeChange = useCallback(async (mode: number) => {
		setSavingOptions(true);
		try {
			const options = await WebApi.getGamepadOptions(setLoading);
			await WebApi.setGamepadOptions({ ...options, inputMode: mode });
			setInputMode(mode);
		} catch (e) {
			console.error('Failed to save input mode', e);
		}
		setSavingOptions(false);
	}, [setLoading]);

	const handleSocdModeChange = useCallback(async (mode: number) => {
		setSavingOptions(true);
		try {
			const options = await WebApi.getGamepadOptions(setLoading);
			await WebApi.setGamepadOptions({ ...options, socdMode: mode });
			setSocdMode(mode);
		} catch (e) {
			console.error('Failed to save SOCD mode', e);
		}
		setSavingOptions(false);
	}, [setLoading]);

	const handleSaveProfiles = useCallback(async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			await saveProfiles();
			updateUsedPins();
			setSaveMessage('Saved!');
			setTimeout(() => setSaveMessage(''), 2000);
		} catch (error) {
			setSaveMessage('Error');
		}
	}, [saveProfiles, updateUsedPins]);

	const boardLayout = boardLabel ? getBoardLayout(boardLabel) : null;

	if (loadingProfiles) {
		return (
			<div className="home-loading">
				<div className="spinner-border" role="status" />
			</div>
		);
	}

	return (
		<div className="home-page">
			{/* Quick settings row: Input Mode + SOCD */}
			<div className="quick-settings">
				<SlidingPillSelector
					label="Input Mode"
					options={INPUT_MODES}
					activeValue={inputMode}
					onChange={handleInputModeChange}
					disabled={savingOptions}
				/>
				<SlidingPillSelector
					label="SOCD"
					options={SOCD_MODES}
					activeValue={socdMode}
					onChange={handleSocdModeChange}
					disabled={savingOptions}
				/>
			</div>

			{/* Pin Mapping Section — the hero */}
			<Form onSubmit={handleSaveProfiles}>
				<div className="pin-mapping-section">
					<div className="pin-mapping-header">
						<div className="pin-mapping-header__left">
							<h2>ボタン設定</h2>
							{boardLabel && (
								<span className="pin-mapping-header__board mono">{boardLabel}</span>
							)}
						</div>
						<div className="pin-mapping-header__actions">
							<CaptureButton
								labels={Object.values(buttonNames) as string[]}
								onChange={(label: string, pin: number) =>
									setProfilePin(
										selectedProfile,
										pin < 10 ? `pin0${pin}` : `pin${pin}`,
										{
											action:
												BUTTON_ACTIONS[
													`BUTTON_PRESS_${invert(buttonNames)[
														label
													].toUpperCase()}` as PinActionKeys
												],
											customButtonMask: 0,
											customDpadMask: 0,
										},
									)
								}
							/>
							{selectedProfile > 0 && (
								<button
									type="button"
									className="header-action-btn"
									onClick={() => copyBaseProfile(selectedProfile)}
								>
									Copy from Profile 1
								</button>
							)}
							<button type="submit" className={`header-action-btn header-action-btn--save ${saveMessage === 'Saved!' ? 'header-action-btn--saved' : saveMessage === 'Error' ? 'header-action-btn--error' : ''}`}>
								{saveMessage || 'Save'}
							</button>
						</div>
					</div>

					{/* Profile Tabs + View Toggle */}
					<div className="profile-bar">
						<ProfileTabs
							profiles={profiles.map(({ profileLabel, enabled }) => ({
								profileLabel,
								enabled,
							}))}
							activeIndex={selectedProfile}
							onSelect={setSelectedProfile}
							onAdd={addProfile}
							maxProfiles={MAX_PROFILES}
						/>
						{boardLayout && (
							<button
								type="button"
								className={`view-toggle ${viewMode === 'list' ? 'view-toggle--active' : ''}`}
								onClick={() => setViewMode(viewMode === 'visual' ? 'list' : 'visual')}
								title={viewMode === 'visual' ? 'リストエディタに切替' : 'ビジュアルエディタに切替'}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<line x1="8" y1="6" x2="21" y2="6" />
									<line x1="8" y1="12" x2="21" y2="12" />
									<line x1="8" y1="18" x2="21" y2="18" />
									<line x1="3" y1="6" x2="3.01" y2="6" />
									<line x1="3" y1="12" x2="3.01" y2="12" />
									<line x1="3" y1="18" x2="3.01" y2="18" />
								</svg>
								<span>リストエディタ</span>
							</button>
						)}
					</div>

					{/* Visual or List Pin Mapping */}
					<div className="pin-mapping-area">
						{selectedProfile > 0 && !profiles[selectedProfile]?.enabled ? (
							<div className="profile-disabled-placeholder">
								<p>このプロファイルは無効です</p>
								<button
									type="button"
									className="header-action-btn header-action-btn--save"
									onClick={() => toggleProfileEnabled(selectedProfile)}
								>
									有効にする
								</button>
							</div>
						) : viewMode === 'visual' && boardLayout ? (
							<VisualPinLayout
								profileIndex={selectedProfile}
								layout={boardLayout}
							/>
						) : (
							<PinListView profileIndex={selectedProfile} />
						)}
					</div>
				</div>
			</Form>

			{/* Footer info */}
			{currentVersion && (
				<div className="home-footer">
					<span className="mono">FW {currentVersion}</span>
					{boardLabel && <span className="mono">{boardLabel}</span>}
				</div>
			)}
		</div>
	);
}
