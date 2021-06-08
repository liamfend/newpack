import React from 'react';
import PropTypes from 'prop-types';
import { Select, Form, Input, Radio, InputNumber } from 'antd';

export default class DepositForm extends React.Component {
  constructor(props) {
    super(props);
    this.calculationType = ['DEPOSIT_PERCENTAGE', 'FIXED_AMOUNT', 'PER_BILLING_CYCLE'];
  }

  render() {
    const { t, billingCycle } = this.props;
    const { getFieldDecorator, getFieldValue, resetFields } = this.props.form;

    return (
      <div style={ { paddingLeft: 4 } }>
        <Form.Item>
          <span className="deposit-from__label">
            { t('cms.deposit_and_fees.deposit_modal.name_of_fee.lable') }
          </span>
          { getFieldDecorator('name', {
            rules: [
              { required: true, message: t('cms.property.commission.not_be_empty.err') },
              { max: 250, message: t('cms.deposit_and_fees.deposit_modal.characters_err') },
              {
                validator: (rule, value, callback) => {
                  const emojiRegex = new RegExp(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g);
                  if (value && emojiRegex.test(value)) {
                    callback('error');
                  }
                  callback();
                },
                message: t('cms.deposit_and_fees.deposit_modal.valid_err'),
              },
            ],
            trigger: 'onChange',
          })(
            <Input
              style={ { width: 388 } }
              placeholder={ t('cms.deposit_and_fees.deposit_modal.name_of_fee.placeholder') }
            />,
          )}
        </Form.Item>
        <Form.Item>
          <span
            ref={ (node) => { this.selectCategory = node; } }
            className="deposit-from__label"
          >
            { t('cms.deposit_and_fees.deposit_modal.calculation_type.lable') }
          </span>
          { getFieldDecorator('type', {
            rules: [
              { required: true, message: t('cms.property.commission.not_be_empty.err') },
            ],
            trigger: 'onChange',
          })(
            <Select
              style={ { width: 388 } }
              onSelect={ () => { resetFields(['value']); } }
              getPopupContainer={ () => this.selectCategory }
              placeholder={ t('cms.deposit_and_fees.deposit_modal.calculation_type.placeholder') }
            >
              <For of={ this.calculationType } each="type">
                <Select.Option
                  style={ { width: 388 } }
                  key={ type }
                  value={ type }
                >
                  { t(`cms.deposit_and_fees.deposit_modal.calculation_type.select.${type.toLowerCase()}`) }
                </Select.Option>
              </For>
            </Select>,
          )}
        </Form.Item>
        <Form.Item>
          <span className="deposit-from__label">
            { t(`cms.deposit_and_fees.deposit_modal.${
              getFieldValue('type') ? getFieldValue('type').toLowerCase() : 'fixed_amount'
            }.lable`) }
            <If condition={ getFieldValue('type') === 'FIXED_AMOUNT' || !getFieldValue('type') }>
              <If condition={ this.props.currency }>
                <span className="deposit-from__label--currency">
                  &nbsp;({ this.props.currency })
                </span>
              </If>
            </If>
            <If condition={
              getFieldValue('type') === 'PER_BILLING_CYCLE'
              && billingCycle
            }
            >
              <span className="deposit-from__label--currency">
                &nbsp;({ t(`cms.deposit_and_fees.deposit_card.value.${billingCycle.toLowerCase()}`) })
              </span>
            </If>
          </span>
          { getFieldDecorator('value', {
            rules: [
              { required: true, message: t('cms.property.commission.not_be_empty.err') },
            ],
            trigger: 'onChange',
          })(
            <InputNumber
              min={ 0 }
              precision={ 2 }
              formatter={ value =>
                (getFieldValue('type') === 'DEPOSIT_PERCENTAGE' ? `${value}%` : value) }
              style={ { width: 388 } }
              placeholder={ t('cms.deposit_and_fees.deposit_modal.value.placeholder') }
            />
            ,
          )}
        </Form.Item>
        <Form.Item>
          <span className="deposit-from__label deposit-from__label--radio">
            { t('cms.deposit_and_fees.deposit_modal.payment_processing_fee.lable') }
          </span>
          { getFieldDecorator('paymentProcessingFee', {
            trigger: 'onChange',
          })(
            <Radio.Group name="radiogroup">
              <Radio value>{ t('cms.form.value.yes') }</Radio>
              <Radio value={ false }>{ t('cms.form.value.no') }</Radio>
            </Radio.Group>,
          )}
        </Form.Item>
      </div>
    );
  }
}

DepositForm.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object,
  billingCycle: PropTypes.string,
  currency: PropTypes.string,
};
DepositForm.defaultProps = {
  t: () => {},
  form: {},
  billingCycle: '',
  currency: '',
};
