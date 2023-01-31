import {
	CONTENT_BACKGROUND,
	EXTENSION_CONTENTSCRIPT,
	READ_WAIT_TIME_PROGRESS,
	READ_WAIT_TIME_SUCCESS,
} from '../contants';

/* eslint-disable no-undef*/
const contentBackgroundPort = chrome?.runtime?.connect({
	name: CONTENT_BACKGROUND,
});

contentBackgroundPort?.onMessage?.addListener(function (contentBackgroundMsg) {
	const { type } = contentBackgroundMsg;
	switch (type) {
		case READ_WAIT_TIME_PROGRESS:
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

chrome?.runtime?.onConnect?.addListener(function (extensionContentScriptPort) {
	console.assert(extensionContentScriptPort?.name === EXTENSION_CONTENTSCRIPT);

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
			default:
				console.log('NO TYPE MENTIONED - content-script');
		}
	});
});
