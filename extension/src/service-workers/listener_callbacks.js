/* eslint-disable no-undef */
import { READ_WAIT_TIME_PROGRESS, READ_WAIT_TIME_SUCCESS } from '../contants';
import { FILTER_ALARM } from '../contants/alarms';
import { getVisaWaitTimes } from './fetch';

let notificationId = 0;

export function contentBackgroundOnMessageCallback(contentBackgroundMsg) {
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

				if (nonImmigrantVisaType && currentValue && thresholdValue) {
					if (checkNotifyOnlyOnThreshold) {
						currentValue <= thresholdValue &&
							chrome?.notifications?.create(
								'thresholdWaitTimeNotification-' + notificationId,
								{
									type: 'basic',
									title: 'Visa Appointment Wait Time Monitor',
									message: `Current wait time for ${nonImmigrantVisaType} reached to it's threshold value. Current Value: ${currentValue}`,
									iconUrl: '../../logo192.png',
									priority: 2,
								},
							);
					} else {
						chrome?.notifications?.create(
							'waitTimeStatusNotification-' + notificationId,
							{
								type: 'basic',
								title: 'Visa Wait Time Monitoring Extension',
								message: `Current Value for ${nonImmigrantVisaType} is ${currentValue}`,
								iconUrl: '../../logo192.png',
								priority: 2,
							},
						);
					}
					notificationId += 1;
				}
			});
	}
}

export function onAlarmCallback(alarm, contentBackgroundPort) {
	const alarmType = alarm?.name;
	const scheduledTime = alarm?.scheduledTime;
	switch (alarmType) {
		case FILTER_ALARM:
			// * Read storage for filter name
			chrome?.storage?.local
				?.get(['filterName', 'repeatPeriod'])
				?.then((request) => {
					// TODO: Replace reload() with API Call on READ_WAIT_TIME_PROGRESS event
					getVisaWaitTimes()?.then(console.log)?.catch(console.log);

					// * Get updated wait times
					contentBackgroundPort?.postMessage({
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
}
