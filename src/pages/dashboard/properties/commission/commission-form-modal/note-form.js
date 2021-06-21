import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form, Input, Row, Col, Radio } from 'antd';
import { allCommissionCategories } from '~constants/commission';

export default class NoteForm extends React.Component {
  render() {
    const { t } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <div>
        <h3 className="commission-from__form-title">
          <div className="commission-from__title-block" />
          {t('cms.property.commission_form_modal.note')}
        </h3>
        <Row gutter={ 9 }>
          <Col span={ 12 }>
            <Form.Item>
              <span className="commission-from__label commission-from__label--radio">
                { t('cms.property.commission_form_modal.commission_not_entirely_covered.lable') }
              </span>
              { getFieldDecorator('fullyCalculatable', {
                trigger: 'onChange',
              })(
                <Radio.Group name="radiogroup">
                  <Radio value>{t('cms.form.value.yes')}</Radio>
                  <Radio value={ false }>{t('cms.form.value.no')}</Radio>
                </Radio.Group>,
              )}
            </Form.Item>
          </Col>
          <If condition={ getFieldValue('category') !== allCommissionCategories.FLAT_FEE }>
            <Col span={ 12 }>
              <Form.Item>
                <span
                  className={ classNames('commission-from__label commission-from__label--radio', {
                    'commission-from__label--required':
                    getFieldValue('category') === allCommissionCategories.NUM_BOOKINGS,
                  }) }
                >
                  { t('cms.property.commission_form_modal.retrospective_commission.lable') }
                </span>
                { getFieldDecorator('retrospectiveCommission', {
                  trigger: 'onChange',
                })(
                  <Radio.Group name="radiogroup">
                    <Radio value>{t('cms.form.value.yes')}</Radio>
                    <Radio value={ false }>{t('cms.form.value.no')}</Radio>
                  </Radio.Group>,
                )}
              </Form.Item>
            </Col>
          </If>
        </Row>
        <Form.Item>
          <span className="commission-from__label">
            { t('cms.property.commission_form_modal.commission_structure_description.lable') }
          </span>
          { getFieldDecorator('description', {
            trigger: 'onChange',
          })(
            <Input.TextArea
              autosize={ { minRows: 2, maxRows: 2 } }
              style={ { maxWidth: 800 } }
              placeholder={ t('cms.property.commission_form_modal.commission_structure_description.placeholder') }
            />,
          )}
        </Form.Item>
      </div>
    );
  }
}

NoteForm.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object,
};
NoteForm.defaultProps = {
  t: () => {},
  form: {},
};
