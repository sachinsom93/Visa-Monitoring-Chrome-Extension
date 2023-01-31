export default function (messageName) {
	/* eslint-disable no-undef */
	return chrome?.i18n?.getMessage(messageName);
}
