import React from 'react'
import PropTypes from 'prop-types'
import { sortableElement } from '~components/sortable-gallery'
import PhotoItem from '~components/property-gallery/photo-item'
import Dropzone from 'react-dropzone'
import update from 'immutability-helper'
import Svg from '~components/svg'
import classNames from 'classnames'
import { Icon } from 'antd'
import { getFileType, imageUrl } from '~helpers/gallery'
import gallery, { imageSizes } from '~constants/gallery'

const SortMultipleItem = sortableElement(props => {
  if (!props.item) {
    return false
  }

  const params = {
    t: props.t,
    className: props.className,
    type: getFileType(props.item.contentType),
    isSingle: false,
    isCover: props.isCover,
    viewGallery: e => {
      e.stopPropagation()
      props.onViewGallery(props.item)
    },
    parentType: 'library',
    status: props.item.status,
    uploadState: props.item.uploadState,
    progress: props.item.progress,
    onCancel: e => {
      e.stopPropagation()
      props.onCancel(props.item, props.libraryId)
    },
    onReload: e => {
      e.stopPropagation()
      props.onReload(props.item, props.libraryId)
    },
    onDelete: e => {
      e.stopPropagation()
      props.onDelete(props.item, props.libraryId)
    },
    libraryId: props.libraryId,
  }

  if (params.type === 'image') {
    params.src = imageUrl(props.item, imageSizes.big)
  } else {
    params.transcodedStatus = props.item.transcodedStatus
    params.src = props.item.links && props.item.links.thumbnail ? props.item.links.thumbnail : ''
    params.videoHash = props.item.videoHash
    params.onChangeLocale = e => {
      props.onChangeLocale(e, props.item.id, props.libraryId)
    }
    params.locales = props.item.locales
    params.handlePause = props.item.handlePause
    params.handleRestart = props.item.handleRestart
    params.handleContinue = props.item.handleContinue
    params.handleDelete = props.item.handleDelete
  }

  return <PhotoItem {...params} />
})

const SortSingleItem = sortableElement(props => {
  if (!props.item) {
    return false
  }
  const params = {
    t: props.t,
    className: props.className,
    type: getFileType(props.item.contentType),
    isSingle: true,
    isCover: props.isCover,
    viewGallery: e => {
      e.stopPropagation()
      props.onViewGallery(props.item)
    },
    parentType: 'library',
    status: props.item.status,
    uploadState: props.item.uploadState,
    progress: props.item.progress,
    onCancel: e => {
      e.stopPropagation()
      props.onCancel(props.item, props.libraryId)
    },
    onReload: e => {
      e.stopPropagation()
      props.onReload(props.item, props.libraryId)
    },
    onDelete: e => {
      e.stopPropagation()
      props.onDelete(props.item, props.libraryId)
    },
  }

  if (params.type === 'image') {
    params.src = imageUrl(props.item, imageSizes.big)
  } else {
    params.transcodedStatus = props.item.transcodedStatus
    params.src = props.item.links && props.item.links.thumbnail ? props.item.links.thumbnail : ''
  }

  return <PhotoItem {...params} />
})

export default class SortableLibrary extends React.Component {
  static DRAP_STATUS_ENTER = 'enter'
  static DRAP_STATUS_LEAVE = 'leave'

  constructor(props) {
    super(props)
    this.state = {
      drapStatus: SortableLibrary.DRAP_STATUS_LEAVE,
      selectedIndexes: [],
    }
    this.coverPhotoId = ''
  }

  setDrapStatus = status => {
    this.setState(
      update(this.state, {
        drapStatus: { $set: status },
      }),
    )
  }

  dropProps = data => ({
    ...data,
    accept: this.getAcceptTypes(),
    onDragEnter: () => this.setDrapStatus(SortableLibrary.DRAP_STATUS_ENTER),
    onDragLeave: () => this.setDrapStatus(SortableLibrary.DRAP_STATUS_LEAVE),
    onDrop: this.onDrop,
  })

  getAcceptTypes = () => {
    let acceptTypes = []
    const { media } = this.props
    media.types.forEach(type => {
      if (gallery.media[type]) {
        const types = Object.keys(gallery.media[type].types)
        acceptTypes = acceptTypes.concat(types)
      }
    })
    return acceptTypes
  }

  onDrop = acceptedFiles => {
    this.setDrapStatus(SortableLibrary.DRAP_STATUS_LEAVE)
    this.props.onDropFiles(acceptedFiles)
  }

  renderIcons = () => {
    const allTypes = Object.keys(gallery.media)
    const showTypes = this.props.media.types.filter(type => allTypes.includes(type))
    return showTypes.reduce((results, type, index) => {
      if (index !== 0) {
        results.push(<span key={`split-${type}`} className="gallery-library__media-icon-split" />)
      }
      results.push(<Svg key={type} className="gallery-library__media-icon" hash={type} />)
      return results
    }, [])
  }

