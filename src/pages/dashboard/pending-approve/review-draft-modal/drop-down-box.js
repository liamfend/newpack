import React from 'react';
import PropTypes from 'prop-types';

export default class DropDownBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowMagicBox: false,
    };
  }

  handleClickOpenMagicBox = () => {
    this.setState({
      isShowMagicBox: !this.state.isShowMagicBox,
    });
  }

  handleClickSeleted = (type) => {
    if (type === 'reject') {
      this.props.handleClickOpenCommentModal(this.props.draftId, this.props.isCoverPhoto);
    }
    if (type === 'cancel') {
      this.props.cancel(this.props.draftId);
    }
    if (type === 'comment') {
      this.props.handleClickOpenCommentModal(this.props.draftId, this.props.isCoverPhoto);
    }
    this.setState({ isShowMagicBox: false });
  }

  findTargetParentNodeToClose = (dom) => {
    if (dom && dom.parentNode) {
      if (dom.parentNode.classList &&
        (dom.parentNode.classList.contains('drop-down-box') ||
        dom.parentNode.classList.contains('drop-down-box__magic-box-container'))) {
        return false;
      }
      this.findTargetParentNodeToClose(dom.parentNode);
    } else {
      this.setState({ isShowMagicBox: false });
      return true;
    }
    return true;
  }

  // eslint-disable-next-line no-shadow
  handleClickCloseBox = (event) => {
    const e = event || window.event;

    if (e.target.classList.contains('drop-down-box__btn')) {
      return false;
    }
    return this.findTargetParentNodeToClose(e.target);
  }

  handleCloseComparePanel = () => {
    this.setState({ isShowMagicBox: false });
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickCloseBox);
    document.addEventListener('scroll', this.handleCloseBox);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickCloseBox);
    document.removeEventListener('scroll', this.handleCloseBox);
  }

  render() {
    const { t, isAlreadyReject, type } = this.props;
    const { isShowMagicBox } = this.state;
    return (
      <div className="drop-down-box">
        <span
          className="drop-down-box__arrow-container"
          onClick={ this.handleClickOpenMagicBox }
          role="presentation"
        >
          <span className="drop-down-box__icon-arrow" />
        </span>

        <If condition={ isShowMagicBox }>
          <span className="drop-down-box__magic-box-container">
            <Choose>
              <When condition={ isAlreadyReject }>
                <button
                  className="drop-down-box__btn drop-down-box__magic-box-comment"
                  onClick={ () => { this.handleClickSeleted('comment'); } }
                >
                  { t('cms.properties.pending_approval.review_modal.content.edit_comments') }
                </button>
                <button
                  className="drop-down-box__btn drop-down-box__magic-box-cancel"
                  onClick={ () => { this.handleClickSeleted('cancel'); } }
                >
                  { t('cms.properties.pending_approval.review_modal.content.cancel_rejection') }
                </button>
              </When>
              <Otherwise>
                <button
                  className="drop-down-box__btn drop-down-box__magic-box-reject"
                  onClick={ () => { this.handleClickSeleted('reject'); } }
                >
                  { t(`cms.properties.pending_approval.review_modal.content.reject_${type}`) }
                </button>
              </Otherwise>
            </Choose>
          </span>
        </If>
      </div>
    );
  }
}


DropDownBox.propTypes = {
  t: PropTypes.func,
  cancel: PropTypes.func,
  handleClickOpenCommentModal: PropTypes.func,
  isAlreadyReject: PropTypes.bool,
  draftId: PropTypes.string,
  isCoverPhoto: PropTypes.bool,
  type: PropTypes.string,
};

DropDownBox.defaultProps = {
  t: () => {},
  cancel: () => {},
  handleClickOpenCommentModal: () => {},
  isAlreadyReject: false,
  draftId: '',
  isCoverPhoto: false,
  type: 'photo',
};
