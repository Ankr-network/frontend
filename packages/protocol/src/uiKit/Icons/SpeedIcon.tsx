import { SvgIcon, SvgIconProps } from '@material-ui/core';

export const SpeedIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props} viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 13C2 8.58172 5.58172 5 10 5C14.4183 5 18 8.58172 18 13C18 13.5523 18.4477 14 19 14C19.5523 14 20 13.5523 20 13C20 7.47715 15.5228 3 10 3C4.47715 3 0 7.47715 0 13C0 13.5523 0.447715 14 1 14C1.55228 14 2 13.5523 2 13ZM7.88641 14.125C8.57676 15.3207 10.1057 15.7304 11.3015 15.0401C12.4972 14.3497 16.3873 9.84904 16.1136 9.37499C15.84 8.90095 9.9972 10.0196 8.80147 10.7099C7.60574 11.4003 7.19605 12.9293 7.88641 14.125Z"
        fill="white"
      />
    </SvgIcon>
  );
};
