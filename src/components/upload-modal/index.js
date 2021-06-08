import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Upload, Icon } from 'antd';

const UploadModal = ({ title, accept, uploadUrl, visible, onClose, onUploading, t }) => (
  <Modal
    visible={ visible }
    title={ title }
    onCancel={ onClose }
    footer={ false }
    className="properties-form__modal"
    width={ 480 }
  >
    <div className="properties-form__upload-container">
      <Upload.Dragger
        name="file"
        multiple={ false }
        accept={ accept }
        action={ uploadUrl }
        onChange={ onUploading }
      >
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">{ t('cms.upload.upload_listing.title') }</p>
      </Upload.Dragger>
    </div>
  </Modal>
);

UploadModal.propTypes = {
  title: PropTypes.string.isRequired,
  accept: PropTypes.string,
  uploadUrl: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onUploading: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

UploadModal.defaultProps = {
  title: '',
  accept: '',
  uploadUrl: '',
  visible: false,
  onClose: () => {},
  onUploading: () => {},
  t: () => {},
};

export default UploadModal;
