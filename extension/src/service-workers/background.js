import {
	CANCEL_ALARM_PROGRESS,
	CANCEL_ALARM_SUCCESS,
	CONTENT_BACKGROUND,
	SET_ALARM_PROGRESS,
	SET_ALARM_SUCCESS,
} from '../contants';
import { FILTER_ALARM } from '../contants/alarms';
import {
	contentBackgroundOnMessageCallback,
	onAlarmCallback,
} from './listener_callbacks';

/* eslint-disable no-undef */
// let contentBackgroundPort;

chrome?.runtime?.onConnect?.addListener(function (_contentBackgroundPort) {
	// * Port checking
	console.assert(_contentBackgroundPort?.name === CONTENT_BACKGROUND);

	// * Port assigning
	// contentBackgroundPort = _contentBackgroundPort;

	// * Register onMessage Callback
	_contentBackgroundPort?.onMessage?.addListener(
		contentBackgroundOnMessageCallback,
	);

	// * Register onAlerm Callback
	chrome?.alarms?.onAlarm.addListener((alarm) =>
		onAlarmCallback(alarm, _contentBackgroundPort),
	);

	// * Register onDisconnect Callback
	_contentBackgroundPort?.onDisconnect?.addListener(function () {
		_contentBackgroundPort = null;
	});
});

chrome?.runtime?.onMessage?.addListener(function (
	request,
	sender,
	sendResponse,
) {
	const jsonReq = JSON.parse(request);
	const type = jsonReq?.type;
	const payload = jsonReq?.payload;
	switch (type) {
		case SET_ALARM_PROGRESS: {
			// * Set alarm
			const repeatPeriod = payload?.['repeatPeriod'];
			if (repeatPeriod) {
				// * Check if already exists
				chrome?.alarms?.get(FILTER_ALARM, function (alarm) {
					if (!alarm)
						chrome?.alarms?.create(FILTER_ALARM, {
							periodInMinutes: Number(repeatPeriod),
						});
				});
			}

			// * Set alarm info in storage & alarm state
			const alarmStatus = {
				alarm: true,
				filterName: payload?.['nonImmigrantVisaType'],
				thresholdValue: payload?.['thresholdValue'],
				repeatPeriod: payload?.['repeatPeriod'],
				checkNotifyOnlyOnThreshold: payload?.['checkNotifyOnlyOnThreshold'],
				scheduledTime: payload?.['scheduledTime'],
			};
			chrome?.storage?.local?.set(alarmStatus);

			// * Set Badge text & Color
			chrome.action.setBadgeText({ text: 'ON' });
			chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });

			return sendResponse({
				type: SET_ALARM_SUCCESS,
				payload: alarmStatus,
			});
		}
		case CANCEL_ALARM_PROGRESS: {
			// * Cancel alarm
			chrome?.alarms?.clear(FILTER_ALARM);

			// * Clear alarm state from storage
			chrome?.storage?.local?.clear();

			// * Toggle alarm state in storage
			chrome?.storage?.local?.set({ alarm: false });

			// * Remvoe Badge
			chrome.action.setBadgeText({ text: '' });

			return sendResponse({
				type: CANCEL_ALARM_SUCCESS,
			});
		}
		default:
			return;
	}
});
