import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import * as depositActions from '~actions/properties/deposit';
import Header from '~components/property-header';
import DepositTTL from '~pages/dashboard/properties/deposit-and-fees/deposit-ttl';
import DepositList from '~pages/dashboard/properties/deposit-and-fees/deposit-list';
import DepositModal from '~pages/dashboard/properties/deposit-and-fees/deposit-modal';
import { communicationStatus, platformEntity, entityAction } from '~constants';
import { Spin, Switch, Icon, Tooltip, Popconfirm } from 'antd';
import { Deposit as DepositIcon } from "~components/svgs";
import showElementByAuth from '~helpers/auth';
import authControl from '~components/auth-control';
import generatePath from '~settings/routing';
import { isEmptyObject } from '~client/helpers/property-edit';

const mapStateToProps = (state) => {
  const data = state.dashboard.depositReducer.toJS();

  return {
    property: data.propertyDeposite || {},
    getPropertyStatus: data.communication.getPropertyDeposite.status,
    deleteStatus: data.communication.delete.status,
    updatePropertyStatus: data.communication.updatePropertyPaymentsEnable.status,
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyDepositePayment: (slug, successCallback) => {
    dispatch(depositActions.getPropertyDepositePayment(slug, successCallback));
  },
  createDeposit: (data, successCallback) => {
    dispatch(depositActions.createDeposit(data, successCallback));
  },
  updateDeposit: (data, successCallback) => {
    dispatch(depositActions.updateDeposit(data, successCallback));
  },
  deletedDeposit: (id, successCallback) => {
    dispatch(depositActions.deletedDeposit({ id }, successCallback));
  },
  updatePropertyPaymentsEnabled: (data, successCallback) => {
    dispatch(depositActions.updatePropertyPaymentsEnabled(data, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(
  platformEntity.PAYMENTS_LINE_ITEM_RULES,
  entityAction.READ,
  props => generatePath('property.homepage', { propertySlug: props.match.params.propertySlug }),
)
export default class DepositAndFees extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalType: null,
      depositId: null,
      isLoading: true,
      showBookNowModal: false,
      propertySlug: decodeURIComponent(props.match.params.propertySlug),
    };
  }

  componentDidMount() {
    this.props.getPropertyDepositePayment(this.state.propertySlug, () => {
      if (isEmptyObject(this.props.property)) {
        this.props.history.push(generatePath('properties', {}));
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.getPropertyStatus === communicationStatus.IDLE
        && prevProps.getPropertyStatus === communicationStatus.FETCHING)
    ) {
      this.showLoadingModal();
    }
  }

  showLoadingModal = () => {
    this.setState({ isLoading: true });
  }

  closeModal = (type, id) => {
    this.setState({
      showModal: !this.state.showModal,
      modalType: type,
      depositId: id || null,
    });
  }

  enableBookNow = () => {
    const params = {};
    params.id = this.props.property.id;
    params.paymentsEnabled = !this.props.property.paymentsEnabled;
    params.paymentProcess = this.props.property.paymentProcess || 'ONLINE';

    this.props.updatePropertyPaymentsEnabled(params, () => {
      this.props.getPropertyDepositePayment(this.state.propertySlug);
    });

    this.setState({
      isLoading: false,
      showBookNowModal: false,
    });
  }

  getVaildDepositCount = (data) => {
    const depositData = data || this.props.property;
    const totalCount = depositData.paymentDepositRules &&
      depositData.paymentDepositRules.edges &&
      depositData.paymentDepositRules.edges.length ?
      depositData.paymentDepositRules.edges.filter(rule => rule.node.type !== 'DEPOSIT_PERCENTAGE').length : 0;

    return totalCount;
  }

  handleBookNowModal = (bool) => {
    this.setState({
      showBookNowModal: bool,
    });
  }

  handleCreateDeposit = (params) => {
    this.props.createDeposit(params, () => {
      this.props.getPropertyDepositePayment(this.state.propertySlug);
    });
  }

  handleUpdateDeposit = (params) => {
    this.props.updateDeposit(params, this.getDepositePayment);
  }

  handleDeletedDeposit = (id) => {
    this.props.deletedDeposit(id, this.getDepositePayment);
  }

  getDepositePayment = () => {
    const propertyData = { ...this.props.property };
    this.props.getPropertyDepositePayment(this.state.propertySlug,
      (data) => {
        if (
          data.property
          && propertyData.acceptsDepositPayment
          && propertyData.acceptsDepositPayment !== data.property.acceptsDepositPayment
        ) {
          this.handleBookNowModal(true);
        }
      },
    );
  }

  render() {
    const { t, property, getPropertyStatus, updatePropertyStatus } = this.props;
    const totalCount = property.paymentDepositRules &&
      property.paymentDepositRules.edges &&
      property.paymentDepositRules.edges.length ?
      property.paymentDepositRules.edges.length : 0;

    return (
      <div className="deposit-and-fees">
        <Choose>
          <When condition={
            getPropertyStatus !== communicationStatus.IDLE
            && this.state.isLoading
          }
          >
            <div className="property-edit__loading"><Spin /></div>
          </When>
          <Otherwise>
            <Header t={ t } property={ property } type="deposit-and-fees" />
            <div className="deposit-and-fees__content">
              <div className="deposit-and-fees__content-header">
                <div className="deposit-and-fees__header">
                  <DepositIcon className="deposit-and-fees__header-svg" />
                  <h3 className="deposit-and-fees__header-title" ref={ (node) => { this.titleContainer = node; } }>
                    { t('cms.deposit_and_fees.content_header.title') }
                    <Tooltip
                      arrowPointAtCenter
                      overlayClassName={
                        this.getVaildDepositCount() > 0 || this.state.showBookNowModal ? 'deposit-and-fees__book-now-tips--hidden' : ''
                      }
                      placement="top"
                      title={ t('cms.deposit_and_fees.content_header.no_valid.text') }
                    >
                      <Switch
                        defaultChecked={ property.acceptsDepositPayment }
                        checkedChildren="On "
                        unCheckedChildren="Off "
                        disabled={ this.getVaildDepositCount() <= 0 ||
                          !showElementByAuth(
                            platformEntity.PROPERTIES_PROPERTIES,
                            entityAction.UPDATE,
                          )
                        }
                        className="deposit-and-fees__header-switch"
                        onClick={ this.enableBookNow }
                        loading={ updatePropertyStatus === communicationStatus.FETCHING }
                      />
                    </Tooltip>
                  </h3>
                  <Popconfirm
                    trigger="click"
                    visible={ this.state.showBookNowModal }
                    title={ t('cms.deposit_and_fees.content_header.no_valid_modal.text') }
                    placement="rightTop"
                    onConfirm={ () => { this.handleBookNowModal(false); } }
                    okText={ t('cms.deposit_and_fees.content_header.no_valid_modal.btn.text') }
                    getPopupContainer={ () => this.titleContainer }
                    overlayClassName="deposit-and-fees__switch-popup"
                    overlayStyle={ { width: 322 } }
                  />
                  <span className="deposit-and-fees__header-text">
                    { t('cms.deposit_and_fees.content_header.no_valid.text') }
                  </span>
                </div>
              </div>
              <div className={ `deposit-and-fees__list 
                ${totalCount <= 0 ? 'deposit-and-fees__list-empaty' : ''} ` }
              >
                <If condition={ property }>
                  <If condition={ totalCount > 0 && showElementByAuth(
                    platformEntity.PAYMENTS_LINE_ITEM_RULES,
                    entityAction.CREATE,
                  ) }
                  >
                    <button
                      className="deposit-and-fees__list-add-new"
                      onClick={ () => { this.closeModal('add'); } }
                    >
                      <Icon type="plus" />
                      <span className="deposit-and-fees__add-new-text">
                        { t('cms.deposit_and_fees.content_ttl.deposit_card.add_new_fee') }
                      </span>
                    </button>
                  </If>
                  <div className="deposit-and-fees__list-left">
                    <DepositTTL
                      t={ t }
                      property={ property }
                      paymentDepositRules={ property.paymentDepositRules }
                    />
                  </div>
                  <div className="deposit-and-fees__list-right">
                    <If condition={ property.paymentDepositRules }>
                      <DepositList
                        t={ t }
                        paymentDepositRules={ property.paymentDepositRules }
                        onClose={ this.closeModal }
                        deletedDeposit={ this.handleDeletedDeposit }
                        billingCycle={
                          property && property.billingCycle ?
                            property.billingCycle : ''
                        }
                        currency={
                          property && property.currency ?
                            property.currency : ''
                        }
                        deleteStatus={ this.props.deleteStatus }
                      />
                    </If>
                  </div>
                </If>
              </div>
            </div>
            <If condition={ this.state.showModal }>
              <DepositModal
                t={ t }
                activeModal
                property={ property }
                onClose={ this.closeModal }
                createDeposit={ this.handleCreateDeposit }
                updateDeposit={ this.handleUpdateDeposit }
                deletedDeposit={ this.handleDeletedDeposit }
                modalType={ this.state.modalType }
                depositId={ this.state.depositId }
                isLast={ totalCount === 1 }
                acceptsDepositPayment={ property.acceptsDepositPayment }
              />
            </If>
          </Otherwise>
        </Choose>
        <span className="deposit-and-fees__content-line" />
      </div>
    );
  }
}

DepositAndFees.propTypes = {
  t: PropTypes.func.isRequired,
  getPropertyDepositePayment: PropTypes.func,
  property: PropTypes.object,
  getPropertyStatus: PropTypes.string,
  match: PropTypes.object,
  updatePropertyStatus: PropTypes.string,
  deleteStatus: PropTypes.string,
  createDeposit: PropTypes.func,
  updateDeposit: PropTypes.func,
  deletedDeposit: PropTypes.func,
  updatePropertyPaymentsEnabled: PropTypes.func,
  history: PropTypes.object,
};

DepositAndFees.defaultProps = {
  t: () => {},
  getPropertyDepositePayment: () => {},
  property: {},
  getPropertyStatus: '',
  match: {},
  updatePropertyStatus: '',
  deleteStatus: '',
  createDeposit: () => {},
  updateDeposit: () => {},
  deletedDeposit: () => {},
  updatePropertyPaymentsEnabled: () => {},
  history: {},
};
