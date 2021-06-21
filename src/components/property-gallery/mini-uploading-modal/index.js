import React from 'react'
import PropTypes from 'prop-types'
import Svg from '~components/svg'
import { Button } from 'antd'
import { uploadStatus } from '~constants/gallery'

export default class MiniUploadingModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: {
        videos: [],
        images: [],
      },
      progress: 0,
      filesNum: 0,
      successdNum: 0,
      failedNum: 0,
      status: 'upload',
    }
  }

  componentDidMount() {
    document.addEventListener('galleryUploadVideoUpdate', data => {
      this.getAllData(data.detail)
    })
  }

  componentWillUnMount() {
    document.removeEventListener('galleryUploadVideoUpdate', data => {
      this.getAllData(data.detail)
    })
  }

  getAllData = data => {
    let filesProgress = 0
    let successdFilesCount = 0
    let inProgressCount = 0
    let failedCount = 0
    const allFilesCount = data.images.length + data.videos.length

    if (data) {
      if (data.images && data.images.length > 0) {
        data.images.map(image => {
          if (image.status !== uploadStatus.SUCCESS && image.status !== uploadStatus.IN_PROGRESS) {
            filesProgress += 1
          } else {
            filesProgress += image.progress / 100
          }

          if (image.status === uploadStatus.SUCCESS) {
            successdFilesCount += 1
          } else if (image.status === uploadStatus.IN_PROGRESS) {
            inProgressCount += 1
          } else if (image.status === uploadStatus.FAILED || image.status === uploadStatus.EXCEED) {
            failedCount += 1
          }

          return true
        })
      }

      if (data.videos && data.videos.length > 0) {
        data.videos.map(video => {
          filesProgress += video.progress / 100
          if (video.status === uploadStatus.SUCCESS) {
            successdFilesCount += 1
          } else if (video.status === uploadStatus.IN_PROGRESS || !video.fileReaded) {
            inProgressCount += 1
          } else if (video.status === uploadStatus.FAILED || video.status === uploadStatus.EXCEED) {
            failedCount += 1
          }

          return true
        })
      }

      if (allFilesCount !== 0) {
        filesProgress = (filesProgress / allFilesCount) * 100
      } else {
        filesProgress = 100
      }

      this.setState({
        filesNum: allFilesCount,
        successdNum: successdFilesCount,
        failedNum: failedCount,
        progress: filesProgress,
      })

      if (inProgressCount > 0) {
        this.setState({
          status: 'upload',
        })
      } else {
        setTimeout(() => {
          this.setState({
            status: 'success',
          })
        }, 1000)
      }
    }
  }

  handleOpenModal = () => {
    const uploadingModal = document.querySelector('.gallery-uploading-modal')
    const miniModal = document.querySelector('.mini-uploading-modal')
    if (uploadingModal && miniModal) {
      let classVal = uploadingModal.getAttribute('class')
      miniModal.setAttribute('class', 'mini-uploading-modal mini-uploading-modal--hidden')
      classVal = classVal.concat(' gallery-uploading-modal--show')
      uploadingModal.setAttribute('class', classVal)
      setTimeout(() => {
        this.props.onCloseModal()
      }, 500)
    } else {
      this.props.onCloseModal()
    }

    this.props.onTabChange()
  }

  render() {
    return (
      <If condition={this.props.shrinkGalleryModal}>
        <div className="mini-uploading-modal">
          <Choose>
            <When condition={this.state.status === 'success'}>
              <Svg
                className="mini-uploading-modal__success-icon"
                hash={
                  this.state.failedNum === this.state.filesNum ? 'failed-error' : 'check-circle'
                }
              />
              <div className="mini-uploading-modal__text">
                <span className="mini-uploading-modal__success-text">
                  {this.state.successdNum}&nbsp;
                </span>
                <span>
                  {this.props.t('cms.properties.edit.gallery.mini_modal.files_succeed_text')}
                </span>
                <span className="mini-uploading-modal__hr">&nbsp;|&nbsp;</span>
                <span className="mini-uploading-modal__failed-text">
                  {this.state.failedNum}&nbsp;
                </span>
                <span>
                  {this.props.t('cms.properties.edit.gallery.mini_modal.files_filed_text')}
                </span>
              </div>
              <Button
                type="primary"
                onClick={this.handleOpenModal}
                className="mini-uploading-modal__btn"
              >
                {this.props.t('cms.properties.edit.gallery.mini_modal.check_btn')}
              </Button>
            </When>
            <When condition={this.state.status !== 'success'}>
              <button className="mini-uploading-modal__upload-btn" onClick={this.handleOpenModal}>
                <Svg className="mini-uploading-modal__upload-icon" hash="cloud-upload" />
                <span className="mini-uploading-modal__upload-text">
                  {this.props.t('cms.properties.edit.gallery.mini_modal.upload_text', {
                    filesNum: this.state.filesNum,
                  })}
                </span>
                <div className="mini-uploading-modal__progress-bar">
                  <span
                    className="mini-uploading-modal__load-bar"
                    style={{ width: `${this.state.progress}%` }}
                  />
                </div>
              </button>
            </When>
          </Choose>
        </div>
      </If>
    )
  }
}

MiniUploadingModal.propTypes = {
  t: PropTypes.func,
  shrinkGalleryModal: PropTypes.bool,
  onCloseModal: PropTypes.func,
  onTabChange: PropTypes.func,
}

MiniUploadingModal.defaultProps = {
  t: () => {},
  shrinkGalleryModal: false,
  onTabChange: () => {},
  onCloseModal: () => {},
}
