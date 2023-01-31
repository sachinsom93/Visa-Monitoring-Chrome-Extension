import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MSG_FILTERS_TITLE, MSG_TITLE } from './i18n/index';
import './app.css';
import {
	CANCEL_ALARM_PROGRESS,
	EXTENSION_CONTENTSCRIPT,
	READ_WAIT_TIME_PROGRESS,
	READ_WAIT_TIME_SUCCESS,
	SET_ALARM_PROGRESS,
} from './contants';

const TEMP_WORKERS_FILTER =
	'Interview Required Petition-Based Temporary Workers (H, L, O, P, Q)';

export default function App() {
	/* eslint-disable no-undef */
	const formRef = useRef(null);
	const [isReadingData, toggleIsReadingData] = useState(true);
	const [visaMonitoringData, setVisaMonitoringData] = useState({});

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
				console.log({ response });
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
				<h1>{MSG_TITLE}</h1>
			</header>

			{/* Filters Section  */}
			<section className='filters-container'>
				<h2 id='filters-title'>{MSG_FILTERS_TITLE}</h2>

				<form ref={formRef} onSubmit={handleApplyFilter}>
					<h3>{TEMP_WORKERS_FILTER}</h3>

					{isReadingData ? (
						<span>Wait for data to load</span>
					) : (
						<React.Fragment>
							<p>
								Current Value:{' '}
								<span>{visaMonitoringData?.[TEMP_WORKERS_FILTER]}</span>
							</p>
							<div className='form-control'>
								<label htmlFor='filters-#1'>Threshold Value</label>
								<input
									type={'number'}
									id='thresholdValue'
									name='thresholdValue'
								/>
							</div>

							<div className='form-control'>
								<label htmlFor='filters-#1'>Repeat Period (minutes)</label>
								<input type={'number'} id='repeatPeriod' name='repeatPeriod' />
							</div>
							<button type='submit'>Set Alarm</button>
							<button type='button' onClick={handleCancelAlarm}>
								Cancel Alarm
							</button>
						</React.Fragment>
					)}
				</form>
			</section>
		</main>
	);
}
