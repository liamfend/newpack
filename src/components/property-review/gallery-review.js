import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Row, Col, Icon, Tooltip } from 'antd'
import gallery, { imageSizes } from '~constants/gallery'
import {
  formatLibraries,
  librariesAsArr,
  formatList,
  imageUrl,
  getFileType,
  getLocale,
} from '~helpers/gallery'
import { Hourglass as HourglassIcon, Cover as CoverIcon } from '~components/svgs'

export default class GalleryReview extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      overallLinks: this.formatVirtualLinks('Overall'),
      propertyLinks: this.formatVirtualLinks('Property'),
      roomLinks: this.formatVirtualLinks(
        'Room',
        props.rooms.map(room => room.node),
      ),
      changedCategory: [],
    }
    this.imgViewer = null
    this.sections = ['Overall', 'Property', 'Room']
    this.coverPhotoId = 0
    this.originList = formatList(
      formatLibraries(props.originalData.unitTypes.edges, props.originalData.links),
      props.originalData,
    )
  }

  componentDidMount() {
    if (this.props.changedData && this.props.changedData.data && this.props.isChangedVersion) {
      this.handleGalleryCategoryChanged()
    }
  }

  sortObjectByKey = obj => {
    const ordered = {}
    Object.keys(obj)
      .sort()
      .map(key => {
        ordered[key] = obj[key]
        return true
      })
    return ordered
  }

  checkCategoryChanged = (originalData, changedData) => {
    let hasChanged = false
    const newOriginalData = originalData.map(data => this.sortObjectByKey(data))
    const newChangedData = changedData.map(data => this.sortObjectByKey(data))
    if (JSON.stringify(newOriginalData) !== JSON.stringify(newChangedData)) {
      hasChanged = true
    }

    return hasChanged
  }

  handleGalleryCategoryChanged() {
    Object.keys(this.props.changedData.data.value.list).map(key => {
      if (key === 'property:photo') {
        return true
      }

      if (
        !this.originList[key] ||
        this.props.changedData.data.value.list[key].length !== this.originList[key].length ||
        this.checkCategoryChanged(this.originList[key], this.props.changedData.data.value.list[key])
      ) {
        this.state.changedCategory.push(key)
      }
      return true
    })
    this.setState(this.state)
  }

  formatVirtualLinks = (section, rooms) => {
    const { originalData } = this.props
    switch (section) {
      case 'Overall': {
        const data = []
        originalData.links.map(link => {
          const linkDetails = link
          /* eslint-disable no-underscore-dangle */
          linkDetails.action = link._action
          if (link.label === 'OVERALL') {
            data.push(linkDetails)
          }
          return true
        })

        return data
      }
      case 'Property': {
        const data = []
        originalData.links.map(link => {
          const linkDetails = link
          /* eslint-disable no-underscore-dangle */
          linkDetails.action = link._action
          if (link.label === 'PROPERTY') {
            data.push(linkDetails)
          }
          return true
        })

        return data
      }
      case 'Room': {
        const roomLinks = []
        rooms.map(room => {
          room.links.map(roomLink => {
            roomLinks.push(roomLink)
            return true
          })
          return true
        })
        const resultRoomLinks = Array.from(
          roomLinks.reduce((dict, item) => {
            const key = `displayRegion=${item.displayRegion}&link=${item.link}&enabled=${item.enabled}`
            if (dict.has(key)) {
              dict.get(key).unitTypeIdToLinkId.push({ ...item })
            } else {
              dict.set(key, {
                displayRegion: item.displayRegion,
                link: item.link,
                enabled: item.enabled,
                unitTypeIdToLinkId: [{ ...item }],
                id: `fake_id_${Math.random()}`,
                action: item.action,
              })
            }
            return dict
          }, new Map()),
        ).map(arrItem => arrItem[1])
        return resultRoomLinks
      }
      default:
        return false
    }
  }

  showImageModal = (galleryIndex, index, imgIndex, item) => {
    if (getFileType(item.contentType) !== 'video') {
      this.timer = setTimeout(() => {
        if (this.imgViewer) {
          document.body.removeChild(this.imgViewer)
        }
        const elem = document.createElement('div')
        const img = document.createElement('img')
        img.src = imageUrl(item, imageSizes.big)
        img.className = 'gallery-review__in-modal-img'
        const domRect = this[`img${galleryIndex}${index}${imgIndex}`].getBoundingClientRect()
        elem.style.position = 'absolute'
        elem.className = 'gallery-review__modal'
        elem.style.top = `${domRect.top - 275 - 20}px`
        elem.style.left = `${domRect.left - 500 + domRect.width / 2}px`
        elem.appendChild(img)
        elem.onmouseover = () => {
          clearTimeout(this.removeTimer)
        }
        elem.onmouseout = () => {
          this.onMouseLeave()
        }
        document.body.appendChild(elem)
        this.imgViewer = elem
      }, 300)
    }
  }

  onMouseLeave = () => {
    clearTimeout(this.timer)
    this.removeTimer = setTimeout(() => {
      if (this.imgViewer) {
        document.body.removeChild(this.imgViewer)
        this.imgViewer = null
      }
    }, 300)
  }

  sortGalleries = () => {
    const { t, originalData, changedData } = this.props
    let libraries
    let list
    if (changedData && changedData.data && changedData.data.value) {
      libraries = changedData.data.value.libraries
      list = changedData.data.value.list
    } else {
      libraries = formatLibraries(originalData.unitTypes.edges, originalData.links)
      list = formatList(libraries, originalData)
    }

    const galleriesSorted = {}
    librariesAsArr(libraries).forEach(library => {
      if (library.id !== 'property:photo' && list[library.id]) {
        const galleryType = library.id === 'property:room' ? 'room' : library.id.split(':')[0]
        if (!galleriesSorted[galleryType]) {
          galleriesSorted[galleryType] = []
        }
        galleriesSorted[galleryType].push({
          id: library.id,
          name: library.name || t(library.transKey),
          list: list[library.id],
          multiple: library.multiple,
        })
      }
    })
    return galleriesSorted
  }

  getRoomsName = (rooms, ids) => {
    const resultNames = []
    rooms.map(room => {
      if (ids.includes(JSON.parse(atob(room.id)).id)) {
        resultNames.push(room.name)
      }
      return true
    })
    return resultNames.join('|')
  }

  getVideosTips = imgItem => {
    const videoSize = Math.floor(imgItem.size / 1024 / 1024).toFixed(2)
    return ` <div> Locale: ${getLocale(imgItem.locales)} </div>
      <div>
      ${imgItem.fileName ? imgItem.fileName : ''}
      ${imgItem.size ? `(${videoSize}M)` : ''}
      </div>
      `
  }

  getCoverPhoto = items => {
    let imageId = 0
    if (items) {
      items.map(item => {
        if (item.contentType && getFileType(item.contentType) !== 'video' && imageId === 0) {
          imageId = item.id
          this.coverPhotoId = item.id
        }
        return this.coverPhotoId
      })
    }

    return this.coverPhotoId
  }

  render() {
    const { rooms, changVirtualLinksData, changedData, isChangedVersion, t } = this.props
    const { propertyLinks, overallLinks, roomLinks, changedCategory } = this.state
    const galleriesSorted = this.sortGalleries()
    let galleryTypes = isChangedVersion
      ? changedCategory.map(category =>
          category === 'property:room' ? 'room' : category.split(':')[0],
        )
      : Object.keys(galleriesSorted)
    galleryTypes = Object.keys(galleriesSorted).filter(label => galleryTypes.indexOf(label) !== -1)
    if (
      galleryTypes.length === 0 &&
      !(isChangedVersion && changVirtualLinksData && JSON.stringify(changVirtualLinksData) !== '{}')
    ) {
      return null
    }

    return (
      <div className="gallery-review">
        <If
          condition={
            (isChangedVersion && changedData && JSON.stringify(changedData) !== '{}') ||
            !isChangedVersion
          }
        >
          <For index="galleryIndex" each="galleryType" of={galleryTypes}>
            <div className="gallery-review__container" key={galleryIndex}>
              <div className="gallery-review__title">
                {this.props.t(`cms.properties.edit.review_modal.${galleryType}`)}
              </div>
              <For
                index="index"
                each="photoLibrary"
                of={
                  isChangedVersion
                    ? galleriesSorted[galleryType].filter(
                        category => changedCategory.indexOf(category.id) !== -1,
                      )
                    : galleriesSorted[galleryType]
                }
              >
                <If
                  condition={
                    (photoLibrary.list.length > 0 &&
                      photoLibrary.list.find(
                        imgItem => imgItem.transcodedStatus !== gallery.videoStatus.error,
                      )) ||
                    photoLibrary.list.length === 0
                  }
                >
                  <div key={index}>
                    <div
                      className={classNames('gallery-review__sub-title', {
                        'gallery-review__sub-title--delete': photoLibrary.list.length === 0,
                      })}
                    >
                      <div>{photoLibrary.name}</div>
                      <p className="gallery-review__no-media">
                        <If condition={this.originList[photoLibrary.id]}>
                          {t('cms.properties.edit.review_modal.no_image_or_video')}
                        </If>
                        <If condition={!this.originList[photoLibrary.id]}>
                          {t('cms.properties.edit.review_modal.new_room_no_image_or_video')}
                        </If>
                      </p>
                    </div>
                    <For index="imgIndex" each="imgItem" of={photoLibrary.list}>
                      <If condition={imgItem.transcodedStatus !== gallery.videoStatus.error}>
                        <div
                          key={imgIndex}
                          ref={e => {
                            this[`img${galleryIndex}${index}${imgIndex}`] = e
                          }}
                          onMouseOver={() => {
                            this.showImageModal(galleryIndex, index, imgIndex, imgItem)
                          }}
                          onMouseLeave={this.onMouseLeave}
                          className="gallery-review__img-container"
                        >
                          <Choose>
                            <When condition={photoLibrary.multiple}>
                              <div
                                className="gallery-review__img-container--multiple"
                                data={imgIndex.id}
                              >
                                <Choose>
                                  <When
                                    condition={
                                      imgItem.contentType &&
                                      getFileType(imgItem.contentType) === 'video'
                                    }
                                  >
                                    <Choose>
                                      <When
                                        condition={
                                          imgItem.transcodedStatus ===
                                          gallery.videoStatus.waitCompress
                                        }
                                      >
                                        <Tooltip
                                          getPopupContainer={() =>
                                            this[`img${galleryIndex}${index}${imgIndex}`]
                                          }
                                          placement={'top'}
                                          title={this.props.t(
                                            'cms.properties.edit.gallery.publishing_text',
                                          )}
                                        >
                                          <div className="photo-item__img-video-compress">
                                            <Icon
                                              className="photo-item__img-video-icon"
                                              type="video-camera"
                                            />
                                            <span>
                                              {this.props.t(
                                                'cms.properties.edit.gallery.file_type.mp4',
                                              )}
                                            </span>
                                          </div>
                                        </Tooltip>
                                      </When>
                                      <When
                                        condition={
                                          imgItem.transcodedStatus ===
                                          gallery.videoStatus.compressing
                                        }
                                      >
                                        <div className="photo-item__img-video-compress">
                                          <Tooltip
                                            getPopupContainer={() =>
                                              this[`img${galleryIndex}${index}${imgIndex}`]
                                            }
                                            placement={'top'}
                                            title={this.props.t(
                                              'cms.properties.edit.gallery.compressing_text',
                                            )}
                                          >
                                            <div className="photo-item__img-video-compress--hover">
                                              <HourglassIcon className="photo-item__img-video-icon" />
                                              <span>
                                                {this.props.t(
                                                  'cms.properties.edit.gallery.file_type.mp4',
                                                )}
                                              </span>
                                            </div>
                                          </Tooltip>
                                        </div>
                                      </When>
                                      <Otherwise>
                                        <Tooltip
                                          className="photo-item__img-video-tooltip"
                                          placement="top"
                                          getPopupContainer={() =>
                                            this[`img${galleryIndex}${index}${imgIndex}`]
                                          }
                                          title={
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: this.getVideosTips(imgItem),
                                              }}
                                            />
                                          }
                                        >
                                          <div className="photo-item__img-video-success">
                                            <Icon
                                              type="play-circle"
                                              className="photo-item__video-play-icon"
                                            />
                                            <img
                                              alt=""
                                              className="photo-item__img-multiple"
                                              src={
                                                imgItem && imgItem.links
                                                  ? imgItem.links.thumbnail
                                                  : ''
                                              }
                                            />
                                          </div>
                                        </Tooltip>
                                      </Otherwise>
                                    </Choose>
                                  </When>
                                  <Otherwise>
                                    <img
                                      src={imageUrl(imgItem, imageSizes.small)}
                                      className={'gallery-review__img-item'}
                                      alt={imgItem.filename}
                                      title={imgItem.filename}
                                    />
                                  </Otherwise>
                                </Choose>
                                <If
                                  condition={
                                    galleryType === 'room' &&
                                    photoLibrary.id !== 'property:room' &&
                                    this.getCoverPhoto(photoLibrary.list) === imgItem.id
                                  }
                                >
                                  <CoverIcon className="gallery-review__cover" />
                                </If>
                              </div>
                            </When>
                            <Otherwise>
                              <div className={'gallery-review__img-container--single'}>
                                <img
                                  src={imageUrl(imgItem, imageSizes.middle)}
                                  className={'gallery-review__img-item--single'}
                                  alt={imgItem.filename}
                                  title={imgItem.filename}
                                />
                              </div>
                            </Otherwise>
                          </Choose>
                        </div>
                      </If>
                    </For>
                  </div>
                </If>
              </For>
            </div>
          </For>
        </If>
        <If
          condition={
            (propertyLinks.length || overallLinks.length || roomLinks.length) &&
            ((isChangedVersion &&
              changVirtualLinksData &&
              JSON.stringify(changVirtualLinksData) !== '{}') ||
              !isChangedVersion)
          }
        >
          <div className="gallery-review__container">
            <div className="gallery-review__title">
              {this.props.t('cms.properties.edit.gallery.virtual_tour_links')}
            </div>
            <For of={this.sections} each="section">
              <If
                condition={
                  this.formatVirtualLinks(
                    section,
                    rooms.map(room => room.node),
                  ).length
                }
              >
                <div className="gallery-review__sub-title">
                  <div>
                    {this.props.t('cms.properties.edit.gallery.section_virtual_tour_link', {
                      section,
                    })}
                  </div>
                </div>
                <For
                  of={this.formatVirtualLinks(
                    section,
                    rooms.map(room => room.node),
                  )}
                  each="link"
                >
                  <div
                    className={classNames('gallery-review__container__virtual-link', {
                      'gallery-review__container__virtual-link--disabled': !link.enabled,
                    })}
                    key={link.id}
                  >
                    <If condition={link.action !== 'DELETE'}>
                      <Row type="flex" gutter={34} style={{ flexWrap: 'nowrap' }}>
                        <Col span={5}>
                          <div className="gallery-review__container__virtual-link__title">
                            {this.props.t('cms.properties.edit.gallery.virtual_tour.link_address')}
                          </div>
                        </Col>
                        <Col span={19}>
                          <div className="gallery-review__container__virtual-link__value">
                            {link.link}
                          </div>
                        </Col>
                      </Row>
                      <Row type="flex" gutter={34} style={{ flexWrap: 'nowrap' }}>
                        <Col span={5}>
                          <div className="gallery-review__container__virtual-link__title">
                            {this.props.t('cms.properties.edit.gallery.virtual_tour.locale')}
                          </div>
                        </Col>
                        <Col span={19}>
                          <div className="gallery-review__container__virtual-link__value">
                            {link.displayRegion}
                          </div>
                        </Col>
                      </Row>
                      <If condition={section === 'Property'}>
                        <Row type="flex" gutter={34} style={{ flexWrap: 'nowrap' }}>
                          <Col span={5}>
                            <div className="gallery-review__container__virtual-link__title">
                              {this.props.t(
                                'cms.properties.edit.gallery.virtual_tour.area_of_property',
                              )}
                            </div>
                          </Col>
                          <Col span={19}>
                            <div className="gallery-review__container__virtual-link__value">
                              {this.props.t(
                                `cms.properties.edit.gallery.library.title.${link.area.toLowerCase()}`,
                              )}
                            </div>
                          </Col>
                        </Row>
                      </If>
                      <If condition={section === 'Room'}>
                        <Row type="flex" gutter={34} style={{ flexWrap: 'nowrap' }}>
                          <Col span={5}>
                            <div className="gallery-review__container__virtual-link__title">
                              {this.props.t('cms.properties.edit.gallery.virtual_tour.room')}
                            </div>
                          </Col>
                          <Col span={19}>
                            <div
                              className="gallery-review__container__virtual-link__value room-section"
                              ref={node => {
                                this.tooltipContainer = node
                              }}
                            >
                              <span
                                className="room-value"
                                // eslint-disable-next-line react/no-danger
                                dangerouslySetInnerHTML={{
                                  __html: this.getRoomsName(
                                    rooms.map(room => room.node),
                                    link.unitTypeIdToLinkId.map(item => item.unitTypeId),
                                  ).replace(/\|/g, '<span class="vertical-line">|</span>'),
                                }}
                              />
                            </div>
                          </Col>
                        </Row>
                      </If>
                    </If>
                  </div>
                </For>
              </If>
            </For>
          </div>
        </If>
      </div>
    )
  }
}

GalleryReview.propTypes = {
  t: PropTypes.func.isRequired,
  originalData: PropTypes.object,
  changedData: PropTypes.object,
  rooms: PropTypes.array,
  changVirtualLinksData: PropTypes.object,
  isChangedVersion: PropTypes.bool,
}

GalleryReview.defaultProps = {
  originalData: {},
  changedData: {},
  rooms: [],
  changVirtualLinksData: {},
  isChangedVersion: false,
}
