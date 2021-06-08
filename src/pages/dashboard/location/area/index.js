import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Icon, message } from 'antd';
import generatePath from '~settings/routing';
import { mergeSearchParams } from '~helpers/history';
import { connect } from 'react-redux';
import queryString from 'query-string';
import * as actions from '~actions/location/area';
import AddNewArea from '~pages/dashboard/location/area/add-new-area';
import { communicationStatus, locationType, platformEntity, entityAction } from '~constants';
import TableColumnSearch from '~components/table-column-search';
import update from 'immutability-helper';
import UnpubilshedModal from '~components/unpubilshed-modal';
import TableList from '~pages/dashboard/location/table-list';
import LocationReviewModal from '~components/location-review-modal';
import { setItem } from '~base/global/helpers/storage';
import showElementByAuth from '~helpers/auth';
import authControl from '~components/auth-control';

const mapStateToProps = state => ({
  list: state.dashboard.area.get('list').toJS(),
  communication: state.dashboard.area.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize());
  },

  getAreaList: (filters) => {
    dispatch(actions.getAreaList(filters));
  },

  updateArea: (data) => {
    dispatch(actions.updateArea(data));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.LOCATIONS_AREAS, entityAction.READ)
export default class Area extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSearchParams = {
      pageNumber: 1,
      pageSize: 10,
    };
    this.state = {
      showModal: false,
      filters: this.formatFilters(
        this.getLocationSearch(this.props.location.search),
      ),
      visibility: {
        areaFilter: false,
        cityFilter: false,
      },
      showReviewModal: false,
      showUnpubilshedModal: false,
      publishData: null,
      updateAreaPublished: false,
    };

    this.columnInputs = {
      areaFilter: [],
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
    this.props.getAreaList(this.state.filters || {});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const search = this.getLocationSearch(nextProps.location.search);
      const filters = this.formatFilters(search);

      this.closeDropDownVisible();
      this.props.getAreaList(filters || {});
      this.setFilters(filters);
    }

    if (
      nextProps.communication.update.status === communicationStatus.IDLE
        && this.props.communication.update.status === communicationStatus.FETCHING
    ) {
      message.success(
        this.props.t(
          'cms.location.table.update.published',
          { tableType: 'Area', published: this.state.updateCityPublished ? 'published' : 'unpublished' },
        ),
      );

      const search = this.getLocationSearch(this.props.location.search);
      const filters = this.formatFilters(search);
      this.props.getAreaList(filters || {});
    }
  }

  closeDropDownVisible = () => {
    this.setState({
      visibility: {
        areaFilter: false,
        cityFilter: false,
      },
    });
  }

  setFilters = (value) => {
    this.setState({
      filters: update(this.state.filters, { $set: value }),
    });

    setItem('cms_location_areas_list_filters', this.state.filters);
  }

  sortData = data => data.sort((a, b) => a.numOfProperties - b.numOfProperties);

  getLocationSearch = (locationSearch) => {
    const search = queryString.parse(locationSearch);

    if (search && typeof search.slugs === 'string') {
      search.slugs = [search.slugs];
    }

    if (search && typeof search.citySlugs === 'string') {
      search.citySlugs = [search.citySlugs];
    }

    return search;
  };

  formatFilters = filters => ({
    pageNumber: Number(filters.pageNumber) || this.defaultSearchParams.pageNumber,
    pageSize: Number(filters.pageSize) || this.defaultSearchParams.pageSize,
    citySlugs: filters.citySlugs || [],
    slugs: filters.slugs || [],
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
      citySlugs: this.state.filters.citySlugs || [],
    };

    if (pagination.pageSize !== this.state.filters.pageSize) {
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

  getDefaultValue = (type) => {
    if (this.props.list && this.props.list.payload) {
      if (type === 'slugs' && this.state.filters.slugs) {
        const search =
        this.props.list.payload.find(
          item => item.slug === this.state.filters.slugs[0]);

        return search ? search.name : '';
      }

      if (type === 'citySlugs' && this.state.filters.citySlugs) {
        const search =
        this.props.list.payload.find(
          item => item.citySlug === this.state.filters.citySlugs[0]);
        return search ? search.cityName : '';
      }
    }
    return '';
  }

  updateAreaState = (record) => {
    this.setState({
      updateCityPublished: !record.published,
      showUnpubilshedModal: record.published,
      showReviewModal: !record.published,
      publishData: record.data,
    });
  }

  tableColumns = () => [
    {
      title: this.props.t('cms.table.column.name'),
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      className: 'area-tab__area-column',
      filterDropdown: (
        <If condition={ this.props.communication.list.status === communicationStatus.IDLE }>
          <TableColumnSearch
            searchType="area"
            isLocaitonCustom
            ref={ (component) => { this.columnInputs.areaFilter = component; } }
            valueData={ this.getDefaultValue('slugs') }
            placeholder={ this.props.t('cms.location.table.column.search.area_name') }
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
      filterDropdownVisible: this.state.visibility.areaFilter,
      onFilterDropdownVisibleChange: () => {
        this.handleFilterDropDownVisibleChange('areaFilter', 'slugs');
      },
    },
    {
      title: this.props.t('cms.table.column.city'),
      dataIndex: 'cityName',
      key: 'cityName',
      className: 'area-tab__city-column',
      width: '30%',
      filterDropdown: (
        <If condition={ this.props.communication.list.status === communicationStatus.IDLE }>
          <TableColumnSearch
            searchType="city"
            isLocaitonCustom
            valueData={ this.getDefaultValue('citySlugs') }
            ref={ (component) => { this.columnInputs.cityFilter = component; } }
            placeholder={ this.props.t('cms.table.column.search.city_name') }
            onSearch={ (slug) => { this.handleColumnFilter('citySlugs', slug); } }
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
            this.state.filters.citySlugs && this.state.filters.citySlugs[0] ?
              '#38b2a6' : '#c8c9cb',
            backgroundColor: 'transparent',
          } }
        />
      ),
      filterDropdownVisible: this.state.visibility.cityFilter,
      onFilterDropdownVisibleChange: () => {
        this.handleFilterDropDownVisibleChange('cityFilter', 'citySlugs');
      },
    },
    {
      title: this.props.t('cms.table.column.properties'),
      dataIndex: 'properties',
      key: 'properties',
      className: 'area-tab__properties-column',
      width: '20%',
      render: (text, record) => {
        if (record.properties > 0) {
          return (<span>{record.publishedProperties}/<span className="area-tab__properties">{text}</span></span>);
        }

        return (<span>-</span>);
      },
    },
    {
      title: this.props.t('cms.table.column.actions'),
      dataIndex: 'published',
      key: 'published',
      className: 'area-tab__actions-column',
      width: '20%',
      render: (text, record) => (
        <div id={ record.id }>
          <If condition={ showElementByAuth(platformEntity.LOCATIONS_AREAS, entityAction.READ) }>
            <Link
              className="area-tab__actions"
              to={ generatePath('area.edit', {
                slug: record.slug,
              }) }
            >
              { this.props.t('cms.property_card.action.btn.edit') }
            </Link>
          </If>
          <If condition={ showElementByAuth(platformEntity.LOCATIONS_AREAS, entityAction.UPDATE) }>
            <span className="area-tab__line">|</span>
            <button className="area-tab__actions" onClick={ () => { this.updateAreaState(record); } }>
              { this.props.t(`cms.property_card.action.btn.${text ? 'unpublish' : 'publish'}`) }
            </button>
          </If>
        </div>
      ),
    },
  ];

  addNewArea = () => {
    this.setState({
      showModal: !this.state.showModal,
    });
  }

  createSuccess = () => {
    this.addNewArea();
    if (this.state.showModal) {
      const params = {
        pageSize: this.state.filters.pageSize,
        pageNumber: this.state.filters.pageNumber,
        sortBy: null,
        sortDirection: null,
        slugs: [],
        citySlugs: [],
      };

      this.setState({ filters: params });
      this.pushState({
        sortBy: null,
        sortDirection: null,
        slugs: [],
        citySlugs: [],
      });
      this.props.getAreaList({});
    }
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

  unpublishArea = () => {
    this.props.updateArea({ id: this.state.publishData.id, published: false });
    this.handleCloseUnpubilshedModal();
  }

  render() {
    const { t } = this.props;
    return (
      <div className="area-tab">
        <TableList
          t={ this.props.t }
          list={ this.props.list }
          tableColumns={ this.tableColumns() }
          filters={ this.state.filters }
          handleTableChange={ this.handleTableChange }
          onAddNewBtn={ this.addNewArea }
          communication={ this.props.communication }
          type="area"
        />

        <If condition={ this.state.showUnpubilshedModal && this.state.publishData }>
          <UnpubilshedModal
            activeModal
            onClose={ this.handleCloseUnpubilshedModal }
            updateUnpubilshed={ this.unpublishArea }
            t={ this.props.t }
            text={ t('cms.location.area.upublish.modal.text', {
              city_name:
              this.state.publishData.city ?
                this.state.publishData.city.name : '',
            }) }
          />
        </If>

        <If condition={ this.state.showModal }>
          <AddNewArea
            activeModal
            t={ t }
            onClose={ this.addNewArea }
            createSuccess={ this.createSuccess }
            clearFilter={ this.clearFilter }
          />
        </If>
        <If condition={ this.state.showReviewModal }>
          <LocationReviewModal
            isHomeList
            t={ t }
            data={ this.state.publishData }
            type={ locationType.AREA_TYPE }
            handleClose={ this.closeReviewModal }
            updatePublished={ this.props.updateArea }
            activeModal
          />
        </If>
      </div>
    );
  }
}

Area.propTypes = {
  t: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  getAreaList: PropTypes.func,
  list: PropTypes.object,
  initialize: PropTypes.func,
  updateArea: PropTypes.func,
  communication: PropTypes.object,
};

Area.defaultProps = {
  t: () => {},
  location: {
    search: '',
  },
  history: {
    push: () => {},
  },
  getAreaList: () => {},
  list: {},
  initialize: () => {},
  communication: {},
  updateArea: () => {},
};
