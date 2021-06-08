import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import Svg from '~components/svg';
import generatePath from '~settings/routing';

export default class PendingApproveSuccess extends React.PureComponent {
  backHomelist = () => {
    const url = generatePath('properties');
    this.props.history.push(url);
  }

  render() {
    const { t } = this.props;

    return (
      <div className="pending-approve-success">
        <Svg className="pending-approve-success__icon" hash="property-success" />
        <div className="pending-approve-success__title">
          { t('cms.properties.edit.pending_approve_success.title') }
        </div>
        <div className="pending-approve-success__description">
          { t('cms.properties.edit.pending_approve_success.descripion') }
        </div>
        <Button
          type="primary"
          size="large"
          onClick={ () => this.backHomelist() }
        >
          { t('cms.properties.pending_approval.modal.go_to_check.btn') }
        </Button>
      </div>
    );
  }
}

PendingApproveSuccess.propTypes = {
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

PendingApproveSuccess.defaultProps = {
  t: () => {},
  history: {},
};
