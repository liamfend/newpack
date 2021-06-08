import { propertyListingForm } from '~constants';
import moment from 'moment';

export const formatRoomListData = (data) => {
  const formatted = Object.assign({}, data);

  if (data.priceType === propertyListingForm.priceType.exact) {
    formatted.priceMax = formatted.priceMin;
  }

  if (formatted.priceMin === '') { formatted.priceMin = null; }
  if (formatted.priceMax === '') { formatted.priceMax = null; }

  // format date
  ['moveIn', 'moveOut', 'availableFrom', 'availableTo'].map((item) => {
    if (data[item]) {
      formatted[item] = moment(data[item]).format('DD/MM/YYYY');
    }

    return true;
  });

  ['liveOn', 'liveUntil'].map((item) => {
    formatted[item] = moment(data[item]).format('DD/MM/YYYY 00:00:00');
    return true;
  });

  // format discountType
  if (data.discountType === propertyListingForm.discountType.no) {
    delete formatted.discountType;
    delete formatted.discountValue;
  }

  // format number
  if (data.minDuration) {
    formatted.minDuration = Number(data.minDuration);
  }

  return formatted;
};

export const secondFunction = () => {

};
