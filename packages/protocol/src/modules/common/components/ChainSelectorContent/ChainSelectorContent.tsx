import { ChainSubType, ChainType } from 'domains/chains/types';
import { GroupSelector } from 'domains/chains/screens/ChainItem/components/ChainItemHeader/components/GroupSelector';
import { Tab } from 'modules/common/hooks/useTabs';
import { ChainGroupID, EndpointGroup } from 'modules/endpoints/types';
import { SecondaryTabs } from 'modules/common/components/SecondaryTabs';
import { ChainProtocolSwitch } from 'domains/chains/screens/ChainItem/components/ChainItemHeader/components/ChainProtocolSwitch';
import { useChainSelectorContentStyles } from 'modules/common/components/ChainSelectorContent/useChainSelectorContentStyles';
import { useIsSMDown } from 'uiKit/Theme/useTheme';

interface IChainSelectorContentProps {
  chainTypeTab?: Tab<ChainType>;
  chainTypeTabs: Tab<ChainType>[];
  chainSubTypeTab?: Tab<ChainSubType>;
  chainSubTypeTabs: Tab<ChainSubType>[];
  groups: EndpointGroup[];
  groupID: ChainGroupID;
  groupTab?: Tab<ChainGroupID>;
  groupTabs: Tab<ChainGroupID>[];
  selectGroup: (id: ChainGroupID) => void;
  hasGroupSelector?: boolean;
  isProtocolSwitcherHidden?: boolean;
}

const MIN_GROUP_ITEMS = 2;
const MIN_SUBTYPE_ITEMS = 2;

export const ChainSelectorContent = ({
  chainTypeTab,
  chainTypeTabs,
  chainSubTypeTabs,
  chainSubTypeTab,
  groups,
  groupID,
  groupTab,
  groupTabs,
  selectGroup,
  hasGroupSelector,
  isProtocolSwitcherHidden,
}: IChainSelectorContentProps) => {
  const isMobile = useIsSMDown();

  const { classes } = useChainSelectorContentStyles();

  const hasEnoughGroups = groupTabs.length >= MIN_GROUP_ITEMS;
  const hasEnoughSubTypes = chainSubTypeTabs.length >= MIN_SUBTYPE_ITEMS;

  const withGroupSelector = hasEnoughSubTypes;
  const withMobileGroupSelector = isMobile && hasEnoughGroups;
  const withGroupTabs =
    (!withGroupSelector && hasEnoughGroups) || hasGroupSelector;

  return (
    <div className={classes.controls}>
      <SecondaryTabs
        className={classes.chainTypeTabs}
        selectedTab={chainTypeTab}
        tabs={chainTypeTabs}
        visible
      />
      <SecondaryTabs
        className={classes.chainTypeTabs}
        selectedTab={chainSubTypeTab}
        tabs={chainSubTypeTabs}
        visible={hasEnoughSubTypes}
      />
      <SecondaryTabs
        className={classes.groupTabs}
        selectedTab={groupTab}
        tabs={groupTabs}
        visible={withGroupTabs}
      />
      <GroupSelector
        fullWidth
        groupID={groupID}
        groups={groups}
        onGroupSelect={selectGroup}
        rootClassName={classes.groupSelector}
        visible={withGroupSelector || withMobileGroupSelector}
      />
      {!isProtocolSwitcherHidden && <ChainProtocolSwitch />}
    </div>
  );
};
