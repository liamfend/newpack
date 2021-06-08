import React from 'react';
import { Player, BigPlayButton } from 'video-react';
import { Modal, Popconfirm, Icon, Select, message } from 'antd';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import classNames from 'classnames';
import { getFileType, imageUrl, formatBytes } from '~helpers/gallery';
import gallery, { imageSizes, localeMapping, galleryStatus } from '~constants/gallery';
import Svg from '~components/svg';


const SLICK_ANIMATION_DURATION = 500;
const SLICK_THUMBNAIL_SHOW = 9;
const SLICK_GALLERY_SHOW = 1;
const SLICK_INITIAL_INDEX = 1;

export default class ImageSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      initialSlide: 0,
      activeSlide: 0,
      list: [],
    };
    this.imageSlider = null;
    this.thumbnailSlider = null;
    this.onCloseCallback = null;
    this.coverPhotoId = 0;
    this.players = [];
  }

  show = (activeSlide, list, onCloseCallback = null) => {
    this.setState({
      visible: true,
      initialSlide: activeSlide,
      activeSlide,
      list,
    });
    this.onCloseCallback = onCloseCallback;
  }

  hide = (newList) => {
    this.setState({
      visible: false,
    });
    if (this.onCloseCallback) {
      this.onCloseCallback(newList || this.state.list);
      this.onCloseCallback = null;
    }
    const waitingCloseAnimation = 500;
    setTimeout(() => {
      this.setState({
        activeSlide: 0,
        list: [],
      });
    }, waitingCloseAnimation);
  }

  setActiveSlide = (next, dontAnimate = false) => {
    this.pauseVideos();
    if (this.state.list[next]) {
      this.setState({
        activeSlide: next,
      }, () => {
        if (this.imageSlider && this.thumbnailSlider) {
          this.imageSlider.slickGoTo(next, dontAnimate);
          this.thumbnailSlider.slickGoTo(next, dontAnimate);
        }
      });
    }
  }

  setCover = () => {
    const { list, activeSlide } = this.state;
    const newList = list.slice(0);
    const cover = newList.splice(activeSlide, 1)[0];
    newList.unshift(cover);
    this.setState({
      initialSlide: 0,
      list: newList,
    }, () => {
      this.setActiveSlide(0, true);
      message.success(
        this.props.t('cms.properties.edit.gallery.library.slider.set_cover_photo_success'),
      );
    });
  }

  delete = () => {
    const { list, activeSlide } = this.state;
    const newList = list.slice(0);
    newList.splice(activeSlide, 1);
    if (newList.length === 0) {
      this.hide(newList);
    } else {
      const newIndex = activeSlide > newList.length - 1 ? 0 : activeSlide;
      this.setState({
        initialSlide: newIndex,
        activeSlide: newIndex,
        list: newList,
      }, () => {
        this.setActiveSlide(newIndex, true);
      });
    }
  }

  getVideoLocale = (e) => {
    if (this.state.list[this.state.activeSlide]) {
      this.state.list[this.state.activeSlide].locales = e;
    }
    this.setState(this.state);

    this.props.onChangeLocale(e, this.state.list[this.state.activeSlide].id);
  }

  getCoverPhoto = (items) => {
    let imageId = 0;
    if (items) {
      items.map((item) => {
        if (item.contentType && getFileType(item.contentType) !== 'video' && imageId === 0) {
          imageId = item.id;
          this.coverPhotoId = item.id;
        }
        return this.coverPhotoId;
      });
    }

    return this.coverPhotoId;
  };

  pauseVideos = () => {
    this.players.map((player) => {
      player.pause();
      return true;
    });
  };

  render() {
    if (!this.state.list.length) { return null; }
    const { list, activeSlide, initialSlide } = this.state;
    const { cover } = this.props;
    const activeItem = list[activeSlide] || list[initialSlide] || list[0];

    const settings = {
      initialSlide,
      speed: SLICK_ANIMATION_DURATION,
      slidesToShow: SLICK_GALLERY_SHOW,
      vertical: false,
      slidesToScroll: SLICK_INITIAL_INDEX,
      infinite: false,
      className: 'gallery-slider-modal__slider',
      beforeChange: (_, next) => this.setActiveSlide(next),
    };
    const thumbnailSettings = {
      initialSlide,
      arrows: false,
      slidesToShow: SLICK_THUMBNAIL_SHOW,
      slidesToScroll: SLICK_INITIAL_INDEX,
      adaptiveHeight: true,
      touchMove: false,
      centerMode: true,
      centerPadding: '0',
      focusOnSelect: true,
      infinite: true,
      beforeChange: (_, next) => this.setActiveSlide(next),
      className: 'gallery-slider-modal__thumbnail-slider',
    };

    return (
      <Modal
        visible={ this.state.visible }
        width={ 820 }
        footer={ null }
        bodyStyle={ { padding: 0 } }
        className="gallery-slider-modal"
        onCancel={ () => this.hide() }
      >
        <div className="gallery-slider-modal__container">
          <div className="gallery-slider-modal__title">{this.props.title}</div>
          <Choose>
            <When condition={ getFileType(activeItem.contentType) === 'video' }>
              <div className="gallery-slider-modal__set-display-locale">
                {this.props.t('cms.properties.edit.gallery.library.slider.set_display_locale')}
                <Select
                  value={ activeItem.locales ? activeItem.locales : localeMapping.ALL }
                  onChange={ this.getVideoLocale }
                  className="gallery-uploading__video-locale-selection"
                  getPopupContainer={ triggerNode => triggerNode.parentElement }
                >
                  <For each="locale" of={ ['ALL', 'CN', 'ROW'] }>
                    <Select.Option key={ locale } value={ localeMapping[locale] } title={ locale }>
                      { locale }
                    </Select.Option>
                  </For>
                </Select>
              </div>
            </When>
            <When condition={ cover }>
              <div
                className="gallery-slider-modal__set-tag-btn"
                role="button"
                tabIndex="0"
                onClick={ this.setCover }
              >
                {this.props.t('cms.properties.edit.gallery.library.slider.set_cover_photo')}
              </div>
            </When>
            <Otherwise>
              <div className="gallery-slider-modal__set-placeholder" />
            </Otherwise>
          </Choose>
          <Slider
            { ...settings }
            ref={ (e) => { this.imageSlider = e; } }
          >
            <For each="item" of={ list } index="index">
              <Choose>
                <When condition={ getFileType(item.contentType) === 'video' }>
                  <Choose>
                    <When
                      condition={
                        item.transcodedStatus === gallery.videoStatus.compressed && item.links
                      }
                    >
                      <div className="gallery-slider-modal__source-item gallery-slider-modal__source-item-player" key={ index }>
                        <Player
                          ref={ (player) => { this.players[index] = player; } }
                          fluid
                          preload="auto"
                          autoPlay={ false }
                          poster={ item.source }
                          src={ item.links ? item.links.hqMp4 : '' }
                        >
                          <BigPlayButton position="center" />
                        </Player>
                      </div>
                    </When>
                    <Otherwise>
                      <div
                        className={ classNames('gallery-slider-modal__video-compress', {
                          'gallery-slider-modal__video-compress-err':
                          item.transcodedStatus === gallery.videoStatus.error,
                        }) }
                        key={ item.id }
                      >
                        <Svg className="gallery-slider-modal__video-bg" hash="video-bg" />
                        <div className="gallery-slider-modal__img-video-compress gallery-slider-modal__img">
                          <Choose>
                            <When
                              condition={
                                item.transcodedStatus === gallery.videoStatus.compressing
                              }
                            >
                              <Svg className="gallery-slider-modal__img-video-icon" hash="hourglass" />
                            </When>
                            <When
                              condition={
                                item.transcodedStatus === gallery.videoStatus.error
                              }
                            >
                              <Svg className="gallery-slider-modal__img-video-icon" hash="video-failed" />
                            </When>
                            <Otherwise>
                              <Icon className="gallery-slider-modal__img-video-icon" type="video-camera" />
                            </Otherwise>
                          </Choose>
                          <span>{ this.props.t('cms.properties.edit.gallery.file_type.mp4') }</span>
                        </div>
                        <span className="gallery-slider-modal__video-compress-text">
                          <Choose>
                            <When
                              condition={
                                item.transcodedStatus === gallery.videoStatus.error
                              }
                            >
                              { this.props.t('cms.properties.edit.gallery.preview.video.video_err') }
                            </When>
                            <When
                              condition={
                                item.transcodedStatus === gallery.videoStatus.compressing
                              }
                            >
                              { this.props.t('cms.properties.edit.gallery.preview.video.video_compress') }
                            </When>
                            <Otherwise>
                              { this.props.t('cms.properties.edit.gallery.preview.video.video_wait_compress') }
                            </Otherwise>
                          </Choose>
                        </span>
                      </div>
                    </Otherwise>
                  </Choose>
                </When>
                <Otherwise>
                  <div key={ index }>
                    <div className="gallery-slider-modal__source-item">
                      <img className="gallery-slider-modal__source-img" src={ imageUrl(item, imageSizes.big) } alt="" />
                    </div>
                  </div>
                </Otherwise>
              </Choose>
            </For>
          </Slider>
          <div className="gallery-slider-modal__img-info">
            <div className="gallery-slider-modal__img-name" >
              { activeItem.filename || activeItem.fileName }
            </div>
            <div className="gallery-slider-modal__img-size" >
              {activeItem.size ? `${formatBytes(activeItem.size)}` : ''}
            </div>
            <Choose>
              <When condition={ activeItem.status === galleryStatus.REJECTED }>
                <Popconfirm
                  overlayClassName="ant-popover-delete"
                  placement="topRight"
                  arrowPointAtCenter
                  onConfirm={ this.delete }
                  title={
                    this.props.t('cms.pending_approval.double_confirm.delete_rejected_file.title')
                  }
                  okText={ this.props.t('cms.properties.edit.gallery.library.slider.confirm_delete') }
                  cancelText={ this.props.t('cms.properties.edit.gallery.library.slider.cancel_delete') }
                >
                  <Icon className="gallery-slider-modal__img-delete-btn" type="delete" />
                </Popconfirm>
              </When>
              <Otherwise>
                <Icon
                  className="gallery-slider-modal__img-delete-btn"
                  type="delete"
                  onClick={ this.delete }
                />
              </Otherwise>
            </Choose>
          </div>
          <div className="gallery-slider-modal__thumbnail-container">
            <Slider
              { ...thumbnailSettings }
              key={ `slider-thumbnail-${list.length}` }
              ref={ (e) => { this.thumbnailSlider = e; } }
            >
              <For each="item" of={ list } index="index">
                <div
                  key={ index }
                  role="button"
                  tabIndex="0"
                  className={ classNames(
                    'gallery-slider-modal__thumbnail-item',
                    { 'gallery-slider-modal__thumbnail-item--active': index === activeSlide },
                  ) }
                >
                  <Choose>
                    <When condition={ getFileType(item.contentType) === 'video' }>
                      <Choose>
                        <When
                          condition={
                            item.transcodedStatus === gallery.videoStatus.waitCompress
                          }
                        >
                          <div className="photo-item__img-video-compress">
                            <Icon className="photo-item__img-video-icon" type="video-camera" />
                            <span>{ this.props.t('cms.properties.edit.gallery.file_type.mp4') }</span>
                          </div>
                        </When>
                        <When
                          condition={
                            item.transcodedStatus === gallery.videoStatus.compressed && item.links
                          }
                        >
                          <div className="gallery-slider-modal__img-video-success">
                            <Icon type="play-circle" className="photo-item__video-play-icon" />
                            <img
                              src={ item.links.thumbnail }
                              alt=""
                              className="photo-item__img-multiple"
                            />
                          </div>
                        </When>
                        <Otherwise>
                          <div className={ classNames('gallery-slider-modal__img-video-compress', {
                            'gallery-slider-modal__img-video-compress-err': item.transcodedStatus === gallery.videoStatus.error,
                          }) }
                          >
                            <Choose>
                              <When
                                condition={
                                  item.transcodedStatus === gallery.videoStatus.compressing
                                }
                              >
                                <Svg className="gallery-slider-modal__img-video-icon" hash="hourglass" />
                              </When>
                              <When
                                condition={
                                  item.transcodedStatus === gallery.videoStatus.error
                                }
                              >
                                <Svg className="gallery-slider-modal__img-video-icon" hash="video-failed" />
                              </When>
                              <Otherwise>
                                <Icon className="gallery-slider-modal__img-video-icon" type="video-camera" />
                              </Otherwise>
                            </Choose>
                            <span>{ this.props.t('cms.properties.edit.gallery.file_type.mp4') }</span>
                          </div>
                        </Otherwise>
                      </Choose>
                    </When>
                    <Otherwise>
                      <img
                        alt={ item.filename }
                        src={ imageUrl(item, imageSizes.small) }
                        className="gallery-slider-modal__thumbnail-img"
                      />
                    </Otherwise>
                  </Choose>
                  <If condition={ cover && this.getCoverPhoto(list) === item.id }>
                    <Svg className="gallery-slider-modal__cover" hash="cover" />
                  </If>
                </div>
              </For>
            </Slider>
            <div className="gallery-slider-modal__thumbnail-mask1" />
            <div className="gallery-slider-modal__thumbnail-mask2" />
            <div className="gallery-slider-modal__thumbnail-number">
              <span className="gallery-slider-modal__thumbnail-active-index">{this.state.activeSlide + 1}</span>
              /{list.length}</div>
          </div>
        </div>
      </Modal>
    );
  }
}

ImageSlider.propTypes = {
  t: PropTypes.func.isRequired,
  locales: PropTypes.array,
  title: PropTypes.string,
  deleteItem: PropTypes.func,
  setVideoLocale: PropTypes.func,
  cover: PropTypes.bool,
  keyName: PropTypes.string,
  onChangeLocale: PropTypes.func,
};

ImageSlider.defaultProps = {
  title: 'Unassigned',
  deleteItem: () => {},
  setVideoLocale: () => {},
  locales: ['zh_cn', 'en_us'],
  cover: false,
  keyName: '',
  onChangeLocale: () => {},
};
