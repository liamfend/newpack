import React from 'react'
import { Form } from 'antd'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { sortableContainer } from '~components/sortable-gallery'
import ImageSlider from '~components/property-gallery/image-slider'
import { imageUrl, getFileType } from '~helpers/gallery'
import { htmlToString } from '~helpers'
import { imageSizes } from '~constants/gallery'
import { updateMutation } from '~client/constants'
import SortableLibrary from './SortableLibrary'

const SortLibrary = sortableContainer(props => (
  <SortableLibrary
    items={props.items}
    dropzoneDescription={props.dropzoneDescription}
    media={props.media}
    onViewGallery={props.onViewGallery}
    onSelect={props.onSelect}
    onDropFiles={props.onDropFiles}
    cover={props.cover}
    t={props.t}
    onCancel={props.onCancel}
    onReload={props.onReload}
    onDelete={props.onDelete}
    onChangeLocale={props.onChangeLocale}
    libraryId={props.id}
  />
))

/**
 * Gallery Library that allow user to manage image/video by drapping and dropping
 */
export default class Library extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      deleteActive: false,
      validateStatus: 'success',
      validateMessage: '',
    }
    this.container = null
    this.libraryElement = null
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list !== this.props.list) {
      this.validate(nextProps)
    }
  }

  validate = props => {
    const checkProps = props || this.props
    let result = {
      validateStatus: 'success',
      validateMessage: '',
    }
    if (
      (checkProps.media.required && checkProps.list.length === 0) ||
      (checkProps.media.required && checkProps.list[0] && checkProps.list[0].status === 'REJECTED')
    ) {
      result = {
        validateStatus: 'error',
        validateMessage: this.props.t('cms.properties.edit.gallery.error.library_required', {
          library: checkProps.title,
        }),
      }
    }
    if (
      result.validateStatus !== this.state.validateStatus ||
      result.validateMessage !== this.state.validateMessage
    ) {
      this.setState(result)
    }
    return result
  }

  setContainer = e => {
    if (e) {
      this.container = e
    }
  }

  onViewGallery = item => {
    const { id, list } = this.props
    this.imageSlider.show(list.indexOf(item), list, newList => {
      this.props.onUpdate(id, newList)
    })
  }

  onSelect = () => {
    this.setState({
      deleteActive: this.container.getSelectedIndexes().length > 0,
    })
  }

  selectAll = () => {
    this.container.triggerSelectAll()
  }

  shouldClearSelected = e => {
    const closestLibrary = e.target.closest('.gallery-library')
    if (
      (closestLibrary === this.libraryElement &&
        e.target.closest('.gallery-library__clearing-select-disabled')) ||
      e.target.closest('.gallery-library__clearing-select-disabled--global')
    ) {
      return false
    }
    return true
  }

  onSortEnd = details => {
    this.props.onSortEnd(details)
  }

  onConfirmDelete = () => {
    this.setState(
      {
        deleteActive: false,
      },
      () => {
        this.props.onDelete(this.props.id, this.container.getSelectedIndexes())
      },
    )
  }

  addSelectedIndexes = indexes => {
    this.container.addSelectedIndexes(indexes)
  }

  clearSelect = () => {
    this.container.clearSelected()
  }

  onDropFiles = files => {
    this.props.onDropFiles(this.props.id, files)
  }

  createHelper = element => {
    const node = document.createElement('div')
    const item = document.createElement('div')
    const type = getFileType(element.getItem().contentType)
    item.className = classNames(
      'photo-item__img-container',
      'photo-item__img-container--multiple',
      'photo-item__img-container--selected',
      'photo-item__img-container--dragging',
    )
    let imgHTML
    if (type === 'video') {
      imgHTML = htmlToString(
        element.node.querySelector(
          '.photo-item__img-video-success,.photo-item__img-video-compress',
        ),
      )
    } else {
      imgHTML = `<img src=${imageUrl(
        element.getItem(),
        imageSizes.small,
      )} class="photo-item__img-multiple" />`
      if (element.node.querySelector('.photo-item__cover-photo')) {
        imgHTML += `<div class="photo-item__cover-photo">
          <span class="photo-item__cover-text">${this.props.t(
            'cms.properties.edit.gallery.cover_text',
          )}</span>
        </div>`
      }
    }

    item.innerHTML = imgHTML
    node.appendChild(item)
    const margin = { left: 0, right: 0, top: 0, bottom: 0 }
    const dimensions = {
      width: 82,
      height: 82,
    }
    return {
      node,
      dimensions,
      margin,
    }
  }

  haveValidListing = listings => {
    if (listings && listings.length > 0) {
      if (
        listings.filter(
          listing =>
            listing.action === updateMutation.DELETE || listing.action === updateMutation.NEW,
        ).length === listings.length
      ) {
        return true
      }
    }

    if (listings && listings.length <= 0) {
      return true
    }

    return false
  }

  handleChangeLocale = (locales, videoId) => {
    this.props.onChangeLocale(locales, videoId, this.props.id)
  }

  render() {
    const { title, description, dropzoneDescription, className, t, media, cover, reminder } =
      this.props

    const { validateStatus, validateMessage } = this.state

    return (
      <div
        ref={e => {
          this.libraryElement = e
        }}
        className={classNames('gallery-library', className)}
        list={this.props.list}
      >
        <ImageSlider
          t={t}
          ref={e => {
            this.imageSlider = e
          }}
          title={title}
          cover={cover}
          onChangeLocale={this.handleChangeLocale}
          keyName={this.props.keyName}
        />
        <Form className="gallery-library__form" layout="vertical">
          <Form.Item validateStatus={validateStatus} help={validateMessage}>
            <div>
              <If condition={description}>
                <h4
                  className={classNames('gallery-library__title', {
                    'gallery-library__requirement': media.required,
                  })}
                >
                  {title}
                </h4>
                <p className="gallery-library__description">{description}</p>
              </If>
              <div className="gallery-library__action">
                <If condition={!description}>
                  <h4
                    className={classNames(
                      'gallery-library__title',
                      'gallery-library__title-start',
                      { 'gallery-library__requirement': media.required },
                    )}
                    ref={node => {
                      this.vrTooltipContainer = node
                    }}
                  >
                    {/* <If condition={
                      links.filter(link => link.enabled).length && id !== 'property:room'
                      }>
                      <Tooltip
                        arrowPointAtCenter
                        title={ t('cms.properties.edit.gallery.virtual_tour_icon_hint') }
                        placement="topLeft"
                        getPopupContainer={ () => this.vrTooltipContainer }
                      >
                        <span>
                          <Svg
                            className="icon-vr"
                            hash="icon-vr"
                            attributes={
                              { onClick: () => { scrollToRoomSection(links[0].label || 'ROOM'); } }
                            }
                          />
                        </span>
                      </Tooltip>
                    </If> */}
                    {title}
                    <If condition={reminder}>
                      <span className="gallery-library__reminder">{reminder}</span>
                    </If>
                    {/* <If condition={
                      this.haveValidListing(listings)
                      && media.category === 'ROOM'
                      && id !== 'property:room'
                    }
                    >
                      <Tooltip
                        arrowPointAtCenter
                        placement="topLeft"
                        title={ t('cms.properties.edit.gallery.no_listing_tip') }
                        overlayClassName="gallery-library__no-listing-tips"
                      >
                        <div className="gallery-library__no-listing">
                          <Svg className="gallery-library__no-listing-icon" hash="no-listing" />
                        </div>
                      </Tooltip>
                    </If> */}
                  </h4>
                </If>
                {/* <If condition={ list.length > 0 }>
                  <Choose>
                    <When condition={ deleteActive }>
                      <div className="gallery-library__delete gallery-library__delete--active
                        gallery-library__clearing-select-disabled">
                        <Popconfirm
                          overlayClassName="ant-popover-delete
                            gallery-library__clearing-select-disabled--global"
                          placement="topRight"
                          arrowPointAtCenter
                          onConfirm={ this.onConfirmDelete }
                          title={ t('cms.properties.edit.gallery.library.slider.delete_tip') }
                          okText={ t('cms.properties.edit.gallery.library.slider.confirm_delete') }
                          cancelText={
                            t('cms.properties.edit.gallery.library.slider.cancel_delete')
                          }
                        >
                          <Icon className="gallery-library__delete-icon" type="delete" />
                          {t('cms.properties.edit.gallery.delete_btn')}
                        </Popconfirm>
                      </div>
                    </When>
                    <Otherwise>
                      <div className="gallery-library__delete">
                        <Icon className="gallery-library__delete-icon" type="delete" />
                        {t('cms.properties.edit.gallery.delete_btn')}
                      </div>
                    </Otherwise>
                  </Choose>
                  <Divider type="vertical" />
                  <div
                    className="gallery-library__select gallery-library__clearing-select-disabled"
                    role="button"
                    tabIndex="0"
                    onClick={ this.selectAll }
                  >
                    {t('cms.properties.edit.gallery.select_all_btn')}
                  </div>
                  </If> */}
              </div>
              <div className="gallery-library__drapzone">
                <SortLibrary
                  id={this.props.id}
                  ref={this.setContainer}
                  enabledClassName="gallery-library__dropzone--enabled"
                  disabledClassName="gallery-library__dropzone--disabled"
                  items={this.props.list}
                  dragLayer={this.props.dragLayer}
                  distance={3}
                  onSortEnd={this.onSortEnd}
                  multiple={this.props.media.multiple}
                  createHelper={this.createHelper}
                  dropzoneDescription={dropzoneDescription}
                  media={media}
                  onViewGallery={this.onViewGallery}
                  onSelect={this.onSelect}
                  shouldClearSelected={this.shouldClearSelected}
                  onDropFiles={this.onDropFiles}
                  cover={cover}
                  t={t}
                  canDrop={this.props.canDrop}
                  onCancel={this.props.onCancel}
                  onReload={this.props.onReload}
                  onDelete={this.props.onDelete}
                  onChangeLocale={this.props.onChangeLocale}
                />
              </div>
            </div>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

Library.propTypes = {
  id: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  dropzoneDescription: PropTypes.string,
  className: PropTypes.string,
  media: PropTypes.shape({
    minSize: PropTypes.array,
    types: PropTypes.array,
    multiple: PropTypes.bool,
    required: PropTypes.bool,
  }),
  list: PropTypes.array,
  onSortEnd: PropTypes.func,
  dragLayer: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onDropFiles: PropTypes.func,
  onUpdate: PropTypes.func,
  cover: PropTypes.bool,
  keyName: PropTypes.string,
  onChangeLocale: PropTypes.func,
  canDrop: PropTypes.func,
  onCancel: PropTypes.func,
  onReload: PropTypes.func,
  reminder: PropTypes.string,
}

Library.defaultProps = {
  t: () => {},
  description: '',
  dropzoneDescription: '',
  className: '',
  media: {
    minSize: null,
    types: ['video', 'image'],
    multiple: true,
    required: false,
  },
  list: [],
  cover: false,
  onSortEnd: () => {},
  onDelete: () => {},
  onDropFiles: () => {},
  onUpdate: () => {},
  keyName: '',
  onChangeLocale: () => {},
  canDrop: () => {},
  onCancel: () => {},
  onReload: () => {},
  reminder: '',
}
