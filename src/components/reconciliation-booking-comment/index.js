import React from 'react';
import PropTypes from 'prop-types';
import GalleryModal from '~components/gallery-modal';
import { bookingPedingNoteType, bookingLandlordStatus } from '~constants/reconciliation-booking';
import { withTranslation } from 'react-i18next';
import endpoints from '~settings/endpoints';

@withTranslation()
export default class ReconciliationBookingComment extends React.Component {
  constructor() {
    super();

    this.state = {
      isShowModal: false,
      currentImageIndex: 0,
    };
  }

  handleClickOpenGallery = (index) => {
    this.setState({
      isShowModal: true,
      currentImageIndex: index,
    });
  }

  handleClickCloseGallery = () => {
    this.setState({ isShowModal: false });
  }

  // image rate width < height
  getImageSizeRate = (imageSource) => {
    const imagePath = `${endpoints.getOpportunityNoteFile.url()}/${imageSource}`;
    const img = new Image();
    img.src = imagePath;
    const imageWidth = img.width || 0;
    const imageHeigh = img.height || 0;
    if (imageWidth < imageHeigh) {
      return 'reconciliation-booking-comment__img--more-height';
    }
    return 'reconciliation-booking-comment__img--more-width';
  }

  keyCodeCloseGalleryModal = (e) => {
    const keyBoardCode = e.keyCode;
    if (keyBoardCode === 27) {
      this.setState({ isShowModal: false });
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyCodeCloseGalleryModal);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyCodeCloseGalleryModal);
  }

  render() {
    const {
      opportunityStateChangesNote, t, bookingStatus,
      isActiveOpportunity,
    } = this.props;

    const caseNumber = opportunityStateChangesNote.opportunityCase &&
      opportunityStateChangesNote.opportunityCase.referenceId ?
      opportunityStateChangesNote.opportunityCase.referenceId : '';

    return (
      <div className="reconciliation-booking-comment">

        {/* TODO: wait for BE case */}
        <If condition={ bookingStatus === bookingLandlordStatus.PENDING_APPROVAL }>
          <div className={
            `reconciliation-booking-comment__tag-container ${isActiveOpportunity ? '' :
              'reconciliation-booking-comment__tag-container--blue'}`
          }
          >
            <span className="reconciliation-booking-comment__tag-content">
              { isActiveOpportunity ?
                `${t('cms.reconciliation.booking.details.comment.assign.booking_team_process')}` :
                `${t('cms.reconciliation.booking.details.comment.assign.supply_team_process')}`
              }
            </span>
            <If condition={ isActiveOpportunity && caseNumber }>
              <span className="reconciliation-booking-comment__tag-line" />
              <span className="reconciliation-booking-comment__tag-sign">
                { caseNumber }
              </span>
            </If>
          </div>
        </If>

        <div className="reconciliation-booking-comment__content-container">

          <div className="reconciliation-booking-comment__reason-container">
            <span className="reconciliation-booking-comment__reason-title">
              { t('cms.reconciliation.booking.details.comment.reason.title') }
            </span>
            <span className="reconciliation-booking-comment__reason-content">
              { bookingPedingNoteType[opportunityStateChangesNote.pendingNote] || '-' }
            </span>
          </div>

          <div className="reconciliation-booking-comment__description-container">
            <span className="reconciliation-booking-comment__description-title">
              { t('cms.reconciliation.booking.details.comment.description.title') }
            </span>
            <p
              className="reconciliation-booking-comment__description"
              dangerouslySetInnerHTML={ {
                __html: `${opportunityStateChangesNote.description}`,
              } }
            />
          </div>

          <ul className="reconciliation-booking-comment__gallery-container">
            <For each="imageItem" of={ opportunityStateChangesNote.opportunityPendingNoteFiles || [] } index="index">
              <li
                className="reconciliation-booking-comment__gallery-item"
                onClick={ () => { this.handleClickOpenGallery(index); } }
                role="presentation"
                key={ index }
              >
                <img
                  className={ `reconciliation-booking-comment__img
                    ${this.getImageSizeRate(imageItem.source)}` }
                  src={ `${endpoints.getOpportunityNoteFile.url()}/${imageItem.source}` }
                  alt={ imageItem.name }
                />
              </li>
            </For>
          </ul>

        </div>

        <If condition={
          this.state.isShowModal &&
          opportunityStateChangesNote.opportunityPendingNoteFiles.length > 0 }
        >
          <GalleryModal
            activeModal={ this.state.isShowModal }
            handleClickClose={ this.handleClickCloseGallery }
            imageArray={ opportunityStateChangesNote.opportunityPendingNoteFiles }
            currentImageIndex={ this.state.currentImageIndex }
          />
        </If>

      </div>
    );
  }
}

ReconciliationBookingComment.propTypes = {
  opportunityStateChangesNote: PropTypes.object,
  t: PropTypes.func,
  bookingStatus: PropTypes.string,
  isActiveOpportunity: PropTypes.bool,
};

ReconciliationBookingComment.defaultProps = {
  opportunityStateChangesNote: {},
  t: () => {},
  bookingStatus: '',
  isActiveOpportunity: false,
};
