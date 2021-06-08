import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form, Transfer, Radio } from 'antd';

export default class NoteForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      propertyIds: [props.propertyId],
    };
  }

  handleChangePropertyIds = (newPropertyIds) => {
    this.setState({ propertyIds: newPropertyIds });
  };

  render() {
    const { t } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <div>
        <h3 className="commission-from__form-title">
          <div className="commission-from__title-block" />
          {t('cms.property.commission_form_modal.application_to_properties')}
        </h3>
        <div className={ classNames('commission-from__apply-type-wrap', {
          'commission-from__apply-type-wrap--current-property': getFieldValue('applyType') === 'currentProperty',
        }) }
        >
          <Form.Item>
            { getFieldDecorator('applyType', {
              trigger: 'onChange',
              initialValue: 'currentProperty',
            })(
              <Radio.Group>
                <Radio value="currentProperty">
                  { t('cms.property.commission_form_modal.apply_to_current_property.label') }</Radio>
                <Radio value="moreProperties">
                  {t('cms.property.commission_form_modal.apply_to_more_properties.label')}
                </Radio>
              </Radio.Group>,
            )}
          </Form.Item>
        </div>
        <If condition={ getFieldValue('applyType') === 'moreProperties' }>
          <div className="commission-from__transfer-wrap">
            <div className="commission-from__transfer-title-wrap">
              <span className="commission-from__transfer-title-item">
                { t('cms.property.commission_form_modal.property_name.title') }
              </span>
              <span className="commission-from__transfer-title-item">
                { t('cms.property.commission_form_modal.apply_to.title') }
              </span>
            </div>
            <Form.Item>
              { getFieldDecorator('landlordProperties', {
                trigger: 'onChange',
                rules: [{
                  required: true,
                  validator: (rule, value, callback) => {
                    if (
                      (!value && this.state.propertyIds.length > 0) ||
                      (value && value.length > 0)
                    ) {
                      callback();
                    }

                    callback(t('cms.property.commission_form_modal.error_message.can_not_empty'));
                  },
                }],
              })(
                <Transfer
                  dataSource={ this.props.landlordProperties }
                  showSearch
                  rowKey={ item => item.node.id }
                  targetKeys={ this.state.propertyIds }
                  onChange={ this.handleChangePropertyIds }
                  render={ item => item.node.name.toLowerCase() }
                  listStyle={ { width: 'calc(50% - 20px)', height: '236px' } }
                />,
              )}
            </Form.Item>
          </div>
        </If>
      </div>
    );
  }
}

NoteForm.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object,
  landlordProperties: PropTypes.array,
  propertyId: PropTypes.string,
};
NoteForm.defaultProps = {
  t: () => {},
  form: {},
  landlordProperties: [],
  propertyId: '',
};
