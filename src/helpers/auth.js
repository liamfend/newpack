import { get, toUpper } from 'lodash';
import store from '~client/store';
import { getItem } from '~base/global/helpers/storage';
import { pmsAllowRoles } from '~constants';

const showElementByAuth = (target, requireAuth) => {
  const authJS = store.getState().auth.toJS();
  return (target && requireAuth &&
    authJS &&
    authJS.auth &&
    authJS.auth.authMapping &&
    authJS.auth.authMapping[target] &&
    authJS.auth.authMapping[target].indexOf(requireAuth.toUpperCase()) !== -1);
};

/**
 * @param {string} target
 * @param {string} requireAuth
 * target: 'identity.cms_users'
 * requireAuth: 'R'
 *
 * @returns boolean
 */
export const isHaveAuth = (target, requireAuth) => {
  const authPayload = getItem('PMS_CURRENT_USER_AUTH');
  const authArr = get(authPayload, ['payload', 'authMapping', target], []);
  return authArr.includes(toUpper(requireAuth));
};

export const isInternalRole = () => {
  const authJS = store.getState().auth.toJS();
  return authJS &&
  authJS.auth &&
  authJS.auth.currentRoleSlug &&
  authJS.auth.currentRoleSlug !== 'pms_landlord';
};

export const isLandlordRole = () => {
  const authJS = store.getState().auth.toJS();
  return authJS &&
  authJS.auth &&
  authJS.auth.currentRoleSlug &&
  authJS.auth.currentRoleSlug === 'pms_landlord';
};

export const showLandlordManaging = () => {
  const authJS = store.getState().auth.toJS();
  return authJS &&
    authJS.auth &&
    authJS.auth.currentRoleSlug &&
    (authJS.auth.currentRoleSlug !== 'content_manager_level_2');
};

export const isSupplyRole = () => {
  const authJS = store.getState().auth.toJS();
  return authJS &&
    authJS.auth &&
    authJS.auth.currentRoleSlug &&
    authJS.auth.currentRoleSlug === 'supply';
};

export const isRegionalSupplyHeadRole = () => {
  const authJS = store.getState().auth.toJS();
  return authJS &&
    authJS.auth &&
    authJS.auth.currentRoleSlug &&
    authJS.auth.currentRoleSlug === 'regional_supply_head';
};

export const isAdminRole = () => {
  const authJS = store.getState().auth.toJS();
  return authJS &&
    authJS.auth &&
    authJS.auth.currentRoleSlug &&
    authJS.auth.currentRoleSlug === 'admin';
};

export const isContentSpecialistRole = () => {
  const authJS = store.getState().auth.toJS();
  return authJS &&
    authJS.auth &&
    authJS.auth.currentRoleSlug &&
    authJS.auth.currentRoleSlug === 'content_manager_level_2';
};

export const isContentSupervisorRole = () => {
  const authJS = store.getState().auth.toJS();
  return authJS &&
    authJS.auth &&
    authJS.auth.currentRoleSlug &&
    authJS.auth.currentRoleSlug === 'content_manager';
};

export const isFinancialRole = () => {
  const authJS = store.getState().auth.toJS();
  return authJS &&
    authJS.auth &&
    authJS.auth.currentRoleSlug &&
    authJS.auth.currentRoleSlug === 'financial';
};

export const formatAuthPayload = (payload, role) => {
  const newPayload = { ...payload };
  const authMapping = {};
  let currentRole;
  if (newPayload
    && newPayload.identity
    && newPayload.identity.identity
    && newPayload.identity.identity.frontendScopes
  ) {
    currentRole = newPayload.identity.identity.frontendScopes
      .find(frontendScope => frontendScope.role === role);
    currentRole.scopes.map((scope) => {
      if (scope.object && scope.permission) {
        authMapping[scope.object] = scope.permission;
      }
      return true;
    });
  }
  return { currentRoleSlug: role, authMapping };
};

export const isAllowRole = (roles) => {
  let allowedRole = null;
  if (typeof roles === 'object' && roles.length > 0) {
    allowedRole = roles.find(role => pmsAllowRoles.indexOf(role) !== -1);
  }

  return !!allowedRole;
};

export const getAvailableRoles = (frontendScopes) => {
  if (!Array.isArray(frontendScopes)) {
    return [];
  }

  const availableRoles = [];
  frontendScopes.map((scope) => {
    if (pmsAllowRoles.includes(scope.role)) {
      availableRoles.push(scope.role);
    }
    return true;
  });

  return availableRoles;
};

export default showElementByAuth;
