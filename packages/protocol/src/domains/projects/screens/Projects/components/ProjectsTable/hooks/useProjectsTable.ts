import { useMemo } from 'react';

import {
  DEFAULT_PROJECT_STATUS,
  Project,
  ProjectTable,
} from 'domains/projects/utils/getAllProjects';
import {
  selectAllProjectsActivity,
  selectDraftUserEndpointToken,
} from 'domains/projects/store';
import { selectProjectsStatuses } from 'domains/projects/store/WhitelistsSelector';
import { useAppSelector } from 'store/useAppSelector';

import { useProjectsTableColumns } from './useProjectsTableColumns';

interface ProjectTableColumnsProps {
  projectsData: Project[];
  onProjectDialogOpen: () => void;
}

export const useProjectsTable = ({
  projectsData,
  onProjectDialogOpen,
}: ProjectTableColumnsProps) => {
  const draftUserEndpointToken = useAppSelector(selectDraftUserEndpointToken);

  const allProjectsActivity = useAppSelector(selectAllProjectsActivity);
  const statusData = useAppSelector(selectProjectsStatuses);

  const { columns } = useProjectsTableColumns({
    onProjectDialogOpen,
  });

  const tableData: ProjectTable[] = useMemo(
    () =>
      projectsData.map(data => {
        const { userEndpointToken } = data;

        const currentStatusItem = statusData?.find(
          statusDataItem =>
            statusDataItem.userEndpointToken === userEndpointToken,
        );

        const status = currentStatusItem?.status || DEFAULT_PROJECT_STATUS;

        const projectStatus = {
          ...status,
          draft: draftUserEndpointToken === userEndpointToken,
        };

        const projectActivity = allProjectsActivity[userEndpointToken];

        return { ...data, projectActivity, projectStatus };
      }),

    [allProjectsActivity, draftUserEndpointToken, projectsData, statusData],
  );

  return { columns, tableData };
};
