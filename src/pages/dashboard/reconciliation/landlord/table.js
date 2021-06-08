import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { get, toLower } from 'lodash';
import { Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { communicationStatus } from '~client/constants';
import { showPassportName } from '~helpers';
import formatMoney from '~helpers/currency';
import { bookingPedingNoteType } from '~constants/reconciliation-booking';
import { getSecondaryStatus, getMainStatus } from '~pages/dashboard/reconciliation/utils';

/* eslint-disable   */
export default function table({ onRow, communication, rowKeys, list, pageNumber, pageSize, onChange, handlePageSizeChange }) {
  const [selectedRowKeys, setselectedRowKeys] = useState([]);
  const MAINSTATE = getMainStatus();
  const { t } = useTranslation();
  const rowSelection = {
    selectedRowKeys,
    onChange: ( rowkeys) => {
      setselectedRowKeys(rowkeys);
    },
  };

  useEffect(()=>{
    rowKeys && rowKeys(selectedRowKeys)
  },[selectedRowKeys])

  const getColumns = ()=>{
    var columns = [
      {
        title: t('cms.reconciliation.landlord.table.property_name'),
        dataIndex: 'propertyName', 
        fixed: 'left',
        width: 200,
        render: (text, record) => (
          <span className="">
            { get(record, 'node.completedXbooking.propertyName') || '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.sname'),
        dataIndex: 'sname',
        render: (text, record) => (
          <span className="">
            { showPassportName(get(record, 'node.student', {})) || '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.emailAddress'),  
        dataIndex: 'emailAddress', 
        width: 320,
        render: (text, record) => (
          <span className="">
            { get(record, 'node.student.emailAddress') || '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.stage'),
        dataIndex: 'stage',
        render: (text, record) => (
          <span className="">
            { get(record, 'node.stage') ?
              t(`cms.reconciliation.landlord.table.stage.${toLower(get(record, 'node.stage'))}`) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.final_move_in_date'), 
        dataIndex: 'finalMoveInDate', 
        render: (text, record) => (
          <span className="">
            { get(record, 'node.finalMoveInDate') ? moment(get(record, 'node.finalMoveInDate')).format('DD/MM/YYYY') : '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.final_move_out_date'), 
        dataIndex: 'finalMoveOutDate',
        render: (text, record) => (
          <span className="">
            { get(record, 'node.finalMoveOutDate') ?  moment(get(record, 'node.finalMoveOutDate')).format('DD/MM/YYYY')  : '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.completedAt'), 
        dataIndex: 'completedAt',
        render: (text, record) => (
          <span className=""> 
            { get(record, 'node.completedAt') ?  moment(get(record, 'node.completedAt')).format('DD/MM/YYYY') : '-' } 
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.referenceId'), 
        dataIndex: 'referenceId',
        render: (text, record) => (
          <span className="">
            { get(record, 'node.completedXbooking.referenceId') || '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.landlord_application_id'), 
        dataIndex: 'landlordApplicationId',
        render: (text, record) => (
          <span className="">
            { get(record, 'node.landlordApplicationId') || '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.roomName'), 
        dataIndex: 'roomName',
        render: (text, record) => (
          <span className="">
            { get(record, 'node.completedXbooking.roomName') || '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.price'), 
        dataIndex: 'price',
        render: (text, record) => (
          <span className="">
            { get(record, 'node.finalPrice') ?  formatMoney(get(record, 'node.finalPrice'), get(record, 'node.currency')) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.commissionValue'), 
        dataIndex: 'commissionValue',
        render: (text, record) => (
          <span className="">
            { get(record, 'node.completedXbooking.commission.value') ?
              formatMoney(get(record, 'node.completedXbooking.commission.value'), get(record, 'node.completedXbooking.commission.currency')) : '-' }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.landlordBookingStatus'), 
        dataIndex: 'landlordBookingStatus',
        render: (text, record) => (
          <span className="">
            {
              get(record, 'node.landlordBookingStatus') ?
              MAINSTATE.getValueByKey(get(record, 'node.landlordBookingStatus')) : '-'
            }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.secondaryLandlordBookingStatus'), 
        dataIndex: 'secondaryLandlordBookingStatus',
        render: (text, record) => (
          <span className="">
            {
              get(record, 'node.secondaryLandlordBookingStatus') ?
              getSecondaryStatus(get(record, 'node.landlordBookingStatus')).getValueByKey(get(record, 'node.secondaryLandlordBookingStatus')) : '-'
            }
          </span>
        ),
      },
      {
        title: t('cms.reconciliation.landlord.table.pending_note'),
        dataIndex: 'pendingNote',
        render: (text, record) => (
          <span className="">
            { get(record, 'node.pendingNote') && get(record, 'node.landlordBookingStatus') === 'PENDING_APPROVAL' ?
              bookingPedingNoteType[get(record, 'node.pendingNote')] : '-' }
          </span>
        ),
      },
    ]
    
    return columns
  } 
  return (
    <div>
      <Table 
        rowSelection={rowSelection}
        columns={getColumns()}
        rowKey = {record => record.node.id}
        scroll={{ x: 3000 }}
        onRow={onRow}
        loading={get(communication, 'list.status') === communicationStatus.FETCHING}
        dataSource={ list.payload || []}
        pagination={{
            current: pageNumber,
            pageSize: pageSize, 
            hideOnSinglePage: false, 
            showSizeChanger: true,
            total: list.total ,
            onChange: onChange,  
            onShowSizeChange: handlePageSizeChange,
        }}
      /> 
    </div>
  );
}
