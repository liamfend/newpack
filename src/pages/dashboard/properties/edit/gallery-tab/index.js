import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Icon, Modal, Tabs } from 'antd';
import gallery from '~constants/gallery';
import { IconVr as IconVrIcon } from "~components/svgs";
import {
  DragLayer,
} from '~components/sortable-gallery';
import {
  formatBytes,
  getFileInfo,
  getFileType,
  formatLibraries,
  librariesAsArr,
  formatList,
  updateList,
} from '~helpers/gallery';
import NoRoomPage from '~pages/dashboard/properties/edit/rooms-tab/no-room-page';
import update from 'immutability-helper';
import Library from '~components/property-gallery/library';
import UploadingModal from '~components/property-gallery/uploading-modal';
import VirtualTourLinkModal from '~components/property-gallery/virtual-tour-link-modal';
import { setEditedFields } from '~helpers/property-edit';
import { updateMutation } from '~client/constants';
import { isLandlordRole } from '~helpers/auth';

const { TabPane } = Tabs;

export default class GalleryTab extends React.Component {
  static SUB_TAB_PROPERTY = 'property';
  static SUB_TAB_ROOMS = 'rooms';
  static DRAP_STATUS_ENTER = 'enter';
  static DRAP_STATUS_LEAVE = 'leave';

