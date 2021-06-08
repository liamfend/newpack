import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from 'antd';
import modal from '~components/modal';
import Svg from '~components/svg';
import DetailsReview from '~pages/dashboard/pending-approve/review-draft-modal/details-review';
import PhotosReview from '~pages/dashboard/pending-approve/review-draft-modal/photos-review';
import VideosReview from '~pages/dashboard/pending-approve/review-draft-modal/videos-review';
import VrReview from '~pages/dashboard/pending-approve/review-draft-modal/vr-review';
import CommentsModal from '~pages/dashboard/pending-approve/review-draft-modal/comments-modal';

@modal({
  className: 'review-draft-modal',
}, false)
export default class ReviewDraftModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // comments modal
      commentsModalDraftId: '',
      isShowCommentModal: false,
      rejectCommentsModalDetail: null,
      isShowWarningTips: false,

      originalDataState: (props.originalData.drafts &&
        props.originalData.drafts.edges.map(data => data.node).filter(item => item.status === 'PENDING')) || [],
      details: null,
      photos: [],
      videos: [],
      vr: [],
      rejectLists: [],
      bottomWarningTips: false,
    };
  }

  initPropertyData = () => {
    const { originalDataState } = this.state;

    let beautifulDetail = null;
    const beautifulImage = [];
    const beautifulVr = [];
    const beautifulVideo = [];

    originalDataState.forEach((draft) => {
      if (draft.image) {
        beautifulImage.push(Object.assign(draft.image, { draftId: draft.id }));
      }
      if (draft.propertyLink) {
        beautifulVr.push(Object.assign(draft.propertyLink, { draftId: draft.id }));
      }
      if (draft.unitTypeLink) {
        beautifulVr.push(Object.assign(draft.unitTypeLink, { draftId: draft.id }));
      }
      if (draft.video) {
        beautifulVideo.push(Object.assign(draft.video, { draftId: draft.id }));
      }
      if (draft.changes && (!draft.changes.enabled && !draft.changes.active)) {
        beautifulDetail = Object.assign(draft.changes, { draftId: draft.id });
      }
    });

    if (this.props.originalData.status === 'PUBLISHED') {
      if (this.props.draftsCategory.includes('GALLERY')) {
        this.setState({
          details: [],
          photos: beautifulImage,
          vr: beautifulVr,
          videos: beautifulVideo,
        });
      } else {
        this.setState({
          details: beautifulDetail,
          photos: [],
          vr: [],
          videos: [],
        });
      }
    } else {
      this.setState({
        details: beautifulDetail,
        photos: beautifulImage,
        vr: beautifulVr,
        videos: beautifulVideo,
      });
    }
  }

  cancelRejectDraft = (draftId) => {
    this.writeComments(draftId, '');
  }

  perfectRejectDataFormat = (rejectLists) => {
    // eslint-disable-next-line no-param-reassign
    rejectLists.map(item => delete item.isShowDraftWarning);
    return rejectLists;
  }

  handleClickAppovePublish = () => {
    this.setState({ loading: true });
    const { processPropertyDraft } = this.props;
    const { rejectLists, details, photos, vr, videos } = this.state;
    const compareRejectIds = rejectLists.map(data => data.id);

    let originalDataRes = [];

    if (this.props.originalData.status === 'PUBLISHED') {
      if (this.props.draftsCategory.includes('GALLERY')) {
        originalDataRes = photos.concat(vr).concat(videos);
      } else {
        originalDataRes = [details];
      }
    } else {
      originalDataRes = [details].concat(photos).concat(vr).concat(videos);
    }

    const approveListis = (originalDataRes
      .filter(v => !compareRejectIds.includes(v.draftId)))
      .map(data => Object.assign({ id: data.draftId, status: 'APPROVED' }));

    // call
    processPropertyDraft(this.perfectRejectDataFormat(rejectLists).concat(approveListis), () => {
      this.props.onClose();
      location.reload();
      this.setState({ loading: false });
    });
  }

  handleClickCommentModal = (draftId, isShowWarning = false) => {
    const { rejectLists } = this.state;

    this.setState({
      isShowCommentModal: !this.state.isShowCommentModal,
      commentsModalDraftId: draftId,
      rejectCommentsModalDetail: rejectLists.filter(draft => draft.id === draftId),
      isShowWarningTips: isShowWarning,
    });
  }

  handleClickSaveComment = (comments) => {
    this.writeComments(this.state.commentsModalDraftId, comments, this.state.isShowWarningTips);
  }

  writeComments = (draftId, comments, showWarningTips) => {
    const { rejectLists } = this.state;
    const rejectListConst = rejectLists;

    if (rejectLists.length === 0 && comments) {
      return this.setState({
        rejectLists: [...rejectListConst, {
          id: draftId, status: 'REJECTED', comment: comments, isShowDraftWarning: showWarningTips,
        }],
        isShowCommentModal: false,
      }, () => {
        this.setState({
          bottomWarningTips:
          this.state.rejectLists.findIndex(item => item.isShowDraftWarning) !== -1,
        });
      });
    }

    rejectLists.forEach((draft, index) => {
      if (draftId === draft.id) {
        if (comments) {
          rejectLists[index].comment = comments;
        } else {
          rejectListConst.splice(index, 1);
          this.setState({ rejectLists: rejectListConst });
        }
      } else if (comments) {
        this.setState({
          rejectLists: [...rejectListConst, {
            id: draftId, status: 'REJECTED', comment: comments, isShowDraftWarning: showWarningTips,
          }],
        });
      }
    });

    return this.setState({ isShowCommentModal: false }, () => {
      this.setState({
        bottomWarningTips:
        this.state.rejectLists.findIndex(item => item.isShowDraftWarning) !== -1,
      });
    });
  }

  showDetailCommentsTag = () => {
    this.writeComments(this.state.commentsModalDraftId, '');
  }

  componentDidMount() {
    this.initPropertyData();
  }

  render() {
    const { t, onClose, originalData, isShowCloseBtn } = this.props;
    const {
      details, photos, videos, vr, rejectCommentsModalDetail, rejectLists, loading,
      bottomWarningTips,
    } = this.state;
    const isPublish = originalData.status === 'PUBLISHED';

    return (
      <div>
        <div className="review-draft">
          <span className="review-draft__title-container">
            <span className="review-draft__title">
              { isPublish ?
                t('cms.properties.property_card.draft.pending.title.unpublish') :
                t('cms.properties.property_card.draft.pending.title.publish') }
            </span>
            <If condition={ isShowCloseBtn }>
              <button
                onClick={ onClose }
                className="review-draft__close-btn"
              >
                <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
              </button>
            </If>
          </span>

          <div className="review-draft__content-container">
            <div className="review-draft__content-container--inner">
              {/* ------ details modules start ------ */}
              <If condition={ details && details.draftId }>
                <div className="review-draft__details-container">
                  <div className="review-draft__details-container__title-container">
                    <span className="review-draft__details-container__title">
                      { t('cms.properties.pending_approval.review_modal.tab.details') }
                    </span>
                    <span className="review-draft__details-container__reject-container">
                      <Choose>
                        <When condition={ (rejectLists
                          .findIndex(item => item.id === details.draftId)) !== -1 }
                        >
                          <span className="review-draft__details-container__comment-container">
                            <span
                              className="review-draft__details-container__comment"
                              onClick={ () => {
                                this.handleClickCommentModal(details.draftId, true);
                              } }
                              role="presentation"
                            >
                              { t('cms.properties.pending_approval.review_modal.content.edit_comments') }
                            </span>
                            <span className="review-draft__details-container__comment-line" />
                            <span
                              className="review-draft__details-container__comment"
                              onClick={ () => { this.showDetailCommentsTag(); } }
                              role="presentation"
                            >
                              { t('cms.properties.pending_approval.review_modal.content.cancel_rejection') }
                            </span>
                          </span>
                        </When>
                        <Otherwise>
                          <span
                            className="review-draft__details-container__comment"
                            onClick={ () => {
                              this.handleClickCommentModal(details.draftId, true);
                            } }
                            role="presentation"
                          >
                            { t('cms.properties.pending_approval.review_modal.tab.details.reject') }
                          </span>
                        </Otherwise>
                      </Choose>
                    </span>
                  </div>
                  <div className="review-draft__details-container__contnet">
                    <If condition={ (rejectLists
                      .findIndex(item => item.id === details.draftId)) !== -1 }
                    >
                      <span className="review-draft__details-container__comment-tag">
                        <Svg className="review-draft__details-container__icon-comment-tag" hash="icon-comments-mark" />
                      </span>
                    </If>
                    <div className="review-draft__details-container__content">
                      <div className="review-draft__details-container__content-item">
                        <DetailsReview
                          t={ t }
                          detail={ details }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </If>
              {/* ------ details modules end ------ */}

              {/* ------ photos modules start ------ */}
              <If condition={ photos.length > 0 }>
                <div className="review-draft__photos-container">
                  <div className="review-draft__photos-container__title-container">
                    <span className="review-draft__photos-container__title">
                      { t('cms.properties.pending_approval.review_modal.tab.photos') }
                    </span>
                  </div>
                  <div className="review-draft__photos-container__content">
                    <For each="photoItem" of={ photos } index="index">
                      <div className="review-draft__photos-container__content-item" key={ photoItem.id }>
                        <PhotosReview
                          t={ t }
                          image={ photoItem }
                          handleClickOpenCommentModal={ this.handleClickCommentModal }
                          isAlreadyReject={ (rejectLists
                            .findIndex(item => item.id === photoItem.draftId)) !== -1 }
                          cancelRejectDraft={ this.cancelRejectDraft }
                        />
                      </div>
                    </For>
                  </div>
                </div>
              </If>
              {/* ------ photos modules end ------ */}

              {/* ------ videos modules start ------ */}
              <If condition={ videos.length > 0 }>
                <div className="review-draft__videos-container">
                  <div className="review-draft__videos-container__title-container">
                    <span className="review-draft__videos-container__title">
                      { t('cms.properties.pending_approval.review_modal.tab.videos') }
                    </span>
                  </div>
                  <div className="review-draft__videos-container__content">
                    <For each="videoItem" of={ videos } index="index">
                      <div className="review-draft__videos-container__content-item" key={ index }>
                        <VideosReview
                          t={ t }
                          video={ videoItem }
                          handleClickOpenCommentModal={ this.handleClickCommentModal }
                          isAlreadyReject={ (rejectLists
                            .findIndex(item => item.id === videoItem.draftId)) !== -1 }
                          cancelRejectDraft={ this.cancelRejectDraft }
                        />
                      </div>
                    </For>
                  </div>
                </div>
              </If>
              {/* ------ videos modules end ------ */}

              {/* ------ vr modules start ------ */}
              <If condition={ vr.length > 0 }>
                <div className="review-draft__videos-container">
                  <div className="review-draft__vr-container__title-container">
                    <span className="review-draft__vr-container__title">
                      { t('cms.properties.pending_approval.review_modal.tab.vr_links') }
                    </span>
                  </div>
                  <div className="review-draft__vr-container__content">
                    <For each="vrItem" of={ vr } index="index">
                      <div className="review-draft__vr-container__content-item" key={ index }>
                        <VrReview
                          t={ t }
                          vr={ vrItem }
                          handleClickOpenCommentModal={ this.handleClickCommentModal }
                          isAlreadyReject={ (rejectLists
                            .findIndex(item => item.id === vrItem.draftId)) !== -1 }
                          cancelRejectDraft={ this.cancelRejectDraft }
                        />
                      </div>
                    </For>
                  </div>
                </div>
              </If>
              {/* ------ vr modules end ------ */}
            </div>


            {/* ------ bottom ------ */}
            <span className="review-draft__bottom">
              <span className="review-draft__bottom__warming-tips">
                <If condition={ bottomWarningTips }>
                  <Svg
                    className="review-draft__bottom__icon-warming"
                    hash="icon-draft-warming"
                  />
                  <span className="review-draft__bottom__warming-tips-content">
                    { t('cms.properties.pending_approval.review_modal.warming_tips.content') }
                  </span>
                </If>
              </span>
              <span className="review-draft__bottom__btn-container">
                <Button
                  onClick={ () => { this.handleClickAppovePublish(); } }
                  className="review-draft__bottom__save-btn"
                  type="primary"
                  size="large"
                  loading={ loading }
                >
                  { t('cms.properties.pending_approval.review_modal.apporve_publish.btn') }
                </Button>
              </span>
            </span>
            {/* ------ bottom ------ */}
          </div>

        </div>

        <If condition={ this.state.isShowCommentModal }>
          <CommentsModal
            activeModal
            t={ t }
            onClose={ this.handleClickCommentModal }
            onSaveComment={ this.handleClickSaveComment }
            defaultComments={ rejectCommentsModalDetail.length > 0 ? rejectCommentsModalDetail[0].comment : '' }
          />
        </If>
      </div>
    );
  }
}


ReviewDraftModal.propTypes = {
  onClose: PropTypes.func,
  t: PropTypes.func.isRequired,
  originalData: PropTypes.object,
  processPropertyDraft: PropTypes.func,
  draftsCategory: PropTypes.array,
  isShowCloseBtn: PropTypes.bool,
};

ReviewDraftModal.defaultProps = {
  onClose: () => {},
  t: () => {},
  originalData: null,
  processPropertyDraft: () => {},
  draftsCategory: ['DETAIL'],
  isShowCloseBtn: true,
};
