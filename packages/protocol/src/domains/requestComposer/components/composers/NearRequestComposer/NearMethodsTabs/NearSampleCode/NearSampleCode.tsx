import { useMemo } from 'react';

import {
  NearLibraryID,
  NearMethod,
} from 'domains/requestComposer/constants/near';
import { getRPCCallsConfig } from 'domains/requestComposer/utils/near/RPCCallsConfig';
import { EndpointGroup } from 'modules/endpoints/types';

import { SampleCode } from '../../../../SampleCodeComponent/SampleCodeDialog/SampleCode';

interface ISampleCodeProps {
  group: EndpointGroup;
  title: NearMethod;
  args: string[];
  libraryID: NearLibraryID;
}

export const NearSampleCode = ({
  args,
  group,
  libraryID,
  title,
}: ISampleCodeProps) => {
  const httpUrl = useMemo(() => group.urls[0].rpc, [group]);
  const wssUrl = useMemo(() => group.urls[0]?.ws || '', [group]);

  const code = useMemo(
    () =>
      getRPCCallsConfig()[title]?.[libraryID]?.codeSample(
        httpUrl,
        wssUrl,
        ...args,
      ),
    [httpUrl, wssUrl, title, args, libraryID],
  );

  return <SampleCode code={code} />;
};
