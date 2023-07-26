import { web3Api } from 'store/queries';

import { EVMLibraryID, EVMMethod } from '../constants';
import {
  EVMMethodResponse,
  FetchRequestParams,
  FetchRequestResult,
} from '../types';
import { getRPCCallsConfig } from '../utils/RPCCallsConfig';
import { buildProvider } from '../utils/buildProvider';
import { setEVMMethod } from '../store/requestComposerSlice';

export type FetchEVMRequestParams = FetchRequestParams<EVMLibraryID, EVMMethod>;

export type FetchEVMRequestResult = FetchRequestResult<EVMMethodResponse>;

export const {
  endpoints: { requestComposerFetchEVMRequest },
  useLazyRequestComposerFetchEVMRequestQuery,
  useRequestComposerFetchEVMRequestQuery,
} = web3Api.injectEndpoints({
  endpoints: build => ({
    requestComposerFetchEVMRequest: build.query<
      FetchEVMRequestResult,
      FetchEVMRequestParams
    >({
      queryFn: async ({ libraryID, params, web3URL }, { dispatch }) => {
        const { methodName, params: args } = params;

        dispatch(setEVMMethod(methodName));

        const config = getRPCCallsConfig();

        const web3Method = config[methodName] || {};
        const { exec, parseArgs } = web3Method[libraryID] || {};

        const provider = buildProvider(libraryID, web3URL);

        const start = performance.now();

        try {
          const parsedArgs = args.map((arg, i) =>
            parseArgs?.[i] ? parseArgs[i](arg) : arg,
          );

          const data: EVMMethodResponse = await exec(provider, ...parsedArgs);

          // We need to use a reference data type for response to make sure
          // that react will render the components with the same value
          // for different requests.
          const response: [EVMMethodResponse] = [data];

          return { data: { response, time: performance.now() - start } };
        } catch (error) {
          return { data: { error, time: performance.now() - start } };
        }
      },
    }),
  }),
});
