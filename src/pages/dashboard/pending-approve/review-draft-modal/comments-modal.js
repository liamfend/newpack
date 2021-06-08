import React from 'react';
import PropTypes from 'prop-types';
import modal from '~components/modal';
import { Icon, Button } from 'antd';
import ReactQuill from '~components/react-quill';

@modal({
  className: 'comment-modal',
}, false)
export default class CommentsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commentsState: props.defaultComments || '',
    };
  }

  commentChange = (value) => {
    this.setState({ commentsState: value });
  }

  handleClickCancel = () => {
    this.setState({ commentsState: '' }, () => {
      this.props.onClose('');
    });
  }

  render() {
    const { onClose, t } = this.props;
    const { commentsState } = this.state;

    return (
      <div className="comment-modal__container">
        <div className="comment-modal__title-container">
          <span className="comment-modal__title">
            { t('cms.properties.pending_approval.review_modal.comment_modal.title') }
          </span>
          <button
            onClick={ () => { onClose(''); } }
            className="comment-modal__close-btn"
          >
            <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
          </button>
        </div>
        <div className="comment-modal__quill-container">
          <ReactQuill
            modules={ { toolbar: [[{ list: 'ordered' }]] } }
            formats={ ['list'] }
            placeholder={
              t('cms.properties.pending_approval.review_modal.comment.placeholder') }
            onChange={ (value) => { this.commentChange(value); } }
            value={ commentsState }
          />
        </div>
        <div className="comment-modal__bottom-container">
          <Button
            onClick={ () => { this.handleClickCancel(); } }
            className="comment-modal__cancel-btn"
          >
            { t('cms.properties.pending_approval.review_modal.comment_modal.cancel_btn') }
          </Button>
          <Button
            onClick={ () => { this.props.onSaveComment(commentsState); } }
            className="comment-modal__save-btn"
            type="primary"
            disabled={ !commentsState }
          >
            { t('cms.properties.pending_approval.review_modal.comment_modal.save_btn') }
          </Button>
        </div>
      </div>
    );
  }
}


CommentsModal.propTypes = {
  onClose: PropTypes.func,
  t: PropTypes.func,
  onSaveComment: PropTypes.func,
  defaultComments: PropTypes.string,
};

CommentsModal.defaultProps = {
  t: () => {},
  onClose: () => {},
  onSaveComment: () => {},
  defaultComments: '',
};
