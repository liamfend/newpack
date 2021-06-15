import React from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'antd';
import { withTranslation } from 'react-i18next';
import {
  CreateAddress as CreateAddressIcon,
  CreateZipcode as CreateZipcodeIcon,
  CreateStyle as CreateStyleIcon,
  CreateCity as CreateCityIcon,
  CreateCurrency as CreateCurrencyIcon,
  CreateLandlord as CreateLandlordIcon,
} from "~components/svgs";
import CurrencyBar from '~components/currency-bar';

@withTranslation()

export default class CreateConfirmation extends React.Component {
  render() {
    const { t, formData } = this.props;
    const { propertyAddress, basicInfo } = formData;
    return (
      <div className="create-confirmation" >
        <div className="create-confirmation__tips">
          <h1 className="create-confirmation__title">
            {t('cms.properties.create.create_confirmation.tips_desc')}
          </h1>
        </div>
        <div className="create-confirmation__info">
          <p className={ 'create-confirmation__info-title' }>{basicInfo.name}</p>
          <div className="create-confirmation__detail">
            <div className="create-confirmation__detail__item">
              <CreateAddressIcon className="create-confirmation__icon create-confirmation__icon--address" />
              <span className="create-confirmation__headline">
                {this.props.t('cms.properties.edit.tab_label.address')}:
              </span>
              <span className="create-confirmation__text">
                {propertyAddress.addressLine},&nbsp;{propertyAddress.city},
                &nbsp;{propertyAddress.country}
              </span>
            </div>
            <div className="create-confirmation__detail__item">
              <CreateZipcodeIcon className="create-confirmation__icon create-confirmation__icon--zipcode" />
              <span className="create-confirmation__headline">
                {this.props.t('cms.location.table.add_new.zip_code')}:
              </span>
              <span className="create-confirmation__text">
                {propertyAddress.zipCode}
              </span>
            </div>
          </div>
          <Divider />
          <div className="create-confirmation__confirm-tip">
            {this.props.t('cms.properties.create.create_confirmation.confirm_tip')}
          </div>
          <div className="create-confirmation__detail">
            <div className="create-confirmation__detail__item">
              <CreateStyleIcon className="create-confirmation__icon create-confirmation__icon--style" />
              <span className="create-confirmation__headline">
                {this.props.t('cms.properties.create.create_confirmation.icon_style')}:
              </span>
              <span className="create-confirmation__text">
                { t(`cms.properties.create.basic_information.apartment.type.${basicInfo.type.toLowerCase()}`) }
              </span>
            </div>
            <div className="create-confirmation__detail__item">
              <CreateCityIcon className="create-confirmation__icon create-confirmation__icon--city" />
              <span className="create-confirmation__headline">
                {this.props.t('cms.properties.create.create_confirmation.icon_city')}:
              </span>
              <span className="create-confirmation__text">
                {basicInfo.city.name}
              </span>
            </div>
            <div className="create-confirmation__detail__item">
              <CreateCurrencyIcon className="create-confirmation__icon create-confirmation__icon--currency" />
              <CurrencyBar
                t={ t }
                countryData={ basicInfo.countryData }
              />
            </div>
            <div className="create-confirmation__detail__item">
              <CreateLandlordIcon className="create-confirmation__icon create-confirmation__icon--landlord" />
              <span className="create-confirmation__headline">
                {this.props.t('cms.table.column.landlord')}:
              </span>
              <span className="create-confirmation__text">
                {basicInfo.landlord.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CreateConfirmation.propTypes = {
  t: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    propertyAddress: PropTypes.object,
    basicInfo: PropTypes.object,
  }),
};

CreateConfirmation.defaultProps = {
  t: () => {},
  formData: {},
};
