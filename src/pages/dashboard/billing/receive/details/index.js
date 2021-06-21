import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Breadcrumb, Row, Col, Card, Popconfirm, Button, Spin } from 'antd';
import * as actions from '~actions/billing';
import generatePath from '~settings/routing';
import formatPrice from '~helpers/currency';
import moment from 'moment';
import { communicationStatus } from '~client/constants';
import InvoicedModal from '~pages/dashboard/billing/receive/invoiced-modal';

const mapStateToProps = state => ({
  details: state.dashboard.billing.get('receiveDetails').toJS(),
  communication: state.dashboard.billing.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  orderReceive: (params) => {
    dispatch(actions.orderReceive(params));
  },
  updateOrderReceivable: (params, successCallback) => {
    dispatch(actions.updateOrderReceivable(params, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class TransferDetails extends React.Component {
  componentDidMount() {
    const params = this.props.match.params;
    this.props.orderReceive(params);
  }

  handleInvoiced = (number, status, onSuccess = () => {}) => {
    const params = this.props.match.params;
    const data = {
      id: this.props.details.id,
      status,
    };

    if (number) {
      data.invoiceNumber = number;
    }

    this.props.updateOrderReceivable(data, () => {
      this.props.orderReceive(params);
      onSuccess();
    });
  }

  getShippingAddress = () => {
    const { details } = this.props;
    let addressText = '';

    if (details.order && details.order.property && details.order.property.address) {
      addressText = addressText.concat(details.order.property.address);
    }

    if (details.order && details.order.property && details.order.property.addressLine2) {
      addressText = addressText.concat(details.order.property.addressLine2);
    }

    return addressText;
  }

  render() {
    const { t, details, communication } = this.props;

    return (
      <div className="receive-details">
        <Choose>
          <When condition={ communication.receiveDetails.status === communicationStatus.FETCHING } >
            <div className="receive-details__loading">
              <Spin />
            </div>
          </When>
          <Otherwise>
            <div className="receive__header">
              <div className="receive-details__bread-crumb">
                <Breadcrumb>
                  <Breadcrumb.Item>
                    <a
                      className="receive__bread-crumb-text"
                      href={ generatePath('billing', {}) }
                    >
                      { t('cms.billing.tarnsfer.header.menu_link.billing') }
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <a
                      className="receive__bread-crumb-text"
                      href={ generatePath('billing.receivables', {}) }
                    >
                      { t('cms.billing.tarnsfer.header.menu_link.receivable') }
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <span className="receive__bread-crumb-text">
                      { t('cms.billing.tarnsfer.header.menu_link.receivable.details') }
                    </span>
                  </Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <h2 className="receive-details__title">
                { t('cms.billing.receive_details.header.title', {
                  id: details.referenceId,
                }) }
              </h2>

              <div className="receive-details__header-content--left">
                <div className="receive-details__header-content-btns">
                  <If condition={ details.status === 'PENDING_INVOICE' }>
                    <InvoicedModal
                      t={ t }
                      onInvoiced={ number => this.handleInvoiced(number, 'INVOICED') }
                      communication={ this.props.communication }
                    />
                  </If>
                  <If condition={ details.status === 'INVOICED' }>
                    <Popconfirm
                      overlayStyle={ { maxWidth: 260 } }
                      placement="bottomLeft"
                      title={ t('cms.billing.receive.paid.modal.title') }
                      onConfirm={ () => this.handleInvoiced(null, 'PAID') }
                      okText={ t('cms.properties.edit.btn.yes') }
                      okType="danger"
                      cancelText={ t('cms.properties.edit.btn.no') }
                      arrowPointAtCenter
                    >
                      <Button className="receive-details__table-btn" type="primary">
                        { t('cms.billing.receive.table.action.paid.btn') }
                      </Button>
                    </Popconfirm>
                  </If>
                </div>
                <div className="receive-details__right-info">
                  <div className="receive-details__right-row">
                    <span className="receive-details__info-right">
                      {t('cms.billing.receive.details.receivables_status.field')}
                    </span>
                    <span className="receive-details__info-right--value">
                      { details.status ?
                        t(`cms.billing.receive.table.receivables_status.${details.status.toLowerCase()}`) : '-' }
                    </span>
                  </div>
                  <div className="refund-details__right-row">
                    <span className="receive-details__info-right">
                      {t('cms.billing.receive.details.receivables_price.field')}
                    </span>
                    <span className="receive-details__info-right--value">
                      { details.amount && details.currency ?
                        formatPrice(details.amount, details.currency, 2) : '-' }
                    </span>
                  </div>
                </div>
              </div>
              <div className="receive-details__header-content">
                <Row className="receive-details__info-row" gutter={ 50 }>
                  <Col span={ 12 } className="receive-details__info-col">
                    <span className="receive-details__info">
                      { t('cms.billing.receive.details.receivables_type.field', {
                        value: details.receivableType ? t(`cms.billing.receive.table.receivables_type.${details.receivableType.toLowerCase()}`) : '-',
                      }) }
                    </span>
                    <span className="receive-details__info">
                      {t('cms.billing.receive.details.landlord.field', {
                        value: details.landlord && details.landlord.name ? details.landlord.name : '-',
                      })}
                    </span>
                    <span className="receive-details__info">
                      {t('cms.billing.receive.details.booking_number.field', {
                        value: details.order && details.order.referenceId ? details.order.referenceId : '-',
                      })}
                    </span>
                    <span className="transfer-details__info">
                      {t('cms.billing.receive.details.invoice_number.field', {
                        value: details.invoiceNumber || '-',
                      })}
                    </span>
                    <span className="transfer-details__info">
                      {t('cms.billing.receive.details.paid_date.field', {
                        value: details.paidAt ? moment(details.paidAt).format('DD/MM/YYYY') : '-',
                      })}
                    </span>
                  </Col>
                  <Col span={ 12 } className="receive-details__info-col">
                    <span className="receive-details__info">
                      {t('cms.billing.receive.details.receivable_method.title', {
                        value: details.receivableMethod ?
                          (t(`cms.billing.receive.table.method.${details.receivableMethod.toLowerCase()}`)) : '-',
                      })}
                    </span>
                    <span className="receive-details__info">
                      {t('cms.billing.receive.details.property.field', {
                        value: details.order && details.order.property &&
                          details.order.property.name ?
                          details.order.property.name : '-',
                      })}
                    </span>
                    <span className="receive-details__info">
                      {t('cms.billing.receive.details.commission_amount', {
                        value: details.amount && details.currency ? formatPrice(details.amount, details.currency) : '-',
                      })}
                    </span>
                    <span className="transfer-details__info">
                      {t('cms.billing.receive.details.last_invoice_date.field', {
                        value: details.invoicedAt ? moment(details.invoicedAt).format('DD/MM/YYYY') : '-',
                      })}
                    </span>
                  </Col>
                </Row>
              </div>
            </div>

            <div className="receive-details__content">
              <If condition={ details.order && details.order.property }>
                <Card title={ t('cms.billing.receive.details.property_billing_info.title') }>
                  <p className="receive-details__info">
                    {t('cms.billing.receive.details.country.title', {
                      value: details.order.property && details.order.property.city
                        && details.order.property.city.country
                        && details.order.property.city.country.name ?
                        details.order.property.city.country.name : '-',
                    })}
                  </p>
                  <p className="receive-details__info">
                    {t('cms.billing.receive.details.city.title', {
                      value: details.order.property && details.order.property.city ?
                        details.order.property.city.name : '-',
                    })}
                  </p>
                  <p className="receive-details__info">
                    {t('cms.billing.receive.details.address.title', {
                      value: this.getShippingAddress() || '-',
                    })}
                  </p>
                </Card>
              </If>
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

TransferDetails.propTypes = {
  t: PropTypes.func.isRequired,
  orderReceive: PropTypes.func,
  details: PropTypes.object,
  match: PropTypes.object,
  updateOrderReceivable: PropTypes.func.isRequired,
  communication: PropTypes.object,
};

TransferDetails.defaultProps = {
  t: () => {},
  orderReceive: () => {},
  details: {},
  match: {},
  updateOrderReceivable: () => {},
  communication: {},
};
