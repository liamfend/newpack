import React from 'react';
import { Tabs, Icon, Spin, Button, message, Modal } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';
import moment from 'moment';
import DetailTab from '~pages/dashboard/properties/edit/detailTab';
import * as actions from '~actions/properties/property-edit';
import * as draftActions from '~actions/pending-approval';
import { communicationStatus, platformEntity, entityAction, draftType } from '~constants';
import FacilitiesTab from '~pages/dashboard/properties/edit/facilitiesTab';
import AddressTab from '~pages/dashboard/properties/edit/address-tab';
import ListingsTab from '~pages/dashboard/properties/edit/listings-tab';
import RoomsTab from '~pages/dashboard/properties/edit/rooms-tab';
import GalleryTab from '~pages/dashboard/properties/edit/gallery-tab';
import PropertyReviewModal from '~components/property-review';
import LeaveAlert from '~components/leave-alert';
import { isEditedFieldsAllValid, hasUnsavedData, formatPreviewData, isEmptyObject } from '~helpers/property-edit';
import MiniUploadingModal from '~components/property-gallery/mini-uploading-modal';
import Header from '~components/property-header';
import PendingApproveSuccess from '~pages/dashboard/properties/edit/pending-approve-success';
import ReviewDraftModal from '~pages/dashboard/pending-approve/review-draft-modal';
import showElementByAuth, { isLandlordRole } from '~helpers/auth';
import authControl from '~components/auth-control';
import generatePath from '~settings/routing';


