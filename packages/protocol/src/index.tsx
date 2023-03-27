import { hydrate, render } from 'react-dom';
import { initGoogleGtm } from '@ankr.com/common';

// eslint-disable-next-line import/no-extraneous-dependencies
import '@ankr.com/global-menu/src/assets/fonts/style.css';
import App from './App';
import { initializeMixpanel } from 'modules/analytics/mixpanel/initialize';
import { initializeSentry } from 'modules/sentry';
import { initializeLocale } from 'modules/i18n/utils/initialize';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { isReactSnap } from 'modules/common/utils/isReactSnap';

if (!isReactSnap) {
  initializeSentry();
  initializeMixpanel();
  initGoogleGtm();
}

initializeLocale();

const rootElement = document.getElementById('root');

if (rootElement?.hasChildNodes()) {
  hydrate(<App />, rootElement);
} else {
  render(<App />, rootElement);
}

// https://github.com/webpack/webpack-dev-server/issues/4540
// service worker doesn't work in dev mode

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
if (!isReactSnap) {
  serviceWorkerRegistration.register();
}
