import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Analytics = () => {
  const location = useLocation();
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!measurementId) return;

    const existingScript = document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    }

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }

    window.gtag = window.gtag || gtag;
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false });
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_path: `${location.pathname}${location.search}`,
      page_location: window.location.href,
      page_title: document.title
    });
  }, [location.pathname, location.search, measurementId]);

  return null;
};

export default Analytics;
