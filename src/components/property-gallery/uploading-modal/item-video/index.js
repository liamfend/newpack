import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Select, Icon, Spin, Popconfirm } from 'antd';
import { Video as VideoIcon } from "~components/svgs";
import ProgressBar from '~components/property-gallery/uploading-modal/progress-bar';
import { uploadStatus, localeMapping } from '~constants/gallery';

const { Option } = Select;

export default class ItemVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: props.item.status,
      progress: props.item.progress,
      showLoading: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.item.status !== this.state.status ||
      nextProps.item.progress !== this.state.progress
    ) {
      this.setProgress(nextProps.item.status, nextProps.item.progress);
    }
  }

  setLoading = (showLoading) => {
    this.setState({ showLoading });
  }

  setProgress(status, progress) {
    const state = { status };
    if (status === uploadStatus.IN_PROGRESS) {
      state.progress = progress;
    }
    this.setState(state);
  }

  handleDelete = () => {
    this.props.handleDeleteVideo(this.props.item);
    if (this.props.item.handleDelete) {
      this.props.item.handleDelete();
    }
  }

  getVideoLocale = (e) => {
    const newItem = this.props.item;
    newItem.response.locales = e;
    this.props.onChangeLocale(newItem);
  }

  handleVideoRestart = () => {
    this.setState({ showLoading: true });
    if (this.props.item.handleRestart) {
      this.props.item.handleRestart();
    } else {
      this.props.handleRetryUpload(this.props.item);
    }
  };

  render() {
    const { t, item } = this.props;
    return (
      <div className={ classNames('gallery-uploading__video',
        { 'gallery-uploading__video--failed':
          [uploadStatus.EXCEED, uploadStatus.FAILED].indexOf(this.props.item.status) !== -1,
        'gallery-uploading__video--last': this.props.isLast },
      ) }
      >
        <Choose>
          <When condition={ this.state.showLoading &&
            [uploadStatus.EXCEED, uploadStatus.FAILED].indexOf(this.props.item.status) === -1 }
          >
            <div className="gallery-uploading__loading"><Spin /></div>
          </When>
          <Otherwise>
            <div className="gallery-uploading__video-title">
              <span className="gallery-uploading__video-icon-wrapper">
                <VideoIcon className="gallery-uploading__video-icon" />
                <If condition={ this.props.item.status === uploadStatus.FAILED }>
                  <Icon className="gallery-uploading__video-failed-icon" type="exclamation-circle" theme="filled" />
                </If>
              </span>
              <div className="gallery-uploading__video-name">
                <div className="gallery-uploading__name">
                  { item.file.name }
                  <span className="gallery-uploading__video-size">
                    {`(${Math.floor(item.size / 1024 / 1024).toFixed(2)}M)`}
                  </span>
                  <span className="gallery-uploading__video-progress-value">
                    <Choose>
                      <When condition={ [uploadStatus.IN_PROGRESS, uploadStatus.PAUSE]
                        .indexOf(this.props.item.status) !== -1
                      }
                      >
                        { this.state.progress }%
                      </When>
                      <Otherwise>
                        { item.progress }%
                      </Otherwise>
                    </Choose>
                  </span>
                </div>
                <If condition={
                  [uploadStatus.IN_PROGRESS, uploadStatus.PAUSE]
                    .indexOf(this.props.item.status) !== -1
                }
                >
                  <ProgressBar
                    ref={ (e) => { this.progress = e; } }
                    className="gallery-uploading__video-progress"
                    progress={ this.state.progress || 1 }
                  />
                </If>
              </div>
            </div>
            <div className="gallery-uploading__video-locale">
              {t('cms.properties.edit.gallery.uploading.set_locale')}
              <Select
                className="gallery-uploading__video-locale-selection"
                defaultValue={ localeMapping.ALL }
                onChange={ this.getVideoLocale }
              >
                <For each="locale" of={ ['ALL', 'CN', 'ROW'] }>
                  <Option key={ locale } value={ localeMapping[locale] } title={ locale }>
                    {locale}
                  </Option>
                </For>
              </Select>
            </div>
            <div className="gallery-uploading__video-operation">
              <If condition={ this.props.item.status === uploadStatus.IN_PROGRESS }>
                <button className="gallery-uploading__operation-button" onClick={ this.props.item.handlePause }>
                  <Icon className="gallery-uploading__video-pause-icon" type="pause" />
                </button>
              </If>
              <If condition={ this.props.item.status === uploadStatus.PAUSE }>
                <button className="gallery-uploading__operation-button" onClick={ this.props.item.handleContinue }>
                  <Icon className="gallery-uploading__operation-continue-icon" type="right" />
                </button>
              </If>
              <If condition={ this.props.item.status === uploadStatus.FAILED }>
                <button className="gallery-uploading__operation-button" onClick={ this.handleVideoRestart }>
                  <Icon className="gallery-uploading__video-reload-icon" type="reload" />
                </button>
              </If>
              <Popconfirm
                placement="top"
                title={ this.props.t('cms.properties.edit.gallery.video.delete.tips') }
                onConfirm={ this.handleDelete }
                okText={ this.props.t('cms.form.value.yes') }
                cancelText={ this.props.t('cms.form.value.no') }
              >
                <button className="gallery-uploading__operation-button" >
                  <Icon className="gallery-uploading__operation-icon" type="delete" />
                </button>
              </Popconfirm>
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

ItemVideo.propTypes = {
  t: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
  handleDeleteVideo: PropTypes.func,
  onChangeLocale: PropTypes.func,
  handleRetryUpload: PropTypes.func,
  isLast: PropTypes.bool,
};

ItemVideo.defaultProps = {
  t: () => {},
  handleDeleteVideo: () => {},
  onChangeLocale: () => {},
  handleRetryUpload: () => {},
  isLast: false,
};
