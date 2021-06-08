import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'antd';
import { getFreeCancellationPeriodText, allcancellationTrans, longtailCancellationPeriod } from '~helpers/longtail-cancellation-period';
import FreeCancellationPolicyRule from '~components/longtail-cancellation-policy/rule';
import CheckInTip from '~components/longtail-cancellation-policy/check-in-tip';

export default class FreeCancellationPolicy extends React.Component {
  render() {
    const { t, freeCancellationPeriod } = this.props;
    const content = allcancellationTrans[freeCancellationPeriod] || allcancellationTrans.other;
    const isUntilCheckIn = freeCancellationPeriod === longtailCancellationPeriod.NON_REFUNDABLE;
    const isCalendarDay0 =
      freeCancellationPeriod === longtailCancellationPeriod.BEFORE_MOVE_IN_CALENDAR_DAYS_0;

    return (
      <div className="longtail-cancellation-policy">
        <h2 className="longtail-cancellation-policy__title">
          { t('cms.free_cancellation_policy.title') }
          &nbsp;-&nbsp;
          { t(`cms.free_cancellation_policy.title_part.${freeCancellationPeriod.toLowerCase()}`) }
        </h2>
        <div className="longtail-cancellation-policy__container">
          <For of={ Object.keys(content) } each="item">
            <If condition={ content[item] }>
              <div
                key={ item }
                className={ classNames('longtail-cancellation-policy__content', {
                  'longtail-cancellation-policy__content--without': item === 'withOut',
                  'longtail-cancellation-policy__content--full': isUntilCheckIn,
                }) }
              >
                <div className="longtail-cancellation-policy__header">
                  <If condition={ !(isCalendarDay0 && item === 'withOut') }>
                    <h4 className={ classNames('longtail-cancellation-policy__header-title', {
                      'longtail-cancellation-policy__header-title--after': item === 'withOut',
                    }) }
                    >
                      { !isUntilCheckIn && item === 'withOut' ?
                        t(getFreeCancellationPeriodText(freeCancellationPeriod)) :
                        t('cms.free_cancellation_policy.booking_paid.title') }
                    </h4>
                  </If>
                </div>
                <FreeCancellationPolicyRule
                  t={ t }
                  type={ item }
                  freeCancellationPeriod={ freeCancellationPeriod }
                />
              </div>
            </If>
          </For>
          <CheckInTip freeCancellationPeriod={ freeCancellationPeriod } t={ t } />
        </div>
        <div className="longtail-cancellation-policy__icon-tips">
          <Icon type="info-circle" className="longtail-cancellation-policy__tips-svg" />
          {t('cms.longtail.free_cancellation_policy.tip')}
        </div>
      </div>
    );
  }
}

FreeCancellationPolicy.propTypes = {
  t: PropTypes.func.isRequired,
  freeCancellationPeriod: PropTypes.string,
};

FreeCancellationPolicy.defaultProps = {
  t: () => {},
  freeCancellationPeriod: '',
};
