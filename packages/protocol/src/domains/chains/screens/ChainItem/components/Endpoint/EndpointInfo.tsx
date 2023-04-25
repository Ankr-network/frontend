import { IProvider } from 'multirpc-sdk';
import { useMemo } from 'react';

import { Endpoints } from 'domains/infrastructure/actions/fetchEndpoints';
import { Chain, ChainURL } from 'domains/chains/types';
import { UserEndpoints } from './components/UserEndpoints';
import { canAddEndpoint, getLimit, hasLimit } from './EndpointUtils';
import { getChainName } from './utils/getChainName';
import { useStyles } from './EndpointStyles';

export interface EndpointInfoProps {
  chainId: string;
  endpoints: Endpoints;
  privateChain: Chain;
  providerData: IProvider | null;
  publicChain?: Chain;
}

export const EndpointInfo = ({
  chainId,
  endpoints,
  privateChain,
  providerData,
  publicChain,
}: EndpointInfoProps) => {
  const { classes } = useStyles();

  const isMoreThanLimit = hasLimit(providerData, endpoints);
  const limit = getLimit(providerData);

  const hasChain = canAddEndpoint(providerData, chainId);
  const userEndpoints = endpoints?.[chainId];
  const chainName = getChainName({ chainId, privateChain, publicChain });

  const privateUrls = useMemo(
    () =>
      [
        ...(privateChain?.urls || []),
        ...(privateChain?.extensions || []).flatMap<ChainURL>(
          ({ urls }) => urls,
        ),
        ...(privateChain?.extenders || []).flatMap<ChainURL>(
          ({ urls }) => urls,
        ),
      ].flatMap<string>(({ rpc, ws }) => (ws ? [rpc, ws] : [rpc])),
    [privateChain],
  );

  const publicUrls = useMemo(
    () =>
      [
        ...(publicChain?.urls || []),
        ...(publicChain?.extensions || []).flatMap<ChainURL>(
          ({ urls }) => urls,
        ),
        ...(publicChain?.extenders || []).flatMap<ChainURL>(({ urls }) => urls),
      ].flatMap<string>(({ rpc, ws }) => (ws ? [rpc, ws] : [rpc])),
    [publicChain],
  );

  return (
    <div className={classes.root}>
      <div className={classes.section}>
        <UserEndpoints
          chainName={chainName}
          data={userEndpoints}
          hasChain={hasChain}
          isMoreThanLimit={isMoreThanLimit}
          limit={limit}
          privateUrls={privateUrls}
          publicUrls={publicUrls}
        />
      </div>
    </div>
  );
};
