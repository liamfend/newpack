import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Login from '~pages/auth/login';
import { LogoMain as LogoMainIcon } from "~components/svgs";
import ForgotPassword from '~pages/auth/forgot-password';
import ForgotPasswordSuccessful from '~pages/auth/forgot-password-successful';
import ResetPassword from '~pages/auth/reset-password';
import generatePath from '~settings/routing';
import loginImg from '~global-css/imgs/login-image.png'

const mapStateToProps = state => ({
  token: state.auth.getIn(['base', 'token']),
});

@connect(mapStateToProps)
export default class Auth extends React.Component {
  render() {
    if (this.props.token) {
      const search = queryString.parse(this.props.location.search);
      // TODO redirect to dashboard if logged in
      return <Redirect to={ search.redirectUrl || generatePath('properties') } />;
    }
    return (
      <section className="auth">
        <img
          className="auth__login-image"
          src={loginImg}
          alt="login"
        />
        <div className="auth__container">
          <Route path="/login" component={ Login } />
          <Route path="/forgot-password/:email?" exact component={ ForgotPassword } />
          <Route path="/forgot-password/:email/success" component={ ForgotPasswordSuccessful } />
          <Route path="/set-password" component={ ResetPassword } />
        </div>
        <LogoMainIcon className="auth__logo-main" />
      </section>
    );
  }
}

Auth.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  token: PropTypes.string,
};

Auth.defaultProps = {
  location: {
    search: '',
  },
  token: '',
};

