import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
const rootContainer = createRoot(rootElement);

// * Render Root
// TODO: Remove strict-mode for production build
rootContainer.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
