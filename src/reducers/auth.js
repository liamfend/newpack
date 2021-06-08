import Immutable from 'immutable';
import cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import { communicationStatus, cookieNames } from '~client/constants';
import { authActionTypes } from '~client/constants/actionTypes';
import { defaultCommunicationObject, updateCommunicationObject } from '~client/reducers/shared';
import getEnvironment, { environments } from '~base/global/helpers/environment';
import { setItem, removeItem } from '~base/global/helpers/storage';

const decodeToken = (token) => {
  const info = token ? jwtDecode(token) : {};

  if (typeof info.roles === 'object') {
    return {
      email: info.email || null,
      token,
    };
  }

  return {
    email: null,
    token: null,
  };
};

export const defaultState = Immutable.fromJS({
  base: decodeToken(cookies.get(cookieNames.token)),
  login: {
    communication: defaultCommunicationObject,
  },
  forgotPassword: {
    emailSent: false,
    communication: defaultCommunicationObject,
  },
  resetPassword: {
    communication: defaultCommunicationObject,
  },
  authList: {},
  getAuthList: {
    communication: defaultCommunicationObject,
  },
  auth: {},
});

const getCookieDomain = () => {
  switch (getEnvironment()) {
    case environments.PROD:
      return '.student.com';
    case environments.STAGE:
    case environments.UAT1:
    case environments.UAT2:
    case environments.UAT3:
      return window.location.hostname;
    case environments.DEV:
      return 'localhost';
    default:
      return '.dandythrust.com';
  }
};

const processLoggedIn = (state, action) => {
  if (action.rememberMe) {
    cookies.set(cookieNames.token, action.token, {
      path: '/',
      expires: 7,
      domain: getCookieDomain(),
      secure: [
        environments.PROD,
        environments.STAGE,
        environments.UAT1,
        environments.UAT2,
        environments.UAT3,
      ].includes(getEnvironment()),
      sameSite: 'Lax',
    });
  } else {
    cookies.set(cookieNames.token, action.token, {
      path: '/',
      domain: getCookieDomain(),
      secure: [
        environments.PROD,
        environments.STAGE,
        environments.UAT1,
        environments.UAT2,
        environments.UAT3,
      ].includes(getEnvironment()),
      sameSite: 'Lax',
    });
  }

  return state.mergeDeep({
    base: decodeToken(action.token),
    login: {
      communication: updateCommunicationObject(communicationStatus.IDLE),
    },
    resetPassword: {
      communication: updateCommunicationObject(communicationStatus.IDLE),
    },
  });
};

const authReducer = (state = defaultState, action) => {
  switch (action.type) {
    case authActionTypes.INITIALIZE:
      return state.mergeDeep({
        [action.application]: defaultState.toJS()[action.application],
      });

    case authActionTypes.FORGOT_PASSWORD_CS:
      return state.mergeDeep({
        forgotPassword: {
          communication: updateCommunicationObject(action.status, action.error),
        },
      });

    case authActionTypes.RESET_PASSWORD_CS:
      return state.mergeDeep({
        resetPassword: {
          communication: updateCommunicationObject(action.status, action.error),
        },
      });

    case authActionTypes.LOGIN_IN_CS:
      return state.mergeDeep({
        login: {
          communication: updateCommunicationObject(action.status, action.error),
        },
      });

    case authActionTypes.SET_USER_AUTH:
      return state.set('authList', action.payload.payload);

    case authActionTypes.GET_USER_AUTH_CS:
      return state.mergeDeep({
        getAuthList: {
          communication: updateCommunicationObject(action.status, action.error),
        },
      });

    case authActionTypes.SET_USER_ROLE:
      setItem('PMS_CURRENT_USER_AUTH', {
        authToken: cookies.get(cookieNames.token),
        payload: action.payload,
      });
      return state.set('auth', action.payload);

    case authActionTypes.LOGGED_IN:
      return processLoggedIn(state, action);

    case authActionTypes.LOGOUT:
      if (action.rememberMe) {
        cookies.remove(cookieNames.token, {
          path: '/',
          expires: 7,
          domain: getCookieDomain(),
        });
      } else {
        cookies.remove(cookieNames.token, {
          path: '/',
          domain: getCookieDomain(),
        });
      }
      removeItem('PMS_CURRENT_USER_AUTH');
      return state.mergeDeep({
        base: {
          token: null,
          email: null,
        },
        authList: {},
        auth: {},
      });

    case authActionTypes.EMAIL_RESET_SUCCESSFUL:
      return state.mergeDeep({
        forgotPassword: {
          emailSent: true,
          communication: updateCommunicationObject(communicationStatus.IDLE),
        },
      });

    default:
      return state;
  }
};

export default authReducer;
