import { Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Plus, LoadingButton } from '@ankr.com/ui';

import { Dialog } from 'uiKit/Dialog';
import { Chain } from 'modules/chains/types';
import { ChainDescription } from 'modules/chains/components/ChainDescription';
import { ProjectsRoutesConfig } from 'domains/projects/routes/routesConfig';
import { GuardUserGroup } from 'domains/userGroup/components/GuardUserGroup';
import { BlockWithPermission } from 'domains/userGroup/constants/groups';
import { Checkbox } from 'modules/common/components/Checkbox';
import { useTranslation } from 'modules/i18n/hooks/useTranslation';

import { useChainProjectsDialogStyles } from './useChainProjectsDialogStyles';
import { useChainProjectsDialog } from './useChainProjectsDialog';
import { chainProjectItemTranslation } from './translation';

interface IChainProjectsDialogProps {
  chain: Chain;
  onCloseAddToProjectsDialog: () => void;
  isOpenedAddToProjectsDialog: boolean;
}

export const ChainProjectsDialog = ({
  chain,
  isOpenedAddToProjectsDialog,
  onCloseAddToProjectsDialog,
}: IChainProjectsDialogProps) => {
  const {
    allProjects,
    handleAllChange,
    handleProjectChange,
    hasProjectButton,
    isAllSelected,
    isLoadingAddChainsToProject,
    onConfirm,
    selectedProjects,
  } = useChainProjectsDialog(chain, onCloseAddToProjectsDialog);

  const { classes } = useChainProjectsDialogStyles();

  const { keys, t } = useTranslation(chainProjectItemTranslation);

  return (
    <GuardUserGroup blockName={BlockWithPermission.JwtManagerRead}>
      <Dialog
        maxPxWidth={600}
        onClose={onCloseAddToProjectsDialog}
        open={isOpenedAddToProjectsDialog}
        paperClassName={classes.addToProjectsDialogPaper}
        title={t(keys.dialogTitle)}
        dialogContentClassName={classes.addToProjectsDialogContent}
      >
        <Typography variant="body2" color="textSecondary">
          {t(keys.selectProjects)}
        </Typography>
        <ChainDescription
          chain={chain}
          logoSize={40}
          className={classes.chainProjectsDialogDescription}
          isCompactView
        />
        <Typography
          variant="subtitle2"
          className={classes.chainProjectsTitle}
          component="p"
        >
          {t(keys.projects)}
        </Typography>
        {allProjects.length > 1 && (
          <Checkbox
            isDisabled={isLoadingAddChainsToProject}
            hasBorderBottom
            hasPadding
            isChecked={isAllSelected}
            label={t(keys.selectAll)}
            onChange={handleAllChange}
          />
        )}
        {allProjects.map(project => {
          const isSelected = selectedProjects.includes(
            project.userEndpointToken,
          );

          return (
            <div key={project.userEndpointToken}>
              <Checkbox
                isDisabled={isLoadingAddChainsToProject}
                hasPadding
                isChecked={isSelected}
                label={project.name || t(keys.defaultName)}
                onChange={() => handleProjectChange(project.userEndpointToken)}
              />
            </div>
          );
        })}
        {hasProjectButton && (
          <GuardUserGroup blockName={BlockWithPermission.JwtManagerWrite}>
            <Button
              className={classes.addToProjectsDialogButton}
              component={Link}
              to={ProjectsRoutesConfig.newProject.generatePath()}
              variant="text"
              color="secondary"
              startIcon={<Plus />}
            >
              {t(keys.createNewProject)}
            </Button>
          </GuardUserGroup>
        )}
        <div className={classes.chainProjectsActions}>
          <LoadingButton
            size="large"
            fullWidth
            onClick={onConfirm}
            loading={isLoadingAddChainsToProject}
            disabled={isLoadingAddChainsToProject}
          >
            {t(keys.confirm)}
          </LoadingButton>
          <Button
            size="large"
            fullWidth
            variant="outlined"
            onClick={onCloseAddToProjectsDialog}
          >
            {t(keys.cancel)}
          </Button>
        </div>
      </Dialog>
    </GuardUserGroup>
  );
};