  static LIBRARY_MEDIA_DEFAULT = {
    minSize: null,
    types: ['video', 'image'],
    multiple: true,
    required: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeSubTab: this.getSubTabs()[0].key,
      activeUpload: false,
      showVirtualTourLinkModal: false,
      scrollToSection: 'OVERALL',
    };
    this.state.libraries = this.formatLibraries();
    this.state.list = this.formatList();
    this.tabContainerElement = null;
    this.subTabContainerElement = null;
    this.uploadingModalElement = null;
    this.subTabElements = {};
    this.libraryElements = {};
    this.dragLayer = new DragLayer();
  }

  componentDidMount = () => {
    this.resizeContainer();
    window.addEventListener('resize', this.resizeContainer);
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.resizeContainer);
  }

  componentWillReceiveProps = (nextProps, nextState) => {
    if (this.state.libraries && this.state.list) {
      const { list, updated } = updateList(this.state.list, nextProps.rooms);
      this.setState(update(this.state, {
        libraries: { $set: formatLibraries(nextProps.rooms, nextProps.property.links) },
        list: { $set: list },
        showVirtualTourLinkModal: { $set: !!nextState.showVirtualTourLinkModal },
      }), () => {
        if (updated) {
          this.saveList();
        }
      });
    }
    if (!this.props.isNeedInitProperty && nextProps.isNeedInitProperty) {
      this.state.libraries = this.formatLibraries();
      this.state.list = this.formatList();
      this.setState(this.state);
    }
  }

  setSubTabContainerElement = (e) => {
    this.subTabContainerElement = e;
    this.dragLayer.setScrollContainer(this.subTabContainerElement);
  }

  onSubTabScroll = (e) => {
    const containerRect = e.target.getBoundingClientRect();
    const scrollHeight = e.target.scrollHeight;
    const scrollTop = e.target.scrollTop;
    Object.keys(this.subTabElements).reverse().some((key) => {
      const subTabRect = this.subTabElements[key].getBoundingClientRect();
      if (subTabRect.y <= containerRect.y || scrollTop + containerRect.height === scrollHeight) {
        if (this.state.activeSubTab !== key) {
          this.setState({
            activeSubTab: key,
          });
        }
        return true;
      }
      return false;
    });
  }

  isPropertyLoaded = () => (
    !!this.props.property.id
  );

  saveList = (errors) => {
    const { list, libraries } = this.state;
    setEditedFields('gallery', {
      data: {
        value: {
          libraries,
          list,
        },
        errors: errors || this.validateLibraries(),
        touched: true,
      },
    });
  }

  formatList = () => (
    this.isPropertyLoaded() ? formatList(this.state.libraries, this.props.property) : {}
  )

  formatLibraries = () => (
    formatLibraries(this.isPropertyLoaded() ? this.props.rooms : [], this.props.property.links)
  );

  librariesAsArr = () => (
    librariesAsArr(this.state.libraries)
  )

  showError = (error, callback = null) => {
    Modal.error({
      content: error,
      okText: this.props.t('cms.properties.edit.gallery.uploading.button.got_it'),
      onOk: callback,
    });
  }

  resizeContainer = () => {
    const rect = this.tabContainerElement.getBoundingClientRect();
    const containerHeightShouldBe = window.innerHeight - rect.x;
    this.tabContainerElement.style.height = `${containerHeightShouldBe}px`;
  }

  onClickSubTab = (activeKey) => {
    this.subTabContainerElement.scrollTo({
      top: this.subTabElements[activeKey].offsetTop,
      left: 0,
    });
  }

  getSubTabs = () => (
    [
      {
        key: GalleryTab.SUB_TAB_PROPERTY,
        transKey: 'cms.properties.edit.gallery.sub_tab.property',
        renderSection: this.renderTabProperty,
      },
      {
        key: GalleryTab.SUB_TAB_ROOMS,
        transKey: 'cms.properties.edit.gallery.sub_tab.rooms',
        renderSection: this.renderTabRooms,
      },
    ]
  )

  switchToRoomTab = () => {
    this.props.handleTabChange('rooms');
  }

  setSubTabElement = (key, element) => {
    this.subTabElements[key] = element;
  }

  setLibrary = (id, e) => {
    this.libraryElements[id] = e;
  }

  validateLibraries = () => {
    let error = false;
    Object.values(this.libraryElements).forEach((element) => {
      if (element && element.validate && element.validate().validateStatus !== 'success') {
        error = true;
      }
    });
    return error;
  }

  validateFields = () => (new Promise((resolve, reject) => {
    const error = this.validateLibraries();
    if (error) {
      this.saveList(error);
      this.props.setFieldsHaveChanged();
      reject(true);
    } else {
      resolve(false);
    }
  }));

  onDropFiles = async (id, files) => {
    if (this.props.shrinkGalleryModal) {
      this.props.onCloseModal();
    }
    if (files.length) {
      const promiseInfo = [];
      files.forEach((file) => {
        promiseInfo.push(getFileInfo(file));
      });
      this.setState({
        activeUpload: true,
      });
      this.uploadingModalElement.upload(id, files);
    }
  }

  closeUploadingModal = () => {
    this.setState({
      activeUpload: false,
    });
  }

  closeVirtualTourLinkModal = () => {
    this.setState({
      showVirtualTourLinkModal: false,
    });
  }

  openVirtualTourLinkModal = (section) => {
    this.setState({
      showVirtualTourLinkModal: true,
      scrollToSection: section,
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
        }), () => {
          this.saveList();
          this.props.setFieldsHaveChanged();
        });
      } else {
        this.setState(update(this.state, {
          list: {
            [from]: { $set: fromList },
            [to]: { $set: toList },
          },
        }), () => {
          this.saveList();
          this.props.setFieldsHaveChanged();
        });
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
  }

  onDelete = (id, indexes) => {
    const newList = this.state.list[id].slice(0);
    this.spliceItems(newList, indexes);
    this.setState(update(this.state, {
      list: {
        [id]: { $set: newList },
      },
    }), () => {
      this.libraryElements[id].clearSelect();
      this.saveList();
      this.props.setFieldsHaveChanged();
    });
  }

  appendUploadedList = (id, newList, isClose) => {
    if (newList.length) {
      this.setState(update(this.state, {
        activeUpload: { $set: isClose },
        list: {
          [id]: { $push: newList },
        },
      }), () => {
        this.libraryElements[id].clearSelect();
        this.saveList();
        this.props.setFieldsHaveChanged();
      });
    }
  }

  onUpdate = (id, newList) => {
    this.setState(update(this.state, {
      list: {
        [id]: { $set: newList },
      },
    }), () => {
      this.saveList();
      this.props.setFieldsHaveChanged();
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

  renderTabProperty = () => {
    const { t } = this.props;
    const { libraries, list } = this.state;
    return (
      <div>
        <h3 className="gallery-tab__section-title">
          {t('cms.properties.edit.gallery.library.title.property')}
        </h3>
        <For each="library" index="index" of={ libraries.property }>
          <Library
            ref={ (e) => { this.setLibrary(library.id, e); } }
            id={ library.id }
            key={ library.id }
            list={ list[library.id] }
            title={ library.name || t(library.transKey) }
            dropzoneDescription={ library.drapzoneTransKey && t(library.drapzoneTransKey, {
              width: library.minSize[0],
              height: library.minSize[1],
            }) }
            onDelete={ this.onDelete }
            media={ {
              ...GalleryTab.LIBRARY_MEDIA_DEFAULT,
              ...library,
            } }
            dragLayer={ this.dragLayer }
            onSortEnd={ this.onSortEnd }
            onDropFiles={ this.onDropFiles }
            onUpdate={ this.onUpdate }
            cover={ library.cover }
            t={ t }
            links={ library.links }
            scrollToRoomSection={ (section) => {
              this.openVirtualTourLinkModal(section);
            } }
            onChangeLocale={ this.handleChangeLocale }
            canDrop={ this.canDrop }
          />
        </For>
      </div>
    );
  }

  getLibrariesByRole = (rooms) => {
    if (isLandlordRole()) {
      return rooms.filter(room => room.id !== 'property:room');
    }
    return rooms;
  }

  renderTabRooms = () => {
    const { t } = this.props;
    const { libraries, list } = this.state;

    return (
      <div>
        <h3 className="gallery-tab__section-title">
          {t('cms.properties.edit.gallery.library.title.rooms')}
        </h3>
        <Choose>
          <When condition={ libraries.rooms.length > 0 }>
            <div className="gallery-tab__section-undefined-room">
              <Icon theme="filled" type="exclamation-circle" className="gallery-tab__section-undefined-room-icon" />
              {t('cms.properties.edit.gallery.library.tip.undefined_room')}
            </div>
            <For each="library" index="index" of={ this.getLibrariesByRole(libraries.rooms) }>
              <If condition={ library.action !== updateMutation.NEW }>
                <Library
                  ref={ (e) => { this.setLibrary(library.id, e); } }
                  id={ library.id }
                  key={ library.id }
                  list={ list[library.id] }
                  title={ library.name || t(library.transKey) }
                  dropzoneDescription={ library.drapzoneTransKey && t(library.drapzoneTransKey) }
                  onDelete={ this.onDelete }
                  media={ {
                    ...GalleryTab.LIBRARY_MEDIA_DEFAULT,
                    ...library,
                  } }
                  dragLayer={ this.dragLayer }
                  onSortEnd={ this.onSortEnd }
                  onDropFiles={ this.onDropFiles }
                  onUpdate={ this.onUpdate }
                  cover={ library.cover }
                  listings={ library.listings ? library.listings : [] }
                  links={ library.links }
                  scrollToRoomSection={ (section) => {
                    this.openVirtualTourLinkModal(section);
                  } }
                  t={ t }
                  onChangeLocale={ this.handleChangeLocale }
                />
              </If>
            </For>
          </When>
          <Otherwise>
            <NoRoomPage t={ t } handleAddRoomBtnClick={ this.switchToRoomTab } />
          </Otherwise>
        </Choose>
      </div>
    );
  }

  handleChangeLocale = (data, key) => {
    if (data && key && this.state.list[key] && this.state.list[key].length > 0) {
      this.state.list[key].map(obj => [data].find(video => video.id === obj.id) || obj);
      this.setState(this.state);
    }
  };

  render() {
    const { t, rooms, property } = this.props;
    const { activeSubTab, activeUpload, libraries, list } = this.state;

    return (
      <div
        className="gallery-tab"
        ref={ (e) => { this.tabContainerElement = e; } }
      >
        <Row className="gallery-tab__row">
          <Col span={ 10 } className="gallery-tab__col">
            <div className="gallery-tab__primary">
              <div className="gallery-tab__annotation">
                <For each="type" of={ Object.keys(gallery.media) }>
                  <div className="gallery-tab__annotation-item" key={ type }>
                    <span className="gallery-tab__annotation-label">
                      {t(`cms.properties.edit.gallery.annotation_label.${type}`)}
                    </span>
                    {t(`cms.properties.edit.gallery.annotation.${type}`, {
                      types: Object.values(gallery.media[type].types).join(' / '),
                      size: formatBytes(gallery.media[type].size),
                      max: gallery.media[type].max,
                    })}
                  </div>
                </For>
              </div>
              <Library
                keyName="property:photo"
                ref={ (e) => { this.setLibrary(libraries.photo.id, e); } }
                list={ list[libraries.photo.id] }
                id={ libraries.photo.id }
                className="gallery-tab__photo-library"
                title={ t('cms.properties.edit.gallery.library.title.photo') }
                description={ t('cms.properties.edit.gallery.library.description.photo') }
                dropzoneDescription={ t('cms.properties.edit.gallery.library.dropzone_description.photo') }
                media={ { ...GalleryTab.LIBRARY_MEDIA_DEFAULT } }
                onSortEnd={ this.onSortEnd }
                onDelete={ this.onDelete }
                dragLayer={ this.dragLayer }
                onDropFiles={ this.onDropFiles }
                onUpdate={ this.onUpdate }
                cover={ libraries.photo.cover }
                t={ t }
                onChangeLocale={ this.handleChangeLocale }
              />
            </div>
          </Col>
          <Col span={ 14 } className="gallery-tab__col">
            <div className="gallery-tab__partition">
              <div className="gallery-tab__sub-tabs">
                <Tabs
                  activeKey={ activeSubTab }
                  onChange={ (key) => { this.onClickSubTab(key); } }
                  tabBarExtraContent={
                    <div role="presentation" className="gallery-tab__sub-tabs__icon" onClick={ () => { this.openVirtualTourLinkModal('OVERALL'); } }>
                      <IconVrIcon className="icon-vr" />
                      <span>{t('cms.properties.edit.gallery.virtual_tour')}</span>
                    </div>
                  }
                >
                  <For each="subTab" of={ this.getSubTabs() }>
                    <TabPane tab={ t(subTab.transKey) } key={ subTab.key } />
                  </For>
                </Tabs>
              </div>
              <div
                className="gallery-tab__tab-sections"
                ref={ this.setSubTabContainerElement }
                onScroll={ this.onSubTabScroll }
              >
                <div className="gallery-tab__tab-section-completion">
                  <For each="subTab" of={ this.getSubTabs() }>
                    <div
                      key={ subTab.key }
                      className="gallery-tab__tab-section"
                      ref={ (e) => { this.setSubTabElement(subTab.key, e); } }
                    >
                      {subTab.renderSection()}
                    </div>
                  </For>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <If condition={ activeUpload }>
          <UploadingModal
            activeModal={ activeUpload && !this.props.shrinkGalleryModal }
            withRef={ (e) => { this.uploadingModalElement = e; } }
            t={ t }
            onClose={ this.closeUploadingModal }
            onConfirm={ this.appendUploadedList }
            verifyList={ this.verifyList }
            libraries={ this.librariesAsArr() }
            onCloseModal={ this.props.onCloseModal }
            shrinkGalleryModal={ this.state.shrinkGalleryModal }
            propertyId={ property.id }
            haveCoverPhoto={ this.props.haveCoverPhoto }
          />
        </If>
        <If condition={ this.state.showVirtualTourLinkModal }>
          <VirtualTourLinkModal
            visible
            t={ t }
            onCancel={ this.closeVirtualTourLinkModal }
            rooms={ rooms }
            property={ property }
            libraries={ libraries }
            list={ list }
            scrollTo={ this.state.scrollToSection }
          />
        </If>
      </div>
    );
  }
}

GalleryTab.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object.isRequired,
  rooms: PropTypes.array.isRequired,
  links: PropTypes.array.isRequired,
  handleTabChange: PropTypes.func.isRequired,
  shrinkGalleryModal: PropTypes.bool,
  onCloseModal: PropTypes.func,
  haveCoverPhoto: PropTypes.bool,
  isNeedInitProperty: PropTypes.bool,
  setFieldsHaveChanged: PropTypes.func,
};

GalleryTab.defaultProps = {
  t: () => { },
  links: [],
  shrinkGalleryModal: false,
  onCloseModal: () => {},
  haveCoverPhoto: false,
  isNeedInitProperty: false,
  setFieldsHaveChanged: () => {},
};
