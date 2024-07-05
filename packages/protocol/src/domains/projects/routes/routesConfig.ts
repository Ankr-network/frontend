import { REFERRAL_CODE_QUERY_PARAM_NAME } from 'routes/constants';
import { generatePath, useHistory } from 'react-router-dom';
import { useCallback } from 'react';

import { ChainID } from 'modules/chains/types';
import { createRouteConfig } from 'modules/router/utils/createRouteConfig';
import { useQueryParams } from 'modules/common/hooks/useQueryParams';

const PROJECT_ID_QUERY = 'projectId';
const CHAIN_ID_QUERY = 'chainId';

export const PROJECTS_PATH = '/projects/';
export const NEW_PROJECT_PATH = `${PROJECTS_PATH}new/`;
export const PROJECT_PATH = `${PROJECTS_PATH}?${PROJECT_ID_QUERY}=:projectId`;

export const ProjectsRoutesConfig = createRouteConfig(
  {
    projects: {
      path: PROJECTS_PATH,
      generatePath: () => {
        const { search } = window.location;
        const queryParams = new URLSearchParams(search);
        const referralCode = queryParams.get(REFERRAL_CODE_QUERY_PARAM_NAME);

        if (referralCode) {
          const utmSearch = new URLSearchParams({
            [REFERRAL_CODE_QUERY_PARAM_NAME]: referralCode,
          }).toString();

          return `${PROJECTS_PATH}?${utmSearch}`;
        }

        return PROJECTS_PATH;
      },
      breadcrumbs: 'projects.breadcrumbs',
    },
    project: {
      path: PROJECT_PATH,
      generatePath: (userEndpointToken: string) =>
        generatePath(PROJECT_PATH, { projectId: userEndpointToken }),
      useParams: () => {
        const history = useHistory();
        const query = useQueryParams();

        const projectId = query.get(PROJECT_ID_QUERY) ?? undefined;
        const chainId =
          (query.get(CHAIN_ID_QUERY) as ChainID | undefined) ?? undefined;

        const setChainId = useCallback(
          (id: ChainID) => {
            query.set(CHAIN_ID_QUERY, id);

            history.replace({ search: query.toString() });
          },
          [history, query],
        );

        return { chainId, projectId, setChainId };
      },
    },
    newProject: {
      path: NEW_PROJECT_PATH,
      generatePath: () => NEW_PROJECT_PATH,
      breadcrumbs: 'projects.new-project.breadcrumbs',
    },
  },
  PROJECTS_PATH,
);
