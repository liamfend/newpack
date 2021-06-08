import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Select, Form, Row, Col, DatePicker, InputNumber } from 'antd';
import { allCommissionCategories } from '~constants/commission';

export default class ExtraRequirementForm extends React.Component {
  constructor(props) {
    super(props);
    this.commissionCap = ['NOT_SPECIFIC', 'DAYS', 'WEEKS', 'MONTHS'];
  }

  disabledEndDate = (endValue) => {
    const startValue = this.props.form.getFieldValue('checkInDateFrom');
    if (!endValue || !startValue) {
      return false;
    }

    return endValue.valueOf() <= startValue.valueOf();
  }

  isErrEndDate = () => {
    const startValue = this.props.form.getFieldValue('checkInDateFrom');
    const endValue = this.props.form.getFieldValue('checkInDateTo');

    if (startValue && endValue) {
      return startValue.valueOf() > endValue.valueOf();
    }
    return false;
  };

  render() {
    const { t } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const commissionCategory = getFieldValue('category');
    const tenancyUnitRequired =
    commissionCategory === allCommissionCategories.TENANCY_LENGTH
    || getFieldValue('tenancyLengthFrom')
    || getFieldValue('tenancyLengthTo')
    || getFieldValue('capType') === 'LENGTH';

    return (
      <div>
        <h3 className="commission-from__form-title">
          <div className="commission-from__title-block" />
          {t('cms.property.commission_form_modal.extra_requirement')}
        </h3>
        <If condition={ commissionCategory !== allCommissionCategories.REBOOKERS_COMMISSION }>
          <Row gutter={ 9 }>
            <Col span={ 12 }>
              <span
                className={ classNames('commission-from__label', {
                  'commission-from__label--required': commissionCategory === allCommissionCategories.TENANCY_LENGTH,
                }) }
              >
                { t('cms.property.commission_form_modal.tenancy_range.lable') }
              </span>
              <Row gutter={ 10 }>
                <Col span={ 13 } style={ { width: 184 } }>
                  <Form.Item>
                    { getFieldDecorator('tenancyLengthFrom', {
                      rules: [
                        {
                          required:
                          commissionCategory === allCommissionCategories.TENANCY_LENGTH,
                          message: t('cms.property.commission.not_be_empty.err'),
                        },
                      ],
                      trigger: 'onChange',
                    })(
                      <InputNumber
                        style={ { width: 184 } }
                        min={ 1 }
                        precision={ 0 }
                        placeholder={ t('cms.property.commission_form_modal.to_booking_count.placeholder') }
                      />,
                    )
                    }
                  </Form.Item>
                </Col>
                <Col span={ 1 } style={ { width: 20 } }>
                  <div className="commission-from__tenancy-range-line">—</div>
                </Col>
                <Col span={ 13 } style={ { width: 184 } }>
                  <Form.Item >
                    { getFieldDecorator('tenancyLengthTo', {
                      trigger: 'onChange',
                    })(
                      <InputNumber
                        min={
                          getFieldValue('tenancyLengthFrom')
                          && typeof getFieldValue('tenancyLengthFrom') === 'number'
                            ? getFieldValue('tenancyLengthFrom') + 1 : 2
                        }
                        style={ { width: 184 } }
                        precision={ 0 }
                        placeholder={ t('cms.property.commission_form_modal.to_booking_count.placeholder') }
                      />,
                    )
                    }
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={ 12 }>
              <Form.Item>
                <span
                  ref={ (node) => { this.selectTenancyUnit = node; } }
                  className={ classNames('commission-from__label', {
                    'commission-from__label--required': tenancyUnitRequired,
                  }) }
                >
                  { t('cms.property.commission_form_modal.tenancy_unit.lable') }
                </span>
                { getFieldDecorator('tenancyUnit', {
                  rules: [
                    {
                      required: tenancyUnitRequired,
                      message: t('cms.property.commission.not_be_empty.err'),
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (tenancyUnitRequired && getFieldValue('tenancyUnit') === 'NOT_SPECIFIC') {
                          callback('error');
                        }
                        callback();
                      },
                      message: t('cms.property.commission.not_be_empty.err'),
                    },
                  ],
                  trigger: 'onChange',
                })(
                  <Select
                    style={ { width: 388 } }
                    getPopupContainer={ () => this.selectTenancyUnit }
                    placeholder={ t('cms.property.commission_form_modal.commission_type.placeholder') }
                  >
                    <For of={ this.commissionCap } each="type">
                      <Select.Option
                        key={ type }
                        value={ type }
                        style={ { width: 388 } }
                      >
                        { t(`cms.property.commission_form_modal.commission_category.select.${type.toLowerCase()}`) }
                      </Select.Option>
                    </For>
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>
        </If>
        <If
          condition={
            commissionCategory !== allCommissionCategories.REBOOKERS_COMMISSION
            && commissionCategory !== allCommissionCategories.TENANCY_LENGTH
          }
        >
          <Row gutter={ 9 }>
            <Col span={ 12 }>
              <Form.Item>
                <span
                  className={ classNames('commission-from__label', {
                    'commission-from__label--required':
                    commissionCategory === allCommissionCategories.NUM_BOOKINGS,
                  }) }
                >
                  { t('cms.property.commission_form_modal.from_booking_count.lable') }
                </span>
                { getFieldDecorator('bookingCountFrom', {
                  rules: [
                    {
                      required: commissionCategory === allCommissionCategories.NUM_BOOKINGS,
                      message: t('cms.property.commission.not_be_empty.err'),
                    },
                  ],
                  trigger: 'onChange',
                })(
                  <InputNumber
                    style={ { width: 388 } }
                    min={ 0 }
                    precision={ 0 }
                    placeholder={ t('cms.property.commission_form_modal.to_booking_count.placeholder') }
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={ 12 }>
              <Form.Item>
                <span className="commission-from__label">
                  { t('cms.property.commission_form_modal.to_booking_count.lable') }
                </span>
                { getFieldDecorator('bookingCountTo', {
                  trigger: 'onChange',
                })(
                  <InputNumber
                    precision={ 0 }
                    style={ { width: 388 } }
                    min={
                      getFieldValue('bookingCountFrom')
                      && typeof getFieldValue('bookingCountFrom') === 'number'
                        ? getFieldValue('bookingCountFrom') + 1 : 1
                    }
                    placeholder={ t('cms.property.commission_form_modal.to_booking_count.placeholder') }
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
        </If>
        <Row gutter={ 9 }>
          <Col span={ 12 }>
            <Form.Item>
              <div ref={ (node) => { this.datePickerCheckInDateFrom = node; } }>
                <span className="commission-from__label">
                  { t('cms.property.commission_form_modal.from_check_in_date.lable') }
                </span>
                { getFieldDecorator('checkInDateFrom', {
                  trigger: 'onChange',
                })(
                  <DatePicker
                    format="ll"
                    getCalendarContainer={ () => this.datePickerCheckInDateFrom }
                    style={ { width: '100%', height: '32px', borderRadius: '2px' } }
                  />,
                )}
              </div>
            </Form.Item>
          </Col>
          <Col span={ 12 }>
            <Form.Item>
              <div ref={ (node) => { this.datePickerCheckInDateTo = node; } }>
                <span className="commission-from__label">
                  { t('cms.property.commission_form_modal.to_check_in_date.lable') }
                </span>
                { getFieldDecorator('checkInDateTo', {
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
                    getCalendarContainer={ () => this.datePickerCheckInDateTo }
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

ExtraRequirementForm.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object,
};
ExtraRequirementForm.defaultProps = {
  t: () => {},
  form: {},
};
