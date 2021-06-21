import React from 'react';
import PropTypes from 'prop-types';
import { Prompt } from 'react-router-dom';
import { Icon, Modal } from 'antd';
import { CloudUpload as CloudUploadIcon } from "~components/svgs";
import { uploadStatus } from '~constants/gallery';
import { getFileType } from '~helpers/gallery';

const confirm = Modal.confirm;

export default class UploadProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      filesNum: 0,
      successdNum: 0,
      failedNum: 0,
      status: 'upload',
      isShow: false,
      confirmedNavigation: false,
    };
    this.fileList = null;
  }

  componentDidMount() {
    document.addEventListener('galleryUploadProgress', this.galleryUploadProgress);
    document.addEventListener('updateGallerySuccess', this.updateGallerySuccess);
  }

  componentWillUnMount() {
    document.removeEventListener('galleryUploadProgress', this.galleryUploadProgress);
    document.removeEventListener('updateGallerySuccess', this.updateGallerySuccess);
  }

  galleryUploadProgress = (data) => {
    this.fileList = data.detail;
    this.getUploadData(data.detail);
  }

  updateGallerySuccess = () => {
    this.setState({ isShow: false });
    this.setFilesHaveRead();
  }

  getUploadData = (data) => {
    let filesProgress = 0;
    let successdFilesCount = 0;
    let inProgressCount = 0;
    let failedCount = 0;

    const uploadFiles = Object.values(data)
      .reduce((allFiles, list) => [
        ...allFiles,
        ...list.filter(file => file.uploadState && !file.read),
      ]);
    const allFilesCount = uploadFiles.length;

    if (!this.state.isShow) {
      this.setState({
        isShow: true,
      });
    }
    if (uploadFiles.length > 0) {
      uploadFiles.map((file) => {
        if (getFileType(file.contentType) === 'image') {
          if (
            file.uploadState === uploadStatus.SUCCESS ||
            file.uploadState === uploadStatus.IN_PROGRESS
          ) {
            filesProgress += file.progress / 100;
          }

          if (file.uploadState === uploadStatus.SUCCESS) {
            successdFilesCount += 1;
          } else if (file.uploadState === uploadStatus.IN_PROGRESS) {
            inProgressCount += 1;
          } else if (
            file.uploadState === uploadStatus.FAILED ||
            file.uploadState === uploadStatus.EXCEED
          ) {
            failedCount += 1;
          }

          return true;
        }

        if (getFileType(file.contentType) === 'video') {
          filesProgress += file.progress / 100;
          if (file.uploadState === uploadStatus.SUCCESS) {
            successdFilesCount += 1;
          } else if (file.uploadState === uploadStatus.IN_PROGRESS || !file.fileReaded) {
            inProgressCount += 1;
          } else if (
            file.uploadState === uploadStatus.FAILED ||
            file.uploadState === uploadStatus.EXCEED
          ) {
            failedCount += 1;
          }

          return true;
        }

        return true;
      });

      if (allFilesCount !== 0) {
        filesProgress = Math.floor((filesProgress / allFilesCount) * 100);
      } else {
        filesProgress = 100;
      }

      this.setState({
        filesNum: allFilesCount,
        successdNum: successdFilesCount,
        failedNum: failedCount,
        progress: filesProgress,
      });

      if (inProgressCount > 0) {
        this.setState({
          status: 'upload',
        });
      } else {
        setTimeout(() => {
          this.setState({
            status: 'success',
          });
        }, 1000);
      }
    } else {
      this.setState({
        progress: 0,
        filesNum: 0,
        successdNum: 0,
        failedNum: 0,
        status: 'upload',
        isShow: false,
        confirmedNavigation: false,
      });
    }
  }

  getSuccessPercent = () => {
    const { filesNum, successdNum } = this.state;
    return Math.floor((filesNum / successdNum) * 100);
  }

  handleClickGotIt = () => {
    this.setState({ isShow: false });
    this.setFilesHaveRead();
  }

  setFilesHaveRead = () => {
    if (!this.fileList) {
      return;
    }
    Object.values(this.fileList).map((list) => {
      list.map((file) => {
        if (file.uploadState) {
          return Object.assign(file, { read: true });
        }

        return true;
      });
      return true;
    });
  }

  handleClickNavigation = (location) => {
    const { t } = this.props;
    const { confirmedNavigation } = this.state;
    if (!confirmedNavigation) {
      confirm({
        title: t('cms.property.listing_management.leave_alert.title'),
        content: t('cms.property.listing_management.leave_alert.exist_page'),
        okText: t('cms.property.listing_management.leave_alert.button.yes'),
        cancelText: t('cms.property.listing_management.leave_alert.button.no'),
        onOk: () => { this.handleConfirmNavigationClick(location); },
      });

      return false;
    }

    return true;
  }

  handleConfirmNavigationClick = (location) => {
    const { history } = this.props;
    this.setState({
      confirmedNavigation: true,
    }, () => {
      history.push(location.pathname + location.search);
    });
  }

  render() {
    if (this.state.filesNum === 0 || !this.state.isShow) {
      return null;
    }
    return (
      <div className="upload-progress">
        <Prompt
          when={ this.state.status === 'upload' }
          message={ this.handleClickNavigation }
        />
        <Choose>
          <When condition={ this.state.status === 'success' }>
            <div className="upload-progress__text-wrap">
              <Choose>
                <When condition={ this.state.failedNum > 0 }>
                  <Icon type="exclamation-circle" className="upload-progress__fail-icon" />
                </When>
                <Otherwise>
                  <Icon type="check" className="upload-progress__success-icon" />
                </Otherwise>
              </Choose>
              <span className="upload-progress__success-text">{ this.state.successdNum }</span>
              { this.props.t('cms.property.listing_management.gallery.upload_progress.files_succeed') }
              <span className="upload-progress__failed-text">{ this.state.failedNum }</span>
              { this.props.t('cms.property.listing_management.gallery.upload_progress.files_filed') }
              <span
                role="presentation"
                onClick={ this.handleClickGotIt }
                className="upload-progress__got-it"
              >
                { this.props.t('cms.property.listing_management.gallery.upload_progress.got_it.btn') }
              </span>
            </div>
          </When>
          <When condition={ this.state.status === 'upload' }>
            <div className="upload-progress__upload-wrap">
              <span className="upload-progress__icon-wrap">
                <CloudUploadIcon className="upload-progress__upload-icon" />
                <span className="upload-progress__upload-text">
                  { this.props.t('cms.properties.edit.gallery.mini_modal.upload_text', {
                    filesNum: this.state.filesNum,
                  }) }
                </span>
              </span>
              <span className="upload-progress__progress-value">
                { this.state.progress }%
              </span>
            </div>
            <div className="upload-progress__progress-bar">
              <span
                className="upload-progress__load-bar"
                style={ { width: `${this.state.progress}%` } }
              />
            </div>
          </When>
        </Choose>
      </div>
    );
  }
}

UploadProgress.propTypes = {
  t: PropTypes.func.isRequired,
  history: PropTypes.object,
};

UploadProgress.defaultProps = {
  t: () => {},
  history: {},
};
