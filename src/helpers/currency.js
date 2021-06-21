import accounting from 'accounting';
import i18next from 'i18next';
import { getSymbolFromCurrency } from '~base/global/helpers/currency';

const formatPrice = (price, currencyCode) => {
  if (price === null) {
    return null;
  }

  return accounting.formatMoney(
    price,
    {
      symbol: getSymbolFromCurrency(currencyCode),
      thousand: i18next.t('cms.currency.thousand_symbol'),
      format: i18next.t('cms.currency.symbol_value_order'),
    },
  );
};

export default formatPrice;
