import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Icon, Button } from 'antd';
import * as actions from '~client/actions/auth';
import { communicationStatus } from '~client/constants';
import generatePath from '~client/settings/routing';

const mapStateToProps = state => ({
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

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class ForgotPasswordSuccessful extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: props.match.params.email,
      buttonDisabled: false,
      countDown: 60,
    };

    this.interval = null;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.communication.status === communicationStatus.FETCHING &&
      nextProps.communication.status === communicationStatus.IDLE) {
      this.state.buttonDisabled = true;
      this.setState(this.state);
      this.performCountDown();
    }
  }

  componentWillUnmount() {
    this.props.initialize();

    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  performCountDown = () => {
    this.interval = setInterval(() => {
      this.state.countDown -= 1;

      if (this.state.countDown === 0) {
        clearInterval(this.interval);
        this.state.buttonDisabled = false;
        this.state.countDown = 60;
      }

      this.setState(this.state);
    }, 1000);
  };

  handleSendResetEmailAgain = (e) => {
    e.preventDefault();
    this.props.submitResetPassword(decodeURIComponent(this.state.email));
  };

  render() {
    return (
      <div className="auth__main">
        <Link
          to={ generatePath('login') }
          className="auth__main__back"
        >
          <Icon type="left" style={ { fontSize: '18px' } } />
          <span className="auth__main__label-back">{ this.props.t('cms.global.text.back') }</span>
        </Link>

        <h1 className="auth__main__title">
          { `${this.props.t('cms.auth.forgot_password_success.heading')} ${decodeURIComponent(this.state.email)}` }
        </h1>
        <h2 className="auth__main__heading">{this.props.t('cms.auth.forgot_password_success.summary')}</h2>

        <If condition={
          this.props.communication.status !== communicationStatus.IDLE
          && this.props.communication.status !== communicationStatus.FETCHING
        }
        >
          <div className="auth__warning">
            { this.props.t(`cms.auth.login.alert.${this.props.communication.status.toLowerCase()}`) }
          </div>
        </If>

        <form onSubmit={ this.handleSendResetEmailAgain } noValidate="noValidate">

          <Button
            type="primary"
            htmlType="submit"
            className="auth__login-button"
            disabled={
              this.props.communication.status === communicationStatus.FETCHING ||
              this.state.buttonDisabled
            }
          >
            <Choose>
              <When condition={ this.state.buttonDisabled }>
                { this.props.t('cms.auth.forgot_password_success.button.disabled', {
                  seconds: this.state.countDown,
                }) }
              </When>
              <Otherwise>
                { this.props.t('cms.auth.forgot_password_success.button.resend') }
              </Otherwise>
            </Choose>
          </Button>
        </form>
      </div>
    );
  }
}

ForgotPasswordSuccessful.propTypes = {
  communication: PropTypes.shape({
    status: PropTypes.string,
  }),
  initialize: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      email: PropTypes.string.isRequired,
    }),
  }),
  submitResetPassword: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

ForgotPasswordSuccessful.defaultProps = {
  communication: {
    status: '',
  },
  initialize: () => {},
  match: {
    params: {
      email: '',
    },
  },
  submitResetPassword: () => {},
  t: () => {},
};
