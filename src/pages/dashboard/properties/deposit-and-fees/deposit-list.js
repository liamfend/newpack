import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import DepositCard from '~pages/dashboard/properties/deposit-and-fees/deposit-card';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';

export default class DepositList extends React.Component {
  render() {
    const { t, paymentDepositRules, onClose } = this.props;
    return (
      <div className="deposit-and-fees__card-list">
        <Choose>
          <When condition={
            paymentDepositRules &&
            paymentDepositRules.edges &&
            paymentDepositRules.edges.length === 0 &&
            showElementByAuth(platformEntity.PAYMENTS_LINE_ITEM_RULES, entityAction.CREATE)
          }
          >
            <button
              className="deposit-and-fees__add-new"
              onClick={ () => { onClose('add'); } }
            >
              <Icon className="deposit-and-fees__add-new-icon" type="plus" />
              <span className="deposit-and-fees__add-new-fee-text">
                { t('cms.deposit_and_fees.content_ttl.deposit_card.add_new_fee') }
              </span>
            </button>
          </When>
          <When condition={ paymentDepositRules && paymentDepositRules.edges }>
            <For of={ paymentDepositRules.edges } each="deposit" index="index">
              <If condition={ deposit && deposit.node }>
                <DepositCard
                  t={ t }
                  key={ deposit.node.id }
                  paymentDepositRule={ deposit.node }
                  onClose={ onClose }
                  deletedDeposit={ this.props.deletedDeposit }
                  billingCycle={ this.props.billingCycle }
                  currency={ this.props.currency }
                />
              </If>
            </For>
          </When>
        </Choose>

      </div>
    );
  }
}

DepositList.propTypes = {
  t: PropTypes.func.isRequired,
  paymentDepositRules: PropTypes.object,
  onClose: PropTypes.func,
  deletedDeposit: PropTypes.func,
  currency: PropTypes.string,
  billingCycle: PropTypes.string,
};

DepositList.defaultProps = {
  t: () => {},
  paymentDepositRules: {},
  onClose: () => {},
  deletedDeposit: () => {},
  currency: '',
  billingCycle: '',
};
