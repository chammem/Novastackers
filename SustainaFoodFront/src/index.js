// Import error suppressor at the very top before anything else
import './utils/errorSuppressor';

// Import error handler first - before any other imports
import './utils/errorHandler';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);