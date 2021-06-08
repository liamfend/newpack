import React from 'react';
import PropTypes from 'prop-types';
import Svg from '~components/svg';

export default class BillingCard extends React.Component {
  render() {
    const { t, type } = this.props;
    return (
      <div className={ `billing__card billing__${type}` }>
        <Svg className="billing__card-icon" hash={ `${type}-hover` } />
        <Svg className="billing__card-icon--gray" hash={ type } />
        <div className="billing__card-text">
          <h3 className="billing__card-title">
            { t(`cms.billing.${type}.title`) }
          </h3>
          <span className="billing__card-description">
            { t(`cms.billing.${type}.desc`) }
          </span>
        </div>
      </div>
    );
  }
}

BillingCard.propTypes = {
  t: PropTypes.func.isRequired,
  type: PropTypes.string,
};

BillingCard.defaultProps = {
  t: () => {},
  type: '',
};
