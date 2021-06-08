import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Spin } from 'antd';
import decodeHtml from '~base/global/helpers/decode-html';
import { communicationStatus, draftType } from '~constants';
import Svg from '~components/svg';
import Comment from '~components/comment';
import generatePath from '~settings/routing';
import * as actions from '~actions/pending-approval';

const mapStateToProps = (state) => {
  const data = state.dashboard.pendingApproval.toJS();

  return {
    getPropertyCommentsStatus: data.communication.getComments.status,
    property: data.propertyComments,
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyComments: (id, successCallback) => {
    dispatch(actions.getPropertyComments(id, successCallback));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class Comments extends React.Component {
  componentDidMount() {
    const { propertySlug } = this.props.match.params;
    this.props.getPropertyComments(decodeURIComponent(propertySlug), () => {
      if (
        !this.props.property ||
        !this.props.property.drafts ||
        this.props.property.drafts.edges.length === 0 ||
        (
          this.props.property.drafts.edges[0].node.comments.length === 0 &&
          this.props.property.drafts.edges[0].node.status === draftType.REJECTED
        )
      ) {
        this.props.history.push(generatePath('property.homepage', { propertySlug }));
      }
    });
  }

  getComments = () => {
    const { property } = this.props;
    if (
      property &&
      property.drafts &&
      property.drafts.edges.length !== 0 &&
      property.drafts.edges[0].node.comments.length !== 0
    ) {
      return property.drafts.edges[0].node.comments;
    }

    return [];
  };

  getHtmlOfTAndCElement = () => {
    const translatedTAndCs = this.props.t('cms.draft.comments.footer.acceptance_message', {
      terms_and_condition: this.wrapALabel('/terms/terms-of-use', 'terms_and_conditions'),
      privacy_policy: this.wrapALabel('/terms/privacy', 'privacy_policy'),
    });
    return decodeHtml(translatedTAndCs);
  };

  wrapALabel = (linkParam, contentKey) => {
    const link = `https://www.student.com${linkParam}`;
    const content = this.props.t(`cms.draft.comments.footer.${contentKey}`);
    return `<a target="_blank" href="${link}">${content}</a>`;
  }

  isDraftExpired = () => {
    const { property } = this.props;

    if (
      property &&
      property.drafts &&
      property.drafts.edges.length !== 0 &&
      property.drafts.edges[0].node.status === draftType.EXPIRED
    ) {
      return true;
    }

    return false;
  };

  render() {
    const { t, getPropertyCommentsStatus } = this.props;
    return (
      <div className="comments">
        <Choose>
          <When condition={ getPropertyCommentsStatus !== communicationStatus.IDLE }>
            <div className="comments__loading"><Spin /></div>
          </When>
          <Otherwise>
            <div className="comments__container">
              <div className="comments__header">
                <Svg hash="logo-comment-header" className="comments__logo" />
              </div>
              <div className="comments__main">
                <div>{ t('cms.draft.comments.greetings1') }</div>
                <Choose>
                  <When condition={ this.isDraftExpired() }>
                    <div>{ t('cms.draft.comments.apologizing1') }</div>
                    <div className="comments__greeting">
                      { t('cms.draft.comments.apologizing2') }
                    </div>
                    <div className="comments__greeting-main">
                      { t('cms.draft.comments.apologizing3') }
                    </div>
                  </When>
                  <Otherwise>
                    <div className="comments__greeting">
                      { t('cms.draft.comments.greetings2') }
                    </div>
                    <div className="comments__greeting-main">
                      { t('cms.draft.comments.greetings3') }
                    </div>
                  </Otherwise>
                </Choose>
                <If condition={ !this.isDraftExpired() }>
                  <div className="comments__wrap">
                    <For each="comment" of={ this.getComments() }>
                      <Comment
                        key={ comment.id }
                        { ...comment }
                        t={ t }
                      />
                    </For>
                  </div>
                </If>
                <div className="comments__greeting-regards">{ t('cms.draft.comments.greetings4') }</div>
                <div className="comments__greeting-signature">{ t('cms.draft.comments.greetings5') }</div>
              </div>
              <div className="comments__footer">
                <Svg hash="logo-comment-footer" className="comments__footer-logo" />
                <div className="comments__footer-copyright">
                  { t('cms.draft.comments.footer.copyright', { year: moment().year() }) }
                </div>
                <div
                  className="comments__acceptance-message"
                  dangerouslySetInnerHTML={ { __html: this.getHtmlOfTAndCElement() } }
                />
              </div>
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

Comments.propTypes = {
  t: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      propertySlug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  getPropertyCommentsStatus: PropTypes.string.isRequired,
  property: PropTypes.object,
  getPropertyComments: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

Comments.defaultProps = {
  t: () => {},
  matc: {
    params: {
      propertySlug: '',
    },
  },
  isGetPropertyIdle: false,
  getPropertyCommentsStatus: '',
  property: {},
  getPropertyComments: () => {},
  history: {
    push: () => {},
  },
};
