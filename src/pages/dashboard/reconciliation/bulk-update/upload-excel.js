import React from 'react';
import i18next from 'i18next';
import { Upload, Icon } from 'antd';
import PropTypes from 'prop-types';

export default function UploadExcel(props) {
  const fileProps = {
    name: 'Bulk update bookings',
    // Excel Files 97-2003 (.xls): application/vnd.ms-excel
    // Excel Files 2007+ (.xlsx): application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    /* eslint-disable-next-line max-len */
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    beforeUpload: (file) => {
      props.setSelectedFile(file);
    },
  };

  return (
    <Upload.Dragger { ...fileProps }>
      <Icon type="plus" className="upload-excel__upload-icon" />
      <div className="upload-excel__text">
        <div className="upload-excel__description">
          { i18next.t('cms.reconciliation.booking.bulk_update_modal.upload_file.description') }
        </div>
        <div className="upload-excel__tips">
          { i18next.t('cms.reconciliation.booking.bulk_update_modal.upload_file.tips') }
        </div>
      </div>
    </Upload.Dragger>
  );
}

UploadExcel.propTypes = {
  setSelectedFile: PropTypes.func.isRequired,
};

UploadExcel.defaultProps = {
  setSelectedFile: () => {},
};
