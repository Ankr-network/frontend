import { store } from 'store';
import { resetAuthData } from 'modules/auth/store/authSlice';
import { web3Api } from 'store/queries/web3Api';

export const {
  useLazyAuthDisconnectQuery,
  endpoints: { authDisconnect },
} = web3Api.injectEndpoints({
  endpoints: build => ({
    authDisconnect: build.query<boolean, void>({
      queryFn: async () => {
        store.dispatch(resetAuthData());

        return { data: true };
      },
      onQueryStarted: (_, { dispatch }) => {
        dispatch(web3Api.util.resetApiState());
      },
    }),
  }),
});
