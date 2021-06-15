import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { longtailCancellationPeriod } from '~helpers/longtail-cancellation-period'

export default class CheckInTip extends React.Component {
  render() {
    const { t, freeCancellationPeriod } = this.props
    const isCalendarDay0 =
      freeCancellationPeriod === longtailCancellationPeriod.BEFORE_MOVE_IN_CALENDAR_DAYS_0

    return (
      <div
        className={classNames('check-in-tip', {
          'check-in-tip--center': isCalendarDay0,
        })}
      >
        <div className="check-in-tip__check-in">{t('cms.listing.modal.move_in.label')}</div>
        <div className="check-in-tip__triangle" />
        <div className="check-in-tip__check-in-point" />
      </div>
    )
  }
}

CheckInTip.propTypes = {
  t: PropTypes.func.isRequired,
  freeCancellationPeriod: PropTypes.string,
}

CheckInTip.defaultProps = {
  t: () => {},
  freeCancellationPeriod: '',
}
