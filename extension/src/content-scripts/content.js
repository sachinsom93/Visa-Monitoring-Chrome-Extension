import {
	APPLY_FILTERS,
	CONTENT_BACKGROUND,
	EXTENSION_CONTENTSCRIPT,
	SET_ALARM,
} from '../contants';

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
	if (tableRows)
		for (let tableRow of tableRows) {
			// * Get cols
			const rowCells = tableRow?.getElementsByTagName('td');

			const nonImmigrantVisaType = rowCells?.[0]?.innerHTML;
			const waitTime = Number(rowCells?.[1]?.innerText?.split(' ')?.[0]); // TODO: Error Handling

			console.log(
				'Nonimmigrant Visa Type: ' +
					nonImmigrantVisaType +
					', Wait Time: ' +
					waitTime,
			);
		}
}

/* eslint-disable no-undef */
const contentBackgroundPort = chrome?.runtime?.connect({
	name: CONTENT_BACKGROUND,
});

chrome?.runtime?.onConnect?.addListener(function (extensionContentPort) {
	console.assert(extensionContentPort?.name === EXTENSION_CONTENTSCRIPT);

	extensionContentPort?.onMessage?.addListener(function (extensionContentMsg) {
		const { type } = extensionContentMsg;

		switch (type) {
			case APPLY_FILTERS:
				return contentBackgroundPort.postMessage({
					type: SET_ALARM,
					payload: {
						periodInMinutes: 1,
					},
				});
			default:
				console.log({ extensionContentMsg });
		}
	});
});
