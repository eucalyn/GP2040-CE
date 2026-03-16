import { useContext, useState, useCallback, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { AppContext } from '../Contexts/AppContext';
import FormSelect from './FormSelect';
import { saveButtonLabels } from '../Services/Storage';
import { BUTTONS } from '../Data/Buttons';
import WebApi from '../Services/WebApi';
import './TopNav.scss';

const BOOT_MODES = {
	GAMEPAD: 0,
	WEBCONFIG: 1,
	BOOTSEL: 2,
};

const ADVANCED_LINKS = [
	{ to: '/macro', label: 'Macro' },
	{ to: '/led-config', label: 'LED' },
	{ to: '/custom-theme', label: 'LED Theme' },
	{ to: '/display-config', label: 'Display' },
	{ to: '/peripheral-mapping', label: 'Peripherals' },
	{ to: '/add-ons', label: 'Add-ons' },
	{ to: '/reset-settings', label: 'Reset', danger: true },
];

const TopNav = () => {
	const { buttonLabels, setButtonLabels } = useContext(AppContext);
	const [showReboot, setShowReboot] = useState(false);
	const [isRebooting, setIsRebooting] = useState<number | null>(null);
	const [advancedOpen, setAdvancedOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const advancedRef = useRef<HTMLDivElement>(null);
	const location = useLocation();

	const handleReboot = useCallback(async (bootMode: number) => {
		if (isRebooting === -1) {
			setShowReboot(false);
			return;
		}
		setIsRebooting(bootMode);
		await WebApi.reboot(bootMode);
		setIsRebooting(-1);
	}, [isRebooting]);

	const updateButtonLabels = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		saveButtonLabels(e.target.value);
		setButtonLabels({ buttonLabelType: e.target.value });
	}, [setButtonLabels]);

	const closeMobile = useCallback(() => setMobileOpen(false), []);

	// Close advanced dropdown on outside click
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (advancedRef.current && !advancedRef.current.contains(e.target as Node)) {
				setAdvancedOpen(false);
			}
		};
		if (advancedOpen) {
			document.addEventListener('mousedown', handleClick);
			return () => document.removeEventListener('mousedown', handleClick);
		}
	}, [advancedOpen]);

	// Close mobile menu on route change
	useEffect(() => {
		setMobileOpen(false);
		setAdvancedOpen(false);
	}, [location.pathname]);

	const isAdvancedActive = ADVANCED_LINKS.some(l => location.pathname === l.to);

	return (
		<>
			<header className="topnav">
				{/* Brand */}
				<NavLink to="/" className="topnav__brand">
					<span className="topnav__brand-accent">Rushbox</span>
					<span className="topnav__brand-sub">Configurator</span>
				</NavLink>

				{/* Mobile hamburger */}
				<button
					className="topnav__hamburger"
					onClick={() => setMobileOpen(!mobileOpen)}
					aria-label="Toggle menu"
				>
					<span className={`hamburger ${mobileOpen ? 'hamburger--open' : ''}`}>
						<span />
						<span />
						<span />
					</span>
				</button>

				{/* Nav area (collapses on mobile) */}
				<div className={`topnav__collapse ${mobileOpen ? 'topnav__collapse--open' : ''}`}>
					{/* Center nav */}
					<nav className="topnav__center">
						<NavLink
							to="/"
							end
							className={({ isActive }) =>
								`topnav__link ${isActive ? 'topnav__link--active' : ''}`
							}
						>
							ボタン設定
						</NavLink>
						<NavLink
							to="/settings"
							className={({ isActive }) =>
								`topnav__link ${isActive ? 'topnav__link--active' : ''}`
							}
						>
							一般設定
						</NavLink>
						<NavLink
							to="/backup"
							className={({ isActive }) =>
								`topnav__link ${isActive ? 'topnav__link--active' : ''}`
							}
						>
							設定の保存
						</NavLink>

						{/* Advanced dropdown */}
						<div className="topnav__dropdown" ref={advancedRef}>
							<button
								className={`topnav__link topnav__dropdown-toggle ${isAdvancedActive ? 'topnav__link--active' : ''}`}
								onClick={() => setAdvancedOpen(!advancedOpen)}
							>
								詳細設定
								<svg
									className={`topnav__chevron ${advancedOpen ? 'topnav__chevron--open' : ''}`}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<polyline points="6,9 12,15 18,9" />
								</svg>
							</button>

							{advancedOpen && (
								<div className="topnav__dropdown-menu">
									{ADVANCED_LINKS.map(link => (
										<NavLink
											key={link.to}
											to={link.to}
											className={({ isActive }) =>
												`topnav__dropdown-item ${isActive ? 'topnav__dropdown-item--active' : ''} ${link.danger ? 'topnav__dropdown-item--danger' : ''}`
											}
										>
											{link.label}
										</NavLink>
									))}
								</div>
							)}
						</div>
					</nav>

					{/* Right area */}
					<div className="topnav__right">
						<div className="topnav__label-select">
							<span className="topnav__label-select-label">ボタン表記</span>
							<FormSelect
								name="buttonLabels"
								className="form-select form-select-sm"
								value={buttonLabels.buttonLabelType}
								onChange={updateButtonLabels}
							>
								{Object.keys(BUTTONS).map((b, i) => (
									<option
										key={`button-label-option-${i}`}
										value={(BUTTONS as any)[b].value}
									>
										{(BUTTONS as any)[b].label}
									</option>
								))}
							</FormSelect>
						</div>

						<button
							className="topnav__reboot-btn"
							onClick={() => {
								setIsRebooting(null);
								setShowReboot(true);
							}}
							aria-label="Reboot"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
								<line x1="12" y1="2" x2="12" y2="12" />
							</svg>
						</button>
					</div>
				</div>
			</header>

			{/* Mobile overlay */}
			{mobileOpen && (
				<div className="topnav__overlay" onClick={closeMobile} />
			)}

			{/* Reboot modal */}
			<Modal show={showReboot} onHide={() => setShowReboot(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>再起動</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{isRebooting === -1
						? 'デバイスを再起動しています...'
						: '再起動モードを選択してください'}
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => handleReboot(BOOT_MODES.BOOTSEL)}
						disabled={isRebooting !== null && isRebooting !== -1}
					>
						{isRebooting === BOOT_MODES.BOOTSEL ? '再起動中...' : 'BOOTSEL'}
					</Button>
					<Button
						variant="primary"
						onClick={() => handleReboot(BOOT_MODES.WEBCONFIG)}
						disabled={isRebooting !== null && isRebooting !== -1}
					>
						{isRebooting === BOOT_MODES.WEBCONFIG ? '再起動中...' : 'Web設定'}
					</Button>
					<Button
						variant="success"
						onClick={() => handleReboot(BOOT_MODES.GAMEPAD)}
						disabled={isRebooting !== null && isRebooting !== -1}
					>
						{isRebooting === BOOT_MODES.GAMEPAD ? '再起動中...' : 'コントローラー'}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default TopNav;
