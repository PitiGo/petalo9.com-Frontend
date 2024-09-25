import React from 'react';
import { useLocation } from 'react-router-dom';

function ErrorComponent({ errorCode: propErrorCode, errorMessage: propErrorMessage }) {
  const location = useLocation();
  const { errorCode: stateErrorCode, errorMessage: stateErrorMessage } = location.state || { errorCode: 'Unknown', errorMessage: 'An unknown error occurred.' };

  const errorCode = stateErrorCode || propErrorCode;
  const errorMessage = stateErrorMessage || propErrorMessage;

  return (
    <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>
      <h2>Error {errorCode}</h2>
      <p>{errorMessage}</p>
    </div>
  );
}

export default ErrorComponent;
