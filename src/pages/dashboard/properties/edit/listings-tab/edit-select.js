import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { connect } from 'react-redux';
import { Icon, Checkbox, Form, Select, InputNumber, message, Tooltip, Popconfirm } from 'antd';
import { updateMutation } from '~client/constants';
import * as actions from '~actions/properties/property-edit';
import TenancyDetails from '~components/tenancy-details';

const { Option } = Select;
const mapDispatchToProps = dispatch => ({
  setBulkListingsDataChanged: (isChanged) => {
    dispatch(actions.setBulkListingsDataChanged(isChanged));
  },
});
const mapStateToProps = state =>
  ({ editedFields: state.dashboard.propertyEdit.toJS().editedFields });

@connect(mapStateToProps, mapDispatchToProps)
class EditSelectModal extends React.Component {
  constructor(props) {
    super(props);
    this.iconTooltipContainer = null;
    this.state = {
      selectedListings: props.selectedListings,
      editModalChanged: false,
      selectedListingsError: false,
      selectedListingsWarning: false,
      selectedListingsMinVal: null,
      tenancyLengthError: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.handleSelectedListings(nextProps.selectedListings);
  }

  componentDidMount() {
    this.handleSelectedListings(this.props.selectedListings);
  }

  handleSelectedListings = (selectedListings) => {
    const errorArr =
      selectedListings.filter(selectedListingItem => !Number(selectedListingItem.priceMin));
    const warningArr = selectedListings.filter(selectedListingItem =>
      selectedListingItem.autoAvailAllowed || selectedListingItem.autoPriceAllowed);
    this.setState({
      selectedListingsMinVal: Math.min(
        ...selectedListings.filter(selectedListingItem =>
          Number(selectedListingItem.priceMin)).map(item => item.priceMin),
      ),
    });
    if (errorArr.length > 0) {
      this.setState({
        selectedListingsError: true,
      });
      if (this.props.form.getFieldValue('discountCheckbox')) {
        this.props.form.setFieldsValue({ discountCheckbox: false });
      }
      if (this.props.form.getFieldValue('discountType')) {
        this.props.form.setFieldsValue({ discountType: undefined });
      }
      if (this.props.form.getFieldValue('discountValue')) {
        this.props.form.setFieldsValue({ discountValue: null });
      }
    } else {
      this.setState({
        selectedListingsError: false,
      });
    }
    if (warningArr.length > 0) {
      this.setState({
        selectedListingsWarning: true,
      });
    } else {
      this.setState({
        selectedListingsWarning: false,
      });
    }

    const tenancyError =
      selectedListings.filter(selectedListingItem => selectedListingItem.type === 'PLACEHOLDER');
    if (tenancyError.length > 0) {
      this.setState({
        tenancyLengthError: true,
      });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        this.props.data.map((room) => {
          room.listings.map((listing) => {
            if (this.props.selectedListingsKeys.indexOf(listing.id) !== -1) {
              const newData = listing;
              let hasChanged = false;

              if (values.availabilityCheckbox && values.availability) {
                newData.availability = values.availability;
                hasChanged = true;
              }

              if (values.discountCheckbox && values.discountType) {
                newData.discountType = values.discountType;
                newData.discountValue = values.discountValue;
                hasChanged = true;
              }

              if (values.tenancyCheckbox) {
                newData.moveIn = values.moveIn ? moment(values.moveIn).format('YYYY-MM-DD') : null;
                newData.moveInType = values.moveInType;
                newData.moveOut = values.moveOut ? moment(values.moveOut).format('YYYY-MM-DD') : null;
                newData.moveOutType = values.moveOutType;
                newData.tenancyLengthType = values.tenancyLengthType;

                if (values.tenancyLengthValueMax) {
                  newData.tenancyLengthValue = `${values.tenancyLengthValueMin}-${values.tenancyLengthValueMax}`;
                } else {
                  newData.tenancyLengthValue = values.tenancyLengthValueMin ? `${values.tenancyLengthValueMin}` : null;
                }

                hasChanged = true;
              }

              if (hasChanged) {
                if (newData.id.match(/fake-id/g)) {
                  newData.action = updateMutation.INSERT;
                } else {
                  newData.action = updateMutation.UPDATE;
                }
                message.success(this.props.t('cms.listing.toast.update_success'));
                this.props.updatePropertyListing(room.id, listing.id, newData);
              }

              this.handleCloseModal();
            }
            return true;
          });
          return true;
        });
      }
    });
  };

  handleReset= () => {
    this.props.form.resetFields();
    this.props.setBulkListingsDataChanged(false);
  };

  handleCloseModal = () => {
    this.props.handleCloseEditSelectModal();
    this.props.setBulkListingsDataChanged(false);
  };

  handleDiscountTypeChange = () => {
    this.props.form.resetFields(['discountValue']);
  };

  handleAvailabilityCheckboxChange = (event) => {
    if (!event.target.checked) {
      this.props.form.resetFields(['availability']);
    }
    this.props.setBulkListingsDataChanged(true);
  };

  handleDiscountCheckboxChange = (event) => {
    if (!event.target.checked) {
      this.props.form.resetFields(['discountType', 'discountValue']);
    }
    this.props.setBulkListingsDataChanged(true);
  };

  handleTenancyCheckboxChange = () => {
    if (!event.target.checked) {
      this.props.form.resetFields(['moveIn', 'moveInType', 'moveOut', 'moveOutType', 'tenancyLengthType', 'tenancyLengthValueMax', 'tenancyLengthValueMin']);
    }
    this.props.setBulkListingsDataChanged(true);
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { selectedListingsError, selectedListingsWarning, selectedListingsMinVal,
      tenancyLengthError } = this.state;

    return (
      <div className="edit-select-modal">
        <div className="edit-select-modal__header-container">
          <Choose>
            <When condition={ this.props.editedFields.bulkListingsDataChanged }>
              <Popconfirm
                title={ this.props.t('cms.properties.edit.modal_close_tip') }
                placement="left"
                onConfirm={ this.handleCloseModal }
                okText={ this.props.t('cms.properties.edit.btn.yes') }
                cancelText={ this.props.t('cms.properties.edit.btn.no') }
              >
                <button
                  type="button"
                  className="edit-select-modal__btn edit-select-modal__btn--close"
                >
                  <Icon type="close" style={ { fontSize: '12px' } } />
                </button>
              </Popconfirm>
            </When>
            <Otherwise>
              <button type="button" className="edit-select-modal__btn edit-select-modal__btn--close" onClick={ this.handleCloseModal }>
                <Icon
                  type="close"
                  style={ {
                    fontSize: '12px',
                  } }
                />
              </button>
            </Otherwise>
          </Choose>
        </div>
        <Form layout="vertical" className="edit-select-modal__form" onSubmit={ this.handleSubmit }>
          <div className="edit-select-modal__scroll-box">
            <h3 className="edit-select-modal__title">{ this.props.t('cms.listing.edit_select_modal.title') }</h3>
            <div className={ classNames('edit-select-modal__availability-container', {
              'edit-select-modal__availability-container--checked': getFieldValue('availabilityCheckbox'),
            }) }
            >
              <Form.Item className="edit-select-modal__availability-checkbox">
                { getFieldDecorator('availabilityCheckbox', {
                  valuePropName: 'checked',
                })(
                  <Checkbox onChange={ this.handleAvailabilityCheckboxChange } />,
                )}
              </Form.Item>
              <div className="edit-select-modal__availability-select">
                <label className="edit-select-modal__availability-label">{ this.props.t('cms.listing.modal.availability.label') }</label>
                <div ref={ (node) => { this.availabilitySelect = node; } }>
                  <Form.Item className="edit-select-modal__availability-select-item">
                    { getFieldDecorator('availability', {
                      rules: [{
                        required: getFieldValue('availabilityCheckbox'),
                        message: this.props.t('cms.listing.modal.error_message.can_not_empty'),
                      }],

                    })(
                      <Select
                        style={ {
                          height: '32px',
                          borderRadius: '2px',
                        } }
                        disabled={ !getFieldValue('availabilityCheckbox') }
                        getPopupContainer={ () => this.availabilitySelect }
                        placeholder="Select availability"
                      >
                        <Option value="GOOD">{ this.props.t('cms.listing.modal.availability.option.good') }</Option>
                        <Option value="LIMITED">{ this.props.t('cms.listing.modal.availability.option.limited') }</Option>
                        <Option value="SOLD_OUT">{ this.props.t('cms.listing.modal.availability.option.sold_out') }</Option>
                      </Select>,
                    )}
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className={ tenancyLengthError ? 'tenancy-area-wrapper--error' : 'tenancy-area-wrapper' }>
              <Tooltip
                placement="topLeft"
                getPopupContainer={ () => this.tenancyContainer }
                title={ tenancyLengthError ? this.props.t('cms.listing.modal.tendancy_area_disabled.hint') : '' }
              >
                <div
                  className={ classNames('edit-select-modal__discount-container', {
                    'edit-select-modal__discount-container--checked': getFieldValue('tenancyCheckbox'),
                  }) }
                  ref={ (node) => { this.tenancyContainer = node; } }
                >
                  <Form.Item className="edit-select-modal__availability-checkbox">
                    { getFieldDecorator('tenancyCheckbox', {
                      valuePropName: 'checked',
                    })(
                      <Checkbox
                        disabled={ tenancyLengthError }
                        onChange={ this.handleTenancyCheckboxChange }
                      />,
                    ) }
                  </Form.Item>
                  <TenancyDetails
                    ref={ (node) => { this.tenancyDetails = node; } }
                    form={ this.props.form }
                    billingCycle={ this.props.billingCycle }
                    listing={ false }
                    showPlaceHolder={ !getFieldValue('tenancyCheckbox') }
                    t={ this.props.t }
                    showTitle // true - not show
                  />
                </div>
              </Tooltip>
            </div>
            <div className={ selectedListingsError ? 'discount-area-wrapper--error' : 'discount-area-wrapper' }>
              <Tooltip
                placement="topLeft"
                getPopupContainer={ () => this.discountContainer }
                title={ selectedListingsError ? this.props.t('cms.listing.modal.discount_area_disabled.hint') : '' }
              >
                <div
                  className={ classNames('edit-select-modal__discount-container', {
                    'edit-select-modal__discount-container--checked': getFieldValue('discountCheckbox'),
                  }) }
                  ref={ (node) => { this.discountContainer = node; } }
                >
                  <Form.Item className="edit-select-modal__discount-checkbox">
                    { getFieldDecorator('discountCheckbox', {
                      valuePropName: 'checked',
                    })(
                      <Checkbox
                        disabled={ selectedListingsError }
                        onChange={ this.handleDiscountCheckboxChange }
                      />,
                    ) }
                  </Form.Item>
                  <div className="edit-select-modal__discount-type">
                    <label className="edit-select-modal__discount-type-label">{ this.props.t('cms.listing.modal.discount_type.label') }</label>
                    <div ref={ (node) => { this.discountTypeSelect = node; } }>
                      <Form.Item className="edit-select-modal__discount-type-item">
                        { getFieldDecorator('discountType', {
                          rules: [{
                            required: getFieldValue('discountCheckbox'),
                            message: this.props.t('cms.listing.modal.error_message.can_not_empty'),
                          }],
                        })(
                          <Select
                            placeholder="Select"
                            style={ {
                              height: '32px',
                              borderRadius: '2px',
                            } }
                            disabled={ !getFieldValue('discountCheckbox') }
                            getPopupContainer={ () => this.discountTypeSelect }
                            onChange={ this.handleDiscountTypeChange }
                          >
                            <Option value="NO_DISCOUNT">{ this.props.t('cms.listing.modal.discount_type.options.no_discount') }</Option>
                            <Option value="PERCENTAGE">{ this.props.t('cms.listing.modal.discount_type.options.percentage') }</Option>
                            <Option value="ABSOLUTE">{
                              this.props.t('cms.listing.modal.discount_type.options.fixed_amount')
                            }</Option>
                          </Select>,
                        ) }
                      </Form.Item>
                    </div>
                  </div>
                  <div className="edit-select-modal__discount-value">
                    <label className="edit-select-modal__discount-value-label" ref={ (node) => { this.iconTooltipContainer = node; } }>
                      {this.props.t('cms.listing.modal.discount_value.label')}
                      <If condition={ getFieldValue('discountType') === 'ABSOLUTE' }>
                        <Tooltip title={ `${this.props.t('cms.listing.modal.discount_type.options.fixed_amount.hint')}.` } getPopupContainer={ () => this.iconTooltipContainer }>
                          <Icon type="question-circle" className="icon-question" />
                        </Tooltip>
                      </If>
                    </label>
                    <Form.Item className="edit-select-modal__discount-value-item">
                      { getFieldDecorator('discountValue', {
                        rules: [
                          {
                            required: getFieldValue('discountType') !== 'NO_DISCOUNT' && getFieldValue('discountCheckbox'),
                            message: this.props.t('cms.listing.modal.error_message.can_not_empty'),
                          },
                          {
                            validator: (rule, value, callback) => {
                              if (value > selectedListingsMinVal) {
                                callback('error');
                              }
                              callback();
                            },
                            message: this.props.t('cms.listing.modal.discount_area.range_error', { value: selectedListingsMinVal }),
                          },
                        ],
                      })(
                        <InputNumber
                          min={ 0 }
                          max={ getFieldValue('discountType') === 'PERCENTAGE' ? 100 : Infinity }
                          formatter={ value => (getFieldValue('discountType') === 'PERCENTAGE' ? `${value}%` : value) }
                          parser={ value => (getFieldValue('discountType') === 'PERCENTAGE' ? value.replace('%', '') : value) }
                          disabled={ !getFieldValue('discountType') || getFieldValue('discountType') === 'NO_DISCOUNT' || !getFieldValue('discountCheckbox') }
                          placeholder={ !selectedListingsError && getFieldValue('discountType') === 'ABSOLUTE' ? `0-${selectedListingsMinVal}` : '' }
                        />,
                      ) }
                    </Form.Item>
                  </div>
                </div>
              </Tooltip>
            </div>
            <If condition={ selectedListingsWarning }>
              <div className="select-listing-warning">
                <Icon theme="filled" type="exclamation-circle" className="icon-warning" />
                {this.props.t('cms.listing.modal.discount_area_warning.hint')}.
              </div>
            </If>
          </div>

          <div className="edit-select-modal__footer-container">
            <button
              type="button"
              className={ classNames('edit-select-modal__btn edit-select-modal__btn--reset', {
                'edit-select-modal__btn--disabled': !getFieldValue('discountCheckbox') &&
                    !getFieldValue('availabilityCheckbox') && !getFieldValue('tenancyCheckbox'),
              }) }
              onClick={ this.handleReset }
              disabled={ !getFieldValue('discountCheckbox') && !getFieldValue('availabilityCheckbox') && !getFieldValue('tenancyCheckbox') }
            >
              <Icon
                className="edit-select-modal__icon--undo"
                type="undo"
                style={ {
                  fontSize: '16px',
                  color: getFieldValue('discountCheckbox') || getFieldValue('availabilityCheckbox') || getFieldValue('tenancyCheckbox') ? '#38b2a6' : '#c8c9cb',
                } }
              />
              { this.props.t('cms.listing.edit_select_modal.withdraw.btn') }
            </button>
            <button
              type="submit"
              className={ classNames('edit-select-modal__btn edit-select-modal__btn--confirm', {
                'edit-select-modal__btn--disabled': !getFieldValue('discountCheckbox') &&
                    !getFieldValue('availabilityCheckbox') && !getFieldValue('tenancyCheckbox'),
              }) }
              disabled={ !getFieldValue('discountCheckbox') && !getFieldValue('availabilityCheckbox') && !getFieldValue('tenancyCheckbox') }
            >
              { this.props.t('cms.listing.edit_select_modal.comfrim.btn') }
            </button>
          </div>
        </Form>
      </div>
    );
  }
}

EditSelectModal.propTypes = {
  handleCloseEditSelectModal: PropTypes.func.isRequired,
  setBulkListingsDataChanged: PropTypes.func,
  form: PropTypes.shape({
    validateFields: PropTypes.func.isRequired,
    resetFields: PropTypes.func.isRequired,
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
  }).isRequired,
  editedFields: PropTypes.shape({
    bulkListingsDataChanged: PropTypes.bool,
  }),
  data: PropTypes.array.isRequired,
  selectedListingsKeys: PropTypes.array.isRequired,
  selectedListings: PropTypes.array.isRequired,
  updatePropertyListing: PropTypes.func.isRequired,
  t: PropTypes.func,
  billingCycle: PropTypes.string,
};

EditSelectModal.defaultProps = {
  handleCloseEditSelectModal: () => {},
  t: () => {},
  billingCycle: '',
  editedFields: {
    bulkListingsDataChanged: false,
  },
  setBulkListingsDataChanged: () => {},
};

const PMSEditSelectModal = Form.create({ name: 'pms_select_select_modal' })(EditSelectModal);

export default PMSEditSelectModal;
