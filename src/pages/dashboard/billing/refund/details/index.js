import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Breadcrumb, Row, Col, Card, Spin } from 'antd';
import * as actions from '~actions/billing';
import generatePath from '~settings/routing';
import formatPrice from '~helpers/currency';
import { communicationStatus } from '~client/constants';
import RefundModal from '~pages/dashboard/billing/refund/modal';
import { camelCaseToUpperFisrtCase } from '~helpers';
import { refundStatus, refundFromTypes } from '~constants/landlord';

const mapStateToProps = state => ({
  details: state.dashboard.billing.get('refundDetails').toJS(),
  communication: state.dashboard.billing.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  orderRefund: (params) => {
    dispatch(actions.orderRefund(params));
  },
  updateOrderReceivable: (params, successCallback) => {
    dispatch(actions.updateOrderReceivable(params, successCallback));
  },
  financialRefund: (params, successCallback) => {
    dispatch(actions.financialRefund(params, successCallback));
  },
  refundConfirm: (params, successCallback) => {
    dispatch(actions.refundConfirm(params, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class RefundDetails extends React.Component {
  componentDidMount() {
    const params = this.props.match.params;
    this.props.orderRefund(params);
  }

  updateRefundStatus = () => {
    const { details } = this.props;
    const data = { id: details.id };
    const params = this.props.match.params;
    if (details.status === refundStatus.PENDING_REFUND) {
      this.props.financialRefund(data, () => {
        this.props.orderRefund(params);
      });
    } else {
      this.props.refundConfirm(data, () => {
        this.props.orderRefund(params);
      });
    }
  }

  handleRefundDetailData = (details) => {
    const arrKeysList = [];
    if (details) {
      const keysList = Object.keys(details);
      while (keysList.length > 0) {
        arrKeysList.push(keysList.splice(0, 2));
      }
    }

    return arrKeysList;
  }

  render() {
    const { t, details, communication } = this.props;
    const btnType = details.status === refundStatus.PENDING_REFUND ? 'refunded' : 'confirm';

    return (
      <div className="refund-details">
        <Choose>
          <When condition={ communication.refundDetails.status === communicationStatus.FETCHING } >
            <div className="refund-details__loading">
              <Spin />
            </div>
          </When>
          <Otherwise>
            <div className="refund__header">
              <div className="refund-details__bread-crumb">
                <Breadcrumb>
                  <Breadcrumb.Item>
                    <a
                      className="refund__bread-crumb-text"
                      href={ generatePath('billing', {}) }
                    >
                      { t('cms.billing.tarnsfer.header.menu_link.billing') }
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <a
                      className="refund__bread-crumb-text"
                      href={ generatePath('billing.refunds', {}) }
                    >
                      { t('cms.billing.tarnsfer.header.menu_link.refund') }
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <span className="refund__bread-crumb-text">
                      { t('cms.billing.tarnsfer.header.menu_link.refund.details') }
                    </span>
                  </Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <h2 className="refund-details__title">
                { t('cms.billing.refund_details.header.title', {
                  id: details.referenceId,
                }) }
              </h2>

              <div className="refund-details__header-content--left">
                <div className="refund-details__header-content-btns">
                  <If condition={
                    (details.status === refundStatus.PENDING_REFUND
                    && details.refundFrom === refundFromTypes.STCOM)
                    || (details.status === refundStatus.REFUND_CONFIRMATION
                    && details.refundFrom === refundFromTypes.ACCOMMODATION_PARTNER)
                  }
                  >
                    <RefundModal
                      t={ t }
                      modalType={ btnType }
                      communication={ this.props.communication }
                      refundDetails={ details }
                      onConfirm={ this.updateRefundStatus }
                    />
                  </If>
                </div>
                <div className="refund-details__right-info">
                  <div className="refund-details__right-row">
                    <span className="refund-details__info-right">
                      {t('cms.billing.refund.details.refund_status.field')}
                    </span>
                    <span className="refund-details__info-right--value">
                      { details.status ?
                        t(`cms.billing.refund.table.refund_status.${details.status.toLowerCase()}`) : '-' }
                    </span>
                  </div>
                  <div className="refund-details__right-row">
                    <span className="refund-details__info-right">
                      {t('cms.billing.refund.details.refund_price.field')}
                    </span>
                    <span className="refund-details__info-right--value">
                      { details.amount && details.currency ?
                        formatPrice(details.amount, details.currency, 2) : '-' }
                    </span>
                  </div>
                </div>
              </div>
              <div className="refund-details__header-content">
                <Row className="refund-details__info-row" gutter={ 50 }>
                  <Col span={ 12 } className="refund-details__info-col">
                    <span className="refund-details__info">
                      { t('cms.billing.refund.details.refund_type.field', {
                        value: details.refundType ?
                          t(`cms.billing.refund.table.refund_type.${details.refundType.toLowerCase()}`) : '-',
                      }) }
                    </span>
                    <span className="refund-details__info">
                      {t('cms.billing.refund.details.landlord.field', {
                        value: details.landlord && details.landlord.name ? details.landlord.name : '-',
                      })}
                    </span>
                    <span className="refund-details__info">
                      { t('cms.billing.refund.details.booking_number.field', {
                        value: details.order && details.order.referenceId ? details.order.referenceId : '-',
                      }) }
                    </span>
                    <span className="refund-details__info">
                      { t('cms.billing.refund.details.refund_from.field', {
                        value: details.refundFrom ?
                          t(`cms.billing.refund.table.refund_from.${details.refundFrom.toLowerCase()}`) : '-',
                      }) }
                    </span>
                  </Col>
                  <Col span={ 12 } className="refund-details__info-col">
                    <span className="refund-details__info">
                      {t('cms.billing.refund.details.refund_method.field', {
                        value: details.refundMethod ?
                          t(`cms.billing.refund.table.refund_method.${details.refundMethod.toLowerCase()}`) : '-',
                      })}
                    </span>
                    <span className="refund-details__info">
                      {t('cms.billing.refund.details.property.field', {
                        value: details.order && details.order.property
                          && details.order.property.name ?
                          details.order.property.name : '-',
                      })}
                    </span>
                    <span className="refund-details__info">
                      {t('cms.billing.refund.details.payment_amount.field', {
                        value: details.orderPayment && details.orderPayment.price ?
                          formatPrice(details.orderPayment.price, details.orderPayment.currency, 2) : '-',
                      })}
                    </span>
                    <span className="refund-details__info">
                      { t('cms.billing.refund.details.refund_to.field', {
                        value: details.refundTo ?
                          t(`cms.billing.refund.table.refund_to.${details.refundTo.toLowerCase()}`) : '-',
                      }) }
                    </span>
                  </Col>
                </Row>
              </div>
            </div>

            <div className="refund-details__content">
              <Card title={ t('cms.billing.refund.details.refund_info.title') }>
                <p className="refund-details__info">
                  {t('cms.billing.refund.details.refund_amount.field', {
                    value: details.amount ? formatPrice(details.amount, details.currency, 2) : '-',
                  })}
                </p>
                <p className="refund-details__info">
                  {t('cms.billing.refund.details.refund_method.field', {
                    value: details.refundMethod ?
                      t(`cms.billing.refund.table.refund_method.${details.refundMethod.toLowerCase()}`) : '-',
                  })}
                </p>
                <If condition={ details.refundMethod === 'CARD' && details.refundMethodDetails }>
                  <p className="refund-details__info">
                    {t('cms.billing.refund.details.stripe_account_name.field', {
                      value: details.refundMethodDetails.stripeConnectedName ?
                        details.refundMethodDetails.stripeConnectedName : '-',
                    })}
                  </p>
                  <p className="refund-details__info">
                    {t('cms.billing.refund.details.stripe_account_id.field', {
                      value: details.refundMethodDetails.destination ?
                        details.refundMethodDetails.destination : '-',
                    })}
                  </p>
                </If>
                <p className="refund-details__info">
                  {t('cms.billing.refund.details.trade_number.field', {
                    value: details.transactionNo ? details.transactionNo : '-',
                  })}
                </p>
                <If condition={ details.refundFrom === 'ACCOMMODATION_PARTNER' }>
                  <p className="refund-details__info">
                    {t('cms.billing.refund.details.refund_method_details.field')}
                    {details.refundMethodDetails ? '' : ': -'}
                  </p>
                  <If condition={ details.refundMethodDetails }>
                    <For of={ this.handleRefundDetailData(details.refundMethodDetails) } each="items" index="key">
                      <Row key={ key }>
                        <For of={ items } each="item" index="index">
                          <Col span={ 12 } key={ index }>
                            <span className="refund-modal__field-name">
                              {`${camelCaseToUpperFisrtCase(item)}: ${details.refundMethodDetails[item] || '-'}`}
                            </span>
                          </Col>
                        </For>
                      </Row>
                    </For>
                  </If>
                </If>
              </Card>
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

RefundDetails.propTypes = {
  t: PropTypes.func.isRequired,
  orderRefund: PropTypes.func,
  details: PropTypes.object,
  match: PropTypes.object,
  communication: PropTypes.object,
  financialRefund: PropTypes.func.isRequired,
  refundConfirm: PropTypes.func.isRequired,
};

RefundDetails.defaultProps = {
  t: () => {},
  orderRefund: () => {},
  details: {},
  match: {},
  communication: {},
  financialRefund: () => {},
  refundConfirm: () => {},
};
