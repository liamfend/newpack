import React from 'react';
import { Prompt } from 'react-router-dom';
import { Modal } from 'antd';
import PropTypes from 'prop-types';

const confirm = Modal.confirm;

export default class LeaveAlert extends React.Component {
  constructor() {
    super();
    this.state = {
      modalVisible: false,
      confirmedNavigation: false,
    };
  }

  showModal = (location) => {
    this.setState({
      modalVisible: true,
    }, () => confirm({
      title: this.props.t('cms.properties.edit.leave_alert.title'),
      content: this.props.contentType && this.props.contentType === 'create' ? this.props.t('cms.properties.create.leave_alert.content') : this.props.t('cms.properties.edit.leave_alert.content'),
      okText: this.props.t('cms.properties.edit.leave_alert.button.yes'),
      cancelText: this.props.t('cms.properties.edit.leave_alert.button.cancle'),
      onOk: () => { this.handleConfirmNavigationClick(location); },
    }));
  }

  closeModal = () => {
    this.setState({
      modalVisible: false,
    });
  }

  handleBlockedNavigation = (nextLocation) => {
    const { confirmedNavigation } = this.state;
    if (!confirmedNavigation) {
      this.showModal(nextLocation);
      return false;
    }

    return true;
  }

  handleConfirmNavigationClick = (location) => {
    const { history } = this.props;
    this.setState({
      modalVisible: false,
      confirmedNavigation: true,
    }, () => {
      this.props.onConfirmLeavePage();
      if (location.state && location.state.logoutUser) {
        location.state.logoutUser();
      }
      return history.push(location.pathname + location.search);
    });
  }

  render() {
    return (
      <div>
        <Prompt
          when={ this.props.when }
          message={ this.handleBlockedNavigation }
        />
      </div>
    );
  }
}

LeaveAlert.propTypes = {
  history: PropTypes.object.isRequired,
  when: PropTypes.bool,
  t: PropTypes.func.isRequired,
  contentType: PropTypes.string,
  onConfirmLeavePage: PropTypes.func,
};

LeaveAlert.defaultProps = {
  history: {
    pathname: '',
  },
  when: false,
  t: () => {},
  contentType: '',
  onConfirmLeavePage: () => {},
};

