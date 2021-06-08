import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Icon, Form, Input, Button, Alert } from 'antd';
import * as actions from '~client/actions/auth';
import { createCmsUserType } from '~client/constants';
import generatePath from '~client/settings/routing';
import { checkUserExist } from '~helpers/graphql';
import { validateEmail } from '~helpers/validate';

const FormItem = Form.Item;
const mapStateToProps = state => ({
  emailSent: state.auth.get('forgotPassword').toJS().emailSent,
  communication: state.auth.getIn(['forgotPassword', 'communication']).toJS(),
});

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize('forgotPassword'));
  },

  submitResetPassword: (email) => {
    dispatch(actions.forgotPassword(email));
  },
});

@Form.create()
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class ForgotPassword extends React.Component {
  constructor() {
    super();
    this.state = {
      isAccountEnabled: false,
    };
  }

  componentWillUnmount() {
    this.props.initialize();
  }

  handleForgotPassword = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.submitResetPassword(values.email.trim());
      }
    });
  };

  handleChangeFields = (e) => {
    if (e.target.value === '') {
      this.props.form.setFields({
        email: {
          errors: [new Error(this.props.t('cms.auth.forgot_password.error.email'))],
        },
      });
    }
  };

  render() {
    if (this.props.emailSent) {
      return <Redirect to={ generatePath('forgotPasswordSuccess', { email: this.props.form.getFieldValue('email') }) } />;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <div className="auth__main">
        <Link to={ generatePath('login') } className="auth__main__back">
          <Icon type="left" style={ { fontSize: '18px' } } />
          <span className="auth__main__label-back">{ this.props.t('cms.global.text.back') }</span>
        </Link>

        <h1 className="auth__main__title">{this.props.t('cms.auth.forgot_password.heading')}</h1>
        <If condition={ this.state.isAccountEnabled }>
          <Alert
            message={ this.props.t('cms.auth.login.alert.disable.error') }
            className="auth__warning"
            type="warning"
            showIcon
          />
        </If>
        <h2 className="auth__main__heading">{this.props.t('cms.auth.forgot_password.summary')}</h2>

        <Form onSubmit={ this.handleForgotPassword }>
          <FormItem>
            { getFieldDecorator('email', {
              validateTrigger: 'onBlur',
              initialValue:
                this.props.match.params.email ?
                  decodeURIComponent(this.props.match.params.email) : '',
              rules: [
                { required: true, message: this.props.t('cms.auth.forgot_password.error.email') },
                {
                  message: '',
                  validator: (rule, value, callback) => {
                    if (value === '') {
                      callback();
                      return;
                    }
                    if (!validateEmail(value.trim())) {
                      callback(this.props.t('cms.auth.forgot_password.format_error.email'));
                    }
                    callback();
                  },
                },
                {
                  required: false,
                  message: '',
                  validator: (rule, value, callback) => {
                    if (value === '' || !validateEmail(value)) {
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
                placeholder={ this.props.t('cms.auth.forgot_password.email.placeholder') }
                onChange={ this.handleChangeFields }
              />,
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" className="auth__login-button">
              { this.props.t('cms.auth.forgot_password.button.reset_password') }
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

ForgotPassword.propTypes = {
  communication: PropTypes.shape({
    status: PropTypes.string,
  }),
  emailSent: PropTypes.bool,
  form: PropTypes.shape({ // eslint-disable-line react/require-default-props
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    validateFields: PropTypes.func.isRequired,
    setFields: PropTypes.func.isRequired,
  }),
  initialize: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      email: PropTypes.string,
    }),
  }),
  submitResetPassword: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

ForgotPassword.defaultProps = {
  communication: {
    status: '',
  },
  emailSent: false,
  initialize: () => {},
  match: {
    params: {
      email: '',
    },
  },
  submitResetPassword: () => {},
  t: () => {},
};
