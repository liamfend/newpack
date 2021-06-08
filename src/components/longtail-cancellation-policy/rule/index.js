import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Tooltip, Icon } from 'antd';
import { withInRules, allcancellationTrans, longtailCancellationPeriod } from '~helpers/longtail-cancellation-period';

export default class FreeCancellationPolicyRule extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cardHeight: 'auto',
    };

    this.contentType = [
      longtailCancellationPeriod.NON_REFUNDABLE,
      longtailCancellationPeriod.BEFORE_MOVE_IN_CALENDAR_DAYS_0,
    ].indexOf(props.freeCancellationPeriod) === -1 ?
      'other' : props.freeCancellationPeriod;

    this.content = allcancellationTrans[this.contentType][props.type];
  }

  componentDidMount() {
    this.setCardHeight();
  }

  setCardHeight = () => {
    const keppelCard = document.querySelector('.free-cancellation-policy-rule__card--keppel');
    if (keppelCard) {
      this.setState({
        cardHeight: keppelCard.offsetHeight,
      });
    }
  }

  render() {
    const { t } = this.props;

    return (
      <div className="free-cancellation-policy-rule">
        <If condition={ this.content }>
          <div
            style={ { height: this.state.cardHeight } }
            className="free-cancellation-policy-rule__card"
          >
            <h3 className="free-cancellation-policy-rule__card-title">
              { t(this.content.title) }
            </h3>

            <If condition={ this.content.desc }>
              <span className="free-cancellation-policy-rule__card-text">
                { t(this.content.desc) }
              </span>
            </If>
            <If condition={ this.content.hasRules }>
              <div className="free-cancellation-policy-rule__rules">
                <For of={ Object.keys(withInRules) } each="rule">
                  <div className="free-cancellation-policy-rule__rule" key={ rule }>
                    <div className="free-cancellation-policy-rule__img">
                      <Icon
                        type={ withInRules[rule].icon }
                        className={ classNames('free-cancellation-policy-rule__icon', {
                          'free-cancellation-policy-rule__icon--close': withInRules[rule].icon === 'close',
                        }) }
                      />
                    </div>
                    <span className="free-cancellation-policy-rule__lable">
                      { t(withInRules[rule].text) }
                      <If condition={ withInRules[rule].tip }>
                        <Tooltip
                          placement="top"
                          title={ t(withInRules[rule].tip) }
                        >
                          <Icon type="question-circle" className="free-cancellation-policy-rule__tooltip-icon" />
                        </Tooltip>
                      </If>
                    </span>
                  </div>
                </For>
              </div>
            </If>
          </div>
        </If>
      </div>
    );
  }
}

FreeCancellationPolicyRule.propTypes = {
  t: PropTypes.func.isRequired,
  type: PropTypes.string,
  freeCancellationPeriod: PropTypes.string,
};

FreeCancellationPolicyRule.defaultProps = {
  t: () => {},
  type: 'withIn',
  freeCancellationPeriod: '',
};
