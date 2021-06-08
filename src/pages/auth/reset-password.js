import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Form, Input, Button, Alert } from 'antd';
import generatePath from '~client/settings/routing';
import * as authActions from '~client/actions/auth';
import { errors } from '~constants/errors';

const FormItem = Form.Item;
const mapStateToProps = state => ({
  communication: state.auth.getIn(['resetPassword', 'communication']).toJS(),
});

const mapDispatchToProps = dispatch => ({
  resetPassword: ({ newPassword, token }) => {
    dispatch(authActions.resetPassword({ newPassword, token }));
  },
});

@Form.create()
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    const query = queryString.parse(props.location.search);

    this.state = {
      token: query['reset-token'] || null,
      initialAccount: query['initial-account'] || false,
    };
  }

  handleResetPassword = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.resetPassword({
          newPassword: values.password,
          token: this.state.token,
        });
      }
    });
  };

  checkConfirmPassword = (rule, value, callback) => {
    if (value.length < 8) {
      callback();
    }
    if (value && value !== this.props.form.getFieldValue('password')) {
      callback(this.props.t('cms.auth.set_password.error.confirm'));
    }

    callback();
  };

  isDisableAccount = () => {
    const { communication } = this.props;

    if (
      communication &&
      communication.errorInfo &&
      communication.errorInfo.error === errors.USER_NOT_ENABLED_ERROR
    ) {
      return true;
    }

    return false;
  }

  handleBlurPassword = () => {
    const { getFieldValue, setFields } = this.props.form;
    const { t } = this.props;
    if (getFieldValue('password') === getFieldValue('confirm')) {
      setFields({
        confirm: {
          value: getFieldValue('confirm'),
          errors: null,
        },
      });
    } else if (getFieldValue('confirm')) {
      setFields({
        confirm: {
          value: getFieldValue('confirm'),
          errors: [new Error(t('cms.auth.set_password.error.confirm'))],
        },
      });
    }
  }

  render() {
    if (!this.state.token) {
      return <Redirect to={ generatePath('login') } />;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <div className="auth__main">
        <h1 className="auth__headline auth__headline--set-password">
          <Choose>
            <When condition={ this.state.initialAccount }>
              { this.props.t('cms.auth.set_password.welcome') }
              <br />
              { this.props.t('cms.auth.set_password.heading') }
            </When>
            <Otherwise>{ this.props.t('cms.auth.set_password.reset_password') }</Otherwise>
          </Choose>
        </h1>
        <If condition={ this.isDisableAccount() }>
          <Alert
            message={ this.props.t('cms.auth.login.alert.disable.error') }
            className="auth__warning"
            type="warning"
            showIcon
          />
        </If>

        <Form onSubmit={ this.handleResetPassword } className="login-form">
          <div className="auth__label">
            { this.props.t('cms.auth.set_password.label.new_password') }
          </div>
          <FormItem>
            {getFieldDecorator('password', {
              validateTrigger: 'onBlur',
              initialValue: '',
              rules: [
                { required: true, message: this.props.t('cms.auth.set_password.password.blank.error') },
                { min: 8, message: this.props.t('cms.auth.set_password.password.format.error') },
              ],
            })(
              <Input
                type="password"
                placeholder={ this.props.t('cms.auth.set_password.password.placeholder') }
                onBlur={ this.handleBlurPassword }
              />,
            )}
          </FormItem>
          <div className="auth__label">
            { this.props.t('cms.auth.set_password.label.confirm_password') }
          </div>
          <FormItem>
            {getFieldDecorator('confirm', {
              validateTrigger: 'onBlur',
              initialValue: '',
              rules: [
                { required: true, message: this.props.t('cms.auth.set_password.password.blank.error') },
                { min: 8, message: this.props.t('cms.auth.set_password.password.format.error') },
                {
                  required: false,
                  message: '',
                  validator: this.checkConfirmPassword,
                },
              ],
            })(
              <Input
                type="password"
                placeholder={ this.props.t('cms.auth.set_password.confirm.placeholder') }
              />,
            )}
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" className="auth__login-button">
              { this.props.t('cms.auth.set_password.button.set_password') }
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

ResetPassword.propTypes = {
  communication: PropTypes.shape({
    status: PropTypes.string,
  }),
  form: PropTypes.shape({ // eslint-disable-line react/require-default-props
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    validateFields: PropTypes.func.isRequired,
    setFields: PropTypes.func.isRequired,
  }),
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  resetPassword: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

ResetPassword.defaultProps = {
  communication: {
    status: '',
  },
  location: {
    search: '',
  },
  resetPassword: () => {},
  t: () => {},
};
