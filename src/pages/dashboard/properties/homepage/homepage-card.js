import React from 'react';
import PropTypes from 'prop-types';
import Svg from '~components/svg';

export default class HomepageCard extends React.Component {
  constructor() {
    super();
    this.comingSoonType = [];
  }

  render() {
    const { t, type } = this.props;
    return (
      <div
        className={
          `property-homepage__card 
          property-homepage__${type.replace(/_/g, '-')} 
          ${this.comingSoonType.indexOf(type) !== -1 ? 'property-homepage__card-coming-soon' : ''}`
        }
      >
        <Svg className="property-homepage__card-icon" hash={ type.replace(/_/g, '-') } />
        <Svg className="property-homepage__card-icon--gray" hash={ `${type.replace(/_/g, '-')}-gray` } />
        <div className="property-homepage__card-text">
          <h3 className="property-homepage__card-title">
            { t(`cms.properties.homepage.part.${type}.title`) }
          </h3>
          <span className="property-homepage__coming-soon">
            { t('cms.properties.homepage.part.not_ready.description') }
          </span>
          <span className="property-homepage__card-description">
            { t(`cms.properties.homepage.part.${type}.description`) }
          </span>
        </div>
      </div>
    );
  }
}

HomepageCard.propTypes = {
  t: PropTypes.func.isRequired,
  type: PropTypes.string,
};

HomepageCard.defaultProps = {
  t: () => {},
  type: '',
};
