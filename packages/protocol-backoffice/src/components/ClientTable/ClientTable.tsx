import { Table } from 'antd';
import { observer } from 'mobx-react';
import { LocalGridStore } from 'stores/LocalGridStore';

import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ClientEntity } from 'stores/useClients/types';
import { tableColumns } from './tableUtils';

export type TClientTableHistoryPushState = Partial<{
  clientTtl: ClientEntity['ttl'];
  clientType: ClientEntity['type'];
}>;

export interface IClientTableProps {
  store: LocalGridStore<ClientEntity>;
}

const ClientTable = observer(({ store }: IClientTableProps) => {
  const { pathname } = useLocation();
  const history = useHistory();
  const grid = store;

  const onRow = useCallback(
    ({ address, ttl, type }: ClientEntity) => {
      const onClick = () =>
        history.push({
          pathname: `${pathname}/${address}`,
          state: {
            clientTtl: ttl,
            clientType: type,
          } as TClientTableHistoryPushState,
        });

      const style = { cursor: 'pointer' };

      return { onClick, style };
    },
    [history, pathname],
  );

  return (
    <Table
      loading={grid.isLoading}
      pagination={grid.paginationConfig}
      expandable={{
        expandRowByClick: true,
      }}
      onRow={onRow}
      dataSource={grid.items}
      rowKey={client => client.address}
      columns={tableColumns}
    />
  );
});

export default ClientTable;
