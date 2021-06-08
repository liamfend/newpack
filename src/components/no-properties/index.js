import React from 'react';
import PropTypes from 'prop-types';
import Svg from '~components/svg';

const NoProperties = props => (
  <div className="no-properties">
    <div className="no-properties__container">
      <h3 className="no-properties__title">{ props.t('cms.no_properties.title.dont_have_properties') }</h3>
      <h3 className="no-properties__sub-title">{ props.t('cms.no_properties.title.create_one') }</h3>
      <div className="no-properties__summary-container">
        <p className="no-properties__summary no-properties__summary--property">
          <Svg className="no-properties__icon no-properties__icon--property" hash="property-icon" />
          <span className="no-properties__summary-content">{ props.t('cms.no_properties.summary.content.about_your_property') }</span>
        </p>
        <p className="no-properties__summary no-properties__summary--listing-and-price">
          <Svg className="no-properties__icon no-properties__icon--tag" hash="tag-icon" />
          <span className="no-properties__summary-content">{ props.t('cms.no_properties.summary.content.listings_and_prices') }</span>

        </p>
        <p className="no-properties__summary no-properties__summary--upload">
          <Svg className="no-properties__icon no-properties__icon--image" hash="image-icon" />
          <span className="no-properties__summary-content">{ props.t('cms.no_properties.summary.content.upload_photo_and_videos') }</span>
        </p>
      </div>
      <div className="no-properties__add-property-btn-container">
        <a className="no-properties__add-property-btn">
          { props.t('cms.no_properties.btn.content.add_a_property') }
        </a>
      </div>
      <p className="no-properties__tip">
        { props.t('cms.no_properties.tip.content.start_now_and_continue_later') }
      </p>
    </div>

  </div>
);

NoProperties.propTypes = {
  t: PropTypes.func.isRequired,
};

NoProperties.defaultProps = {
  t: () => { },
};

export default NoProperties;
