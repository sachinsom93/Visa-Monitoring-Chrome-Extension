import {
	CANCEL_ALARM_PROGRESS,
	CANCEL_ALARM_SUCCESS,
	CONTENT_BACKGROUND,
	READ_WAIT_TIME_PROGRESS,
	READ_WAIT_TIME_SUCCESS,
	SET_ALARM_PROGRESS,
	SET_ALARM_SUCCESS,
} from '../contants';
import { FILTER_ALARM } from '../contants/alarms';

/* eslint-disable no-undef */
let notificationId = 0;

chrome?.runtime?.onConnect?.addListener(function (contentBackgroundPort) {
	console.assert(contentBackgroundPort?.name === CONTENT_BACKGROUND);

	contentBackgroundPort?.onMessage?.addListener(function (
		contentBackgroundMsg,
	) {
		const { type, payload } = contentBackgroundMsg;

		if (type === READ_WAIT_TIME_SUCCESS) {
			const currentValue = payload?.waitTime;
			const nonImmigrantVisaType = payload?.nonImmigrantVisaType;

			// * Get checkNotifyOnlyOnThreshold status
			chrome?.storage?.local
				?.get(['checkNotifyOnlyOnThreshold', 'thresholdValue'])
				.then((request) => {
					const thresholdValue = request?.['thresholdValue'];
					const checkNotifyOnlyOnThreshold =
						request?.['checkNotifyOnlyOnThreshold'];

					if (
						checkNotifyOnlyOnThreshold === 'on' ||
						checkNotifyOnlyOnThreshold === true
					) {
						// * Compare current wait time with threshold time

						if (
							currentValue &&
							currentValue <= thresholdValue &&
							nonImmigrantVisaType
						) {
							// * Create notification
							chrome?.notifications?.create(
								'thresholdWaitTimeNotification-' + notificationId,
								{
									type: 'basic',
									title: 'Visa Appointment Wait Time Monitor',
									message: `Current wait time for ${nonImmigrantVisaType} reaches to it's threshold value.`,
									iconUrl: '../../logo192.png',
									priority: 2,
								},
							);
							notificationId += 1;
						}
					} else if (nonImmigrantVisaType && currentValue) {
						chrome?.notifications?.create(
							'waitTimeStatusNotification-' + notificationId,
							{
								type: 'basic',
								title: 'Visa Wait Time Monitoring Extension',
								message: `Current Value for ${payload?.nonImmigrantVisaType} is ${payload?.waitTime}`,
								iconUrl: '../../logo192.png',
								priority: 2,
							},
						);
						notificationId += 1;
					}
				});
		}
	});
	chrome?.alarms?.onAlarm.addListener(function (alarm) {
		const alarmType = alarm?.name;
		const scheduledTime = alarm?.scheduledTime;
		switch (alarmType) {
			case FILTER_ALARM:
				// * Read storage for filter name
				chrome?.storage?.local
					?.get(['filterName', 'repeatPeriod'])
					?.then((request) => {
						// * Get updated wait times
						contentBackgroundPort?.postMessage({
							// TODO: Port closed!!!!!!
							type: READ_WAIT_TIME_PROGRESS,
							payload: {
								nonImmigrantVisaType: request?.filterName,
							},
						});
						// * Save next alarm epoch's scheduledTime to storage
						chrome?.storage?.local?.set({
							scheduledTime:
								scheduledTime + Number(request?.['repeatPeriod']) * 60 * 1000,
						});
					});
				break;
			default:
				console.error({ alarm });
				break;
		}
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
				chrome?.alarms?.create(FILTER_ALARM, {
					periodInMinutes: Number(repeatPeriod),
				});
			}

			// * Set alarm info in storage & alarm state
			const alarmStatus = {
				alarm: true,
				filterName: payload?.['filterName'],
				thresholdValue: payload?.['thresholdValue'],
				repeatPeriod: payload?.['repeatPeriod'],
				checkNotifyOnlyOnThreshold: payload?.['checkNotifyOnlyOnThreshold'],
				scheduledTime: payload?.['scheduledTime'],
			};
			chrome?.storage?.local?.set(alarmStatus);

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

			return sendResponse({
				type: CANCEL_ALARM_SUCCESS,
			});
		}
		default:
			return;
	}
});
