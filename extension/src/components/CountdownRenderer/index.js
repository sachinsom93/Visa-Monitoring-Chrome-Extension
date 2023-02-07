import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

export default function CountdownRenderer(timeDelta) {
	console.log(timeDelta);
	return (
		<div className='row'>
			<div className='col-2'>
				<span className='timeBadge'>{timeDelta?.days}</span>
				<p>D</p>
			</div>
			<div className='col-2'>
				<span className='timeBadge'>{timeDelta?.hours}</span>
				<p>H</p>
			</div>
			<div className='col-2'>
				<span className='timeBadge'>{timeDelta?.minutes}</span>
				<p>M</p>
			</div>
			<div className='col-2'>
				<span className='timeBadge'>{timeDelta?.seconds}</span>
				<p>S</p>
			</div>
			<div className='col-2'>
				<span className='timeBadge'>{timeDelta?.milliseconds}</span>
				<p>MS</p>
			</div>
		</div>
	);
}

CountdownRenderer.propTypes = {
	hours: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
		PropTypes.instanceOf(Date),
	]).isRequired,
	minutes: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
		PropTypes.instanceOf(Date),
	]).isRequired,
	seconds: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
		PropTypes.instanceOf(Date),
	]).isRequired,
	milliseconds: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
		PropTypes.instanceOf(Date),
	]).isRequired,
	days: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
		PropTypes.instanceOf(Date),
	]).isRequired,
};
