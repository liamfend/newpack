import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import authControl from '~components/auth-control';
import { Form, Row, Col, Input, message, Icon, Spin } from 'antd';
import classNames from 'classnames';
import { AccountPhoto as AccountPhotoIcon } from "~components/svgs";
import { validateEmojiRegex } from '~helpers/validate';
import Loading from '~components/loading';
import { communicationStatus, platformEntity, entityAction, pmsAllowRoles } from '~constants';
import { fireCustomEvent } from '~helpers/custom-events';
import LeaveAlert from '~components/leave-alert';
import showElementByAuth from '~helpers/auth';
import * as accountActions from '~actions/account';

const mapStateToProps = (state) => {
  const account = state.dashboard.account.toJS();
  const auth = state.auth.get('auth');

  return {
    cmsUser: account.account,
    updateStatus: account.communication.update.status,
    auth,
  };
};

const mapDispatchToProps = dispatch => ({
  getCmsUser: (onSuccess) => {
    dispatch(accountActions.getCmsUser(onSuccess));
  },
  updateCmsUser: (params, onSuccess) => {
    dispatch(accountActions.updateAccount(params, onSuccess));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.IDENTITY_CMS_USERS, entityAction.READ)
class BasicSettingForm extends React.Component {
  constructor() {
    super();

    this.state = {
      showModifyPassoword: false,
      isSave: false,
      formdata: {
        firstName: '',
        lastName: '',
        email: '',
      },
      loadingUserData: true,
      userInfo: {},
    };
  }

  componentDidMount() {
    this.handleGetCmsUser();
  }

  handleGetCmsUser = () => {
    this.props.getCmsUser((res) => {
      this.setState({
        loadingUserData: false,
        userInfo: res.cmsUser,
      });

      if (res && res.cmsUser) {
        this.props.form.setFieldsValue({
          firstName: res.cmsUser.firstName,
          lastName: res.cmsUser.lastName,
          email: res.cmsUser.email,
        });
      }
    });
  };

  handleClickModify = () => {
    this.setState({ showModifyPassoword: !this.state.showModifyPassoword });
  };

  handleClickConfirm = () => {
    this.props.form.validateFields((err, values) => {
      if (this.state.showModifyPassoword && values.newPassword !== values.reEnterPassword) {
        this.props.form.setFields({
          reEnterPassword: {
            value: values.reEnterPassword,
            errors: [new Error(this.props.t('cms.account.basic_setting.password.error.no_match'))],
          },
        });
        return false;
      }

      if (!err) {
        if (this.props.form.isFieldsTouched()) {
          const params = {
            firstName: values.firstName,
            lastName: values.lastName,
            id: this.state.userInfo.id,
          };

          if (this.state.showModifyPassoword) {
            params.password = values.newPassword;
          }

          this.props.updateCmsUser(params, () => {
            this.setState({
              showModifyPassoword: false,
              formdata: {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
              },
            });
            this.handleGetCmsUser();
            this.props.form.resetFields([
              'firstName', 'lastName', 'email',
            ]);
            this.props.form.setFieldsValue({
              firstName: this.state.formdata.firstName,
              lastName: this.state.formdata.lastName,
              email: this.state.formdata.email,
            });
          });
        } else {
          message.success(this.props.t('cms.account.update_success.tips'));
        }
      }

      return true;
    });
  };

  hasUnsavedData = () => this.props.form.isFieldsTouched();

  getCurrentRole = () => {
    if (
      this.props.auth
      && this.props.auth.currentRoleSlug
      && this.state.userInfo
      && this.state.userInfo.userRoles
    ) {
      return this.state.userInfo.userRoles.find(
        role => role.slug === this.props.auth.currentRoleSlug,
      );
    }
    return null;
  };

  handleSwitchRole = () => {
    fireCustomEvent('triggerSwitchRole');
  };

  isShowSwitchRoleButton = () => {
    const { cmsUser } = this.props;

    if (
      cmsUser &&
      cmsUser.userRoles &&
      cmsUser.userRoles.filter(userRole => pmsAllowRoles.includes(userRole.slug)).length > 1
    ) {
      return true;
    }

    return false;
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { t } = this.props;
    const { userInfo } = this.state;
    const currentRole = this.getCurrentRole();

    return (
      <div className="basic-setting">
        <If condition={ this.state.loadingUserData }>
          <div className="account__spin-container">
            <Spin />
          </div>
        </If>
        <LeaveAlert
          history={ this.props.history }
          t={ this.props.t }
          when={ this.hasUnsavedData() }
        />
        <If condition={ !this.state.loadingUserData }>
          <div className="basic-setting__container">
            <div className="basic-setting__profile">
              <div className="basic-setting__profile-photo">
                <AccountPhotoIcon className="basic-setting__profile-photo-icon" />
              </div>
              <div className="basic-setting__profile-info">
                <div className="basic-setting__profile-position">
                  <p className="basic-setting__profile-name">
                    { `Hello, ${userInfo.firstName} ${userInfo.lastName}` }
                  </p>
                  <p className="basic-setting__profile-role-container">
                    <span className="basic-setting__profile-role" key={ currentRole && currentRole.slug }>
                      { currentRole && currentRole.name }
                    </span>

                    <If condition={ this.isShowSwitchRoleButton() }>
                      <button
                        className="basic-setting__change-version basic-setting__btn"
                        type="button"
                        onClick={ this.handleSwitchRole }
                      >
                        <Icon type="swap" width="10px" height="10px" style={ { marginRight: '4px', fill: '#9e9e9e' } } />
                        { this.props.t('cms.account.basic_setting.btn.switch_role') }
                      </button>
                    </If>
                  </p>
                </div>
              </div>
            </div>

            <Form>
              <div className="basic-setting__block basic-setting__block--basic-setting">
                <p className="basic-setting__block-title">
                  { t('cms.account.basic_setting.block_title.basic_setting') }
                </p>
                <Row gutter={ 16 }>
                  <Col span={ 12 }>
                    <Form.Item label={ t('cms.account.basic_setting.label.first_name') }>
                      {
                        getFieldDecorator('firstName', {
                          rules: [
                            {
                              required: true,
                              validator: (rule, value, callback) => {
                                if (!value) {
                                  callback(t('cms.account.basic_setting.error.empty'));
                                } else if (value.length > 250) {
                                  callback(t('cms.account.basic_setting.first_name.error.too_long'));
                                } else if (!validateEmojiRegex(value)) {
                                  callback(t('cms.account.basic_setting.first_name.error.invalidate'));
                                } else {
                                  callback();
                                }
                              },
                            },
                          ],
                        })(<Input size="large" placeholder={ t('cms.account.basic_setting.placeholder.first_name') } />)
                      }
                    </Form.Item>
                  </Col>
                  <Col span={ 12 }>
                    <Form.Item label={ t('cms.account.basic_setting.label.last_name') }>
                      {
                        getFieldDecorator('lastName', {
                          rules: [
                            {
                              required: true,
                              validator: (rule, value, callback) => {
                                if (!value) {
                                  callback(t('cms.account.basic_setting.error.empty'));
                                } else if (value.length > 250) {
                                  callback(t('cms.account.basic_setting.last_name.error.too_long'));
                                } else if (!validateEmojiRegex(value)) {
                                  callback(t('cms.account.basic_setting.last_name.error.invalidate'));
                                } else {
                                  callback();
                                }
                              },
                            },
                          ],
                        })(<Input size="large" placeholder={ t('cms.account.basic_setting.placeholder.last_name') } />)
                      }
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={ 16 }>
                  <Col span={ 12 }>
                    <Form.Item label={ t('cms.account.basic_setting.label.account_email') } className="basic-setting__label--email">
                      {
                        getFieldDecorator('email', {
                          rules: [
                            {
                              require: true,
                            },
                          ],
                        })(<Input style={ { width: 568 } } size="large" disabled />)
                      }
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div className="basic-setting__block basic-setting__block--security-setting">
                <p className="basic-setting__block-title">
                  { this.props.t('cms.account.basic_setting.block_title.security_setting') }
                </p>
                <p className="basic-setting__current-password-container">
                  <span className="basic-setting__label">
                    { this.props.t('cms.account.basic_setting.label.current_password') }
                  </span>
                  <span className="basic-setting__current-password">********</span>
                  <If condition={ showElementByAuth(
                    platformEntity.IDENTITY_CMS_USERS,
                    entityAction.UPDATE,
                  ) }
                  >
                    <button className="basic-setting__btn basic-setting__modify" type="button" onClick={ this.handleClickModify }>
                      { this.props.t('cms.account.basic_setting.btn.modify') }
                    </button>
                  </If>
                </p>

                <div className={ classNames('basic-setting__modify-animation-container', {
                  'basic-setting__modify-animation-container--show': this.state.showModifyPassoword,
                }) }
                >
                  <If condition={ this.state.showModifyPassoword }>
                    <div className="basic-setting__modify-container">
                      <Form.Item className="basic-setting__modify-input">
                        {
                          getFieldDecorator('newPassword', {
                            rules: [
                              {
                                validator: (rule, value, callback) => {
                                  if (!value || value.length === 0) {
                                    callback(t('cms.account.basic_setting.error.empty'));
                                  } else if (value.length < 8) {
                                    callback(t('cms.account.basic_setting.password.error.too_short'));
                                  }

                                  callback();
                                },
                              },
                            ],
                            validateTrigger: 'onBlur',
                          })(<Input.Password size="large" placeholder={ t('cms.account.basic_setting.placeholder.new_password') } />)
                        }
                      </Form.Item>
                      <Form.Item className="basic-setting__modify-input">
                        {
                          getFieldDecorator('reEnterPassword', {
                            rules: [
                              {
                                validator: (rule, value, callback) => {
                                  if (!value || value.length === 0) {
                                    callback(t('cms.account.basic_setting.error.empty'));
                                  } else if (value.length < 8) {
                                    callback(t('cms.account.basic_setting.password.error.too_short'));
                                  }

                                  callback();
                                },
                              },
                            ],
                            validateTrigger: 'onBlur',
                          })(<Input.Password size="large" placeholder={ t('cms.account.basic_setting.placeholder.re_enter_password') } />)
                        }
                      </Form.Item>
                    </div>
                  </If>
                </div>

                <If condition={ showElementByAuth(
                  platformEntity.IDENTITY_CMS_USERS,
                  entityAction.UPDATE,
                ) }
                >
                  <button
                    className={ classNames('basic-setting__btn basic-setting__comfirm', {
                      'basic-setting__btn--disabled': this.props.updateStatus === communicationStatus.FETCHING,
                    }) }
                    onClick={ this.handleClickConfirm }
                    disabled={ this.props.updateStatus === communicationStatus.FETCHING }
                  >
                    <If condition={ this.props.updateStatus === communicationStatus.FETCHING }>
                      <Loading />
                    </If>
                    <If condition={ this.props.updateStatus !== communicationStatus.FETCHING }>
                      { this.props.t('cms.account.basic_setting.btn.confirm_to_update') }
                    </If>
                  </button>
                </If>
              </div>
            </Form>
          </div>

        </If>
      </div>
    );
  }
}

const BasicSetting = Form.create({
  name: 'basic-setting',
})(BasicSettingForm);

export default BasicSetting;

BasicSettingForm.propTypes = {
  form: PropTypes.object.isRequired,
  t: PropTypes.func,
  getCmsUser: PropTypes.func,
  updateCmsUser: PropTypes.func,
  updateStatus: PropTypes.string,
  history: PropTypes.object,
  auth: PropTypes.shape({
    currentRoleSlug: PropTypes.string,
  }),
  cmsUser: PropTypes.object,
};

BasicSettingForm.defaultProps = {
  t: () => {},
  getCmsUser: () => {},
  updateCmsUser: () => {},
  updateStatus: '',
  history: '',
  auth: {},
  cmsUser: {},
};
