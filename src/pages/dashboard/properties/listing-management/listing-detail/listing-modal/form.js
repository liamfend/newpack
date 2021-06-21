import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Switch, Icon, DatePicker, Radio, Form, Tooltip, Row, Col, Checkbox } from 'antd';
import TenancyDetails from '~components/tenancy-details';
import AvailabilityAndPrice from '~components/availability-and-price';
import { isLandlordRole } from '~helpers/auth';
import useListingModal from '~pages/dashboard/properties/listing-management/listing-detail/listing-modal/useListingModal';

const RadioGroup = Radio.Group;

const ListingForm = ({ listing, form, property, roomData, type }) => {
  const { t } = useTranslation();
  const { getFieldDecorator, getFieldValue } = form;
  const { landlord } = property;
  let liveOnContainer = null;
  let liveUntilContainer = null;

  const {
    disabledStartDate,
    disabledEndDate,
    handlePlaceHolderChange,
    liveUntilChange,
  } = useListingModal({ form, listing });

  return (
    <div>
      <Form layout="inline">
        <div className="listing-form-modal__container">
          <div className="listing-form-modal__content-container">
            <h4 className="listing-form-modal__type-title">
              { t(`cms.properties.edit.rooms.listing_modal.${type}`) }
              <span className="listing-form-modal__line" />
              { roomData && roomData.name }
            </h4>
            <div className={ classNames('listing-form-modal__placeholder-container', {
              'listing-form-modal__placeholder-container--hidden': get(landlord, 'bookingJourney') === 'SEMI_AUTOMATIC',
            }) }
            >
              <span className="listing-form-modal__placeholder">{ t('cms.listing.modal.place_holder.label') }</span>
              <Form.Item className="listing-form-modal__place-holder-item">
                { getFieldDecorator('placeHolder', {
                  valuePropName: 'checked',
                })(
                  <Switch checkedChildren={ <Icon type="check" /> } onClick={ handlePlaceHolderChange } />,
                )}
              </Form.Item>
            </div>

            {/* Tenancy Details */}
            <TenancyDetails
              form={ form }
              billingCycle={ property.billingCycle }
              listing={ listing }
              showPlaceHolder={ getFieldValue('placeHolder') }
              t={ t }
            />

            {/* Availability and Price */}
            <AvailabilityAndPrice
              form={ form }
              currency={ property.currency }
              showPlaceHolder={ getFieldValue('placeHolder') }
              isLongtail={ get(landlord, 'bookingJourney') === 'SEMI_AUTOMATIC' }
            />

            {/* General Setting */}
            <div className="listing-form-modal__general-setting">
              <h4 className="listing-form-modal__title listing-form-modal__title--general-setting">
                { t('cms.listing.modal.general_setting.label') }
              </h4>

              {/* Live on & Live until */}
              <div className="listing-form-modal__row-container" >
                <Row gutter={ 9 }>
                  <Col span={ 12 }>
                    <div className="listing-form-modal__column-container">
                      <label className="listing-form-modal__label listing-form-modal__label--required">
                        { t('cms.listing.modal.live_on.label') }
                        <Tooltip
                          overlayStyle={ { minWidth: 300 } }
                          title={ t('cms.listing.modal.live_on.label.tips') }
                        >
                          <Icon type="question-circle" className="rooms-tab__tips-icon" />
                        </Tooltip>
                      </label>
                      <Form.Item>
                        <div ref={ (node) => { liveOnContainer = node; } }>
                          { getFieldDecorator('liveOn', {
                            rules: [{ required: true, message: t('cms.listing.modal.error_message.can_not_empty') }],
                          })(
                            <DatePicker
                              style={ { width: '100%', height: '32px', borderRadius: '2px' } }
                              getCalendarContainer={ () => liveOnContainer }
                              format="ll"
                              disabledDate={
                                startValue => disabledStartDate(startValue, form.getFieldValue('liveUntil'))
                              }
                            />,
                          )}
                        </div>
                      </Form.Item>
                    </div>
                  </Col>

                  <Col span={ 12 }>
                    <div className="listing-form-modal__column-container" >
                      <label className="listing-form-modal__label listing-form-modal__label--required">
                        { t('cms.listing.modal.live_until.label') }
                        <Tooltip
                          overlayStyle={ { minWidth: 300 } }
                          title={ t('cms.listing.modal.live_until.label.tips') }
                        >
                          <Icon type="question-circle" className="rooms-tab__tips-icon" />
                        </Tooltip>
                        <div className="listing-form-modal__open-end">
                          <div className="listing-form-modal__open-end-checkbox">
                            <Form.Item>
                              { getFieldDecorator('openEnd', { valuePropName: 'checked' })(
                                <Checkbox />,
                              )}
                            </Form.Item>
                          </div>
                          <span className="listing-form-modal__open-end-text">
                            {t('cms.listing.modal.live_until.open_end')}
                          </span>
                        </div>
                      </label>
                      <Form.Item>
                        <div ref={ (node) => { liveUntilContainer = node; } }>
                          { getFieldDecorator('liveUntil', {
                            rules: [{
                              required: !getFieldValue('openEnd'),
                              message: t('cms.listing.modal.error_message.can_not_empty') }],
                          })(
                            <DatePicker
                              style={ { width: '100%', height: '32px', borderRadius: '2px' } }
                              getCalendarContainer={ () => liveUntilContainer }
                              format="ll"
                              disabledDate={
                                endValue => disabledEndDate(getFieldValue('liveOn'), endValue)
                              }
                              disabled={ getFieldValue('openEnd') }
                              placeholder={ getFieldValue('openEnd') ? '' : t('cms.listing.modal.live_until.placeholder') }
                              onChange={ liveUntilChange }
                            />,
                          )}
                        </div>
                      </Form.Item>
                    </div>
                  </Col>
                </Row>
              </div>

              <If condition={ !isLandlordRole() }>
                {/* Auto Price & Auto availability */}
                <div className="listing-form-modal__row-container listing-form-modal__row-container--last">
                  <Row gutter={ 9 }>
                    <Col span={ 12 }>
                      <div className="listing-form-modal__column-container">
                        <label className="listing-form-modal__label">{ t('cms.listing.modal.auto_price.label') }</label>
                        <Form.Item>
                          { getFieldDecorator('autoPriceAllowed', {
                            initialValue: false,
                          })(
                            <RadioGroup>
                              <Radio value>{ t('cms.listing.modal.option.yes') }</Radio>
                              <Radio value={ false }>{ t('cms.listing.modal.option.no') }</Radio>
                            </RadioGroup>,
                          )}
                        </Form.Item>
                      </div>
                    </Col>

                    <Col span={ 12 }>
                      <div className="listing-form-modal__column-container">
                        <label className="listing-form-modal__label">{ t('cms.listing.modal.auto_availability.label') }</label>
                        <Form.Item>
                          { getFieldDecorator('autoAvailAllowed', {
                            initialValue: false,
                          })(
                            <RadioGroup>
                              <Radio value>{ t('cms.listing.modal.option.yes') }</Radio>
                              <Radio value={ false }>{ t('cms.listing.modal.option.no') }</Radio>
                            </RadioGroup>,
                          )}
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </div>
              </If>

            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

ListingForm.propTypes = {
  form: PropTypes.shape({
    validateFields: PropTypes.func.isRequired,
    resetFields: PropTypes.func.isRequired,
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
    validateFieldsAndScroll: PropTypes.func.isRequired,
  }).isRequired,
  listing: PropTypes.object,
  roomData: PropTypes.object,
  property: PropTypes.object,
  type: PropTypes.string,
};

ListingForm.defaultProps = {
  listing: null,
  onChooseNextListing: () => {},
  setListingsDataChanged: () => {},
  roomData: {},
  property: {},
  type: 'create',
};

export default ListingForm;
