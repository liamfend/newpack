import React from 'react';
import PropTypes from 'prop-types';
import { getItem } from '~base/global/helpers/storage';
import BreadCrumbs from '~components/bread-crumbs';

export default class Header extends React.Component {
  getFilters = () => {
    const filters = getItem('cms_properties_list_filters');
    const result = {};
    if (filters) {
      Object.keys(filters).map((key) => {
        if (filters[key]) {
          result[key] = filters[key];
        }
        return true;
      });

      if (filters.pageNumber && filters.pageNumber === 1) {
        delete result.pageNumber;
      }
      if (filters.pageSize && filters.pageSize === 10) {
        delete result.pageSize;
      }
    }

    return result;
  }

  render() {
    const { t, propertySlug, type } = this.props;

    return (
      <div className="listing-management-header">
        <BreadCrumbs
          t={ t }
          type={ type }
          propertySlug={ propertySlug }
          getFilters={ this.getFilters }
        />
      </div>
    );
  }
}

Header.propTypes = {
  t: PropTypes.func.isRequired,
  propertySlug: PropTypes.string,
  type: PropTypes.string,
};

Header.defaultProps = {
  t: () => {},
  propertySlug: '',
  type: '',
};
