import React from 'react';
import i18next from 'i18next';

export default function UploadSuccess() {
  return (
    <div className="upload-success">
      <div className="upload-success__title">
        { i18next.t('cms.reconciliation.booking.bulk_update_success.title') }
      </div>
      <div className="upload-success__description">
        { i18next.t('cms.reconciliation.booking.bulk_update_success.description') }
      </div>
      <div className="upload-success__tip-wrap">
        <img
          className="upload-success__tip-image"
          src="/public/bulk_update_tip.png"
          alt="bulk_update_tip"
        />
      </div>
    </div>
  );
}
