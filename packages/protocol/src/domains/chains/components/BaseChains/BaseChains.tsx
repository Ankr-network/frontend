import { ReactNode } from 'react';
import { Box } from '@mui/material';

import { useBaseChainsStyles } from './BaseChainsStyles';
import { ChainsSkeleton } from 'domains/chains/screens/Chains/components/ChainsSkeleton';

interface BaseChainsProps {
  top?: ReactNode;
  loading: boolean;
  children: ReactNode;
}

export const BaseChains = ({ top, loading, children }: BaseChainsProps) => {
  const { classes } = useBaseChainsStyles();

  return (
    <Box className={classes.root}>
      {top}
      {loading ? <ChainsSkeleton /> : <>{children}</>}
    </Box>
  );
};
