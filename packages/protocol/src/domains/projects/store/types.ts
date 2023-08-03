import { Address } from '@ankr.com/provider';

import { ChainID } from 'domains/chains/types';

import { NewProjectStep, WhiteListItem } from '../types';

export enum ChainStepFields {
  projectName = 'projectName',
  tokenIndex = 'tokenIndex',
  selectedMainnetIds = 'selectedMainnetIds',
  selectedTestnetIds = 'selectedTestnetIds',
  selectedDevnetIds = 'selectedDevnetIds',
}

export enum WhitelistStepFields {
  userEndpointToken = 'userEndpointToken',
  whitelistItems = 'whitelistItems',
  whitelistDialog = 'whitelistDialog',
}

export enum PlanStepFields {
  planName = 'planName',
  planPrice = 'planPrice',
}

export enum CheckoutStepFields {
  isCheckedOut = 'isCheckedOut',
}

export interface AddToWhitelistFormData {
  type?: WhiteListItem;
  value: string;
  chains: ChainID[];
}

export interface NewProjectType {
  [NewProjectStep.Chain]?: {
    [ChainStepFields.projectName]?: string;
    [ChainStepFields.tokenIndex]?: number | null;
    [ChainStepFields.selectedMainnetIds]?: string[];
    [ChainStepFields.selectedTestnetIds]?: string[];
    [ChainStepFields.selectedDevnetIds]?: string[];
  };
  [NewProjectStep.Whitelist]?: {
    [WhitelistStepFields.userEndpointToken]?: string;
    [WhitelistStepFields.whitelistItems]?: AddToWhitelistFormData[];
    [WhitelistStepFields.whitelistDialog]?: AddToWhitelistFormData;
  };
  [NewProjectStep.Plan]?: {
    [PlanStepFields.planName]?: string;
    [PlanStepFields.planPrice]?: string;
  };
  [NewProjectStep.Checkout]?: {
    [CheckoutStepFields.isCheckedOut]?: boolean;
  };
}

export interface BaseNewProject {
  step: NewProjectStep;
}

export interface NewProjectConfig extends BaseNewProject {
  project: NewProjectType;
}

export interface NewProjectConfigPayload extends BaseNewProject {
  address: string;
  projectStepConfig: NewProjectType[NewProjectStep];
  nextStep: NewProjectStep;
}

export type NewProjectSlice = Record<Address, NewProjectConfig>;
