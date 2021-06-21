import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Modal, Input } from 'antd';
import { communicationStatus } from '~client/constants';

export default class TransferredModal extends React.Component {
  constructor() {
    super();

    this.state = {
      transactionNo: null,
      visible: false,
      showTransactionNoErr: false,
    };
  }

  handleOkBtn = () => {
    if (this.state.transactionNo && this.state.transactionNo.length < 120) {
      this.props.onConfirm(this.state.transactionNo, () => {
        this.setState({
          showTransactionNoErr: false,
          visible: false,
          transactionNo: null,
        });
      });
    } else {
      this.setState({
        showTransactionNoErr: true,
        visible: true,
      });
    }
  }

  setTransactionNo = (e) => {
    this.setState({
      transactionNo: e.target.value,
      showTransactionNoErr: !e.target.value || e.target.value.length > 120,
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
      <div className="transferred-modal">
        <Choose>
          <When condition={ this.props.type === 'tableBtn' }>
            <button className="transfer__table-btn transfer__table-btn--transferred" onClick={ this.showModal }>
              { t('cms.billing.tarnsfer.table.action.transferred.btn') }
            </button>
          </When>
          <Otherwise>
            <Button
              type="primary"
              className="transferred-modal__btn"
              onClick={ this.showModal }
            >
              { t('cms.billing.tarnsfer.table.action.transferred.btn') }
            </Button>
          </Otherwise>
        </Choose>

        <Modal
          visible={ this.state.visible }
          width={ 880 }
          className="transferred-modal__content"
          footer={ [
            <Button key="back" style={ { height: 40 } } onClick={ this.showModal }>
              { t('cms.billing.tarnsfer.cancle.btn') }
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={ communication && communication.updateOrderTransferred &&
                communication.updateOrderTransferred.status === communicationStatus.FETCHING }
              style={ { height: 40 } }
              onClick={ this.handleOkBtn }
            >
              { t('cms.billing.tarnsfer.confirm.btn') }
            </Button>,
          ] }
          onCancel={ this.showModal }
        >
          <div className="transferred-modal__invoice-info">
            <h3 className="transferred-modal__invoice-info-title">
              {t('cms.billing.tarnsfer.transferred.modal.title')}
            </h3>
            <span className="transferred-modal__invoice-info-desc">
              {t('cms.billing.tarnsfer.transferred.modal.desc')}
            </span>
            <div className="transferred-modal__invoice-info-form">
              <Row gutter={ 24 } className="transferred-modal__row">
                <Col span={ 6 } style={ { textAlign: 'left' } }>
                  <span className="transferred-modal__input-lable">
                    { t('cms.billing.tarnsfer.tarnsferred.modal.transaction_no.lable') }
                  </span>
                </Col>
                <Col span={ 18 } style={ { position: 'relative' } }>
                  <Input
                    value={ this.state.transactionNo }
                    onChange={ this.setTransactionNo }
                    placeholder={ t('cms.billing.tarnsfer.tarnsferred.modal.transaction_no.placeholder') }
                  />
                  <If condition={ this.state.showTransactionNoErr }>
                    <span className="transferred-modal__input-err">
                      { this.state.transactionNo && this.state.transactionNo.length > 120 ?
                        t('cms.billing.modal.input.error_length') :
                        t('cms.billing.tarnsfer.tarnsferred.modal.transaction_no.err')
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

TransferredModal.propTypes = {
  t: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  communication: PropTypes.object,
  type: PropTypes.string,
};

TransferredModal.defaultProps = {
  t: () => {},
  onConfirm: () => {},
  communication: {},
  type: '',
};
