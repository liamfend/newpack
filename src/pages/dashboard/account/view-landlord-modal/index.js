import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Row, Spin } from 'antd';

export default class viewLandlordModal extends React.Component {
  constructor(props) {
    super(props);

    props.handleLandlordContactProperty(props.data.email);
  }

  render() {
    const { t, data } = this.props;

    return (
      <div className="view-landlord">
        <h2 className="view-landlord__title">
          { t('cms.account.landlord.edit_modal.title') }
        </h2>
        <button
          onClick={ this.props.onClose }
          className="edit-account__close-btn"
        >
          <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
        </button>
        <div className="view-landlord__content">
          <h3 className="view-landlord__content-title">
            { t('cms.account.landlord_account_managing.view.modal.basic_information') }
          </h3>
          <table className="view-landlord__basic-information">
            <tbody>
              <tr className="view-landlord__info-row">
                <td width={ '30%' } className="view-landlord__info-label">
                  { t('cms.account.landlord_account_managing.create_modal.account_email.lable') }
                </td>
                <td width={ '70%' } className="view-landlord__info-content">
                  { data.email ? data.email : '-' }
                </td>
              </tr>
              <tr className="view-landlord__info-row">
                <td width={ '30%' } className="contract-detail__info-label">
                  { t('cms.account.landlord_account_managing.search_title') }
                </td>
                <td width={ '70%' } className="view-landlord__info-content">
                  { data.landlord ? data.landlord.name : '-' }
                </td>
              </tr>
              <tr className="view-landlord__info-row">
                <td width={ '30%' } className="view-landlord__info-label">
                  { t('cms.account.landlord_account_managing.create_modal.first_name.lable') }
                </td>
                <td width={ '70%' } className="view-landlord__info-content">
                  { data.firstName ? data.firstName : '-' }
                </td>
              </tr>
              <tr className="view-landlord__info-row">
                <td width={ '30%' } className="view-landlord__info-label">
                  { t('cms.account.landlord_account_managing.create_modal.last_name.lable') }
                </td>
                <td width={ '70%' } className="view-landlord__info-content">
                  { data.lastName ? data.lastName : '-' }
                </td>
              </tr>
            </tbody>
          </table>
          <If condition={ this.props.loading }>
            <div className="view-landlord__loading">
              <Spin />
            </div>
          </If>
          <If condition={ !this.props.loading }>
            <h3 className="view-landlord__content-title">
              { t('cms.account.landlord_account_managing.view.modal.account_level') }
            </h3>
            <div className="view-landlord__account-level">
              <div className="view-landlord__level">
                <h4 className="view-landlord__level-title">
                  { t(`cms.account.landlord_account_managing.view.modal.${this.props.accountLevel === 'property' ? 'proprty_level' : 'landlord_level'}.lable`) }
                </h4>
                <span
                  className="view-landlord__level-text"
                  dangerouslySetInnerHTML={ {
                    __html: t(`cms.account.landlord_account_managing.view.modal.${this.props.properties.length > 0 ? 'level' : 'no_level'}`),
                  } }
                />
              </div>
              <For each="property" index="groupKey" of={ this.props.properties }>
                <Row key={ groupKey } className="view-landlord__property-list-row">
                  <div className="view-landlord__property-name">
                    <span className="view-landlord__property-count">
                      { `${groupKey + 1}.` }
                    </span>
                    { `${property.node.name}` }
                  </div>
                </Row>
              </For>
            </div>
          </If>
        </div>
        <div className="view-landlord__footer">
          <button
            className="view-landlord__edit-btn"
            onClick={ this.props.onOpenEditModal }
          >
            <Icon type="edit" style={ { marginRight: 4 } } />
            { t('cms.account.landlord_account_managing.edit.btn') }
          </button>
        </div>
      </div>
    );
  }
}

viewLandlordModal.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  data: PropTypes.object,
  onOpenEditModal: PropTypes.func,
  properties: PropTypes.array,
  loading: PropTypes.bool,
  handleLandlordContactProperty: PropTypes.func,
  accountLevel: PropTypes.string,
};

viewLandlordModal.defaultProps = {
  t: () => {},
  onClose: () => {},
  data: {},
  onOpenEditModal: () => {},
  properties: [],
  loading: true,
  handleLandlordContactProperty: () => {},
  accountLevel: null,
};
