import React from 'react';
import i18next from 'i18next';
import { Spin } from 'antd';

export default function Loading() {
  return (
    <div className="loading-wrap">
      <Spin size="large" className="loading-wrap__loading-spin" />
      <div className="loading-wrap__loading-description">
        { i18next.t('cms.reconciliation.booking.bulk_update_modal.loading.description') }
      </div>
    </div>
  );
}
