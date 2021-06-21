import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Icon, Col, Row, Form, Popconfirm } from 'antd'
import modal from '~components/modal'
import MyMap from '~components/my-map'
import { fireCustomEvent } from '~helpers/custom-events'
import { locationTabType, locationType, platformEntity, entityAction } from '~constants'
import { imageUrl } from '~helpers/gallery'
import { handleSEOTemplate } from '~helpers/location'
import { imageSizes } from '~constants/gallery'
import generatePath from '~settings/routing'
import { Link } from 'react-router-dom'
import showElementByAuth from '~helpers/auth'

@modal({
  className: 'location-review-modal',
})
class LocationReviewModal extends React.Component {
  constructor() {
    super()
    this.entityMapping = {
      City: platformEntity.LOCATIONS_CITIES,
      Area: platformEntity.LOCATIONS_AREAS,
      University: platformEntity.UNIVERSITIES_UNIVERSITIES,
    }
  }

  generateDescription = (label, value, tab) => (
    <tr className="location-review__description" key={label}>
      <Choose>
        <When condition={label === 'name' || label === 'slug'}>
          <td className="location-review__description-label">
            {this.props.t(`cms.edit.${tab}.label.${label}`, {
              type: this.props.type,
            })}
          </td>
        </When>
        <Otherwise>
          <td className="location-review__description-label">
            {this.props.t(`cms.edit.${tab}.label.${label}`)}
          </td>
        </Otherwise>
      </Choose>
      <Choose>
        <When condition={label === 'summary'}>
          <td
            className="location-review__description-item"
            dangerouslySetInnerHTML={{ __html: value || '-' }}
          />
        </When>
        <When condition={label === 'common_names'}>
          <td className="location-review__description-item">
            {value && value.length !== 0 ? value.join('/') : '-'}
          </td>
        </When>
        <When condition={label === 'rank'}>
          <td className="location-review__description-item">{value}</td>
        </When>
        <When condition={label === 'hero_image'}>
          <td className="location-review__description-item">
            <If condition={this.props.data.heroImage}>
              <img
                className="location-review__img"
                src={imageUrl(this.props.data.heroImage, imageSizes.heroImageThumbnail)}
                alt={this.props.data.heroImage.filename}
              />
            </If>
            <If condition={this.props.data.smallHeroImage}>
              <img
                className="location-review__img"
                src={imageUrl(this.props.data.smallHeroImage, imageSizes.smallHeroImageThumbnail)}
                alt={this.props.data.smallHeroImage.filename}
              />
            </If>
            <If condition={!this.props.data.heroImage && !this.props.data.smallHeroImage}>-</If>
          </td>
        </When>
        <Otherwise>
          <td className="location-review__description-item">{value || '-'}</td>
        </Otherwise>
      </Choose>
    </tr>
  )

  handleEdit = targetTab => {
    fireCustomEvent('changeLocationTab', targetTab)
    this.props.handleClose()
  }

  handlePublish = () => {
    this.props.onSave(true)
    this.props.handleClose()
  }

  handleUnpublish = () => {
    this.props.onSave(false)
    this.props.handleClose()
  }

  handleConfirmToPublish = () => {
    this.props.updatePublished({ id: this.props.data.id, published: true })
    this.props.handleClose()
  }

  handleSave = () => {
    this.props.onSave()
    this.props.handleClose()
  }

  getAlertText = (data, type) => {
    let text = ''
    switch (type) {
      case locationType.CITY_TYPE:
        text = this.props.t('cms.edit.review_modal.unpublish_alert_message.city', {
          numberProperty: data.properties,
          numberArea: data.areas && data.areas.totalCount,
          numberUniversity: data.universities && data.universities.totalCount,
        })
        break
      case locationType.AREA_TYPE:
        text = this.props.t('cms.location.area.upublish.modal.text', {
          city_name: data.city && data.city.name,
        })
        break
      case locationType.UNIVERSITY_TYPE:
        text = this.props.t('cms.edit.review_modal.unpublish_alert_message.university', {
          city: data.city && data.city.name,
        })
        break
      default:
        text = ''
    }

    return text
  }

