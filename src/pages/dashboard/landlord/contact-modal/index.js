import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Row, Col, Icon, Button } from 'antd';
import modal from '~components/modal';
import * as queries from '~settings/queries';
import { fetch } from '~helpers/graphql';
import PhoneNumber from '~components/phone-number';
import { validateEmojiRegex, validateEmail } from '~helpers/validate';

@modal({
  className: 'landlord-contact-modal',
}, true)
class LandlordContactModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initContactName: props.setCurrentLandlordContact.contactName || '',
      initContactEmail: props.setCurrentLandlordContact.contactEmail || '',
      initContactPhone: props.setCurrentLandlordContact.contactPhone || '',
      initContactOccupation: props.setCurrentLandlordContact.occupation || '',

      isNormalEmailOrPhone: true,
      isPhoneMLimit: true,
      isEmailValid: true,

      phoneErrorMsg: null,
      emailErrorMsg: null,
    };

    this.loading = false;
  }

  handleClickConfirm = () => {
    const { type } = this.props;
    const { initContactEmail, initContactPhone } = this.state;
    if (this.loading) {
      return false;
    }

    this.props.form.validateFieldsAndScroll(
      // eslint-disable-next-line consistent-return
      (err) => {
        if (!initContactEmail && !initContactPhone) {
          this.setState({
            isNormalEmailOrPhone: false,
            phoneErrorMsg: this.props.t('cms.landlord.contact.modal.error.contact_email_phone.limit'),
            emailErrorMsg: this.props.t('cms.landlord.contact.modal.error.contact_email_phone.limit'),
          });
          return false;
        }

        if (!err) {
          const params = this.props.form.getFieldsValue();
          params.contactPhone = this.state.initContactPhone;
          params.contactEmail = this.state.initContactEmail;

          Object.keys(params).map((key) => {
            if (typeof params[key] === 'string') {
              params[key] = params[key].trim();
            }
            return true;
          });

          this.loading = true;

          if (!params.contactEmail) {
            params.contactEmail = null;
          }

          if (!params.contactPhone) {
            params.contactPhone = null;
          }

          if (type === 'create') {
            if (!params.occupation) {
              delete params.occupation;
            }
            params.landlordId = this.props.landlord.id;
            fetch(queries.createLandlordLinkMan(params)).then((response) => {
              if (response &&
                response.createLandlordLinkMan &&
                response.createLandlordLinkMan.landlordLinkMan) {
                this.props.handleUpdateLandlordContact('create', response.createLandlordLinkMan.landlordLinkMan);
                this.props.handleCloseModal();
              }
            }).finally(() => {
              this.loading = false;
            });
          }

          if (type === 'edit') {
            params.id = this.props.setCurrentLandlordContact.id;
            fetch(queries.updateLandlordLinkMan(params)).then((response) => {
              if (response &&
                response.updateLandlordLinkMan &&
                response.updateLandlordLinkMan.landlordLinkMan) {
                this.props.handleUpdateLandlordContact('edit', response.updateLandlordLinkMan.landlordLinkMan);
                this.props.handleCloseModal();
              }
            }).finally(() => {
              this.loading = false;
            });
          }
        }
      },
    );
    return true;
  }

  validatePhoneAndEmail = () => {
    const { initContactPhone } = this.state;
    const params = this.props.form.getFieldsValue();
    if (params.contactEmail === '' && initContactPhone.trim().length <= 3) {
      this.setState({
        isNormalEmailOrPhone: false,
        phoneErrorMsg: this.props.t('cms.landlord.contact.modal.error.contact_email_phone.limit'),
        emailErrorMsg: this.props.t('cms.landlord.contact.modal.error.contact_email_phone.limit'),
      });
      return false;
    }
    if (initContactPhone.trim().length > 32) {
      this.setState({
        isPhoneMLimit: false,
        phoneErrorMsg: this.props.t('cms.landlord.contact.modal.error.phone.limit'),
      });
      return false;
    }
    this.setState({
      isNormalEmailOrPhone: true,
      isPhoneMLimit: true,
      phoneErrorMsg: null,
      emailErrorMsg: null,
    });
    return true;
  }

  handleValidateEmail = () => {
    const { t } = this.props;
    const { initContactEmail } = this.state;
    if (initContactEmail.length > 255) {
      this.setState({
        isEmailValid: false,
        emailErrorMsg: t('cms.landlord.contact.modal.error.contact_email.limit'),
      });
    } else if (!validateEmail(initContactEmail)) {
      this.setState({
        isEmailValid: false,
        emailErrorMsg: t('cms.landlord.contact.modal.error.contact_email_format.error'),
      });
    } else {
      this.setState({
        isEmailValid: true,
        emailErrorMsg: null,
        isNormalEmailOrPhone: true,
        phoneErrorMsg: null,
      });
    }
  }

  handleInputEmailChange = (e) => {
    this.setState({
      initContactEmail: e.trim(),
    });
  }

  handleContactPhoneChange = (e) => {
    if (e && e.trim().length > 4) {
      this.setState({ initContactPhone: e });
    } else {
      this.setState({ initContactPhone: '' });
    }
  }

  render() {
    const { t, type, form, landlord } = this.props;
    const { getFieldDecorator } = form;
    const {
      initContactName, initContactEmail, initContactPhone, initContactOccupation,
      isNormalEmailOrPhone, isPhoneMLimit, phoneErrorMsg,
      emailErrorMsg,
    } = this.state;

    return (
      <div className="landlord-contact-info">
        <div className="landlord-contact-info__header">
          { t(`cms.landlord.contact.modal.${type}_contact.title`) }
          <Icon
            type="close"
            className="landlord-contact-info__close-button"
            onClick={ this.props.handleCloseModal }
          />
        </div>
        <div className="landlord-contact-info__body">
          <Form className="landlord-contact-info__form">
            <section className="landlord-contact-info__section">

              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <Form.Item
                    label={ t('cms.landlord.contact.contact_name.label') }
                    colon={ false }
                  >
                    {getFieldDecorator('contactName', {
                      rules: [
                        {
                          required: true,
                          message: t('cms.landlord.contact.modal.error.blank'),
                        },
                        {
                          max: 80,
                          message: t('cms.landlord.contact.modal.error.contact_name.limit'),
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (!validateEmojiRegex(value.trim())) {
                              callback(t('cms.landlord.contact.modal.error.contact_name.emoji.limit'));
                            } else {
                              callback();
                            }
                          },
                        },
                      ],
                      initialValue: initContactName,
                      validateTrigger: 'onBlur',
                    })(
                      <Input
                        placeholder={ t('cms.landlord.contact.contact_name.label') }
                      />,
                    )}
                  </Form.Item>
                </Col>

                <Col span={ 12 }>
                  <Form.Item
                    label={ t('cms.landlord.contact.contact_email.label') }
                    colon={ false }
                    validateStatus={ emailErrorMsg ? 'error' : null }
                    help={ emailErrorMsg }
                  >
                    <Input
                      placeholder={ t('cms.landlord.contact.contact_email.label') }
                      value={ initContactEmail }
                      onChange={ (e) => { this.handleInputEmailChange(e.target.value); } }
                      onBlur={ this.handleValidateEmail }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <Form.Item
                    label={ t('cms.landlord.contact.contact_phone.label') }
                    colon={ false }
                    validateStatus={ isNormalEmailOrPhone && isPhoneMLimit ? null : 'error' }
                    help={ phoneErrorMsg }
                  >
                    <PhoneNumber
                      placeholder={ t('cms.properties.edit.others.phone_number') }
                      value={ initContactPhone }
                      onChange={ (e) => { this.handleContactPhoneChange(e); } }
                      checkValid={ () => { this.validatePhoneAndEmail(); } }
                      t={ t }
                      countrySlug={ landlord.billingCountry }
                    />
                  </Form.Item>
                </Col>
                <Col span={ 12 }>
                  <Form.Item
                    label={ t('cms.landlord.contact.contact_occupation.label') }
                    colon={ false }
                  >
                    { getFieldDecorator('occupation', {
                      rules: [
                        {
                          max: 255,
                          message: t('cms.landlord.contact.modal.error.contact_email.limit'),
                        },
                      ],
                      initialValue: initContactOccupation,
                      validateTrigger: 'onBlur',
                    })(
                      <Input
                        placeholder={ t('cms.landlord.contact.contact_occupation.label') }
                      />,
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </section>
          </Form>
        </div>

        <div className="landlord-contact-info__footer">
          <Button
            ghost
            type="primary"
            size="large"
            className="landlord-contact-info__btn landlord-contact-info__cancel-button"
            onClick={ this.props.handleCloseModal }
          >
            { t('cms.landlord.modal.cancel.button') }
          </Button>
          <Button
            type="primary"
            size="large"
            className="landlord-contact-info__btn"
            onClick={ this.handleClickConfirm }
            loading={ this.loading }
          >
            { t('cms.landlord.modal.confirm.button') }
          </Button>
        </div>
      </div>
    );
  }
}

LandlordContactModal.propTypes = {
  t: PropTypes.func.isRequired,
  type: PropTypes.oneOf([
    'create',
    'edit',
  ]),
  landlord: PropTypes.object,
  handleCloseModal: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
    validateFieldsAndScroll: PropTypes.func.isRequired,
    getFieldsValue: PropTypes.func.isRequired,
  }).isRequired,
  setCurrentLandlordContact: PropTypes.object,
  handleUpdateLandlordContact: PropTypes.func,
};

LandlordContactModal.defaultProps = {
  t: () => {},
  type: 'create',
  landlord: {},
  handleCloseModal: () => {},
  form: {
    getFieldDecorator: () => {},
    setFieldsValue: () => {},
    validateFieldsAndScroll: () => {},
    getFieldsValue: () => {},
  },
  setCurrentLandlordContact: {},
  handleUpdateLandlordContact: () => {},
};

export default Form.create({
  name: 'cms_landlord_modal',
})(LandlordContactModal);
