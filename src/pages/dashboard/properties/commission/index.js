import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import * as commissionActions from '~actions/properties/commission';
import { Spin } from 'antd';
import getEnvironment, { environments } from '~base/global/helpers/environment';
import { getItem } from '~base/global/helpers/storage';
import CommissionFormModal from '~pages/dashboard/properties/commission/commission-form-modal';
import CommissionList from '~pages/dashboard/properties/commission/commission-list';
import CommissionEmpty from '~pages/dashboard/properties/commission/commission-empty';
import CreateCommission from '~pages/dashboard/properties/commission/create-commission';
import LeaveAlert from '~components/leave-alert';
import Header from '~components/property-header';
import { communicationStatus, platformEntity, entityAction } from '~constants';
import { isInternalRole } from '~helpers/auth';
import authControl from '~components/auth-control';
import generatePath from '~settings/routing';


const mapStateToProps = (state) => {
  const data = state.dashboard.commissionReducer.toJS();

  return {
    property: data.propertyCommissionTiers,
    getPropertyStatus: data.communication.propertyCommissionTiers.status,
    commissionTiers: data.propertyCommissionTiers && data.propertyCommissionTiers.commissionTiers,
    createStatus: data.communication.create.status,
    updateStatus: data.communication.update.status,
    deleteStatus: data.communication.delete.status,
    bulkCreateStatus: data.communication.bulkCreate.status,
    landlordProperties: data.landlordProperties,
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyCommissionTiers: (id, successCallback) => {
    dispatch(commissionActions.getPropertyCommissionTiers(id, successCallback));
  },
  getLandlordProperties: (slug, successCallback) => {
    dispatch(commissionActions.getLandlordProperties(slug, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.COMMISSION_COMISSION_TIERS, entityAction.READ, props => generatePath('property.homepage', { propertySlug: props.match.params.propertySlug }))
export default class PropertyCommission extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      commissionCategory: null,
      modalType: 'addNew',
      correlationId: null,
      showCommissionModal: false,
    };
  }

  componentDidMount() {
    this.props.getPropertyCommissionTiers(
      decodeURIComponent(this.props.match.params.propertySlug), () => {
        if (!this.props.property) {
          this.props.history.push(generatePath('properties', {}));
        }

        if (this.props.property && this.props.property.landlord) {
          this.props.getLandlordProperties(this.props.property.landlord.slug);
        }
      });
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.createStatus === communicationStatus.IDLE
      && prevProps.createStatus === communicationStatus.FETCHING)
      || (this.props.updateStatus === communicationStatus.IDLE
      && prevProps.updateStatus === communicationStatus.FETCHING)
      || (this.props.deleteStatus === communicationStatus.IDLE
      && prevProps.deleteStatus === communicationStatus.FETCHING)
      || (this.props.bulkCreateStatus === communicationStatus.IDLE
      && prevProps.bulkCreateStatus === communicationStatus.FETCHING)
    ) {
      this.props.getPropertyCommissionTiers(
        decodeURIComponent(this.props.match.params.propertySlug),
      );
    }
  }

  generatePropertyUrl = (property) => {
    const path = `${property.city && property.city.country && property.city.country.slug ?
      property.city.country.slug : ''}/${property.city && property.city.slug ?
      property.city.slug : ''}/p/${property.slug}`;

    if (getEnvironment() === environments.PROD) {
      return `//www.student.com/${path}`;
    }
    return `//hurricane-www.dandythrust.com/${path}`;
  };

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
    }
    return result;
  }

  checkcommissionCategory = (type) => {
    this.setState({
      commissionCategory: type,
    });
  }

  createCommission = () => {
    this.setState({
      showCommissionModal: !this.state.showCommissionModal,
    });
  }

  openModal = (type, commissionTier) => {
    this.setState({
      showCommissionModal: true,
      modalType: type,
      correlationId: commissionTier ? commissionTier.id : null,
      commissionCategory:
      (type === 'addNew' || type === 'copy') && commissionTier ?
        commissionTier.category : null,
    });
  }

  render() {
    const { t, property, getPropertyStatus, commissionTiers, landlordProperties } = this.props;

    return (
      <div className="property-commission">
        <LeaveAlert
          history={ this.props.history }
          t={ t }
          when={ this.state.showCommissionModal }
        />
        <Choose>
          <When condition={ getPropertyStatus !== communicationStatus.IDLE } >
            <div className="property-edit__loading"><Spin /></div>
          </When>
          <Otherwise>
            <Header
              t={ t }
              property={ property }
              type="commission"
            />
            <div className="property-commission__page">
              <If condition={ commissionTiers && commissionTiers.length === 0 }>
                <If condition={ isInternalRole() }>
                  <div className="property-commission__content-create">
                    <h3 className="property-commission__content-title">
                      { t('cms.property.commission.create.title.text') }
                    </h3>
                    <CreateCommission
                      t={ t }
                      property={ property }
                      commissionCategory={ this.state.commissionCategory }
                      oncommissionCategory={ this.checkcommissionCategory }
                      createCommission={ this.createCommission }
                    />
                  </div>
                </If>
                <If condition={ !isInternalRole() }>
                  <CommissionEmpty t={ t } />
                </If>
              </If>

              <If condition={ commissionTiers && commissionTiers.length > 0 }>
                <CommissionList
                  openModal={ this.openModal }
                  commissionTier={ property.commissionTiers }
                  t={ t }
                  currency={ property.currency }
                />
              </If>
              <If condition={ this.state.showCommissionModal }>
                <CommissionFormModal
                  activeModal
                  t={ t }
                  property={ property }
                  commissionTiers={ commissionTiers }
                  onClose={ this.createCommission }
                  commissionCategory={ this.state.commissionCategory }
                  oncommissionCategory={ this.checkcommissionCategory }
                  modalType={ this.state.modalType.toString() }
                  correlationId={ this.state.correlationId }
                  openModal={ this.openModal }
                  landlordProperties={ landlordProperties }
                />
              </If>
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

PropertyCommission.propTypes = {
  t: PropTypes.func,
  match: PropTypes.object,
  property: PropTypes.object,
  getPropertyCommissionTiers: PropTypes.func,
  history: PropTypes.object,
  getPropertyStatus: PropTypes.string,
  commissionTiers: PropTypes.array,
  createStatus: PropTypes.string,
  updateStatus: PropTypes.string,
  deleteStatus: PropTypes.string,
  getLandlordProperties: PropTypes.func.isRequired,
  landlordProperties: PropTypes.array,
  bulkCreateStatus: PropTypes.string,
};

PropertyCommission.defaultProps = {
  match: {},
  history: {},
  property: {},
  t: () => {},
  getPropertyCommissionTiers: () => {},
  getPropertyStatus: '',
  commissionTiers: [],
  createStatus: '',
  updateStatus: '',
  deleteStatus: '',
  getLandlordProperties: () => {},
  landlordProperties: [],
  bulkCreateStatus: '',
};
