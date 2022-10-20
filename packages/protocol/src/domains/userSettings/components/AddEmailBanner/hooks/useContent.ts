import { useDispatchRequest } from '@redux-requests/react';
import { getEmailBindings } from 'domains/userSettings/actions/email/getEmailBindings';
import { useCallback, useMemo, useState } from 'react';
import {
  AddEmailFormContentState,
  IAddEmailFormData,
} from '../../AddEmailForm/types';
import { stateToTitle } from '../const';

interface IUseContentParams {
  initialContentState: AddEmailFormContentState;
  initialSubmittedData?: IAddEmailFormData;
  resetInviteEmail?: () => void;
  onSuccess?: () => void;
}

interface IUseContentResult {
  title: string;

  contentState: AddEmailFormContentState;
  setContentState: (state: AddEmailFormContentState) => void;

  submittedData?: IAddEmailFormData;
  onFormSubmit: (formData?: IAddEmailFormData) => void;
  onAddEmailSubmitSuccess: () => void;
}

export const useContent = ({
  initialContentState,
  initialSubmittedData,
  resetInviteEmail,
}: IUseContentParams): IUseContentResult => {
  const [submittedData, setSubmittedData] = useState<
    IAddEmailFormData | undefined
  >(initialSubmittedData);

  const [contentState, setContentState] =
    useState<AddEmailFormContentState>(initialContentState);

  const title = useMemo(() => stateToTitle[contentState], [contentState]);

  const onFormSubmit = useCallback((formData?: IAddEmailFormData) => {
    setSubmittedData(formData);
  }, []);

  const dispatchRequest = useDispatchRequest();

  const onAddEmailSubmitSuccess = useCallback(() => {
    dispatchRequest(getEmailBindings());

    resetInviteEmail?.();
  }, [dispatchRequest, resetInviteEmail]);

  return {
    title,

    contentState,
    setContentState,

    submittedData,
    onFormSubmit,
    onAddEmailSubmitSuccess,
  };
};
