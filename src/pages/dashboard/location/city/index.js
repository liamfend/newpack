import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import { Icon, message } from 'antd';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import generatePath from '~settings/routing';
import * as actions from '~actions/location/city';
import { communicationStatus, locationType, platformEntity, entityAction } from '~constants';
import AddNewCity from '~pages/dashboard/location/city/add-new-city';
import TableColumnSearch from '~components/table-column-search';
import update from 'immutability-helper';
import { mergeSearchParams } from '~helpers/history';
import LocationReviewModal from '~components/location-review-modal';
import UnpubilshedModal from '~components/unpubilshed-modal';
import TableList from '~pages/dashboard/location/table-list';
import { setItem } from '~base/global/helpers/storage';
import showElementByAuth from '~helpers/auth';

import authControl from '~components/auth-control';

const mapStateToProps = state => ({
  list: state.dashboard.city.get('list').toJS(),
  city: state.dashboard.city.get('city').toJS(),
  communication: state.dashboard.city.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize());
  },

  getCityList: (filters) => {
    dispatch(actions.getCityList(filters));
  },

  getCityDetail: (slug) => {
    dispatch(actions.getCityDetail({ slug }));
  },

  updateCity: (data) => {
    dispatch(actions.updateCity(data));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.LOCATIONS_CITIES, entityAction.READ)
