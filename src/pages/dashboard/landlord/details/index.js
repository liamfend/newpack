import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';
import authControl from '~components/auth-control';
import LandlordHeader from '~pages/dashboard/landlord/details/header';
import LandlordDetail from '~pages/dashboard/landlord/details/detail';
import LandlordContact from '~pages/dashboard/landlord/details/contact';
import LandlordPropertyRelated from '~pages/dashboard/landlord/details/property-related';
import generatePath from '~settings/routing';
import { landlordDetailTabs } from '~constants/landlord';
import { communicationStatus, platformEntity, entityAction } from '~constants';
import * as landlordActions from '~actions/landlord';


const mapStateToProps = state => ({
  landlord: state.dashboard.landlord.toJS().current,
  getLandlordStatus: state.dashboard.landlord.toJS().communication.current.status,
  updateLandlordStatus: state.dashboard.landlord.toJS().communication.update.status,
  propertiesOfLandlord: state.dashboard.landlord.toJS().properties.list,
  propertiesOfLandlordCount: state.dashboard.landlord.toJS().properties.totalCount,
  propertyListStatus: state.dashboard.landlord.toJS().communication.propertyList.status,
  currentRoleSlug: state.auth.toJS().auth.currentRoleSlug,
  accountOwners: state.dashboard.landlord.toJS().accountOwners,
  getAccountOwnersStatus: state.dashboard.landlord.toJS().communication.getAccountOwners.status,
});

