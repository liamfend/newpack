import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Spin, Modal, message, Icon } from 'antd';
import Header from '~components/property-header';
import LeaveAlert from '~components/leave-alert';
import PropertyDetail from '~pages/dashboard/properties/listing-management/property-detail';
import NavigationBar from '~pages/dashboard/properties/listing-management/navigation-bar';
import AddressDetail from '~pages/dashboard/properties/listing-management/address-detail';
import FacilityDetail from '~pages/dashboard/properties/listing-management/facility-detail';
import RoomDetail from '~pages/dashboard/properties/listing-management/room-detail';
import ListingDetail from '~pages/dashboard/properties/listing-management/listing-detail';
import GalleryManagement from '~pages/dashboard/properties/listing-management/gallery-management';
import Reminder from '~pages/dashboard/properties/listing-management/pending-approval/reminder';
import generatePath from '~settings/routing';
import { communicationStatus, platformEntity, entityAction } from '~constants';
import { propertySections, propertyStatus } from '~constants/listing-management';
import { propertyDraftCategory, propertyDraftStatus } from '~constants/pending-approval';
import * as actions from '~actions/properties/listing-management';
import * as pendingApprovalActions from '~actions/pending-approval';
import { isEmptyObject } from '~helpers/property-edit';
import { fireCustomEvent } from '~helpers/custom-events';
import authControl from '~components/auth-control';
import { fetch } from '~helpers/graphql';
import * as queries from '~settings/queries';
import ReviewDraftModal from '~pages/dashboard/pending-approve/review-draft-modal';

