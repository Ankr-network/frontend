import { ChainProtocolSwitch } from 'domains/chains/screens/ChainItem/components/ChainItemHeader/components/ChainProtocolSwitch';
import { useChainSelectorContentStyles } from 'modules/common/components/ChainSelectorContent/useChainSelectorContentStyles';
import { ChainType } from 'domains/chains/types';
import { useChainSelectVisibility } from 'domains/projects/screens/NewProject/components/TypeSelector/hooks/useChainSelectVisibility';
import { SelectMenuProps } from 'modules/common/components/ProjectSelect/ProjectSelect';
import { ChainGroupID, EndpointGroup } from 'modules/endpoints/types';

import { GroupSelector } from '../GroupSelector';
import { TypeSelector } from '../TypeSelector';

export interface IPrivateChainSelectedContentProps extends SelectMenuProps {
  chainType: ChainType;
  chainTypes: { value: ChainType; label: string }[];
  selectType: (id: ChainType) => void;
  groups: EndpointGroup[];
  groupID: ChainGroupID;
  selectGroup: (id: ChainGroupID) => void;
  isTestnetOnlyChain?: boolean;
  ignoreProtocol?: boolean;
}

export const PrivateChainSelectedContent = ({
  chainType,
  chainTypes,
  selectType,
  groups,
  groupID,
  selectGroup,
  isTestnetOnlyChain,
  menuProps,
  classNameMenuItem,
  ignoreProtocol,
}: IPrivateChainSelectedContentProps) => {
  const { classes } = useChainSelectorContentStyles();

  const isVisible = useChainSelectVisibility({
    chainTypes,
    chainType,
    groups,
    isTestnetOnlyChain,
    selectType,
  });

  if (!isVisible) return null;

  return (
    <div className={classes.selectors}>
      {!isTestnetOnlyChain && (
        <TypeSelector
          chainType={chainType}
          chainTypes={chainTypes}
          onTypeSelect={selectType}
          menuProps={menuProps}
          classNameMenuItem={classNameMenuItem}
        />
      )}
      <GroupSelector
        groupID={groupID}
        groups={groups}
        onGroupSelect={selectGroup}
        menuProps={menuProps}
        classNameMenuItem={classNameMenuItem}
      />
      {!ignoreProtocol && <ChainProtocolSwitch />}
    </div>
  );
};
