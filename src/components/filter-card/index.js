import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import moment from 'moment';

const handleCardContent = (filter, t) => {
  if (filter.filterType === 'log_date') {
    return `${filter.operator1[0] ?
      moment(filter.operator1[0]).format('DD MMM YYYY') :
      t('cms.properties.change_log.filter_card.open_start')} - ${
      filter.operator1[1] ?
        moment(filter.operator1[1]).format('DD MMM YYYY') :
        t('cms.properties.change_log.filter_card.open_end')}`;
  }

  if (filter.filterType === 'change_by') {
    return filter.operator2.email;
  }

  if (filter.filterType === 'log_section') {
    return t(`cms.properties.change_log.filter_modal.log_section_value.${filter.operator2}`);
  }

  return filter.operator2;
};

const FilterCard = props => (
  <div className="filter-card">
    <button className="filter-card__filter-btn" onClick={ props.onClose }>
      <Icon type="close" style={ { fontSize: '12px' } } />
    </button>
    <p className="filter-card__filter-name">
      <If condition={ props.filter.filterType === 'log_date' }>
        <Icon type="calendar" className="filter-card__icon" />
      </If>
      <If condition={ props.filter.filterType === 'change_by' }>
        <Icon type="user" className="filter-card__icon" />
      </If>
      { props.t(`cms.properties.change_log.filter_type.${props.filter.filterType}`) }
    </p>
    <p className="filter-card__filter-content">
      { handleCardContent(props.filter, props.t) }
    </p>
  </div>
);

FilterCard.propTypes = {
  t: PropTypes.func.isRequired,
  filter: PropTypes.shape({
    filterType: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
};

FilterCard.defaultProps = {
  onClose: () => { },
  t: () => { },
};

export default FilterCard;