const mapStateToProps = (state) => {
  const data = state.dashboard.listingManagement.toJS();

  return {
    publish: data.communication.publish.status,
    communication: data.communication,
    property: data.payload,
    copiedRoomListings: data.copiedRoomListings,
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyDetail: (slug, successCallback) => {
    dispatch(actions.getPropertyDetail(slug, successCallback));
  },
  publishProperty: (params, successCallback, errCallback) => {
    dispatch(actions.publishProperty(params, successCallback, errCallback));
  },
  setProperty: (property) => {
    dispatch(actions.setProperty(property));
  },
  getPropertyPreview: (slug, successCallback) => {
    dispatch(actions.getPropertyPreview(slug, successCallback));
  },
  deleteRoom: (id, successCallback) => {
    dispatch(actions.deleteRoom(id, successCallback));
  },
  createRoom: (params, successCallback) => {
    dispatch(actions.createRoom(params, successCallback));
  },
  updateRoom: (params, successCallback) => {
    dispatch(actions.updateRoom(params, successCallback));
  },
  setCopyRoomListing: (params) => {
    dispatch(actions.setCopyRoomListing(params));
  },
  deleteListing: (id, successCallback) => {
    dispatch(actions.deleteListing(id, successCallback));
  },
  createListing: (params, successCallback) => {
    dispatch(actions.createListing(params, successCallback));
  },
  updateListing: (params, successCallback) => {
    dispatch(actions.updateListing(params, successCallback));
  },
  bulkUpdateListings: (params, successCallback) => {
    dispatch(actions.bulkUpdateListings(params, successCallback));
  },
  updateGallery: (params, successCallback) => {
    dispatch(actions.updateGallery(params, successCallback));
  },
  expirePropertyDraft: (draftIds, successCallback) => {
    dispatch(pendingApprovalActions.expirePropertyDraft(draftIds, successCallback));
  },
  processPropertyDraft: (data, success) => {
    dispatch(pendingApprovalActions.processPropertyDraft(data, success));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withRouter
@withTranslation()
@authControl(
  platformEntity.PROPERTIES_PROPERTIES,
  entityAction.READ,
  props => generatePath('property.homepage', { propertySlug: props.match.params.propertySlug }),
)
export default class PropertyListingManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChanged: false,
      currentSection: propertySections.PROPERTY_DETAILS,
      isUpdateGallery: false,
      showReviewModal: false,
      currentSectionCategory: 'DETAIL',
      pendingDraftState: [],
      isCountinueNextStep: false,
    };
  }

  componentDidMount() {
    this.props.getPropertyDetail(decodeURIComponent(this.props.match.params.propertySlug), () => {
      if (isEmptyObject(this.props.property)) {
        this.props.history.push(generatePath('properties', {}));
      }
      if (this.props.property && this.props.property.drafts.edges) {
        this.initDraft(this.props.property.drafts.edges, true);
      }
    });

    window.onbeforeunload = () => {
      if (this.state.isChanged || this.state.isUpdateGallery) {
        return true;
      }
      return null;
    };

    fireCustomEvent('triggerCloseMenu');
  }

  initDraft = (drafts, isFromComponentDidMount = false, continueNextStep = () => {}) => {
    this.setState({ showReviewModal: false });
    const draft = drafts.map(item => item.node);
    const draftArray = draft.filter(item => item.status === 'PENDING') || [];

    // according to property status show draft review modal
    let showReviewModalState = false;
    if (this.props.property.status === 'PUBLISHED') {
      showReviewModalState = isFromComponentDidMount ? draftArray.length > 0 && draftArray[0].category === 'DETAIL' :
        draftArray.length > 0 && draftArray[0].category === this.state.currentSectionCategory;
    } else {
      showReviewModalState = draftArray.length > 0;
    }

    this.setState({
      pendingDraftState: draftArray,
      showReviewModal: showReviewModalState,
      isCountinueNextStep: !isFromComponentDidMount && !showReviewModalState,
    }, () => {
      if (this.state.isCountinueNextStep) {
        continueNextStep();
      }
    });
  }

  checkDraftReviewmodal = (continueNextStep = () => {}) => {
    fetch(queries.getPropertyDetail({ slug: this.props.property.slug })).then((res) => {
      if (res && res.property && res.property.drafts.edges) {
        if (res.property.drafts.edges.length > 0) {
          this.props.setProperty({
            property: res.property,
          });
          this.initDraft(res.property.drafts.edges, false, continueNextStep);
        } else {
          continueNextStep();
        }
      }
    });
  }

  handleSetChanged = (isChanged = true) => {
    this.setState({
      isChanged,
    });
  }

  handleSetUpdateGallery = (isUpdateGallery = true) => {
    this.setState({
      isUpdateGallery,
    });
  }

  handleSetSection = (section) => {
    const { t } = this.props;
    if (this.state.isChanged) {
      Modal.confirm({
        title: t('cms.properties.edit.leave_alert.title'),
        content: t('cms.property.listing_management.leave_alert.content'),
        cancelText: t('cms.form.pop_confirm.no'),
        okText: t('cms.form.pop_confirm.yes'),
        onOk: () => {
          this.setState({
            currentSection: section,
            isChanged: false,
          }, () => {
            this.showReviewModalLogic(section);
          });
        },
      });
    } else {
      this.setState({
        currentSection: section,
      }, () => {
        this.showReviewModalLogic(section);
      });
    }
  }

  showReviewModalLogic = (section) => {
    if (section === 'PROPERTY_DETAILS') {
      this.setState({
        showReviewModal: this.state.pendingDraftState.filter(item => item.category === 'DETAIL').length > 0,
        currentSectionCategory: 'DETAIL',
      });
    }
    if (section === 'GALLERY_MANAGEMENT') {
      this.setState({
        showReviewModal: this.state.pendingDraftState.filter(item => item.category === 'GALLERY').length > 0,
        currentSectionCategory: 'GALLERY',
      });
    }
  }

  handleSetNextSection = (updateParams) => {
    const sections = Object.keys(propertySections);
    const currentSectionIndex = sections.indexOf(this.state.currentSection);
    this.setState({
      isChanged: false,
      currentSection: currentSectionIndex === sections.length - 1
        ? this.state.currentSection : sections[currentSectionIndex + 1],
    });
    this.props.setProperty({
      property: updateParams,
    });

    if (updateParams.slug) {
      this.props.history.push(generatePath('property.edit', { propertySlug: updateParams.slug }));
    }
  };

  handlePreview = (callback) => {
    this.props.getPropertyPreview(
      decodeURIComponent(this.props.match.params.propertySlug),
      (res) => {
        callback(res.property);
      });
  }

  handlePublish = (isPublish = false, successCallback = () => {}) => {
    if (this.state.isChanged) {
      if (this.propertyDetail) {
        const promise = this.propertyDetail.handleSubmit();
        if (promise) {
          promise.then((res) => {
            if (res.isUpdated) {
              this.executePublishProperty(isPublish, successCallback);
            }
          });
        }
      }
      if (this.addressDetail) {
        const promise = this.addressDetail.handleSave();
        if (promise) {
          promise.then((res) => {
            if (res.isUpdated) {
              this.executePublishProperty(isPublish, successCallback);
            }
          });
        }
      }
      if (this.facilityDetail) {
        const promise = this.facilityDetail.handleSave();
        if (promise) {
          promise.then((res) => {
            if (res.isUpdated) {
              this.executePublishProperty(isPublish, successCallback);
            }
          });
        }
      }
      return;
    }

    if (this.state.isUpdateGallery) {
      if (this.galleryManagement) {
        this.galleryManagement.handleSubmit().then((res) => {
          if (res.isUpdated) {
            this.executePublishProperty(isPublish, successCallback);
          }
        });
      }
      return;
    }

    this.executePublishProperty(isPublish, successCallback);
  };

  landlordTipsModal = (isPublish) => {
    const { property, t } = this.props;

    if (property.landlord && property.landlord.bookingJourney === 'SEMI_AUTOMATIC' && isPublish) {
      Modal.confirm({
        className: 'property-listing-management__landlord-tips-modal',
        title: t('cms.property.listing_management.no_payment_plan.tips'),
        icon: <Icon type="exclamation-circle" theme="filled" />,
        okText: t('cms.property.listing_management.btn.got_it'),
        width: 380,
      });
    }
  }

  executePublishProperty = (isPublish, successCallback) => {
    const { property, t } = this.props;

    this.props.publishProperty({ publish: isPublish, id: property.id }, () => {
      successCallback();
      message.success(t(`cms.properties.edit.toast.${isPublish ? 'publish' : 'unpublish'}_success`));
      this.props.setProperty({
        property: { status: isPublish ? propertyStatus.PUBLISHED : propertyStatus.UNPUBLISHED },
      });
    }, () => {
      this.landlordTipsModal(isPublish);
    });
  };

  onGotoRoomConfig = () => {
    this.handleSetSection(propertySections.ROOM_CONFIG);
  }

  handleClearUnconfirmedListings = () => {
    this.props.setCopyRoomListing([]);
  }

  getCategoryRejectedDrafts = (currentSection) => {
    const { property } = this.props;

    if (
      !property ||
      !property.drafts ||
      property.drafts.edges.length === 0
    ) {
      return [];
    }

    const propertyDrafts = property.drafts.edges.map(draft => draft.node);

    if (currentSection === propertySections.PROPERTY_DETAILS) {
      const detailRejectDraft = propertyDrafts.filter(draft =>
        draft.category === propertyDraftCategory.DETAIL &&
         draft.status === propertyDraftStatus.REJECTED);

      return detailRejectDraft;
    }

    if (currentSection === propertySections.GALLERY_MANAGEMENT) {
      const galleryRejectDrafts = propertyDrafts.filter(draft =>
        draft.category === propertyDraftCategory.GALLERY &&
        draft.status === propertyDraftStatus.REJECTED);

      return galleryRejectDrafts;
    }

    return [];
  }

  handleClickReviewDraftModal = () => {
    this.setState({ showReviewModal: false });
  }

  render() {
    const { t, property, communication, copiedRoomListings, processPropertyDraft } = this.props;
    const { currentSection, showReviewModal, currentSectionCategory } = this.state;
    const categoryRejectedDrafts = this.getCategoryRejectedDrafts(currentSection);

    return (
      <div className="property-listing-management">
        <LeaveAlert
          history={ this.props.history }
          t={ t }
          when={ this.state.isChanged || copiedRoomListings.length > 0 }
          onConfirmLeavePage={ this.handleClearUnconfirmedListings }
        />
        <Choose>
          <When
            condition={ communication.getDetail.status !== communicationStatus.IDLE || !property }
          >
            <div className="property-edit property-listing-management__loading">
              <Spin />
            </div>
          </When>
          <Otherwise>
            <Header
              t={ t }
              property={ property }
              type="listing-management"
            />
            <div className="property-listing-management__main-wrap">
              <NavigationBar
                t={ t }
                property={ property }
                currentSection={ currentSection }
                handleSetSection={ this.handleSetSection }
                publishStatus={ communication.publish.status }
                handlePreview={ this.handlePreview }
                handlePublish={ this.handlePublish }
                isHaveUnconfirmedListing={ this.props.copiedRoomListings.length > 0 }
                history={ this.props.history }
                onClearUnconfirmedListings={ this.handleClearUnconfirmedListings }
              />
              <div className="property-listing-management__right">
                <If condition={ categoryRejectedDrafts.length > 0 }>
                  <div className="property-listing-management__part-reminder">
                    <Reminder
                      t={ t }
                      draft={ categoryRejectedDrafts[0] }
                    />
                  </div>
                </If>
                <Choose>
                  <When condition={ currentSection === propertySections.PROPERTY_DETAILS }>
                    <PropertyDetail
                      t={ t }
                      property={ property }
                      onChange={ this.handleSetChanged }
                      afterSave={ this.handleSetNextSection }
                      onRef={ (node) => { this.propertyDetail = node; } }
                      rejectedDraftIds={ categoryRejectedDrafts.map(draft => draft.id) }
                      expirePropertyDraft={ this.props.expirePropertyDraft }
                      checkDraftReviewmodal={ this.checkDraftReviewmodal }
                    />
                  </When>
                  <When condition={ currentSection === propertySections.PROPERTY_ADDRESS }>
                    <AddressDetail
                      t={ t }
                      property={ property }
                      onChange={ this.handleSetChanged }
                      afterSave={ this.handleSetNextSection }
                      onRef={ (node) => { this.addressDetail = node; } }
                    />
                  </When>
                  <When condition={ currentSection === propertySections.PROPERTY_FACILITY }>
                    <FacilityDetail
                      t={ t }
                      property={ property }
                      onChange={ this.handleSetChanged }
                      afterSave={ this.handleSetNextSection }
                      onRef={ (node) => { this.facilityDetail = node; } }
                    />
                  </When>
                  <When condition={ currentSection === propertySections.ROOM_CONFIG }>
                    <RoomDetail
                      t={ t }
                      property={ property }
                      onChange={ this.handleSetChanged }
                      afterSave={ this.handleSetNextSection }
                      deleteRoom={ this.props.deleteRoom }
                      createRoom={ this.props.createRoom }
                      updateRoom={ this.props.updateRoom }
                      setProperty={ this.props.setProperty }
                      setCopyRoomListing={ this.props.setCopyRoomListing }
                      copiedRoomListings={ this.props.copiedRoomListings }
                      communication={ communication }
                    />
                  </When>
                  <When condition={ currentSection === propertySections.PRICE_AND_AVAILABILITY }>
                    <ListingDetail
                      t={ t }
                      property={ property }
                      onChange={ this.handleSetChanged }
                      copiedRoomListings={ this.props.copiedRoomListings }
                      deleteListing={ this.props.deleteListing }
                      createListing={ this.props.createListing }
                      updateListing={ this.props.updateListing }
                      bulkUpdateListings={ this.props.bulkUpdateListings }
                      setCopyRoomListing={ this.props.setCopyRoomListing }
                      setProperty={ this.props.setProperty }
                    />
                  </When>
                </Choose>
                <GalleryManagement
                  t={ t }
                  property={ property }
                  onRef={ (node) => { this.galleryManagement = node; } }
                  handleGotoRoomConfig={ this.onGotoRoomConfig }
                  updateGallery={ this.props.updateGallery }
                  setProperty={ this.props.setProperty }
                  onSetUpdateGallery={ this.handleSetUpdateGallery }
                  isHidden={ currentSection !== propertySections.GALLERY_MANAGEMENT }
                  checkDraftReviewmodal={ this.checkDraftReviewmodal }
                />
              </div>
            </div>
          </Otherwise>
        </Choose>

        <If condition={ showReviewModal }>
          <ReviewDraftModal
            activeModal
            t={ t }
            onClose={ this.handleClickReviewDraftModal }
            originalData={ property }
            processPropertyDraft={ processPropertyDraft }
            draftsCategory={ [currentSectionCategory] }
            isShowCloseBtn={ false }
          />
        </If>
      </div>
    );
  }
}

