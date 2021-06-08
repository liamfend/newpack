import React from 'react';
import { connect } from 'react-redux';
import { Modal, Table } from 'antd';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import { getReconciliationBulkUpdateRecords } from '~actions/reconciliation';
import { communicationStatus } from '~constants';
import useBulkHistory from './useBulkHistory';

const History = ({ getHistory, cancel, isFetching, bulkHistory }) => {
  const { pageNumber, historyColumns, handleChangeTable } = useBulkHistory({ getHistory });

  return (
    <Modal
      width={ 960 }
      maskClosable={ false }
      centered
      zIndex={ 99 }
      visible
      onCancel={ cancel }
      className="bulk-history-modal"
      footer={ null }
    >
      <div className="bulk-history-modal__title">
        { i18next.t('cms.reconciliation.title.bulk_update_history') }
      </div>
      <div className="bulk-history-modal__total">
        { i18next.t('cms.reconciliation.description.total', {
          count: bulkHistory.total,
        }) }
      </div>

      <Table
        columns={ historyColumns }
        dataSource={ bulkHistory.payload }
        loading={ isFetching }
        onChange={ handleChangeTable }
        pagination={ {
          current: pageNumber,
          showSizeChanger: true,
          total: bulkHistory.total,
        } }
        rowKey="id"
        scroll={ { x: 1200, y: 500 } }
      />
    </Modal>
  );
};

History.propTypes = {
  cancel: PropTypes.func,
  getHistory: PropTypes.func,
  isFetching: PropTypes.bool,
  bulkHistory: PropTypes.shape({
    payload: PropTypes.array,
    totalCount: PropTypes.number,
  }),
};

History.defaultProps = {
  cancel: () => {},
  getHistory: () => {},
  isFetching: false,
  bulkHistory: {
    payload: [],
    totalCount: 0,
  },
};

export default connect(
  state => ({
    isFetching: state.dashboard.reconciliation.get('communication').toJS().bulkHistory.status === communicationStatus.FETCHING,
    bulkHistory: state.dashboard.reconciliation.get('bulkHistory').toJS(),
  }),
  {
    getHistory: getReconciliationBulkUpdateRecords,
  },
)(React.memo(History, (prevProps, nextProps) => prevProps.bulkHistory === nextProps.bulkHistory &&
    prevProps.isFetching === nextProps.isFetching));
