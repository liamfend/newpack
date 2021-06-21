import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class Reminder extends React.PureComponent {
  render() {
    const { t, draft } = this.props;

    if (!draft) {
      return null;
    }

    return (
      <div className="pending-approval-reminder pending-approval-reminder--rejected">
        <div className="pending-approval-reminder__rejected-text">
          { t('cms.pending_approval.rejected.reminder') }
        </div>
        <div className="pending-approval-reminder__request-by">
          { t('cms.pending_approval.rejected.request_by', {
            userEmail: draft.createdUser && draft.createdUser.email,
            updatedAt: moment(draft.updatedAt).format('DD/MM/YYYY'),
          }) }
        </div>
      </div>
    );
  }
}

Reminder.propTypes = {
  t: PropTypes.func.isRequired,
  draft: PropTypes.object,
};

Reminder.defaultProps = {
  t: () => {},
  draft: {},
};
