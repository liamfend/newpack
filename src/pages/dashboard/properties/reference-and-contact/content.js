import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import enhanceForm from '~hocs/enhance-form';
import { Form, Input, Button, Row, Col, Tabs, message } from 'antd';
import { contactInfoValidator } from '~helpers/property-edit';
import Contact from '~pages/dashboard/properties/reference-and-contact/contact';
import { fetch } from '~helpers/graphql';
import * as queries from '~settings/queries';
import AccountOwnerSearch from '~modules/account-owner-search';
import { mappingRoles } from '~constants';

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;
const includeRoleArr = [
  mappingRoles.SUPPLY,
  mappingRoles.REGIONAL_SUPPLY_HEAD,
  mappingRoles.ADMIN,
];
const editRoleArr = [
  mappingRoles.ADMIN,
  mappingRoles.SUPPLY,
  mappingRoles.CONTENT_MANAGER,
  mappingRoles.REGIONAL_SUPPLY_HEAD,
];

@enhanceForm()
export default class Content extends React.PureComponent {
  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  contactValidator = (rule, value, callback) => {
    const { isAllValid } = contactInfoValidator(value);
    if (isAllValid) {
      callback();
    }
    callback('error');
  }

  urlValidator = (rule, value, callback) => {
    if (value && !urlRegex.test(value)) {
      callback('error');
    } else {
      callback();
    }
  }

  validatUrl = (url) => {
    if (urlRegex.test(url)) {
      return true;
    }
    return false;
  }

  handleCheckButtonClick = (value) => {
    if (!value.startsWith('https://') && !value.startsWith('http://')) {
      window.open(`http://${value}`);
      return;
    }

    window.open(value);
  }

  formatContacts = (contacts) => {
    const formatedContacts = contacts.map((contact) => {
      const { contactName, contactPhone, contactEmail, occupation, id } = contact;

      const bindContact = {
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        occupation: occupation || null,
      };

      if (id) {
        bindContact.id = id;
      }

      return bindContact;
    }).filter((contact) => {
      const { contactName, contactPhone, contactEmail, occupation } = contact;
      return contactName || contactPhone || contactEmail || occupation;
    });

    return formatedContacts;
  };

  onSubmit = (successCallback = () => {}) => {
    const { t, property } = this.props;

    this.props.form.validateFieldsAndScroll(
      (err) => {
        if (!err) {
          const {
            contacts,
            bookingTeamContacts,
            landlordPhotograpyUrl,
            roomMatrixUrl,
            url,
            accountManager,
          } = this.props.form.getFieldsValue();
          const requests = [];
          if (url || roomMatrixUrl || landlordPhotograpyUrl || accountManager) {
            requests.push(fetch(queries.updatePropertyInternalFields({
              id: property.id,
              url: url || null,
              roomMatrixUrl: roomMatrixUrl || null,
              landlordPhotograpyUrl: landlordPhotograpyUrl || null,
              accountManager: accountManager || null,
            })));
          }
          requests.push(fetch(queries.bindPropertyContacts({
            propertyId: property.id,
            propertyContacts: this.formatContacts(contacts),
          })));
          requests.push(fetch(queries.bindBookingTeamContacts({
            propertyId: property.id,
            bookingTeamContacts: this.formatContacts(bookingTeamContacts),
          })));

          this.props.onChangeIsFetching(true);
          Promise.all(requests).then(() => {
            successCallback();
            message.success(t('cms.properties.edit.toast.save_success'));
          }).catch(() => {
            message.error(t('cms.properties.edit.toast.error'));
          }).finally(() => {
            this.props.onChangeIsFetching(false);
          });
        }
      },
    );
  }

