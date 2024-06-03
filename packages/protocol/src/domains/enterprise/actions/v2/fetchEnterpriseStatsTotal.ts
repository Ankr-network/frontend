import { IUsageStats, IUsageStatsParams } from 'multirpc-sdk';

import { MultiService } from 'modules/api/MultiService';
import { createNotifyingQueryFn } from 'store/utils/createNotifyingQueryFn';
import { web3Api } from 'store/queries';

export const {
  useChainsFetchEnterpriseV2StatsTotalQuery,
  useLazyChainsFetchEnterpriseV2StatsTotalQuery,
  endpoints: { chainsFetchEnterpriseV2StatsTotal },
} = web3Api.injectEndpoints({
  endpoints: build => ({
    chainsFetchEnterpriseV2StatsTotal: build.query<
      IUsageStats,
      IUsageStatsParams
    >({
      queryFn: createNotifyingQueryFn(async params => {
        const service = MultiService.getService();
        const enterpriseGateway = service.getEnterpriseGateway();

        const data = await enterpriseGateway.getEnterpriseUsage(params);

        return { data };
      }),
    }),
  }),
  overrideExisting: true,
});
