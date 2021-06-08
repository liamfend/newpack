import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Modal } from 'antd';
import formatPrice from '~helpers/currency';
import { communicationStatus } from '~client/constants';
import { camelCaseToUpperFisrtCase } from '~helpers';

export default class RefundModal extends React.Component {
  constructor() {
    super();

    this.state = {
      visible: false,
    };
  }

  showModal= () => {
    this.setState({
      visible: !this.state.visible,
    });
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
    const { t, communication, refundDetails, modalType } = this.props;

    return (
      <div className="refund-modal">
        <Choose>
          <When condition={ this.props.type === 'tableBtn' }>
            <button
              className="refund__table-btn refund__table-btn--border"
              onClick={ this.showModal }
            >
              { t(`cms.billing.refund.modal.${modalType}.btn`) }
            </button>
          </When>
          <Otherwise>
            <Button
              type="primary"
              className="refund-modal__btn"
              onClick={ this.showModal }
            >
              { t(`cms.billing.refund.modal.${modalType}.btn`) }
            </Button>
          </Otherwise>
        </Choose>

        <Modal
          visible={ this.state.visible }
          width={ 880 }
          className="refund-modal__content"
          title={ t(`cms.billing.refund.modal.${modalType}.title`) }
          footer={ [
            <Button key="back" style={ { height: 40 } } onClick={ this.showModal }>
              { t('cms.billing.tarnsfer.cancle.btn') }
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={ communication && communication.updateOrderReceivable &&
                communication.updateOrderReceivable.status === communicationStatus.FETCHING }
              style={ { height: 40 } }
              onClick={ () => { this.props.onConfirm(); this.showModal(); } }
            >
              { t('cms.billing.tarnsfer.confirm.btn') }
            </Button>,
          ] }
          onCancel={ this.showModal }
        >
          <div className="refund-modal__basic-info">
            <h3 className="refund-modal__basic-info-title">
              {t('cms.billing.refund.modal.basic_info.title')}
            </h3>
            <div className="refund-modal__basic-info-desc">
              <span className="refund-modal__basic-info-text">
                {t(`cms.billing.refund.modal.basic_info.${modalType}.1.desc`)}
              </span>
              <span className="refund-modal__basic-info-text">
                {t(`cms.billing.refund.modal.basic_info.${modalType}.2.desc`)}
              </span>
            </div>
            <div className="refund-modal__invoice-info-form">
              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <span className="refund-modal__lable">
                    {t('cms.billing.refund.table.filiter.refund_from.lable')}:&nbsp;
                    { refundDetails.refundFrom ? t(`cms.billing.refund.table.refund_from.${refundDetails.refundFrom.toLowerCase()}`) : '-' }
                  </span>
                  <span className="refund-modal__lable">
                    {t('cms.billing.refund.table.refund_method.field')}:&nbsp;
                    { refundDetails.refundMethod ? t(`cms.billing.refund.table.refund_method.${refundDetails.refundMethod.toLowerCase()}`) : '-' }
                  </span>
                </Col>
                <Col span={ 12 }>
                  <span className="refund-modal__lable">
                    {t('cms.billing.refund.table.filiter.refund_to.lable')}:&nbsp;
                    { refundDetails.refundTo ? t(`cms.billing.refund.table.refund_to.${refundDetails.refundTo.toLowerCase()}`) : '-' }
                  </span>
                  <span className="refund-modal__lable">
                    {t('cms.billing.refund.table.refund_amount.field')}:&nbsp;
                    { refundDetails.amount ? formatPrice(refundDetails.amount, refundDetails.currency, 2) : '-' }
                  </span>
                </Col>
              </Row>
              <Row className="refund-modal__row">
                <span className="refund-modal__lable">
                  {t('cms.billing.refund.table.filiter.trade_number.lable')}:&nbsp;
                  { refundDetails.transactionNo ? refundDetails.transactionNo : '-' }
                </span>
                <If condition={ refundDetails.refundFrom === 'ACCOMMODATION_PARTNER' }>
                  <span className="refund-modal__lable">
                    {t('cms.billing.refund.details.refund_method_details.field')}
                    {refundDetails.refundMethodDetails ? '' : ': -'}
                  </span>
                  <If condition={ refundDetails.refundMethodDetails }>
                    <For of={ this.handleRefundDetailData(refundDetails.refundMethodDetails) } each="items" index="key">
                      <Row key={ key }>
                        <For of={ items } each="item" index="index">
                          <Col span={ 12 } key={ index }>
                            <span className="refund-modal__field-name">
                              {`${camelCaseToUpperFisrtCase(item)}: ${refundDetails.refundMethodDetails[item] || '-'}`}
                            </span>
                          </Col>
                        </For>
                      </Row>
                    </For>
                  </If>
                </If>
              </Row>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

RefundModal.propTypes = {
  t: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  communication: PropTypes.object,
  type: PropTypes.string,
  refundDetails: PropTypes.object,
  modalType: PropTypes.string,
};

RefundModal.defaultProps = {
  t: () => {},
  onConfirm: () => {},
  communication: {},
  type: '',
  refundDetails: {},
  modalType: 'refunded',
};
