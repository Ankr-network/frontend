import { RequestAction, RequestsStore } from '@redux-requests/core';

import { throwIfError } from 'common';
import { AvailableWriteProviders } from 'provider';

import { connect } from 'modules/auth/actions/connect';

export function createWalletConnectionGuard(provider: AvailableWriteProviders) {
  return function walletConnectionGuard(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
    request: any,
    action: RequestAction,
    store: RequestsStore,
  ): { promise: Promise<unknown> } {
    return {
      promise: (async () => {
        const { data } = throwIfError(
          await store.dispatchRequest(connect(provider)),
        );

        return request.promise(store, data);
      })(),
    };
  };
}
