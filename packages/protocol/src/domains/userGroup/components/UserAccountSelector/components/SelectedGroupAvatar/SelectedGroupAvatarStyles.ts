import { makeStyles } from 'tss-react/mui';

export const useSelectedGroupAvatarStyles = makeStyles()(() => ({
  avatar: {
    flexShrink: 0,
    width: 32,
    height: 32,
  },
  personalIcon: {
    fontSize: 28,
  },
}));
