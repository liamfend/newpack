import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Breadcrumb, Row, Col, Card, Spin } from 'antd';
import * as actions from '~actions/billing';
import generatePath from '~settings/routing';
import formatPrice from '~helpers/currency';
import moment from 'moment';
import { communicationStatus } from '~client/constants';
import { allPaymentMethod, transferStatus, bankTransfer } from '~constants/landlord';
import TransferredModal from '~pages/dashboard/billing/transfer/transferred-modal';

const mapStateToProps = state => ({
  details: state.dashboard.billing.get('transferDetails').toJS(),
  communication: state.dashboard.billing.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  orderTransfer: (filters) => {
    dispatch(actions.orderTransfer(filters));
  },
  updateOrderTransferStatus: (params, successCallback) => {
    dispatch(actions.updateOrderTransferStatus(params, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class TransferDetails extends React.Component {
  componentDidMount() {
    const params = this.props.match.params;

    if (params && params.id) {
      this.props.orderTransfer({ referenceId: params.id });
    }
  }

  handlePendingReceivables = (transactionNo, onSuccess = () => {}) => {
    const params = this.props.match.params;
    const data = { id: this.props.details.id };
    if (transactionNo) {
      data.transactionNo = transactionNo;
    }
    this.props.updateOrderTransferStatus(data, () => {
      this.props.orderTransfer({ referenceId: params.id });
      onSuccess();
    });
  }

  getPaymentMethodDetail = (isActual) => {
    const { details, t } = this.props;
    const paymentMethod = this.getPaymentMethod(isActual) || '';
    let paymentMethodDetail = '-';
    const methodDetails = [];

    if (paymentMethod === allPaymentMethod.STRIPE) {
      paymentMethodDetail = isActual ? details.actualTransferDetails.stripeId :
        details.receivePaymentMethod.stripes.stripeId;

      methodDetails.push(t('cms.billing.tarnsfer.details.receive_payment_info.stripe.field', { value: paymentMethodDetail }));
    }

    if (paymentMethod === allPaymentMethod.VIRTUAL_CREDIT_CARD) {
      paymentMethodDetail = isActual ? details.actualTransferDetails.email :
        details.receivePaymentMethod.virtualCreditCards.email;
      methodDetails.push(t('cms.billing.tarnsfer.details.receive_payment_info.virtual_credit_card.field', { value: paymentMethodDetail }));
    }

    if (paymentMethod === allPaymentMethod.BANK_TRANSFER) {
      paymentMethodDetail = isActual ? details.actualTransferDetails.data :
        details.receivePaymentMethod.bankTransfers.data;

      if (paymentMethodDetail && typeof paymentMethodDetail === 'object') {
        Object.keys(paymentMethodDetail).map((item) => {
          methodDetails.push(t(`cms.billing.tarnsfer.details.bank_transfer_details.${bankTransfer[item]}.field`,
            { value: paymentMethodDetail[item] || '-' }));

          return true;
        });
      }
    }

    return methodDetails;
  }

  getPaymentMethod = (isActual) => {
    const { details } = this.props;
    let paymentMethod = null;
    if (isActual) {
      paymentMethod = details.actualTransferMethod;
    } else {
      paymentMethod = details.receivePaymentMethod ?
        details.receivePaymentMethod.transferMethod : null;
    }

    return paymentMethod;
  }

  render() {
    const { t, details, communication } = this.props;

    return (
      <div className="transfer-details">
        <Choose>
          <When condition={ communication.transferDetails.status ===
            communicationStatus.FETCHING }
          >
            <div className="transfer-details__loading">
              <Spin />
            </div>
          </When>
          <Otherwise>
            <div className="transfer__header">
              <div className="transfer-details__bread-crumb">
                <Breadcrumb>
                  <Breadcrumb.Item>
                    <a
                      className="transfer__bread-crumb-text"
                      href={ generatePath('billing', {}) }
                    >
                      { t('cms.billing.tarnsfer.header.menu_link.billing') }
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <a
                      className="transfer__bread-crumb-text"
                      href={ generatePath('billing.transfers', {}) }
                    >
                      { t('cms.billing.tarnsfer.header.menu_link.transfer') }
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <span className="transfer__bread-crumb-text">
                      { t('cms.billing.tarnsfer.header.menu_link.transfer.details') }
                    </span>
                  </Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <h2 className="transfer-details__title">
                { t('cms.billing.tarnsfer_details.header.title', {
                  id: details.referenceId,
                }) }
              </h2>

              <div className="transfer-details__header-content--left">
                <div className="receive-details__header-content-btns">
                  <If condition={ details.status === transferStatus.PENDING_TRANSFER }>
                    <TransferredModal
                      t={ t }
                      onConfirm={ (ransactionNo, onSuccess) =>
                        this.handlePendingReceivables(ransactionNo, onSuccess) }
                      communication={ this.props.communication }
                    />
                  </If>
                </div>
                <div className="transfer-details__right-info">
                  <div className="transfer-details__right-row">
                    <span className="transfer-details__info-right">
                      {t('cms.billing.tarnsfer.table.transfer_status.field')}
                    </span>
                    <span className="transfer-details__info-right--value">
                      { details.status ?
                        t(`cms.billing.tarnsfer.table.transfer_status.${details.status.toLowerCase()}`) : '-' }
                    </span>
                  </div>
                  <div className="refund-details__right-row">
                    <span className="transfer-details__info-right">
                      {t('cms.billing.tarnsfer.table.transfer_price.field')}
                    </span>
                    <span className="transfer-details__info-right--value">
                      { details.amount && details.currency ?
                        formatPrice(details.amount, details.currency, 2) : '-' }
                    </span>
                  </div>
                </div>
              </div>
              <div className="transfer-details__header-content">
                <Row className="transfer-details__info-row" gutter={ 50 }>
                  <Col span={ 12 } className="transfer-details__info-col">
                    <span className="transfer-details__info">
                      { t('cms.billing.tarnsfer.details.transfer_type.field', {
                        value: details.transferType ? t(`cms.billing.tarnsfer.table.transfer_type.${details.transferType.toLowerCase()}`) : '-',
                      }) }
                    </span>
                    <span className="transfer-details__info">
                      {t('cms.billing.tarnsfer.details.payment_amount.field', {
                        value: details.amount && details.currency ? formatPrice(details.amount, details.currency) : '-',
                      })}
                    </span>
                    <span className="transfer-details__info">
                      {t('cms.billing.tarnsfer.details.booking_number.field', {
                        value: details.order && details.order.referenceId ? details.order.referenceId : '-',
                      })}
                    </span>
                  </Col>
                  <Col span={ 12 } className="transfer-details__info-col">
                    <span className="transfer-details__info">
                      {t('cms.billing.tarnsfer.details.property.field', {
                        value: details.order && details.order.property &&
                          details.order.property.name ? details.order.property.name : '-',
                      })}
                    </span>
                    <span className="transfer-details__info">
                      {t('cms.billing.tarnsfer.details.landlord.field', {
                        value: details.landlord && details.landlord.name ? details.landlord.name : '-',
                      })}
                    </span>
                    <span className="transfer-details__info">
                      {t('cms.billing.tarnsfer.details.planning_ransfer_date.field', {
                        value: details.planningTransferDatetime ? moment(details.planningTransferDatetime).format('DD/MM/YYYY') : '-',
                      })}
                    </span>
                  </Col>
                </Row>
              </div>
            </div>

            <If condition={ details }>
              <div className="transfer-details__content">
                <Card
                  className="transfer-details__card"
                  title={ t('cms.billing.tarnsfer.details.receive_payment_info.title') }
                >
                  <p className="transfer-details__info">
                    {t('cms.billing.tarnsfer.details.receive_payment_method.field', {
                      value: details.receivePaymentMethod &&
                        details.receivePaymentMethod.transferMethod ?
                        t(`cms.billing.tarnsfer.details.receive_payment_method.${details.receivePaymentMethod.transferMethod.toLowerCase()}`) : '-',
                    })}
                  </p>
                  <p className="transfer-details__info">
                    {t('cms.billing.tarnsfer.details.receive_ransfer_details.field')}
                    { details.receivePaymentMethod ? '' : ': -' }
                  </p>
                  <If condition={ this.getPaymentMethodDetail(false).length > 0 }>
                    <For of={ this.getPaymentMethodDetail(false) } each="item">
                      <p className="transfer-details__info" key={ item }>
                        { item }
                      </p>
                    </For>
                  </If>
                </Card>

                <Card title={ t('cms.billing.tarnsfer.details.transfer_info.title') }>
                  <p className="transfer-details__info">
                    {t('cms.billing.tarnsfer.details.transaction_number.field', {
                      value: details.transactionNo || '-',
                    })}
                  </p>
                  <p className="transfer-details__info">
                    {t('cms.billing.tarnsfer.details.actual_payment_method.field', {
                      value: details.actualTransferMethod ?
                        t(`cms.billing.tarnsfer.details.receive_payment_method.${details.actualTransferMethod.toLowerCase()}`) : '-',
                    })}
                  </p>
                  <p className="transfer-details__info">
                    {t('cms.billing.tarnsfer.details.actual_ransfer_details.field')}
                    { details.actualTransferMethod ? '' : ': -' }
                  </p>
                  <If condition={ this.getPaymentMethodDetail(true).length > 0 }>
                    <For of={ this.getPaymentMethodDetail(true) } each="item">
                      <p className="transfer-details__info" key={ item }>
                        { item }
                      </p>
                    </For>
                  </If>
                </Card>
              </div>
            </If>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

TransferDetails.propTypes = {
  t: PropTypes.func.isRequired,
  orderTransfer: PropTypes.func,
  details: PropTypes.object,
  match: PropTypes.object,
  updateOrderTransferStatus: PropTypes.func.isRequired,
  communication: PropTypes.object,
};

TransferDetails.defaultProps = {
  t: () => {},
  orderTransfer: () => {},
  details: {},
  match: {},
  updateOrderTransferStatus: () => {},
  communication: {},
};
