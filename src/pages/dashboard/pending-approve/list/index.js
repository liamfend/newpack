import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import Svg from '~components/svg';
import { fireCustomEvent } from '~helpers/custom-events';
import { Icon, Tooltip } from 'antd';
import { connect } from 'react-redux';
import * as pendingApprovalActions from '~actions/pending-approval';
import * as propertyEditActions from '~actions/properties/property-edit';
import ReviewDraftModal from '~pages/dashboard/pending-approve/review-draft-modal';
import PendingApproveListCard from '~pages/dashboard/pending-approve/list/list-card';
import { draftType, communicationStatus } from '~constants';

const mapStateToProps = (state) => {
  const pendingApprovalData = state.dashboard.pendingApproval.toJS();
  const data = state.dashboard.listingManagement.toJS();

  return {
    property: data.payload,
    getPropertyStatus: data.communication.getDetail.status,
    drafts: pendingApprovalData.drafts.payload,
    role: state.auth.get('auth'),
  };
};

const mapDispatchToProps = dispatch => ({

  getPendingApprovalList: (successCallback, params) => {
    dispatch(pendingApprovalActions.getPendingApprovalList(successCallback, params));
  },
  getPropertyDetail: (slug, successCallback) => {
    dispatch(propertyEditActions.getPropertyDetail(slug, successCallback));
  },
  processPropertyDraft: (data, success) => {
    dispatch(pendingApprovalActions.processPropertyDraft(data, success));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class PendingApproveList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowList: false,
      showReviewModal: false,
      isShowCommentModal: false,
      currentDraftCategory: [],
      draftId: '',
    };

    this.draftReviewModalLock = false;
  }

  componentDidMount() {
    if (
      !this.props.showSwitchRoleModal
      && this.props.role
      && this.props.role.currentRoleSlug
    ) {
      this.getDraftList();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.role !== prevProps.role) {
      this.getDraftList();
    }
  }

  getDraftList = () => {
    const draftTypes = [draftType.PENDING];

    this.props.getPendingApprovalList(() => {
      if (this.props.drafts.length > 0) {
        this.showList();
      }
    }, { statuses: draftTypes },
    );
  }

  showList = () => {
    this.changeDashboardStyle();
    if (!this.state.isShowList) {
      fireCustomEvent('triggerCloseMenu');
    }

    this.setState({
      isShowList: !this.state.isShowList,
    });

    setTimeout(() => {
      fireCustomEvent('toggleCollapseSidebarTriggers');
    }, 300);
  }

  changeDashboardStyle = () => {
    const dashboardLayout = document.querySelector('.dashboard__layout');
    const propertyList = document.querySelector('.property-list');
    const propertyListContainer = document.querySelector('.property-list__list');

    if (dashboardLayout && propertyList && !this.state.isShowList) {
      propertyList.setAttribute('class', 'property-list property-list--small');
      propertyListContainer.setAttribute('class', 'property-list__list');
      dashboardLayout.style.minWidth = '1261px';
    } else {
      propertyList.setAttribute('class', 'property-list');
      dashboardLayout.style.minWidth = '780px';
    }
  }

  reviewDraft = (draft, draftsCategory) => {
    if (!draft || !draft.propertySlug) {
      this.setState({ showReviewModal: false });
      return false;
    }

    if (this.draftReviewModalLock) {
      return false;
    }

    this.draftReviewModalLock = true;

    // request this draft more property info
    this.props.getPropertyDetail(draft.propertySlug, () => {
      this.draftReviewModalLock = false;
      this.setState({ showReviewModal: true, currentDraftCategory: draftsCategory });
    });
    return true;
  }

  render() {
    const { t, property, getPropertyStatus,
      showSwitchRoleModal, processPropertyDraft } = this.props;
    const { currentDraftCategory } = this.state;

    return (
      <div className="pending-approve">
        <div className="pending-approve__menu">
          <Choose>
            <When condition={ !this.state.isShowList }>
              <Tooltip
                placement="left"
                arrowPointAtCenter
                title={ t('cms.properties.pending_approval.list.title') }
              >
                <button onClick={ this.showList } className="pending-approve__list-btn">
                  <Svg className="pending-approve__list-icon" hash="pending-approve" />
                  <If condition={ this.props.drafts.length > 0 }>
                    <span className="pending-approve__red-dot" />
                  </If>
                </button>
              </Tooltip>
            </When>
            <Otherwise>
              <button
                onClick={ this.showList }
                className="pending-approve__list-btn pending-approve__list-btn--click"
              >
                <Svg className="pending-approve__list-icon" hash="pending-approve" />
              </button>
            </Otherwise>
          </Choose>
        </div>
        <div className={ classNames('pending-approve__list-wrap', {
          'pending-approve__list-wrap--open':
          this.state.isShowList && !showSwitchRoleModal,
        }) }
        >
          <div className="pending-approve__list">
            <div className="pending-approve__list-header">
              <div className="pending-approve__list-header-container">
                <h3 className="pending-approve__list-title">
                  { t('cms.properties.pending_approval.list.title') }
                </h3>
                <span className="pending-approve__list-text" >
                  { t('cms.properties.pending_approval.list.text', {
                    pendingApprovalTotal: this.props.drafts.length,
                  }) }
                </span>
              </div>
              <div className="pending-approve__close-container">
                <button className="pending-approve__close-btn" onClick={ this.showList }>
                  <Icon type="close" style={ { fontSize: '14px', color: '#9e9e9e' } } />
                </button>
              </div>
            </div>
            <If condition={ this.props.drafts.length > 0 }>
              <PendingApproveListCard
                t={ t }
                drafts={ this.props.drafts }
                reviewDraft={ this.reviewDraft }
              />
            </If>
          </div>
        </div>
        <If condition={
          this.state.showReviewModal
          && getPropertyStatus !== communicationStatus.FETCHING
        }
        >
          <ReviewDraftModal
            activeModal
            t={ t }
            onClose={ this.reviewDraft }
            originalData={ property }
            processPropertyDraft={ processPropertyDraft }
            draftsCategory={ currentDraftCategory }
          />
        </If>
      </div>
    );
  }
}

PendingApproveList.propTypes = {
  t: PropTypes.func.isRequired,
  drafts: PropTypes.object,
  property: PropTypes.object,
  getPendingApprovalList: PropTypes.func,
  getPropertyDetail: PropTypes.func,
  getPropertyStatus: PropTypes.string,
  role: PropTypes.object,
  showSwitchRoleModal: PropTypes.bool,
  processPropertyDraft: PropTypes.func,
};

PendingApproveList.defaultProps = {
  t: () => {},
  drafts: {},
  property: {},
  getPendingApprovalList: () => {},
  getPropertyDetail: () => {},
  getPropertyStatus: '',
  role: {},
  showSwitchRoleModal: false,
  processPropertyDraft: () => {},
};
