import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  offerCategory, endDate, offerOwnerType,
  platformEntity, entityAction, displayType, displaySetting,
} from '~constants';
import update from 'immutability-helper';
import moment from 'moment';
import { Form, Card, DatePicker, Radio, Button, message, Checkbox } from 'antd';
import showElementByAuth from '~helpers/auth';
import EndDatePicker from './end-date-picker';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@withTranslation()
class Admin extends React.Component {
  onContinue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let formatValues = values;
        formatValues.ipAddresses = formatValues.ipAddresses || [];
        delete formatValues.displaySetting;
        const endDateValue = values.endDate.hasEndDate === endDate.yes ?
          moment(values.endDate.endDateValue).format('YYYY-MM-DD') : null;
        const startDate = moment(values.startDate).format('YYYY-MM-DD');
        formatValues = update(formatValues, { endDate: { $set: endDateValue } });
        formatValues = update(formatValues, { startDate: { $set: startDate } });
        formatValues = update(formatValues, { id: { $set: this.props.offerInfo.id } });

        this.props.updateSpecialOffer(formatValues);
        message.loading(this.props.t(`cms.message.special_offer.${this.props.isCreateOffer ? 'creating' : 'updating'}`), 1);
      }
    });
  }

  disabledStartDate = (startValue) => {
    if (this.props.form.getFieldValue('endDate')) {
      const endValue = this.props.form.getFieldValue('endDate').endDateValue;
      if (!endValue || !startValue) {
        return false;
      }
      return endValue.valueOf() <= startValue.valueOf();
    }
    return false;
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { offerInfo, t } = this.props;
    const displayOptions = displayType.map(item => ({
      value: item,
      label: this.props.t(`cms.special_offer.form.checkbox.${item.toLocaleLowerCase()}`),
    }));

    return (<div>
      <Card className="create-offer__card">
        <Form onSubmit={ this.handleSubmit } layout="vertical">
          <FormItem label={ t('cms.special_offer.form.start_date') }>
            { getFieldDecorator('startDate', {
              initialValue: moment(offerInfo.startDate) || null,
              rules: [
                { required: true, type: 'object', message: this.props.t('cms.special_offer.error.form.start_date') },
              ],
            })(
              <DatePicker
                disabledDate={ this.disabledStartDate }
                className="create-offer-content__input"
                format={ 'DD/MM/YYYY' }
              />,
            )}
          </FormItem>
          <FormItem label={ t('cms.special_offer.form.end_date') }>
            { getFieldDecorator('endDate', {
              initialValue: {
                endDateValue: offerInfo.endDate ?
                  moment(offerInfo.endDate) : undefined,
                hasEndDate: offerInfo.endDate ? endDate.yes : endDate.no,
              },
            })(
              <EndDatePicker
                startDate={ getFieldValue('startDate') }
                t={ t }
              />,
            )}
          </FormItem>
          <FormItem label={ t('cms.special_offer.form.exclusive_title') }>
            { getFieldDecorator('exclusive', {
              initialValue: offerInfo.exclusive ?
                offerCategory.exclusive : offerCategory.nonExclusize,
            })(
              <RadioGroup className="create-offer-content__radio">
                <Radio value={ offerCategory.exclusive }>
                  { t('cms.special_offer.form.exclusive') }
                </Radio>
                <Radio
                  value={ offerCategory.nonExclusize }
                  className="create-offer-content__radio-able"
                >
                  { t('cms.special_offer.form.noExclusive') }
                </Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label={ t('cms.special_offer.form.owner_type') }>
            { getFieldDecorator('ownerType', {
              initialValue: offerInfo.ownerType || offerOwnerType.student,
            })(
              <RadioGroup className="create-offer-content__radio" >
                <Radio value={ offerOwnerType.student }>
                  { t('cms.special_offer.form.offered.student') }
                </Radio>
                <Radio value={ offerOwnerType.landlord }>
                  { t('cms.special_offer.form.offered.landlord') }
                </Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem
            style={ { marginBottom: 0 } }
            label={ t('cms.special_offer.form.display_setting') }
          >
            { getFieldDecorator('displaySetting', {
              initialValue:
                offerInfo && offerInfo.ipAddresses
                && offerInfo.ipAddresses.length > 0
                  ? displaySetting.accordingIPAddress : displaySetting.default,
            })(
              <RadioGroup className="create-offer-content__radio">
                <Radio value={ displaySetting.default }>
                  { t('cms.special_offer.form.display_setting.slesct.default') }
                </Radio>
                <Radio value={ displaySetting.accordingIPAddress }>
                  { t('cms.special_offer.form.display_setting.slesct.according_to_ip_address') }
                </Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem style={ { height: 30, marginBottom: 24 } }>
            <If condition={ getFieldValue('displaySetting') === displaySetting.accordingIPAddress }>
              { getFieldDecorator('ipAddresses', {
                initialValue: offerInfo && offerInfo.ipAddresses
                  ? offerInfo.ipAddresses : [],
                rules: [{
                  required: true,
                  message: this.props.t('cms.special_offer.error.form.ip_address'),
                }],
              })(
                <Checkbox.Group options={ displayOptions } />,
              )}
            </If>
          </FormItem>
        </Form>
      </Card>
      <If condition={ showElementByAuth(
        platformEntity.SPECIAL_OFFERS_SPECIAL_OFFERS,
        entityAction.UPDATE,
      ) }
      >
        <Button
          type="primary"
          onClick={ this.onContinue }
          className="create-offer-content__continue-btn"
        >
          { t('cms.sepcial_offer.submit.btn') }
        </Button>
      </If>

    </div>
    );
  }
}

const AdminForm = Form.create()(Admin);

export default AdminForm;
Admin.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    validateFields: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
  }),
  offerInfo: PropTypes.object.isRequired,
  updateSpecialOffer: PropTypes.func.isRequired,
  isCreateOffer: PropTypes.bool,
};

Admin.defaultProps = {
  t: () => {},
  form: {
    getFieldDecorator: () => {},
    getFieldValue: () => {},
    validateFields: () => {},
    setFieldsValue: () => {},
  },
  offerInfo: {},
  updateSpecialOffer: () => {},
  isCreateOffer: false,
};
