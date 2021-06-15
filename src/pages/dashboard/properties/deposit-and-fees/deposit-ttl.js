import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import { DepositBg as DepositBgIcon } from "~components/svgs";
import { depositType } from '~constants';

export default class DepositTTL extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allType: [],
    };
  }

  componentDidMount() {
    if (this.props.paymentDepositRules) {
      this.getPropertyDepositType();
    }
  }

  getPropertyDepositType = () => {
    const types = [];

    if (
      this.props.paymentDepositRules
      && this.props.paymentDepositRules.edges
      && this.props.paymentDepositRules.edges.length > 0
    ) {
      this.props.paymentDepositRules.edges.map((deposit) => {
        if (types.indexOf(deposit.node.type) === -1) {
          types.push(deposit.node.type);
        }
        return true;
      });
    }

    this.setState({ allType: types });
  }

  depositFormula = () => {
    const types = this.state.allType;
    if (types.length === 1) {
      if (types.indexOf(depositType.FIXED_AMOUNT) !== -1) {
        return '= F';
      }
      if (types.indexOf(depositType.PER_BILLING_CYCLE) !== -1) {
        return '= B';
      }
    }

    if (types.length === 2) {
      if (types.indexOf(depositType.DEPOSIT_PERCENTAGE) !== -1
        && types.indexOf(depositType.FIXED_AMOUNT) !== -1) {
        return '= (1+P)*F';
      }
      if (types.indexOf(depositType.PER_BILLING_CYCLE) !== -1
        && types.indexOf(depositType.FIXED_AMOUNT) !== -1) {
        return '= F+B';
      }
      if (types.indexOf(depositType.DEPOSIT_PERCENTAGE) !== -1
        && types.indexOf(depositType.PER_BILLING_CYCLE) !== -1) {
        return '= (1+P)*B';
      }
    }

    if (types.length === 3) {
      return '= (1+P)*(F+B)';
    }

    return '';
  }

  render() {
    const { t } = this.props;
    const { allType } = this.state;

    return (
      <div className="deposit-and-fees__ttl">
        <div className="deposit-and-fees__ttl-title">
          <span className="deposit-and-fees__ttl-title-text">
            { t('cms.deposit_and_fees.content_ttl.title') }
          </span>
        </div>
        <div className="deposit-and-fees__ttl-content">
          <Choose>
            <When condition={
              allType.length === 1
              && allType[0] === depositType.DEPOSIT_PERCENTAGE
            }
            >
              <Icon
                className="deposit-and-fees__warning-icon"
                style={ { color: '#F5A623' } }
                type="exclamation-circle"
                theme="filled"
              />
              <span className="deposit-and-fees__ttl-deposit-text">
                &nbsp;&nbsp;{ t('cms.deposit_and_fees.content_ttl.deposit_only_percentage_type.tips') }
              </span>
            </When>
            <When condition={ allType.length === 0 }>
              <span className="deposit-and-fees__ttl-deposit-text">
                { t('cms.deposit_and_fees.content_ttl.deposit.tips') }
              </span>
            </When>
            <Otherwise>
              <span className="deposit-and-fees__ttl-deposit-text">
                { t('cms.deposit_and_fees.content_ttl.deposit.ttl_amount') }
              </span>
              <span className="deposit-and-fees__ttl-deposit-text--amount">
                { this.depositFormula() }
              </span>
            </Otherwise>
          </Choose>
        </div>
        <div className="deposit-and-fees__ttl-formula">
          <span className="deposit-and-fees__ttl-formula-text">
            <span className="deposit-and-fees__type-abbreviation">F</span>
            { t('cms.deposit_and_fees.ttl_formula_textl.fixed') }
          </span>
          <span className="deposit-and-fees__ttl-formula-text">
            <span className="deposit-and-fees__type-abbreviation">P</span>
            { t('cms.deposit_and_fees.ttl_formula_textl.percentage') }
          </span>
          <span className="deposit-and-fees__ttl-formula-text">
            <span className="deposit-and-fees__type-abbreviation">B</span>
            { t('cms.deposit_and_fees.ttl_formula_textl.billing_cycle') }
          </span>
        </div>
        <DepositBgIcon className="deposit-and-fees__ttl-bg" />
      </div>
    );
  }
}

DepositTTL.propTypes = {
  t: PropTypes.func.isRequired,
  paymentDepositRules: PropTypes.object,
};

DepositTTL.defaultProps = {
  t: () => {},
  paymentDepositRules: {},
};
