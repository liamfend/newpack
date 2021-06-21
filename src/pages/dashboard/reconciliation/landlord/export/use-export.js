import jsonExport from '~settings/jsonexport';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { toLower, get } from 'lodash';
import { showPassportName } from '~helpers';
import formatMoney from '~helpers/currency';
import { bookingPedingNoteType } from '~constants/reconciliation-booking';
import { getSecondaryStatus, getMainStatus } from '~pages/dashboard/reconciliation/utils';

const useExport = ({ getApiParams, filters, landlordId, getlist }) => {
  const { t } = useTranslation();
  let isLoading = false;

  const columns = [
    {
      title: t('cms.reconciliation.landlord.table.referenceId'),
      dataIndex: 'referenceId',
      render: (text, record) => (get(record, 'node.completedXbooking.referenceId') || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.landlord_application_id'),
      dataIndex: 'landlordApplicationId',
      render: (text, record) => (get(record, 'node.landlordApplicationId') || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.sname'),
      /* eslint-disable */ 
      render: (text, record) => (showPassportName(get(record, 'node.student', {})) || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.emailAddress'),
      render: (text, record) => (get(record, 'node.student.emailAddress') || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.property_name'),
      render: (text, record) => (get(record, 'node.completedXbooking.propertyName') || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.landlord_name'),
      render: (text, record) => (get(record, 'node.completedXbooking.landlordName') || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.roomName'),
      dataIndex: 'roomName',
      render: (text, record) => (get(record, 'node.completedXbooking.roomName') || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.billingCycle'),
      render: (text, record) => (get(record, 'node.completedXbooking.billingCycle') || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.price'),
      dataIndex: 'price',
      render: (text, record) => (
        get(record, 'node.finalPrice') ?  formatMoney(get(record, 'node.finalPrice'), get(record, 'node.currency')) : '-'
      ),
    },
    {
      title: t('cms.reconciliation.landlord.table.commission'),
      dataIndex: 'commissionValue',
      render: (text, record) => (
        get(record, 'node.completedXbooking.commission.value') ?
        formatMoney(get(record, 'node.completedXbooking.commission.value'), get(record, 'node.completedXbooking.commission.currency')) : '-'
      ),
    },
    {
      title: t('cms.reconciliation.landlord.table.commission_calculation_type'),
      dataIndex: 'commissionCalculationType',
      render: (text, record) => (get(record, 'node.completedXbooking.commission.calculationType') || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.commission_calculation_value'),
      dataIndex: 'commissionCalculationValue',
      render: (text, record) => (get(record, 'node.completedXbooking.commission.calculationValue') ?
        formatMoney(get(record, 'node.completedXbooking.commission.calculationValue'), get(record, 'node.completedXbooking.commission.currency')) : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.bonus_commission_value'),
      render: (text, record) => (get(record, 'node.completedXbooking.commission.bonusValue') ?
        formatMoney(get(record, 'node.completedXbooking.commission.bonusValue'), get(record, 'node.completedXbooking.commission.currency')) : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.bonus_commission_calculation_type'),
      render: (text, record) => (get(record, 'node.completedXbooking.commission.bonusCalculationType') || '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.bonus_commission_calculation_value'),
      render: (text, record) => (get(record, 'node.completedXbooking.commission.bonusCalculationValue') ?
        formatMoney(get(record, 'node.completedXbooking.commission.bonusCalculationValue'), get(record, 'node.completedXbooking.commission.currency')) : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.totalCommissionValue'),
      dataIndex: 'totalCommissionValue',
      render: (text, record) => (get(record, 'node.completedXbooking.commission.totalCommissionValue') ?
        formatMoney(get(record, 'node.completedXbooking.commission.totalCommissionValue'), get(record, 'node.completedXbooking.commission.currency')) : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.repeatType'),
      render: (text, record) => (get(record, 'node.repeatType') || '-')
    },
    {
      title: t('cms.reconciliation.landlord.table.final_move_in_date'),
      render: (text, record) => (get(record, 'node.finalMoveInDate') ?
        moment(get(record, 'node.finalMoveInDate')).format('DD/MM/YYYY') : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.final_move_out_date'),
      dataIndex: 'checkOutDate',
      render: (text, record) => (get(record, 'node.finalMoveOutDate') ?
        moment(get(record, 'node.finalMoveOutDate')).format('DD/MM/YYYY') : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.completedAt'),
      dataIndex: 'completedAt',
      render: (text, record) => (get(record, 'node.completedAt') ?
        moment(get(record, 'node.completedAt')).format('DD/MM/YYYY') : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.booking_status'),
      dataIndex: 'stage',
      render: (text, record) => (get(record, 'node.stage') ?
        t(`cms.reconciliation.landlord.table.stage.${toLower(get(record, 'node.stage'))}`) : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.landlord_booking_status'),
      render: (text, record) => (get(record, 'node.landlordBookingStatus') ?
        getMainStatus().getValueByKey(get(record, 'node.landlordBookingStatus')) : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.secondary_landlord_booking_status'),
      render: (text, record) => (get(record, 'node.secondaryLandlordBookingStatus') ?
        getSecondaryStatus(get(record, 'node.landlordBookingStatus')).getValueByKey(get(record, 'node.secondaryLandlordBookingStatus')) : '-'),
    },
    {
      title: t('cms.reconciliation.landlord.table.pending_note'),
      render: (text, record) => (get(record, 'node.pendingNote') && get(record, 'node.landlordBookingStatus') === 'PENDING_APPROVAL' ?
        bookingPedingNoteType[get(record, 'node.pendingNote')] : '-'),
    },
  ];

  const handleExportVisible = useCallback(() => {
    if (!isLoading) {
      isLoading = true;
      const newFilters = getApiParams(filters);
      newFilters.pageSize = 9999;
      newFilters.pageNumber = 1;
      newFilters.landlordId = landlordId;

      getlist(newFilters, {
        successCallback: (data) => {
          const edges = get(data, 'listLandlordReconciliationOpportunities.edges', []);
          jsonExport(columns, edges, 'Accommodation partner booking list');
        },
        isExport: true,
        finishCallback: () => {
          isLoading = false;
        },
      });
    }
  }, [filters, landlordId, isLoading]);

  return { handleExportVisible };
};

export default useExport;
