import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import classNames from 'classnames';
import { Row, Table } from 'antd';
import generatePath from '~settings/routing';
import formatPrice from '~helpers/currency';
import { communicationStatus } from '~client/constants';
import RefundModal from '~pages/dashboard/billing/refund/modal';
import { refundStatus, refundFromTypes } from '~constants/landlord';

@withTranslation()
export default class RefundTable extends React.Component {
  getColumns = () => {
    const { t } = this.props;
    const columns = [
      {
        title: t('cms.billing.refund.table.refund_number.field'),
        dataIndex: 'id',
        key: 'id',
        render: (text, record) => (
          <span className="refund__table-field">
            { record.node.referenceId ? record.node.referenceId : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.refund.table.refund_type.field'),
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => (
          <span className="refund__table-field">
            { record.node.refundType ?
              t(`cms.billing.refund.table.refund_type.${record.node.refundType.toLowerCase()}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.refund.table.refund_method.field'),
        dataIndex: 'method',
        key: 'method',
        render: (text, record) => (
          <span className="refund__table-field">
            { record.node.refundMethod ? t(`cms.billing.refund.table.refund_method.${record.node.refundMethod.toLowerCase()}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.refund.table.refund_status.field'),
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => (
          <span className="refund__table-field">
            { record.node.status ? t(`cms.billing.refund.table.refund_status.${record.node.status.toLowerCase()}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.receive.table.landlord.field'),
        dataIndex: 'landlord',
        key: 'landlord',
        render: (text, record) => (
          <div className="receive__table-field">
            { record.node.landlord ? record.node.landlord.name : '-' }
          </div>
        ),
      },
      {
        title: t('cms.billing.receive.table.property.field'),
        dataIndex: 'property',
        key: 'property',
        render: (text, record) => (
          <span className="receive__table-field">
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
        title: t('cms.billing.refund.table.refund_amount.field'),
        dataIndex: 'amount',
        key: 'amount',
        render: (text, record) => (
          <span className="refund__table-field">
            { record.node.amount ? formatPrice(record.node.amount, record.node.currency) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.refund.table.refund_from.field'),
        dataIndex: 'refundFrom',
        key: 'refundFrom',
        render: (text, record) => (
          <span className="refund__table-field">
            { record.node.refundFrom ? t(`cms.billing.refund.table.refund_from.${record.node.refundFrom.toLowerCase()}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.refund.table.refund_to.field'),
        dataIndex: 'refundTo',
        key: 'refundTo',
        render: (text, record) => (
          <span className="refund__table-field">
            { record.node.refundTo ? t(`cms.billing.refund.table.refund_to.${record.node.refundTo.toLowerCase()}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.refund.table.refund_at.field'),
        dataIndex: 'refundedAt',
        key: 'refundedAt',
        render: (text, record) => (
          <span className="refund__table-field">
            { record.node.refundedAt ? moment(record.node.refundedAt).format('DD/MM/YYYY') : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.refund.table.action.field'),
        key: 'action',
        fixed: 'right',
        className: 'refund__action',
        render: (text, record) => (
          <Row className={ classNames('refund__action-row', {
            'refund__action-row--btns':
              (record.node.status === refundStatus.PENDING_REFUND
              && record.node.refundFrom === refundFromTypes.STCOM)
              || (record.node.status === refundStatus.REFUND_CONFIRMATION
              && record.node.refundFrom === refundFromTypes.ACCOMMODATION_PARTNER),
          }) }
          >
            <button
              className="refund__table-btn"
              onClick={ () => { this.handleViewBtn(record.node.referenceId); } }
            >
              { t('cms.billing.tarnsfer.table.action.view.btn') }
            </button>
            <If condition={
              (record.node.status === refundStatus.PENDING_REFUND
              && record.node.refundFrom === refundFromTypes.STCOM)
              || (record.node.status === refundStatus.REFUND_CONFIRMATION
              && record.node.refundFrom === refundFromTypes.ACCOMMODATION_PARTNER)
            }
            >
              <RefundModal
                t={ t }
                modalType={ record.node.status === refundStatus.PENDING_REFUND ? 'refunded' : 'confirm' }
                onConfirm={ () => {
                  this.props.updateRefundStatus(
                    record.node.status === refundStatus.PENDING_REFUND ? 'refunded' : 'confirm',
                    record.node.id);
                } }
                communication={ this.props.communication }
                type="tableBtn"
                refundDetails={ record.node }
              />
            </If>
          </Row>
        ),
      },
    ];

    return columns;
  }

  handleViewBtn = (id) => {
    this.props.history.push(generatePath('billing.refundDetail', { id }));
  }

  render() {
    const { t, list, communication } = this.props;
    return (
      <div className="refund__table-content">
        <h4 className="refund__table-tltle">
          { t('cms.billing.tarnsfer.table.total_title', { totalCount: list.total || 0 }) }
        </h4>
        <Table
          className="refund__table"
          columns={ this.getColumns() }
          dataSource={ list.payload || [] }
          loading={ communication && communication.refundList &&
            communication.refundList.status === communicationStatus.FETCHING }
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

RefundTable.propTypes = {
  t: PropTypes.func.isRequired,
  list: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  communication: PropTypes.object,
  filters: PropTypes.object,
  handlePaginationChange: PropTypes.func,
  handlePageSizeChange: PropTypes.func,
  updateRefundStatus: PropTypes.func,
};

RefundTable.defaultProps = {
  t: () => {},
  list: {},
  history: {
    push: () => {},
  },
  communication: {},
  filters: {},
  handlePaginationChange: () => {},
  handlePageSizeChange: () => {},
  updateRefundStatus: () => {},
};
