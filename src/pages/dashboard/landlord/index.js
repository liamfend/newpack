import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import queryString from 'query-string';
import { Button } from 'antd';
import authControl from '~components/auth-control';
import LandlordTable from '~pages/dashboard/landlord/table';
import LandlordModal from '~pages/dashboard/landlord/modal';
import { mergeSearchParams } from '~helpers/history';
import * as landlordActions from '~actions/landlord';
import { platformEntity, entityAction } from '~constants';
import { setItem } from '~base/global/helpers/storage';
import showElementByAuth from '~helpers/auth';

const mapStateToProps = state => ({
  landlords: state.dashboard.landlord.toJS().payload.list,
  landlordCount: state.dashboard.landlord.toJS().payload.totalCount,
  getLandlordsStatus: state.dashboard.landlord.toJS().communication.list.status,
  createLandlordStatus: state.dashboard.landlord.toJS().communication.create.status,
  accountOwners: state.dashboard.landlord.toJS().accountOwners,
  currentRoleSlug: state.auth.get('auth').currentRoleSlug,
});

const mapDispatchToProps = dispatch => ({
  getLandlords: (params) => {
    dispatch(landlordActions.getLandlords(params));
  },
  searchLandlordList: (successCallback) => {
    dispatch(landlordActions.searchLandlordList(successCallback));
  },
  setCurrentLandlord: (landlord) => {
    dispatch(landlordActions.setCurrentLandlord(landlord));
  },
  createLandlord: (params, successCallbacks) => {
    dispatch(landlordActions.createLandlord(params, successCallbacks));
  },
  getAccountOwners: (params, successCallback) => {
    dispatch(landlordActions.getAccountOwners(params, successCallback));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.LANDLORDS_LANDLORDS, entityAction.READ)
export default class LandlordManagement extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSearchParams = {
      pageNumber: 1,
      pageSize: 10,
    };
    const {
      pageNumber,
      pageSize,
      landlordSlugs,
      billingCountry,
    } = queryString.parse(props.location.search);
    this.state = {
      filters: Object.assign({
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : this.defaultSearchParams.pageNumber,
        pageSize: pageSize ? parseInt(pageSize, 10) : this.defaultSearchParams.pageSize,
        landlordSlugs: this.formatQueryParam(landlordSlugs),
        billingCountry: this.formatQueryParam(billingCountry),
      }),
      landlordNameList: [],
      isShowModal: false,
    };
  }

  componentDidMount() {
    this.initLandlords();
    this.props.searchLandlordList((res) => {
      this.setState({
        landlordNameList: res.search.edges.map(landlord => landlord.node),
      });
    });
  }

  formatQueryParam = (query) => {
    if (!query) {
      return [];
    }
    if (typeof query === 'string') {
      return [query];
    }
    if (Array.isArray(query)) {
      return query;
    }

    return [];
  }

  handleSetFilters = (filter) => {
    this.setState({
      filters: Object.assign(this.state.filters, filter),
    }, () => {
      this.props.history.push(mergeSearchParams(this.state.filters, this.defaultSearchParams));
      this.initLandlords();
    });
  };

  initLandlords = () => {
    const params = Object.assign({}, this.state.filters);
    if (params.landlordSlugs) {
      params.slugs = params.landlordSlugs;
      delete params.landlordSlugs;
    }
    this.props.getLandlords(params);

    const currentFilter =
      queryString.parse(mergeSearchParams(this.state.filters, this.defaultSearchParams));
    setItem('cms_landlords_list_filters', currentFilter);
  };

  handleClickCreateLandlord = () => {
    this.setState({
      isShowModal: true,
    });
  };

  handleCloseModal = () => {
    this.setState({
      isShowModal: false,
    });
  };

  updateLandlordList = () => {
    this.setState({
      landlordNameList: [...this.state.landlordNameList],
    });
  };

  render() {
    const {
      t,
      landlords,
      landlordCount,
      getLandlordsStatus,
      createLandlordStatus,
    } = this.props;
    return (
      <div className="landlord-management">
        <div className="landlord-management__header">
          <span className="landlord-management__count">
            {
              t('cms.landlord.count', {
                number: landlordCount,
              })
            }
          </span>
          <If condition={ showElementByAuth(
            platformEntity.LANDLORDS_LANDLORDS,
            entityAction.CREATE,
          ) }
          >
            <Button
              type="primary"
              size="large"
              onClick={ this.handleClickCreateLandlord }
            >
              { t('cms.landlord.add_new_landlord.button') }
            </Button>
          </If>
        </div>
        <LandlordTable
          t={ t }
          landlords={ landlords }
          filters={ this.state.filters }
          landlordCount={ landlordCount }
          getLandlordsStatus={ getLandlordsStatus }
          handleSetFilters={ this.handleSetFilters }
          landlordNameList={ this.state.landlordNameList }
          history={ this.props.history }
          setCurrentLandlord={ this.props.setCurrentLandlord }
          updateLandlordList={ this.updateLandlordList }
        />
        <If condition={ this.state.isShowModal }>
          <LandlordModal
            activeModal
            t={ t }
            type="create"
            handleCloseModal={ this.handleCloseModal }
            createLandlord={ this.props.createLandlord }
            confirmStatus={ createLandlordStatus }
            initLandlords={ this.initLandlords }
            landlordNameList={ this.state.landlordNameList }
            accountOwners={ this.props.accountOwners }
            getAccountOwners={ this.props.getAccountOwners }
            currentRoleSlug={ this.props.currentRoleSlug }
          />
        </If>
      </div>
    );
  }
}

LandlordManagement.propTypes = {
  t: PropTypes.func.isRequired,
  landlords: PropTypes.array.isRequired,
  landlordCount: PropTypes.number.isRequired,
  getLandlordsStatus: PropTypes.string.isRequired,
  getLandlords: PropTypes.func.isRequired,
  searchLandlordList: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  setCurrentLandlord: PropTypes.func.isRequired,
  createLandlord: PropTypes.func.isRequired,
  createLandlordStatus: PropTypes.string.isRequired,
  accountOwners: PropTypes.array,
  getAccountOwners: PropTypes.func,
  currentRoleSlug: PropTypes.string,
};

LandlordManagement.defaultProps = {
  t: () => {},
  landlords: [],
  landlordCount: 0,
  getLandlordsStatus: '',
  getLandlords: () => {},
  searchLandlordList: () => {},
  history: {
    push: () => {},
  },
  location: {
    search: '',
  },
  setCurrentLandlord: () => {},
  createLandlord: () => {},
  createLandlordStatus: '',
  accountOwners: [],
  getAccountOwners: () => {},
  currentRoleSlug: '',
};
