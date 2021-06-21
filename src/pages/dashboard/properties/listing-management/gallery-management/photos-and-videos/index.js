import React from 'react';
import PropTypes from 'prop-types';
import { Collapse, Modal, message } from 'antd';
import Library from '~components/property-gallery/library';
import { DragLayer } from '~components/sortable-gallery';
import update from 'immutability-helper';
import axios from 'axios';
import moment from 'moment';
import { connect } from 'react-redux';
import endpoints from '~settings/endpoints';
import AWS from 'aws-sdk';
import SparkMD5 from 'spark-md5';
import { setItem, getItem } from '~base/global/helpers/storage';
import * as propertyEditAction from '~actions/properties/property-edit';
import { fireCustomEvent } from '~helpers/custom-events';
import {
  formatBytes,
  getFileInfo,
  getFileType,
  formatLibraries,
  librariesAsArr,
  formatList,
} from '~helpers/gallery';
import { getHeader, cloneObject } from '~helpers';
import gallery, { uploadStatus, localeMapping, galleryCategories } from '~constants/gallery';
import NoRoomPage from '~components/no-room-page';

const { Panel } = Collapse;

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
export default class PhotosAndVideos extends React.Component {
  static LIBRARY_MEDIA_DEFAULT = {
    minSize: null,
    types: ['video', 'image'],
    multiple: true,
    required: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      isShowAllRooms: false,
    };
    this.state.libraries = this.formatLibraries();
    this.state.list = this.formatList();

    this.dragLayer = new DragLayer();
    this.libraryElements = {};

