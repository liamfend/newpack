import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import * as editActions from '~actions/properties/property-edit';
import HomepageCard from '~pages/dashboard/properties/homepage/homepage-card';
import generatePath from '~settings/routing';
import Header from '~components/property-header';
import { Spin } from 'antd';
import { communicationStatus, platformEntity, entityAction, draftType } from '~constants';
import showElementByAuth from '~helpers/auth';
import { isEmptyObject } from '~helpers/property-edit';

const mapStateToProps = (state) => {
  const propertyData = state.dashboard.listingManagement.toJS();
  const draft = state.dashboard.pendingApproval.toJS();

  return {
    property: propertyData.payload,
    getPropertyStatus: propertyData.communication.getDetail.status,
    rejectCommunication: draft.communication.reject.status,
    approvalCommunication: draft.communication.approval.status,
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyDetail: (id, successCallback) => {
    dispatch(editActions.getPropertyDetail(id, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class PropertyHomepage extends React.Component {
  constructor() {
    super();
    this.propertyManagement = [
      'listing_management', 'commission_management',
      'stage_record', 'deposit_and_fees',
      'terms',
    ];
    this.functionEntityMapping = {
      listing_management: platformEntity.PROPERTIES_PROPERTIES,
      commission_management: platformEntity.COMMISSION_COMISSION_TIERS,
      deposit_and_fees: platformEntity.PAYMENTS_LINE_ITEM_RULES,
      stage_record: platformEntity.PROPERTIES_PROPERTIES_CONTRACTS,
      terms: platformEntity.PROPERTIES_TERMS,
    };
    this.administratorSettings = ['change_log', 'reference_and_contact'];
  }

  componentDidMount() {
    this.props.getPropertyDetail(decodeURIComponent(this.props.match.params.propertySlug), () => {
      if (isEmptyObject(this.props.property)) {
        this.props.history.push(generatePath('properties', {}));
      }
    });
  }

  componentDidUpdate(preProp) {
    if (preProp.match.params.propertySlug !== this.props.match.params.propertySlug) {
      this.props.getPropertyDetail(decodeURIComponent(this.props.match.params.propertySlug));
    }
  }

  redirectToEditPage = (item) => {
    let url = null;
    const { propertySlug } = this.props.match.params;

    if (item === 'listing_management') {
      url = generatePath('property.edit', { propertySlug });
      this.props.history.push(url);
    }

    if (item === 'commission_management') {
      url = generatePath('property.commission', { propertySlug });
      this.props.history.push(url);
    }

    if (item === 'stage_record') {
      url = generatePath('property.record', { propertySlug });
      this.props.history.push(url);
    }

    if (item === 'deposit_and_fees') {
      url = generatePath('property.depositAndFees', { propertySlug });
      this.props.history.push(url);
    }

    if (item === 'terms') {
      url = generatePath('property.terms', { propertySlug });
      this.props.history.push(url);
    }

    if (item === 'reference_and_contact') {
      url = generatePath('property.referenceAndContact', { propertySlug });
      this.props.history.push(url);
    }

    if (item === 'change_log') {
      url = generatePath('property.changeLog', { propertySlug });
      this.props.history.push(url);
    }

    return null;
  }

  successCallback = () => {
    this.props.getPropertyDetail(decodeURIComponent(this.props.match.params.propertySlug), () => {
      const { drafts } = this.props.property;
      if (drafts.edges.length !== 0 && drafts.edges[0].node.status !== draftType.APPROVED) {
        this.props.initProperty(drafts.edges[0].node.changes);
      }
    });
  }

  toggleReviewDraftModal = () => {
    this.setState({
      isShowReviewDraftModal: !this.state.isShowReviewDraftModal,
    });
  }

  render() {
    const {
      t, property, getPropertyStatus,
    } = this.props;
    const management =
      property && property.landlord && property.landlord.bookingJourney === 'SEMI_AUTOMATIC' ?
        this.propertyManagement.filter(item => item !== 'deposit_and_fees')
        : this.propertyManagement;
    return (
      <div className="property-homepage">
        <Choose>
          <When condition={ getPropertyStatus !== communicationStatus.IDLE } >
            <div className="property-edit__loading"><Spin /></div>
          </When>
          <Otherwise>
            <Header t={ t } property={ property } type="homepage" />
            <div className="property-homepage__content">
              <h2 className="property-homepage__title">
                { t('cms.properties.homepage.property_management.title') }
              </h2>
              <For of={ management } each="item" index="index">
                <If
                  condition={ this.functionEntityMapping[item] ?
                    showElementByAuth(this.functionEntityMapping[item], entityAction.READ) : true }
                  key={ item }
                >
                  <button
                    className={ classNames('property-homepage__link', {
                      'property-homepage__link--even': index % 2 === 0,
                    }) }
                    onClick={ () => { this.redirectToEditPage(item); } }
                    key={ item }
                  >
                    <HomepageCard t={ this.props.t } type={ item } />
                  </button>
                </If>
              </For>

              <h2 className="property-homepage__title property-homepage__property-settings">
                { t('cms.properties.homepage.property_settings.title') }
              </h2>
              <For of={ this.administratorSettings } each="item" index="index">
                <button
                  className={ classNames('property-homepage__link', {
                    'property-homepage__link--even': index % 2 === 0,
                  }) }
                  onClick={ () => { this.redirectToEditPage(item); } }
                  key={ item }
                >
                  <HomepageCard t={ this.props.t } type={ item } key={ index } />
                </button>
              </For>
              <div className="property-homepage__clear-both" />
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

PropertyHomepage.propTypes = {
  t: PropTypes.func.isRequired,
  match: PropTypes.object,
  history: PropTypes.object.isRequired,
  getPropertyDetail: PropTypes.func,
  property: PropTypes.object,
  getPropertyStatus: PropTypes.string,
  initProperty: PropTypes.func,
};

PropertyHomepage.defaultProps = {
  t: () => {},
  match: {},
  getPropertyDetail: () => {},
  property: {},
  getPropertyStatus: '',
  initProperty: () => {},
};
