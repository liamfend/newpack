import React from 'react';
import axios from 'axios';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import PropTypes from 'prop-types';
import cookies from 'js-cookie';
import classNames from 'classnames';
import { Form, Input, Row, Select, Switch, message, Icon } from 'antd';
import TableColumnSearch from '~components/table-column-search';
import { validateEmojiRegex, validateEmail } from '~helpers/validate';
import { cookieNames } from '~constants';
import { getItem } from '~base/global/helpers/storage';

export default class createForm extends React.Component {
  constructor(props) {
    super(props);
    this.allRoles = [
      'supply', 'content_manager', 'admin',
      'regional_supply_head', 'content_manager_level_2', 'financial',
    ];
  }

  getHeader = () => {
    const authorization = `Bearer ${cookies.get(cookieNames.token)}`;
    const headers = {
      Authorization: authorization,
      'Accept-Language': 'en-us',
    };
    const authPayload = getItem('PMS_CURRENT_USER_AUTH');

    if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
      headers['Current-Role'] = authPayload.payload.currentRoleSlug;
    }

    return headers;
  };

  iscmsUser = () => {
    axios({
      method: 'post',
      url: endpoints.commissionModal.url(),
      headers: this.getHeader(),
      data: queries.checkUserExist({
        type: 'EMAIL',
        value: this.props.form.getFieldValue('email'),
      }),
    }).then((response) => {
      if (
        typeof response.data.errors === 'undefined'
        && response.data.data
        && response.data.data.checkCmsUserExist
        && response.data.data.checkCmsUserExist.exist
      ) {
        this.props.form.setFields({ email: {
          value: this.props.form.getFieldValue('email'),
          errors: [new Error(this.props.t('cms.account.landlord_account_managing.create_modal.account_email.already_registered_err'))],
        } });

        this.props.alreadyExists(false);
      } else {
        this.props.form.setFields({ email: {
          value: this.props.form.getFieldValue('email'),
          errors: this.props.form.getFieldError('email'),
        } });

        this.props.alreadyExists(true);
      }
    })
      .catch(() => {
        message.error(this.props.t('cms.message.error'));
      });
  };

  render() {
    const { t, modalType, isLandlord } = this.props;
    const { getFieldDecorator } = this.props.form;
    const inputWidth = modalType === 'add' ? 388 : 374;
    return (
      <div >
        <Row>
          <Form.Item>
            <span className={ classNames('create-account__label', {
              'create-account__label--disabled': modalType !== 'add',
            }) }
            >
              { t('cms.account.landlord_account_managing.create_modal.account_email.lable') }
            </span>
            { getFieldDecorator('email', {
              rules: [
                { required: true, message: t('cms.property.commission.not_be_empty.err') },
                {
                  validator: (rule, value, callback) => {
                    if (value
                      && !(validateEmojiRegex(value)
                      && validateEmail(value))
                    ) {
                      callback('error');
                    }

                    if (
                      value && modalType === 'add'
                      && (validateEmojiRegex(value) && validateEmail(value))
                    ) {
                      this.iscmsUser();
                    }
                    callback();
                  },
                  message: t('cms.account.landlord_account_managing.create_modal.account_email.valid_err'),
                },
              ],
              validateTrigger: 'onBlur',
            })(
              <Input
                disabled={ modalType !== 'add' }
                style={ { width: inputWidth } }
                placeholder={ t('cms.account.landlord_account_managing.create_modal.account_email.placeholder') }
              />,
            )}
          </Form.Item>
        </Row>
        <Row>
          <Form.Item>
            <span className="create-account__label">
              { t('cms.account.landlord_account_managing.create_modal.first_name.lable') }
            </span>
            { getFieldDecorator('firstName', {
              rules: [
                { required: true, message: t('cms.property.commission.not_be_empty.err') },
                { max: 250, message: t('cms.account.landlord_account_managing.create_modal.first_name.characters_err') },
                {
                  validator: (rule, value, callback) => {
                    if (value && !validateEmojiRegex(value)) {
                      callback('error');
                    }
                    callback();
                  },
                  message: t('cms.account.landlord_account_managing.create_modal.first_name.valid_err'),
                },
              ],
              trigger: 'onChange',
            })(
              <Input
                style={ { width: inputWidth } }
                placeholder={ t('cms.account.landlord_account_managing.create_modal.first_name.placeholder') }
              />,
            )}
          </Form.Item>
        </Row>
        <Row>
          <Form.Item>
            <span className="create-account__label">
              { t('cms.account.landlord_account_managing.create_modal.last_name.lable') }
            </span>
            { getFieldDecorator('lastName', {
              rules: [
                { required: true, message: t('cms.property.commission.not_be_empty.err') },
                { max: 250, message: t('cms.account.landlord_account_managing.create_modal.last_name.characters_err') },
                {
                  validator: (rule, value, callback) => {
                    if (value && !validateEmojiRegex(value)) {
                      callback('error');
                    }
                    callback();
                  },
                  message: t('cms.account.landlord_account_managing.create_modal.last_name.valid_err'),
                },
              ],
              trigger: 'onChange',
            })(
              <Input
                style={ { width: inputWidth } }
                placeholder={ t('cms.account.landlord_account_managing.create_modal.last_name.placeholder') }
              />,
            )}
          </Form.Item>
        </Row>
        <If condition={ !isLandlord }>
          <Row>
            <Form.Item>
              <span
                ref={ (node) => { this.selectRole = node; } }
                className="create-account__label"
              >
                { t('cms.account.landlord_account_managing.create_modal.user_role.lable') }
              </span>
              { getFieldDecorator('roles', {
                rules: [
                  {
                    required: true,
                    message: t('cms.property.commission.not_be_empty.err'),
                  },
                ],
                trigger: 'onChange',
              })(
                <Select
                  mode="multiple"
                  style={ { width: inputWidth } }
                  getPopupContainer={ () => this.selectRole }
                  placeholder={ t('cms.account.landlord_account_managing.create_modal.user_role.placeholder') }
                >
                  <For of={ this.allRoles } each="type">
                    <Select.Option
                      style={ { width: inputWidth } }
                      key={ type }
                      value={ type }
                    >
                      { t(`cms.account.landlord_account_managing.create_modal.user_role.${type.toLowerCase()}.select`) }
                    </Select.Option>
                  </For>
                </Select>,
              )}
            </Form.Item>
          </Row>
        </If>
        <div className={ isLandlord ? '' : 'create-account__label--hidden' }>
          <Row>
            <Form.Item>
              <span className="create-account__label">
                { t('cms.account.landlord_account_managing.create_modal.landlord_name.lable') }
              </span>
              { getFieldDecorator('landlordId', {
                rules: [
                  { required: true, message: t('cms.property.commission.not_be_empty.err') },
                ],
                trigger: 'onChange',
              })(
                <TableColumnSearch
                  t={ t }
                  valueData={ this.props.landlordName }
                  isLocaitonCustom
                  searchType="landlord"
                  placeholder={ t('cms.account.landlord_account_managing.create_modal.landlord_name.placeholder') }
                  onSearch={ (slug, value) => { this.handleSearch(value); } }
                />,
              )}
            </Form.Item>
          </Row>
        </div>
        <If condition={ this.props.modalType === 'edit' }>
          <Form.Item>
            <div className="create-account__enable-pms-access">
              <span className="create-account__label create-account__label--switch">
                { t(`cms.account.landlord_account_managing.create_modal.enable_${
                  isLandlord ? 'landlord' : 'pms'
                }_access.lable`) }
              </span>
              { getFieldDecorator('enabled', {
                initialValue: this.props.isEnabled,
                valuePropName: 'checked',
                trigger: 'onChange',
              })(
                <Switch
                  className="create-account__switch-btn"
                  checkedChildren={ <Icon type="check" /> }
                  unCheckedChildren={ <Icon type="close" /> }
                />,
              )}

            </div>
          </Form.Item>
        </If>
      </div>
    );
  }
}

createForm.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object,
  alreadyExists: PropTypes.func,
  modalType: PropTypes.string,
  isEnabled: PropTypes.bool,
  isLandlord: PropTypes.bool,
  landlordName: PropTypes.string,
};

createForm.defaultProps = {
  t: () => {},
  form: {},
  alreadyExists: () => {},
  modalType: '',
  landlordName: '',
  isEnabled: false,
  isLandlord: false,
};
