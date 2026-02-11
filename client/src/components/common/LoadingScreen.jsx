import React from 'react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      {message && <p className="loading-text">{message}</p>}
    </div>
  );
};

export default LoadingScreen;
