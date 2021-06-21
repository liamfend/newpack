import React from 'react'
import { Icon, Tooltip, Select, Popconfirm } from 'antd'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import gallery, { localeMapping, uploadStatus, galleryStatus } from '~constants/gallery'
import {
  RejectedNoShadow as RejectedNoShadowIcon,
  Cover as CoverIcon,
  Hourglass as HourglassIcon,
  VideoFailed as VideoFailedIcon,
} from '~components/svgs'
import ProgressBar from '~components/property-gallery/uploading-modal/progress-bar'

const { Option } = Select

export default class PhotoItem extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      eyeShow: false,
      uploadState: props.uploadState,
      progress: props.progress,
      transcodedStatus: props.transcodedStatus,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.uploadState !== this.state.uploadState ||
      nextProps.progress !== this.state.progress ||
      nextProps.transcodedStatus !== this.state.transcodedStatus
    ) {
      this.setProgress(nextProps.uploadState, nextProps.progress, nextProps.transcodedStatus)
    }
  }

  setProgress(uploadState, progress, transcodedStatus) {
    this.setState({
      uploadState,
      progress,
      transcodedStatus,
    })
  }

  toggleHideEye = () => {
    this.setState({
      eyeShow: false,
    })
  }

  toggleShowEye = () => {
    this.setState({
      eyeShow: true,
    })
  }

  handleDeleteFile = e => {
    const { onDelete, handleDelete, type } = this.props

    onDelete(e)
    if (handleDelete && type === 'video') {
      handleDelete()
    }
  }

  render() {
    const { onCancel, onReload, t, handlePause, handleRestart, handleContinue, status } = this.props
    const { progress, transcodedStatus, uploadState } = this.state

    return (
      <div
        className={classNames(
          'photo-item__img-container',
          this.props.parentType === 'library' ? 'photo-item__img-container--library' : '',
          this.props.isSingle
            ? 'photo-item__img-container--single'
            : 'photo-item__img-container--multiple',
          this.props.className,
        )}
        role="button"
        tabIndex="0"
        onMouseOver={this.toggleShowEye}
        onMouseLeave={this.toggleHideEye}
        onDoubleClick={this.props.viewGallery}
      >
        <If condition={this.props.type === 'image'}>
          <If condition={status === 'REJECTED'}>
            <span className="photo-item__reject-photo">
              <RejectedNoShadowIcon className="photo-item__reject-photo__icon" />
            </span>
          </If>
          <img
            src={this.props.src}
            alt=""
            className={this.props.isSingle ? 'photo-item__img-single' : 'photo-item__img-multiple'}
          />
          <div
            className={classNames('photo-item__image-progress-wrapper', {
              'photo-item__image-progress-wrapper--show':
                uploadState && uploadState !== uploadStatus.SUCCESS,
            })}
          >
            <If condition={uploadState !== uploadStatus.SUCCESS}>
              <div className="photo-item__image-progress">
                <If condition={uploadState === uploadStatus.IN_PROGRESS}>
                  <button className="photo-item__image-progress-button" onClick={onCancel}>
                    <Icon className="photo-item__image-pause-icon" type="pause" />
                  </button>
                </If>
                <If condition={uploadState === uploadStatus.FAILED}>
                  <button className="photo-item__image-progress-button" onClick={onReload}>
                    <Icon className="photo-item__image-reload-icon" type="reload" />
                  </button>
                </If>
                <If condition={uploadState}>
                  <ProgressBar
                    progress={progress}
                    uploadState={uploadState}
                    className="photo-item__image-progress-bar"
                    t={this.props.t}
                    type="image"
                  />
                </If>
              </div>
            </If>
          </div>
          <If condition={this.props.isCover}>
            <CoverIcon className="photo-item__cover" />
          </If>
        </If>
        <If condition={this.props.type === 'video'}>
          <If condition={status === 'REJECTED'}>
            <span className="photo-item__reject-photo">
              <RejectedNoShadowIcon className="photo-item__reject-photo__icon" />
            </span>
          </If>
          <span className="photo-item__video-tag-wrap">
            <Icon type="video-camera" className="photo-item__video-icon" />
            <span className="photo-item__video-tag">
              {t('cms.property.listing_management.video.tag')}
            </span>
          </span>
          <Choose>
            <When condition={uploadState && uploadState !== uploadStatus.SUCCESS}>
              <div className="photo-item__video-progress-wrapper">
                <div className="photo-item__video-progress">
                  <If condition={uploadState === uploadStatus.IN_PROGRESS}>
                    <button className="photo-item__video-progress-button" onClick={handlePause}>
                      <Icon className="photo-item__video-pause-icon" type="pause" />
                    </button>
                  </If>
                  <If condition={uploadState === uploadStatus.PAUSE}>
                    <button className="photo-item__video-progress-button" onClick={handleContinue}>
                      <Icon className="photo-item__continue-icon" type="right" />
                    </button>
                  </If>
                  <If condition={uploadState === uploadStatus.FAILED}>
                    <button className="photo-item__video-progress-button" onClick={handleRestart}>
                      <Icon className="photo-item__video-reload-icon" type="reload" />
                    </button>
                  </If>

                  <If condition={uploadState}>
                    <ProgressBar
                      progress={progress}
                      uploadState={uploadState}
                      className="photo-item__video-progress-bar"
                      t={this.props.t}
                      type="video"
                    />
                  </If>
                </div>
              </div>
            </When>
            <Otherwise>
              <Choose>
                <When condition={transcodedStatus === gallery.videoStatus.waitCompress}>
                  <div className="photo-item__img-video-compress">
                    <Tooltip
                      placement={'top'}
                      title={this.props.t('cms.properties.edit.gallery.publishing_text')}
                    >
                      <div className="photo-item__img-video-compress--hover">
                        <Icon className="photo-item__img-video-icon" type="video-camera" />
                        <span>{this.props.t('cms.properties.edit.gallery.file_type.mp4')}</span>
                      </div>
                    </Tooltip>
                  </div>
                </When>
                <When condition={transcodedStatus === gallery.videoStatus.compressing}>
                  <div className="photo-item__img-video-compress">
                    <Tooltip
                      placement={'top'}
                      title={this.props.t('cms.properties.edit.gallery.compressing_text')}
                    >
                      <div className="photo-item__img-video-compress--hover">
                        <HourglassIcon className="photo-item__img-video-icon" />
                        <span>
                          {this.props.t('cms.properties.edit.gallery.video_is_compressing.text')}
                        </span>
                      </div>
                    </Tooltip>
                  </div>
                </When>
                <When condition={transcodedStatus === gallery.videoStatus.error}>
                  <div className="photo-item__img-video-compress photo-item__img-video-compress-err">
                    <Tooltip
                      placement={'top'}
                      title={this.props.t('cms.properties.edit.gallery.failed_text')}
                    >
                      <div className="photo-item__img-video-compress--hover">
                        <VideoFailedIcon className="photo-item__img-video-icon" />
                        <span>{this.props.t('cms.properties.edit.gallery.file_type.mp4')}</span>
                      </div>
                    </Tooltip>
                  </div>
                </When>
                <Otherwise>
                  <div className="photo-item__img-video-success">
                    <Icon type="play-circle" className="photo-item__video-play-icon" />
                    <img src={this.props.src} alt="" className="photo-item__img-multiple" />
                  </div>
                </Otherwise>
              </Choose>
            </Otherwise>
          </Choose>
          <div className="photo-item__video-locale">
            <span className="photo-item__locale-label">
              {t('cms.property.listing_management.video_locale.label')}
            </span>
            <Select
              className="photo-item__video-locale-selection"
              defaultValue={localeMapping.ALL}
              onChange={e => this.props.onChangeLocale(e)}
              value={this.props.locales}
            >
              <For each="locale" of={['ALL', 'CN', 'ROW']}>
                <Option key={locale} value={localeMapping[locale]} title={locale}>
                  {locale}
                </Option>
              </For>
            </Select>
          </div>
        </If>
        <If condition={this.state.eyeShow}>
          <div
            className={classNames(
              'photo-item__img-eye-modal',
              this.state.eyeShow ? 'photo-item__img-eye-fade-in' : 'photo-item__img-eye-fade-out',
            )}
            onClick={this.props.viewGallery}
            role="button"
            tabIndex="0"
          >
            <Icon className={'photo-item__img-eye-icon'} type="eye" />
          </div>
          <Choose>
            <When condition={status === galleryStatus.REJECTED}>
              <Popconfirm
                overlayClassName="photo-item__popconfirm"
                overlayStyle={{ maxWidth: 210 }}
                placement="topRight"
                title={t('cms.pending_approval.double_confirm.delete_rejected_file.title')}
                onConfirm={this.handleDeleteFile}
                okText={t('cms.properties.edit.btn.yes')}
                okType="danger"
                cancelText={t('cms.properties.edit.btn.no')}
              >
                <button
                  className={classNames(
                    'photo-item__image-button-delete',
                    this.state.eyeShow
                      ? 'photo-item__img-eye-fade-in'
                      : 'photo-item__img-eye-fade-out',
                  )}
                >
                  <Icon className="photo-item__image-delete-icon" type="delete" />
                </button>
              </Popconfirm>
            </When>
            <Otherwise>
              <button
                className={classNames(
                  'photo-item__image-button-delete',
                  this.state.eyeShow
                    ? 'photo-item__img-eye-fade-in'
                    : 'photo-item__img-eye-fade-out',
                )}
                onClick={this.handleDeleteFile}
              >
                <Icon className="photo-item__image-delete-icon" type="delete" />
              </button>
            </Otherwise>
          </Choose>
        </If>
      </div>
    )
  }
}

