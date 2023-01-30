import React from 'react';
import { MSG_FILTERS_TITLE, MSG_TITLE } from './i18n/index';
import './app.css';
import { APPLY_FILTERS } from './contants';

export default function App() {
	/* eslint-disable no-undef */
	const formRef = React.useRef(null);

	// const extensionToScriptPort = React.useMemo(
	// 	() =>
	// 		(async function () {
	// 			const currentTabQuery = {
	// 				active: true,
	// 				currentWindow: true,
	// 			};
	// 			const currentTabId = (await chrome?.tabs?.query(currentTabQuery))?.[0]
	// 				.id;
	// 			return chrome?.tabs?.connect(currentTabId, {
	// 				name: EXTENSION_CONTENTSCRIPT,
	// 			});
	// 		})(),
	// 	[],
	// );

	function handleApplyFilter(event) {
		event.preventDefault();

		const formData = new FormData(formRef?.current);
		const formEnteries = Object.fromEntries(formData?.entries());
		// console.log(formEnteries);

		// extensionToScriptPort?.then((port) => {
		// 	port?.postMessage({
		// 		type: APPLY_FILTERS,
		// 		payload: formEnteries,
		// 	});
		// });

		chrome?.runtime?.sendMessage(
			{
				type: APPLY_FILTERS,
				payload: JSON.stringify(formEnteries),
			},
			function (response) {
				console.log({ response });
			},
		);
	}
	return (
		<main className='container'>
			<header>
				<h1>{MSG_TITLE}</h1>
			</header>

			{/* Filters Section  */}
			<section className='filters-container'>
				<h2 id='filters-title'>{MSG_FILTERS_TITLE}</h2>

				<form ref={formRef} onSubmit={handleApplyFilter}>
					<h3>
						Interview Required Petition-Based Temporary Workers (H, L, O, P, Q)
					</h3>

					<div className='form-control'>
						<label htmlFor='filters-#1'>Threshold Value</label>
						<input
							type={'number'}
							id='filters-#1-thresholdValue'
							name='filters-#1-thresholdValue'
						/>
					</div>

					<div className='form-control'>
						<label htmlFor='filters-#1'>Repeat Period (minutes)</label>
						<input
							type={'number'}
							id='filters-#1-repeatPeriod'
							name='filters-#1-repeatAfter'
						/>
					</div>
					<button type='submit'>Apply Filter</button>
				</form>
			</section>
		</main>
	);
}
