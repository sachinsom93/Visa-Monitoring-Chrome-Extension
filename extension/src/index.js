import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App';
import './index.css';
// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap Bundle JS
import 'bootstrap/dist/js/bootstrap.bundle.min';

const rootElement = document.getElementById('root');
const rootContainer = createRoot(rootElement);

// * Render Root
// TODO: Remove strict-mode for production build
rootContainer.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
