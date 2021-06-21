import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Button, Icon } from 'antd'
import modal from '~components/modal'
import RichTextViewer from '~components/property-review/rich-text-viewer'
import GalleryReview from '~components/property-review/gallery-review'
import RoomListingReview from '~components/property-review/room-listing'
import { richTextFields } from '~constants/property-format'
import {
  formateReviewEditedData,
  formateReviewFullData,
  isChangedFieldsEmpty,
  isRoomChanged,
  isGalleryChanged,
} from '~helpers/property-edit'
import { updateMutation } from '~client/constants'
import { isLandlordRole } from '~helpers/auth'

@modal(
  {
    className: 'property-review-modal',
  },
  true,
)
export default class PropertyReviewModal extends React.Component {
  constructor(props) {
    super(props)

    this.fullFields = formateReviewFullData(props.originalData, props.changedData)
    this.changedFields = formateReviewEditedData(props.originalData, props.changedData)

    this.showSwitchLink =
      props.showChangedVersion &&
      (!isChangedFieldsEmpty(this.changedFields) ||
        isRoomChanged(props.roomData) ||
        isGalleryChanged(props.originalData, props.changedData))
    this.state = {
      isChangedVersion: this.showSwitchLink,
    }
  }

  toggleVersion = () => {
    this.setState({ isChangedVersion: !this.state.isChangedVersion })
  }

  isCollasped = () => !!document.querySelector('.sidebar--collapsed')

  renderTopicGallery = name => {
    const { t, originalData, changedData, roomData } = this.props

    return (
      <If condition={!this.state.isChangedVersion || isGalleryChanged(originalData, changedData)}>
        <div className="property-review__topic">
          {this.renderTopicName(name)}
          <div className="property-review__topic__content">
            <GalleryReview
              t={t}
              originalData={originalData}
              changedData={changedData ? changedData.gallery : null}
              changVirtualLinksData={changedData ? changedData.virtualLinks : {}}
              rooms={roomData || []}
              isChangedVersion={this.state.isChangedVersion}
            />
          </div>
        </div>
      </If>
    )
  }

  renderTopicName = (name, jumpTab) => {
    const { t, onClose, isEditPage } = this.props
    return (
      <div className="property-review__topic__title">
        {t(`cms.properties.edit.tab_label.${name}`)}
        <If condition={isEditPage}>
          <span
            className="property-review__topic__edit"
            tabIndex={0}
            role="button"
            onClick={() => {
              onClose(jumpTab || name)
            }}
          >
            {t('cms.properties.edit.review_modal.edit')}
          </span>
        </If>
      </div>
    )
  }

  renderTopic = (name, fields) => {
    const { t } = this.props
    return (
      <If condition={!this.state.isChangedVersion || (fields && fields.length > 0)}>
        <div className="property-review__topic">
          {this.renderTopicName(name)}
          <div className="property-review__topic__content">
            <Choose>
              <When condition={!fields || fields.length === 0}>
                <div className="property-review__empty-topic">
                  {t('cms.properties.edit.review_modal.topic.empty')}
                </div>
              </When>
              <Otherwise>
                <For each="field" of={fields} index="index">
                  <If
                    condition={
                      !(
                        isLandlordRole() &&
                        ((name === 'details' &&
                          ['headlineCn', 'descriptionCn', 'rankType', 'rank'].indexOf(field.key) !==
                            -1) ||
                          (name === 'address' && field.key === 'universities'))
                      )
                    }
                  >
                    <div key={index} className="property-review__item">
                      <div className="property-review__item__name">{t(field.name)}</div>
                      <div className="property-review__item__content">
                        <Choose>
                          <When condition={richTextFields.indexOf(field.key) !== -1 && field.text}>
                            <RichTextViewer content={field.text} t={t} />
                          </When>
                          <Otherwise>
                            <span
                              dangerouslySetInnerHTML={{
                                __html:
                                  field.text === null ||
                                  field.text === undefined ||
                                  field.text === ''
                                    ? '-'
                                    : field.text,
                              }}
                            />
                          </Otherwise>
                        </Choose>
                      </div>
                    </div>
                  </If>
                </For>
              </Otherwise>
            </Choose>
          </div>
        </div>
      </If>
    )
  }

  isRoomDataEmpty = roomData =>
    !roomData || !roomData.find(item => item.node.action !== updateMutation.DELETE)

  renderRoomListing = () => {
    const { t, originalData, roomData } = this.props
    return (
      <If condition={!this.state.isChangedVersion || isRoomChanged(roomData)}>
        <div className="property-review__topic">
          {this.renderTopicName(
            'room-listing',
            this.isRoomDataEmpty(roomData) ? 'rooms' : 'listings',
          )}
          <RoomListingReview
            t={t}
            isChangedVersion={this.state.isChangedVersion}
            property={originalData}
            originalData={originalData.unitTypes.edges}
            changedData={roomData}
          />
        </div>
      </If>
    )
  }

  render() {
    const { t, onClose, buttons } = this.props
    const { isChangedVersion } = this.state
    const showedData = isChangedVersion ? this.changedFields : this.fullFields
    return (
      <div
        className={classNames('property-review', {
          'property-review--collasped': this.isCollasped(),
        })}
      >
        <div className="property-review__header">
          {t(
            `cms.properties.edit.review_modal.${
              isChangedVersion ? 'changed_version_title' : 'full_version_title'
            }`,
          )}
          <If condition={this.showSwitchLink}>
            <a
              className="property-review__header__link"
              role="button"
              tabIndex={0}
              onClick={this.toggleVersion}
            >
              <Choose>
                <When condition={isChangedVersion}>
                  {t('cms.properties.edit.review_modal.change_to_full')}
                </When>
                <Otherwise>{t('cms.properties.edit.review_modal.change_to_compare')}</Otherwise>
              </Choose>
            </a>
          </If>
          <Icon
            type="close"
            className="property-review__header__close"
            onClick={() => {
              onClose()
            }}
          />
        </div>

        <div className="property-review__body">
          {this.renderTopic('details', showedData.details)}
          {this.renderTopic('address', showedData.address)}
          {this.renderTopic('facilities', showedData.facilities)}
          {this.renderRoomListing(showedData.roomListing)}
          {this.renderTopicGallery('gallery')}
        </div>

        <div className="property-review__footer">
          <For each="button" of={buttons} index="key">
            <Button
              key={key}
              className={classNames('property-review__btn', {
                'property-review__btn--not-primary': !button.primary,
              })}
              onClick={button.onClick}
              size="large"
              loading={!!button.loading}
              type={button.primary ? 'primary' : null}
            >
              {button.text}
            </Button>
          </For>
        </div>
      </div>
    )
  }
}

PropertyReviewModal.propTypes = {
  showChangedVersion: PropTypes.bool,
  changedData: PropTypes.object,
  originalData: PropTypes.object,
  roomData: PropTypes.array,
  onClose: PropTypes.func,
  t: PropTypes.func.isRequired,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      onClick: PropTypes.func,
    }),
  ),
  isEditPage: PropTypes.bool,
}

PropertyReviewModal.defaultProps = {
  showChangedVersion: false,
  changedData: null,
  originalData: null,
  roomData: null,
  onClose: () => {},
  t: () => {},
  buttons: [],
  isEditPage: true,
}
