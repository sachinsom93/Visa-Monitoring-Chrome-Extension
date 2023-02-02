export function readWaitTimes(_nonImmigrantVisaType) {
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
	for (let tableCells of tableRows) {
		const nonImmigrantCells = tableCells?.getElementsByTagName('td');
		const nonImmigrantVisaType = nonImmigrantCells?.[0]?.innerText;
		const waitTime = Number(nonImmigrantCells?.[1]?.innerText?.split(' ')?.[0]);
		if (nonImmigrantVisaType === _nonImmigrantVisaType) {
			return {
				nonImmigrantVisaType,
				waitTime,
			};
		}
	}
	return undefined;
}

export function readNonImmigrantTypes() {
	const nonImmigrantVisaTypes = [];

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
	for (let tableCells of tableRows) {
		const nonImmigrantCells = tableCells?.getElementsByTagName('td');
		const nonImmigrantVisaType = nonImmigrantCells?.[0]?.innerText;
		nonImmigrantVisaType && nonImmigrantVisaTypes?.push(nonImmigrantVisaType);
	}
	return nonImmigrantVisaTypes;
}
