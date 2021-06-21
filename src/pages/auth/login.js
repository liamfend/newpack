import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Alert } from 'antd';
import * as actions from '~actions/auth';
import { communicationStatus, createCmsUserType } from '~client/constants';
import generatePath from '~client/settings/routing';
import { checkUserExist } from '~helpers/graphql';
import { validateEmail } from '~helpers/validate';

const FormItem = Form.Item;
const mapStateToProps = state => ({
  communication: state.auth.getIn(['login', 'communication']).toJS(),
});

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize('login'));
  },

  submitLogin: ({ email, password, remember }) => {
    dispatch(actions.login({ email, password, remember }));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@Form.create()
export default class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      isAccountEnabled: false,
    };
  }

  componentWillUnmount() {
    this.props.initialize();
  }

  handleLogin = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.submitLogin({
          email: values.userName.trim(),
          password: values.password,
          remember: values.remember,
        });
      }
    });
  };

  componentWillReceiveProps(nextProps) {
    const { communication } = nextProps;
    if (
      this.props.communication.status === communicationStatus.FETCHING
      && communication.status === communicationStatus.ERROR
      && communication.errorInfo.error !== 'USER_UNAUTHORIZED'
    ) {
      this.props.form.setFields({
        password: {
          value: this.props.form.getFieldValue('password'),
          errors: [new Error(this.props.t(`cms.auth.login.alert.${communication.status.toLowerCase()}`))],
        },
      });
    }
  }

  handleChangeFields = (e, field) => {
    this.props.form.setFields({
      [field]: {
        errors: e.target.value === '' ?
          [new Error(this.props.t(`cms.auth.login.error.${field.toLowerCase()}`))] : null,
      },
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="auth__main">
        <h1 className="auth__headline" hash="logo">
          { this.props.t('cms.auth.login.headline') }
        </h1>

        <If condition={ this.state.isAccountEnabled }>
          <Alert
            message={ this.props.t('cms.auth.login.alert.disable.error') }
            className="auth__warning"
            type="warning"
            showIcon
          />
        </If>

        <Form onSubmit={ this.handleLogin }>
          <div className="auth__label">
            { this.props.t('cms.auth.login.username.label') }
          </div>
          <FormItem>
            { getFieldDecorator('userName', {
              validateTrigger: 'onBlur',
              initialValue: '',
              rules: [
                { required: true, message: this.props.t('cms.auth.login.error.username') },
                {
                  message: '',
                  validator: (rule, value, callback) => {
                    if (value === '') {
                      callback();
                      return;
                    }
                    if (!validateEmail(value.trim())) {
                      callback(this.props.t('cms.auth.login.format_error.username'));
                    }
                    callback();
                  },
                },
                {
                  required: false,
                  message: '',
                  validator: (rule, value, callback) => {
                    if (value === '' || !validateEmail(value.trim())) {
                      callback();
                    }
                    this.setState({
                      isAccountEnabled: false,
                    });
                    checkUserExist({ type: createCmsUserType.EMAIL, value: value.trim() })
                      .then((response) => {
                        if (typeof response.data.errors === 'undefined' && response.data.data) {
                          const { exist, enabled } = response.data.data.checkCmsUserExist;
                          if (!exist) {
                            callback(this.props.t('cms.auth.check_user_exist.error.not_exist'));
                          } else if (!enabled) {
                            this.setState({
                              isAccountEnabled: true,
                            });
                          } else {
                            callback();
                          }
                        } else {
                          callback(this.props.t('cms.auth.login.alert.clienterror'));
                        }
                      });
                  },
                },
              ],
            })(
              <Input
                placeholder={ this.props.t('cms.auth.login.username.placeholder') }
                onChange={ e => this.handleChangeFields(e, 'userName') }
              />,
            )}
          </FormItem>
          <div className="auth__label">
            { this.props.t('cms.auth.login.password.label') }
            <Link
              className="auth__forget-password"
              to={ generatePath('forgotPassword', { email: this.props.form.getFieldValue('userName') || '' }) }
              tabIndex="-1"
            >
              { this.props.t('cms.auth.login.label.forgotPassword') }
            </Link>
          </div>
          <FormItem>
            {getFieldDecorator('password', {
              validateTrigger: 'onBlur',
              initialValue: '',
              rules: [
                { min: 8, message: this.props.t('cms.auth.login.format_error.password') },
                { required: true, message: this.props.t('cms.auth.login.error.password') },
              ],
            })(
              <Input
                type="password"
                placeholder={ this.props.t('cms.auth.login.password.placeholder') }
                onChange={ e => this.handleChangeFields(e, 'password') }
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox className="auth__remember">
                { this.props.t('cms.auth.login.label.rememberMe') }
              </Checkbox>,
            )}

          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" className="auth__login-button">
              { this.props.t('cms.auth.login.button.login') }
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

Login.propTypes = {
  communication: PropTypes.shape({
    status: PropTypes.string,
    errorInfo: PropTypes.object,
  }),
  form: PropTypes.shape({ // eslint-disable-line react/require-default-props
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    validateFields: PropTypes.func.isRequired,
    setFields: PropTypes.func.isRequired,
  }),
  initialize: PropTypes.func.isRequired,
  submitLogin: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

Login.defaultProps = {
  communication: {
    status: '',
    errorInfo: {},
  },
  initialize: () => {},
  submitLogin: () => {},
  t: () => {},
};
