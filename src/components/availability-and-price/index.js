import React from 'react'
import PropTypes from 'prop-types'
import { Select, InputNumber, Form, Row, Col } from 'antd'
import { useTranslation } from 'react-i18next'
import useAvailabilityAndPrice from '~components/availability-and-price/useAvailabilityAndPrice'

const Option = Select.Option

const AvailabilityAndPrice = ({ form, currency, showPlaceHolder, isLongtail }) => {
  const { t } = useTranslation()
  const {
    handlePriceMinChange,
    handlePriceTypeChange,
    handleDiscountTypeChange,
    handleCurrentPriceChange,
    discountValueParameter,
  } = useAvailabilityAndPrice({ form, showPlaceHolder })

  let availabilityContainer = null
  let priceTypeContainer = null
  let discountTypeContainer = null

  const { getFieldDecorator, getFieldValue } = form

  return (
    <div className="listing-modal__availability-and-prices-container">
      <h4 className="listing-modal__title isting-modal__title--availability-and-prices">
        {t('cms.listing.modal.availability_and_price.title')}
      </h4>
      <div className="listing-modal__availability-and-prices-input-container">
        {/* Availability & Price type */}
        <div className="listing-modal__row-container">
          <Row gutter={9}>
            <Col span={12}>
              <div className="listing-modal__column-container">
                <label className="listing-modal__label">
                  {t('cms.listing.modal.availability.label')}
                </label>
                <Form.Item>
                  <div
                    ref={node => {
                      availabilityContainer = node
                    }}
                  >
                    {getFieldDecorator('availability', {
                      rules: [
                        {
                          required: true,
                          message: t('cms.listing.modal.error_message.can_not_empty'),
                        },
                      ],
                    })(
                      <Select
                        style={{ width: '100%', height: '32px', borderRadius: '2px' }}
                        getPopupContainer={() => availabilityContainer}
                        placeholder="Select availability"
                        disabled={showPlaceHolder}
                      >
                        <Option key="good" value="GOOD">
                          {t('cms.listing.modal.availability.option.good')}
                        </Option>
                        <Option key="limited" value="LIMITED">
                          {t('cms.listing.modal.availability.option.limited')}
                        </Option>
                        <Option key="sold_out" value="SOLD_OUT">
                          {t('cms.listing.modal.availability.option.sold_out')}
                        </Option>
                      </Select>,
                    )}
                  </div>
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="listing-modal__column-container">
                <label className="listing-modal__label listing-modal__label--required">
                  {t('cms.listing.modal.price_type.label')}
                </label>
                <Form.Item>
                  <div
                    ref={node => {
                      priceTypeContainer = node
                    }}
                  >
                    {getFieldDecorator('priceType', {
                      rules: [
                        {
                          required: !showPlaceHolder,
                          message: t('cms.listing.modal.error_message.can_not_empty'),
                        },
                      ],
                    })(
                      <Select
                        style={{ width: '100%', height: '32px', borderRadius: '2px' }}
                        onChange={handlePriceTypeChange}
                        getPopupContainer={() => priceTypeContainer}
                        placeholder={t('cms.listing.modal.price_type.placeHolder')}
                        disabled={showPlaceHolder || isLongtail}
                      >
                        <Option key="exact" value="exact">
                          {t('cms.listing.modal.price_type.option.exact')}
                        </Option>
                        <Option key="range" value="range">
                          {t('cms.listing.modal.price_type.option.range')}
                        </Option>
                      </Select>,
                    )}
                  </div>
                </Form.Item>
              </div>
            </Col>
          </Row>
        </div>

        {/* Price min (GBP) & Price max (GBP) */}
        <div className="listing-modal__row-container">
          <Row gutter={9}>
            <Col span={12}>
              <div className="listing-modal__column-container">
                <label className="listing-modal__label listing-modal__label--required">
                  {t('cms.listing.modal.price_min.label')}
                  <span className="listing-modal__label-currency"> ({currency})</span>
                </label>
                <div className="listing-modal__price-input-container">
                  <Form.Item>
                    {getFieldDecorator('priceMin', {
                      rules: [
                        {
                          required: !showPlaceHolder,
                          message: t('cms.listing.modal.error_message.can_not_empty'),
                        },
                      ],
                    })(
                      <InputNumber
                        min={0}
                        precision={2}
                        onChange={handlePriceMinChange}
                        placeholder={t('cms.listing.modal.price_min.place_holder')}
                        disabled={showPlaceHolder}
                      />,
                    )}
                  </Form.Item>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="listing-modal__column-container">
                <label className="listing-modal__label">
                  {t('cms.listing.modal.price_max.label')}
                  <span className="listing-modal__label-currency"> ({currency})</span>
                </label>
                <div className="listing-modal__price-input-container">
                  <Form.Item>
                    {getFieldDecorator(
                      'priceMax',
                      {},
                    )(
                      <InputNumber
                        min={form.getFieldValue('priceMin') || 0}
                        precision={2}
                        disabled={
                          !getFieldValue('priceMin') ||
                          getFieldValue('priceType') !== 'range' ||
                          showPlaceHolder
                        }
                        placeholder={t('cms.listing.modal.price_max.place_holder')}
                      />,
                    )}
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Discount type & Discount value */}
        <div className="listing-modal__row-container">
          <Row gutter={9}>
            <Col span={12}>
              <div className="listing-modal__column-container">
                <label className="listing-modal__label listing-modal__label--required">
                  {t('cms.listing.modal.discount_type.label')}
                </label>
                <Form.Item>
                  <div
                    ref={node => {
                      discountTypeContainer = node
                    }}
                  >
                    {getFieldDecorator('discountType', {
                      rules: [
                        {
                          required: !showPlaceHolder,
                          message: t('cms.listing.modal.error_message.can_not_empty'),
                        },
                      ],
                    })(
                      <Select
                        style={{ width: '100%', height: '32px', borderRadius: '2px' }}
                        getPopupContainer={() => discountTypeContainer}
                        onSelect={handleDiscountTypeChange}
                        placeholder={t('cms.listing.modal.discount_type.place_holder')}
                        disabled={!getFieldValue('priceMin') || showPlaceHolder}
                      >
                        <Option key="NO_DISCOUNT" value="NO_DISCOUNT">
                          {t('cms.listing.modal.discount_type.options.no_discount')}
                        </Option>
                        <Option key="PERCENTAGE" value="PERCENTAGE">
                          {t('cms.listing.modal.discount_type.options.percentage')}
                        </Option>
                        <Option key="ABSOLUTE" value="ABSOLUTE">
                          {t('cms.listing.modal.discount_type.options.fixed_amount')}
                        </Option>
                      </Select>,
                    )}
                  </div>
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div className="listing-modal__column-container">
                <label className="listing-modal__label">
                  {t('cms.listing.modal.discount_value.label')}
                </label>
                <div className="listing-modal__price-input-container">
                  <Form.Item>
                    {getFieldDecorator('discountValue', {
                      rules: [
                        {
                          required:
                            !showPlaceHolder && getFieldValue('discountType') !== 'NO_DISCOUNT',
                          message: t('cms.listing.modal.error_message.can_not_empty'),
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (!showPlaceHolder && getFieldValue('discountType') === 'ABSOLUTE') {
                              if (getFieldValue('priceMin') < getFieldValue('discountValue')) {
                                callback('error')
                              } else {
                                callback()
                              }
                            } else {
                              callback()
                            }
                          },
                          message: t(
                            'cms.listing.modal.error_message.discount_vale_bigger_than_price_min',
                          ),
                        },
                      ],
                    })(<InputNumber {...discountValueParameter} />)}
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Original price (GBP) & Current price (GBP) */}
        <div className="listing-modal__row-container">
          <Row gutter={9}>
            <Col span={12}>
              <div className="listing-modal__column-container">
                <label className="listing-modal__label">
                  {t('cms.listing.modal.original_price.label')}
                  <span className="listing-modal__label-currency"> ({currency})</span>
                </label>
                <div className="listing-modal__price-input-container">
                  <Form.Item>
                    {getFieldDecorator(
                      'originPrice',
                      {},
                    )(<InputNumber min={0} disabled precision={2} />)}
                  </Form.Item>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="listing-modal__column-container">
                <label className="listing-modal__label">
                  {t('cms.listing.modal.current_price.label')}
                  <span className="listing-modal__label-currency"> ({currency})</span>
                </label>
                <div className="listing-modal__price-input-container">
                  <Form.Item>
                    {getFieldDecorator(
                      'currentPrice',
                      {},
                    )(
                      <InputNumber
                        min={0}
                        max={getFieldValue('priceMin')}
                        disabled
                        precision={2}
                        onChange={handleCurrentPriceChange}
                      />,
                    )}
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

AvailabilityAndPrice.propTypes = {
  form: PropTypes.shape({
    validateFields: PropTypes.func.isRequired,
    resetFields: PropTypes.func.isRequired,
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
  }).isRequired,
  currency: PropTypes.string.isRequired,
  showPlaceHolder: PropTypes.bool,
  isLongtail: PropTypes.bool,
}

AvailabilityAndPrice.defaultProps = {
  showPlaceHolder: false,
  isLongtail: false,
}

export default AvailabilityAndPrice
