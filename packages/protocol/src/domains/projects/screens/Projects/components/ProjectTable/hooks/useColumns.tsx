import { Info } from '@ankr.com/ui';
import { Skeleton, Tooltip } from '@mui/material';
import { t } from '@ankr.com/common';

import { PRIMARY_TOKEN_INDEX } from 'domains/jwtToken/utils/utils';
import { Project } from 'domains/projects/utils/getAllProjects';
import { SoonLabel } from 'modules/common/components/SoonLabel';
import { VirtualTableColumn } from 'uiKit/VirtualTable';
import { useLocaleMemo } from 'modules/i18n/utils/useLocaleMemo';

import { ActionsMenu } from '../../ActionsMenu';
import { ActiveLabel } from '../../ActiveLabel';
import { BlockchainIcon } from '../../BlockchainIcon';
import { ProjectName } from '../../ProjectName';
import { ProjectRequestsActivity } from '../../ProjectRequestsActivity';
import { formatBlockchainToString, getRequests } from '../ProjectTableUtils';
import { useColumnsStyles } from './useColumnsStyles';

export const useColumns = (isProjectsActivityLoading: boolean) => {
  const { classes } = useColumnsStyles();

  const columns = useLocaleMemo((): VirtualTableColumn<Project>[] => [
    {
      align: 'left',
      field: 'name',
      headerName: (
        <span className={classes.header}>
          {t('projects.list-project.table.column-1')}
        </span>
      ),
      render: ({ name, userEndpointToken, tokenIndex }) => (
        <ProjectName
          projectName={name}
          userEndpointToken={userEndpointToken}
          tokenIndex={tokenIndex}
        />
      ),
      sortable: false,
    },
    {
      align: 'left',
      field: 'status',
      headerName: (
        <span className={classes.header}>
          {t('projects.list-project.table.column-2')}
        </span>
      ),
      render: () => <ActiveLabel />,
      sortable: false,
    },
    {
      align: 'left',
      field: 'list',
      headerName: (
        <span className={classes.header}>
          {t('projects.list-project.table.column-3')}
        </span>
      ),
      render: ({ whitelist }) => {
        const label = whitelist?.length ? 'installed' : 'not-installed';

        return (
          <SoonLabel
            label={t(`projects.list-project.${label}`)}
            component="span"
          />
        );
      },
      sortable: false,
    },
    {
      align: 'left',
      field: 'chains',
      headerName: (
        <span className={classes.header}>
          {t('projects.list-project.table.column-4')}
        </span>
      ),
      render: ({ whitelist }) => {
        const blockchains = formatBlockchainToString(whitelist);

        return blockchains && <BlockchainIcon blockchains={blockchains} />;
      },
      sortable: false,
    },
    {
      align: 'left',
      field: 'statsData',
      headerName: (
        <span className={classes.header}>
          {t('projects.list-project.table.column-5')}
          <Tooltip
            title={t('projects.list-project.table.column-5-tooltip')}
            placement="top"
            className={classes.tooltip}
          >
            <Info className={classes.infoIcon} />
          </Tooltip>
        </span>
      ),
      render: ({ statsData = {} }) => {
        if (isProjectsActivityLoading) {
          return <Skeleton variant="rectangular" style={{ borderRadius: 8 }} />;
        }

        const { data = {}, error } = statsData;

        if (error) {
          return t('common.no-data');
        }

        const requests = getRequests(data);

        const [todayRequests, yesterdayRequests] = requests;

        const isEmpty = requests.length === 0 || todayRequests === 0;

        if (isEmpty) {
          return t('projects.list-project.no-requests-yet');
        }

        return (
          <ProjectRequestsActivity
            todayRequests={todayRequests}
            yesterdayRequests={yesterdayRequests}
          />
        );
      },
      sortable: false,
    },
    {
      field: 'menu',
      headerName: '',
      render: ({ tokenIndex }) => (
        <ActionsMenu
          isPrimary={tokenIndex === PRIMARY_TOKEN_INDEX}
          tokenIndex={tokenIndex}
        />
      ),
      align: 'right',
      width: '60px',
    },
  ]);

  return { columns };
};
