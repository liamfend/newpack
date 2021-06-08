import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { message } from 'antd';
import { authActionTypes as actions } from '~constants/actionTypes';
import { updateCommunicationStatus, handleFetchCatch, fetch, isNetworkIssue } from '~actions/shared';
import { communicationStatus } from '~constants';
import { errors } from '~constants/errors';
import i18n from '~settings/i18n';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import { isAllowRole } from '~helpers/auth';

export const initialize = application => ({
  type: actions.INITIALIZE,
  application,
});

export const loggedIn = (email, token, rememberMe) => ({
  type: actions.LOGGED_IN,
  email,
  token,
  rememberMe,
});

export const setUserAuth = payload => ({
  type: actions.SET_USER_AUTH,
  payload,
});

export const getUserAuth = (onSuccess = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.getUserAuth(),
    communicationType: actions.GET_USER_AUTH_CS,
    onSuccess: (res) => {
      onSuccess(res);
      dispatch(setUserAuth({
        payload: res,
      }));
    },
  });
};

export const setSelectRole = payload => ({
  type: actions.SET_USER_ROLE,
  payload,
});

export const login = ({ email, password, remember }) => (dispatch) => {
  dispatch(
    updateCommunicationStatus({
      actionType: actions.LOGIN_IN_CS,
      status: communicationStatus.FETCHING,
    }),
  );

  axios({
    method: 'post',
    url: endpoints.login.url(),
    data: queries.login({ email, password }),
  }).then((response) => {
    if (response.data.data && response.data.errors) {
      dispatch(
        updateCommunicationStatus({
          actionType: actions.LOGIN_IN_CS,
          status: communicationStatus.ERROR,
          error: response.data.errors,
        }),
      );
    } else if (typeof response.data.errors === 'undefined' && response.data.data) {
      const { authToken } = response.data.data.cmsUserLogin;
      const { roles } = jwtDecode(authToken);
      if (typeof roles === 'object' && isAllowRole(roles)) {
        dispatch(loggedIn(email, authToken, remember));
        dispatch(
          updateCommunicationStatus({
            actionType: actions.LOGIN_IN_CS,
            status: communicationStatus.IDLE,
          }),
        );
      } else {
        message.error(i18n.t('cms.auth.check_user_exist.error.not_exist'));
        dispatch(
          updateCommunicationStatus({
            actionType: actions.LOGIN_IN_CS,
            status: communicationStatus.CLIENT_ERROR,
            error: {},
          }),
        );
      }
    } else {
      message.error(i18n.t('cms.auth.login.alert.error'));
      dispatch(
        updateCommunicationStatus({
          actionType: actions.LOGIN_IN_CS,
          status: communicationStatus.ERROR,
          error: response.data.errors,
        }),
      );
    }
  }).catch((error) => {
    if (isNetworkIssue(error)) {
      message.error(i18n.t('cms.auth.login.alert.timeout'));
    } else {
      message.error(i18n.t('cms.auth.login.alert.clienterror'));
    }
    handleFetchCatch({
      actionType: actions.LOGIN_IN_CS,
      dispatch,
      error,
    });
  });
};

export const logout = () => ({
  type: actions.LOGOUT,
});

export const emailResetSuccessful = () => ({
  type: actions.EMAIL_RESET_SUCCESSFUL,
});

export const forgotPassword = email => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.forgotPassword.url(),
    params: queries.forgotPassword(email),
    communicationType: actions.FORGOT_PASSWORD_CS,
    onError: (error) => {
      if (!Array.isArray(error) || error[0].message !== errors.USER_NOT_ENABLED_ERROR) {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
    onSuccess: () => {
      dispatch(emailResetSuccessful());
    },
  });
};

export const resetPassword = ({ newPassword, token }) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.resetPassword.url(),
    params: queries.resetPassword({ newPassword, token }),
    communicationType: actions.RESET_PASSWORD_CS,
    onError: (error) => {
      if (!Array.isArray(error) || error[0].message !== errors.USER_NOT_ENABLED_ERROR) {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
    onSuccess: (res) => {
      if (typeof res.resetPassword.authToken !== 'undefined') {
        const { roles } = jwtDecode(res.resetPassword.authToken);

        if (typeof roles === 'object' && isAllowRole(roles)) {
          dispatch(loggedIn('', res.resetPassword.authToken, false));
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'));
        }
      } else {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
  });
};
