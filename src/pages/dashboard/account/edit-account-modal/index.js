import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Form, Popconfirm } from 'antd';
import AccountForm from '~pages/dashboard/account/account-form';
import * as accountActions from '~actions/account';
import LeaveAlert from '~components/leave-alert';

const mapDispatchToProps = dispatch => ({
  updateAccount: (data, onSuccess) => {
    dispatch(accountActions.updateAccount(data, onSuccess));
  },
  getCmsUser: (onSuccess) => {
    dispatch(accountActions.getCmsUser(onSuccess));
  },
  updateLandlordContact: (data, onSuccess) => {
    dispatch(accountActions.updateLandlordContact(data, onSuccess));
  },
});

@connect(null, mapDispatchToProps)
class editAccountModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFieldsChange: false,
      landlordIdChange: false,
    };
  }

  componentDidMount() {
    this.setFormData();
    // add browser alert
    window.onbeforeunload = (e) => {
      if (this.props.form.isFieldsTouched() || this.state.landlordIdChange) {
        const msg = this.props.t('cms.properties.edit.leave_alert.content');
        // eslint-disable-next-line no-param-reassign
        e = e || window.event;
        if (e) {
          e.returnValue = msg;
        }

        return msg;
      }
      return null;
    };
  }

  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    window.onbeforeunload = null;
  }

  setFormData = () => {
    if (this.props.data) {
      const accountData = {};
      accountData.firstName = this.props.data.firstName;
      accountData.lastName = this.props.data.lastName;
      accountData.enabled = this.props.data.enabled;
      accountData.email = this.props.data.email;

      if (this.props.data.landlord && this.props.data.landlord.id) {
        accountData.landlordId = this.props.data.landlord.id;
      }
      if (this.props.data.userRoles && this.props.data.userRoles.length > 0) {
        const roles = [];
        this.props.data.userRoles.map((role) => {
          roles.push(role.slug);
          return true;
        });
        if (roles && roles.length > 0) {
          accountData.roles = roles;
        }
      }

      this.props.form.setFieldsValue(accountData);
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const formField = ['firstName', 'lastName', 'enabled', 'roles'];

    this.props.form.validateFieldsAndScroll(
      formField,
      { scroll: { offsetTop: 70, offsetBottom: 70 },
      }, (err, values) => {
        if (!err) {
          const data = {};
          data.firstName = values.firstName;
          data.lastName = values.lastName;
          data.enabled = values.enabled;
          data.roles = values.roles;

          if (data && (this.props.form.isFieldsTouched() ||
          this.state.landlordIdChange)) {
            data.id = this.props.data.id;
            this.props.updateAccount(data, () => {
              this.props.getCmsUser();
              this.props.getList();
            });
          }
          this.closeEditModal();
        }
      },
    );
  }

  openPopModal = () => {
    this.setState({
      isFieldsChange:
      this.props.form.isFieldsTouched() || this.state.landlordIdChange,
    });

    if (!this.props.form.isFieldsTouched() && !this.state.landlordIdChange) {
      this.closeEditModal();
    }
  }

  closePopModal = () => {
    this.setState({
      isFieldsChange: false,
    });
  }

  closeEditModal = () => {
    const uploadingModal = document.querySelector('.landlord-account-management__edit-modal');
    if (uploadingModal) {
      const className = 'landlord-account-management__edit-modal landlord-account-management__edit-modal--close';
      uploadingModal.setAttribute('class', className);
      setTimeout(() => {
        this.props.onClose();
      }, 400);
    } else {
      this.props.onClose();
    }
  }

  handleSearchLandlord = () => {
    this.setState({
      landlordIdChange: true,
    });
  }

  render() {
    const { t, form } = this.props;

    return (
      <div className="edit-account">
        <LeaveAlert
          history={ this.props.history }
          t={ this.props.t }
          when={
            this.props.form.isFieldsTouched()
            || this.state.landlordIdChange
          }
        />
        <h2 className="edit-account__title"> { t('cms.account.edit_modal.title') } </h2>
        <Popconfirm
          trigger="click"
          visible={ this.state.isFieldsChange }
          title={ t('cms.account.landlord_account_managing.modal_close.tips') }
          placement="left"
          onConfirm={ this.closeEditModal }
          onCancel={ this.closePopModal }
          okText={ t('cms.properties.edit.btn.yes') }
          cancelText={ t('cms.properties.edit.btn.no') }
        >
          <button
            onClick={ this.openPopModal }
            className="edit-account__close-btn"
          >
            <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
          </button>
        </Popconfirm>
        <div className="edit-account__content">
          <Form className="ant-advanced-search-form">
            <AccountForm
              t={ t }
              form={ form }
              modalType="edit"
              landlordName={
                this.props.data && this.props.data.landlord ?
                  this.props.data.landlord.name : ''
              }
              onSearchLandlord={ this.handleSearchLandlord }
              isEnabled={ this.props.data ? this.props.data.enabled : false }
            />
            <button
              type="button"
              onClick={ this.handleSubmit }
              className="edit-account__confirm-btn"
            >
              { t('cms.listing.modal.confirm.btn') }
            </button>
          </Form>
        </div>
        <div className="edit-account__footer" />
      </div>
    );
  }
}

editAccountModal.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  form: PropTypes.object,
  updateAccount: PropTypes.func,
  data: PropTypes.object,
  history: PropTypes.object,
  getCmsUser: PropTypes.func,
  getList: PropTypes.func,
};

editAccountModal.defaultProps = {
  t: () => {},
  form: {},
  onClose: () => {},
  updateAccount: () => {},
  data: {},
  history: {},
  getCmsUser: () => {},
  getList: () => {},
};

export default Form.create({ name: 'edit_account_form' })(editAccountModal);
