import { udeskActionTypes as actions } from '~constants/actionTypes';
import { fetch } from '~actions/shared';
import endpoints from '~settings/endpoints';
import { formatSimpleParams } from '~helpers/params';
import * as queries from '~settings/queries';
import getEnvironment, { environments } from '~base/global/helpers/environment';

const authorization = getEnvironment() === environments.PROD
  ? 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdF9uYW1lIjoiIiwibGFzdF9uYW1lIjoiIiwiZW1haWwiOiJpbnRlZ3JhdGlvbi51ZGVza0BzdHVkZW50LmNvbSIsInV1aWQiOiI4NDAwMzRiMS0wZmY5LTQyYmMtYjJlZC1jYTI4ZWFiZjQwMDMiLCJyb2xlX2RhdGEiOm51bGwsInNjb3BlcyI6eyJyZWFkOmJvb2tpbmdzIjp7fSwicmVhZDpwcm9wZXJ0aWVzIjp7fSwicmVhZDpsaXN0aW5ncyI6e319LCJyb2xlcyI6WyJpbnRlZ3JhdGlvbiJdLCJpYXQiOjE1NDkwOTI1NzcsImlzcyI6ImF1dGgifQ.vz2Gh5dFB7UXcs_aOKHROvu9HAFQy4AwLdbneVwuOEw'
  : 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdF9uYW1lIjoiIiwibGFzdF9uYW1lIjoiIiwiZW1haWwiOiJ1ZGVzay5pbnRlcmdyYXRpb25Ac3R1ZGVudC5jb20iLCJ1dWlkIjoiNmNhOTkyOGQtNmY2NS00ODI2LWI5NjMtMDUzMmZiMWFkODdkIiwicm9sZV9kYXRhIjpudWxsLCJyb2xlcyI6WyJzdHVkZW50Il0sImlhdCI6MTU0NzcxNjgwNSwiaXNzIjoiYXV0aCJ9.UuLz098oc4mKFjfOOU-XRXqLS4-e6xy1mIWPF62wygY';

export const setStudentDetail = payload => ({
  type: actions.SET_STUDENT,
  payload,
});

export const setPartnerDetail = payload => ({
  type: actions.SET_PARTNER,
  payload,
});

export const getStudentDetailWithUsPhone = (payload, phone) => (dispatch) => {
  if (payload.getStudentDetails) {
    return dispatch(setStudentDetail(payload));
  }

  fetch({
    dispatch,
    endpoint: endpoints.getStudentDetail.url(),
    params: queries.studentDetail({
      phone: phone.replace('+86', '+'),
    }),
    headers: {
      Authorization: authorization,
    },
    communicationType: actions.GET_STUDENT_CS,
    successAction: setStudentDetail,
  });

  return true;
};

export const getStudentDetail = params => (dispatch) => {
  if (params.referrerEmail) {
    return dispatch(setPartnerDetail({
      referrerEmail: params.referrerEmail,
      referrerName: params.referrerName,
      partnerCode: params.partnerCode,
      partnerName: params.partnerName,
    }));
  }

  let formattedPhone = params.phone || null;
  let phoneTrying = false;

  if (formattedPhone) {
    if (params.phone.length === 11 && params.phone[0] === '1') {
      formattedPhone = `+86${params.phone}`;
      phoneTrying = true;
    }

    if (formattedPhone[0] !== '(' && formattedPhone[0] !== '+') {
      formattedPhone = `+${params.phone}`;
    }
  }

  fetch({
    dispatch,
    endpoint: endpoints.getStudentDetail.url(),
    params: queries.studentDetail(formatSimpleParams(
      {
        userUuid: null,
        wechatId: null,
        phone: null,
      },
      {
        userUuid: params.userUuid,
        wechatId: params.wechatId,
        phone: formattedPhone,
      },
    )),
    headers: {
      Authorization: authorization,
    },
    communicationType: actions.GET_STUDENT_CS,
    successAction: phoneTrying
      ? payload => (callbackDispatch) => {
        callbackDispatch(getStudentDetailWithUsPhone(payload, formattedPhone));
      }
      : setStudentDetail,
  });
  return true;
};
