import PropTypes from 'prop-types'
import React from 'react'
import classNames from 'classnames'
import { Form, Row, Col, Input, Select, InputNumber } from 'antd'
import MyMap from '~components/my-map'
import updatePayloadDetails from '~helpers/location'
import TagTextArea from '~components/tag-text-area'
import { locationType } from '~constants'

class DetailsForm extends React.Component {
  constructor() {
    super()

    this.latitude = 0
    this.longitude = 0
  }

  getLocationInitialValue = () => {
    if (this.props.type === 'City') {
      return this.props.data && this.props.data.country ? this.props.data.country.name : ''
    }
    return this.props.data && this.props.data.city ? this.props.data.city.name : ''
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { t } = this.props

    if (this.latitude === 0 && this.longitude === 0 && this.props.data) {
      this.latitude = this.props.data.latitude
      this.longitude = this.props.data.longitude
    }

    return (
      <div
        className={classNames('details-form', this.props.className, {
          'details-form--city': this.props.type === 'City',
          'details-form--area': this.props.type === 'Area',
          'details-form--university': this.props.type === 'University',
        })}
      >
        <Form className="details-form__form">
          <Row gutter={100}>
            <Col span={12}>
              <Form.Item>
                <label className="details-form__label">
                  <span className="details-form__label--required">*&nbsp;</span>
                  {this.props.t('cms.edit.details.label.name', {
                    type: this.props.type,
                  })}
                </label>
                {getFieldDecorator('name', {
                  rules: [
                    {
                      required: true,
                      message: this.props.t('cms.properties.edit.error.blank'),
                    },
                  ],
                  initialValue: this.props.data ? this.props.data.name : '',
                  validateTrigger: 'onBlur',
                })(<Input className="details-form__name-input" />)}
              </Form.Item>

              <Form.Item>
                <label className="details-form__label details-form__label--disabled">
                  {this.props.t('cms.edit.details.label.slug', {
                    type: this.props.type,
                  })}
                </label>
                {getFieldDecorator('slug', {
                  initialValue: this.props.data ? this.props.data.slug : '',
                })(<Input className="details-form__slug-input" disabled />)}
              </Form.Item>

              <Form.Item>
                <label className="details-form__label details-form__label--disabled">
                  {this.props.t(
                    `cms.edit.details.label.${this.props.type === 'City' ? 'country' : 'city'}`,
                  )}
                </label>
                {getFieldDecorator('location', {
                  initialValue: this.getLocationInitialValue(),
                })(<Select className="details-form__select-location" disabled />)}
              </Form.Item>

              <Form.Item>
                <label className="details-form__label">
                  <span className="details-form__label--required">*&nbsp;</span>
                  {this.props.t('cms.edit.details.label.rank')}
                </label>
                {getFieldDecorator('rank', {
                  rules: [
                    { required: true, message: this.props.t('cms.properties.edit.error.blank') },
                  ],
                  initialValue: this.props.data ? Number(this.props.data.rank) : 0,
                  validateTrigger: 'onBlur',
                })(
                  <InputNumber
                    className="details-form__rank-input"
                    min={0}
                    max={1000}
                    placeholder="0~1000"
                  />,
                )}
              </Form.Item>

              <If condition={this.props.type === 'University'}>
                <label className="details-form__label">
                  {t('cms.location.table.university.details.common_names')}
                </label>
                <Form.Item>
                  {getFieldDecorator('commonNames', {
                    trigger: 'onChange',
                  })(
                    <TagTextArea
                      contentList={
                        this.props.data && this.props.data.commonNames
                          ? this.props.data.commonNames
                          : []
                      }
                      t={t}
                      countLimit={10}
                      tagLengthLimit={100}
                      placeholder={t(
                        'cms.location.table.university.details.common_names.placeholder',
                      )}
                      errorMessage={t('cms.edit.details.common_name.duplicated_message')}
                    />,
                  )}
                </Form.Item>
              </If>
            </Col>
            <Col span={12}>
              <If condition={this.props.type !== locationType.AREA_TYPE}>
                <div>
                  {getFieldDecorator('coordinates', {
                    initialValue: {
                      value: {
                        lat: this.latitude,
                        lng: this.longitude,
                      },
                      action: 'default',
                    },
                    trigger: 'onChange',
                  })(
                    <MyMap
                      t={this.props.t}
                      lastSearched={{
                        lat: this.props.data ? this.props.data.latitude : 0,
                        lng: this.props.data ? this.props.data.longitude : 0,
                      }}
                      form={this.props.form}
                      zoom={this.props.type === locationType.CITY_TYPE ? 8 : 14}
                      disabled={this.props.type === locationType.CITY_TYPE}
                      hiddenLabel={this.props.type === locationType.CITY_TYPE}
                      countryName={
                        this.props.data && this.props.data.country
                          ? this.props.data.country.name
                          : ''
                      }
                      cityName={
                        this.props.data && this.props.data.city ? this.props.data.city.name : ''
                      }
                    />,
                  )}
                </div>
              </If>
              <If condition={this.props.type === locationType.UNIVERSITY_TYPE}>
                <Form.Item>
                  <label className="details-form__label">
                    {t('cms.location.table.add_new.street_address')}
                  </label>
                  {getFieldDecorator('address', {
                    rules: [
                      {
                        required: true,
                        message: t('cms.properties.edit.error.blank'),
                      },
                    ],
                    initialValue: this.props.data && this.props.data.address,
                    trigger: 'onChange',
                  })(<Input className="details-form__name-input" />)}
                </Form.Item>
                <Form.Item>
                  <label className="details-form__label">
                    {t('cms.location.table.add_new.zip_code')}
                  </label>
                  {getFieldDecorator('zipCode', {
                    rules: [
                      {
                        required: true,
                        message: t('cms.properties.edit.error.blank'),
                      },
                    ],
                    initialValue: this.props.data && this.props.data.zipCode,
                    trigger: 'onChange',
                  })(<Input className="details-form__name-input" />)}
                </Form.Item>
              </If>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}

DetailsForm.propTypes = {
  t: PropTypes.func.isRequired,
  className: PropTypes.string,
  type: PropTypes.string,
  form: PropTypes.object.isRequired,
  data: PropTypes.object,
}

DetailsForm.defaultProps = {
  t: () => {},
  className: '',
  type: 'University',
  data: null,
}

export default Form.create({
  name: 'details_form',
  onFieldsChange: (props, changedFields) => {
    let fields = changedFields
    if (Object.keys(changedFields).includes('rank')) {
      fields.rank.value = Number(changedFields.rank.value)
    }

    if (Object.keys(changedFields).includes('coordinates')) {
      const coordinates = changedFields.coordinates
      if (!coordinates.value || !coordinates.value.value) {
        return false
      }
      delete fields.coordinates
      fields = Object.assign({}, fields, {
        latitude: {
          value: coordinates.value.value.lat,
          errors:
            coordinates.value.value.lat === 0 &&
            coordinates.value.value.lng === 0 &&
            coordinates.value.action === 'default'
              ? 'error'
              : null,
          touched: true,
          name: 'latitude',
          dirty: coordinates.dirty,
        },
        longitude: {
          value: coordinates.value.value.lng,
          errors:
            coordinates.value.value.lat === 0 &&
            coordinates.value.value.lng === 0 &&
            coordinates.value.action === 'default'
              ? 'error'
              : null,
          touched: true,
          name: 'longitude',
          dirty: coordinates.dirty,
        },
      })
    }

    const result = updatePayloadDetails(props.data, props.type, fields, 'details')
    if (result) {
      props.setTabStatus(result)
    }

    return true
  },
})(DetailsForm)
