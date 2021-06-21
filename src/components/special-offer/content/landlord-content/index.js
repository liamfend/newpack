import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import {
  locales,
  operateType,
  offerTypes,
  offerType,
  platformEntity,
  entityAction,
} from '~constants'
import update from 'immutability-helper'
import moment from 'moment'
import { Form, Input, Card, Row, Col, Checkbox, Divider, Select, InputNumber, Button } from 'antd'

import showElementByAuth from '~helpers/auth'

const discount = offerType.DISCOUNT
const FormItem = Form.Item
const { TextArea } = Input
const Option = Select.Option

@withTranslation()
class Content extends React.Component {
  onContinue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let formValue = values
        const amount = this.formatAmount(values)
        formValue = update(formValue, {
          $merge: {
            startDate: moment().format('YYYY-MM-DD'),
            endDate: null,
            ownerType: 'LANDLORD',
            internalTitle: '',
            amount,
          },
        })
        if (this.props.isBack) {
          formValue = update(formValue, {
            $merge: {
              id: this.props.offerInfo.id,
            },
          })
          this.props.updateSpecialOffer(formValue)
        } else {
          this.props.createSpecialOffer(formValue)
        }
      }
    })
  }

  chooseAll = () => {
    this.props.form.setFieldsValue({
      locales,
    })
  }

  formatDiscount = value => {
    if (this.props.form.getFieldValue('offerType') === discount && !value.toString().match('%')) {
      return `${value}%`
    } else if (
      this.props.form.getFieldValue('offerType') === discount &&
      value.toString().match('%')
    ) {
      return value
    }
    return value.toString().replace('%', '')
  }

  parserDiscount = value => value.toString().replace('%', '')

  formatAmount = values => {
    let amount = values.amount
    if (this.props.form.getFieldValue('offerType') !== discount) {
      amount = amount.replace('%', '')
    } else if (!amount.match('%')) {
      amount = `${amount}%`
    }
    return amount
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let formValue = values
        const amount = this.formatAmount(values)
        formValue = update(formValue, {
          $merge: {
            id: this.props.offerInfo.id,
            amount,
          },
        })
        this.props.updateSpecialOffer(formValue)
      }
    })
  }

  clearAll = () => {
    this.props.form.setFieldsValue({
      locales: [],
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const localeOptions = locales.map(item => ({
      value: item,
      label: item,
    }))
    const inputNumberOps = {
      formatter: this.formatDiscount,
      parser: this.parserDiscount,
      className: 'create-offer-content__short-input',
    }
    if (this.props.form.getFieldValue('offerType') === discount) {
      inputNumberOps.max = 100
      inputNumberOps.min = 0
    }

    return (
      <div>
        <Card className="create-offer__card">
          <Form onSubmit={this.handleSubmit} layout="vertical">
            <Col span={12}>
              <FormItem label={this.props.t('cms.special_offer.form.landlord_offer_title')}>
                {getFieldDecorator('title', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.title || null,
                  rules: [
                    { required: true, message: this.props.t('cms.special_offer.error.form.title') },
                  ],
                })(
                  <Input
                    placeholder={this.props.t('cms.special_offer.form.placeholder')}
                    className="create-offer-content__input"
                  />,
                )}
              </FormItem>
              <FormItem label={this.props.t('cms.special_offer.form.description')}>
                {getFieldDecorator('description', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.description || null,
                  rules: [
                    {
                      required: true,
                      message: this.props.t('cms.special_offer.error.form.description'),
                    },
                  ],
                })(
                  <TextArea
                    placeholder={this.props.t('cms.special_offer.form.placeholder')}
                    className="create-offer-content__input"
                    autosize={{ minRows: 2, maxRows: 6 }}
                  />,
                )}
              </FormItem>
              <Row>
                <Col span={12}>
                  <FormItem label={this.props.t('cms.special_offer.form.type')}>
                    {getFieldDecorator('offerType', {
                      validateTrigger: 'onBlur',
                      initialValue: this.props.offerInfo.offerType || null,
                      rules: [
                        {
                          required: true,
                          message: this.props.t('cms.form.error.classification_name'),
                        },
                      ],
                    })(
                      <Select className="create-offer-content__short-input">
                        <For each="d" of={offerTypes}>
                          <Option key={d} value={d}>
                            {d}
                          </Option>
                        </For>
                      </Select>,
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label={this.props.t('cms.special_offer.form.amount')}>
                    {getFieldDecorator('amount', {
                      validateTrigger: 'onBlur',
                      initialValue: this.props.offerInfo.amount || null,
                      rules: [
                        {
                          required: true,
                          message: this.props.t('cms.form.error.classification_name'),
                        },
                      ],
                    })(<InputNumber {...inputNumberOps} />)}
                  </FormItem>
                </Col>
              </Row>
              <FormItem label={this.props.t('cms.special_offer.form.condition')}>
                {getFieldDecorator('termsAndConditions', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.termsAndConditions || null,
                })(
                  <TextArea
                    placeholder={this.props.t('cms.special_offer.form.placeholder')}
                    className="create-offer-content__input"
                    autosize={{ minRows: 2, maxRows: 6 }}
                  />,
                )}
              </FormItem>
              <FormItem label={this.props.t('cms.special_offer.form.language')}>
                {getFieldDecorator('locales', {
                  initialValue: this.props.offerInfo.locales,
                  rules: [
                    { required: true, message: this.props.t('cms.form.error.classification_name') },
                  ],
                })(
                  <Checkbox.Group
                    className="create-offer-content__checkbox"
                    options={localeOptions}
                  />,
                )}
              </FormItem>
              <div className="create-offer-content__select-all">
                <a
                  tabIndex="0"
                  role="button"
                  onClick={this.chooseAll}
                  className="create-offer-content__text-underline"
                >
                  Select All
                </a>
                <Divider type="vertical" />
                <a
                  tabIndex="0"
                  role="button"
                  onClick={this.clearAll}
                  className="create-offer-content__text-underline"
                >
                  Clear All
                </a>
              </div>
            </Col>
            <Col span={12}>
              <FormItem label={this.props.t('cms.special_offer.form.referral_code')}>
                {getFieldDecorator('referralCode', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.referralCode || null,
                })(
                  <Input
                    placeholder={this.props.t('cms.special_offer.form.placeholder')}
                    className="create-offer-content__input"
                  />,
                )}
              </FormItem>
            </Col>
          </Form>
        </Card>
        <If
          condition={
            this.props.operateType === operateType.edit &&
            showElementByAuth(platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS, entityAction.UPDATE)
          }
        >
          <Button
            type="primary"
            className="create-offer-content__continue-btn"
            onClick={this.onSubmit}
          >
            {this.props.t('cms.sepcial_offer.submit.btn')}
          </Button>
        </If>
        <If
          condition={
            this.props.operateType === operateType.add &&
            showElementByAuth(platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS, entityAction.CREATE)
          }
        >
          <Button
            type="primary"
            className="create-offer-content__continue-save-btn"
            onClick={this.onContinue}
          >
            {this.props.t('cms.sepcial_offer.save_continue.btn')}
          </Button>
        </If>
      </div>
    )
  }
}

const ContentForm = Form.create()(Content)

export default ContentForm
Content.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    validateFields: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
  }),
  operateType: PropTypes.string.isRequired,
  createSpecialOffer: PropTypes.func.isRequired,
  offerInfo: PropTypes.object.isRequired,
  updateSpecialOffer: PropTypes.func.isRequired,
  isBack: PropTypes.string.isRequired,
}

Content.defaultProps = {
  t: () => {},
  form: {
    getFieldDecorator: () => {},
    getFieldValue: () => {},
    validateFields: () => {},
    setFieldsValue: () => {},
  },
  operateType: '',
  offerInfo: {},
  isBack: '',
  createSpecialOffer: () => {},
  updateSpecialOffer: () => {},
}
