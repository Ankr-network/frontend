import { RequestAction, RequestsStore } from '@redux-requests/core';
import { connect } from '../actions/connect';
import { throwIfError } from '../../api/utils/throwIfError';

export function walletConnectionGuard(
  request: any,
  action: RequestAction,
  store: RequestsStore,
) {
  return {
    promise: (async () => {
      const { data } = throwIfError(await store.dispatchRequest(connect()));

      return request.promise(store, data);
    })(),
  };
}
