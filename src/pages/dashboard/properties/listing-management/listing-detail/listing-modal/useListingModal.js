import { useEffect } from 'react';
import moment from 'moment';

const useListingModal = ({ form, listing }) => {
  const openEndDate = '9999-12-31T00:00:00+00:00';

  const isOpenEndLiveUntil = () => {
    if (listing && listing.liveUntil === openEndDate) {
      form.setFieldsValue({ openEnd: true });
    }
  };

  useEffect(() => {
    isOpenEndLiveUntil();
  }, []);

  const disabledStartDate = (startValue, endValue) => {
    if (!startValue || !endValue) {
      return false;
    }

    return startValue.valueOf() > endValue.valueOf();
  };

  const disabledEndDate = (startValue, endValue) => {
    if (!startValue || !endValue) {
      return false;
    }

    return endValue.valueOf() <= startValue.valueOf();
  };

  const handlePlaceHolderChange = (value) => {
    if (value) {
      form.resetFields([
        'moveIn',
        'moveInType',
        'moveOut',
        'moveOutType',
        'tenancyLengthType',
        'tenancyLengthValueMin',
        'tenancyLengthValueMax',
      ]);
    }
  };

  const liveUntilChange = (dateString) => {
    if (dateString.format('DD/MM/YYYY') === moment(openEndDate).format('DD/MM/YYYY')) {
      form.setFieldsValue({ openEnd: true });
    }
  };

  if (form.getFieldValue('openEnd')) {
    form.resetFields(['liveUntil']);
  }

  return {
    disabledStartDate,
    disabledEndDate,
    handlePlaceHolderChange,
    liveUntilChange,
  };
};

export default useListingModal;