const mapStateToProps = (state) => {
  const data = state.dashboard.propertyEdit.toJS();
  const draft = state.dashboard.pendingApproval.toJS();

  return {
    getPropertyStatus: data.communication.getDetail.status,
    property: data.payload,
    rooms: data.cloneRoomListingData,
    editedFields: data.editedFields,
    editedFieldsValidate: data.editedFieldsValidate,
    isFetchingSave: data.communication.save.status === communicationStatus.FETCHING,
    isFetchingPublish: data.communication.publish === communicationStatus.FETCHING,
    publishCommunication: data.communication.publish.status,
    saveDraftCommunication: draft.communication.save.status,
    pendingApproveCommunication: draft.communication.pendingApprove.status,
    mergedDraftProperty: data.mergedDraftProperty,
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyDetail: (id, successCallback) => {
    dispatch(actions.getPropertyDetail(id, successCallback));
  },
  getPropertyPreview: (slug, onSuccess) => {
    dispatch(actions.getPropertyPreview(slug, onSuccess));
  },
  saveProperty: (onSuccess) => {
    dispatch(actions.saveProperty(onSuccess));
  },
  publishProperty: (isPublish, onSuccess) => {
    dispatch(actions.publishProperty(isPublish, onSuccess));
  },
  saveAndPublishProperty: (isPublish, onSuccess) => {
    dispatch(actions.saveAndPublishProperty(isPublish, onSuccess));
  },
  updatePropertyListing: (roomId, listingId, record) => {
    dispatch(actions.updatePropertyListing(roomId, listingId, record));
  },
  updateRoom: (roomId, record, action) => {
    dispatch(actions.updateRoom(roomId, record, action));
  },
  savePropertyDraft: (successCallback) => {
    dispatch(draftActions.savePropertyDraft(successCallback));
  },
  pendingApprovePropertyDraft: (successCallback) => {
    dispatch(draftActions.pendingApprovePropertyDraft(successCallback));
  },
  initProperty: (draft) => {
    dispatch(draftActions.initProperty(draft));
  },
  cancelPropertyDraft: (successCallback, params) => {
    dispatch(draftActions.cancelPropertyDraft(successCallback, params));
  },
  resetMergedProperty: (property) => {
    dispatch(actions.resetMergedProperty(property));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(
  platformEntity.PROPERTIES_PROPERTIES,
  entityAction.READ,
  props => generatePath('property.homepage', { propertySlug: props.match.params.propertySlug }),
)
export default class PropertyEdit extends React.Component {
  constructor() {
    super();

    this.warningType = {
      FIELD_REQUIRED: 'FIELD_REQUIRED',
      CLOSE_POPUP_SAVE: 'CLOSE_POPUP_SAVE',
      CLOSE_POPUP_REVIEW: 'CLOSE_POPUP_REVIEW',
    };

    this.state = {
      showReviewModal: false,
      activeTab: 'details',
      showedWarningType: null,
      showWarning: false,
      shrinkGalleryModal: false,
      isPendingApproveSuccess: false,
      isNeedInitProperty: false,
      showReviewDraftModal: false,
      isFieldsHaveChanged: false,
      isSaveDraftSuccess: false,
    };
    this.isLandlord = isLandlordRole();
  }

  componentDidMount() {
    this.props.getPropertyDetail(decodeURIComponent(this.props.match.params.propertySlug), () => {
      if (isEmptyObject(this.props.property)) {
        this.props.history.push(generatePath('properties', {}));
      }
      const { drafts } = this.props.property;
      if (
        !this.isLandlord &&
        drafts &&
        drafts.edges.length !== 0 &&
        drafts.edges[0].node.status === draftType.PENDING
      ) {
        this.props.history.push(generatePath(
          'property.homepage',
          { propertySlug: this.props.match.params.propertySlug },
        ));
      }

      if (
        this.isLandlord &&
        drafts &&
        drafts.edges.length !== 0 &&
        [draftType.EDITING, draftType.PENDING, draftType.REJECTED]
          .indexOf(drafts.edges[0].node.status) !== -1
      ) {
        this.props.initProperty(drafts.edges[0].node.changes);
        this.setState({
          isNeedInitProperty: true,
        });
      } else {
        this.props.resetMergedProperty(this.props.property);
      }
    });

    // add browser alert
    window.onbeforeunload = (e) => {
      if (
        hasUnsavedData(this.props.editedFields, this.props.rooms) &&
        !this.state.isPendingApproveSuccess &&
        !this.state.isSaveDraftSuccess &&
        this.state.isFieldsHaveChanged
      ) {
        const msg = this.props.t('cms.properties.edit.leave_alert.content');
        // eslint-disable-next-line no-param-reassign
        e = e || window.event;
        if (e) {
          e.returnValue = msg;
        }

        return msg;
      }
      return null;
    };

    window.onresize = (e) => {
      const windowHeight = e.target.innerHeight;
      const tab = document.querySelector('.ant-tabs-content');
      if (tab && tab.style) {
        tab.style.height = `${windowHeight - 220}px`;
      }
    };
  }

  componentDidUpdate(preProp) {
    if (preProp.match.params.propertySlug !== this.props.match.params.propertySlug) {
      this.props.getPropertyDetail(decodeURIComponent(this.props.match.params.propertySlug));
    }
  }

  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    window.onbeforeunload = null;
  }

  getTabLabel = label => (
    <span>
      <If condition={ this.props.editedFieldsValidate[label] === false }>
        <Icon type="exclamation-circle" style={ { color: '#ed9b1e' } } />
      </If>
      {this.props.t(`cms.properties.edit.tab_label.${label}`)}
    </span>
  );

  toogleReviewModal = (selectTab) => {
    if (this.state.showReviewModal && selectTab) {
      this.state.activeTab = selectTab;
    }
    this.state.showReviewModal = !this.state.showReviewModal;
    this.setState(this.state);
  }

  toggleReviewDraftModal = () => {
    this.setState({
      showReviewDraftModal: !this.state.showReviewDraftModal,
    });
  }

  handleTabChange = (activeKey, addNewRoom = false) => {
    this.setState({ activeTab: activeKey });
    if (activeKey === 'rooms' && addNewRoom) {
      this.roomsTab.handleAddNewRoom();
    }
  }

  handleSave = () => {
    if (this.checkUnsavedRoomListing(this.warningType.CLOSE_POPUP_SAVE)) {
      return;
    }
    if (isLandlordRole()) {
      this.underReviewModal(
        () => this.props.savePropertyDraft(this.savePropertyDraftSuccess),
      );
      return;
    }

    this.cancelDraftAction(
      () => {
        this.props.saveProperty(() => {
          message.success(this.props.t('cms.properties.edit.toast.save_success'));
        });
      },
    );
  }

  checkUnsavedRoomListing = (warningType) => {
    const roomsDataChanged = this.props.editedFields.roomsDataChanged;
    const listingsDataChanged = this.props.editedFields.listingsDataChanged;
    const bulkListingsDataChanged = this.props.editedFields.bulkListingsDataChanged;

    if (roomsDataChanged || listingsDataChanged || bulkListingsDataChanged) {
      this.toogleWarning(warningType);
      this.setState({ activeTab: roomsDataChanged ? 'rooms' : 'listings' });
      return true;
    }
    return false;
  }

  checkAllTabs = () => {
    if (isEditedFieldsAllValid(this.props.editedFieldsValidate)) {
      if (isLandlordRole()) {
        this.toggleReviewDraftModal();
      } else {
        this.toogleReviewModal();
      }
    } else {
      this.toogleWarning(this.warningType.FIELD_REQUIRED);
    }
  }

  checkMiniUploadingModal = () => {
    const miniUploadingModal = document.querySelector('.mini-uploading-modal');
    if (miniUploadingModal) {
      this.toogleWarning(this.warningType.CLOSE_POPUP_REVIEW);
      return true;
    }
    return false;
  };

  handleReview = () => {
    if (this.checkUnsavedRoomListing(this.warningType.CLOSE_POPUP_REVIEW) ||
      this.checkMiniUploadingModal()
    ) {
      return;
    }
    const detailValidator = this.detailsTab.validateFields();
    const addressValidator = this.addressTab.validateFields();
    const galleryValidator = this.galleryTab.validateFields();
    Promise.all([detailValidator, addressValidator, galleryValidator]).then(() => {
      this.checkAllTabs();
    }).catch(() => {
      this.checkAllTabs();
    });
  }

  toogleWarning = (type) => {
    if (!type) {
      this.setState({ showWarning: false });
    } else {
      this.setState({ showedWarningType: type, showWarning: true });
    }
  }

  closeReviewModal = () => {
    this.toogleReviewModal(false);
  }

  savePublishedSuccessInReview = () => {
    this.closeReviewModal();
    message.success(this.props.t('cms.properties.edit.toast.publish_success'));
  }

  saveSuccessInReview = () => {
    this.closeReviewModal();
    message.success(this.props.t('cms.properties.edit.toast.save_success'));
  }

  unpublishSuccess = () => {
    if (isLandlordRole()) {
      this.closeReviewDraftModal();
    } else {
      this.closeReviewModal();
    }
    message.success(this.props.t('cms.properties.edit.toast.unpublish_success'));
  }

  savePropertyDraftSuccess = () => {
    this.closeReviewDraftModal();
    message.success(this.props.t('cms.properties.edit.toast.save_draft_success'));
    this.setState({
      isSaveDraftSuccess: true,
    });
  };

  pendingApprovePropertyDraftSuccess = () => {
    this.closeReviewDraftModal();
    this.setState({
      isPendingApproveSuccess: true,
    });
    this.props.resetMergedProperty(this.props.property);
  };

  closeReviewDraftModal = () => {
    this.setState({
      showReviewDraftModal: false,
    });
  };

  cancelDraftAction = (successCallback = () => {}) => {
    const { drafts } = this.props.property;

    if (
      drafts.edges.length !== 0 &&
      [draftType.EDITING, draftType.PENDING, draftType.REJECTED]
        .indexOf(drafts.edges[0].node.status) !== -1
    ) {
      const cancelDraftParam = {
        id: drafts.edges[0].node.id,
      };

      this.invalidateDraftModal(
        () => { this.props.cancelPropertyDraft(successCallback, cancelDraftParam); },
      );
    } else {
      successCallback();
    }
  }

  getReviewButtons = () => {
    const {
      t,
      isFetchingPublish,
      isFetchingSave,
      property,
    } = this.props;
    const { status } = property;

    switch (status) {
      case 'PUBLISHED':
        return [
          {
            text: t('cms.properties.edit.review_modal.button.unpublish'),
            onClick: () => {
              this.cancelDraftAction(
                () => this.props.saveAndPublishProperty(false, this.unpublishSuccess),
              );
            },
            primary: false,
            loading: isFetchingPublish,
          },
          {
            text: t('cms.properties.edit.review_modal.button.save_to_publish'),
            onClick: () => {
              this.cancelDraftAction(
                () => this.props.saveProperty(this.savePublishedSuccessInReview),
              );
            },
            primary: true,
            loading: isFetchingSave,
          },
        ];
      default:
        return [
          {
            text: t('cms.properties.edit.review_modal.button.save_for_later'),
            onClick: () => {
              this.cancelDraftAction(
                () => this.props.saveProperty(this.saveSuccessInReview),
              );
            },
            primary: false,
            loading: isFetchingSave,
          },
          {
            text: t('cms.properties.edit.review_modal.button.publish'),
            onClick: () => {
              this.cancelDraftAction(
                () => this.props.saveAndPublishProperty(true, this.savePublishedSuccessInReview),
              );
            },
            primary: true,
            loading: isFetchingPublish,
          },
        ];
    }
  }

  getReviewDraftButtons = () => {
    const {
      t,
      property,
      publishCommunication,
      saveDraftCommunication,
      pendingApproveCommunication,
    } = this.props;

    const draftActionButtons = [];
    if (property.status === 'PUBLISHED') {
      draftActionButtons.push({
        text: t('cms.properties.edit.review_modal.button.unpublish'),
        onClick: () => {
          this.props.saveAndPublishProperty(false, this.unpublishSuccess);
        },
        primary: false,
        communication: publishCommunication,
      });
    } else if (this.isShowSaveButton()) {
      draftActionButtons.push({
        text: t('cms.properties.edit.review_modal.button.save_for_later'),
        onClick: () => {
          this.underReviewModal(
            () => this.props.savePropertyDraft(this.savePropertyDraftSuccess),
          );
        },
        primary: false,
        communication: saveDraftCommunication,
      });
    }

    draftActionButtons.push({
      text: t('cms.properties.edit.review_modal.button.send_to_student_approval'),
      onClick: () => {
        this.underReviewModal(
          () => this.props.pendingApprovePropertyDraft(this.pendingApprovePropertyDraftSuccess),
        );
      },
      primary: true,
      communication: pendingApproveCommunication,
    });

    return draftActionButtons;
  }

  renderWarning = (type) => {
    let text = '';
    switch (type) {
      case this.warningType.FIELD_REQUIRED:
        text = this.props.t('cms.properties.edit.submit.warning.text');
        break;
      case this.warningType.CLOSE_POPUP_SAVE:
        text = this.props.t('cms.properties.edit.submit.warning.close_room_modal');
        break;
      case this.warningType.CLOSE_POPUP_REVIEW:
        text = this.props.t('cms.properties.edit.submit.warning.close_listing_modal');
        break;
      default:
        text = '';
    }
    return (
      <div className="property-edit__warning">
        <Icon type="exclamation-circle" className="property-edit__warning__icon" />
        <div className="property-edit__warning__text">
          {text}
        </div>
        <div className="property-edit__warning__btn-wrapper">
          <Button className="property-edit__warning__btn" onClick={ () => { this.toogleWarning(null); } } type="primary">
            {this.props.t('cms.properties.edit.submit.warning.btn')}
          </Button>
        </div>
      </div>
    );
  }

  handleCloseModal = () => {
    this.setState({
      shrinkGalleryModal: !this.state.shrinkGalleryModal,
    });
  }

  haveCoverPhoto = () => {
    const { property, mergedDraftProperty } = this.props;
    const renderProperty = isLandlordRole() ? mergedDraftProperty : property;
    if (
      (
        renderProperty.images
        && renderProperty.images.edges.find(item => item.node.category === 'GENERAL')
        && !this.props.editedFields.gallery.data
      ) || (
        this.props.editedFields.gallery.data
        && this.props.editedFields.gallery.data
        && this.props.editedFields.gallery.data.value
        && this.props.editedFields.gallery.data.value.list
        && this.props.editedFields.gallery.data.value.list
        && this.props.editedFields.gallery.data.value.list['property:cover_photo']
        && this.props.editedFields.gallery.data.value.list['property:cover_photo'].length > 0
      )
    ) {
      return true;
    }
    return false;
  }

  handlePreview = (callback) => {
    this.props.getPropertyPreview(
      decodeURIComponent(this.props.match.params.propertySlug),
      (res) => {
        callback(
          formatPreviewData(res, this.props.editedFields, this.props.rooms),
        );
      });
  };

  isShowSaveButton = () => {
    const { property } = this.props;

    if (
      property &&
      property.drafts &&
      property.drafts.edges.length === 0
    ) {
      return true;
    }

    if (
      property &&
      property.drafts &&
      property.drafts.edges.length !== 0
    ) {
      if (
        this.isLandlord &&
        [draftType.EDITING, draftType.EXPIRED, draftType.APPROVED]
          .indexOf(property.drafts.edges[0].node.status) !== -1
      ) {
        return true;
      }
      if (
        !this.isLandlord &&
        [draftType.EDITING, draftType.REJECTED, draftType.EXPIRED, draftType.APPROVED]
          .indexOf(property.drafts.edges[0].node.status) !== -1
      ) {
        return true;
      }
    }

    return false;
  };

  openPropertyComment = (slug) => {
    const url = generatePath('comments', { propertySlug: slug });
    window.open(url, '_blank');
  }

  invalidateDraftModal = (okAction = () => {}) => {
    const { t } = this.props;
    Modal.confirm({
      className: 'property-edit__reminder-modal',
      icon: <Icon type="exclamation-circle" theme="filled" />,
      title: t('cms.properties.pending_approval.modal.publish.tips'),
      okText: t('cms.form.value.yes'),
      cancelText: t('cms.form.value.no'),
      width: 446,
      onOk: okAction,
    });
  }

  underReviewModal = (okAction = () => {}) => {
    const { t, property } = this.props;

    if (
      property &&
      property.drafts &&
      property.drafts.edges[0] &&
      property.drafts.edges[0].node.status === draftType.PENDING
    ) {
      Modal.confirm({
        className: 'property-edit__reminder-modal',
        icon: <Icon type="exclamation-circle" theme="filled" />,
        title: t('cms.properties.pending_approval.modal.under_review.title'),
        content: t('cms.properties.pending_approval.modal.under_review.text'),
        okText: t('cms.form.value.yes'),
        cancelText: t('cms.form.value.no'),
        width: 446,
        onOk: okAction,
      });
    } else {
      okAction();
    }
  }

  setFieldsHaveChanged = () => {
    if (!this.state.isFieldsHaveChanged) {
      this.setState({
        isFieldsHaveChanged: true,
      });
    }
  }

  render() {
    const TabPane = Tabs.TabPane;
    const isLandlord = isLandlordRole();
    const {
      t,
      getPropertyStatus,
      property,
      editedFields,
      rooms,
      mergedDraftProperty,
      processPropertyDraft,
    } = this.props;
    const {
      activeTab,
      showReviewModal,
      isPendingApproveSuccess,
      showReviewDraftModal,
      isFieldsHaveChanged,
      isSaveDraftSuccess,
    } = this.state;
    const draftStatus =
      property.drafts && property.drafts.edges
      && property.drafts.edges[0] && property.drafts.edges[0].node ?
        property.drafts.edges[0].node.status : null;
    const draft =
      property.drafts && property.drafts.edges
      && property.drafts.edges[0] && property.drafts.edges[0].node ?
        property.drafts.edges[0].node : null;

    const renderProperty =
      property.drafts &&
      property.drafts.edges.length !== 0 &&
      [draftType.EDITING, draftType.PENDING, draftType.REJECTED]
        .indexOf(property.drafts.edges[0].node.status) !== -1 &&
      isLandlord &&
      Object.keys(mergedDraftProperty).length ?
        mergedDraftProperty : property;

    return (
      <div className="property-edit">
        <LeaveAlert
          history={ this.props.history }
          t={ this.props.t }
          when={
            hasUnsavedData(editedFields, rooms) &&
            !isPendingApproveSuccess &&
            !isSaveDraftSuccess &&
            isFieldsHaveChanged
          }
        />
        <Choose>
          <When condition={ getPropertyStatus !== communicationStatus.IDLE } >
            <div className="property-edit__loading"><Spin /></div>
          </When>
          <When condition={ isPendingApproveSuccess }>
            <PendingApproveSuccess
              t={ this.props.t }
              history={ this.props.history }
            />
          </When>
          <Otherwise>
            <Header
              showedWarningType={ this.state.showedWarningType }
              showWarning={ this.state.showWarning }
              renderWarning={ this.renderWarning }
              t={ t }
              property={ renderProperty }
              type="edit"
              handleSave={ this.handleSave }
              isFetchingSave={ this.props.isFetchingSave }
              handleReview={ this.handleReview }
              warningType={ this.warningType }
              handlePreview={ this.handlePreview }
              isShowSaveButton={ this.isShowSaveButton() }
            />
            <div className={ classNames('property-edit__page', {
              'property-edit__page--keepel': isLandlord && draftStatus === draftType.REJECTED,
            }) }
            >
              <If condition={
                draftStatus &&
                (
                  (isLandlord && draftStatus === draftType.PENDING) ||
                  (isLandlord && draftStatus === draftType.REJECTED) ||
                  (!isLandlord && draftStatus === draftType.EDITING) ||
                  (!isLandlord && draftStatus === draftType.REJECTED)
                )
              }
              >
                <div className="property-edit__page-tips">
                  <If condition={ isLandlord && draftStatus === draftType.PENDING }>
                    <span className="property-edit__draft-details">
                      { t('cms.property_details.draft_details.tips', {
                        londlord: draft && draft.createdUser
                        && (draft.createdUser.firstName || draft.createdUser.firstName) ?
                          `${draft.createdUser.firstName}.${draft.createdUser.lastName}` : 'landlord',
                        updatedAt: moment(property.drafts.edges[0].node.updatedAt)
                          .format('DD/MM/YYYY'),
                      }) }
                    </span>
                  </If>
                  <span className="property-edit__tips-text">
                    <Choose>
                      <When condition={ isLandlord && draftStatus === draftType.PENDING }>
                        { t('cms.property_details.draft_editing.tips') }
                      </When>
                      <When condition={ isLandlord && draftStatus === draftType.REJECTED }>
                        { t('cms.property_details.draft_rejected.tips') }
                      </When>
                      <When condition={
                        !isLandlord
                        && [draftType.EDITING, draftType.REJECTED].indexOf(draftStatus) !== -1
                      }
                      >
                        { t('cms.property_details.landlord_editing.tips') }
                      </When>
                    </Choose>
                  </span>

                  <If condition={ isLandlord && draftStatus === draftType.REJECTED }>
                    <button
                      className="property-edit__check-feedback-btn"
                      onClick={ () => { this.openPropertyComment(property.slug); } }
                    >
                      { t('cms.property_details.draft_rejected.check_feedback.btn') }
                      <Icon
                        type="file-search"
                        className="property-edit__check-feedback-icon"
                        style={ { color: '#38b2a6', marginLeft: '24' } }
                      />
                    </button>
                  </If>
                </div>
              </If>
              <Tabs type="card" activeKey={ activeTab } onChange={ this.handleTabChange } >
                <TabPane tab={ this.getTabLabel('details', 'validateDetails') } key="details" forceRender>
                  <div className="property-edit__tab-conatiner">
                    <DetailTab
                      t={ t }
                      property={ renderProperty }
                      ref={ (details) => { this.detailsTab = details; } }
                      setFieldsHaveChanged={ this.setFieldsHaveChanged }
                    />
                  </div>
                </TabPane>
                <TabPane
                  tab={ this.getTabLabel('address', 'validateAddress') }
                  key="address"
                  forceRender
                >
                  <div className="property-edit__tab-conatiner property-edit__address-conatiner">
                    <AddressTab
                      t={ t }
                      property={ renderProperty }
                      ref={ (address) => { this.addressTab = address; } }
                      setFieldsHaveChanged={ this.setFieldsHaveChanged }
                    />
                  </div>
                </TabPane>
                <TabPane tab={ this.getTabLabel('facilities', 'validateFacilities') } key="facilities">
                  <div className="property-edit__tab-conatiner property-edit__facilities-conatiner">
                    <FacilitiesTab
                      t={ t }
                      property={ renderProperty }
                      setFieldsHaveChanged={ this.setFieldsHaveChanged }
                    />
                  </div>
                </TabPane>
                <If condition={ showElementByAuth(
                  platformEntity.PROPERTIES_UNIT_TYPES,
                  entityAction.READ,
                ) }
                >
                  <TabPane tab={ this.getTabLabel('rooms', 'validateRooms') } key="rooms" forceRender>
                    <div className="property-edit__tab-conatiner property-edit__rooms-conatiner">
                      <RoomsTab
                        t={ t }
                        property={ property }
                        rooms={ rooms }
                        updateRoom={ this.props.updateRoom }
                        ref={ (tab) => { this.roomsTab = tab; } }
                      />
                    </div>
                  </TabPane>
                </If>
                <If condition={ showElementByAuth(
                  platformEntity.LISTINGS_LISTINGS,
                  entityAction.READ,
                ) }
                >
                  <TabPane tab={ this.getTabLabel('listings', 'validateListings') } key="listings">
                    <div className="property-edit__tab-conatiner property-edit__listings-conatiner">
                      <ListingsTab
                        t={ this.props.t }
                        property={ property }
                        rooms={ rooms }
                        updatePropertyListing={ this.props.updatePropertyListing }
                        handleTabChange={ this.handleTabChange }
                        activeTab={ this.state.activeTab }
                      />
                    </div>
                  </TabPane>
                </If>
                <TabPane tab={ this.getTabLabel('gallery', 'validateGallery') } key="gallery" forceRender>
                  <div className="property-edit__tab-conatiner property-edit__gallery-conatiner">
                    <GalleryTab
                      t={ this.props.t }
                      property={ renderProperty }
                      rooms={ rooms }
                      handleTabChange={ this.handleTabChange }
                      ref={ (gallery) => { this.galleryTab = gallery; } }
                      onCloseModal={ this.handleCloseModal }
                      shrinkGalleryModal={ this.state.shrinkGalleryModal }
                      haveCoverPhoto={ this.haveCoverPhoto() }
                      isNeedInitProperty={ this.state.isNeedInitProperty }
                      setFieldsHaveChanged={ this.setFieldsHaveChanged }
                    />
                  </div>
                </TabPane>
              </Tabs>
            </div>

            <If condition={ !isLandlord && showReviewModal }>
              <PropertyReviewModal
                activeModal
                t={ this.props.t }
                showChangedVersion={ property.status === 'PUBLISHED' }
                originalData={ property }
                changedData={
                  isLandlord && property.draft && property.draft.edges.length !== 0 ?
                    property.draft.edges[0].node.changes :
                    editedFields
                }
                roomData={ rooms }
                onClose={ this.toogleReviewModal }
                buttons={ this.getReviewButtons() }
              />
            </If>
            <If condition={ showReviewDraftModal }>
              <ReviewDraftModal
                activeModal
                t={ t }
                onClose={ this.toggleReviewDraftModal }
                originalData={ property }
                processPropertyDraft={ processPropertyDraft }
              />
            </If>
          </Otherwise>
        </Choose>

        <MiniUploadingModal
          t={ this.props.t }
          onTabChange={ () => { this.handleTabChange('gallery'); } }
          onCloseModal={ this.handleCloseModal }
          shrinkGalleryModal={ this.state.shrinkGalleryModal }
        />
      </div >

    );
  }
}

PropertyEdit.propTypes = {
  t: PropTypes.func.isRequired,
  getPropertyDetail: PropTypes.func,
  getPropertyStatus: PropTypes.string,
  property: PropTypes.object,
  rooms: PropTypes.array,
  editedFields: PropTypes.object,
  history: PropTypes.object,
  editedFieldsValidate: PropTypes.object,
  isFetchingSave: PropTypes.bool,
  saveProperty: PropTypes.func,
  saveAndPublishProperty: PropTypes.func,
  isFetchingPublish: PropTypes.bool,
  updateRoom: PropTypes.func,
  updatePropertyListing: PropTypes.func,
  getPropertyPreview: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      propertySlug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  initProperty: PropTypes.func,
  mergedDraftProperty: PropTypes.object,
  savePropertyDraft: PropTypes.func,
  pendingApprovePropertyDraft: PropTypes.func,
  cancelPropertyDraft: PropTypes.func,
  publishCommunication: PropTypes.string,
  saveDraftCommunication: PropTypes.string,
  pendingApproveCommunication: PropTypes.string,
  resetMergedProperty: PropTypes.func,
  processPropertyDraft: PropTypes.func,
};

PropertyEdit.defaultProps = {
  t: () => { },
  getPropertyStatus: '',
  property: {},
  rooms: [],
  editedFields: {},
  history: {},
  editedFieldsValidate: {},
  isFetchingSave: false,
  saveProperty: () => { },
  saveAndPublishProperty: () => { },
  isFetchingPublish: false,
  getPropertyDetail: () => { },
  updatePropertyListing: () => { },
  updateRoom: () => { },
  getPropertyPreview: () => {},
  initProperty: () => {},
  mergedDraftProperty: {},
  savePropertyDraft: () => {},
  pendingApprovePropertyDraft: () => {},
  cancelPropertyDraft: () => {},
  publishCommunication: '',
  saveDraftCommunication: '',
  pendingApproveCommunication: '',
  resetMergedProperty: () => {},
  processPropertyDraft: () => {},
};
