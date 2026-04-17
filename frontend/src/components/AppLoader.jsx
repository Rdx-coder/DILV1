import React from 'react';

const loaderHighlights = [
  'Expanding access to learning',
  'Shaping practical innovation',
  'Connecting mentors and builders'
];

const AppLoader = () => {
  return (
    <div className="app-loader" role="status" aria-live="polite" aria-label="Loading Dangi Innovation Lab">
      <div className="app-loader-inner">
        <div className="app-loader-brand">
          <span className="app-loader-mark">DIL</span>
          <span className="app-loader-status">Preparing your next step</span>
        </div>

        <div className="app-loader-copy">
          <p className="app-loader-kicker">Dangi Innovation Lab</p>
          <h1>Innovation, mentorship, and community are on the way.</h1>
          <p>
            Bringing together programs, products, and opportunities designed to help
            underserved communities grow with confidence.
          </p>
        </div>

        <div className="app-loader-progress" aria-hidden="true">
          <span className="app-loader-progress-bar"></span>
        </div>

        <div className="app-loader-grid" aria-hidden="true">
          {loaderHighlights.map((item) => (
            <div key={item} className="app-loader-pill">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
