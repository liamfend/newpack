import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, Tooltip, Popconfirm } from 'antd';
import Svg from '~components/svg';
import { getSymbolFromCurrency } from '~base/global/helpers/currency';
import { commissionStatus } from '~constants/commission';
import * as commissionActions from '~actions/properties/commission';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';

const mapDispatchToProps = dispatch => ({
  deleteCommission: (input) => {
    dispatch(commissionActions.deleteCommission(input));
  },
});
@connect(null, mapDispatchToProps)
export default class CommissionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCard: 3,
    };
    this.timeDom = [];
  }

  componentDidMount() {
    this.showCardNumber();
    window.addEventListener('resize', this.showCardNumber);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.showCardNumber);
  }

  showCardNumber = () => {
    const dashboardLayout = document.querySelector('.dashboard__layout');
    const dashboardLayoutWidth = dashboardLayout ? dashboardLayout.clientWidth : 0;
    if (dashboardLayoutWidth >= 1063) {
      this.setState({
        showCard: 3,
      });
    }

    if (dashboardLayoutWidth < 1063 && dashboardLayoutWidth > 724) {
      this.setState({
        showCard: 2,
      });
    }
  }

  showUpdate = updatedAt => (
    <React.Fragment>
      <span>{this.props.t('cms.property.commission.list.updated_time')}:&nbsp;</span>
      <span className="commission-list__update-time">{moment(updatedAt).format('DD/MM/YYYY HH:mm:ss')}</span>
    </React.Fragment>
  )

  sortCommission = (commission) => {
    if (commission.length === 0) {
      return [];
    }

    const statusSortArr = [
      commissionStatus.ACTIVE,
      commissionStatus.INACTIVE,
      commissionStatus.EXPIRE,
    ];

    return [...commission].sort((a, b) => {
      if (a.status === b.status) {
        return moment(a.updatedAt).isBefore(moment(b.updatedAt));
      }

      return statusSortArr.indexOf(a.status) - statusSortArr.indexOf(b.status);
    });
  };

  handleDeleteCommission = (id) => {
    this.props.deleteCommission({ id });
  };

  render() {
    const { showCard } = this.state;
    const { t } = this.props;
    return (
      <div className="commission-list">
        <If condition={ showElementByAuth(
          platformEntity.COMMISSION_COMISSION_TIERS,
          entityAction.CREATE,
        ) }
        >
          <div className={ classNames('commission-list__card commission-list__add', { 'commission-list__second': showCard === 2 }) }>
            <div className="commission-list__add-content" onClick={ () => { this.props.openModal('addNew'); } } role="button" tabIndex="0" >
              <Svg hash="commission-add" className="commission-list__add-icon" />
              <p>{t('cms.property.commission.create.create_commission_modal.add.title')}</p>
            </div>
          </div>
        </If>
        <For index="index" of={ this.sortCommission(this.props.commissionTier) } each="commissionTier">
          <div key={ index } className={ classNames('commission-list__card', { 'commission-list__second': showCard === 2 }) }>
            <div className={
              classNames('commission-list__status',
                { 'commission-list__status--active': commissionTier.status === commissionStatus.ACTIVE },
                { 'commission-list__status--expire': commissionTier.status === commissionStatus.EXPIRE })
            }
            >
              <If condition={ commissionTier.status }>
              &nbsp;
                {t(`cms.property.commission.list.status.${commissionTier.status.toLowerCase()}`)}
              </If>
            </div>
            <div className={ classNames('commission-list__icon-box', { 'commission-list__icon-box--grey': commissionTier.status === commissionStatus.EXPIRE }) }>
              <If condition={ commissionTier.category }>
                <Svg
                  hash={ commissionTier.category.toLowerCase().replace('_', '-') }
                  className={ classNames('commission-list__list-icon', { 'commission-list__list-icon--rebookers': commissionTier.category === 'REBOOKERS_COMMISSION' }) }
                />
              </If>
            </div>
            <div className="commission-list__text">
              <div className="commission-list__category">
                <If condition={ commissionTier.category }>
                  {t(`cms.property.commission.create.commission_type.${commissionTier.category.toLowerCase()}`)}
                </If>
              </div>
              <div className="commission-list__great-commission">
                {commissionTier.name}
              </div>
              <div className="commission-list__percentage">
                <If condition={ commissionTier.type === 'VALUE' }>
                  {`${getSymbolFromCurrency(this.props.currency)}${commissionTier.value}`}
                </If>
                <If condition={ commissionTier.type === 'PERCENTAGE' }>
                  {`${commissionTier.value}%`}
                </If>
                <If condition={ commissionTier.bonus }>
                  <div className="commission-list__bonus">
                    <div className="commission-list__bonus-text">
                      {t('cms.property.commission.list.bonus')}
                    </div>
                    <Svg hash="commission-bonus" className="commission-list__bonus-icon" />
                  </div>
                </If>
              </div>
              <If condition={ commissionTier.category === 'NUM_BOOKINGS' }>
                <div className="commission-list__booking-number">
                  {t('cms.property.commission.list.booking_numbers')}:&nbsp;
                  <If condition={ commissionTier.bookingCountTo }>
                    <span>{commissionTier.bookingCountFrom}
                      ~&nbsp;{commissionTier.bookingCountTo}</span>
                  </If>
                  <If condition={ !commissionTier.bookingCountTo }>
                    <span>{commissionTier.bookingCountFrom} {t('cms.property.commission.list.more_than')}</span>
                  </If>
                </div>
              </If>
              <If condition={ commissionTier.category === 'TENANCY_LENGTH' }>
                <div className="commission-list__booking-number">
                  {t('cms.property.commission.list.tenancy_length')}:&nbsp;
                  <If condition={ commissionTier.tenancyLengthTo }>
                    <span>{commissionTier.tenancyLengthFrom}
                      ~&nbsp;{commissionTier.tenancyLengthTo}&nbsp;&nbsp;{
                        commissionTier.tenancyUnit ?
                          `(${commissionTier.tenancyUnit.toLowerCase()})` : null
                      }</span>
                  </If>
                  <If condition={ !commissionTier.tenancyLengthTo }>
                    <span>{commissionTier.tenancyLengthFrom}&nbsp;{t('cms.property.commission.list.more_than')}&nbsp;&nbsp;{
                      commissionTier.tenancyUnit ?
                        `(${commissionTier.tenancyUnit.toLowerCase()})` : null
                    }</span>
                  </If>
                </div>
              </If>
              <div className="commission-list__effective-dates">
                {`${t('cms.property.commission.list.effective_dates')}: ${moment(commissionTier.effectiveFrom).format('DD/MM/YYYY')} ~ ${commissionTier.effectiveTo ? moment(commissionTier.effectiveTo).format('DD/MM/YYYY') : ''}`}
              </div>
            </div>
            <div className="commission-list__bottom">
              <div className="commission-list__btn-box">
                <If condition={ showElementByAuth(
                  platformEntity.COMMISSION_COMISSION_TIERS,
                  entityAction.UPDATE,
                ) }
                >
                  <button
                    className="listings-tab__edit-listing-btn"
                    onClick={ () => { this.props.openModal('edit', commissionTier); } }
                  >
                    <Icon
                      type="edit"
                      style={ {
                        color: '#38b2a6',
                      } }
                    />
                  </button>
                </If>
                <If condition={ showElementByAuth(
                  platformEntity.COMMISSION_COMISSION_TIERS,
                  entityAction.CREATE,
                ) }
                >
                  <button
                    className={ 'listings-tab__copy-listing-btn commission-list__copy' }
                    onClick={ () => { this.props.openModal('copy', commissionTier); } }
                  >
                    <Icon
                      type="copy"
                      style={ {
                        color: '#38b2a6',
                      } }
                    />
                  </button>
                </If>
                <If condition={ showElementByAuth(
                  platformEntity.COMMISSION_COMISSION_TIERS,
                  entityAction.DELETE,
                ) }
                >
                  <Popconfirm
                    placement="top"
                    title={ t('cms.properties.edit.commission.delete_commission_hint') }
                    onConfirm={ (e) => {
                      e.stopPropagation(); this.handleDeleteCommission(commissionTier.id);
                    } }
                    onCancel={ (e) => { e.stopPropagation(); } }
                    okText={ t('cms.properties.edit.btn.yes') }
                    okType="danger"
                    cancelText={ t('cms.properties.edit.btn.no') }
                  >
                    <button className={ 'listings-tab__copy-listing-btn commission-list__delete' }>
                      <Icon
                        type="delete"
                        style={ {
                          color: '#38b2a6',
                        } }
                      />
                    </button>
                  </Popconfirm>
                </If>
              </div>
              <Tooltip
                title={ this.showUpdate(commissionTier.updatedAt) }
                getPopupContainer={ () => this.timeDom[index] }
                placement="topRight"
                arrowPointAtCenter
              >
                <div
                  className="commission-list__update"
                  ref={ (node) => { this.timeDom[index] = node; } }
                >
                  <Svg
                    className="property-card__icon property-card__update-icon"
                    hash="time"
                  />
                </div>
              </Tooltip>
            </div>
          </div>
        </For>
      </div>
    );
  }
}

CommissionList.propTypes = {
  openModal: PropTypes.func.isRequired,
  commissionTier: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  deleteCommission: PropTypes.func.isRequired,
};


CommissionList.defaultProps = {
  openModal: () => {},
  commissionTier: [],
  t: () => {},
  currency: '',
  deleteCommission: () => {},
};
