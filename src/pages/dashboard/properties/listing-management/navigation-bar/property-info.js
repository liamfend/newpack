import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import { authUrl } from '~settings/endpoints';

export default class PropertyInfo extends React.PureComponent {
  handleClickOpenWebsite = () => {
    const { slug, city } = this.props.property;
    const citySlug = city && city.slug;
    const countrySlug = city && city.country && city.country.slug;

    const websitePathname = `/${countrySlug}/${citySlug}/p/${slug}`;

    window.open(authUrl(websitePathname), '_blank');
  }

  render() {
    const { t } = this.props;
    const { name, id, status } = this.props.property;

    return (
      <div className="property-info">
        <div className="property-info__name-wrap">
          <Choose>
            <When condition={ status === 'PUBLISHED' }>
              <Tooltip
                placement="top"
                title={ t('cms.property.listing_management.view_on_student.tooltip') }
              >
                <span
                  className="property-info__name property-info__name--link"
                  role="presentation"
                  onClick={ this.handleClickOpenWebsite }
                >
                  { name }
                </span>
              </Tooltip>
            </When>
            <Otherwise>
              <Tooltip
                placement="top"
                title={ t('cms.property.listing_management.property_unpublished.tooltip') }
              >
                <span className="property-info__name">
                  { name }
                </span>
              </Tooltip>
            </Otherwise>
          </Choose>
        </div>
        <span className="property-info__id">
          { t('cms.property.property_id.label') }{ JSON.parse(atob(id)).id }
        </span>
        <span className="property-info__line" />
        <span className="property-info__status">
          { t(`cms.property.property_status.${status.toLowerCase()}`) }
        </span>
      </div>
    );
  }
}

PropertyInfo.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object,
};

PropertyInfo.defaultProps = {
  t: () => {},
  property: {},
};
