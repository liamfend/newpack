import React from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Col, Icon, Popconfirm, message } from 'antd';
import { IconContactEmpty as IconContactEmptyIcon } from "~components/svgs";
import LandlordContactModal from '~pages/dashboard/landlord/contact-modal';
import * as queries from '~settings/queries';
import { fetch } from '~helpers/graphql';

export default class LandlordContact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowAddContactModal: false,
      isEmptyPage: true,
      modalType: 'create',
      currentLandlordContact: null,
      landlordLinkMen: props.landlord.landlordLinkMen || [],
    };
  }

  handleClickAddContact = (item, type) => {
    if (type) {
      this.setState({ modalType: type });
    }
    this.setState({
      isShowAddContactModal: !this.state.isShowAddContactModal,
      currentLandlordContact: item,
    });
  };

  updateLandlordContact = (type, object) => {
    const linkMenArray = this.state.landlordLinkMen;

    if (type === 'create') {
      linkMenArray.unshift(object);
      this.setState({ landlordLinkMen: linkMenArray }, () => {
        message.success(this.props.t('cms.landlord.contact.add_new_contact.success.toast'));
      });
    }

    if (type === 'edit') {
      const editIndex = linkMenArray.findIndex(item => item.id === object.id);
      linkMenArray.splice(editIndex, 1, object);
      this.setState({ landlordLinkMen: linkMenArray }, () => {
        message.success(this.props.t('cms.landlord.contact.edit_contact.success.toast'));
      });
    }

    if (type === 'delete') {
      fetch(queries.deleteLandlordLinkMan({ id: object.id })).then((response) => {
        if (response &&
          response.deleteLandlordLinkMan &&
          response.deleteLandlordLinkMan.landlordLinkMan) {
          const editIndex = linkMenArray.findIndex(item => item.id === object.id);
          linkMenArray.splice(editIndex, 1);
          this.setState({ landlordLinkMen: linkMenArray }, () => {
            message.success(this.props.t('cms.landlord.contact.delete_contact.success.toast'));
          });
        }
      });
    }
  }

  render() {
    const { t, landlord } = this.props;
    const { modalType, currentLandlordContact, landlordLinkMen } = this.state;

    return (
      <div className="landlord-contact">
        <div className="landlord-contact__content-wrap">

          {/* empty page */}
          <If condition={ landlordLinkMen.length === 0 }>
            <div className="landlord-contact__empty-page-wrap">
              <div className="landlord-contact__empty-page">
                <IconContactEmptyIcon className="landlord-contact__empty-page__icon" />
                <span className="landlord-contact__empty-page__content">
                  { t('cms.landlord.contact.add_new_contact.description') }
                </span>
                <div className="landlord-contact__empty-page__add">
                  <Button
                    type="primary"
                    size="large"
                    onClick={ () => { this.handleClickAddContact({}, 'create'); } }
                  >
                    { t('cms.landlord.contact.add_new_contact.btn') }
                  </Button>
                </div>
              </div>
            </div>
          </If>

          <If condition={ landlordLinkMen.length > 0 }>
            <div className="landlord-contact__content-page">
              <div className="landlord-contact__content-page__plus-container">
                <Button
                  icon="plus"
                  type="dashed"
                  onClick={ () => { this.handleClickAddContact({}, 'create'); } }
                  block
                >
                  { t('cms.landlord.contact.add_new_contact.btn') }
                </Button>
              </div>
              <For of={ landlordLinkMen } each="landlordLinkMenItem" index="index">
                <section className="landlord-contact__section" key={ landlordLinkMenItem.id }>
                  <div className="landlord-contact__header-container">
                    <p className="landlord-contact__title">{ `Landlord Contact ${index + 1}` }</p>
                    <span className="landlord-contact__header-container__btn-container">
                      <button
                        className="landlord-contact__header-container__icon-wrap"
                        onClick={ () => this.handleClickAddContact(landlordLinkMenItem, 'edit') }
                      >
                        <Icon type="form" style={ { fontSize: '16px', color: '#38b2a6' } } theme="outlined" />
                      </button>
                      <span className="landlord-contact__header-container__line" />
                      <Popconfirm
                        overlayClassName="property-detail-wrapper__popconfirm"
                        overlayStyle={ { maxWidth: 210 } }
                        placement="topRight"
                        title={ t('cms.landlord.contact.double_confirm.title') }
                        onConfirm={ () => this.updateLandlordContact('delete', landlordLinkMenItem) }
                        okText={ t('cms.properties.edit.btn.yes') }
                        okType="danger"
                        cancelText={ t('cms.properties.edit.btn.no') }
                      >
                        <button
                          className="landlord-contact__header-container__icon-wrap"
                          onClick={ () => {} }
                        >
                          <Icon type="delete" style={ { fontSize: '16px', color: '#38b2a6' } } theme="outlined" />
                        </button>
                      </Popconfirm>
                    </span>
                  </div>
                  <div className="landlord-contact__section-content">
                    <Row gutter={ 16 }>
                      <Col span={ 12 } className="landlord-contact__section-content__label">
                        <label>{t('cms.landlord.contact.contact_name.label')}: </label>
                        { landlordLinkMenItem.contactName || '-' }
                      </Col>
                      <Col span={ 12 } className="landlord-contact__section-content__label">
                        <label>{t('cms.landlord.contact.contact_email.label')}: </label>
                        { landlordLinkMenItem.contactEmail || '-' }
                      </Col>
                    </Row>
                    <Row gutter={ 16 }>
                      <Col span={ 12 } className="landlord-contact__section-content__label">
                        <label>{t('cms.landlord.contact.contact_phone.label')}: </label>
                        { landlordLinkMenItem.contactPhone || '-' }
                      </Col>
                      <Col span={ 12 } className="landlord-contact__section-content__label">
                        <label>{t('cms.landlord.contact.contact_occupation.label')}: </label>
                        { landlordLinkMenItem.occupation || '-' }
                      </Col>
                    </Row>
                  </div>
                </section>
              </For>
            </div>
          </If>

        </div>

        <If condition={ this.state.isShowAddContactModal }>
          <LandlordContactModal
            activeModal
            t={ t }
            type={ modalType }
            landlord={ landlord }
            handleCloseModal={ this.handleClickAddContact }
            setCurrentLandlordContact={ currentLandlordContact }
            handleUpdateLandlordContact={ this.updateLandlordContact }
            updateLandlord={ this.props.updateLandlord }
          />
        </If>
      </div>
    );
  }
}

LandlordContact.propTypes = {
  t: PropTypes.func.isRequired,
  landlord: PropTypes.object,
  updateLandlord: PropTypes.func,
};

LandlordContact.defaultProps = {
  t: () => {},
  landlord: {},
  updateLandlord: () => {},
};
