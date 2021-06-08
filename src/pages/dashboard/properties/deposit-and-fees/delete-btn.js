import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Popconfirm } from 'antd';

export default class deleteBtn extends React.Component {
  constructor() {
    super();
    this.state = {
      showDeletedPopModal: false,
    };
  }

  handlePopModal = () => {
    this.setState({
      showDeletedPopModal: !this.state.showDeletedPopModal,
    });
  }

  deletedDeposit = () => {
    this.props.deletedDeposit(this.props.depositId);
    this.props.onClose();
  }

  render() {
    const { t, type } = this.props;
    return (
      <div>
        <Popconfirm
          trigger="click"
          visible={ this.state.showDeletedPopModal }
          title={ t(`cms.deposit_and_fees.deposit_${type}.delete.pop_modal.tips`) }
          placement="top"
          onConfirm={ this.deletedDeposit }
          onCancel={ this.handlePopModal }
          okText={ t('cms.properties.edit.btn.yes') }
          cancelText={ t('cms.properties.edit.btn.no') }
        >
          <button
            className="deposit-and-fees__delete-btn"
            style={ { border: 0 } }
            onClick={ this.handlePopModal }
          >
            <Icon type="delete" style={ { color: '#38b2a6' } } />
          </button>
        </Popconfirm>
      </div>
    );
  }
}

deleteBtn.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  deletedDeposit: PropTypes.func,
  depositId: PropTypes.string,
  type: PropTypes.string,
};

deleteBtn.defaultProps = {
  t: () => {},
  onClose: () => {},
  deletedDeposit: () => {},
  depositId: '',
  type: '',
};
