import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { changeLogActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  payload: [],
  totalCount: 0,
  communication: defaultCommunicationObject,
});

const formatChangeLog = (changeLog) => {
  const changeLogData = {
    totalCount: 0,
    list: [],
  };
  if (
    !changeLog ||
    !changeLog.auditProperties ||
    changeLog.auditProperties.edges.length === 0
  ) {
    return changeLogData;
  }

  changeLogData.totalCount = changeLog.auditProperties.totalCount;
  changeLogData.list = changeLog.auditProperties.edges.map(log => ({
    accountName: log.node.changeByUser,
    changes: log.node.changes,
    logDate: log.node.createdAt,
    entryType: log.node.entryType,
    id: log.node.id,
    logSection: log.node.model,
    modelId: log.node.modelId,
  }));

  return changeLogData;
};

const changeLogReducer = (state = defaultState, action) => {
  switch (action.type) {
    case changeLogActionTypes.SET_PROPERTY_CHANGE_LOGS: {
      const { totalCount, list } = formatChangeLog(action.payload);
      return state.merge({
        totalCount,
        payload: list,
      });
    }

    case changeLogActionTypes.GET_PROPERTY_CHANGE_LOGS_CS:
      return state.mergeDeep({
        communication: updateCommunicationObject(action.status, action.error),
      });

    default:
      return state;
  }
};

export default changeLogReducer;
