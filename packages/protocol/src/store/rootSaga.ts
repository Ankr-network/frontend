import { fork } from 'redux-saga/effects';

import { notificationSaga } from 'domains/notification/effects/notificationSaga';
import { connect } from 'modules/auth/actions/connect';
import { disconnect } from 'modules/auth/actions/disconnect';
import { MultiService } from 'modules/api/MultiService';
import { providerEventsSaga } from 'provider';

export function* rootSaga() {
  const { service } = MultiService.getInstance();

  yield fork(notificationSaga);
  yield fork(
    { context: null, fn: providerEventsSaga },
    {
      connectAction: connect.toString(),
      disconnectAction: disconnect.toString(),
      provider: service.getKeyProvider(),
      actions: {
        accountsChanged: disconnect,
        chainChanged: disconnect,
        disconnect,
      },
    },
  );
}
