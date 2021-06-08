
import { Table, Icon, Button, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';
import queryString from 'query-string';
import { connect } from 'react-redux';
import * as actions from '~actions/location/country';
import { mergeSearchParams } from '~helpers/history';
import update from 'immutability-helper';
import { communicationStatus, sortDirectionMapping, countrySortByMapping, platformEntity, entityAction } from '~constants';
import TableColumnSearch from '~components/table-column-search';
import showElementByAuth from '~helpers/auth';
import authControl from '~components/auth-control';

const mapStateToProps = state => ({
  list: state.dashboard.country.get('list').toJS(),
  communication: state.dashboard.country.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize());
  },

  getCountryList: (filters) => {
    dispatch(actions.getCountryList(filters));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.LOCATIONS_COUNTRIES, entityAction.READ)
export default class Country extends React.Component {
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
        billingCycleFilter: false,
      },
    };

    this.columnInputs = {
      countryFilter: [],
      billingCycle: [],
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
    this.props.getCountryList(this.state.filters || {});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const search = this.getLocationSearch(nextProps.location.search);
      const filters = this.formatFilters(search);

      this.closeDropDownVisible();
      this.props.getCountryList(filters || {});
      this.setFilters(filters);
    }
  }

  setFilters = (value) => {
    this.setState({
      filters: update(this.state.filters, { $set: value }),
    });
  }

  sortData = data => data.sort((a, b) => a.numOfProperties - b.numOfProperties);

  getLocationSearch = (locationSearch) => {
    const search = queryString.parse(locationSearch);

    if (search && typeof search.billingCycle === 'string') {
      search.billingCycle = [search.billingCycle];
    }

    if (search && typeof search.countrySlugs === 'string') {
      search.countrySlugs = [search.countrySlugs];
    }

    return search;
  };

  formatFilters = filters => ({
    pageNumber: Number(filters.pageNumber) || this.defaultSearchParams.pageNumber,
    pageSize: Number(filters.pageSize) || this.defaultSearchParams.pageSize,
    countrySlugs: filters.countrySlugs || [],
    billingCycle: filters.billingCycle || [],
    sortBy: filters.sortBy || null,
    sortDirection: filters.sortDirection || null,
  });

  handleTableChange = (pagination, filters, sorter) => {
    const params = {
      pageNumber: pagination.current,
      sortBy: countrySortByMapping[sorter.columnKey] || null,
      sortDirection: sortDirectionMapping[sorter.order] || null,
      billingCycle: filters.billingCycle || [],
      countrySlugs: this.state.filters.countrySlugs || [],
    };

    if (pagination.pageSize !== this.state.filters.pageSize) {
      params.pageSize = pagination.pageSize;
      params.pageNumber = 1;
    }

    this.pushState(params);
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

  closeDropDownVisible = () => {
    this.setState({
      visibility: {
        countryFilter: false,
        billingCycleFilter: false,
      },
    });
  }

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

  getDefaultValue = () => {
    if (this.props.list && this.props.list.payload && this.state.filters.countrySlugs) {
      const search =
      this.props.list.payload.find(
        item => item.countrySlug === this.state.filters.countrySlugs[0]);
      if (search) {
        return search.originalName;
      }
    }

    return '';
  }

  tableColumns = () => [
    {
      title: this.props.t('cms.table.column.name'),
      dataIndex: 'originalName',
      key: 'originalName',
      className: 'country-tab__name-column',
      width: '25%',
      filterDropdown: (
        <If condition={ this.props.communication.list.status === communicationStatus.IDLE }>
          <TableColumnSearch
            searchType="country"
            isLocaitonCustom
            ref={ (component) => { this.columnInputs.countryFilter = component; } }
            valueData={ this.getDefaultValue() }
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
      title: this.props.t('cms.table.column.slug'),
      dataIndex: 'countrySlug',
      key: 'countrySlug',
      width: '14%',
      sorter: true,
      sortOrder:
      (this.state.filters.sortBy === countrySortByMapping.countrySlug &&
        sortDirectionMapping[this.state.filters.sortDirection]) ||
      false,
    },
    {
      title: this.props.t('cms.table.column.code'),
      dataIndex: 'countryCode',
      key: 'countryCode',
      width: '14%',
      sorter: true,
      sortOrder:
      (this.state.filters.sortBy === countrySortByMapping.countryCode &&
        sortDirectionMapping[this.state.filters.sortDirection]) ||
      false,
    },
    {
      title: this.props.t('cms.table.column.currency'),
      dataIndex: 'currencyCode',
      key: 'currencyCode',
      width: '14%',
      sorter: true,
      sortOrder:
      (this.state.filters.sortBy === countrySortByMapping.currencyCode &&
        sortDirectionMapping[this.state.filters.sortDirection]) ||
      false,
    },
    {
      title: this.props.t('cms.table.column.billing_cycle'),
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      width: '18%',
      filters: [
        {
          text: this.props.t('cms.country.column.billing_cycle.filter.weekly'),
          value: 'WEEKLY',
        },
        {
          text: this.props.t('cms.country.column.billing_cycle.filter.monthly'),
          value: 'MONTHLY',
        },
        {
          text: this.props.t('cms.country.column.billing_cycle.filter.daily'),
          value: 'DAILY',
        },
      ],
      filteredValue: this.state.filters.billingCycle,
      filterIcon: (
        <Icon
          type="filter"
          theme="filled"
          style={ {
            color:
              this.state.filters.billingCycle && this.state.filters.billingCycle.length > 0 ?
                '#38b2a6' : '#c8c9cb',
            backgroundColor: 'transparent',
          } }
        />
      ),
      render: text => (<If condition={ text }>
        <span>{this.props.t(`cms.country.column.billing_cycle.filter.${text.toLowerCase()}`)}</span>
      </If>),
    },
    {
      title: this.props.t('cms.table.column.properties'),
      dataIndex: 'publishedProperties',
      key: 'publishedProperties',
      width: '15%',
      render: (text, record) => {
        if (record.properties > 0) {
          return (<span>{text}/<span className="country-tab__properties">{record.properties}</span></span>);
        }

        return (<span>-</span>);
      },
    },
  ];

  render() {
    const { list, communication, t } = this.props;
    return (
      <div className="country-tab">
        <div className="table-header">
          <div className="table-header__container">
            <h1 className="table-header__heading">
              { t('cms.country.table.header.text.num_countries', {
                num: list.total,
              }) }
            </h1>
            <If condition={ showElementByAuth(
              platformEntity.LOCATIONS_COUNTRIES,
              entityAction.CREATE,
            ) }
            >
              <div className="table-header__button-container">
                <Tooltip
                  placement="bottom"
                  overlayClassName="country-tab__tips"
                  title={ t('cms.country.table.header.add_new_country.tip') }
                >
                  <Button onClick={ this.addNewCity } disabled>
                    <Icon type="plus" className="city-tab__icon-plus" />
                    { t('cms.country.table.header.add_new_country.button') }
                  </Button>
                </Tooltip>
              </div>
            </If>
          </div>
        </div>
        <div className="table-list__wrapper" >
          <Table
            rowKey="id"
            className="table-list"
            scroll={ { x: '0' } }
            columns={ this.tableColumns() }
            onChange={ this.handleTableChange }
            dataSource={ list.payload }
            loading={ communication.list.status === communicationStatus.FETCHING }
            pagination={ {
              current: this.state.filters.pageNumber,
              pageSize: this.state.filters.pageSize,
              showSizeChanger: true,
              hideOnSinglePage: false,
              total: list.total,
            } }
          />
        </div>
      </div>
    );
  }
}

Country.propTypes = {
  t: PropTypes.func.isRequired,
  initialize: PropTypes.func,
  getCountryList: PropTypes.func,
  list: PropTypes.shape({
    total: PropTypes.number,
    payload: PropTypes.array,
  }),
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  communication: PropTypes.shape({
    list: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
};

Country.defaultProps = {
  t: () => {},
  initialize: () => {},
  getCountryList: () => {},
  list: {
    total: 0,
    payload: [],
  },
  communication: {
    list: {
      status: '',
    },
  },
  location: {
    search: '',
  },
  history: {
    push: () => {},
  },
};
