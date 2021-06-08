import modal from '~components/modal';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { message, Select, Button, Icon, Popconfirm, Tooltip } from 'antd';
import AWS from 'aws-sdk';
import SparkMD5 from 'spark-md5';
import moment from 'moment';

import gallery, { uploadStatus, localeMapping } from '~constants/gallery';
import Svg from '~components/svg';
import { formatBytes, getFileInfo, getFileType } from '~helpers/gallery';
import { fireCustomEvent } from '~helpers/custom-events';
import * as propertyEditAction from '~actions/properties/property-edit';
import { setItem, getItem } from '~base/global/helpers/storage';
import { isLandlordRole } from '~helpers/auth';
import axios from 'axios';
import cookies from 'js-cookie';
import { cookieNames } from '~constants';
import Dropzone from 'react-dropzone';
import endpoints from '~settings/endpoints';
import ItemImage from './item-image';
import ItemVideo from './item-video';

const { Option } = Select;

const mapDispatchToProps = dispatch => ({
  getUploadVideoToken: (successAction) => {
    dispatch(propertyEditAction.getUploadVideoToken(successAction));
  },
  checkVideoUploaded: (hash, successAction) => {
    dispatch(propertyEditAction.checkVideoUploaded(hash, successAction));
  },
  createVideo: (param, successAction) => {
    dispatch(propertyEditAction.createVideo(param, successAction));
  },
});
@connect(null, mapDispatchToProps)
@modal({
  className: 'gallery-uploading-modal',
}, true)
export default class UploadingModal extends React.Component {
  constructor(props) {
    super(props);
    const libraries = this.getLibraries();
    this.state = {
      libraries,
      librarySelected: libraries[0].category,
      imageUploading: null,
      videoUploading: null,
      showTips: false,
      showClearAllTips: false,
      tips: null,
      isShrink: false,
      isAnimation: false,
      disableConfirm: false,
      list: {
        images: [],
        videos: [],
      },
    };
    this.bodyElement = null;
    this.awsUploadToken = null;
    this.creds = null;
  }

  componentDidMount() {
    this.props.withRef(this);
    this.setAwsUploadToken();
  }

  componentWillUnmount() {
    this.bodyElement = null;
    this.awsUploadToken = null;
    this.creds = null;
  }

  setAwsUploadToken = () => {
    const token = getItem('awsUploadToken');

    if (token) {
      this.awsUploadToken = token;
      this.creds = new AWS.Credentials({
        accessKeyId: this.awsUploadToken.accessKeyId,
        secretAccessKey: this.awsUploadToken.secretAccessKey,
        sessionToken: this.awsUploadToken.sessionToken,
      });
    }
  }

  handleGetUploadVideoToken = (data, resolve, reject) => {
    if (data && data.getUploadVideoToken) {
      this.awsUploadToken = data.getUploadVideoToken;
      setItem('awsUploadToken', data.getUploadVideoToken);
      this.setAwsUploadToken();
      resolve('success');
    } else {
      reject('error');
    }
  };

  getLibraries = () => {
    const libraries = [];
    Object.values(gallery.libraries).forEach((lib) => {
      const libs = Array.isArray(lib) ? lib : [lib];
      libs.forEach((v) => {
        libraries.push({
          key: v.category,
          name: this.props.t(v.transKey),
        });
      });
    });
    return libraries;
  }

  dropProps = data => ({
    ...data,
    accept: this.getAcceptTypes(),
    multiple: true,
    onDrop: files => this.upload(this.state.librarySelected, files),
  });

  getAcceptTypes = () => {
    let acceptTypes = [];
    Object.values(gallery.media).forEach((media) => {
      acceptTypes = acceptTypes.concat(Object.keys(media.types));
    });
    return acceptTypes;
  }

