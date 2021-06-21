import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select, Row, Col, InputNumber } from 'antd';

export default class CommissionCapForm extends React.Component {
  constructor(props) {
    super(props);
    this.commissionCap = ['DAYS', 'WEEKS', 'MONTHS', 'NOT_SPECIFIC'];
    this.commissionCapType = ['NOT_SPECIFIC', 'LENGTH', 'VALUE'];
  }
  render() {
    const { t } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <div>
        <h3 className="commission-from__form-title">
          <div className="commission-from__title-block" />
          {t('cms.property.commission_form_modal.commission_cap')}
        </h3>
        <Row gutter={ 9 }>
          <Col span={ 12 }>
            <Form.Item>
              <span
                ref={ (node) => { this.selectCapType = node; } }
                className="commission-from__label"
              >
                { t('cms.property.commission_form_modal.commission_cap_type.lable') }
              </span>
              { getFieldDecorator('capType', {
                rules: [
                  {
                    required: getFieldValue('capValue'),
                    message: t('cms.property.commission.not_be_empty.err'),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (getFieldValue('capValue') && getFieldValue('capType') === 'NOT_SPECIFIC') {
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
                  getPopupContainer={ () => this.selectCapType }
                  placeholder={ t('cms.property.commission_form_modal.commission_cap_type.placeholder') }
                >
                  <For of={ this.commissionCapType } each="type">
                    <Select.Option
                      style={ { width: 388 } }
                      key={ type }
                      value={ type }
                    >
                      { t(`cms.property.commission_form_modal.commission_cap_type.select.${type.toLowerCase()}`) }
                    </Select.Option>
                  </For>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={ 12 }>
            <Form.Item>
              <span className="commission-from__label">
                { t('cms.property.commission_form_modal.commission_cap') }
              </span>
              { getFieldDecorator('capValue', {
                rules: [
                  {
                    required: getFieldValue('capType') && getFieldValue('capType') !== 'NOT_SPECIFIC',
                    message: t('cms.property.commission.not_be_empty.err'),
                  },
                ],
                trigger: 'onChange',
              })(
                <InputNumber
                  style={ { width: 388 } }
                  min={ 0 }
                  precision={ 2 }
                  placeholder={ t('cms.property.commission_form_modal.commission_cap.placeholder') }
                />,
              )}
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }
}

CommissionCapForm.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object,
};
CommissionCapForm.defaultProps = {
  t: () => {},
  form: {},
};