PhotoItem.propTypes = {
  t: PropTypes.func,
  type: PropTypes.oneOf(['image', 'video']),
  className: PropTypes.string,
  isSingle: PropTypes.bool,
  isCover: PropTypes.bool,
  src: PropTypes.string,
  uploadState: PropTypes.string,
  viewGallery: PropTypes.func.isRequired,
  parentType: PropTypes.string,
  transcodedStatus: PropTypes.string,
  progress: PropTypes.number,
  onDelete: PropTypes.func,
  onCancel: PropTypes.func,
  onReload: PropTypes.func,
  onChangeLocale: PropTypes.func,
  locales: PropTypes.string,
  handleDelete: PropTypes.func,
  handlePause: PropTypes.func,
  handleRestart: PropTypes.func,
  handleContinue: PropTypes.func,
  status: PropTypes.string,
}

PhotoItem.defaultProps = {
  t: () => {},
  type: 'image',
  className: '',
  src: '',
  isSingle: false,
  isCover: false,
  uploadState: '',
  parentType: '',
  transcodedStatus: '',
  progress: 0,
  onDelete: () => {},
  onCancel: () => {},
  onReload: () => {},
  onChangeLocale: () => {},
  locales: '',
  handleDelete: () => {},
  handlePause: () => {},
  handleRestart: () => {},
  handleContinue: () => {},
  status: '',
}
