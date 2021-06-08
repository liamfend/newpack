import React from 'react';
import PropTypes from 'prop-types';
import Svg from '~components/svg';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import { getLocale } from '~helpers/gallery';
import DropDownBox from '../review-draft-modal/drop-down-box';

export default class VideosReview extends React.PureComponent {
  render() {
    const { t, video, isAlreadyReject, cancelRejectDraft } = this.props;

    return (
      <div className="review-draft__videos" ref={ (node) => { this.videoElement = node; } }>
        <span className={ classNames('review-draft__videos__reject-line-tag', {
          'review-draft__videos__reject-line-tag--active': isAlreadyReject,
        }) }
        />

        <span className="review-draft__videos__symbol-container">
          <span className="review-draft__videos__icon-container">
            <Svg className="review-draft__videos__icon-video" hash="icon-draft-video" />
            <span className="review-draft__videos__icon-content">
              { t('cms.properties.pending_approval.review_modal.video_content') }
            </span>
          </span>

          <span className="review-draft__videos__content-container">
            <span className="review-draft__videos__block">
              <span className="review-draft__videos__title">
                { t('cms.properties.pending_approval.review_modal.video_link.title') }
              </span>
              <Tooltip
                getPopupContainer={ () => this.videoElement }
                title={ (video.links && video.links.hqMp4) ?
                  video.links.hqMp4 :
                  'The file is compressing, the link will generate a moment later.' }
                placement="top"
              >
                <span className="review-draft__videos__content">
                  { (video.links && video.links.hqMp4) ?
                    video.links.hqMp4 :
                    'The file is compressing, the link will generate a moment later.'
                  }
                </span>
              </Tooltip>
            </span>
            <span className="review-draft__videos__block">
              <span className="review-draft__videos__title">
                { t('cms.properties.pending_approval.review_modal.video_locale.title') }
              </span>
              <span className="review-draft__videos__content">{ getLocale(video.locales) }</span>
            </span>
          </span>

        </span>

        <If condition={ isAlreadyReject }>
          <span className="review-draft__videos__comments-tag">
            <Svg className="review-draft__videos__icon-comments" hash="icon-comments" />
          </span>
        </If>

        <DropDownBox
          t={ t }
          draftId={ video.draftId }
          handleClickOpenCommentModal={ this.props.handleClickOpenCommentModal }
          isAlreadyReject={ isAlreadyReject }
          cancel={ cancelRejectDraft }
          type="video"
        />
      </div>
    );
  }
}


VideosReview.propTypes = {
  t: PropTypes.func,
  video: PropTypes.object,
  handleClickOpenCommentModal: PropTypes.func,
  cancelRejectDraft: PropTypes.func,
  isAlreadyReject: PropTypes.bool,
};

VideosReview.defaultProps = {
  t: () => {},
  video: {},
  handleClickOpenCommentModal: () => {},
  cancelRejectDraft: () => {},
  isAlreadyReject: false,
};
