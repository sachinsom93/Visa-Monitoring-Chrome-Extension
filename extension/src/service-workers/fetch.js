export async function getVisaWaitTimes() {
	const fetchResponse = await fetch(
		'https://travel.state.gov/content/travel/resources/database/database.getVisaWaitTimes.html?cid=P147&aid=VisaWaitTimesHomePage',
		{
			headers: {
				accept: '*/*',
				'accept-language': 'en-US,en;q=0.9',
			},
			body: null,
			method: 'GET',
		},
	);
	const txtResponse = await fetchResponse?.text();
	const arrResponse = txtResponse
		?.split('|')
		.map((el) => Number(el.replace(/ Days/, '')));

	const waitTimeResponse = [
		arrResponse?.[1],
		arrResponse?.[2],
		arrResponse?.[3],
		arrResponse?.[0],
		arrResponse?.[5],
		arrResponse?.[6],
		arrResponse?.[7],
		arrResponse?.[4],
	];
	return waitTimeResponse;
}

/*
jQuery('.num_days_waivervisitor').text(parseString(vwtdata[4],"other").trim());
*/