export default class City extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSearchParams = {
      pageNumber: 1,
      pageSize: 10,
    };

    this.state = {
      filters: this.formatFilters(
        this.getLocationSearch(this.props.location.search),
      ),
      visibility: {
        countryFilter: false,
        cityFilter: false,
      },
      updateCityPublished: false,
      showReviewModal: false,
      showUnpubilshedModal: false,
      city: null,
    };

    this.columnInputs = {
      countryFilter: [],
      cityFilter: [],
    };
  }

  componentDidMount() {
    this.props.initialize();
    const searchDate = queryString.parse(this.props.location.search);
    if (searchDate && searchDate.sortBy) {
      searchDate.sortBy = '';
      searchDate.sortDirection = '';
    }
    this.pushState(searchDate);
    const search = this.getLocationSearch(this.props.location.search);
    const filters = this.formatFilters(search);
    this.setFilters(filters);
    this.props.getCityList(this.state.filters || {});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const search = this.getLocationSearch(nextProps.location.search);
      const filters = this.formatFilters(search);

      this.closeDropDownVisible();
      this.props.getCityList(filters || {});
      this.setFilters(filters);
    }

    if (nextProps.communication.update.status === communicationStatus.ERROR) {
      message.error(this.props.t('cms.message.error'));
    }

    if (
      nextProps.communication.update.status === communicationStatus.IDLE
      && this.props.communication.update.status === communicationStatus.FETCHING
    ) {
      message.success(
        this.props.t(
          'cms.location.table.update.published',
          { tableType: 'City', published: this.state.updateCityPublished ? 'published' : 'unpublished' },
        ),
      );

      const search = this.getLocationSearch(this.props.location.search);
      const filters = this.formatFilters(search);
      this.props.getCityList(filters || {});
    }

    if (
      this.state.city
      && nextProps.communication.city.status === communicationStatus.IDLE
      && this.props.communication.city.status === communicationStatus.FETCHING
    ) {
      this.setState({
        showUnpubilshedModal: true,
        city: this.props.city.payload,
      });
    }
  }

  closeDropDownVisible = () => {
    this.setState({
      visibility: {
        countryFilter: false,
        cityFilter: false,
      },
    });
  }

  setFilters = (value) => {
    this.setState({
      filters: update(this.state.filters, { $set: value }),
    }, () => {
      setItem('cms_location_cities_list_filters', this.state.filters);
    });
  }

  getLocationSearch = (locationSearch) => {
    const search = queryString.parse(locationSearch);

    if (search && typeof search.slugs === 'string') {
      search.slugs = [search.slugs];
    }

    if (search && typeof search.countrySlugs === 'string') {
      search.countrySlugs = [search.countrySlugs];
    }

    return search;
  };

  formatFilters = filters => ({
    pageNumber: Number(filters.pageNumber) || this.defaultSearchParams.pageNumber,
    pageSize: Number(filters.pageSize) || this.defaultSearchParams.pageSize,
    slugs: filters.slugs || [],
    countrySlugs: filters.countrySlugs || [],
    sortBy: filters.sortBy || null,
    sortDirection: filters.sortDirection || null,
  });

  handleTableChange = (pagination) => {
    const params = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.current,
      sortBy: this.state.filters.sortBy,
      sortDirection: this.state.filters.sortDirection,
      slugs: this.state.filters.slugs,
      countrySlugs: this.state.filters.countrySlugs,
    };

    if (pagination.pageSize !== this.state.filters.pageSize) {
      params.pageNumber = 1;
    }

    this.pushState(params);
  };

  handleFilterDropDownVisibleChange = (name, filterItem) => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (this.state.visibility[name]
      && this.columnInputs[name]
      && this.columnInputs[name].getValue().length === 0
    ) {
      this.timeout = setTimeout(() => {
        if (this.columnInputs[name]
          && this.columnInputs[name].getValue().length === 0
        ) {
          this.handleColumnFilter(filterItem, null);
        }
      }, 100);
    }
    this.setState({
      visibility: update(this.state.visibility, { [name]: { $set: !this.state.visibility[name] } }),
    });
  };

  pushState = (data) => {
    this.props.history.push(mergeSearchParams(data, this.defaultSearchParams));
  };

  handleColumnFilter = (type, value) => {
    this.pushState({
      [type]: value,
      pageNumber: 1,
    });
  };

  getDefaultValue = (type) => {
    if (this.props.list && this.props.list.payload) {
      if (type === 'slugs' && this.state.filters.slugs) {
        const search =
        this.props.list.payload.find(
          item => item.citySlug === this.state.filters.slugs[0]);
        return search ? search.name : '';
      }

      if (type === 'countrySlugs' && this.state.filters.countrySlugs) {
        const search =
        this.props.list.payload.find(
          item => item.countrySlug === this.state.filters.countrySlugs[0]);
        return search ? search.countryName : '';
      }
    }
    return '';
  }

  tableColumns = () => [
    {
      title: this.props.t('cms.table.column.name'),
      dataIndex: 'name',
      key: 'name',
      className: 'city-tab__city-column',
      width: '30%',
      filterDropdown: (
        <If condition={ this.props.communication.list.status === communicationStatus.IDLE }>
          <TableColumnSearch
            searchType="city"
            isLocaitonCustom
            valueData={ this.getDefaultValue('slugs') }
            ref={ (component) => { this.columnInputs.cityFilter = component; } }
            placeholder={ this.props.t('cms.table.column.search.city_name') }
            onSearch={ (slug) => { this.handleColumnFilter('slugs', slug); } }
            t={ this.props.t }
          />
        </If>
      ),
      filterIcon: (
        <Icon
          type="filter"
          theme="filled"
          style={ {
            color:
            this.state.filters.slugs && this.state.filters.slugs[0] ?
              '#38b2a6' : '#c8c9cb',
            backgroundColor: 'transparent',
          } }
        />
      ),
      filterDropdownVisible: this.state.visibility.cityFilter,
      onFilterDropdownVisibleChange: () => {
        this.handleFilterDropDownVisibleChange('cityFilter', 'slugs');
      },
    },
    {
      title: this.props.t('cms.table.column.country'),
      dataIndex: 'countryName',
      key: 'countryName',
      className: 'city-tab__country-column',
      width: '30%',
      filterDropdown: (
        <If condition={ this.props.communication.list.status === communicationStatus.IDLE }>
          <TableColumnSearch
            searchType="country"
            isLocaitonCustom
            valueData={ this.getDefaultValue('countrySlugs') }
            ref={ (component) => { this.columnInputs.countryFilter = component; } }
            placeholder={ this.props.t('cms.table.column.search.country_name') }
            onSearch={ (slug) => { this.handleColumnFilter('countrySlugs', slug); } }
            t={ this.props.t }
          />
        </If>
      ),
      filterIcon: (
        <Icon
          type="filter"
          theme="filled"
          style={ {
            color:
            this.state.filters.countrySlugs && this.state.filters.countrySlugs[0] ?
              '#38b2a6' : '#c8c9cb',
            backgroundColor: 'transparent',
          } }
        />
      ),
      filterDropdownVisible: this.state.visibility.countryFilter,
      onFilterDropdownVisibleChange: () => {
        this.handleFilterDropDownVisibleChange('countryFilter', 'countrySlugs');
      },
    },
    {
      title: this.props.t('cms.table.column.properties'),
      dataIndex: 'numOfProperties',
      key: 'numOfProperties',
      className: 'city-tab__properties-column',
      width: '20%',
      render: (text, record) => {
        if (text > 0) {
          return (<span>{record.publishedProperties}/<span className="city-tab__properties">{record.numOfProperties}</span></span>);
        }

        return (<span>-</span>);
      },
    },
    {
      title: this.props.t('cms.table.column.actions'),
      dataIndex: 'published',
      key: 'published',
      className: 'city-tab__actions-column',
      width: '20%',
      render: (text, record) => (
        <div id={ record.id }>
          <If condition={ showElementByAuth(platformEntity.LOCATIONS_CITIES, entityAction.READ) }>
            <Link
              className="city-tab__actions"
              to={ generatePath('city.edit', {
                slug: record.citySlug,
              }) }
            >
              { this.props.t('cms.property_card.action.btn.edit') }
            </Link>
          </If>
          <If condition={ showElementByAuth(platformEntity.LOCATIONS_CITIES, entityAction.UPDATE) }>
            <span className="city-tab__line">|</span>
            <button className="city-tab__actions" onClick={ () => { this.updateCityState(record); } }>
              { this.props.t(`cms.property_card.action.btn.${text ? 'unpublish' : 'publish'}`) }
            </button>
          </If>
        </div>
      ),
    },
  ];

  updateCityState = (record) => {
    this.setState({
      updateCityPublished: !record.published,
      showReviewModal: !record.published,
      city: record.data,
    });

    if (record.published) {
      this.props.getCityDetail(record.citySlug);
    }
  }

  addNewCity = () => {
    this.setState({
      showModal: !this.state.showModal,
    });
  }

  createSuccess = () => {
    this.addNewCity();
    const params = {
      pageSize: this.state.filters.pageSize,
      pageNumber: this.state.filters.pageNumber,
      sortBy: null,
      sortDirection: null,
      slugs: [],
      countrySlugs: [],
    };

    this.setState({ filters: params });
    this.pushState({
      sortBy: null,
      sortDirection: null,
      slugs: [],
      countrySlugs: [],
    });
    this.props.getCityList({});
  }

  closeReviewModal = () => {
    this.setState({
      showReviewModal: false,
    });
  };

  handleCloseUnpubilshedModal = () => {
    this.setState({
      showUnpubilshedModal: false,
    });
  }

  unpublishCity = () => {
    this.props.updateCity({ id: this.state.city.id, published: false });
    this.handleCloseUnpubilshedModal();
  }

  render() {
    return (
      <div className="city-tab">
        <TableList
          t={ this.props.t }
          list={ this.props.list }
          tableColumns={ this.tableColumns() }
          filters={ this.state.filters }
          handleTableChange={ this.handleTableChange }
          onAddNewBtn={ this.addNewCity }
          communication={ this.props.communication }
          type="city"
        />

        <If condition={ this.state.showModal }>
          <AddNewCity
            activeModal
            onClose={ this.addNewCity }
            createSuccess={ this.createSuccess }
            addNewCitySuccess={ this.addNewCitySuccess }
            t={ this.props.t }
          />
        </If>

        <If condition={ this.state.showUnpubilshedModal && this.state.city }>
          <UnpubilshedModal
            activeModal
            onClose={ this.handleCloseUnpubilshedModal }
            updateUnpubilshed={ this.unpublishCity }
            t={ this.props.t }
            text={ this.props.t('cms.location.city.upublish.modal.text', {
              properties:
              this.state.city.publishedProperties ?
                this.state.city.publishedProperties : 0,
              areas:
              this.state.city.areas ?
                this.state.city.areas.totalCount : 0,
              universities:
              this.state.city.universities ?
                this.state.city.universities.totalCount : 0,
            }) }
          />
        </If>
        <If condition={ this.state.showReviewModal }>
          <LocationReviewModal
            activeModal
            type={ locationType.CITY_TYPE }
            handleClose={ this.closeReviewModal }
            data={ this.state.city }
            t={ this.props.t }
            isHomeList
            updatePublished={ this.props.updateCity }
          />
        </If>
      </div>
    );
  }
}

City.propTypes = {
  t: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  getCityList: PropTypes.func,
  list: PropTypes.object,
  initialize: PropTypes.func,
  communication: PropTypes.object,
  updateCity: PropTypes.func,
  city: PropTypes.object,
  getCityDetail: PropTypes.func,
};

City.defaultProps = {
  t: () => {},
  location: {
    search: '',
  },
  history: {
    push: () => {},
  },
  list: {},
  initialize: () => {},
  communication: {},
  updateCity: () => {},
  getCityList: () => {},
  city: {},
  getCityDetail: () => {},
};
