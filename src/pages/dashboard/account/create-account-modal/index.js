import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Form, Popconfirm } from 'antd';
import modal from '~components/modal';
import AccountForm from '~pages/dashboard/account/account-form';
import * as accountActions from '~actions/account';

const mapStateToProps = (state) => {
  const data = state.dashboard.account.toJS();

  return {
    createStatus: data.communication.create.status,
  };
};

const mapDispatchToProps = dispatch => ({
  createAccount: (data, onSuccess) => {
    dispatch(accountActions.createAccount(data, onSuccess));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@modal({ className: 'create-account-modal' }, true)
class createAccountModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFieldsChange: false,
      UserAlreadyExists: false,
    };
  }

  componentDidMount() {
    // add browser alert
    window.onbeforeunload = (e) => {
      if (this.props.form.isFieldsTouched()) {
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

  alreadyExists = (bool) => {
    this.setState({
      UserAlreadyExists: bool,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const formField = ['firstName', 'lastName', 'email', 'roles'];

    this.props.form.validateFieldsAndScroll(
      formField,
      { scroll: { offsetTop: 70, offsetBottom: 70 },
      }, (err, values) => {
        if (!err) {
          const data = {};
          data.firstName = values.firstName;
          data.lastName = values.lastName;
          data.email = values.email;
          data.roles = values.roles;
          data.signupType = 'EMAIL';

          if (this.state.UserAlreadyExists) {
            this.props.createAccount(data, () => {
              this.props.getList();
            });

            this.props.onClose();
          }
        }
      },
    );
  }

  openPopModal = () => {
    this.setState({
      isFieldsChange: this.props.form.isFieldsTouched(),
    });

    if (!this.props.form.isFieldsTouched()) {
      this.props.onClose();
    }
  }

  closePopModal = () => {
    this.setState({
      isFieldsChange: false,
    });
  }

  render() {
    const { t, onClose, form } = this.props;

    return (
      <div className="create-account">
        <h2 className="create-account__title">
          { t('cms.account.create_modal.title') }
        </h2>
        <Popconfirm
          trigger="click"
          visible={ this.state.isFieldsChange }
          title={ t('cms.account.landlord_account_managing.modal_close.tips') }
          placement="left"
          onConfirm={ onClose }
          onCancel={ this.closePopModal }
          okText={ t('cms.properties.edit.btn.yes') }
          cancelText={ t('cms.properties.edit.btn.no') }
        >
          <button
            onClick={ this.openPopModal }
            className="create-account__close-btn"
          >
            <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
          </button>
        </Popconfirm>
        <div className="create-account__content">
          <Form className="ant-advanced-search-form">
            <AccountForm
              t={ t }
              form={ form }
              modalType="add"
              alreadyExists={ this.alreadyExists }
            />
            <button
              type="button"
              onClick={ this.handleSubmit }
              className="create-account__confirm-btn"
            >
              { t('cms.listing.modal.confirm.btn') }
            </button>
          </Form>
        </div>
        <div className="create-account__footer" />
      </div>
    );
  }
}

createAccountModal.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  form: PropTypes.object,
  createAccount: PropTypes.func,
  getList: PropTypes.func,
};

createAccountModal.defaultProps = {
  t: () => {},
  form: {},
  onClose: () => {},
  createAccount: () => {},
  getList: () => {},
};

export default Form.create({ name: 'create_account_form' })(createAccountModal);