  render() {
    const { handleClose, data, form, t, type } = this.props
    const { getFieldDecorator } = form

    if (!data) {
      return false
    }

    return (
      <div className={classNames('location-review')}>
        <div className="location-review__header">
          <h3 className="location-review__header-title">
            {t('cms.edit.review_modal.review_your_edition')}
          </h3>
          <Icon
            type="close"
            className="property-review__header__close"
            onClick={() => {
              handleClose()
            }}
          />
        </div>

        <div className="location-review__content-container">
          <div className="location-review__block location-review__block--details">
            <label className="location-review__block-title">{t('cms.edit.tab.details')}</label>
            <Choose>
              <When condition={!this.props.isHomeList}>
                <button
                  type="button"
                  className="location-review__edit-btn"
                  onClick={() => {
                    this.handleEdit(locationTabType.DETAILS)
                  }}
                >
                  {t('cms.edit.review_modal.btn.edit')}
                </button>
              </When>
              <Otherwise>
                <Link
                  className="location-review__edit-btn"
                  to={`${generatePath(`${this.props.type.toLowerCase()}.edit`, {
                    slug: this.props.data.slug,
                  })}#${locationTabType.DETAILS}`}
                  onClick={() => {
                    this.handleEdit(locationTabType.DETAILS)
                  }}
                >
                  {t('cms.edit.review_modal.btn.edit')}
                </Link>
              </Otherwise>
            </Choose>
            <div className="location-review__content">
              <Row>
                <Col span={type !== locationType.AREA_TYPE ? 12 : 24}>
                  <table className="location-review__details-table location-review__details-table--details">
                    <tbody>
                      {this.generateDescription('name', data.name, 'details')}
                      {this.generateDescription('slug', data.slug, 'details')}
                      <If condition={type === locationType.UNIVERSITY_TYPE}>
                        {this.generateDescription('common_names', data.commonNames, 'details')}
                      </If>
                      <If condition={type === locationType.CITY_TYPE}>
                        {this.generateDescription(
                          'country',
                          data.country ? data.country.name : '',
                          'details',
                        )}
                      </If>
                      <If condition={type !== locationType.CITY_TYPE}>
                        {this.generateDescription(
                          'city',
                          data.city ? data.city.name : '',
                          'details',
                        )}
                      </If>
                      {this.generateDescription('rank', data.rank, 'details')}
                      <If condition={type === locationType.UNIVERSITY_TYPE}>
                        {this.generateDescription('street_address', data.address, 'details')}
                        {this.generateDescription('zip_code', data.zipCode, 'details')}
                      </If>
                    </tbody>
                  </table>
                </Col>
                <If condition={type !== locationType.AREA_TYPE}>
                  <Col span={12}>
                    <div className="location-review__details-map">
                      {getFieldDecorator('reviewCoordinates', {
                        initialValue: {
                          value: {
                            lat: data.latitude,
                            lng: data.longitude,
                          },
                          action: 'default',
                        },
                      })(
                        <MyMap
                          lastSearched={{
                            lat: data.latitude,
                            lng: data.longitude,
                          }}
                          hiddenLabel
                          disabled
                          form={form}
                          zoom={type === locationType.UNIVERSITY_TYPE ? 14 : 8}
                          t={t}
                        />,
                      )}
                    </div>
                  </Col>
                </If>
              </Row>
            </div>
          </div>
          <div className="location-review__block location-review__block--content">
            <label className="location-review__block-title">{t('cms.edit.tab.content')}</label>
            <Choose>
              <When condition={!this.props.isHomeList}>
                <button
                  type="button"
                  className="location-review__edit-btn"
                  onClick={() => {
                    this.handleEdit(locationTabType.CONTENT)
                  }}
                >
                  {t('cms.edit.review_modal.btn.edit')}
                </button>
              </When>
              <Otherwise>
                <Link
                  className="location-review__edit-btn"
                  to={`${generatePath(`${this.props.type.toLowerCase()}.edit`, {
                    slug: this.props.data.slug,
                  })}#${locationTabType.CONTENT}`}
                  onClick={() => {
                    this.handleEdit(locationTabType.CONTENT)
                  }}
                >
                  {t('cms.edit.review_modal.btn.edit')}
                </Link>
              </Otherwise>
            </Choose>

            <div className="location-review__content">
              <Row>
                <Col span={24}>
                  <table className="location-review__details-table">
                    <tbody>
                      {this.generateDescription('headline', data.headline, 'content')}
                      {this.generateDescription('summary', data.summary, 'content')}
                      {this.generateDescription(
                        'hero_image',
                        data.country ? data.country.name : '',
                        'content',
                      )}
                    </tbody>
                  </table>
                </Col>
              </Row>
            </div>
          </div>
          <div className="location-review__block location-review__block--seo">
            <label className="location-review__block-title">{t('cms.edit.tab.seo')}</label>
            <Choose>
              <When condition={!this.props.isHomeList}>
                <button
                  type="button"
                  className="location-review__edit-btn"
                  onClick={() => {
                    this.handleEdit(locationTabType.SEO)
                  }}
                >
                  {t('cms.edit.review_modal.btn.edit')}
                </button>
              </When>
              <Otherwise>
                <Link
                  className="location-review__edit-btn"
                  to={`${generatePath(`${this.props.type.toLowerCase()}.edit`, {
                    slug: this.props.data.slug,
                  })}#${locationTabType.SEO}`}
                  onClick={() => {
                    this.handleEdit(locationTabType.SEO)
                  }}
                >
                  {t('cms.edit.review_modal.btn.edit')}
                </Link>
              </Otherwise>
            </Choose>
            <div className="location-review__content">
              <Row>
                <Col span={24}>
                  <table className="location-review__details-table">
                    <tbody>
                      {this.generateDescription(
                        'srp_intro_headline',
                        data.srpIntroHeadlineEnabled && data.seoTemplate
                          ? handleSEOTemplate(data.name, data.seoTemplate.srpIntroHeadline, type)
                          : data.srpIntroHeadline,
                        'seo',
                      )}
                      {this.generateDescription(
                        'srp_intro_paragraph',
                        data.srpIntroParagraphEnabled && data.seoTemplate
                          ? handleSEOTemplate(data.name, data.seoTemplate.srpIntroParagraph, type)
                          : data.srpIntroParagraph,
                        'seo',
                      )}
                      {this.generateDescription(
                        'meta_title',
                        data.metaTitleEnabled && data.seoTemplate
                          ? handleSEOTemplate(data.name, data.seoTemplate.metaTitle, type)
                          : data.metaTitle,
                        'seo',
                      )}
                      {this.generateDescription(
                        'meta_description',
                        data.metaDescriptionEnabled && data.seoTemplate
                          ? handleSEOTemplate(data.name, data.seoTemplate.metaDescription, type)
                          : data.metaDescription,
                        'seo',
                      )}
                      {this.generateDescription(
                        'meta_keywords',
                        data.metaKeywordsEnabled && data.seoTemplate
                          ? handleSEOTemplate(data.name, data.seoTemplate.metaKeywords, type)
                          : data.metaKeywords,
                        'seo',
                      )}
                    </tbody>
                  </table>
                </Col>
              </Row>
            </div>
          </div>
        </div>

        <div
          className="location-review__btn-container"
          ref={node => {
            this.btnContainer = node
          }}
        >
          <If
            condition={showElementByAuth(this.entityMapping[this.props.type], entityAction.UPDATE)}
          >
            <If condition={!data.published && !this.props.isHomeList}>
              <button type="button" className="location-review__btn" onClick={this.handleSave}>
                {t('cms.location.review.btn.save_for_later')}
              </button>
              <button
                type="button"
                className="location-review__btn location-review__btn--fill"
                onClick={this.handlePublish}
              >
                {t('cms.location.review.btn.publish')}
              </button>
            </If>
            <If condition={data.published && !this.props.isHomeList}>
              <Popconfirm
                getPopupContainer={() => this.btnContainer}
                overlayClassName="ant-popover-unpulish location-review__unpublish-popup"
                overlayStyle={{ maxWidth: 260 }}
                placement="top"
                title={this.getAlertText(data, type)}
                onConfirm={this.handleUnpublish}
                okText={t('cms.properties.edit.btn.yes')}
                okType="danger"
                cancelText={t('cms.properties.edit.btn.no')}
                arrowPointAtCenter
              >
                <button type="button" className="location-review__btn">
                  {t('cms.location.review.btn.unpublish')}
                </button>
              </Popconfirm>
              <button
                type="button"
                className="location-review__btn location-review__btn--fill"
                onClick={this.handleSave}
              >
                {t('cms.location.review.btn.save_to_publish')}
              </button>
            </If>
            <If condition={this.props.isHomeList}>
              <button
                type="button"
                onClick={this.handleConfirmToPublish}
                className="location-review__btn location-review__btn--fill"
              >
                {t('cms.location.review.btn.confirm_to_publish')}
              </button>
            </If>
          </If>
        </div>
      </div>
    )
  }
}

LocationReviewModal.propTypes = {
  handleClose: PropTypes.func,
  updatePublished: PropTypes.func,
  data: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    slug: PropTypes.string,
    country: PropTypes.shape({
      name: PropTypes.string,
    }),
    rank: PropTypes.number,
    headline: PropTypes.string,
    summary: PropTypes.string,
    heroImage: PropTypes.shape({
      filename: PropTypes.string,
    }),
    smallHeroImage: PropTypes.shape({
      filename: PropTypes.string,
    }),
  }),
  form: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  isHomeList: PropTypes.bool,
  onSave: PropTypes.func,
}

LocationReviewModal.defaultProps = {
  updatePublished: () => {},
  data: {
    id: '',
    name: '',
    slug: '',
    country: {
      name: '',
    },
    rank: 0,
    headline: '',
    summary: '',
    heroImage: {
      filename: '',
    },
    smallHeroImage: {
      filename: '',
    },
  },
  isHomeList: false,
  onSave: () => {},
  handleClose: () => {},
}

export default Form.create({ name: 'review_modal_form' })(LocationReviewModal)
