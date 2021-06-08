import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import moment from 'moment';
import { Row, Table } from 'antd';
import generatePath from '~settings/routing';
import formatPrice from '~helpers/currency';
import { communicationStatus } from '~client/constants';
import TransferredModal from '~pages/dashboard/billing/transfer/transferred-modal';
import { transferStatus } from '~constants/landlord';

@withTranslation()
export default class TransferTable extends React.Component {
  getColumns = () => {
    const { t } = this.props;
    const columns = [
      {
        title: t('cms.billing.tarnsfer.table.transfer_number.field'),
        dataIndex: 'id',
        key: 'id',
        render: (text, record) => (
          <span className="transfer__table-field">
            { record.node.referenceId ? record.node.referenceId : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.tarnsfer.table.transfer_type.field'),
        dataIndex: 'transferType',
        key: 'transferType',
        render: (text, record) => (
          <span className="transfer__table-field">
            { record.node.transferType ?
              t(`cms.billing.tarnsfer.table.transfer_type.${record.node.transferType.toLowerCase()}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.tarnsfer.table.landlord.field'),
        dataIndex: 'landlordName',
        key: 'landlordName',
        render: (text, record) => (
          <span className="transfer__table-field">
            { record.node.landlord ? record.node.landlord.name : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.tarnsfer.table.property.field'),
        dataIndex: 'propertyName',
        key: 'propertyName',
        render: (text, record) => (
          <span className="transfer__table-field">
            { record.node.order && record.node.order.property ?
              record.node.order.property.name : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.tarnsfer.table.booking_number.field'),
        dataIndex: 'bookingNumber',
        key: 'bookingNumber',
        render: (text, record) => (
          <div className="transfer__table-field">
            { record.node.order ? record.node.order.referenceId : '-' }
          </div>
        ),
      },
      {
        title: t('cms.billing.tarnsfer.table.planing_transfer_date.field'),
        dataIndex: 'planingTransferDate',
        key: 'planingTransferDate',
        render: (text, record) => (
          <span className="transfer__table-field">
            { record.node.planningTransferDatetime ?
              moment(record.node.planningTransferDatetime).format('DD/MM/YYYY') : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.tarnsfer.table.actual_transfer_date.field'),
        dataIndex: 'actualTransferDate',
        key: 'actualTransferDate',
        render: (text, record) => (
          <span className="transfer__table-field">
            { record.node.actualTransferDatetime ?
              moment(record.node.actualTransferDatetime).format('DD/MM/YYYY') : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.tarnsfer.table.transfer_amount.field'),
        dataIndex: 'amount',
        key: 'amount',
        render: (text, record) => (
          <span className="transfer__table-field">
            { record.node.amount && record.node.currency ?
              formatPrice(record.node.amount, record.node.currency) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.tarnsfer.table.transfer_status.field'),
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => (
          <span className="transfer__table-field">
            { record.node.status ?
              t(`cms.billing.tarnsfer.table.transfer_status.${record.node.status.toLowerCase()}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.tarnsfer.table.action.field'),
        key: 'action',
        fixed: 'right',
        className: 'transfer__action',
        render: (text, record) => (
          <Row className={ classNames('transfer__action-row', {
            'transfer__action-row--transferred': record.node.status === transferStatus.PENDING_TRANSFER,
          }) }
          >
            <button
              className="transfer__table-btn"
              onClick={ () => { this.handleViewBtn(record.node.referenceId); } }
            >
              { t('cms.billing.tarnsfer.table.action.view.btn') }
            </button>
            <If condition={ record.node.status === transferStatus.PENDING_TRANSFER }>
              <TransferredModal
                t={ t }
                onConfirm={ (transactionNo, onSuccess) =>
                  this.handleConfirm(record.node.id, transactionNo, onSuccess) }
                communication={ this.props.communication }
                type="tableBtn"
              />
            </If>
          </Row>
        ),
      },
    ];

    return columns;
  }

  handleConfirm = (id, transactionNo, onSuccess = () => {}) => {
    const { communication } = this.props;
    if (communication && communication.updateOrderTransferred &&
      communication.updateOrderTransferred.status !== communicationStatus.FETCHING) {
      this.props.updateOrderTransferStatus(id, transactionNo, onSuccess);
    }
  }

  handleViewBtn = (id) => {
    this.props.history.push(generatePath('billing.transferDetail', { id }));
  }

  render() {
    const { t, list, communication } = this.props;
    return (
      <div className="transfer__table-content">
        <h4 className="transfer__table-tltle">
          { t('cms.billing.tarnsfer.table.total_title', { totalCount: list.total || 0 }) }
        </h4>
        <Table
          className="transfer__table"
          columns={ this.getColumns() }
          dataSource={ list.payload || [] }
          loading={ communication && communication.transferList &&
            communication.transferList.status === communicationStatus.FETCHING }
          pagination={ {
            current: this.props.filters.pageNumber,
            pageSize: this.props.filters.pageSize,
            showSizeChanger: true,
            hideOnSinglePage: false,
            total: list.total,
            onChange: this.props.handlePaginationChange,
            onShowSizeChange: this.props.handlePageSizeChange,
          } }
        />
      </div>
    );
  }
}

TransferTable.propTypes = {
  t: PropTypes.func.isRequired,
  list: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  communication: PropTypes.object,
  filters: PropTypes.object,
  handlePaginationChange: PropTypes.func,
  handlePageSizeChange: PropTypes.func,
  updateOrderTransferStatus: PropTypes.func.isRequired,
};

TransferTable.defaultProps = {
  t: () => {},
  list: {},
  history: {
    push: () => {},
  },
  communication: {},
  filters: {},
  handlePaginationChange: () => {},
  handlePageSizeChange: () => {},
  updateOrderTransferStatus: () => {},
};
