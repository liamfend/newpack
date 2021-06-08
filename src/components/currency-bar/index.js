import React from 'react';
import PropTypes from 'prop-types';
import { getBillingCycleText } from '~helpers/property-field-option';
import { billingCycleOptions } from '~constants/property-field-options';
import { getSymbolFromCurrency } from '~base/global/helpers/currency';

export default class CurrencyBar extends React.Component {
  render() {
    const { t, countryData } = this.props;

    return (
      <div className="basic-info__currency">
        <span className={ 'create-confirmation__headline basic-info__headline' }>
          {t('cms.properties.edit.detail.currency')}:
        </span>
        <span className={ 'create-confirmation__text' }>
          {countryData ? `${countryData.currency} - ${getSymbolFromCurrency(countryData.currency)}` : '-'}
        </span>
        <span className="create-confirmation__line" />
        <span className={ 'create-confirmation__headline--second basic-info__text' }>
          {t('cms.properties.create.create_confirmation.icon_bill')}:
        </span>
        <span className={ 'create-confirmation__text--bill' }>
          { countryData ? getBillingCycleText(countryData.billingCycle, billingCycleOptions) : '-'}
        </span>
      </div>
    );
  }
}

CurrencyBar.propTypes = {
  t: PropTypes.func.isRequired,
  countryData: PropTypes.object,
};

CurrencyBar.defaultProps = {
  countryData: null,
};