  upload = async (library, files) => {
    if (files.length) {
      this.setState({
        librarySelected: library,
      }, async () => {
        const promiseInfo = [];
        files.forEach((file) => {
          promiseInfo.push(getFileInfo(file));
        });
        const newItems = await Promise.all(promiseInfo);
        newItems.map((item) => {
          this.state.list[`${getFileType(item.contentType)}s`].push({
            ...item,
            status: this.getUploadStatus(item),
            progress: 0,
            element: null,
            cancelSource: null,
            response: null,
            fileReaded: false,
          });

          return true;
        });

        this.uploadAll(() => {
          if (this.bodyElement) {
            this.bodyElement.scrollTo({
              top: this.bodyElement.scrollHeight,
            });
          }
        });
      });
    }
  }

  getUploadStatus = (list) => {
    const media = gallery.media[getFileType(list.contentType)];

    if (list.size !== null && media.size < list.size) {
      return uploadStatus.EXCEED;
    }

    return uploadStatus.IN_PROGRESS;
  };

  uploadAll = (callback) => {
    const stillInProgress =
      this.state.list.images.find(v => v.status === uploadStatus.IN_PROGRESS);
    const stillVideoInProgress =
      this.state.list.videos.find(
        v => v.status === uploadStatus.IN_PROGRESS,
      );

    this.setState({
      imageUploading: !!stillInProgress,
      videoUploading: !!stillVideoInProgress,
    }, () => {
      this.state.list.images.forEach((v) => {
        const item = v;
        if (item.status === uploadStatus.IN_PROGRESS && !item.cancelSource) {
          item.cancelSource = this.uploadItem(item);
        }
      });

      this.state.list.videos.forEach((v) => {
        const item = v;
        if (item.status === uploadStatus.IN_PROGRESS && !item.cancelSource) {
          item.cancelSource = this.uploadVideo(item);
        }
      });
      if (callback) {
        callback();
      }
    });
  }

  uploadVideo = (item) => {
    if (!item.file) {
      return false;
    }

    if (navigator && !navigator.onLine) {
      message.error(this.props.t('cms.alert.clienterror.network_connect_failed'));
      this.updateStatus(item, uploadStatus.FAILED, 0);
      item.element.setLoading(false);
      return false;
    }

    if (item.size > gallery.media.video.size) {
      this.updateStatus(item, uploadStatus.FAILED, 0);
      item.element.setLoading(false);
      return false;
    }

    if (!this.awsUploadToken || moment().isAfter(moment(this.awsUploadToken.expiration))) {
      const getTokenPromise = new Promise(
        (resolve, reject) => {
          this.props.getUploadVideoToken((data) => {
            this.handleGetUploadVideoToken(data, resolve, reject);
          });
        },
      );

      getTokenPromise.then(() => {
        this.uploadVideo(item);
      });

      getTokenPromise.catch(() => {
        console.log('get token error');
      });

      return false;
    }

    const region = this.awsUploadToken.region;
    const chunkSize = 2097152; // Read in chunks of 2MB
    const chunks = Math.ceil(item.file.size / chunkSize);

    AWS.config.update({
      region,
      credentials: this.creds,
    });

    this.handleUploadAWS(chunkSize, chunks, item);
    return true;
  };

  handleUploadAWS = (chunkSize, chunks, item) => {
    // setstate
    const bucket = this.awsUploadToken.bucket;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    let currentChunk = 0;

    fileReader.onload = (e) => {
      spark.append(e.target.result); // Append array buffer
      currentChunk += 1;
      const video = item;
      video.fileReaded = false;
      item.element.setLoading(true);
      if (currentChunk < chunks) {
        this.loadNext(currentChunk, chunkSize, video.file, fileReader);
      } else {
        video.fileReaded = true;
        item.element.setLoading(false);
        // eslint-disable-next-line no-param-reassign
        const md5Value = spark.end();
        this.props.checkVideoUploaded(md5Value, (data) => {
          if (data && !data.videoIsUploaded) {
            const upload = new AWS.S3.ManagedUpload({
              partSize: 5 * 1024 * 1024,
              queueSize: 2,
              params: {
                Bucket: bucket,
                // format of cdn path must be `${video_hash}.${file_suffix}`
                Key: `${md5Value}.${this.getFileSuffux(video.file.name)}`,
                Body: video.file,
                myKey: 'MyValue', // remove?
              },
              leavePartsOnError: true,
            });
            this.bindVideoOperations(video, upload);
            upload.on('httpUploadProgress', (progress) => {
              if (`${md5Value}.mp4` === progress.key) {
                let progressPercentage = Math.floor((progress.loaded * 100) / progress.total);
                progressPercentage = progressPercentage > 99 ? 99 : progressPercentage;
                this.updateStatus(video, uploadStatus.IN_PROGRESS, progressPercentage || 1);
                fireCustomEvent('galleryUploadVideoUpdate', this.state.list);
              }
            });

            upload.send((err) => {
              if (err) {
                this.updateStatus(video, uploadStatus.FAILED, video.progress);
              } else {
                fireCustomEvent('galleryUploadVideoUpdate', this.state.list);
                this.createVideo(video, md5Value);
              }
            });
          } else if (data && data.videoIsUploaded && item.element) {
            this.createVideo(item, md5Value);
          } else {
            this.updateStatus(video, uploadStatus.FAILED, video.progress);
          }
        });
      }
    };

    fileReader.onerror = function () {
      console.warn('oops, something went wrong.');
    };

    this.loadNext(currentChunk, chunkSize, item.file, fileReader);
    fireCustomEvent('galleryUploadVideoUpdate', this.state.list);
  };

