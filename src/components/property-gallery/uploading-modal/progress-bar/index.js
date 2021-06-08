import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatBytes } from '~helpers/gallery';
import gallery, { uploadStatus } from '~constants/gallery';

export default class ProgressBar extends React.PureComponent {
  render() {
    const { className } = this.props;
    const { progress, uploadState, type } = this.props;
    const newProgress = progress > 99 ? 99 : progress;

    return (
      <div>
        <If condition={ uploadState === uploadStatus.EXCEED }>
          <span className="gallery-uploading__failed-text">
            {this.props.t('cms.properties.edit.gallery.progress_bar.exceed_tip', {
              size: type ? formatBytes(gallery.media[type].size) : 10,
            })}
          </span>
        </If>
        <div className={ classNames('gallery-uploading__progress', className, {
          'gallery-uploading__progress-exceed': uploadState === uploadStatus.EXCEED,
        }) }
        >
          <span
            className={ classNames('gallery-uploading__progress-bar', {
              'gallery-uploading__progress-bar--failed':
              uploadState === uploadStatus.FAILED || uploadState === uploadStatus.EXCEED,
            }) }
            style={
              { width: `${
                uploadState === uploadStatus.SUCCESS
                || uploadState === uploadStatus.FAILED
                || uploadState === uploadStatus.EXCEED
                  ? 100 : newProgress
              }%` }
            }
          />
        </div>
      </div>
    );
  }
}

ProgressBar.propTypes = {
  t: PropTypes.func,
  progress: PropTypes.number,
  uploadState: PropTypes.oneOf([
    ...Object.keys(uploadStatus),
  ]),
  className: PropTypes.string,
  type: PropTypes.oneOf([
    'image',
    'video',
  ]),
};

ProgressBar.defaultProps = {
  className: '',
  progress: 0,
  uploadState: uploadStatus.IN_PROGRESS,
  t: () => {},
  type: 'image',
};
