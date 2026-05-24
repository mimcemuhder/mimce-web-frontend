import * as Sentry from '@sentry/react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

export function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (dsn) {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      integrations: [Sentry.browserTracingIntegration()],
    });
  }
}

function reportWebVital(metric: Metric) {
  if (import.meta.env.DEV) {
    console.warn(`[WebVital] ${metric.name}: ${Math.round(metric.value)}`);
  }

  const sentry = Sentry.getClient();
  if (sentry) {
    Sentry.setMeasurement(metric.name, metric.value, 'millisecond');
  }
}

export function reportWebVitals() {
  onCLS(reportWebVital);
  onINP(reportWebVital);
  onLCP(reportWebVital);
  onFCP(reportWebVital);
  onTTFB(reportWebVital);
}
