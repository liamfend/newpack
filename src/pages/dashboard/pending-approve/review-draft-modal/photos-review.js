import React from 'react';
import PropTypes from 'prop-types';
import { IconComments as IconCommentsIcon, IconCover as IconCoverIcon } from "~components/svgs";
import { imageUrl } from '~helpers/gallery';
import classNames from 'classnames';
import DropDownBox from '../review-draft-modal/drop-down-box';

export default class PhotosReview extends React.PureComponent {
  // according to container of 100% width to show image
  getImageWidthHeight = (width, height) => {
    const containerScale = 235 / 158;
    return width / height < containerScale;
  }

  render() {
    const { image, t, isAlreadyReject, cancelRejectDraft } = this.props;

    return (
      <div className="review-draft__photos">
        <div className="review-draft__photos__container">
          <img
            src={ imageUrl(image, { width: image.width, height: image.height }) }
            className={ classNames({
              'review-draft__photos__img-item': this.getImageWidthHeight(image.width, image.height),
              'review-draft__photos__img-item-height': !this.getImageWidthHeight(image.width, image.height),
            }) }
            alt={ image.filename }
            title={ image.filename }
          />

          {/* ------ reject image mask ------ */}
          <If condition={ isAlreadyReject }>
            <span className="review-draft__photos__img-reject" />
            <IconCommentsIcon className="review-draft__photos__icon-comments" />
          </If>

          {/* ------ hero image tag ------ */}
          <If condition={ image.category === 'GENERAL' && image.hero }>
            <IconCoverIcon className="review-draft__photos__hero-tag" />
          </If>

          <DropDownBox
            t={ t }
            draftId={ image.draftId }
            handleClickOpenCommentModal={ this.props.handleClickOpenCommentModal }
            isAlreadyReject={ isAlreadyReject }
            cancel={ cancelRejectDraft }
            type="photo"
            isCoverPhoto={ image.category === 'GENERAL' && image.hero }
          />

        </div>
      </div>
    );
  }
}


PhotosReview.propTypes = {
  t: PropTypes.func,
  image: PropTypes.object,
  handleClickOpenCommentModal: PropTypes.func,
  isAlreadyReject: PropTypes.bool,
  cancelRejectDraft: PropTypes.func,
};

PhotosReview.defaultProps = {
  t: () => {},
  image: {},
  handleClickOpenCommentModal: () => {},
  cancelRejectDraft: () => {},
  isAlreadyReject: false,
};
