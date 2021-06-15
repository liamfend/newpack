import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import {
  locales,
  operateType,
  offerTypes,
  tenancyUnitTypes,
  offerType,
  platformEntity,
  entityAction,
} from '~constants'
import update from 'immutability-helper'
import moment from 'moment'
import { Form, Input, Card, Row, Col, Checkbox, Divider, Select, InputNumber, Button } from 'antd'
import ReactQuill from '~components/react-quill'

import showElementByAuth from '~helpers/auth'

const FormItem = Form.Item
const { TextArea } = Input
const Option = Select.Option
const discount = offerType.DISCOUNT

@withTranslation()
class Content extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  onContinue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let formValue = values
        const amount = this.formatAmount(values)
        formValue = update(formValue, {
          $merge: {
            startDate: moment().format('YYYY-MM-DD'),
            endDate: null,
            ownerType: 'INTERNAL',
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

  chooseAll = () => {
    this.props.form.setFieldsValue({
      locales,
    })
  }

  clearAll = () => {
    this.props.form.setFieldsValue({
      locales: [],
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

  render() {
    const { getFieldDecorator } = this.props.form
    const localeOptions = locales.map(item => ({
      value: item,
      label: item,
    }))
    const inputNumberOps = {
      formatter: this.formatDiscount,
      parser: this.parserDiscount,
    }
    if (this.props.form.getFieldValue('offerType') === discount) {
      inputNumberOps.max = 100
      inputNumberOps.min = 0
    }

    return (
      <div>
        <Card className="create-offer__card">
          <Form onSubmit={this.handleSubmit} layout="vertical">
            <Col span={12} style={{ paddingRight: 50 }}>
              <FormItem label={this.props.t('cms.special_offer.form.offer_title')}>
                {getFieldDecorator('internalTitle', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.internalTitle || null,
                  rules: [
                    {
                      required: true,
                      message: this.props.t('cms.special_offer.error.form.offer_title'),
                    },
                  ],
                })(<Input placeholder={this.props.t('cms.special_offer.form.placeholder')} />)}
              </FormItem>
              <FormItem label={this.props.t('cms.special_offer.form.notes')}>
                {getFieldDecorator('notes', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.notes || null,
                  rules: [{ message: this.props.t('cms.special_offer.error.form.notes') }],
                })(<Input placeholder={this.props.t('cms.special_offer.form.placeholder')} />)}
              </FormItem>
              <FormItem label={this.props.t('cms.special_offer.form.instructions')}>
                {getFieldDecorator('fulfillmentInstructions', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.fulfillmentInstructions || null,
                  rules: [{ message: this.props.t('cms.special_offer.error.form.instructions') }],
                })(
                  <TextArea
                    placeholder={this.props.t('cms.special_offer.form.placeholder')}
                    autosize={{ minRows: 2, maxRows: 6 }}
                  />,
                )}
              </FormItem>
              <FormItem label={this.props.t('cms.special_offer.form.title')}>
                {getFieldDecorator('title', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.title || null,
                  rules: [
                    { required: true, message: this.props.t('cms.special_offer.error.form.title') },
                  ],
                })(<Input placeholder={this.props.t('cms.special_offer.form.placeholder')} />)}
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
                  <ReactQuill
                    placeholder={this.props.t('cms.special_offer.form.placeholder')}
                    fontTypes={[3, false]}
                  />,
                )}
              </FormItem>
              <Row>
                <span className="create-offer__label">
                  {this.props.t('cms.special_offer.form.required_tenancy_length')}
                </span>
                <Col span={12}>
                  <FormItem style={{ paddingRight: 8 }}>
                    {getFieldDecorator('minTenancyValue', {
                      validateTrigger: 'onBlur',
                      initialValue: this.props.offerInfo.minTenancyValue || null,
                    })(
                      <InputNumber
                        min={1}
                        max={999999}
                        precision={0}
                        placeholder={this.props.t(
                          'cms.special_offer.form.tenancy_length.placeholder',
                        )}
                      />,
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem style={{ paddingLeft: 8 }}>
                    {getFieldDecorator('tenancyUnit', {
                      validateTrigger: 'onBlur',
                      initialValue: this.props.offerInfo.tenancyUnit || 'WEEK',
                    })(
                      <Select>
                        <For each="d" of={tenancyUnitTypes}>
                          <Option key={d} value={d}>
                            {this.props.t(`cms.special_offer.form.unit.select.${d.toLowerCase()}`)}
                          </Option>
                        </For>
                      </Select>,
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={12} style={{ paddingLeft: 50 }}>
              <Row>
                <Col span={12}>
                  <FormItem
                    label={this.props.t('cms.special_offer.form.type')}
                    style={{ paddingRight: 8 }}
                  >
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
                      <Select>
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
                  <FormItem
                    label={this.props.t('cms.special_offer.form.amount')}
                    style={{ paddingLeft: 8 }}
                  >
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
              <FormItem label={this.props.t('cms.special_offer.form.link')}>
                {getFieldDecorator('link', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.link || null,
                })(<Input placeholder={this.props.t('cms.special_offer.form.placeholder')} />)}
              </FormItem>
              <FormItem label={this.props.t('cms.special_offer.form.condition')}>
                {getFieldDecorator('termsAndConditions', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.termsAndConditions || null,
                })(
                  <TextArea
                    placeholder={this.props.t('cms.special_offer.form.placeholder')}
                    autosize={{ minRows: 2, maxRows: 6 }}
                  />,
                )}
              </FormItem>
              <FormItem label={this.props.t('cms.special_offer.form.language')}>
                {getFieldDecorator('locales', {
                  initialValue: this.props.offerInfo.locales,
                  rules: [{ required: true, message: this.props.t('cms.form.error.locales') }],
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
              <FormItem label={this.props.t('cms.special_offer.form.referral_code')}>
                {getFieldDecorator('referralCode', {
                  validateTrigger: 'onBlur',
                  initialValue: this.props.offerInfo.referralCode || null,
                })(<Input placeholder={this.props.t('cms.special_offer.form.placeholder')} />)}
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
  createSpecialOffer: PropTypes.func.isRequired,
  offerInfo: PropTypes.object.isRequired,
  operateType: PropTypes.string.isRequired,
  updateSpecialOffer: PropTypes.func,
  isBack: PropTypes.number.isRequired,
}

Content.defaultProps = {
  t: () => {},
  operateType: '',
  form: {
    getFieldDecorator: () => {},
    getFieldValue: () => {},
    validateFields: () => {},
    setFieldsValue: () => {},
  },
  offerInfo: {},
  updateSpecialOffer: () => {},
  createSpecialOffer: () => {},
}
