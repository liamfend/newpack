import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Modal, Input } from 'antd';
import { communicationStatus } from '~client/constants';

export default class InvoicedModal extends React.Component {
  constructor() {
    super();

    this.state = {
      showInvoicedNumberErr: false,
      invoicedNumber: null,
      visible: false,
    };
  }

  handleOkBtn = () => {
    if (this.state.invoicedNumber && this.state.invoicedNumber.length < 120) {
      this.props.onInvoiced(this.state.invoicedNumber);
      this.setState({
        showInvoicedNumberErr: false,
        visible: false,
        invoicedNumber: null,
      });
    } else {
      this.setState({
        showInvoicedNumberErr: true,
        visible: true,
      });
    }
  }

  setInvoicedNumber = (e) => {
    this.setState({
      invoicedNumber: e.target.value,
      showInvoicedNumberErr: !e.target.value || e.target.value.length > 120,
    });
  }

  showModal= () => {
    this.setState({
      visible: !this.state.visible,
    });
  }

  render() {
    const { t, communication } = this.props;

    return (
      <div className="invoiced-modal">
        <Choose>
          <When condition={ this.props.type === 'tableBtn' }>
            <button className="receive__table-btn receive__table-btn--invoiced" onClick={ this.showModal }>
              { t('cms.billing.receive.table.action.invoiced.btn') }
            </button>
          </When>
          <Otherwise>
            <Button
              type="primary"
              className="invoiced-modal__btn"
              onClick={ this.showModal }
            >
              { t('cms.billing.receive.table.action.invoiced.btn') }
            </Button>
          </Otherwise>
        </Choose>

        <Modal
          visible={ this.state.visible }
          width={ 880 }
          className="invoiced-modal__content"
          title={ t('cms.billing.receive.invoiced.modal.title') }
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
              onClick={ this.handleOkBtn }
            >
              { t('cms.billing.tarnsfer.confirm.btn') }
            </Button>,
          ] }
          onCancel={ this.showModal }
        >
          <div className="invoiced-modal__invoice-info">
            <h3 className="invoiced-modal__invoice-info-title">
              {t('cms.billing.receive.invoiced.modal.invoice_info.title')}
            </h3>
            <span className="invoiced-modal__invoice-info-desc">
              {t('cms.billing.receive.invoiced.modal.desc')}
            </span>
            <div className="invoiced-modal__invoice-info-form">
              <Row gutter={ 24 } className="invoiced-modal__row">
                <Col span={ 6 } style={ { textAlign: 'right' } }>
                  <span className="invoiced-modal__input-lable--required">*</span>
                  <span className="invoiced-modal__input-lable">
                    { t('cms.billing.receive.invoiced.modal.invoiced_number.lable') }
                  </span>
                </Col>
                <Col span={ 18 } style={ { position: 'relative' } }>
                  <Input
                    value={ this.state.invoicedNumber }
                    onChange={ this.setInvoicedNumber }
                    placeholder={ t('cms.billing.receive.invoiced.modal.invoiced_number.placeholder') }
                  />
                  <If condition={ this.state.showInvoicedNumberErr }>
                    <span className="invoiced-modal__input-err">
                      { this.state.invoicedNumber && this.state.invoicedNumber.length > 120 ?
                        t('cms.billing.modal.input.error_length') :
                        t('cms.billing.receive.invoiced.modal.invoiced_number.err')
                      }
                    </span>
                  </If>
                </Col>
              </Row>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

InvoicedModal.propTypes = {
  t: PropTypes.func.isRequired,
  onInvoiced: PropTypes.func.isRequired,
  communication: PropTypes.object,
  type: PropTypes.string,
};

InvoicedModal.defaultProps = {
  t: () => {},
  onInvoiced: () => {},
  communication: {},
  type: '',
};
