import moment from 'moment';
import i18n from '~settings/i18n';

const formatData = data => moment(data).format('DD/MM/YYYY');

export default function formatListingShow(listing) {
  const { moveIn, moveOut } = listing;

  const str = (
    (moveIn ? i18n.t('cms.special_offer.map.listing.move_in', { date: formatData(moveIn) }) : '') +
    (moveOut ? i18n.t('cms.special_offer.map.listing.move_out', { date: formatData(moveOut) }) : '')
  );

  return str.slice(0, str.length - 1);
}
