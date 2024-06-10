import { t } from '@ankr.com/common';
import { BasePieChart, PieChartData } from '@ankr.com/telemetry';

import { text } from './utils/text';

export interface ProjectsWidgetProps {
  className: string;
  amount: number;
  data: PieChartData[];
  isLoading: boolean;
}

export const ProjectsWidget = ({
  className,
  amount,
  data,
  isLoading,
}: ProjectsWidgetProps) => {
  return (
    <BasePieChart
      amount={t('dashboard.pie-chart.amount', { amount: amount.toString() })}
      className={className}
      data={data}
      isLoading={isLoading}
      title={text('title')}
    />
  );
};
