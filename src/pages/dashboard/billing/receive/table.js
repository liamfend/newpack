import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import moment from 'moment';
import { Row, Table, Popconfirm } from 'antd';
import generatePath from '~settings/routing';
import formatPrice from '~helpers/currency';
import { communicationStatus } from '~client/constants';
import InvoicedModal from '~pages/dashboard/billing/receive/invoiced-modal';

@withTranslation()
export default class ReceiveTable extends React.Component {
  getColumns = () => {
    const { t } = this.props;
    const columns = [
      {
        title: t('cms.billing.receive.table.receivables_number.field'),
        dataIndex: 'id',
        key: 'id',
        render: (text, record) => (
          <span className="receive__table-field">
            { record.node.referenceId ? record.node.referenceId : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.receive.table.receivables_type.field'),
        dataIndex: 'receivablesType',
        key: 'receivablesType',
        render: (text, record) => (
          <span className="receive__table-field">
            { record.node.receivableType ?
              t(`cms.billing.receive.table.receivables_type.${record.node.receivableType.toLowerCase()}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.receive.table.receivables_method.field'),
        dataIndex: 'receivablesMethod',
        key: 'receivablesMethod',
        render: (text, record) => (
          <span className="receive__table-field">
            { record.node.receivableMethod ?
              t(`cms.billing.receive.table.receivables_method.${record.node.receivableMethod.toLowerCase()}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.receive.table.receivables_status.field'),
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => (
          <span className="receive__table-field">
            { record.node.status ?
              t(`cms.billing.receive.table.receivables_status.${record.node.status.toLowerCase()}`) : '-' }
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
        title: t('cms.billing.receive.table.receivables_amount.field'),
        dataIndex: 'receivablesAmount',
        key: 'receivablesAmount',
        render: (text, record) => (
          <span className="receive__table-field">
            { record.node.amount ? formatPrice(record.node.amount, record.node.currency) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.receive.table.last_invoice_number.field'),
        dataIndex: 'invoiceNumber',
        key: 'invoiceNumber',
        render: (text, record) => (
          <span className="receive__table-field">
            { record.node.invoiceNumber || '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.receive.table.invoice_date.field'),
        dataIndex: 'invoiceDate',
        key: 'invoiceDate',
        render: (text, record) => (
          <span className="receive__table-field">
            { record.node.invoicedAt ? moment(record.node.invoicedAt).format('DD/MM/YYYY') : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.receive.table.paid_date.field'),
        dataIndex: 'paidDate',
        key: 'paidDate',
        render: (text, record) => (
          <span className="receive__table-field">
            { record.node.paidAt ? moment(record.node.paidAt).format('DD/MM/YYYY') : '-' }
          </span>
        ),
      },
      {
        title: t('cms.billing.receive.table.action.field'),
        key: 'action',
        fixed: 'right',
        className: 'receive__action',
        render: (text, record) => (
          <Row className={ classNames('receive__action-row', {
            'receive__action-row--invoiced':
              ['PENDING_INVOICE', 'INVOICED'].indexOf(record.node.status) !== -1,
          }) }
          >
            <button
              className="receive__table-btn"
              onClick={ () => { this.handleViewBtn(record.node.referenceId); } }
            >
              { t('cms.billing.tarnsfer.table.action.view.btn') }
            </button>
            <If condition={ record.node.status === 'PENDING_INVOICE' }>
              <InvoicedModal
                t={ t }
                onInvoiced={ number => this.handleInvoiced(record.node.id, number, 'INVOICED') }
                communication={ this.props.communication }
                type="tableBtn"
              />
            </If>
            <If condition={ record.node.status === 'INVOICED' }>
              <Popconfirm
                overlayStyle={ { maxWidth: 260 } }
                placement="top"
                title={ t('cms.billing.receive.paid.modal.title') }
                onConfirm={ () => { this.handleInvoiced(record.node.id, null, 'PAID'); } }
                okText={ t('cms.properties.edit.btn.yes') }
                okType="danger"
                cancelText={ t('cms.properties.edit.btn.no') }
                arrowPointAtCenter
              >
                <button className="receive__table-btn receive__table-btn--invoiced">
                  { t('cms.billing.receive.table.action.paid.btn') }
                </button>
              </Popconfirm>
            </If>
          </Row>
        ),
      },
    ];

    return columns;
  }

  handleViewBtn = (id) => {
    this.props.history.push(generatePath('billing.receiveDetail', { id }));
  }

  handleInvoiced = (id, num, status, onSuccess = () => {}) => {
    const data = { id, status };

    if (num) {
      data.invoiceNumber = num;
    }

    this.props.pendingReceivables(data, onSuccess);
  }

  render() {
    const { t, list, communication } = this.props;
    return (
      <div className="receive__table-content">
        <h4 className="receive__table-tltle">
          { t('cms.billing.tarnsfer.table.total_title', { totalCount: list.total || 0 }) }
        </h4>
        <Table
          className="receive__table"
          columns={ this.getColumns() }
          dataSource={ list.payload || [] }
          loading={ communication && communication.receiveList &&
            communication.receiveList.status === communicationStatus.FETCHING }
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

ReceiveTable.propTypes = {
  t: PropTypes.func.isRequired,
  list: PropTypes.object,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  communication: PropTypes.object,
  filters: PropTypes.object,
  handlePaginationChange: PropTypes.func,
  handlePageSizeChange: PropTypes.func,
  pendingReceivables: PropTypes.func.isRequired,
};

ReceiveTable.defaultProps = {
  t: () => {},
  list: {},
  history: {
    push: () => {},
  },
  communication: {},
  filters: {},
  handlePaginationChange: () => {},
  handlePageSizeChange: () => {},
  pendingReceivables: () => {},
};
