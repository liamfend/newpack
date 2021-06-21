import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { first, get } from 'lodash';
import moment from 'moment';
import { message } from 'antd';
import { useDispatch } from 'react-redux';
import formatPrice from '~helpers/currency';
import { getListingMoveInType, stringDateFormat, getMainStatus, getDailyStr } from '~pages/dashboard/reconciliation/utils';
import { getReconciliationOpportunityDetails, checkActiveOpportunityCasesExist, createOpportunityCase, reconciliationUpdateOpportunity, getbookingPendingNotes } from '~actions/reconciliation/bookinglist';
import usePageInfo from '~pages/dashboard/reconciliation/booking-details/pageInfo';
import { bookingLandlordStatus, secondaryLandlordBookingStatus, bookingPedingNote } from '~constants/reconciliation-booking';

const useOpportunityDetails = ({ opportunityId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const MAINSTATE = getMainStatus();
  const [opportunityDetail, setOpportunityDetail] = useState(null);
  const [lastNote, setLastNote] = useState(null);
  const [isLockConfirm, setLockConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isShowCloseCaseModal, setShowCloseCaseModal] = useState(false);
  const [changeBookingBtnDisabled, setChangeBookingBtnDisabled] = useState(false);
  const [landlordBookingStatus, setLandlordBookingStatus] = useState(null);
  const [opportunityActive, setOpportunityActive] = useState(true);
  const [isShowBookingModal, setShowBookingModal] = useState(false);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [isLockCreateCase, setIsLockCreateCase] = useState(false);
  const pageInfo = usePageInfo();

  useEffect(() => {
    dispatch(getReconciliationOpportunityDetails({ id: opportunityId }, (response) => {
      const resOpportunityDetail = get(response, 'getReconciliationOpportunityDetails.reconciliationOpportunityDetails');
      // check exist to control is should be show assin to booking team
      if (resOpportunityDetail) {
        setOpportunityDetail(resOpportunityDetail);

        if (get(resOpportunityDetail, 'landlordBookingStatus') === bookingLandlordStatus.PENDING_APPROVAL) {
          dispatch(getbookingPendingNotes({ opportunityId }, (notes) => {
            setLastNote(first(notes));
          }));
        } else {
          setLastNote(null);
        }

        checkActiveOpportunityCasesExist({
          opportunityId: get(resOpportunityDetail, 'id'),
        }, (checkdata) => {
          if (checkdata && checkdata.checkActiveOpportunityCasesExist) {
            setOpportunityActive(checkdata.checkActiveOpportunityCasesExist.exist);
          }
        });
      }
    }));
  }, [landlordBookingStatus, updateCounter, opportunityId]);

  const columns = [
    {
      title: t('cms.reconciliation.booking.details.table.label.Propertyname'),
      width: '25%',
      dataIndex: 'aa',
      render: (text, record) => get(record, 'completedXbooking.propertyName'),
    },
    {
      title: t('cms.reconciliation.booking.details.table.label.Roomname'),
      width: '25%',
      render: (text, record) => get(record, 'completedXbooking.roomName'),
    },
    {
      title: t('cms.reconciliation.booking.details.table.label.Tendency'),
      width: '25%',
      render: (text, record) => (
        <div>
          <div>{`${t('cms.reconciliation.booking.details.table.label.Tendency.movein')}: ${getListingMoveInType(get(record, 'completedXbooking.listingMoveInType'))} ${stringDateFormat(get(record, 'completedXbooking.listingMoveIn'))}`}</div>
          <div>{`${t('cms.reconciliation.booking.details.table.label.Tendency.moveout')}: ${getListingMoveInType(get(record, 'completedXbooking.listingMoveOutType'))} ${stringDateFormat(get(record, 'completedXbooking.listingMoveOut'))}`}</div>
        </div>
      ),
    },
    {
      title: t('cms.reconciliation.booking.details.table.label.Listingprice'),
      width: '25%',
      render: (text, record) => `${formatPrice(get(record, 'completedXbooking.unitPrice'), get(record, 'currency'))} / ${getDailyStr(get(record, 'completedXbooking.billingCycle'))}`,
    },
  ];

  const handleToggleEditOpportunityModal = () => {
    setShowBookingModal(originalState => !originalState);
  };

  const handleClickConfirm = (form) => {
    if (isLockConfirm) {
      return;
    }

    setLockConfirm(true);

    form.validateFields(['finalMoveInDate', 'finalMoveOutDate', 'finalPrice']);

    if (
      !form.getFieldValue('finalMoveInDate') ||
      !form.getFieldValue('finalMoveOutDate') ||
      !form.getFieldValue('finalPrice')
    ) {
      setLockConfirm(false);
      return;
    }

    setOpportunityDetail({
      ...opportunityDetail,
      finalMoveInDate: form.getFieldValue('finalMoveInDate'),
      finalMoveOutDate: form.getFieldValue('finalMoveOutDate'),
      finalPrice: form.getFieldValue('finalPrice'),
    });

    const params = {
      finalMoveInDate: moment(form.getFieldValue('finalMoveInDate')).format('YYYY-MM-DD'),
      finalMoveOutDate: moment(form.getFieldValue('finalMoveOutDate')).format('YYYY-MM-DD'),
      finalPrice: parseFloat(form.getFieldValue('finalPrice'), 10),
      id: get(opportunityDetail, 'id'),
    };

    dispatch(reconciliationUpdateOpportunity(params, {
      successCallback: (data) => {
        if (data) {
          setShowBookingModal(false);
          message.success(t('cms.reconciliation.booking.details.qualified.saved.successfully'));
        }
      },
      finishCallback: () => {
        setLockConfirm(false);
      },
    }));
  };

  const handleChangeBookingStatus = () => {
    setChangeBookingBtnDisabled(true);
    checkActiveOpportunityCasesExist({
      opportunityId: get(opportunityDetail, 'id'),
    }, (casesExist) => {
      setShowCloseCaseModal(casesExist.checkActiveOpportunityCasesExist.exist);
      setShowStatusModal(!casesExist.checkActiveOpportunityCasesExist.exist);
      setChangeBookingBtnDisabled(false);
    }, () => {
      setChangeBookingBtnDisabled(false);
    },
    );
  };

  const handleClickAssign = () => {
    if (isLockCreateCase) {
      return;
    }

    setIsLockCreateCase(true);

    const params = {
      opportunityId: get(opportunityDetail, 'id'),
    };

    dispatch(createOpportunityCase(params, (data) => {
      if (data) {
        message.success(t('cms.reconciliation.booking.details.comment.assign.exist.success'));
        setOpportunityActive(true);
      }
      setIsLockCreateCase(false);
    }));
  };

  const showLogicManualCase = pendingNoteItem => (
    pendingNoteItem.pendingNote === bookingPedingNote.MISCELLANEOUS
      && get(opportunityDetail, 'landlordBookingStatus') === bookingLandlordStatus.PENDING_APPROVAL
      && get(opportunityDetail, 'secondaryLandlordBookingStatus') === secondaryLandlordBookingStatus.PENDING_START
      && !opportunityActive
  );

  return {
    handleToggleEditOpportunityModal,
    handleClickConfirm,
    handleChangeBookingStatus,
    handleClickAssign,
    showLogicManualCase,
    setShowStatusModal,
    setShowCloseCaseModal,
    setChangeBookingBtnDisabled,
    setLandlordBookingStatus,
    setUpdateCounter,
    MAINSTATE,
    lastNote,
    showStatusModal,
    isShowCloseCaseModal,
    isShowBookingModal,
    changeBookingBtnDisabled,
    pageInfo,
    opportunityDetail,
    columns,
    opportunityActive,
    updateCounter,
  };
};

export default useOpportunityDetails;