  renderMediaDescription = () => {
    const { dropzoneDescription } = this.props
    return (
      <div className="gallery-library__media">
        <div className="gallery-library__media-icons">
          <Icon type="plus" className="gallery-library__plus-icon" />
        </div>
        <If condition={dropzoneDescription}>
          <div className="gallery-library__dropzone-description">{dropzoneDescription}</div>
        </If>
      </div>
    )
  }

  getCoverPhoto = () => {
    if (this.props.items && this.props.items.length > 0) {
      this.props.items.some(item => {
        if (
          item &&
          item.contentType &&
          getFileType(item.contentType) === 'image' &&
          item.imageHash
        ) {
          this.coverPhotoId = item.id
        }
        return true
      })
    }
  }

  render() {
    const {
      t,
      media,
      items,
      onViewGallery,
      onSelect,
      cover,
      onCancel,
      onReload,
      onDelete,
      onChangeLocale,
      libraryId,
    } = this.props

    const { drapStatus } = this.state
    this.getCoverPhoto()

    return (
      <Choose>
        <When condition={items && items.length > 0}>
          <Dropzone {...this.dropProps({ noClick: true, noDragEventsBubbling: true })}>
            {outerProps => (
              <Choose>
                <When condition={media.multiple}>
                  <div
                    className={classNames(
                      'gallery-library__list-container',
                      'gallery-library__list-container--multiple',
                      {
                        'gallery-library__dropzone--upload-active':
                          drapStatus === SortableLibrary.DRAP_STATUS_ENTER,
                      },
                    )}
                    {...outerProps.getRootProps()}
                  >
                    <Dropzone {...this.dropProps()}>
                      {({ getRootProps, getInputProps }) => (
                        <div
                          className={classNames('gallery-library__dropzone', {
                            'gallery-library__dropzone--upload-active':
                              drapStatus === SortableLibrary.DRAP_STATUS_ENTER,
                          })}
                          {...getRootProps()}
                        >
                          <input {...getInputProps()} />
                          {this.renderMediaDescription()}
                        </div>
                      )}
                    </Dropzone>
                    {items.map((value, index) => {
                      const key = `sort-multiple-${index}`
                      return (
                        <SortMultipleItem
                          key={key}
                          index={index}
                          item={value}
                          isCover={value.imageHash && this.coverPhotoId === value.id && cover}
                          selectedClassName="photo-item__img-container--selected"
                          onSelect={onSelect}
                          onViewGallery={onViewGallery}
                          t={t}
                          onCancel={onCancel}
                          onReload={onReload}
                          onDelete={onDelete}
                          onChangeLocale={onChangeLocale}
                          libraryId={libraryId}
                        />
                      )
                    })}
                  </div>
                </When>
                <Otherwise>
                  <div
                    className={classNames(
                      'gallery-library__list-container',
                      'gallery-library__list-container--single',
                    )}
                  >
                    <div className="gallery-library__add-item">
                      <Icon className="gallery-library__add-item-icon" type="plus" />
                    </div>
                    <SortSingleItem
                      item={items[0]}
                      isCover={cover}
                      className="gallery-library__item-single"
                      selectedClassName="photo-item__img-container--selected"
                      onSelect={onSelect}
                      onViewGallery={onViewGallery}
                      t={t}
                      onCancel={onCancel}
                      onReload={onReload}
                      onDelete={onDelete}
                      libraryId={libraryId}
                    />
                  </div>
                </Otherwise>
              </Choose>
            )}
          </Dropzone>
        </When>
        <Otherwise>
          <Dropzone {...this.dropProps()}>
            {({ getRootProps, getInputProps }) => (
              <div
                className={classNames('gallery-library__dropzone', {
                  'gallery-library__dropzone--upload-active':
                    drapStatus === SortableLibrary.DRAP_STATUS_ENTER,
                })}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                {this.renderMediaDescription()}
              </div>
            )}
          </Dropzone>
        </Otherwise>
      </Choose>
    )
  }
}

SortableLibrary.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  t: PropTypes.func.isRequired,
  dropzoneDescription: PropTypes.string,
  className: PropTypes.string,
  media: PropTypes.shape({
    minSize: PropTypes.array,
    types: PropTypes.array,
    multiple: PropTypes.bool,
  }),
  cover: PropTypes.bool,
  onViewGallery: PropTypes.func,
  onSelect: PropTypes.func,
  onDropFiles: PropTypes.func,
  onCancel: PropTypes.func,
  onReload: PropTypes.func,
  onDelete: PropTypes.func,
  onChangeLocale: PropTypes.func,
  libraryId: PropTypes.string,
}

SortableLibrary.defaultProps = {
  items: [],
  t: () => {},
  multiple: true,
  dropzoneDescription: '',
  className: '',
  media: {
    minSize: null,
    types: ['video', 'image'],
    multiple: true,
  },
  cover: false,
  onViewGallery: () => {},
  onSelect: () => {},
  onDropFiles: () => {},
  onCancel: () => {},
  onReload: () => {},
  onDelete: () => {},
  onChangeLocale: () => {},
  libraryId: '',
}
