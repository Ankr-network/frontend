import { Box, Grid, Typography } from '@material-ui/core';
import { useMutation, useQuery } from '@redux-requests/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { configFromEnv } from 'modules/api/config';
import { useProviderEffect } from 'modules/auth/common/hooks/useProviderEffect';
import { getAnkrBalance as getTestAnkrBalance } from 'modules/stake-ankr/actions/getAnkrBalance';
import { getAnkrBalance } from 'modules/stake-polygon/actions/getAnkrBalance';
import { getTestAnkrTokens } from 'modules/testing-ui/actions/getTestAnkrTokens';
import { TestBox } from 'modules/testing-ui/components/TestBox';
import { Button } from 'uiKit/Button';
import { Tooltip } from 'uiKit/Tooltip';

const { contractConfig } = configFromEnv();

export const AnkrFaucet = (): JSX.Element => {
  const dispatch = useDispatch();

  const { loading: isTestTokensLoading } = useMutation({
    type: getTestAnkrTokens,
  });

  const { data: testAnkrBalanceData, loading: isTestAnkrBalanceLoading } =
    useQuery({ type: getTestAnkrBalance });

  const { data: ankrBalanceData, loading: isAnkrBalanceLoading } = useQuery({
    type: getAnkrBalance,
  });

  const onClick = useCallback(() => {
    dispatch(getTestAnkrTokens());
  }, [dispatch]);

  useProviderEffect(() => {
    dispatch(getTestAnkrBalance());
    dispatch(getAnkrBalance());
  }, []);

  const testAnkrBalance =
    testAnkrBalanceData && !isTestAnkrBalanceLoading
      ? testAnkrBalanceData.toFormat()
      : '...';

  const ankrBalance =
    ankrBalanceData && !isAnkrBalanceLoading
      ? ankrBalanceData.toFormat()
      : '...';

  return (
    <TestBox>
      <Box mb={4}>
        <Typography variant="h3">Ankr Faucet</Typography>
      </Box>

      <Box mb={3}>
        <Box mb={2}>
          <Typography variant="h4">Ankr test tokens (Ankr staking)</Typography>
        </Box>

        <Box mb={2}>
          <Typography color="textSecondary" variant="body2">
            {'address: '}

            <Typography color="textPrimary" component="code" variant="caption">
              {contractConfig.testAnkrToken}
            </Typography>
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item>
            <Button
              disabled={isTestTokensLoading}
              isLoading={isTestTokensLoading}
              onClick={onClick}
            >
              Get test Ankr tokens
            </Button>
          </Grid>

          <Grid item>
            <Typography color="textSecondary" variant="body2">
              Your balance:
            </Typography>

            <Typography variant="body2">{testAnkrBalance}</Typography>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Box mb={2}>
          <Typography variant="h4">Ankr tokens (Matic unstaking)</Typography>
        </Box>

        <Box mb={2}>
          <Typography color="textSecondary" variant="body2">
            {'address: '}

            <Typography color="textPrimary" component="code" variant="caption">
              {contractConfig.ankrToken}
            </Typography>
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item>
            <Tooltip
              arrow
              title="TODO: add faucet for old ankr tokens on testnet"
            >
              <Box component="span" display="block">
                <Button disabled>Get Ankr tokens</Button>
              </Box>
            </Tooltip>
          </Grid>

          <Grid item>
            <Typography color="textSecondary" variant="body2">
              Your balance:
            </Typography>

            <Typography variant="body2">{ankrBalance}</Typography>
          </Grid>
        </Grid>
      </Box>
    </TestBox>
  );
};
