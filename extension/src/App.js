import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactCountdown from 'react-countdown';
import { MSG_FILTERS_TITLE, MSG_TITLE } from './i18n/index';
import './app.css';
import {
	SET_ALARM_SUCCESS,
	SET_ALARM_PROGRESS,
	CANCEL_ALARM_SUCCESS,
	CANCEL_ALARM_PROGRESS,
	READ_WAIT_TIME_SUCCESS,
	EXTENSION_CONTENTSCRIPT,
	READ_WAIT_TIME_PROGRESS,
	GET_ALARM_STATUS_SUCCESS,
	GET_ALARM_STATUS_PROGESS,
	IS_LOCATION_ENTERED_SUCCESS,
	IS_LOCATION_ENTERED_PROGRESS,
	GET_FILTER_NONIMMIGRANTS_TYPES_PROGRESS,
	GET_FILTER_NONIMMIGRANTS_TYPES_SUCCESS,
	SET_LEFTOVER_RELOADING_TIME_PROGRESS,
	SET_LEFTOVER_RELOADING_TIME_SUCCESS,
	RELOAD_COUNTDOWN_PROGRESS,
} from './contants';

export default function App() {
	/* eslint-disable no-undef */
	const formRef = useRef(null);
	const [alarmStatus, setAlarmStatus] = useState({});
	const [isAlarmSet, toggleIsAlarmSet] = useState(false); // TODO: Remove this and make use of alarmStatus
	const [isLocationEntered, toggleIsLocationEntered] = useState(false);
	const [isReadingData, toggleIsReadingData] = useState(true);
	const [visaMonitoringData, setVisaMonitoringData] = useState({});
	const [nonImmigrantVisaTypes, setNonImmigrantVisaTypes] = useState([]);
	const [notifyOnlyOnThreshold, toggleNotifyOnlyOnThreshold] = useState(false);
	const [reloadTimeLeft, setReloadTimeLeft] = useState(0);
	const [selectedNonImmigrantVisaType, setSelectedNonImmigrantVisaType] =
		useState('');

	// ? EXTENSION <--> CONTENT SCRIPT PORT
	const extensionContentScriptPort = useMemo(() => {
		return (async function () {
			const currentTabQuery = {
				active: true,
				currentWindow: true,
			};
			const currentTabId = (await chrome?.tabs?.query(currentTabQuery))?.[0].id;
			return chrome?.tabs?.connect(currentTabId, {
				name: EXTENSION_CONTENTSCRIPT,
			});
		})();
	}, []);

	useEffect(() => {
		extensionContentScriptPort?.then((port) => {
			// * Get alarm status
			port.postMessage({
				type: GET_ALARM_STATUS_PROGESS,
			});

			// * Check if location is entered
			port.postMessage({
				type: IS_LOCATION_ENTERED_PROGRESS,
			});

			// * event listener for content port
			port?.onMessage?.addListener(function (extensionContentScriptMsg) {
				const { type, payload } = extensionContentScriptMsg;
				switch (type) {
					case READ_WAIT_TIME_SUCCESS:
						toggleIsReadingData(false);
						setVisaMonitoringData((prev) => ({
							...prev,
							[payload?.nonImmigrantVisaType]: payload?.waitTime,
						}));
						return;

					case GET_ALARM_STATUS_SUCCESS:
						toggleIsAlarmSet(payload?.['alarm']);
						setAlarmStatus(payload);
						if (payload?.['repeatPeriod'])
							chrome?.storage?.local
								?.get(['leftOverTime', 'lastNotedAt'])
								?.then((request) => {
									setReloadTimeLeft(
										Number(request?.['leftOverTime']) -
											(Date.now() - Number(request?.['lastNotedAt'])),
									);
								});
						return;

					case GET_FILTER_NONIMMIGRANTS_TYPES_SUCCESS:
						setNonImmigrantVisaTypes(payload);
						setSelectedNonImmigrantVisaType((prev) => {
							if (!payload?.length) return prev;
							return payload?.[0];
						});
						return;

					case IS_LOCATION_ENTERED_SUCCESS:
						toggleIsLocationEntered(payload?.isLocationEntered);
						return;

					case SET_LEFTOVER_RELOADING_TIME_SUCCESS: {
						return;
					}
					case RELOAD_COUNTDOWN_PROGRESS:
						chrome?.storage?.local?.get(['repeatPeriod'])?.then((request) => {
							setReloadTimeLeft(Date.now() + Number(request?.['repeatPeriod']));
						});
						return;
					default:
						console.log('No Case mentioned - app.js');
				}
			});
		});
	}, []);

	// * Read current value of filter
	useEffect(() => {
		selectedNonImmigrantVisaType &&
			extensionContentScriptPort?.then((port) => {
				port.postMessage({
					type: READ_WAIT_TIME_PROGRESS,
					payload: {
						nonImmigrantVisaType: selectedNonImmigrantVisaType,
					},
				});
			});
	}, [selectedNonImmigrantVisaType]);

	// * Fire when 'location entered' check
	useEffect(() => {
		extensionContentScriptPort?.then((port) => {
			if (isLocationEntered) {
				// * Get filter non-immigrants types
				port.postMessage({
					type: GET_FILTER_NONIMMIGRANTS_TYPES_PROGRESS,
				});
			}
		});
	}, [isLocationEntered]);

	function handleApplyFilter(event) {
		event.preventDefault();

		const formData = new FormData(formRef?.current);
		const formEnteries = Object.fromEntries(formData?.entries());
		chrome?.runtime?.sendMessage(
			JSON.stringify({
				type: SET_ALARM_PROGRESS,
				payload: {
					...formEnteries,
					['checkNotifyOnlyOnThreshold']: notifyOnlyOnThreshold,
					['filterName']: selectedNonImmigrantVisaType,
					['currentValue']: visaMonitoringData?.[selectedNonImmigrantVisaType],
					alarmSetAt: Date.now(),
				},
			}),
			function (response) {
				const { type } = response;
				switch (type) {
					case SET_ALARM_SUCCESS: {
						toggleIsAlarmSet(true);
						setAlarmStatus({
							filterName: formEnteries?.['nonImmigrantVisaType'],
							thresholdValue: formEnteries?.['thresholdValue'],
							repeatPeriod: formEnteries?.['repeatPeriod'],
						});

						setReloadTimeLeft(
							(prev) =>
								prev +
								Date.now() +
								Number(formEnteries?.['repeatPeriod']) * 60 * 1000,
						);

						// * Clear form fields here
						const formCurrentTarget = event?.currentTarget;
						formCurrentTarget?.reset();
						return;
					}
					default:
						return;
				}
			},
		);
	}

	function handleCancelAlarm(event) {
		event.preventDefault();

		chrome?.runtime?.sendMessage(
			JSON.stringify({
				type: CANCEL_ALARM_PROGRESS,
			}),
			function (response) {
				const { type } = response;
				switch (type) {
					case CANCEL_ALARM_SUCCESS:
						toggleIsAlarmSet(false);
						toggleNotifyOnlyOnThreshold(false);
						setReloadTimeLeft(0);
						return;
					default:
						return;
				}
			},
		);
	}

	function countdownOnTickHandler(timeDelta) {
		extensionContentScriptPort?.then((port) =>
			port?.postMessage({
				type: SET_LEFTOVER_RELOADING_TIME_PROGRESS,
				payload: {
					leftOverTime:
						Date.now() +
						timeDelta?.days * 24 * 60 * 60 * 1000 +
						timeDelta?.hours * 60 * 60 * 1000 +
						timeDelta?.minutes * 60 * 1000 +
						timeDelta?.seconds * 1000 +
						timeDelta?.milliseconds,
					lastNotedAt: Date.now(),
				},
			}),
		);
	}

	return (
		<main className='container'>
			<header>
				<h1 className='h2'>{MSG_TITLE}</h1>
			</header>

			{/* Filters Section  */}
			<section className='filters-container'>
				<h2 id='filters-title' className='h3'>
					{MSG_FILTERS_TITLE}
				</h2>

				{isAlarmSet ? (
					<React.Fragment>
						<div className='card text-dark bg-light my-4'>
							<div className='card-header'>
								<b>Alarm Details</b>
							</div>
							<ul className='list-group list-group-flush'>
								<li className='list-group-item'>
									<span className='w-30'>
										<b className='text-muted'>FILTER NAME: </b>
									</span>
									<span className='w-60'>{alarmStatus?.['filterName']}</span>
								</li>
								<li className='list-group-item'>
									<span className='w-30'>
										<b className='text-muted'>Threshold Value: </b>
									</span>
									<span className='w-60'>
										{alarmStatus?.['thresholdValue']}
									</span>
								</li>
								<li className='list-group-item'>
									<span className='w-30'>
										<b className='text-muted'>Repeat Period: </b>
									</span>
									<span className='w-60'>
										{alarmStatus?.['repeatPeriod']} min
									</span>
								</li>
								<li className='list-group-item'>
									<span className='w-30'>
										<b className='text-muted'>Notify Only On Threshold: </b>
									</span>
									<span className='w-60'>
										{notifyOnlyOnThreshold ? 'on' : 'off'}
									</span>
								</li>
							</ul>
							<div className='card-footer'>
								<p>Time left for next notification: </p>
								{reloadTimeLeft && (
									<ReactCountdown
										date={reloadTimeLeft}
										onTick={countdownOnTickHandler}
									/>
								)}
							</div>
						</div>
						<button
							type='button'
							onClick={handleCancelAlarm}
							className='btn btn-secondary btn-sm'
						>
							Cancel Alarm
						</button>
					</React.Fragment>
				) : !isLocationEntered ? (
					<span>Please select one city from visa wait time site.</span>
				) : (
					<form ref={formRef} onSubmit={handleApplyFilter}>
						<div className='mb-3'>
							<label className='form-label' htmlFor='filterName'>
								Filter Non-Immigrant Visa Type
							</label>
							<select
								id='filterName'
								className='form-select form-select-sm'
								aria-label='.form-select-sm'
								onChange={(event) =>
									setSelectedNonImmigrantVisaType(event?.target?.value)
								}
								name='nonImmigrantVisaType'
							>
								<option disabled>Select Non-Immigrant Visa Type</option>
								{nonImmigrantVisaTypes?.map((nonImmigrantVisaType, index) => (
									<option value={nonImmigrantVisaType} key={index}>
										{nonImmigrantVisaType}
									</option>
								))}
							</select>
						</div>

						{isReadingData ? (
							<span>Wait for data to load</span>
						) : (
							<React.Fragment>
								<p>
									Current Value:{' '}
									<span>
										{visaMonitoringData?.[selectedNonImmigrantVisaType]}
									</span>
								</p>
								<div className='mb-3'>
									<label htmlFor='thresholdValue' className='form-label'>
										Threshold Value
									</label>
									<input
										max={visaMonitoringData?.[selectedNonImmigrantVisaType]}
										required={true}
										type={'number'}
										id='thresholdValue'
										name='thresholdValue'
										className='form-control'
									/>
								</div>

								<div className='mb-3'>
									<label htmlFor='repeatPeriod' className='form-label'>
										Repeat Period (minutes)
									</label>
									<input
										min={1}
										required={true}
										type={'number'}
										id='repeatPeriod'
										name='repeatPeriod'
										className='form-control'
									/>
								</div>
								<div className='form-check form-switch mb-3'>
									<input
										className='form-check-input'
										type='checkbox'
										id='onlyOnThresholdCheck'
										checked={notifyOnlyOnThreshold}
										onChange={() =>
											toggleNotifyOnlyOnThreshold((prev) => !prev)
										}
									/>
									<label
										className='form-check-label'
										htmlFor='onlyOnThresholdCheck'
									>
										Notify only on threshold
									</label>
								</div>
								<div className='flex flex-column justify-center align-items-center gap-4'>
									<button className='btn btn-primary btn-sm' type='submit'>
										Set Alarm
									</button>
								</div>
							</React.Fragment>
						)}
					</form>
				)}
			</section>
		</main>
	);
}
