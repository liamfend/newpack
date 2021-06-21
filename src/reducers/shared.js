import { communicationStatus } from '~client/constants';

export const defaultCommunicationObject = {
  status: communicationStatus.IDLE,
  errorInfo: {
    error: null,
    errorDescription: null,
    errorData: null,
    statusCode: null,
  },
};

const isInvalidToken = message => message.toLowerCase().indexOf('authorization header') !== -1 || message.toLowerCase().indexOf('invalidtoken') !== -1;

export const updateCommunicationObject = (status, errorData) => {
  if (status !== communicationStatus.ERROR) {
    return Object.assign({}, defaultCommunicationObject, {
      status,
    });
  }

  if (typeof errorData === 'string' && isInvalidToken(errorData)) {
    return Object.assign({}, defaultCommunicationObject, {
      status,
      errorInfo: {
        statusCode: 401,
      },
    });
  }

  if (Array.isArray(errorData)) {
    return Object.assign({}, defaultCommunicationObject, {
      status,
      errorInfo: {
        error: errorData[0].message,
        errorDescription: errorData[0].message,
        errorData,
      },
    });
  }

  return Object.assign({}, defaultCommunicationObject, {
    status,
    errorInfo: {
      error: errorData.error || null,
      errorDescription: errorData.error_description || null,
      errorData: errorData.error_data || null,
      statusCode: errorData.status_code || null,
    },
  });
};
