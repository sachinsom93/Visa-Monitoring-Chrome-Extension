import { APPLY_FILTERS, CONTENT_BACKGROUND } from '../contants';
import { FILTER_ALARM } from '../contants/alarms';

/* eslint-disable no-undef */
let notificationId = 0;

// TODO: Wrap the listener inside chrome?.runtime?.onInstalled event
chrome?.alarms?.onAlarm.addListener(function (alarm) {
	const alarmType = alarm?.name;

	switch (alarmType) {
		case FILTER_ALARM:
			console.log(notificationId);
			chrome?.notifications?.create('testNotification-' + notificationId, {
				type: 'basic',
				title: 'Test Alarm',
				message: 'Test alarm message.',
				iconUrl: '../../logo192.png',
				priority: 2,
			});
			notificationId += 1;
			break;
		default:
			console.error({ alarm });
			break;
	}
});

chrome?.runtime?.onConnect?.addListener(function (contentBackgroundPort) {
	console.assert(contentBackgroundPort?.name === CONTENT_BACKGROUND);

	contentBackgroundPort?.onMessage?.addListener(function (
		contentBackgroundMsg,
	) {
		const { type } = contentBackgroundMsg;

		switch (type) {
			default:
				console.log('default case in background.js');
		}
	});
});

chrome?.runtime?.onMessage?.addListener(function (
	request,
	sender,
	sendResponse,
) {
	console.log(request);

	if (request?.type === APPLY_FILTERS) {
		const payload = JSON.parse(request?.payload);
		if (payload?.['filters-#1-repeatAfter']) {
			chrome?.alarms?.create(FILTER_ALARM, {
				periodInMinutes: Number(payload?.['filters-#1-repeatAfter']),
			});
		}
		sendResponse(() => false);
	}
});