    this.awsUploadToken = null;
    this.creds = null;
  }

  componentDidMount() {
    this.setAwsUploadToken();
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.awsUploadToken = null;
    this.creds = null;
    this.props.onRef(undefined);
  }

  componentWillReceiveProps(nextProps) {
    const { property } = nextProps;

    // delete room or add room
    if (this.props.property.unitTypes.edges.length !== property.unitTypes.edges.length) {
      this.state.libraries =
          formatLibraries(property.id ? property.unitTypes.edges : [], property.links);
      const unitIdArr = property.unitTypes.edges.map(unit => unit.node && unit.node.id);
      const newList = {};

      Object.keys(this.state.list).map((category) => {
        const categoryArr = category.split(':');
        if (
          categoryArr[0] !== 'room' ||
          (categoryArr[0] === 'room' && unitIdArr.includes(categoryArr[1]))
        ) {
          newList[category] = this.state.list[category];
        }
        return true;
      });

      unitIdArr.map((unitId) => {
        if (!Object.keys(newList).includes(`room:${unitId}`)) {
          newList[`room:${unitId}`] = [];
        }

        return true;
      });

      this.setState({
        libraries: formatLibraries(property.id ? property.unitTypes.edges : [], property.links),
        list: newList,
      });
    }
  }

  isPropertyLoaded = () => (
    !!this.props.property.id
  );

  formatLibraries = () => {
    const { property } = this.props;
    return formatLibraries(this.isPropertyLoaded() ? property.unitTypes.edges : [], property.links);
  };

  formatList = () => (
    this.isPropertyLoaded() ? formatList(this.state.libraries, this.props.property) : {}
  )

  onSortEnd = ({ from, fromIndexes, to, toIndex }) => {
    let hasImage = false;
    const { list } = this.state;
    const fromList = list[from].slice(0);
    const toList = from === to ? fromList : list[to].slice(0);
    const selectedIndexes = [];
    const movingList = this.spliceItems(fromList, fromIndexes);
    // add moving list to the target list
    movingList.forEach((item, index) => {
      if (getFileType(item.contentType) === 'image') {
        hasImage = true;
      }
      toList.splice(toIndex + index, 0, item);
      selectedIndexes.push(toIndex + index);
    });

    const sort = () => {
      const error = this.verifyList(to, toList);
      if (error) {
        this.showError(error, () => {
          this.libraryElements[from].addSelectedIndexes(fromIndexes);
        });
      } else if (from === to) {
        this.setState(update(this.state, {
          list: {
            [to]: { $set: toList },
          },
        }));
      } else {
        this.setState(update(this.state, {
          list: {
            [from]: { $set: fromList },
            [to]: { $set: toList },
          },
        }));
      }
    };

    if (from !== to && ['property:general', 'property:room'].includes(to) && hasImage) {
      const { t } = this.props;
      Modal.confirm({
        content: t('cms.properties.edit.gallery.library.drap_to_other_sections', {
          types: 'images',
        }),
        okText: t('cms.listing.modal.option.yes'),
        cancelText: t('cms.listing.modal.option.no'),
        onOk: sort,
        onCancel: () => {
          this.libraryElements[from].addSelectedIndexes(fromIndexes);
        },
      });
    } else {
      sort();
    }

    if (from !== to) {
      if (from === 'property:cover_photo') {
        this.deleteCoverPhoto();
      }
      if (to === 'property:cover_photo' && toList && toList[0]) {
        this.addCoverPhoto(toList[0]);
      }
    }

    this.props.onSetUpdateGallery();
  }

  showError = (error, callback = null) => {
    Modal.error({
      content: error,
      okText: this.props.t('cms.properties.edit.gallery.uploading.button.got_it'),
      onOk: callback,
    });
  }

  verifyList = (id, newList) => {
    const { t } = this.props;
    const { list } = this.state;
    const library = this.librariesAsArr().find(l => l.id === id);
    let error = null;
    if (!library.multiple && (list[id].length > 0 || newList.length > 1)) {
      error = t(library.errorKeys.multiple);
    } else {
      newList.some((item) => {
        const media = gallery.media[getFileType(item.contentType)];
        if (item.size !== null && media.size < item.size) {
          error = t(media.errorKeys.size, {
            size: formatBytes(media.size),
          });
          return true;
        } else if (library.minSize) {
          const invalidSize = item.width < library.minSize[0] || item.height < library.minSize[1];
          if (invalidSize) {
            error = t(library.errorKeys.measure, {
              width: library.minSize[0],
              height: library.minSize[1],
            });
            return true;
          }
        }
        return false;
      });
    }
    return error;
  }

  librariesAsArr = () => (
    librariesAsArr(this.state.libraries)
  )

  onDropFiles = async (id, files) => {
    if (files.length) {
      const promiseInfo = [];
      files.forEach((file) => {
        promiseInfo.push(getFileInfo(file));
      });
      const newUploadFiles = await Promise.all(promiseInfo);

      const allUploadFilesError = this.verifyList(id, newUploadFiles);
      if (allUploadFilesError) {
        this.showError(allUploadFilesError);
        return true;
      }

      newUploadFiles.map((uploadFile) => {
        const formatUploadFile = {
          ...uploadFile,
          uploadState: this.getUploadStatus(uploadFile),
          progress: 0,
          cancelSource: null,
          response: null,
          fileReaded: false,
        };

        if (getFileType(uploadFile.contentType) === 'video') {
          formatUploadFile.locales = localeMapping.ALL;
        }

        const singleFileError = this.verifyList(id, [formatUploadFile]);
        if (singleFileError) {
          this.showError(singleFileError);
          return true;
        }

        this.state.list[id].push(formatUploadFile);
        this.setState(this.state);

        if (this.getUploadStatus(uploadFile) === uploadStatus.EXCEED) {
          return true;
        }

        if (getFileType(uploadFile.contentType) === 'image') {
          this.uploadImage(formatUploadFile, id);
        }
        if (getFileType(uploadFile.contentType) === 'video') {
          formatUploadFile.locales = localeMapping.ALL;
          this.uploadVideo(formatUploadFile, id);
        }

        return true;
      });
    }

    return true;
  }

  onUpdate = (id, newList) => {
    this.setState(update(this.state, {
      list: {
        [id]: { $set: newList },
      },
    }));
  }

  handleChangeLocale = (locales, videoId, libraryId) => {
    if (this.state.list[libraryId]) {
      this.state.list[libraryId] = this.state.list[libraryId].map((videoPhoto) => {
        if (videoPhoto.id === videoId) {
          return Object.assign({}, videoPhoto, {
            locales,
          });
        }
        return videoPhoto;
      });
      this.setState(this.state);
    }
    this.props.onSetUpdateGallery();
  };

  canDrop = (select) => {
    if (
      select
      && select[0]
      && select[0].getItem()
      && select[0].getItem().contentType
      && getFileType(select[0].getItem().contentType) === 'video'
    ) {
      return false;
    }
    return true;
  }

  setLibrary = (id, e) => {
    this.libraryElements[id] = e;
  }

  getUploadStatus = (list) => {
    const media = gallery.media[getFileType(list.contentType)];

    if (list.size !== null && media.size < list.size) {
      return uploadStatus.EXCEED;
    }

    return uploadStatus.IN_PROGRESS;
  };

  isHaveCoverPhoto = () => {
    const { property } = this.props;
    return property.allImages.edges.some(image => image.node && image.node.hero);
  }

  uploadImage = (item, id) => {
    this.updateStatus(item, uploadStatus.IN_PROGRESS, 0, id);
    const data = new FormData();
    data.append('document', item.file);
    data.append('property_id', JSON.parse(atob(this.props.property.id)).id);

    if (id.split(':')[0] === 'property') {
      if (id.split(':')[1] === 'cover_photo') {
        data.append('category', 'general');
        if (!this.isHaveCoverPhoto()) {
          data.append('hero', true);
        }
      } else {
        data.append('category', id.split(':')[1]);
      }
    } else if (id.split(':')[0] === 'room') {
      data.append('category', 'room');
      data.append('unit_type_id', JSON.parse(atob(id.split(':')[1])).id);
    }

    // eslint-disable-next-line no-param-reassign

    const cancelSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelSource.token,
      onUploadProgress: (progressEvent) => {
        const progress = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
        this.updateStatus(
          item,
          uploadStatus.IN_PROGRESS,
          progress,
          id,
        );
      },
      headers: getHeader(),
      timeout: (item.type === 'video' ? 3600 : 600) * 1000,
    };
    axios.post(endpoints.uploadPropertyImage.url(), data, config)
      .then((response) => {
        if (!response.data) {
          throw new Error('unknown error.');
        }
        const responseData = response.data;
        const itemToUpdate = Object.assign(item, {
          filename: responseData.filename,
          extension: responseData.extension,
          contentType: responseData.content_type,
          width: responseData.width,
          height: responseData.height,
          size: responseData.size,
          imageHash: responseData.image_hash,
          id: responseData.id,
        });
        this.updateStatus(
          itemToUpdate,
          uploadStatus.SUCCESS,
          100,
          id,
        );

        if (id === 'property:cover_photo') {
          this.addCoverPhoto(item);
        }

        this.props.onSetUpdateGallery();
      }).catch(() => {
        this.updateStatus(
          item,
          uploadStatus.FAILED,
          0,
          id,
        );
      });
    return cancelSource;
  }

  updateStatus = (item, uploadState, progress = 100, id) => {
    if (!this.state.list[id]) {
      return false;
    }
    this.state.list[id] = this.state.list[id].map((image) => {
      if (image.uuid === item.uuid) {
        return Object.assign(image, { uploadState, progress });
      }
      return image;
    });
    this.setState(this.state);

    fireCustomEvent('galleryUploadProgress', this.state.list);
    return true;
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

  uploadVideo = (item, libraryId) => {
    if (!item.file) {
      return false;
    }

    /* eslint-disable no-param-reassign */
    item.handleRestart = () => {
      item.fileReaded = false;
      this.uploadVideo(item, libraryId);
    };
    /* eslint-enable no-param-reassign */

    if (navigator && !navigator.onLine) {
      message.error(this.props.t('cms.alert.clienterror.network_connect_failed'));
      this.updateStatus(item, uploadStatus.FAILED, 0, libraryId);
      return false;
    }

    if (item.size > gallery.media.video.size) {
      this.updateStatus(item, uploadStatus.FAILED, 0, libraryId);
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
        this.uploadVideo(item, libraryId);
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

    this.handleUploadAWS(chunkSize, chunks, item, libraryId);
    return true;
  };

  handleUploadAWS = (chunkSize, chunks, item, libraryId) => {
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
      if (currentChunk < chunks) {
        this.loadNext(currentChunk, chunkSize, video.file, fileReader);
      } else {
        video.fileReaded = true;
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
            this.bindVideoOperations(video, upload, libraryId);
            upload.on('httpUploadProgress', (progress) => {
              if (`${md5Value}.mp4` === progress.key) {
                let progressPercentage = Math.floor((progress.loaded * 100) / progress.total);
                progressPercentage = progressPercentage > 99 ? 99 : progressPercentage;
                this.updateStatus(video, uploadStatus.IN_PROGRESS,
                  progressPercentage || 1, libraryId);
                fireCustomEvent('galleryUploadProgress', this.state.list);
              }
            });

            upload.send((err) => {
              if (err) {
                this.updateStatus(video, uploadStatus.FAILED, video.progress, libraryId);
              } else {
                fireCustomEvent('galleryUploadProgress', this.state.list);
                this.createVideo(video, md5Value, libraryId);
              }
            });
          } else if (data && data.videoIsUploaded) {
            this.createVideo(item, md5Value, libraryId);
          } else {
            this.updateStatus(video, uploadStatus.FAILED, video.progress, libraryId);
          }
        });
      }
    };

    fileReader.onerror = function () {
      console.warn('oops, something went wrong.');
    };

    this.loadNext(currentChunk, chunkSize, item.file, fileReader);
    fireCustomEvent('galleryUploadProgress', this.state.list);
  };

  bindVideoOperations = (item, upload, libraryId) => {
    // don't have a good way to solve no-para-reassign
    /* eslint-disable no-param-reassign */
    item.handlePause = () => {
      upload.abort();
      this.updateStatus(item, uploadStatus.PAUSE, item.progress, libraryId);
    };
    item.handleRestart = () => {
      upload.abort();
      item.fileReaded = false;
      this.uploadVideo(item, libraryId);
    };
    item.handleContinue = () => {
      upload.send((error, data) => {
        if (!error && data) {
          this.updateStatus(item, uploadStatus.SUCCESS, 100, libraryId);
        } else {
          this.updateStatus(item, uploadStatus.IN_PROGRESS, item.progress, libraryId);
        }
      });
      this.updateStatus(item, uploadStatus.IN_PROGRESS, item.progress, libraryId);
    };
    item.handleDelete = () => {
      upload.abort();
    };
    /* eslint-enable no-param-reassign */
  };

  getFileSuffux = (filename) => {
    if (filename) {
      return filename.split('.').pop();
    }

    return 'unknown_file_type';
  }

  createVideo = (item, md5Value, libraryId) => {
    const createVideoObj = {};
    const categoryArr = libraryId.split(':');

    if (categoryArr[0] === 'room') {
      createVideoObj.category = galleryCategories.room;
      createVideoObj.unitTypeId = categoryArr[1];
    } else {
      createVideoObj.category = galleryCategories[categoryArr[1]];
    }

    this.props.createVideo({
      path: `${md5Value}.${this.getFileSuffux(item.file.name)}`,
      videoHash: md5Value,
      propertyId: this.props.property.id,
      fileName: item.file.name,
      size: item.file.size,
      ...createVideoObj,
    }, (data) => {
      const videoData = data.createVideo.video;
      const itemToUpdate = Object.assign(item, {
        id: videoData.id,
        path: videoData.path,
        videoHash: videoData.videoHash,
        locales: item.locales || localeMapping.ALL,
        contentType: item.file.type,
        size: item.file.size,
        uploadState: gallery.videoStatus.waitCompress,
        links: videoData.links,
        transcodedStatus: videoData.transcodedStatus,
        fileName: item.file.name,
      });
      this.updateStatus(itemToUpdate, uploadStatus.SUCCESS, 100, libraryId);
    });
  };

  loadNext = (currentChunk, chunkSize, file, fileReader) => {
    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    const start = currentChunk * chunkSize;
    const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
  }

  onCancelFile = (item, id) => {
    const data = item;
    this.updateStatus(item, uploadStatus.FAILED, 0, id);
    if (data.cancelSource) {
      const errorMessage = 'Operation canceled by the user.';
      data.cancelSource.cancel(errorMessage);
      data.cancelSource = null;
    }
  }

  onReloadImage = (item, id) => {
    const data = item;
    data.cancelSource = this.uploadImage(item, id);
  }

  onDeleteFile = (item, id) => {
    this.state.list[id].splice(
      this.state.list[id].indexOf(item),
      1,
    );

    this.setState(update(this.state, {
      list: {
        [id]: { $set: [...this.state.list[id]] },
      },
    }), () => {
      fireCustomEvent('galleryUploadProgress', this.state.list);
    });

    if (id === 'property:cover_photo') {
      this.deleteCoverPhoto();
    }
    this.props.onSetUpdateGallery();
  }

  addCoverPhoto = (item) => {
    const { property } = this.props;
    const cloneAllImages = cloneObject(property.allImages);

    cloneAllImages.edges.push({
      node: Object.assign(item, {
        hero: true,
      }),
    });

    this.props.setProperty({
      property: Object.assign(property, {
        allImages: cloneAllImages,
      }),
    });
  }

  deleteCoverPhoto = () => {
    const { property } = this.props;
    const cloneAllImages = cloneObject(property.allImages);

    /* eslint-disable no-param-reassign */
    cloneAllImages.edges.map((image) => {
      if (image.node && image.node.hero) {
        image.node.deleted = true;
      }
      return true;
    });

    this.props.setProperty({
      property: Object.assign(property, {
        allImages: cloneAllImages,
      }),
    });
  }

  spliceItems = (items, indexes) => {
    const splicedItems = [];
    const indexesSorted = indexes.sort((a, b) => a - b);
    // get the moving list
    indexesSorted.forEach((index) => {
      splicedItems.push(items[index]);
    });
    // delete moving list from the source list
    indexesSorted.forEach((index, count) => {
      items.splice(index - count, 1);
    });
    return splicedItems;
  }

  toggleAllRoomSections = () => {
    this.setState({
      isShowAllRooms: !this.state.isShowAllRooms,
    });
  }

  getVideoLocales = (locales) => {
    if (!locales) {
      return 'ALL';
    }
    if (locales === 'zh-cn') {
      return 'CN';
    }
    if (!locales.includes('zh-cn')) {
      return 'ROW';
    }
    return 'ALL';
  }

  encodeId = (id, type) => {
    if (typeof id === 'number') {
      return btoa(JSON.stringify({ type, id }));
    }

    return id;
  };

  getUpdateData = () => {
    const updateData = {
      // propertyId: JSON.parse(atob(this.props.property.id)).id,
      propertyId: this.props.property.id,
      propertyImages: [],
      propertyVideos: [],
      unitTypes: [],
    };
    const { list } = this.state;
    Object.keys(list).map((listKey) => {
      const categoryArr = listKey.split(':');
      if (categoryArr[0] === 'property') {
        list[listKey].map((file, index) => {
          if (file.uploadState && file.uploadState !== uploadStatus.SUCCESS) {
            return true;
          }
          if (getFileType(file.contentType) === 'image') {
            updateData.propertyImages.push({
              category: categoryArr[1] === 'cover_photo' ? 'GENERAL' : categoryArr[1].toUpperCase(),
              hero: categoryArr[1] === 'cover_photo',
              position: index,
              id: this.encodeId(file.id, 'Image'),
            });
          }
          if (getFileType(file.contentType) === 'video') {
            updateData.propertyVideos.push({
              category: categoryArr[1].toUpperCase(),
              locales: this.getVideoLocales(file.locales),
              position: index,
              id: this.encodeId(file.id, 'Video'),
            });
          }

          return true;
        });
      }
      if (categoryArr[0] === 'room') {
        const unitTypeImages = [];
        const unitTypeVideos = [];
        const unitTypeLinks = [];

        updateData.unitTypes.push({
          unitTypeId: categoryArr[1],
          unitTypeImages,
          unitTypeVideos,
          unitTypeLinks,
        });

        list[listKey].map((file, index) => {
          if (file.uploadState && file.uploadState !== uploadStatus.SUCCESS) {
            return true;
          }

          if (getFileType(file.contentType) === 'image') {
            unitTypeImages.push({
              hero: index === 0,
              id: this.encodeId(file.id, 'Image'),
              position: index,
            });
          }
          if (getFileType(file.contentType) === 'video') {
            unitTypeVideos.push({
              id: this.encodeId(file.id, 'Video'),
              locales: this.getVideoLocales(file.locales),
              position: index,
            });
          }

          return true;
        });
      }

      return true;
    });
    return updateData;
  }

  isLibrariesError = () => {
    let error = false;
    Object.values(this.libraryElements).forEach((element) => {
      if (element && element.validate && element.validate().validateStatus !== 'success') {
        error = true;
      }
    });
    return error;
  }

  render() {
    const { t } = this.props;
    const { libraries, list, isShowAllRooms } = this.state;

    return (
      <div
        className="photos-videos"
        ref={ e => this.dragLayer.setScrollContainer(e) }
      >
        <ul className="photos-videos__description">
          <li>
            <span className="photos-videos__label">
              { t('cms.property.listing_management.format_restriction.label') }
            </span>
            { t('cms.property.listing_management.format_restriction.description') }
          </li>
        </ul>

        <Collapse
          expandIconPosition="right"
          className="photos-videos__collapse"
          defaultActiveKey={ ['property', 'rooms'] }
        >
          <Panel
            header={ t('cms.property.listing_management.property.panel') }
            key="property"
          >
            <For each="library" index="index" of={ libraries.property }>
              <Library
                ref={ (e) => { this.setLibrary(library.id, e); } }
                id={ library.id }
                key={ library.id }
                list={ list[library.id] }
                title={ library.name || t(library.transKey) }
                dropzoneDescription={ library.drapzoneTransKey && t(library.drapzoneTransKey) }
                reminder={ library.reminderTransKey && t(library.reminderTransKey, {
                  width: library.minSize[0],
                  height: library.minSize[1],
                }) }
                media={ {
                  ...PhotosAndVideos.LIBRARY_MEDIA_DEFAULT,
                  ...library,
                } }
                dragLayer={ this.dragLayer }
                onSortEnd={ this.onSortEnd }
                onDropFiles={ this.onDropFiles }
                onUpdate={ this.onUpdate }
                cover={ library.cover }
                t={ t }
                links={ library.links }
                onChangeLocale={ this.handleChangeLocale }
                canDrop={ this.canDrop }
                onCancel={ this.onCancelFile }
                onReload={ this.onReloadImage }
                onDelete={ this.onDeleteFile }
              />
            </For>
          </Panel>
          <Panel
            header={ t('cms.property.listing_management.rooms.panel') }
            key="rooms"
          >
            <Choose>
              <When condition={ libraries.rooms.length > 0 }>
                <For
                  each="library"
                  index="index"
                  of={ isShowAllRooms ?
                    libraries.rooms :
                    libraries.rooms.filter(room => room.id === 'property:room' || (room.listings && room.listings.length > 0))
                  }
                >
                  <Library
                    ref={ (e) => { this.setLibrary(library.id, e); } }
                    id={ library.id }
                    key={ library.id }
                    list={ list[library.id] }
                    title={ library.name || t(library.transKey) }
                    dropzoneDescription={ library.drapzoneTransKey && t(library.drapzoneTransKey) }
                    media={ {
                      ...PhotosAndVideos.LIBRARY_MEDIA_DEFAULT,
                      ...library,
                    } }
                    dragLayer={ this.dragLayer }
                    onSortEnd={ this.onSortEnd }
                    onDropFiles={ this.onDropFiles }
                    onUpdate={ this.onUpdate }
                    cover={ library.cover }
                    listings={ library.listings ? library.listings : [] }
                    links={ library.links }
                    t={ t }
                    onChangeLocale={ this.handleChangeLocale }
                    onCancel={ this.onCancelFile }
                    onReload={ this.onReloadImage }
                    onDelete={ this.onDeleteFile }
                  />
                </For>
                <div className="photos-videos__with-listings">
                  <span
                    role="presentation"
                    onClick={ this.toggleAllRoomSections }
                  >
                    {
                      t(`cms.property.listing_management.only_rooms_with_listings.${
                        isShowAllRooms ? 'show.' : 'hide.'
                      }reminder`)
                    }
                  </span>
                </div>
              </When>
              <Otherwise>
                <NoRoomPage
                  t={ t }
                  handleAddRoomBtnClick={ this.props.handleGotoRoomConfig }
                />
              </Otherwise>
            </Choose>
          </Panel>
        </Collapse>
      </div>
    );
  }
}

PhotosAndVideos.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object.isRequired,
  handleGotoRoomConfig: PropTypes.func,
  getUploadVideoToken: PropTypes.func,
  checkVideoUploaded: PropTypes.func,
  createVideo: PropTypes.func,
  onRef: PropTypes.func,
  onSetUpdateGallery: PropTypes.func,
  setProperty: PropTypes.func,
};

PhotosAndVideos.defaultProps = {
  t: () => {},
  property: {},
  handleGotoRoomConfig: () => {},
  getUploadVideoToken: () => {},
  checkVideoUploaded: () => {},
  createVideo: () => {},
  onRef: () => {},
  onSetUpdateGallery: () => {},
  setProperty: () => {},
};
