import React from 'react';
import PropTypes from 'prop-types';
import modal from '~components/modal';
import classNames from 'classnames';
import moment from 'moment';
import { Icon, Form, Popconfirm, InputNumber, Tooltip, Checkbox, Select, message } from 'antd';
import TenancyDetails from '~components/tenancy-details';

const { Option } = Select;

@modal({ className: 'listing-bulk-modal' }, false)
class BulkModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedListingsError: false,
      selectedListingsWarning: false,
      selectedListingsMinVal: null,
      tenancyLengthError: false,
    };
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

  handleConfirm = () => {
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        const newData = {
          ids: this.props.selectedListingIds,
        };

        if (values.availabilityCheckbox) {
          newData.availability = values.availability || null;
        }

        if (values.tenancyCheckbox) {
          newData.moveIn = values.moveIn ? moment(values.moveIn).format('YYYY-MM-DD') : null;
          newData.moveInType = values.moveInType || null;
          newData.moveOut = values.moveOut ? moment(values.moveOut).format('YYYY-MM-DD') : null;
          newData.moveOutType = values.moveOutType || null;
          newData.tenancyLengthType = values.tenancyLengthType || null;

          if (values.tenancyLengthValueMax) {
            newData.tenancyLengthValue = `${values.tenancyLengthValueMin}-${values.tenancyLengthValueMax}`;
          } else {
            newData.tenancyLengthValue = values.tenancyLengthValueMin ? `${values.tenancyLengthValueMin}` : null;
          }
        }

        if (values.discountCheckbox) {
          newData.discountType = values.discountType === 'NO_DISCOUNT' ? null : values.discountType;
          newData.discountValue = values.discountValue ? values.discountValue.toString() : null;
        }

        this.props.bulkUpdateListings(newData, () => {
          message.success(this.props.t(`cms.property.listing_management.update_listing${
            this.props.isPublished ? '.published' : ''
          }.toast`));

          this.props.refreshBulkListing(newData);
          this.props.onClose();
        });
      }
    });
  };

  handleDiscountTypeChange = () => {
    this.props.form.resetFields(['discountValue']);
  };

  handleAvailabilityCheckboxChange = (event) => {
    if (!event.target.checked) {
      this.props.form.resetFields(['availability']);
    }
  };

  handleDiscountCheckboxChange = (event) => {
    if (!event.target.checked) {
      this.props.form.resetFields(['discountType', 'discountValue']);
    }
  };

  handleTenancyCheckboxChange = () => {
    if (!event.target.checked) {
      this.props.form.resetFields(['moveIn', 'moveInType', 'moveOut', 'moveOutType', 'tenancyLengthType', 'tenancyLengthValueMax', 'tenancyLengthValueMin']);
    }
  }

  handleReset= () => {
    this.props.form.resetFields();
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { t } = this.props;
    const { selectedListingsError, selectedListingsWarning, selectedListingsMinVal,
      tenancyLengthError } = this.state;

    return (
      <Form layout="vertical" className="listing-bulk">
        <div className="listing-bulk__listing-id">
          <Choose>
            <When condition={ this.props.form.isFieldsTouched() }>
              <Popconfirm
                title={ t('cms.property.listing_management_modal.close.tips.title') }
                placement="left"
                onConfirm={ this.props.onClose }
                okText={ t('cms.properties.edit.btn.yes') }
                cancelText={ t('cms.properties.edit.btn.no') }
              >
                <button className="listing-bulk__close-btn" >
                  <Icon type="close" style={ { fontSize: '12px' } } />
                </button>
              </Popconfirm>
            </When>
            <Otherwise>
              <button className="listing-bulk__close-btn" onClick={ this.props.onClose }>
                <Icon type="close" style={ { fontSize: '12px' } } />
              </button>
            </Otherwise>
          </Choose>
        </div>
        <div className="listing-bulk__content" >
          <div className="listing-bulk__scroll-box">
            <h3 className="listing-bulk__title">{ this.props.t('cms.listing.edit_select_modal.title') }</h3>
            <div className={ tenancyLengthError ? 'availability-area-wrapper--error' : 'availability-area-wrapper' }>
              <Tooltip
                placement="topLeft"
                getPopupContainer={ () => this.availabilityContainer }
                title={ tenancyLengthError ? this.props.t('cms.listing.modal.availability_area_disabled.hint') : '' }
              >
                <div
                  className={ classNames('listing-bulk__availability-container', {
                    'listing-bulk__availability-container--checked': getFieldValue('availabilityCheckbox'),
                  }) }
                  ref={ (node) => { this.availabilityContainer = node; } }
                >
                  <Form.Item className="listing-bulk__availability-checkbox">

                    { getFieldDecorator('availabilityCheckbox', {
                      valuePropName: 'checked',
                    })(
                      <Checkbox
                        disabled={ tenancyLengthError }
                        onChange={ this.handleAvailabilityCheckboxChange }
                      />,
                    )}
                  </Form.Item>
                  <div className="listing-bulk__availability-select">
                    <label className="listing-bulk__availability-label">{ this.props.t('cms.listing.modal.availability.label') }</label>
                    <div ref={ (node) => { this.availabilitySelect = node; } }>
                      <Form.Item className="listing-bulk__availability-select-item">
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
              </Tooltip>
            </div>
            <div className={ tenancyLengthError ? 'tenancy-area-wrapper--error' : 'tenancy-area-wrapper' }>
              <Tooltip
                placement="topLeft"
                getPopupContainer={ () => this.tenancyContainer }
                title={ tenancyLengthError ? this.props.t('cms.listing.modal.tendancy_area_disabled.hint') : '' }
              >
                <div
                  className={ classNames('listing-bulk__discount-container', {
                    'listing-bulk__discount-container--checked': getFieldValue('tenancyCheckbox'),
                  }) }
                  ref={ (node) => { this.tenancyContainer = node; } }
                >
                  <Form.Item className="listing-bulk__availability-checkbox">
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
                  className={ classNames('listing-bulk__discount-container', {
                    'listing-bulk__discount-container--checked': getFieldValue('discountCheckbox'),
                  }) }
                  ref={ (node) => { this.discountContainer = node; } }
                >
                  <Form.Item className="listing-bulk__discount-checkbox">
                    { getFieldDecorator('discountCheckbox', {
                      valuePropName: 'checked',
                    })(
                      <Checkbox
                        disabled={ selectedListingsError }
                        onChange={ this.handleDiscountCheckboxChange }
                      />,
                    ) }
                  </Form.Item>
                  <div className="listing-bulk__discount-type">
                    <label className="listing-bulk__discount-type-label">{ this.props.t('cms.listing.modal.discount_type.label') }</label>
                    <div ref={ (node) => { this.discountTypeSelect = node; } }>
                      <Form.Item className="listing-bulk__discount-type-item">
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
                  <div className="listing-bulk__discount-value">
                    <label className="listing-bulk__discount-value-label" ref={ (node) => { this.iconTooltipContainer = node; } }>
                      {this.props.t('cms.listing.modal.discount_value.label')}
                      <If condition={ getFieldValue('discountType') === 'ABSOLUTE' }>
                        <Tooltip title={ `${this.props.t('cms.listing.modal.discount_type.options.fixed_amount.hint')}.` } getPopupContainer={ () => this.iconTooltipContainer }>
                          <Icon type="question-circle" className="icon-question" />
                        </Tooltip>
                      </If>
                    </label>
                    <Form.Item className="listing-bulk__discount-value-item">
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
        </div>
        <div className="listing-bulk__footer">
          <button
            type="button"
            className={ classNames('listing-bulk__btn listing-bulk__btn--reset', {
              'listing-bulk__btn--disabled': !getFieldValue('discountCheckbox') &&
                  !getFieldValue('availabilityCheckbox') && !getFieldValue('tenancyCheckbox'),
            }) }
            onClick={ this.handleReset }
            disabled={ !getFieldValue('discountCheckbox') && !getFieldValue('availabilityCheckbox') && !getFieldValue('tenancyCheckbox') }
          >
            <Icon
              className="listing-bulk__icon--undo"
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
            onClick={ this.handleConfirm }
            className={ classNames('listing-bulk__btn listing-bulk__btn--confirm', {
              'listing-bulk__btn--disabled': !getFieldValue('discountCheckbox') &&
                  !getFieldValue('availabilityCheckbox') && !getFieldValue('tenancyCheckbox'),
            }) }
            disabled={ !getFieldValue('discountCheckbox') && !getFieldValue('availabilityCheckbox') && !getFieldValue('tenancyCheckbox') }
          >
            { this.props.t('cms.properties.edit.rooms.button_save') }
          </button>
        </div>
      </Form>
    );
  }
}

BulkModal.propTypes = {
  billingCycle: PropTypes.string,
  onClose: PropTypes.func,
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  bulkUpdateListings: PropTypes.func,
  selectedListingIds: PropTypes.array,
  isPublished: PropTypes.bool,
  selectedListings: PropTypes.array,
  refreshBulkListing: PropTypes.func,
};

BulkModal.defaultProps = {
  t: () => {},
  onClose: () => {},
  billingCycle: '',
  roomData: {},
  selectedListingIds: [],
  bulkUpdateListings: () => {},
  isPublished: false,
  selectedListings: [],
  refreshBulkListing: () => {},
};

export default Form.create({ name: 'listingBulk' })(BulkModal);
