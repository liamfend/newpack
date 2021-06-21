import React from 'react';
import PropTypes from 'prop-types';
import { Select, Transfer, Divider, Form, Tooltip } from 'antd';

export default class PropertiesTransfer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      targetKeys: props.targetKeys || [],
      countdown: props.countdownDays,
    };
  }

  handleChangeCountdown = (e) => {
    this.setState({
      countdown: e,
    });
  }

  handleChange = (nextTargetKeys) => {
    this.setState({
      targetKeys: nextTargetKeys,
    });
  };

  handleDeleted = () => {
    this.setState({
      targetKeys: [],
      countdown: null,
    });

    this.props.form.setFields({
      countdownDays: null,
    });

    this.props.onUpdateConfirmSettings(this.state.countdown);
  }

  setTargetKeys = () => {
    if (this.state.targetKeys.length < 1) {
      this.props.form.setFields({
        properties: {
          errors: [new Error(this.props.t('cms.landlord.modal.error.blank'))],
        },
      });
    }

    if (!this.state.countdown) {
      this.props.form.setFields({
        countdownDays: {
          errors: [new Error(this.props.t('cms.landlord.modal.error.blank'))],
        },
      });
    }

    if (this.state.countdown && this.state.targetKeys && this.state.targetKeys.length > 0) {
      this.props.onUpdateConfirmSettings(this.state.countdown, this.state.targetKeys);
    }
  }

  render() {
    const { t } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="landlord-info__properties">
        <span className="landlord-info__label">
          { t('cms.account.landlord_account_managing.view.modal.proprty_name.lable') }
          <span className="landlord-info__access-to">
            { t('cms.account.landlord_account_managing.view.modal.apply_to.lable') }
          </span>
        </span>
        <Form.Item
          colon={ false }
        >
          { getFieldDecorator('properties', {
            rules: [
              {
                required: true,
                message: t('cms.landlord.modal.error.blank'),
              },
            ],
          })(
            <Transfer
              dataSource={ this.props.landlordProperties }
              showSearch
              rowKey={ item => item.node.id }
              style={ { width: '100%' } }
              targetKeys={ this.state.targetKeys }
              locale={ {
                itemUnit: 'property',
                itemsUnit: 'properties',
                searchPlaceholder: 'Enter search content',
              } }
              onChange={ this.handleChange }
              render={ (item) => {
                if (item.disabled) {
                  return <Tooltip placement="top" title={ t('cms.landlord.modal.disable_property.tips') }><button className="landlord-info__disable-btn">{ item.node.name.toLowerCase()}</button></Tooltip>;
                }

                return item.node.name.toLowerCase();
              } }
              listStyle={ { width: 'calc(50% - 20px)', height: '236px', backgroundColor: '#fff' } }
            />,
          )}
        </Form.Item>
        <div className="landlord-info__countdown" ref={ (node) => { this.countdownContainer = node; } }>
          <span className="landlord-info__label">
            { t('cms.landlord.detail.countdown_days.label') }
          </span>
          <Form.Item
            colon={ false }
          >
            { getFieldDecorator('countdownDays', {
              rules: [
                {
                  required: true,
                  message: t('cms.landlord.modal.error.blank'),
                },
              ],
              initialValue: this.state.countdown,
            })(
              <Select
                getPopupContainer={ () => this.props.reconciliationContainer }
                className="landlord-info__countdown-input"
                onChange={ this.handleChangeCountdown }
              >
                <For of={ [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] } each="option" index="index">
                  <Select.Option key={ `countdown-${index}` } value={ option }>
                    { option }
                  </Select.Option>
                </For>
              </Select>,
            )}
            <span className="landlord-info__label-text">
              { t('cms.landlord.detail.countdown_days.desc') }
            </span>
          </Form.Item>
        </div>
        <Divider className="landlord-info__divider" />
        <div className="landlord-info__property-btns">
          <button
            className="landlord-info__btn landlord-info__btn--deteted"
            onClick={ this.handleDeleted }
          >
            { t('cms.landlord.modal.button.delete') }
          </button>
          <button className="landlord-info__btn" onClick={ this.setTargetKeys }>
            { t('cms.landlord.modal.button.confirm_and_add') }
          </button>
        </div>
      </div>
    );
  }
}

PropertiesTransfer.propTypes = {
  t: PropTypes.func,
  landlordProperties: PropTypes.array,
  targetKeys: PropTypes.array,
  countdownDays: PropTypes.number,
  onUpdateConfirmSettings: PropTypes.func,
  form: PropTypes.object,
  reconciliationContainer: PropTypes.object,
};
PropertiesTransfer.defaultProps = {
  t: () => {},
  landlordProperties: [],
  targetKeys: [],
  countdownDays: 0,
  onUpdateConfirmSettings: () => {},
  form: {},
  reconciliationContainer: {},
};
