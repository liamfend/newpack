import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Form, Popconfirm } from 'antd';
import modal from '~components/modal';
import Loading from '~components/loading';
import LandlordForm from '~pages/dashboard/account/landlord-from';
import { communicationStatus } from '~constants';
import * as accountActions from '~actions/account';

const mapStateToProps = (state) => {
  const data = state.dashboard.account.toJS();

  return {
    createStatus: data.communication.landlordCreate.status,
    updateStatus: data.communication.landlordUpdate.status,
  };
};

const mapDispatchToProps = dispatch => ({
  createLandlordContact: (data, onSuccess) => {
    dispatch(accountActions.createLandlordContact(data, onSuccess));
  },
  updateLandlordContact: (data, onSuccess) => {
    dispatch(accountActions.updateLandlordContact(data, onSuccess));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@modal({ className: 'landlord-center-modal' }, true)
class landlordModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFieldsChange: false,
      UserAlreadyExists: true,
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
    const formField = ['firstName', 'lastName', 'email', 'landlordId', 'properties', 'enabled'];

    this.props.form.validateFieldsAndScroll(
      formField,
      { scroll: { offsetTop: 70, offsetBottom: 70 },
      }, (err, values) => {
        if (!err) {
          const data = {};
          data.firstName = values.firstName.trim();
          data.lastName = values.lastName.trim();
          data.landlordId = values.landlordId;

          if (!this.state.UserAlreadyExists && this.props.modalType === 'add') {
            data.propertyIds = values.properties && values.properties.length > 0 ?
              values.properties : null;
            data.email = values.email.trim();
            this.props.createLandlordContact(data, () => {
              this.props.getList();
              this.props.onClose();
            });
          } else if (this.props.modalType === 'edit') {
            data.propertyIds = values.properties && values.properties.length > 0 ?
              values.properties : [];
            data.enabled = values.enabled;
            data.id = this.props.data.id;
            if (this.props.form.isFieldsTouched() ||
            (this.props.data.landlord && data.landlordId !== this.props.data.landlord.id)) {
              this.props.updateLandlordContact(data, () => {
                this.props.getList();
                this.props.onClose();
              });
            } else {
              this.props.onClose();
            }
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
    const { t, onClose, form, modalType } = this.props;

    return (
      <div className="landlord-modal">
        <h2 className="landlord-modal__title">
          { t(modalType === 'add' ?
            'cms.account.landlord.create_modal.title' :
            'cms.account.edit_modal.title') }
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
            className="landlord-modal__close-btn"
          >
            <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
          </button>
        </Popconfirm>
        <div className="landlord-modal__content">
          <Form className="ant-advanced-search-form">
            <LandlordForm
              t={ t }
              form={ form }
              modalType={ this.props.modalType }
              alreadyExists={ this.alreadyExists }
              data={ this.props.data }
              properties={ this.props.properties }
              loading={ this.props.loading }
              accountLevel={ this.props.accountLevel }
            />
            <button
              type="button"
              onClick={ this.handleSubmit }
              className="landlord-modal__confirm-btn"
            >
              <If condition={ this.props.updateStatus === communicationStatus.FETCHING ||
              this.props.createStatus === communicationStatus.FETCHING }
              >
                <Loading />
              </If>
              <If condition={ this.props.updateStatus !== communicationStatus.FETCHING &&
              this.props.createStatus !== communicationStatus.FETCHING }
              >
                { t('cms.listing.modal.confirm.btn') }
              </If>

            </button>
          </Form>
        </div>
        <div className="landlord-modal__footer" />
      </div>
    );
  }
}

landlordModal.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  form: PropTypes.object,
  createLandlordContact: PropTypes.func,
  updateLandlordContact: PropTypes.func,
  getList: PropTypes.func,
  modalType: PropTypes.string,
  data: PropTypes.object,
  createStatus: PropTypes.string,
  updateStatus: PropTypes.string,
  properties: PropTypes.array,
  loading: PropTypes.bool,
  accountLevel: PropTypes.string,
};

landlordModal.defaultProps = {
  t: () => {},
  form: {},
  onClose: () => {},
  createStatus: '',
  updateStatus: '',
  createLandlordContact: () => {},
  updateLandlordContact: () => {},
  getList: () => {},
  modalType: 'add',
  data: null,
  properties: [],
  loading: true,
  accountLevel: null,
};

export default Form.create({ name: 'create_landlord_form' })(landlordModal);
