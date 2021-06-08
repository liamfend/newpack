import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { get, toLower } from 'lodash';
import { Skeleton, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import getEnvironment, { environments } from '~base/global/helpers/environment';
import generatePath from '~settings/routing';
import Svg from '~components/svg';
import { propertyStatus } from '~constants/landlord';
import { propertyState } from '~constants';

const imageHost = getEnvironment() === environments.PROD ? '//image.student.com' : '//image.dandythrust.com';

const PropertyCard = ({ property, loading }) => {
  const { t } = useTranslation();

  const reviewRating = useMemo(() => {
    const { averageRating: rating } = property;
    let averageRating = Math.floor(rating * 10) / 10;

    if (typeof averageRating === 'number' && averageRating % 1 === 0) {
      averageRating = averageRating.toFixed(1);
    }

    return averageRating;
  }, [property]);

  return (
    <div className="property-card">
      <Link
        to={
          get(property, 'slug') ?
            generatePath('property.homepage', { propertySlug: get(property, 'slug') }) : ''
        }
      >
        <If condition={ get(property, 'state') === propertyState.SOLD_OUT }>
          <Svg className="property-card__sold-out" hash="sold-out" />
        </If>
        <Skeleton
          active
          avatar={ {
            size: 122,
            shape: 'square',
          } }
          loading={ loading }
        >
          <div className="property-card__container">
            <div className="property-card__image-container">
              <Svg hash="default-image" className="property-card__image-default" />
              <If condition={ get(property, 'heroImage.source') }>
                <img
                  className="property-card__image"
                  src={ `${imageHost}/250x250/${get(property, 'heroImage.source')}` }
                  alt={ get(property, 'slug') }
                />
              </If>
            </div>
            <div className="property-card__content-container">
              <p className="property-card__name-container">
                <Tooltip
                  arrowPointAtCenter
                  placement="topLeft"
                  title={ get(property, 'landlordName') }
                  overlayClassName="property-card__country-tips"
                >
                  <span className="property-card__country">
                    <Svg className="property-card__country-icon" hash="property-country" />
                  </span>
                </Tooltip>
                <span className="property-card__name">{ get(property, 'name') }</span>
                <If condition={ get(property, 'averageRating') > 0 }>
                  <span className="property-card__average-rating">
                    { reviewRating }
                  </span>
                </If>
              </p>

              <p className="property-card__address-info-container">
                <Svg className="property-card__icon property-card__address-icon" hash="address" />
                <span className="property-card__address-info">
                  {`${get(property, 'cityName')}, ${get(property, 'countryName')}`}
                </span>
              </p>
              <p className="property-card__update-info-container">
                <Svg className="property-card__icon property-card__update-icon" hash="time" />
                <span className="property-card__update-info">
                  { t('cms.property_card.label.last_update_by', {
                    name: get(property, 'updatedBy') || 'system',
                    updatedAt: moment(get(property, 'updatedAt')).format('DD/MM/YYYY HH:mm'),
                  })
                  }
                </span>
              </p>
            </div>

            <div className={ classNames('property-card__status-label', {
              'property-card__status-label--grey': get(property, 'status') === propertyStatus.UNPUBLISHED,
            }) }
            >{ t(`cms.property_card.status.tag.${toLower(get(property, 'status'))}`) }</div>
          </div>
        </Skeleton>
      </Link>
    </div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.shape({
    name: PropTypes.string,
    slug: PropTypes.string,
    countryName: PropTypes.string,
    averageRating: PropTypes.number,
    cityName: PropTypes.string,
    landlordName: PropTypes.string,
    status: PropTypes.string,
    updatedAt: PropTypes.string,
    updatedBy: PropTypes.string,
    heroImage: PropTypes.object,
    state: PropTypes.string,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
};

PropertyCard.defaultProps = {
  property: {},
  loading: false,
};

export default PropertyCard;
