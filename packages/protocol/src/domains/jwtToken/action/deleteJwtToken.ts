import { MultiService } from 'modules/api/MultiService';
import { TwoFAQueryFnParams } from 'store/queries/types';
import { createQueryFnWithErrorHandler } from 'store/utils/createQueryFnWithErrorHandler';
import { fetchAllJwtTokenRequests } from './getAllJwtToken';
import { web3Api } from 'store/queries';

interface DeleteJwtTokenParams {
  tokenIndex: number;
  group?: string;
}

export const {
  useLazyDeleteJwtTokenQuery,
  endpoints: { deleteJwtToken },
} = web3Api.injectEndpoints({
  endpoints: build => ({
    deleteJwtToken: build.query<null, TwoFAQueryFnParams<DeleteJwtTokenParams>>(
      {
        queryFn: createQueryFnWithErrorHandler({
          queryFn: async (
            { params: { tokenIndex, group }, totp },
            { dispatch },
          ) => {
            const service = MultiService.getService().getAccountGateway();

            await service.deleteJwtToken({ index: tokenIndex, group, totp });

            dispatch(fetchAllJwtTokenRequests.initiate({ group }));

            return { data: null };
          },
          errorHandler: error => {
            return {
              error,
            };
          },
        }),
      },
    ),
  }),
});