  bindVideoOperations = (item, upload) => {
    // don't have a good way to solve no-para-reassign
    /* eslint-disable no-param-reassign */
    item.handlePause = () => {
      upload.abort();
      this.updateStatus(item, uploadStatus.PAUSE, item.progress);
    };
    item.handleRestart = () => {
      upload.abort();
      item.fileReaded = false;
      item.element.setLoading(true);
      this.uploadVideo(item);
    };
    item.handleContinue = () => {
      upload.send((error, data) => {
        if (!error && data) {
          this.updateStatus(item, uploadStatus.SUCCESS, 100);
        } else {
          this.updateStatus(item, uploadStatus.IN_PROGRESS, item.progress);
        }
      });
      this.updateStatus(item, uploadStatus.IN_PROGRESS, item.progress);
    };
    item.handleDelete = () => {
      upload.abort();
    };
    /* eslint-enable no-param-reassign */
  };

  handleDeleteVideo = (item) => {
    let itemIndex;
    this.state.list.videos.find((video, index) => {
      if (video && item && item.uuid === video.uuid) {
        itemIndex = index;
        return true;
      }

      return false;
    });
    if (itemIndex !== -1) {
      this.state.list.videos.splice(itemIndex, 1);
    }
    this.setState(this.state);
  }

  createVideo = (item, md5Value) => {
    this.props.createVideo({
      path: `${md5Value}.${this.getFileSuffux(item.file.name)}`,
      videoHash: md5Value,
      propertyId: this.props.propertyId,
      fileName: item.file.name,
      size: item.file.size,
    }, (data) => {
      const videoData = data.createVideo.video;
      const itemToUpdate = item;
      itemToUpdate.response = {
        id: videoData.id,
        path: videoData.path,
        videoHash: videoData.videoHash,
        locales: item.locales || localeMapping.ALL,
        contentType: item.file.type,
        size: item.file.size,
        status: gallery.videoStatus.waitCompress,
        links: videoData.links,
        transcodedStatus: videoData.transcodedStatus,
        fileName: item.file.name,
      };
      this.updateStatus(itemToUpdate, uploadStatus.SUCCESS, 100);
    });
  };

  getFileSuffux = (filename) => {
    if (filename) {
      return filename.split('.').pop();
    }

    return 'unknown_file_type';
  }

  loadNext = (currentChunk, chunkSize, file, fileReader) => {
    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    const start = currentChunk * chunkSize;
    const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
  }

