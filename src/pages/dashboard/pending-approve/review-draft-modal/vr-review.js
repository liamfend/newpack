import React from 'react';
import PropTypes from 'prop-types';
import Svg from '~components/svg';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import DropDownBox from './drop-down-box';

export default class VrReview extends React.PureComponent {
  render() {
    const { t, vr, handleClickOpenCommentModal, isAlreadyReject, cancelRejectDraft } = this.props;

    return (
      <div className="review-draft__vr" ref={ (node) => { this.vrElement = node; } }>
        <span className={ classNames('review-draft__vr__reject-line-tag', {
          'review-draft__vr__reject-line-tag--active': isAlreadyReject,
        }) }
        />

        <div className="review-draft__vr__symbol-container">
          <div className="review-draft__vr__block">
            <span className="review-draft__vr__title">{ t('cms.properties.pending_approval.review_modal.vr_link.title') }</span>
            <Tooltip
              getPopupContainer={ () => this.vrElement }
              title={ vr.link || '-' }
              placement="top"
            >
              <span className="review-draft__vr__content">{ vr.link }</span>
            </Tooltip>
          </div>
          <span className="review-draft__vr__block">
            <span className="review-draft__vr__title">{ t('cms.properties.pending_approval.review_modal.vr_locale.title') }</span>
            <span className="review-draft__vr__content">{ vr.displayRegion }</span>
          </span>
        </div>

        <If condition={ isAlreadyReject }>
          <span className="review-draft__vr__comments-tag">
            <Svg className="review-draft__vr__icon-comments" hash="icon-comments" />
          </span>
        </If>

        <DropDownBox
          t={ t }
          draftId={ vr.draftId }
          handleClickOpenCommentModal={ handleClickOpenCommentModal }
          isAlreadyReject={ isAlreadyReject }
          cancel={ cancelRejectDraft }
          type="vr"
        />
      </div>
    );
  }
}


VrReview.propTypes = {
  t: PropTypes.func,
  vr: PropTypes.object,
  isAlreadyReject: PropTypes.bool,
  handleClickOpenCommentModal: PropTypes.func,
  cancelRejectDraft: PropTypes.func,
};

VrReview.defaultProps = {
  t: () => {},
  vr: {},
  isAlreadyReject: false,
  handleClickOpenCommentModal: () => {},
  cancelRejectDraft: () => {},
};