  render() {
    const { t, property, currentRoleSlug } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <Form layout="vertical" className="reference-and-contact__content">
        <div className="reference-and-contact__section">
          <div className="reference-and-contact__title">
            {t('cms.properties.edit.others.reference_informaton')}
          </div>
          <Row gutter={ 40 }>
            <Col span={ 12 }>
              <Form.Item label={ t('cms.properties.edit.others.original_website') }>
                {
                  getFieldDecorator('url', {
                    initialValue: property.url,
                    validateTrigger: ['onBlur'],
                    rules: [{
                      validator: this.urlValidator,
                      message: this.props.t('cms.properties.edit.reference_and_contact.invalid_hint'),
                    }],
                  })(
                    <Input
                      className="reference-and-contact__url-input"
                      autoComplete="off"
                      placeholder={ t('cms.properties.edit.others.input_link') }
                      suffix={
                        <Button
                          className={ classNames('reference-and-contact__check-btn', { 'reference-and-contact__check-btn--active': this.validatUrl(getFieldValue('url')) }) }
                          onClick={ () => { this.handleCheckButtonClick(getFieldValue('url')); } }
                          disabled={ !this.validatUrl(getFieldValue('url')) }
                        >
                          {t('cms.properties.edit.address.button_check')}
                        </Button>
                      }
                    />,
                  )
                }
              </Form.Item>
            </Col>
            <Col span={ 12 }>
              <Form.Item label={ t('cms.properties.edit.others.landlord_photograpy_url') }>
                {
                  getFieldDecorator('landlordPhotograpyUrl', {
                    initialValue: property.landlordPhotograpyUrl,
                    validateTrigger: ['onBlur'],
                    rules: [{
                      validator: this.urlValidator,
                      message: this.props.t('cms.properties.edit.reference_and_contact.invalid_hint'),
                    }],
                  })(
                    <Input
                      placeholder={ t('cms.properties.edit.others.input_link') }
                      className="reference-and-contact__url-input"
                      autoComplete="off"
                      suffix={
                        <Button
                          className={ classNames('reference-and-contact__check-btn', { 'reference-and-contact__check-btn--active': this.validatUrl(getFieldValue('landlordPhotograpyUrl')) }) }
                          onClick={ () => { this.handleCheckButtonClick(getFieldValue('landlordPhotograpyUrl')); } }
                          disabled={ !this.validatUrl(getFieldValue('landlordPhotograpyUrl')) }
                        >
                          {t('cms.properties.edit.address.button_check')}
                        </Button>
                      }
                    />,
                  )
                }
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={ 40 }>
            <Col span={ 12 }>
              <Form.Item label={ t('cms.properties.edit.others.room_matrix_url') }>
                {
                  getFieldDecorator('roomMatrixUrl', {
                    initialValue: property.roomMatrixUrl,
                    validateTrigger: ['onBlur'],
                    rules: [{
                      validator: this.urlValidator,
                      message: this.props.t('cms.properties.edit.reference_and_contact.invalid_hint'),
                    }],
                  })(
                    <Input
                      placeholder={ t('cms.properties.edit.others.input_link') }
                      className="reference-and-contact__url-input"
                      autoComplete="off"
                      suffix={
                        <Button
                          className={
                            classNames('reference-and-contact__check-btn', {
                              'reference-and-contact__check-btn--active': this.validatUrl(getFieldValue('roomMatrixUrl')),
                            })
                          }
                          onClick={ () => { this.handleCheckButtonClick(getFieldValue('roomMatrixUrl')); } }
                          disabled={ !this.validatUrl(getFieldValue('roomMatrixUrl')) }
                        >
                          {t('cms.properties.edit.address.button_check')}
                        </Button>
                      }
                    />,
                  )
                }
              </Form.Item>
            </Col>

            <Col span={ 12 }>
              <AccountOwnerSearch
                labelPlaceholder={ this.props.t('cms.properties.edit.others.account_owner') }
                inputPlaceholder={ this.props.t('cms.properties.edit.others.account_owner_hint') }
                disabledClassName={
                  !editRoleArr.includes(currentRoleSlug) ?
                    'reference-and-contact__disabled-label' : ''
                }
                includeRoleArr={ includeRoleArr }
                accountOwners={ this.props.accountOwners }
                isDisabled={ !editRoleArr.includes(currentRoleSlug) }
                form={ this.props.form }
                t={ this.props.t }
                isFetching={ this.props.isGettingAccountOwners }
                accountManager={ this.props.property.accountManager }
                isNeedInit
                getAccountOwners={ this.props.getAccountOwners }
              />
            </Col>
          </Row>
        </div>
        <div className="reference-and-contact__section">
          <div className="reference-and-contact__title">
            {t('cms.properties.edit.others.contact_information')}
          </div>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab={ t('cms.reference_and_contact.property_contact.tab') } key="1">
              {getFieldDecorator('contacts', {
                initialValue:
                  property.propertyContacts ?
                    property.propertyContacts :
                    [{ contactName: '', contactPhone: '', contactEmail: '', occupation: '' }],
                trigger: 'onBlur',
                rules: [{ validator: this.contactValidator }],
              })(
                <Contact
                  countrySlug={ get(property, 'city.country.slug') }
                  type="property"
                />,
              )}
            </Tabs.TabPane>
            <Tabs.TabPane tab={ t('cms.reference_and_contact.booking_team_contact.tab') } key="2">
              {getFieldDecorator('bookingTeamContacts', {
                initialValue:
                  property.bookingTeamContacts ?
                    property.bookingTeamContacts :
                    [{ contactName: '', contactPhone: '', contactEmail: '', occupation: '' }],
                trigger: 'onBlur',
                rules: [{ validator: this.contactValidator }],
              })(
                <Contact
                  countrySlug={ get(property, 'city.country.slug') }
                  type="booking_team"
                />,
              )}
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Form>
    );
  }
}

Content.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object, // eslint-disable-line react/require-default-props
  property: PropTypes.object.isRequired,
  onRef: PropTypes.func,
  onChangeIsFetching: PropTypes.func,
  accountOwners: PropTypes.array,
  getAccountOwners: PropTypes.func,
  currentRoleSlug: PropTypes.string,
  isGettingAccountOwners: PropTypes.bool,
};

Content.defaultProps = {
  t: () => { },
  onRef: () => {},
  onChangeIsFetching: () => {},
  accountOwners: [],
  getAccountOwners: () => {},
  currentRoleSlug: '',
  isGettingAccountOwners: false,
};
