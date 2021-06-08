import window from 'global/window';

// Filter by hostname (in order)
//
// 1. PROD > contains student.com
// 2. UAT > ends with -uat.dandythrust.com
// 3. STAGE > ends with .dandythrust.com
// 4. DEV > everything else

let environment;

const hostnameEndsWith = (string) => {
  if (window.location && window.location.hostname) {
    const { hostname } = window.location;
    return hostname.substring(hostname.length - string.length) === string;
  }

  return '';
};

const isUat = () => {
  if (window.location && window.location.hostname) {
    const { hostname } = window.location;
    return hostname.includes('uat');
  }

  return false;
};

export const environments = {
  PROD: 'PROD',
  STAGE: 'STAGE',
  UAT1: 'UAT1',
  UAT2: 'UAT2',
  UAT3: 'UAT3',
  DEV: 'DEV',
};

export const getUatEnvironment = () => {
  if (isUat()) {
    const { hostname } = window.location;
    if (hostname.includes('uat1')) {
      return environments.UAT1;
    } else if (hostname.includes('uat2')) {
      return environments.UAT2;
    } else if (hostname.includes('uat3')) {
      return environments.UAT3;
    }
  }

  return environments.UAT1;
};

export const clearCache = () => {
  environment = null;
};

export const getEnvironment = () => {
  if (environment) {
    return environment;
  }

  if (typeof window === 'undefined') {
    environment = environments.PROD;
  } else if (hostnameEndsWith('student.com')) {
    environment = environments.PROD;
  } else if (hostnameEndsWith('dandythrust.com') && isUat()) {
    environment = getUatEnvironment();
  } else if (hostnameEndsWith('dandythrust.com') && !isUat()) {
    environment = environments.STAGE;
  } else {
    environment = environments.DEV;
  }

  return environment;
};
