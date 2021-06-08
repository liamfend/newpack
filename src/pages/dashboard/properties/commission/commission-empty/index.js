import React from 'react';
import PropTypes from 'prop-types';
import Svg from '~components/svg';

const CommissionEmpty = props => (
  <div className="commission-empty">
    <div className="commission-empty__container">
      <Svg className="commission-empty__icon" hash="no-commission" />
      <h3 className="commission-empty__title">
        { props.t('cms.commission.commission_empty.title') }
      </h3>
      <p className="commission-empty__summary">
        { props.t('cms.commission.commission_empty.summary') }
      </p>
    </div>
  </div>
);

export default CommissionEmpty;

CommissionEmpty.propTypes = {
  t: PropTypes.func.isRequired,
};


CommissionEmpty.defaultProps = {
  t: () => {},
};