  uploadItem = (item) => {
    this.updateStatus(
      item,
      uploadStatus.IN_PROGRESS,
      0,
    );
    const data = new FormData();
    data.append('document', item.file);
    // eslint-disable-next-line no-param-reassign

    const cancelSource = axios.CancelToken.source();
    const headers = {
      Authorization: `Bearer ${cookies.get(cookieNames.token)}`,
    };
    const authPayload = getItem('PMS_CURRENT_USER_AUTH');
    if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
      headers['Current-Role'] = authPayload.payload.currentRoleSlug;
    }
    const config = {
      cancelToken: cancelSource.token,
      onUploadProgress: (progressEvent) => {
        const progress = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
        this.updateStatus(
          item,
          uploadStatus.IN_PROGRESS,
          progress,
        );
      },
      headers,
      timeout: (item.type === 'video' ? 3600 : 600) * 1000,
    };
    axios.post(endpoints.uploadImage.url(), data, config)
      .then((response) => {
        if (!response.data) {
          throw new Error('unknown error.');
        }
        const responseData = response.data;
        const itemToUpdate = item;
        itemToUpdate.response = {
          filename: responseData.filename,
          extension: responseData.extension,
          contentType: responseData.content_type,
          width: responseData.width,
          height: responseData.height,
          size: responseData.size,
          imageHash: responseData.image_hash,
          transcodedStatus: responseData.transcodedStatus,
        };
        this.updateStatus(
          itemToUpdate,
          uploadStatus.SUCCESS,
        );
      })
      .catch(() => {
        this.updateStatus(
          item,
          uploadStatus.FAILED,
        );
      });
    return cancelSource;
  }

  updateStatus = (item, status, progress = 100) => {
    if (!item.element) {
      return false;
    }
    const data = item;
    const differentStatus = item.status !== status;
    data.status = status;
    data.progress = progress;
    data.element.setProgress(status, progress);
    if (differentStatus) {
      const stillInProgress = this.state.list.images
        .find(v => v.status === uploadStatus.IN_PROGRESS);
      const stillVideoInProgress = this.state.list.videos.find(
        v => v.status === uploadStatus.IN_PROGRESS ||
        (!v.fileReaded && v.status !== uploadStatus.EXCEED),
      );
      this.setState({
        imageUploading: !!stillInProgress,
        videoUploading: !!stillVideoInProgress,
      });
    }

    fireCustomEvent('galleryUploadVideoUpdate', this.state.list);
    return true;
  }

  onCancel = (item) => {
    const data = item;
    this.updateStatus(item, uploadStatus.FAILED);
    if (data.cancelSource) {
      const errorMessage = 'Operation canceled by the user.';
      data.cancelSource.cancel(errorMessage);
      data.cancelSource = null;
    }
  }

  onReload = (item) => {
    const data = item;
    data.cancelSource = this.uploadItem(item);
  }

  onDelete = (item) => {
    this.onCancel(item);
    this.state.list.images.splice(
      this.state.list.images.indexOf(item),
      1,
    );
    this.forceUpdate();

    fireCustomEvent('galleryUploadVideoUpdate', this.state.list);
  }

  stopUploadAll = () => {
    this.state.list.images.forEach((item) => {
      if (item.status === uploadStatus.IN_PROGRESS) {
        this.onCancel(item);
      }
    });

    this.state.list.videos.forEach((item) => {
      if (item.status === uploadStatus.IN_PROGRESS && item.handlePause) {
        item.handlePause();
      }
    });
  }

  clearAll = () => {
    this.stopUploadAll();
    this.state.list = {
      images: [],
      videos: [],
    };
    this.props.onClose();
    this.setState({
      showClearAllTips: false,
    });
  }

  getSummary = () => {
    const summary = {
      inProgress: 0,
      success: 0,
      failed: 0,
    };
    if (this.state.list.images) {
      this.state.list.images.forEach((item) => {
        if (item.status === uploadStatus.IN_PROGRESS) {
          summary.inProgress += 1;
        } else if (item.status === uploadStatus.SUCCESS) {
          summary.success += 1;
        } else if (item.status === uploadStatus.FAILED || item.status === uploadStatus.EXCEED) {
          summary.failed += 1;
        }
      });
    }

    if (this.state.list.videos) {
      this.state.list.videos.forEach((item) => {
        if (item.status === uploadStatus.IN_PROGRESS) {
          summary.inProgress += 1;
        } else if (item.status === uploadStatus.SUCCESS) {
          summary.success += 1;
        } else if (item.status === uploadStatus.FAILED || item.status === uploadStatus.EXCEED) {
          summary.failed += 1;
        }
      });
    }

    return summary;
  }

  onConfirmTips = () => {
    this.setState({
      showTips: false,
      disableConfirm: false,
    });
  }

  showTips = () => {
    this.setState({
      tips: this.props.t('cms.properties.edit.gallery.modal.cover_photo_err'),
      showTips: true,
    });
  }

  onConfirm = () => {
    this.setState({ disableConfirm: true });
    const { onConfirm } = this.props;
    const { librarySelected } = this.state;
    const imageSuccessList =
      this.state.list.images.filter(item => item.status === uploadStatus.SUCCESS);
    const videoSuccessList =
      this.state.list.videos.filter(item => item.status === uploadStatus.SUCCESS);
    // Close gallery modal when there is no failed to commit
    const isClose =
    imageSuccessList.length !== this.state.list.images.length
    || videoSuccessList.length !== this.state.list.videos.length;

    // when selecte cover_photo cannot be confirm
    if (
      this.state.librarySelected === 'property:cover_photo'
      && (
        this.props.haveCoverPhoto
        || (
          !this.props.haveCoverPhoto
          && (videoSuccessList.length > 0 || imageSuccessList.length > 1)
        )
      )
    ) {
      // + tips
      this.showTips();
    } else {
      if (isClose) {
        this.setState({
          isAnimation: true,
          disableConfirm: true,
        });
      }

      setTimeout(() => {
        this.setState({
          isAnimation: false,
          disableConfirm: false,
          list: {
            images: this.state.list.images.filter(item => item.status !== uploadStatus.SUCCESS),
            videos: this.state.list.videos.filter(item => item.status !== uploadStatus.SUCCESS),
          },
        }, () => {
          fireCustomEvent('galleryUploadVideoUpdate', this.state.list);
        });

        const allSuccess = imageSuccessList.concat(videoSuccessList);
        onConfirm(librarySelected, allSuccess.map(item => item.response), isClose);
      }, 900);
    }
  }

  onChangeLibrary = (value) => {
    this.setState({
      librarySelected: value,
    });
  }

  renderSummary = (summary) => {
    const { t } = this.props;
    if (summary.inProgress) {
      return {
        dangerouslySetInnerHTML: {
          __html: t('cms.properties.edit.gallery.uploading.status.in_progress'),
        },
      };
    }
    return {
      dangerouslySetInnerHTML: {
        __html: `
        ${t('cms.properties.edit.gallery.uploading.status.success', {
          number: `<span class="gallery-uploading__status-number">${summary.success}</span>`,
        })}
        ${t('cms.properties.edit.gallery.uploading.status.failed', {
          number: `<span class="gallery-uploading__status-number">${summary.failed}</span>`,
        })}
        `,
      },
    };
  }

  handleShrink = () => {
    const uploadingModal = document.querySelector('.gallery-uploading-modal');
    if (uploadingModal) {
      let classVal = uploadingModal.getAttribute('class');
      classVal = classVal.concat(' gallery-uploading-modal--hidden');
      uploadingModal.setAttribute('class', classVal);
      setTimeout(() => {
        this.props.onCloseModal();
      }, 100);
    } else {
      this.props.onCloseModal();
    }

    fireCustomEvent('galleryUploadVideoUpdate', this.state.list);
  }

  handleChangeLocale = (item) => {
    const newVideos = [];
    this.state.list.videos.map((video) => {
      if (video.uuid === item.uuid) {
        newVideos.push(item);
      } else {
        newVideos.push(video);
      }

      return true;
    });

    this.state.list.videos = newVideos;
    this.setState(this.state);
  };

  showClearAllTips = (isShow) => {
    this.setState({
      showClearAllTips: isShow,
    });
  };

  getLibrariesByRole = (libraries) => {
    if (isLandlordRole()) {
      return libraries.filter(library => library.id !== 'property:room');
    }
    return libraries;
  };

  render() {
    const { t, libraries } = this.props;
    const {
      imageUploading,
      tips,
      showTips,
      showClearAllTips,
      librarySelected,
      videoUploading,
      isAnimation,
      disableConfirm,
    } = this.state;
    const {
      onCancel,
      onDelete,
      onReload,
      onConfirmTips,
      onConfirm,
      onChangeLibrary,
      handleDeleteVideo,
      handleChangeLocale,
      uploadVideo,
    } = this;
    const summary = this.getSummary();
    const videosLength = this.state.list.videos.length;

    return (
      <Dropzone { ...this.dropProps({ noClick: true }) }>
        {outerProps => (
          <div
            className="gallery-uploading"
            ref={ (e) => { this.modalElement = e; } }
            { ...outerProps.getRootProps() }
          >
            <div className="gallery-uploading__header">
              <span className="gallery-uploading__header-upload">
                {t('cms.properties.edit.gallery.uploading.upload_to')}
              </span>
              <Select
                className="gallery-uploading__header-library"
                defaultValue={ librarySelected }
                value={ librarySelected }
                onChange={ onChangeLibrary }
              >
                <For each="library" of={ this.getLibrariesByRole(libraries) }>
                  <Option
                    key={ library.id }
                    value={ library.id }
                    title={ library.name || t(library.transKey) }
                  >
                    {library.name || t(library.transKey)}
                  </Option>
                </For>
              </Select>
              <button
                className="gallery-uploading__shrink"
                onClick={ this.handleShrink }
              >
                <Svg className="gallery-uploading__shrink-icon" hash="shrink" />
                <span className="gallery-uploading__shrink-text">
                  {t('cms.properties.edit.gallery.minimize_the_model')}
                </span>
              </button>
            </div>
            <div
              className="gallery-uploading__body"
              ref={ (e) => { this.bodyElement = e; } }
            >
              <div className="gallery-uploading__header-description">
                <For each="type" of={ Object.keys(gallery.media) }>
                  <span className="gallery-uploading__annotation" key={ type }>
                    <span className="gallery-uploading__annotation-label">
                      {t(`cms.properties.edit.gallery.annotation_label.${type}`)}
                    </span>
                    {t(`cms.properties.edit.gallery.annotation.${type}`, {
                      types: Object.values(gallery.media[type].types).join(' / '),
                      size: formatBytes(gallery.media[type].size),
                      max: gallery.media[type].max,
                    })}
                  </span>
                </For>
              </div>
              <div className="gallery-uploading__videos">
                <For each="item" of={ this.state.list.videos } index="index">
                  <div
                    className={
                      isAnimation && item.status === uploadStatus.SUCCESS ?
                        'gallery-uploading__video-animation' : ''
                    }
                    key={ item.uuid }
                  >
                    <ItemVideo
                      ref={ (e) => { item.element = e; } }
                      className="gallery-uploading__item-video"
                      item={ item }
                      handleDeleteVideo={ handleDeleteVideo }
                      onChangeLocale={ handleChangeLocale }
                      handleRetryUpload={ uploadVideo }
                      t={ t }
                      isLast={ videosLength === index + 1 }
                    />
                  </div>
                </For>
              </div>
              <div className="gallery-uploading__images">
                <For each="item" of={ this.state.list.images }>
                  <div
                    key={ item.uuid }
                    className={
                      isAnimation && item.status === uploadStatus.SUCCESS ?
                        'gallery-uploading__animation' : ''
                    }
                  >
                    <ItemImage
                      ref={ (e) => { item.element = e; } }
                      className="gallery-uploading__item-image"
                      item={ item }
                      onCancel={ () => { onCancel(item); } }
                      onReload={ () => { onReload(item); } }
                      onDelete={ () => { onDelete(item); } }
                      t={ t }
                    />
                  </div>
                </For>
                <Dropzone { ...this.dropProps({ noDrag: true }) }>
                  {innerProps => (
                    <div
                      className="gallery-uploading__item-upload"
                      { ...innerProps.getRootProps() }
                    >
                      <input { ...innerProps.getInputProps() } />
                      <Icon className="gallery-uploading__item-upload-icon" type="plus" />
                      <span className="gallery-uploading__item-upload-text">
                        {this.props.t('cms.properties.edit.gallery.uploading.upload_type', {
                          types: Object.keys(gallery.media).join('/'),
                        })}
                      </span>
                    </div>
                  )}
                </Dropzone>
              </div>
            </div>
            <div className="gallery-uploading__footer">
              <span
                className="gallery-uploading__footer-status"
                { ...this.renderSummary(summary) }
              />
              <div className="gallery-uploading__footer-buttons">
                <Choose>
                  <When condition={ imageUploading === true || videoUploading === true }>
                    <Choose>
                      <When condition={ this.state.list.videos.find(v => !v.fileReaded) }>
                        <Tooltip
                          placement="top"
                          title={ t('cms.properties.edit.gallery.uploading.button.stop_upload_tips') }
                        >
                          <Button
                            className="gallery-uploading__button gallery-uploading__button--disabled"
                            type="primary"
                          >
                            {t('cms.properties.edit.gallery.uploading.button.stop_upload')}
                          </Button>
                        </Tooltip>
                      </When>
                      <Otherwise>
                        <Button
                          className="gallery-uploading__button"
                          onClick={ this.stopUploadAll }
                        >
                          {t('cms.properties.edit.gallery.uploading.button.stop_upload')}
                        </Button>
                      </Otherwise>
                    </Choose>
                  </When>
                  <Otherwise>
                    <Popconfirm
                      overlayStyle={ { width: 260 } }
                      placement="topRight"
                      onConfirm={ this.clearAll }
                      onCancel={ () => { this.showClearAllTips(false); } }
                      title={ t('cms.properties.edit.gallery.uploading_modal.quit_text') }
                      okText={ t('cms.form.value.yes') }
                      cancelText={ t('cms.form.value.no') }
                      visible={ showClearAllTips }
                    >
                      <Button
                        className="gallery-uploading__button"
                        onClick={ () => { this.showClearAllTips(true); } }
                      >
                        {t('cms.properties.edit.gallery.uploading.button.clear_and_quit')}
                      </Button>
                    </Popconfirm>
                  </Otherwise>
                </Choose>
                <Popconfirm
                  overlayClassName="gallery-uploading__tips"
                  overlayStyle={ { width: 260 } }
                  placement="topRight"
                  arrowPointAtCenter
                  onConfirm={ onConfirmTips }
                  title={ <div dangerouslySetInnerHTML={ { __html: tips } } /> }
                  okText={ t('cms.properties.edit.gallery.uploading.button.got_it') }
                  visible={ showTips }
                >
                  <Choose>
                    <When condition={ !imageUploading && !videoUploading && summary.success > 0 &&
                      !disableConfirm }
                    >
                      <Button
                        className="gallery-uploading__button gallery-uploading__button--primary"
                        type="primary"
                        onClick={ onConfirm }
                      >
                        {t('cms.properties.edit.gallery.confirm_uploaded.button')}
                      </Button>
                    </When>
                    <Otherwise>
                      <Button
                        className="gallery-uploading__button gallery-uploading__button--disabled"
                        type="primary"
                      >
                        {t('cms.properties.edit.gallery.confirm_uploaded.button')}
                      </Button>
                    </Otherwise>
                  </Choose>
                </Popconfirm>
              </div>
            </div>
          </div>
        )}
      </Dropzone>
    );
  }
}

UploadingModal.propTypes = {
  t: PropTypes.func.isRequired,
  withRef: PropTypes.func,
  verifyList: PropTypes.func,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
  libraries: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    transKey: PropTypes.transKey,
  })),
  onCloseModal: PropTypes.func,
  getUploadVideoToken: PropTypes.func,
  checkVideoUploaded: PropTypes.func,
  createVideo: PropTypes.func,
  propertyId: PropTypes.string.isRequired,
  haveCoverPhoto: PropTypes.bool,
};

UploadingModal.defaultProps = {
  t: () => {},
  withRef: () => {},
  verifyList: () => true,
  onConfirm: () => {},
  onClose: () => {},
  libraries: [],
  onCloseModal: () => {},
  getUploadVideoToken: () => {},
  createVideo: () => {},
  checkVideoUploaded: () => {},
  haveCoverPhoto: false,
};
