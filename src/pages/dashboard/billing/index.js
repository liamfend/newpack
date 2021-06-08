import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '~actions/billing';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Icon, Button } from 'antd';
import generatePath from '~settings/routing';
import classNames from 'classnames';
import BillingCard from '~pages/dashboard/billing/card';
import { isFinancialRole, isAdminRole } from '~helpers/auth';

const mapDispatchToProps = dispatch => ({
  pendingTransfers: (onSuccess) => {
    dispatch(actions.pendingTransfers(onSuccess));
  },
  pendingReceivables: (status, onSuccess) => {
    dispatch(actions.pendingReceivables(status, onSuccess));
  },
  pendingRefunds: (status, onSuccess) => {
    dispatch(actions.pendingRefunds(status, onSuccess));
  },
});

@withRouter
@connect(null, mapDispatchToProps)
@withTranslation()
export default class BillingDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allCount: {
        pendingTransfer: 0,
        readyToInvoice: 0,
        invoiced: 0,
        pendingRefund: 0,
        refundedConfirmation: 0,
      },
    };

    this.billingManagement = ['transfers', 'receivables', 'refunds'];
    this.servalCards = {
      pendingTransfer: 'pending_transfer',
      readyToInvoice: 'ready_to_invoice',
      invoiced: 'invoiced',
      pendingRefund: 'pending_refund',
      refundedConfirmation: 'refunded_confirmation',
    };
  }

  componentDidMount() {
    this.changeHref();
    this.props.pendingTransfers((totalCount) => {
      this.setCountValue('pendingTransfer', totalCount);
    });

    this.props.pendingReceivables('PENDING_INVOICE', (totalCount) => {
      this.setCountValue('readyToInvoice', totalCount);
    });

    this.props.pendingReceivables('INVOICED', (totalCount) => {
      this.setCountValue('invoiced', totalCount);
    });

    this.props.pendingRefunds('PENDING_REFUND', (totalCount) => {
      this.setCountValue('pendingRefund', totalCount);
    });

    this.props.pendingRefunds('REFUND_CONFIRMATION', (totalCount) => {
      this.setCountValue('refundedConfirmation', totalCount);
    });
  }

  changeHref = () => {
    const { pathname } = window.location;
    if (isFinancialRole() && !pathname.includes('billing')) {
      const url = generatePath('billing', {});
      window.location.href = url;
    }

    if (!isFinancialRole() && !isAdminRole() && pathname.includes('billing')) {
      const url = generatePath('properties', {});
      window.location.href = url;
    }
  }

  setCountValue = (type, count) => {
    this.state.allCount[type] = count;
    this.setState(this.state);
  }

  getCardHref = (type) => {
    let href = '';
    switch (type) {
      case 'pendingTransfer':
        href = generatePath('billing.transfers', {}, { cardSearchStatus: 'PENDING_TRANSFER' });
        break;
      case 'readyToInvoice':
        href = generatePath('billing.receivables', {}, { cardSearchStatus: 'PENDING_INVOICE' });
        break;
      case 'invoiced':
        href = generatePath('billing.receivables', {}, { cardSearchStatus: 'INVOICED' });
        break;
      case 'pendingRefund':
        href = generatePath('billing.refunds', {}, { cardSearchStatus: 'PENDING_REFUND' });
        break;
      case 'refundedConfirmation':
        href = generatePath('billing.refunds', {}, { cardSearchStatus: 'REFUND_CONFIRMATION' });
        break;

      default:
        href = '';
    }

    return href;
  }

  render() {
    const { t } = this.props;

    return (
      <div className="billing">
        <div className="billing__cards">
          <For of={ Object.keys(this.servalCards) } each="stage">
            <div className="billing__data-card" key={ stage }>
              <h3 className="billing__card-value">
                { this.state.allCount[stage] || 0 }
              </h3>
              <Button
                type="link"
                className="billing__card-btn"
                href={ this.getCardHref(stage) }
              >
                { t(`cms.billing.card.${this.servalCards[stage]}.btn`) }
                <Icon type="right-circle" />
              </Button>
            </div>
          </For>
        </div>
        <div className="billing__content">
          <For of={ this.billingManagement } each="item" index="index">
            <button
              className={ classNames('billing__link', {
                'billing__link--even': index % 2 === 0,
              }) }
              onClick={ () => {
                this.props.history.push(generatePath(`billing.${item}`, {}));
              } }
              key={ item }
            >
              <BillingCard t={ t } type={ item } />
            </button>
          </For>
        </div>
      </div>
    );
  }
}

BillingDashboard.propTypes = {
  t: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  pendingTransfers: PropTypes.func,
  pendingReceivables: PropTypes.func,
  pendingRefunds: PropTypes.func,
};

BillingDashboard.defaultProps = {
  t: () => {},
  history: {
    push: () => {},
  },
  pendingTransfers: () => {},
  pendingReceivables: () => {},
  pendingRefunds: () => {},
};
