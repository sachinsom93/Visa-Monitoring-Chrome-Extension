import {
	CONTENT_BACKGROUND,
	EXTENSION_CONTENTSCRIPT,
	GET_ALARM_STATUS_PROGESS,
	GET_ALARM_STATUS_SUCCESS,
	READ_WAIT_TIME_PROGRESS,
	READ_WAIT_TIME_SUCCESS,
} from '../contants';

/* eslint-disable no-undef*/
const contentBackgroundPort = chrome?.runtime?.connect({
	name: CONTENT_BACKGROUND,
});

// ? CONTENT SCRIPT <--> BACKGROUND SERVICE WORKER -- onMessage EVENT
contentBackgroundPort?.onMessage?.addListener(function (contentBackgroundMsg) {
	const { type } = contentBackgroundMsg;
	switch (type) {
		case READ_WAIT_TIME_PROGRESS:
			location?.reload();
			contentBackgroundPort.postMessage({
				type: READ_WAIT_TIME_SUCCESS,
				payload: readWaitTimes(),
			});
			return;
		default:
			return;
	}
});

export function readWaitTimes() {
	// * Table container
	const tableUpperContainer = document?.getElementById('table_wait_times_rwd');

	const tableContainer = tableUpperContainer?.getElementsByClassName(
		'visa_wait_times_table',
	)?.[0];

	// * table
	const table = tableContainer?.getElementsByTagName('table')?.[0];

	// * table rows
	const tableRows = table?.getElementsByTagName('tr');

	// * Process table rows
	if (tableRows) {
		const nonImmigrantCells = tableRows?.[2]?.getElementsByTagName('td');
		const nonImmigrantVisaType = nonImmigrantCells?.[0]?.innerText;
		const waitTime = Number(nonImmigrantCells?.[1]?.innerText?.split(' ')?.[0]);
		return {
			nonImmigrantVisaType,
			waitTime,
		};
	}
}

// ? CONTENT SCRIPT <--> EXTENSION -- onConnect EVENT
chrome?.runtime?.onConnect?.addListener(function (extensionContentScriptPort) {
	console.assert(extensionContentScriptPort?.name === EXTENSION_CONTENTSCRIPT);

	// ? CONTENT SCRIPT <--> EXTENSION -- onMessage EVENT
	extensionContentScriptPort?.onMessage?.addListener(function (
		extensionContentScriptMsg,
	) {
		const { type } = extensionContentScriptMsg;
		switch (type) {
			case READ_WAIT_TIME_PROGRESS: {
				let { nonImmigrantVisaType, waitTime } = readWaitTimes();
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
					?.get(['alarm', 'filterName', 'thresholdValue', 'repeatPeriod'])
					?.then((request) => {
						extensionContentScriptPort?.postMessage({
							type: GET_ALARM_STATUS_SUCCESS,
							payload: {
								alarm: request?.['alarm'],
								filterName: request?.['filterName'],
								thresholdValue: request?.['thresholdValue'],
								repeatPeriod: request?.['repeatPeriod'],
							},
						});
					});
				return;
			}
			default:
				console.log('NO TYPE MENTIONED - content-script');
		}
	});
});
