import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import { Modal, Button, Form } from 'antd';
import UploadSuccess from '~client/pages/dashboard/reconciliation/bulk-update/upload-success';
import Loading from '~pages/dashboard/reconciliation/bulk-update/loading';
import File from '~pages/dashboard/reconciliation/bulk-update/file';
import UploadExcel from '~pages/dashboard/reconciliation/bulk-update/upload-excel';
import useBulkUpdate from './useBulkUpdate';

const BulkUpdate = ({ cancel, openBulkHistory }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    handleClickConfirmUpload,
    isLoading,
    isUploadSuccess,
  } = useBulkUpdate({ selectedFile, cancel, openBulkHistory });

  const handleClickCheckBulkHistory = useCallback(() => {
    cancel();
    openBulkHistory();
  }, []);

  const uploadFileFooter = [
    <Button key="back" onClick={ cancel }>
      { i18next.t('cms.reconciliation.booking.cancel_bulk.button') }
    </Button>,
    <Button
      key="submit"
      type="primary"
      onClick={ handleClickConfirmUpload }
      disabled={ !selectedFile }
    >
      { i18next.t('cms.reconciliation.booking.confirm_bulk.button') }
    </Button>,
  ];

  const uploadLoadingFooter = [
    <Button
      key="gotIt"
      type="primary"
      onClick={ cancel }
      disabled={ isLoading }
    >
      { i18next.t('cms.reconciliation.booking.bulk_update_modal.got_it.btn') }
    </Button>,
  ];

  const uploadSuccessFooter = [
    <Button key="checkBulkHistory" onClick={ handleClickCheckBulkHistory }>
      { i18next.t('cms.reconciliation.booking.button.check_bulk_history') }
    </Button>,
    <Button
      key="gotIt"
      type="primary"
      onClick={ cancel }
    >
      { i18next.t('cms.reconciliation.booking.bulk_update_modal.got_it.btn') }
    </Button>,
  ];

  const getFooter = useCallback(() => {
    if (isLoading) {
      return uploadLoadingFooter;
    }
    if (isUploadSuccess) {
      return uploadSuccessFooter;
    }

    return uploadFileFooter;
  }, [isLoading, isUploadSuccess, selectedFile]);

  return (
    <Modal
      width={ 454 }
      maskClosable={ false }
      centered
      zIndex={ 99 }
      visible
      onCancel={ cancel }
      className="bulk-update-modal"
      footer={ getFooter() }
    >
      <Choose>
        <When condition={ isUploadSuccess }>
          <UploadSuccess />
        </When>
        <Otherwise>
          <div className="bulk-update-modal__title">
            { i18next.t('cms.reconciliation.booking.bulk_update_bookings.title') }
          </div>
          <Form layout="vertical">
            <Form.Item label={ i18next.t('cms.reconciliation.booking.bulk_update_modal.upload_temple.label') }>
              <Choose>
                <When condition={ isLoading }>
                  <Loading />
                </When>
                <When condition={ selectedFile }>
                  <File
                    selectedFile={ selectedFile }
                    setSelectedFile={ setSelectedFile }
                  />
                </When>
                <Otherwise>
                  <UploadExcel
                    setSelectedFile={ setSelectedFile }
                  />
                </Otherwise>
              </Choose>
            </Form.Item>
          </Form>
        </Otherwise>
      </Choose>
    </Modal>
  );
};

BulkUpdate.propTypes = {
  cancel: PropTypes.func.isRequired,
  openBulkHistory: PropTypes.func,
};

BulkUpdate.defaultProps = {
  cancel: () => {},
  openBulkHistory: () => {},
};

export default Form.create({ name: 'bulk-update' })(BulkUpdate);
