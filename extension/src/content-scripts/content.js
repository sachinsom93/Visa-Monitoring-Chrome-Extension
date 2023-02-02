import {
	CONTENT_BACKGROUND,
	EXTENSION_CONTENTSCRIPT,
	GET_ALARM_STATUS_PROGESS,
	GET_ALARM_STATUS_SUCCESS,
	GET_FILTER_NONIMMIGRANTS_TYPES_PROGRESS,
	GET_FILTER_NONIMMIGRANTS_TYPES_SUCCESS,
	IS_LOCATION_ENTERED_PROGRESS,
	IS_LOCATION_ENTERED_SUCCESS,
	READ_WAIT_TIME_PROGRESS,
	READ_WAIT_TIME_SUCCESS,
} from '../contants';
import {
	isLocationEntered,
	readNonImmigrantTypes,
	readWaitTimes,
} from './dom_utils';

/* eslint-disable no-undef*/
const contentBackgroundPort = chrome?.runtime?.connect({
	name: CONTENT_BACKGROUND,
});

// ? CONTENT SCRIPT <--> BACKGROUND SERVICE WORKER -- onMessage EVENT
contentBackgroundPort?.onMessage?.addListener(function (contentBackgroundMsg) {
	const { type, payload } = contentBackgroundMsg;
	switch (type) {
		case READ_WAIT_TIME_PROGRESS:
			location?.reload();
			contentBackgroundPort.postMessage({
				type: READ_WAIT_TIME_SUCCESS,
				payload: readWaitTimes(payload?.nonImmigrantVisaType),
			});
			return;
		default:
			return;
	}
});

// ? CONTENT SCRIPT <--> EXTENSION -- onConnect EVENT
chrome?.runtime?.onConnect?.addListener(function (extensionContentScriptPort) {
	console.assert(extensionContentScriptPort?.name === EXTENSION_CONTENTSCRIPT);

	// ? CONTENT SCRIPT <--> EXTENSION -- onMessage EVENT
	extensionContentScriptPort?.onMessage?.addListener(function (
		extensionContentScriptMsg,
	) {
		const { type, payload } = extensionContentScriptMsg;
		switch (type) {
			case READ_WAIT_TIME_PROGRESS: {
				let { nonImmigrantVisaType, waitTime } = readWaitTimes(
					payload?.nonImmigrantVisaType,
				);
				extensionContentScriptPort?.postMessage({
					type: READ_WAIT_TIME_SUCCESS,
					payload: {
						nonImmigrantVisaType,
						waitTime,
					},
				});
				return;
			}
			case GET_ALARM_STATUS_PROGESS: {
				chrome?.storage?.local
					?.get([
						'alarm',
						'filterName',
						'thresholdValue',
						'repeatPeriod',
						'checkNotifyOnlyOnThreshold',
					])
					?.then((request) => {
						extensionContentScriptPort?.postMessage({
							type: GET_ALARM_STATUS_SUCCESS,
							payload: {
								alarm: request?.['alarm'],
								filterName: request?.['filterName'],
								thresholdValue: request?.['thresholdValue'],
								repeatPeriod: request?.['repeatPeriod'],
								checkNotifyOnlyOnThreshold:
									request?.['checkNotifyOnlyOnThreshold'],
							},
						});
					});
				return;
			}
			case GET_FILTER_NONIMMIGRANTS_TYPES_PROGRESS: {
				return extensionContentScriptPort?.postMessage({
					type: GET_FILTER_NONIMMIGRANTS_TYPES_SUCCESS,
					payload: readNonImmigrantTypes(),
				});
			}
			case IS_LOCATION_ENTERED_PROGRESS: {
				return extensionContentScriptPort?.postMessage({
					type: IS_LOCATION_ENTERED_SUCCESS,
					payload: {
						isLocationEntered: isLocationEntered(),
					},
				});
			}
			default:
				console.log('NO TYPE MENTIONED - content-script');
		}
	});
});
