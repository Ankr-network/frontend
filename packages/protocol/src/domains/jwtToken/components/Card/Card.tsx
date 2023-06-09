import { useCallback } from 'react';
import { Button, Typography } from '@mui/material';
import { Warning } from '@ankr.com/ui';

import { useCardStyles } from './useCardStyles';
import { renderToken } from 'domains/jwtToken/utils/utils';
import { renderProjectName } from 'domains/jwtToken/utils/renderProjectName';

interface ICardProps {
  isSelected: boolean;
  userEndpointToken: string;
  tokenIndex: number;
  onProjectSelect: () => void;
  onProjectView: () => void;
}

export const Card = ({
  isSelected,
  onProjectSelect,
  userEndpointToken,
  tokenIndex,
  onProjectView,
}: ICardProps) => {
  const { classes } = useCardStyles(isSelected);

  const handleProjectView = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onProjectView();
    },
    [onProjectView],
  );

  return (
    <div
      className={classes.root}
      role="button"
      tabIndex={0}
      onClick={onProjectSelect}
    >
      <Typography className={classes.name}>
        {renderProjectName(tokenIndex)}
      </Typography>
      <div className={classes.row}>
        <Typography className={classes.token}>
          {renderToken(userEndpointToken)}
        </Typography>
        <Button
          className={classes.view}
          variant="text"
          color="secondary"
          onClick={handleProjectView}
        >
          <Warning />
        </Button>
      </div>
    </div>
  );
};
