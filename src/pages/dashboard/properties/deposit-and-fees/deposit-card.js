import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';
import moment from 'moment';
import { depositType, platformEntity, entityAction } from '~constants';
import DeleteBtn from '~pages/dashboard/properties/deposit-and-fees/delete-btn';
import showElementByAuth from '~helpers/auth';

export default class DepositList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cardWidth: 275,
    };
  }

  componentDidMount() {
    this.showCardNumber();
    window.addEventListener('resize', this.showCardNumber);
  }

  componentWillUnmount() {
    document.removeEventListener('resize', this.showCardNumber);
  }

  showCardNumber = () => {
    const depositAndFees = document.querySelector('.deposit-and-fees__card-list');
    const depositAndFeesWidth = depositAndFees ? depositAndFees.clientWidth : 0;
    let width = 0;
    if (depositAndFeesWidth < 614) {
      width = depositAndFeesWidth - 20;
    }

    if (!(depositAndFeesWidth < 614) && depositAndFeesWidth < 909) {
      width = (depositAndFeesWidth - 40) / 2;
    }

    if (!(depositAndFeesWidth < 909) && depositAndFeesWidth < 1204) {
      width = (depositAndFeesWidth - 60) / 3;
    }

    if (depositAndFeesWidth >= 1204) {
      width = (depositAndFeesWidth - 80) / 4;
    }

    this.setState({
      cardWidth: width,
    });
  }

  render() {
    const {
      t, paymentDepositRule, onClose, billingCycle, deletedDeposit,
    } = this.props;
    return (
      <div className="deposit-and-fees__card" style={ { width: this.state.cardWidth } }>
        <div className="deposit-and-fees__type">
          <Choose>
            <When condition={ paymentDepositRule.type === depositType.DEPOSIT_PERCENTAGE }>
              <span className="deposit-and-fees__type-text"> P </span>
            </When>
            <When condition={ paymentDepositRule.type === depositType.FIXED_AMOUNT }>
              <span className="deposit-and-fees__type-text"> F </span>
            </When>
            <When condition={ paymentDepositRule.type === depositType.PER_BILLING_CYCLE }>
              <span className="deposit-and-fees__type-text"> B </span>
            </When>
          </Choose>
        </div>
        <Tooltip
          placement="top"
          arrowPointAtCenter
          title={ paymentDepositRule.name }
        >
          <h4 className="deposit-and-fees__card-name">
            { paymentDepositRule.name }
          </h4>
        </Tooltip>
        <span className="deposit-and-fees__card-value">
          <Choose>
            <When condition={ paymentDepositRule.type === depositType.DEPOSIT_PERCENTAGE }>
              { paymentDepositRule.value }%
            </When>
            <When condition={ paymentDepositRule.type === depositType.FIXED_AMOUNT }>
              { this.props.currency }&nbsp;{ paymentDepositRule.value }
            </When>
            <When condition={ paymentDepositRule.type === depositType.PER_BILLING_CYCLE }>
              { paymentDepositRule.value }&nbsp;
              <If condition={ billingCycle && billingCycle.toLowerCase() }>
                <span className="deposit-and-fees__card-value--month">
                  {t(`cms.deposit_and_fees.deposit_card.value.${billingCycle.toLowerCase()}`)}
                </span>
              </If>
            </When>
          </Choose>
        </span>
        <span className="deposit-and-fees__update-time">
          { t('cms.deposit_and_fees.deposit_card.upate_time') }
          { paymentDepositRule.updatedAt ?
            ` ${moment(paymentDepositRule.updatedAt).format('DD/MM/YYYY')}` : ' ~ ' }
        </span>
        <div className="deposit-and-fees__card-footer">
          <If condition={ showElementByAuth(
            platformEntity.PAYMENTS_LINE_ITEM_RULES,
            entityAction.UPDATE,
          ) }
          >
            <button
              className="deposit-and-fees__edit-btn"
              onClick={ () => { onClose('edit', paymentDepositRule.id); } }
            >
              <Icon type="edit" style={ { color: '#38b2a6' } } />
            </button>
          </If>
          <If condition={ showElementByAuth(
            platformEntity.PAYMENTS_LINE_ITEM_RULES,
            entityAction.DELETE,
          ) }
          >
            <span className="deposit-and-fees__midline">|</span>
            <div className="deposit-and-fees__deleted">
              <DeleteBtn
                t={ t }
                deletedDeposit={ deletedDeposit }
                depositId={ paymentDepositRule.id }
                type="card"
              />
            </div>
          </If>
        </div>
      </div>
    );
  }
}

DepositList.propTypes = {
  t: PropTypes.func.isRequired,
  paymentDepositRule: PropTypes.object,
  onClose: PropTypes.func,
  deletedDeposit: PropTypes.func,
  billingCycle: PropTypes.string,
  currency: PropTypes.string,
};

DepositList.defaultProps = {
  t: () => {},
  paymentDepositRule: {},
  onClose: () => {},
  deletedDeposit: () => {},
  billingCycle: '',
  currency: '',
};