PropertyListingManagement.propTypes = {
  t: PropTypes.func.isRequired,
  history: PropTypes.object,
  getPropertyDetail: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      propertySlug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  property: PropTypes.object,
  publishProperty: PropTypes.func.isRequired,
  setProperty: PropTypes.func.isRequired,
  communication: PropTypes.object,
  getPropertyPreview: PropTypes.func.isRequired,
  deleteRoom: PropTypes.func.isRequired,
  createRoom: PropTypes.func,
  updateRoom: PropTypes.func,
  setCopyRoomListing: PropTypes.func,
  copiedRoomListings: PropTypes.array,
  deleteListing: PropTypes.func,
  createListing: PropTypes.func,
  updateListing: PropTypes.func,
  bulkUpdateListings: PropTypes.func,
  updateGallery: PropTypes.func,
  expirePropertyDraft: PropTypes.func,
  processPropertyDraft: PropTypes.func,
};

PropertyListingManagement.defaultProps = {
  t: () => {},
  history: {},
  getPropertyDetail: () => {},
  match: {
    params: {
      propertySug: '',
    },
  },
  property: {},
  publishProperty: () => {},
  setProperty: () => {},
  communication: {},
  getPropertyPreview: () => {},
  deleteRoom: () => {},
  copiedRoomListings: [],
  setCopyRoomListing: () => {},
  createRoom: () => {},
  updateRoom: () => {},
  deleteListing: () => {},
  createListing: () => {},
  updateListing: () => {},
  bulkUpdateListings: () => {},
  updateGallery: () => {},
  expirePropertyDraft: () => {},
  processPropertyDraft: () => {},
};
