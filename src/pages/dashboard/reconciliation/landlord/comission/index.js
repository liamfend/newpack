import React from 'react';
import { Table, Icon, Spin } from 'antd';
import formatPrice from '~helpers/currency';
import i18next from 'i18next';
import accounting from 'accounting';
/* eslint-disable   */

export default function index({ onClose, loading, data }) {
  const columns = [
    {
      title: i18next.t('cms.reconciliation.landlord.commission.property_name'),
      dataIndex: 'propertyName',
      className: 'commissiontable',
      render: (name) => name || '-',
    },
    {
      title: i18next.t('cms.reconciliation.landlord.commission.currency'),
      dataIndex: 'currency',
    },
    {
      title: i18next.t('cms.reconciliation.landlord.commission.commission_value'),
      dataIndex: 'totalCommission',
      render: (txt, record) => accounting.formatNumber(record.totalCommission, 2),
    },
  ];

  return (
    <div className="reconciliation-commission">
      <Icon type="close" className="close" onClick={ onClose } />
      <Choose>
        <When condition={ loading } >
          <Spin className="reconciliation-commission__loading" />
        </When>
        <Otherwise>
          <div className="header">
            { i18next.t('cms.reconciliation.landlord.commission.title') }
          </div>
          <div className="reconciliation-commission__dashboard-reminder">
            <Icon
              theme="filled"
              type="exclamation-circle"
              className="reconciliation-commission__reminder-icon"
            />
            { i18next.t('cms.reconciliation_list.dashboard_modal.reminder') }
          </div>
          <div className="header-notes">
            { i18next.t('cms.reconciliation.landlord.commission.total') }
          </div>
          <div className="box-wapper">
            {
              data.currencyGroup.map( (item,index) =>
                <div className="box" key={`box_${index}`}>
                  <div className="total-label">{item.currency} Total</div>
                  <div className="total">{formatPrice(item.totalCommission,item.currency) } </div>
                </div>
              )
            }
          </div>
          <div className="header-notes">
            {i18next.t('cms.reconciliation.landlord.commission.detail')}
          </div>
          <div className="comission-table">
            <Table
              bordered
              columns={ columns }
              pagination={ false }
              rowKey={ (item,i) => i.toString(16) }
              dataSource={ data.propertyGroup }
            />
          </div>

        </Otherwise>
      </Choose>
    </div>
  );
}
