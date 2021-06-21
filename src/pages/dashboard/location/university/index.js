import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import classNames from 'classnames';
import { Link, withRouter } from 'react-router-dom';
import { Icon, Tooltip, message } from 'antd';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import generatePath from '~settings/routing';
import * as actions from '~actions/location/university';
import TableColumnSearch from '~components/table-column-search';
import update from 'immutability-helper';
import { mergeSearchParams } from '~helpers/history';
import AddNewUniversity from '~pages/dashboard/location/university/add-new-university';
import { communicationStatus, locationType, platformEntity, entityAction } from '~constants';
import TableList from '~pages/dashboard/location/table-list';
import UnpubilshedModal from '~components/unpubilshed-modal';
import LocationReviewModal from '~components/location-review-modal';
import { setItem } from '~base/global/helpers/storage';
import showElementByAuth from '~helpers/auth';

import authControl from '~components/auth-control';

const mapStateToProps = state => ({
  list: state.dashboard.university.get('list').toJS(),
  communication: state.dashboard.university.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  initialize: () => {
    dispatch(actions.initialize());
  },

  getUniversityList: (filters) => {
    dispatch(actions.getUniversityList(filters));
  },

  updateUniversity: (data) => {
    dispatch(actions.updateUniversity(data));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.UNIVERSITIES_UNIVERSITIES, entityAction.READ)
export default class University extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSearchParams = {
      pageNumber: 1,
      pageSize: 10,
    };
    this.state = {
      filters: this.formatFilters(this.props.location.search),
      visibility: {
        universityFilter: false,
        cityFilter: false,
      },
      updateUniversityPublished: false,
      showReviewModal: false,
      showUnpubilshedModal: false,
      publishData: null,
    };

    this.columnInputs = {
      universityFilter: [],
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
    this.props.getUniversityList(filters || {});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const search = this.getLocationSearch(nextProps.location.search);
      const filters = this.formatFilters(search);

      this.closeDropDownVisible();
      this.props.getUniversityList(filters || {});
      this.setFilters(filters);
    }

    if (
      nextProps.communication.update.status === communicationStatus.IDLE
        && this.props.communication.update.status === communicationStatus.FETCHING
    ) {
      message.success(
        this.props.t(
          'cms.location.table.update.published',
          { tableType: 'University', published: this.state.updateUniversityPublished ? 'published' : 'unpublished' },
        ),
      );

      const search = this.getLocationSearch(this.props.location.search);
      const filters = this.formatFilters(search);
      this.props.getUniversityList(filters || {});
    }
  }

  closeDropDownVisible = () => {
    this.setState({
      visibility: {
        universityFilter: false,
        cityFilter: false,
      },
    });
  }

  setFilters = (value) => {
    this.setState({
      filters: value,
    });

    setItem('cms_location_universities_list_filters', this.state.filters);
  }

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
    slugs: filters.slugs || [],
    citySlugs: filters.citySlugs || [],
  });

  handleTableChange = (pagination) => {
    const params = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.current,
      citySlugs: this.state.filters.citySlugs,
      slugs: this.state.filters.slugs || [],
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

  updateUniversityState = (record) => {
    this.setState({
      updateUniversityPublished: !record.published,
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
      width: '40%',
      className: 'university-tab__university-column',
      filterDropdown: (
        <TableColumnSearch
          searchType="university"
          isLocaitonCustom
          ref={ (component) => { this.columnInputs.universityFilter = component; } }
          placeholder={ this.props.t('cms.table.column.search.university_name') }
          onSearch={ (slug) => { this.handleColumnFilter('slugs', slug); } }
          t={ this.props.t }
        />
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
      filterDropdownVisible: this.state.visibility.universityFilter,
      onFilterDropdownVisibleChange: () => {
        this.handleFilterDropDownVisibleChange('universityFilter', 'slugs');
      },
    },
    {
      title: this.props.t('cms.location.table.university.details.common_names'),
      dataIndex: 'commonNamesCount',
      key: 'commonNamesCount',
      className: 'university-tab__common-names-column',
      width: '18%',
      render: (text, record) => {
        if (text && record.commonNames.length > 0) {
          const titleText =
            (<div className="university-tab__tooltip">
              <For index="index" each="commonName" of={ record.commonNames } >
                <span
                  key={ commonName }
                  className={ classNames('university-tab__common-name',
                    { 'university-tab__common-name-last': record.commonNames.length === index + 1 },
                  ) }
                >
                  {commonName}
                  <If condition={ record.commonNames.length !== index + 1 }>
                    ,
                  </If>
                </span>
              </For>
            </div>);
          return (<Tooltip
            placement="right"
            title={ titleText }
            className="university-tab__common-names"
          >
            <span>{record.commonNames.length}</span>
          </Tooltip>);
        }

        return (<span>-</span>);
      },
    },
    {
      title: this.props.t('cms.table.column.city'),
      dataIndex: 'cityName',
      key: 'cityName',
      className: 'university-tab__city-column',
      width: '22%',
      filterDropdown: (
        <TableColumnSearch
          searchType="city"
          isLocaitonCustom
          ref={ (component) => { this.columnInputs.cityFilter = component; } }
          placeholder={ this.props.t('cms.table.column.search.city_name') }
          onSearch={ (slug) => { this.handleColumnFilter('citySlugs', slug); } }
          t={ this.props.t }
        />
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
      title: this.props.t('cms.table.column.actions'),
      dataIndex: 'published',
      key: 'published',
      className: 'university-tab__actions-column',
      width: '20%',
      render: (text, record) => (
        <div id={ record.id }>
          <If condition={ showElementByAuth(
            platformEntity.UNIVERSITIES_UNIVERSITIES,
            entityAction.READ,
          ) }
          >
            <Link
              className="university-tab__actions"
              to={ generatePath('university.edit', {
                slug: record.slug,
              }) }
            >
              { this.props.t('cms.property_card.action.btn.edit') }
            </Link>
          </If>
          <If condition={ showElementByAuth(
            platformEntity.UNIVERSITIES_UNIVERSITIES,
            entityAction.UPDATE,
          ) }
          >
            <span className="university-tab__line">|</span>
            <button className="university-tab__actions" onClick={ () => { this.updateUniversityState(record); } }>
              { this.props.t(`cms.property_card.action.btn.${text ? 'unpublish' : 'publish'}`) }
            </button>
          </If>
        </div>
      ),
    },
  ];

  addNewUniversity = () => {
    this.setState({
      showModal: !this.state.showModal,
    });
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

  unpublishUniversity = () => {
    this.props.updateUniversity({ id: this.state.publishData.id, published: false });
    this.handleCloseUnpubilshedModal();
  }

  createSuccess = () => {
    this.addNewUniversity();
    const params = {
      pageSize: this.state.filters.pageSize,
      pageNumber: this.state.filters.pageNumber,
      citySlugs: [],
      slugs: [],
    };

    this.setState({ filters: params });
    this.pushState({
      citySlugs: [],
      slugs: [],
    });
    this.props.getUniversityList({});
  }

  render() {
    const { t } = this.props;
    return (
      <div className="university-tab">
        <TableList
          t={ this.props.t }
          list={ this.props.list }
          tableColumns={ this.tableColumns() }
          filters={ this.state.filters }
          handleTableChange={ this.handleTableChange }
          onAddNewBtn={ this.addNewUniversity }
          communication={ this.props.communication }
          type="university"
        />

        <If condition={ this.state.showModal }>
          <AddNewUniversity
            activeModal
            onClose={ this.addNewUniversity }
            t={ t }
            createSuccess={ this.createSuccess }
          />
        </If>
        <If condition={ this.state.showReviewModal }>
          <LocationReviewModal
            isHomeList
            t={ t }
            data={ this.state.publishData }
            type={ locationType.UNIVERSITY_TYPE }
            handleClose={ this.closeReviewModal }
            updatePublished={ this.props.updateUniversity }
            activeModal
          />
        </If>
        <If condition={ this.state.showUnpubilshedModal && this.state.publishData }>
          <UnpubilshedModal
            activeModal
            onClose={ this.handleCloseUnpubilshedModal }
            updateUnpubilshed={ this.unpublishUniversity }
            t={ this.props.t }
            text={ t('cms.location.university.modal.text', {
              city_name:
              this.state.publishData.city ?
                this.state.publishData.city.name : '',
            }) }
          />
        </If>
      </div>
    );
  }
}

University.propTypes = {
  t: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  getUniversityList: PropTypes.func,
  list: PropTypes.object,
  initialize: PropTypes.func,
  updateUniversity: PropTypes.func,
  communication: PropTypes.object,
};

University.defaultProps = {
  t: () => {},
  location: {
    search: '',
  },
  history: {
    push: () => {},
  },
  getUniversityList: () => {},
  updateUniversity: () => {},
  list: {},
  initialize: () => {},
  communication: {},
};
