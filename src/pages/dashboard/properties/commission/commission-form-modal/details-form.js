import React from 'react';
import PropTypes from 'prop-types';
import { trim } from 'lodash';
import { Select, Form, Input, Row, Col, Radio, DatePicker, InputNumber } from 'antd';
import { allCommissionCategories, commissionCategories } from '~constants/commission';

export default class DetailsForm extends React.Component {
  constructor(props) {
    super(props);
    this.commissionType = ['PERCENTAGE', 'VALUE'];
  }

  disabledEndDate = (endValue) => {
    const startValue = this.props.form.getFieldValue('effectiveFrom');
    if (!endValue || !startValue) {
      return false;
    }

    return endValue.valueOf() <= startValue.valueOf();
  }

  isErrEndDate = () => {
    const startValue = this.props.form.getFieldValue('effectiveFrom');
    const endValue = this.props.form.getFieldValue('effectiveTo');

    if (startValue && endValue) {
      return startValue.valueOf() > endValue.valueOf();
    }
    return false;
  };

  render() {
    const { t, property } = this.props;
    const { getFieldDecorator, getFieldValue, resetFields } = this.props.form;
    const commissionCategory = getFieldValue('category');

    return (
      <div>
        <h3 className="commission-from__form-title">
          <div className="commission-from__title-block" />
          { t('cms.property.commission_form_modal.details') }
        </h3>
        <Row gutter={ 9 }>
          <Col span={ 12 }>
            <Form.Item>
              <span
                ref={ (node) => { this.selectCategory = node; } }
                className="commission-from__label commission-from__label--required"
              >
                { t('cms.property.commission_form_modal.commission_category.lable') }
              </span>
              { getFieldDecorator('category', {
                rules: [
                  {
                    required: true,
                    message: t('cms.property.commission.not_be_empty.err'),
                  },
                ],
                trigger: 'onChange',
              })(
                <Select
                  style={ { width: 388 } }
                  getPopupContainer={ () => this.selectCategory }
                  placeholder={ t('cms.property.commission_form_modal.commission_type.placeholder') }
                >
                  <For of={ commissionCategories } each="type">
                    <Select.Option
                      style={ { width: 388 } }
                      key={ type }
                      value={ type }
                    >
                      { t(`cms.property.commission_form_modal.commission_category.select.${type.toLowerCase()}`) }
                    </Select.Option>
                  </For>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={ 12 }>
            <Form.Item>
              <span className="commission-from__label commission-from__label--radio">
                { t('cms.property.commission_form_modal.set_bonus_commission.lable') }
              </span>
              { getFieldDecorator('bonus', {
                rules: [
                  {
                    required: true,
                    message: t('cms.property.commission.not_be_empty.err'),
                  },
                ],
                trigger: 'onChange',
              })(
                <Radio.Group name="radiogroup">
                  <Radio value>{ t('cms.form.value.yes') }</Radio>
                  <Radio value={ false }>{ t('cms.form.value.no') }</Radio>
                </Radio.Group>,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <span className="commission-from__label commission-from__label--required">
            { t('cms.property.commission_form_modal.commission_name.lable') }
          </span>
          { getFieldDecorator('name', {
            rules: [
              { transform: value => trim(value) },
              { required: true, message: t('cms.property.commission.not_be_empty.err') },
              { max: 80, message: t('cms.property.commission.not_be_empty.characters_err') },
              {
                validator: (rule, value, callback) => {
                  const emojiRegex = new RegExp(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g);
                  if (value && emojiRegex.test(value)) {
                    callback('error');
                  }
                  callback();
                },
                message: t('cms.property.commission_form_modal.commission_name.error_emoji'),
              },
            ],
            trigger: 'onChange',
          })(
            <Input
              style={ { maxWidth: 800 } }
              placeholder={ t('cms.property.commission_form_modal.commission_name.placeholder') }
            />,
          )}
        </Form.Item>
        <Row gutter={ 11 }>
          <Col span={ 12 }>
            <Form.Item>
              <span
                ref={ (node) => { this.selectType = node; } }
                className="commission-from__label commission-from__label--required"
              >
                { t('cms.property.commission_form_modal.commission_type.lable') }
              </span>
              { getFieldDecorator('type', {
                rules: [
                  {
                    required: true,
                    message: t('cms.property.commission.not_be_empty.err'),
                  },
                ],
                trigger: 'onChange',
              })(
                <Select
                  style={ { width: 388 } }
                  onSelect={ () => { resetFields(['value']); } }
                  getPopupContainer={ () => this.selectType }
                  placeholder={ t('cms.property.commission_form_modal.commission_type.placeholder') }
                >
                  <For of={ this.commissionType } each="type">
                    <Select.Option
                      key={ type }
                      value={ type }
                      style={ { width: 388 } }
                    >
                      { t(`cms.property.commission_form_modal.commission_cap_type.select.${type.toLowerCase()}`) }
                    </Select.Option>
                  </For>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={ 12 }>
            <Row>
              <Col span={ 10 }>
                <Form.Item>
                  <span className="commission-from__label commission-from__label--required">
                    { t('cms.property.commission_form_modal.commission_value.lable') }
                    <If
                      condition={
                        getFieldValue('type') === 'VALUE'
                        && property.currency
                      }
                    >
                      <span className="commission-from__label--currency">
                        &nbsp;({ property.currency })
                      </span>
                    </If>
                  </span>
                  { getFieldDecorator('value', {
                    rules: [
                      {
                        required: true,
                        message: t('cms.property.commission.not_be_empty.err'),
                      },
                    ],
                    trigger: 'onChange',
                  })(
                    <InputNumber
                      min={ 0 }
                      max={ getFieldValue('type') === 'PERCENTAGE' ? 100 : 9999999999 }
                      precision={ 2 }
                      formatter={ value => (getFieldValue('type') === 'PERCENTAGE' ? `${value}%` : value) }
                      parser={ value => value.replace('%', '') }
                      style={ {
                        width:
                        commissionCategory !== allCommissionCategories.REBOOKERS_COMMISSION ?
                          185 : 388,
                      } }
                      placeholder={ t('cms.property.commission_form_modal.commission_value.placeholder') }
                    />
                    ,
                  )}
                </Form.Item>
              </Col>
              <If condition={ commissionCategory !== allCommissionCategories.REBOOKERS_COMMISSION }>
                <Col span={ 10 }>
                  <Form.Item>
                    <span className="commission-from__label">
                      { t('cms.property.commission_form_modal.converted_commission.lable') }
                    </span>
                    { getFieldDecorator('convertedCalculationValue', {
                      trigger: 'onChange',
                    })(
                      <InputNumber
                        min={ 0 }
                        precision={ 0 }
                        style={ { width: 185 } }
                        formatter={ value => `${value}%` }
                        parser={ value => value.replace('%', '') }
                        placeholder={ t('cms.property.commission_form_modal.converted_commission.placeholder') }
                      />,
                    )}
                  </Form.Item>
                </Col>
              </If>
            </Row>
          </Col>
        </Row>
        <Row gutter={ 9 }>
          <Col span={ 12 }>
            <Form.Item>
              <div ref={ (node) => { this.datePickerEffectiveFrom = node; } }>
                <span className="commission-from__label commission-from__label--required">
                  { t('cms.property.commission_form_modal.effective_from.lable') }
                </span>
                { getFieldDecorator('effectiveFrom', {
                  rules: [
                    {
                      required: true,
                      message: t('cms.property.commission.not_be_empty.date_err'),
                    },
                  ],
                  trigger: 'onChange',
                })(
                  <DatePicker
                    format="ll"
                    getCalendarContainer={ () => this.datePickerEffectiveFrom }
                    style={ { width: '100%', height: '32px', borderRadius: '2px' } }
                  />,
                )}
              </div>
            </Form.Item>
          </Col>
          <Col span={ 12 }>
            <Form.Item>
              <div ref={ (node) => { this.datePickerEffectiveTo = node; } }>
                <span className="commission-from__label">
                  { t('cms.property.commission_form_modal.effective_to.lable') }
                </span>
                { getFieldDecorator('effectiveTo', {
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (this.isErrEndDate()) {
                          callback('error');
                        }
                        callback();
                      },
                      message: t('cms.property.commission.not_be_empty.date_err'),
                    },
                  ],
                  trigger: 'onChange',
                })(
                  <DatePicker
                    format="ll"
                    disabledDate={ this.disabledEndDate }
                    getCalendarContainer={ () => this.datePickerEffectiveTo }
                    style={ { width: '100%', height: '32px', borderRadius: '2px' } }
                  />,
                )}
              </div>
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }
}

DetailsForm.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object,
  property: PropTypes.object,
};
DetailsForm.defaultProps = {
  t: () => {},
  form: {},
  property: {},
};