const mapDispatchToProps = dispatch => ({
  getLandlord: (slug, successCallback) => {
    dispatch(landlordActions.getLandlord(slug, successCallback));
  },
  setPreparedContract: (payload) => {
    dispatch(landlordActions.setPreparedContract(payload));
  },
  updateLandlord: (params, successCallback) => {
    dispatch(landlordActions.updateLandlord(params, successCallback));
  },
  setCurrentLandlord: (landlord) => {
    dispatch(landlordActions.setCurrentLandlord(landlord));
  },
  searchLandlordList: (successCallback) => {
    dispatch(landlordActions.searchLandlordList(successCallback));
  },
  getPropertiesByLandlordSlug: (params) => {
    dispatch(landlordActions.getPropertiesByLandlordSlug(params));
  },
  setPropertiesOfLandlord: (properties) => {
    dispatch(landlordActions.setPropertiesOfLandlord(properties));
  },
  searchPropertyNameList: (params, successCallback) => {
    dispatch(landlordActions.searchPropertyNameList(params, successCallback));
  },
  getDisplayCountryList: (successCallback) => {
    dispatch(landlordActions.getDisplayCountryList(successCallback));
  },
  bindAutoConfirmSettings: (params, successCallback) => {
    dispatch(landlordActions.bindAutoConfirmSettings(params, successCallback));
  },
  getAccountOwners: (params, successCallback) => {
    dispatch(landlordActions.getAccountOwners(params, successCallback));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.LANDLORDS_LANDLORDS, entityAction.READ)
export default class LandlordDetails extends React.Component {
  constructor() {
    super();
    this.state = {
      activeTab: landlordDetailTabs.DETAILS,
    };
  }

  componentDidMount() {
    const { landlordSlug } = this.props.match.params;
    this.getLandlord(landlordSlug);
    // for judge landlord name is exist
    this.props.searchLandlordList((res) => {
      this.setState({
        landlordNameList: res.search.edges.map(landlord => landlord.node),
      });
    });
  }

  getLandlord = (slug) => {
    this.props.getLandlord(slug, (landlord) => {
      if (landlord) {
        this.props.setCurrentLandlord(landlord);
        this.props.setPropertiesOfLandlord(landlord);
      } else {
        this.props.history.push(generatePath('landlords', {}));
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.currentRoleSlug !== 'content_manager_level_2' &&
      this.props.currentRoleSlug === 'content_manager_level_2'
    ) {
      this.setActiveTab(landlordDetailTabs.DETAILS);
    }
  }

  setActiveTab = (tab) => {
    this.setState({
      activeTab: tab,
    });
  };

  gotoCreateProperty = () => {
    const { name, slug, id } = this.props.landlord;
    this.props.history.push(generatePath('property.create'), {
      landlord: {
        name,
        slug,
        id,
      },
    });
  };

  render() {
    const {
      t,
      landlord,
      getLandlordStatus,
      updateLandlordStatus,
      propertiesOfLandlord,
      propertyListStatus,
      propertiesOfLandlordCount,
    } = this.props;
    return (
      <div className="landlord-details">
        <Choose>
          <When condition={ getLandlordStatus !== communicationStatus.IDLE }>
            <div className="landlord-details__loading">
              <Spin />
            </div>
          </When>
          <When condition={ landlord }>
            <LandlordHeader
              t={ t }
              landlord={ landlord }
              handleSetActiveTab={ this.setActiveTab }
              history={ this.props.history }
              setPreparedContract={ this.props.setPreparedContract }
            />
            <Choose>
              <When condition={ this.state.activeTab === landlordDetailTabs.DETAILS }>
                <LandlordDetail
                  t={ t }
                  landlord={ landlord }
                  updateLandlord={ this.props.updateLandlord }
                  updateLandlordStatus={ updateLandlordStatus }
                  setCurrentLandlord={ this.props.setCurrentLandlord }
                  landlordNameList={ this.state.landlordNameList }
                  bindAutoConfirmSettings={ this.props.bindAutoConfirmSettings }
                  getLandlord={ this.getLandlord }
                  accountOwners={ this.props.accountOwners }
                  getAccountOwners={ this.props.getAccountOwners }
                  currentRoleSlug={ this.props.currentRoleSlug }
                  isGettingAccountOwners={
                    this.props.getAccountOwnersStatus === communicationStatus.FETCHING
                  }
                />
              </When>
              <When condition={ this.state.activeTab === landlordDetailTabs.CONTACT }>
                <LandlordContact
                  t={ t }
                  landlord={ landlord }
                  updateLandlord={ this.props.updateLandlord }
                  updateLandlordStatus={ updateLandlordStatus }
                  setCurrentLandlord={ this.props.setCurrentLandlord }
                  landlordNameList={ this.state.landlordNameList }
                />
              </When>
              <When condition={ this.state.activeTab === landlordDetailTabs.PROPERTY_RELATED }>
                <LandlordPropertyRelated
                  t={ t }
                  properties={ propertiesOfLandlord }
                  handleCreateProperty={ this.gotoCreateProperty }
                  activePropertiesCount={ propertiesOfLandlordCount }
                  getPropertiesByLandlordSlug={ this.props.getPropertiesByLandlordSlug }
                  landlordSlug={ landlord.slug }
                  isLoading={ propertyListStatus === communicationStatus.FETCHING }
                  searchPropertyNameList={ this.props.searchPropertyNameList }
                  getDisplayCountryList={ this.props.getDisplayCountryList }
                />
              </When>
            </Choose>
          </When>
        </Choose>
      </div>
    );
  }
}

LandlordDetails.propTypes = {
  t: PropTypes.func.isRequired,
  landlord: PropTypes.object,
  getLandlord: PropTypes.func.isRequired,
  getLandlordStatus: PropTypes.string.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  setPreparedContract: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      landlordSlug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  updateLandlord: PropTypes.func.isRequired,
  updateLandlordStatus: PropTypes.string.isRequired,
  setCurrentLandlord: PropTypes.func.isRequired,
  searchLandlordList: PropTypes.func.isRequired,
  getPropertiesByLandlordSlug: PropTypes.func.isRequired,
  setPropertiesOfLandlord: PropTypes.func.isRequired,
  propertiesOfLandlord: PropTypes.array,
  propertyListStatus: PropTypes.string.isRequired,
  propertiesOfLandlordCount: PropTypes.number,
  searchPropertyNameList: PropTypes.func.isRequired,
  getDisplayCountryList: PropTypes.func.isRequired,
  currentRoleSlug: PropTypes.string,
  bindAutoConfirmSettings: PropTypes.func.isRequired,
  accountOwners: PropTypes.array,
  getAccountOwners: PropTypes.func,
  getAccountOwnersStatus: PropTypes.string,
};

LandlordDetails.defaultProps = {
  t: () => {},
  landlord: {},
  getLandlord: () => {},
  getLandlordStatus: '',
  history: {
    push: () => {},
  },
  setPreparedContract: () => {},
  match: {
    params: {
      landlordSlug: '',
    },
  },
  updateLandlord: () => {},
  updateLandlordStatus: '',
  setCurrentLandlord: () => {},
  searchLandlordList: () => {},
  getPropertiesByLandlordSlug: () => {},
  setPropertiesOfLandlord: () => {},
  propertiesOfLandlord: [],
  propertyListStatus: '',
  propertiesOfLandlordCount: 0,
  searchPropertyNameList: () => {},
  getDisplayCountryList: () => {},
  currentRoleSlug: '',
  bindAutoConfirmSettings: () => {},
  accountOwners: [],
  getAccountOwners: () => {},
  getAccountOwnersStatus: '',
};
