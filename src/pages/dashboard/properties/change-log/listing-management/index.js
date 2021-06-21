import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Spin, Drawer } from 'antd';
import moment from 'moment';
import * as editActions from '~actions/properties/property-edit';
import * as changeLogActions from '~actions/properties/change-log';
import generatePath from '~settings/routing';
import { communicationStatus } from '~constants';
import { sectionModalMapping } from '~constants/change-log';
import Header from '~components/property-header';
import ChangeLogTable from '~pages/dashboard/properties/change-log/listing-management/table';
import { isEmptyObject } from '~helpers/property-edit';
import FilterModal from '~components/filter-modal';
import FilterCard from '~components/filter-card';

const mapStateToProps = (state) => {
  const propertyData = state.dashboard.propertyEdit.toJS();
  const changeLog = state.dashboard.changeLog.toJS();

  return {
    property: propertyData.payload,
    getPropertyStatus: propertyData.communication.getDetail.status,
    changeLogs: changeLog.payload,
    totalCount: changeLog.totalCount,
    getChangeLogsStatus: changeLog.communication.status,
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyDetail: (id, successCallback) => {
    dispatch(editActions.getPropertyDetail(id, successCallback));
  },
  getPropertyChangeLogs: (params, successCallback) => {
    dispatch(changeLogActions.getPropertyChangeLogs(params, successCallback));
  },
  getChangeLogUserList: (params, successCallback) => {
    dispatch(changeLogActions.getChangeLogUserList(params, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class ListingManagement extends React.Component {
  constructor() {
    super();

    this.state = {
      modalFilters: [],
      showFilterModal: false,
      filters: {
        pageNumber: 1,
        pageSize: 50,
        sortDirection: null,
      },
      activeChangeLog: {},
      cmsUserList: [],
    };

    this.filterTypeList = ['log_date', 'change_by', 'modal_id', 'log_section'];
  }

  componentDidMount() {
    this.props.getPropertyDetail(decodeURIComponent(this.props.match.params.propertySlug), () => {
      if (isEmptyObject(this.props.property)) {
        this.props.history.push(generatePath('properties', {}));
      }
    });

    this.handleApplyFilter();
  }

  handleRemoveFilter = (type) => {
    this.setState({
      modalFilters: this.state.modalFilters.filter(filter => filter.filterType !== type),
    }, () => {
      this.handleApplyFilter();
    });
  };

  handleChangeLogModalFilter = (isOpen) => {
    this.setState({
      showFilterModal: isOpen,
    });
  }

  handleApplyModalFilter = (modalFilters) => {
    this.setState({
      modalFilters,
      showFilterModal: false,
    }, () => {
      this.handleApplyFilter(true);
    });
  };

  handleApplyFilter = (resetPageNumber = false) => {
    const params = {
      slug: decodeURIComponent(this.props.match.params.propertySlug),
      pageNumber: resetPageNumber ? 1 : this.state.filters.pageNumber,
      pageSize: this.state.filters.pageSize,
    };
    if (resetPageNumber) {
      this.state.filters.pageNumber = 1;
      this.setState(this.state);
    }
    if (this.state.filters.sortDirection) {
      params.sortDirection = this.state.filters.sortDirection;
    }

    this.state.modalFilters.map((filter) => {
      if (filter.filterType === 'log_date' && filter.operator1) {
        params.createdAtAfter = filter.operator1[0] || moment(filter.operator1[1]).subtract('90', 'days').format('YYYY-MM-DD');
        params.createdAtBefore = filter.operator1[1] || moment(filter.operator1[0]).add('90', 'days').format('YYYY-MM-DD');
      }

      if (filter.filterType === 'log_section' && filter.operator2) {
        params.models = sectionModalMapping[filter.operator2];
      }

      if (filter.filterType === 'modal_id' && filter.operator2) {
        params.modelIds = [parseInt(filter.operator2, 10)];
      }

      if (filter.filterType === 'change_by' && filter.operator2.uuid) {
        params.changeBys = filter.operator2.uuid;
      }

      return true;
    });
    this.props.getPropertyChangeLogs(params);
  };

  setFilters = (filter) => {
    this.setState({
      filters: filter,
    }, () => {
      this.handleApplyFilter();
    });
  };

  handleOpenFilterModal = () => {
    if (this.state.cmsUserList.length === 0) {
      this.props.getChangeLogUserList({}, (res) => {
        if (res && res.cmsUsers && res.cmsUsers.edges) {
          this.setState({
            cmsUserList: res.cmsUsers.edges.map(user =>
              ({
                email: user.node.email,
                name: `${user.node.firstName} ${user.node.lastName}`,
                uuid: user.node.userUuid,
              }),
            ),
          });
        }
      });
    }

    this.handleChangeLogModalFilter(true);
  };

  setActiveChangeLog = (changeLog) => {
    this.setState({
      activeChangeLog: changeLog,
    });
  };

  render() {
    const {
      t,
      property,
      getPropertyStatus,
      getChangeLogsStatus,
      changeLogs,
      totalCount,
    } = this.props;
    return (
      <div className="listing-management">
        <Choose>
          <When condition={ getPropertyStatus !== communicationStatus.IDLE }>
            <div className="listing-management__loading">
              <Spin />
            </div>
          </When>
          <Otherwise>
            <Header
              t={ t }
              property={ property }
              type="change-log-listing-management"
              handleOpenFilterModal={ () => { this.handleOpenFilterModal(true); } }
            />

            <div className="listing-management__filters-container">
              <If condition={ this.state.modalFilters.length > 0 }>
                <For of={ this.state.modalFilters } each="filter">
                  <FilterCard
                    key={ filter.filterType }
                    filter={ filter }
                    onClose={ () => { this.handleRemoveFilter(filter.filterType); } }
                    t={ t }
                  />
                </For>
              </If>
            </div>

            <ChangeLogTable
              t={ t }
              changeLogs={ changeLogs }
              getChangeLogsStatus={ getChangeLogsStatus }
              filters={ this.state.filters }
              setFilters={ this.setFilters }
              totalCount={ totalCount }
              setActiveChangeLog={ this.setActiveChangeLog }
              activeChangeLog={ this.state.activeChangeLog }
              applyFilters={ this.state.modalFilters }
              showFilterModal={ this.state.showFilterModal }
            />
            <Drawer
              className="listing-management__modal-container"
              placement="right"
              visible={ this.state.showFilterModal }
              destroyOnClose
              closable={ false }
              width="428px"
            >
              <FilterModal
                applyFilters={ this.state.modalFilters }
                filterTypeList={ this.filterTypeList }
                onClose={ () => { this.handleChangeLogModalFilter(false); } }
                onApply={ this.handleApplyModalFilter }
                t={ t }
                cmsUserList={ this.state.cmsUserList }
              />
            </Drawer>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

ListingManagement.propTypes = {
  property: PropTypes.object,
  t: PropTypes.func.isRequired,
  getPropertyDetail: PropTypes.func.isRequired,
  getChangeLogUserList: PropTypes.func.isRequired,
  getPropertyStatus: PropTypes.string,
  history: PropTypes.object,
  match: PropTypes.object,
  getChangeLogsStatus: PropTypes.string,
  getPropertyChangeLogs: PropTypes.func.isRequired,
  changeLogs: PropTypes.array,
  totalCount: PropTypes.number,
};

ListingManagement.defaultProps = {
  property: {},
  t: () => {},
  getPropertyDetail: () => {},
  getPropertyStatus: '',
  history: {},
  match: {},
  getChangeLogsStatus: '',
  getPropertyChangeLogs: () => {},
  getChangeLogUserList: () => {},
  changeLogs: [],
  totalCount: 0,
};
