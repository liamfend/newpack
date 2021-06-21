import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { connect } from 'react-redux';
import { get } from 'lodash';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import { List, message } from 'antd';
import * as actions from '~actions/properties/property-list';
import { communicationStatus } from '~constants';
import NoProperties from '~components/no-properties';
import PropertyStatusFilter from '~components/property-status-filter';
import PropertyCard from '~components/property-card';
import { mergeSearchParams } from '~helpers/history';
import { getItem, setItem } from '~base/global/helpers/storage';
import generatePath from '~settings/routing';

const mapStateToProps = state => ({
  list: state.dashboard.propertyList.get('list').toJS(),
  communication: state.dashboard.propertyList.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize());
  },

  getProperties: (filters) => {
    dispatch(actions.getPropertyList(filters));
  },
});

const defaultSearchParams = {
  pageNumber: 1,
  pageSize: 10,
};

const formatFilters = filters => ({
  countrySlug: filters.countrySlug || null,
  tag: filters.tag || null,
  pageNumber: Number(filters.pageNumber) || defaultSearchParams.pageNumber,
  pageSize: Number(filters.pageSize) || defaultSearchParams.pageSize,
  statuses: filters.statuses || null,
  citySlug: filters.citySlug || null,
  landlordSlug: filters.landlordSlug || null,
  search: filters.search || null,
  sort: filters.sort || null,
});

const PropertyList = ({ initialize, getProperties, communication, list }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [filters, setFilters] = useState(formatFilters(queryString.parse(location.search)));
  const [isLarge, setIsLarge] = useState(false);

  const largeStyle = () => {
    const propertyList = document.querySelector('.property-list');
    const propertyListWidth = propertyList ? propertyList.clientWidth : 0;

    if ((propertyListWidth + 32) >= 1400) {
      setIsLarge(true);
    }

    if ((propertyListWidth + 32) < 1400) {
      setIsLarge(false);
    }
  };

  useEffect(() => {
    initialize();

    window.addEventListener('resize', largeStyle);
    document.addEventListener('toggleCollapseSidebarTriggers', largeStyle);

    largeStyle();

    return () => {
      window.removeEventListener('resize', largeStyle);
      document.removeEventListener('toggleCollapseSidebarTriggers', largeStyle);
    };
  }, []);

  useEffect(() => {
    if (![communicationStatus.IDLE, communicationStatus.FETCHING].includes(get(communication, 'status'))) {
      message.error(t('cms.message.error'));
    }
  }, [communication]);

  const currentRole = get(getItem('PMS_CURRENT_USER_AUTH'), 'payload.currentRoleSlug');

  const getPropertiesByFilters = () => {
    const formattedFilters = formatFilters({ ...defaultSearchParams, ...filters });
    setItem('cms_properties_list_filters', formattedFilters);
    getProperties(formattedFilters);
    window.scroll(0, 0);
  };

  useEffect(() => {
    history.push(mergeSearchParams(filters, defaultSearchParams));
    getPropertiesByFilters();
  }, [filters, currentRole]);

  const handlePageChange = (page, pageSize) => {
    const newFilters = { ...filters, pageNumber: page };

    if (pageSize !== newFilters.pageSize) {
      newFilters.pageSize = pageSize;
      newFilters.pageNumber = defaultSearchParams.pageNumber;
    }

    setFilters(newFilters);
  };

  const handlePropertyStatusChange = (propertyStatusFilters) => {
    const newFilters = Object.assign({}, filters, propertyStatusFilters, { pageNumber: 1 });

    setFilters(newFilters);
  };

  const isShowNoProperties = () => {
    const { tag, citySlug, landlordSlug, countrySlug, statuses, search } = filters;
    if (!countrySlug && !statuses && !tag && !citySlug && !landlordSlug && !search
      && list.total === 0
      && get(communication, 'status') === communicationStatus.IDLE) {
      return true;
    }
    return false;
  };

  const onAddNewBtn = () => {
    const url = generatePath('property.create');
    history.push(url);
  };

  return (
    <div className="property-list">
      <Choose>
        <When condition={ isShowNoProperties() }>
          <NoProperties t={ t } />
        </When>
        <Otherwise>
          <div className="property-list__header">
            <div className="property-list__header-container">
              <PropertyStatusFilter
                t={ t }
                onChange={ handlePropertyStatusChange }
                total={ list.total }
                filters={ filters }
                search={ location.search }
                addBtn={ onAddNewBtn }
              />
            </div>
          </div>
          <div className={ classNames('property-list__list', {
            'property-list__list-nomal': isLarge,
          }) }
          >
            <List
              size="large"
              dataSource={ get(communication, 'status') === communicationStatus.FETCHING ? Array(10).fill({}) : list.payload }
              pagination={ {
                showSizeChanger: true,
                onChange: handlePageChange,
                onShowSizeChange: handlePageChange,
                defaultCurrent: defaultSearchParams.pageNumber,
                total: list.total,
                current: filters.pageNumber,
                pageSize: filters.pageSize,
              } }
              renderItem={ item => (
                <List.Item
                  key={ item.title }
                >
                  <PropertyCard
                    property={ item }
                    loading={ get(communication, 'status') === communicationStatus.FETCHING }
                  />
                </List.Item>
              ) }
            />
          </div>
        </Otherwise>
      </Choose>
    </div>
  );
};

PropertyList.propTypes = {
  list: PropTypes.shape({
    payload: PropTypes.array.isRequired,
    total: PropTypes.number.isRequired,
  }),
  communication: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }),
  initialize: PropTypes.func.isRequired,
  getProperties: PropTypes.func.isRequired,
};

PropertyList.defaultProps = {
  list: {
    payload: [],
    total: 0,
  },
  communication: {
    status: '',
  },
  initialize: () => {},
  getProperties: () => {},
};

export default connect(mapStateToProps, mapDispatchToProps)(PropertyList);
