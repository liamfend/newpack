import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Form, Popconfirm } from 'antd';
import Svg from '~components/svg';
import modal from '~components/modal';
import DetailsForm from '~pages/dashboard/properties/deposit-and-fees/deposit-modal/form';
import DeleteBtn from '~pages/dashboard/properties/deposit-and-fees/delete-btn';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';

@modal({ className: 'deposit-from-modal' }, true)
class DepositFormModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFieldsChange: false,
    };
  }

  componentDidMount() {
    this.getDepositDetails();
    // add browser alert
    window.onbeforeunload = (e) => {
      if (this.props.form.isFieldsTouched()) {
        const msg = this.props.t('cms.properties.edit.leave_alert.content');
        // eslint-disable-next-line no-param-reassign
        e = e || window.event;
        if (e) {
          e.returnValue = msg;
        }

        return msg;
      }
      return null;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    window.onbeforeunload = null;
  }

  getDepositDetails = () => {
    if (
      this.props.depositId
      && this.props.modalType === 'edit'
      && this.props.property
      && this.props.property.paymentDepositRules
      && this.props.property.paymentDepositRules.edges
    ) {
      let details = {};
      this.props.property.paymentDepositRules.edges.find((deposit) => {
        if (deposit.node.id === this.props.depositId) {
          details = deposit.node;
          return true;
        }

        return null;
      });
      const newDetails = { ...details };
      const formData = {};
      formData.name = newDetails.name;
      formData.value = newDetails.value;
      formData.paymentProcessingFee = !!newDetails.paymentProcessingFee;
      formData.type = newDetails.type;

      this.setFormValue(formData);
    } else {
      this.setFormValue({ paymentProcessingFee: false });
    }
  }

  setFormValue = (data) => {
    this.props.form.setFieldsValue(data);
  }

  closePopModal = () => {
    this.setState({
      isFieldsChange: false,
    });
  }

  openPopModal = () => {
    this.setState({
      isFieldsChange: this.props.form.isFieldsTouched(),
    });

    if (!this.props.form.isFieldsTouched()) {
      this.props.onClose();
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const formField = ['name', 'value', 'type', 'paymentProcessingFee'];

    this.props.form.validateFieldsAndScroll(
      formField,
      { scroll: { offsetTop: 70, offsetBottom: 70 },
      }, (err, values) => {
        if (!err) {
          const depositData = values;
          depositData.paymentProcessingFee = values.paymentProcessingFee;
          if (depositData) {
            if (this.props.modalType === 'add') {
              depositData.propertyId = this.props.property.id;
              this.props.createDeposit(depositData);
            }

            if (this.props.modalType === 'edit' && this.props.form.isFieldsTouched()) {
              depositData.id = this.props.depositId;
              this.props.updateDeposit(depositData);
            }
          }
          this.props.onClose();
        }
      },
    );
  }

  render() {
    const {
      t, property, form, modalType, onClose, isLast, deletedDeposit,
    } = this.props;

    return (
      <div className="deposit-from">
        <h2 className="deposit-from__title">
          { t(`cms.deposit_and_fees.deposit_modal.${modalType}.title`) }
        </h2>
        <Popconfirm
          trigger="click"
          visible={ this.state.isFieldsChange }
          title={ t('cms.property.commission_form_modal.close.tips.title') }
          placement="left"
          onConfirm={ onClose }
          onCancel={ this.closePopModal }
          okText={ t('cms.properties.edit.btn.yes') }
          cancelText={ t('cms.properties.edit.btn.no') }
        >
          <button
            onClick={ this.openPopModal }
            className="deposit-from__close-btn"
          >
            <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
          </button>
        </Popconfirm>
        <div className="deposit-from__content">
          <Svg className="deposit-from__country-icon" hash="property-country" />
          <span className="deposit-from__property-name">
            { property.name }
          </span>
          <Form className="ant-advanced-search-form">
            <DetailsForm
              t={ t }
              property={ property }
              form={ form }
              billingCycle={ property ? property.billingCycle : '' }
              currency={ property ? property.currency : '' }
            />
            <button
              type="button"
              onClick={ this.handleSubmit }
              className="deposit-from__confirm-btn"
            >
              { t('cms.listing.modal.confirm.btn') }
            </button>
          </Form>
        </div>
        <div className="deposit-from__footer" >
          <If condition={ modalType === 'edit' &&
            showElementByAuth(platformEntity.PAYMENTS_LINE_ITEM_RULES, entityAction.DELETE) }
          >
            <DeleteBtn
              t={ t }
              isLast={ isLast }
              acceptsDepositPayment={ property.acceptsDepositPayment }
              deletedDeposit={ deletedDeposit }
              depositId={ this.props.depositId }
              onClose={ onClose }
              type="modal"
            />
          </If>
        </div>
      </div>
    );
  }
}

DepositFormModal.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  form: PropTypes.object,
  property: PropTypes.object,
  modalType: PropTypes.string,
  depositId: PropTypes.string,
  createDeposit: PropTypes.func,
  updateDeposit: PropTypes.func,
  deletedDeposit: PropTypes.func,
  isLast: PropTypes.bool,
};

DepositFormModal.defaultProps = {
  t: () => {},
  form: {},
  property: {},
  onClose: () => {},
  modalType: '',
  depositId: '',
  createDeposit: () => {},
  updateDeposit: () => {},
  deletedDeposit: () => {},
  isLast: false,
};

export default Form.create({ name: 'deposit_form' })(DepositFormModal);
