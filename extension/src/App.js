import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MSG_FILTERS_TITLE, MSG_TITLE } from './i18n/index';
import './app.css';
import {
	CANCEL_ALARM_PROGRESS,
	CANCEL_ALARM_SUCCESS,
	EXTENSION_CONTENTSCRIPT,
	READ_WAIT_TIME_PROGRESS,
	READ_WAIT_TIME_SUCCESS,
	SET_ALARM_PROGRESS,
	SET_ALARM_SUCCESS,
} from './contants';

const TEMP_WORKERS_FILTER =
	'Interview Required Petition-Based Temporary Workers (H, L, O, P, Q)';

export default function App() {
	/* eslint-disable no-undef */
	const formRef = useRef(null);
	const [isReadingData, toggleIsReadingData] = useState(true);
	const [visaMonitoringData, setVisaMonitoringData] = useState({});
	const [statusMessage, setStatusMessage] = useState('');

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
			port.postMessage({
				type: READ_WAIT_TIME_PROGRESS,
			});
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
					default:
						console.log('No Case mentioned - app.js');
				}
			});
		});
	}, []);

	function handleApplyFilter(event) {
		event.preventDefault();

		const formData = new FormData(formRef?.current);
		const formEnteries = Object.fromEntries(formData?.entries());
		chrome?.runtime?.sendMessage(
			JSON.stringify({
				type: SET_ALARM_PROGRESS,
				payload: {
					...formEnteries,
					['filterName']: TEMP_WORKERS_FILTER,
					['currentValue']: visaMonitoringData?.[TEMP_WORKERS_FILTER],
				},
			}),
			function (response) {
				const { type } = response;
				switch (type) {
					case SET_ALARM_SUCCESS:
						setStatusMessage('Alarm set successfully.');
						formRef?.current?.clear();
						return;
					case CANCEL_ALARM_SUCCESS:
						setStatusMessage('Alarm cancelled successfully');
						return;
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

				<form ref={formRef} onSubmit={handleApplyFilter}>
					<p className='text-bold'>{TEMP_WORKERS_FILTER}</p>

					{isReadingData ? (
						<span>Wait for data to load</span>
					) : (
						<React.Fragment>
							<p>
								Current Value:{' '}
								<span>{visaMonitoringData?.[TEMP_WORKERS_FILTER]}</span>
							</p>
							<div className='mb-3'>
								<label htmlFor='thresholdValue' className='form-label'>
									Threshold Value
								</label>
								<input
									max={visaMonitoringData?.[TEMP_WORKERS_FILTER]}
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
							<div className='flex flex-column justify-center align-items-center gap-4'>
								<button className='btn btn-primary btn-sm' type='submit'>
									Set Alarm
								</button>
								<button
									type='button'
									onClick={handleCancelAlarm}
									className='btn btn-secondary btn-sm mx-2'
								>
									Cancel Alarm
								</button>
							</div>
							<div className='text-muted my-2'>{statusMessage}</div>
						</React.Fragment>
					)}
				</form>
			</section>
		</main>
	);
}
