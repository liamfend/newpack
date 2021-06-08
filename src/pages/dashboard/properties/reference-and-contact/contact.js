import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Form, Input, Row, Col, Icon } from 'antd';
import PhoneNumber from '~components/phone-number';
import useContact from '~pages/dashboard/properties/reference-and-contact/useContact';

const Contact = ({ value, countrySlug, type, onBlur }) => {
  const { t } = useTranslation();
  const {
    contacts,
    contactValidate,
    addContact,
    deleteContact,
    handleContactChagne,
    handleCheckContacts,
  } = useContact({ value, onBlur });

  return (
    <React.Fragment>
      <div
        className="reference-and-contact__add-contact"
        role="button"
        tabIndex={ 0 }
        onClick={ addContact }
      >
        <Icon className="reference-and-contact__add-icon" type="plus" />
        { t(`cms.reference_and_contact.add_${type}_contact.button`) }
      </div>
      <For of={ contacts } each="contact" index="index">
        <React.Fragment key={ index }>
          <div className={ classNames('reference-and-contact__contact-wrap', {
            'reference-and-contact__contact-wrap--name-empty-error': !contactValidate[index].contactNameNotEmpty,
          }) }
          >
            <Row gutter={ 40 }>
              <Col span={ 12 }>
                <Form.Item
                  label={ t('cms.properties.edit.others.contact_name') }
                  validateStatus={ contactValidate[index].contactName ? null : 'error' }
                  help={ contactValidate[index].contactName ? null : t('cms.reference_and_contact.edit.error.contact_name_limit') }
                >
                  <Input
                    placeholder={ t('cms.properties.edit.others.name') }
                    defaultValue={ contact.contactName }
                    value={ contact.contactName }
                    onChange={ (e) => { handleContactChagne(index, 'contactName', e.target.value); } }
                    onBlur={ handleCheckContacts }
                  />
                </Form.Item>
              </Col>
              <Col span={ 12 }>
                <Form.Item
                  label={ t('cms.properties.edit.others.contact_phone') }
                  validateStatus={ contactValidate[index].contactPhone ? null : 'error' }
                  help={ contactValidate[index].contactPhone ? null : t('cms.properties.edit.error.contact_phone') }
                >
                  <PhoneNumber
                    placeholder={ t('cms.properties.edit.others.phone_number') }
                    value={ contact.contactPhone }
                    onChange={ (e) => { handleContactChagne(index, 'contactPhone', e); } }
                    checkValid={ handleCheckContacts }
                    t={ t }
                    countrySlug={ countrySlug }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={ 40 }>
              <Col span={ 12 }>
                <Form.Item
                  label={ t('cms.properties.edit.others.contact_email') }
                  validateStatus={ contactValidate[index].contactEmail ? null : 'error' }
                  help={ contactValidate[index].contactEmail ? null : t('cms.properties.edit.error.email') }
                >
                  <Input
                    placeholder={ t('cms.properties.edit.others.example_email') }
                    value={ contact.contactEmail }
                    onChange={ (e) => { handleContactChagne(index, 'contactEmail', e.target.value); } }
                    onBlur={ handleCheckContacts }
                  />
                </Form.Item>
              </Col>
              <Col span={ 12 }>
                <Form.Item
                  label={ t('cms.properties.edit.others.occupation') }
                  validateStatus={ contactValidate[index].occupation ? null : 'error' }
                  help={ contactValidate[index].occupation ? null : t('cms.reference_and_contact.edit.error.occupation') }
                >
                  <Input
                    placeholder={ t('cms.reference_and_contact.occupation.placeholder') }
                    value={ contact.occupation }
                    onChange={ (e) => { handleContactChagne(index, 'occupation', e.target.value); } }
                    onBlur={ handleCheckContacts }
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <If condition={ !contactValidate[index].contactNameNotEmpty }>
            <div className="reference-and-contact__empty-name-error">
              { t('cms.reference_and_contact.edit.error.contact_name_empty') }
            </div>
          </If>
          <If condition={ contacts.length !== 1 }>
            <div
              className="reference-and-contact__delete-contact"
              role="button"
              tabIndex={ index }
              onClick={ () => { deleteContact(index); } }
            >
              {t('cms.properties.edit.tab_label.others.delete')}
            </div>
          </If>
        </React.Fragment>
      </For>
    </React.Fragment>
  );
};

Contact.propTypes = {
  onBlur: PropTypes.func,
  value: PropTypes.array, // eslint-disable-line react/require-default-props
  countrySlug: PropTypes.string,
  type: PropTypes.string,
};

Contact.defaultProps = {
  onBlur: () => {},
  countrySlug: '',
  type: 'property',
};

export default Contact;
