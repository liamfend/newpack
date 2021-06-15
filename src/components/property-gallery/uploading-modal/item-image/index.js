import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'
import classNames from 'classnames'
import ProgressBar from '~components/property-gallery/uploading-modal/progress-bar'
import { uploadStatus } from '~constants/gallery'

export default class ItemImage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      status: props.item.status,
      progress: props.item.progress,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.item.status !== this.state.status ||
      nextProps.item.progress !== this.state.progress
    ) {
      this.setProgress(nextProps.item.status, nextProps.item.progress)
    }
  }

  setProgress(status, progress) {
    this.setState({
      status,
      progress,
    })
  }

  render() {
    const { className, item, onDelete, onCancel, onReload } = this.props
    const { status, progress } = this.state
    return (
      <div className={classNames('gallery-uploading__image', className)}>
        <div className="gallery-uploading__image-wrapper">
          <img className="gallery-uploading__image-source" alt="" src={item.url} />
          <button className="gallery-uploading__image-button-delete" onClick={onDelete}>
            <Icon className="gallery-uploading__image-delete-icon" type="delete" />
          </button>
          <div
            className={classNames('gallery-uploading__image-progress-wrapper', {
              'gallery-uploading__image-progress-wrapper--success': status === uploadStatus.SUCCESS,
              'gallery-uploading__image-progress-wrapper--in-progress':
                status === uploadStatus.IN_PROGRESS,
              'gallery-uploading__image-progress-wrapper--failed':
                status === uploadStatus.FAILED || status === uploadStatus.EXCEED,
            })}
          >
            <If condition={status !== uploadStatus.SUCCESS}>
              <div className="gallery-uploading__image-progress">
                <If condition={status === uploadStatus.IN_PROGRESS}>
                  <button className="gallery-uploading__image-progress-button" onClick={onCancel}>
                    <Icon className="gallery-uploading__image-pause-icon" type="pause" />
                  </button>
                </If>
                <If condition={status === uploadStatus.FAILED}>
                  <button className="gallery-uploading__image-progress-button" onClick={onReload}>
                    <Icon className="gallery-uploading__image-reload-icon" type="reload" />
                  </button>
                </If>
                <ProgressBar
                  progress={progress}
                  status={status}
                  className="gallery-uploading__image-progress-bar"
                  t={this.props.t}
                  type="image"
                />
              </div>
            </If>
          </div>
        </div>
        <span className="gallery-uploading__image-title" title={item.file.name}>
          {item.file.name}
        </span>
      </div>
    )
  }
}

ItemImage.propTypes = {
  className: PropTypes.string,
  item: PropTypes.shape({
    file: PropTypes.instanceOf(File).isRequired,
    contentType: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    progress: PropTypes.number,
    status: PropTypes.oneOf([...Object.keys(uploadStatus)]),
  }).isRequired,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onReload: PropTypes.func,
  t: PropTypes.func,
}

ItemImage.defaultProps = {
  className: '',
  onCancel: () => {},
  onDelete: () => {},
  onReload: () => {},
  t: () => {},
}
