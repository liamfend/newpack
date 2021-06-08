import React from 'react';
import { Form, Icon, Input, Select, Tooltip, InputNumber, Tabs, Radio, Switch, Checkbox } from 'antd';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import ReactQuill from '~components/react-quill';
import CurrencyBar from '~components/currency-bar';
import Svg from '~components/svg';
import { rankTypeOptions, freeCancellationPeriodOptions, typeOptions } from '~constants/property-field-options';
import { getRankTypeValue } from '~helpers/property-field-option';
import { generateSlug } from '~helpers';
import {
  getHtmlLength,
  checkSlugExist,
  setEditedFields,
  htmlMinify,
  removeUntouchedFields,
} from '~helpers/property-edit';
import generatePath from '~settings/routing';
import { isLandlordRole } from '~helpers/auth';

const FormItem = Form.Item;
const { TextArea } = Input;


class DetailTab extends React.Component {
  constructor(props) {
    super(props);
    this.rankType = getRankTypeValue({ ...props.property });
  }

  bedsLabel = () => (
    <div className="detail-tab__label">
      <span>{this.props.t('cms.properties.edit.detail.beds_number')}</span>
      <Tooltip title={ this.props.t('cms.properties.edit.detail.beds_number.tooltip') }>
        <Icon type="question-circle" className="detail-tab__beds-icon" />
      </Tooltip>
    </div>
  );

  viewExampleLabel = (label, link, isHeadline) => (
    <div className="detail-tab__label">
      <span>{label}</span>
      <a className="detail-tab__label__link" href={ link } style={ { display: 'none' } }>
        {this.props.t('cms.properties.edit.detail.link.view_example')}
      </a>
      <If condition={ isHeadline }>
        <Tooltip title={ this.props.t('cms.properties.edit.detail.headline.tips') }>
          <Icon type="question-circle" className="detail-tab__beds-icon" />
        </Tooltip>
      </If>
    </div>
  );

  displayCityLabel = () => (
    <div className="detail-tab__label">
      <span>
        { this.props.t('cms.properties.create.create_confirmation.icon_city') }
      </span>
      <Tooltip title={ this.props.t('cms.properties.edit.detail.display_city.tips') }>
        <Icon type="question-circle" className="detail-tab__beds-icon" />
      </Tooltip>
    </div>
  );

  quillCounter = (html) => {
    const number = getHtmlLength(html);
    return (
      <div className={ classNames('detail-tab__counter') }>
        {number}
      </div>
    );
  }

  textAreaCounter = (text, limit) => {
    const number = text ? text.length : 0;
    return (
      <div className={ classNames('detail-tab__counter', { 'detail-tab__counter--red': number > limit }) }>
        {`${number}/${limit}`}
      </div>
    );
  }

  onNameBlur = (e) => {
    if (e.target.value && !this.props.form.getFieldValue('slug')) {
      const slug = generateSlug(e.target.value);
      this.props.form.setFields({ slug: { value: slug, touched: true } });
      this.props.form.validateFields(['slug']);
    }
  }

  validateSlug = (rule, value, callback) => {
    if (!value || value === this.props.property.slug) {
      callback();
    } else if (!(/^[A-Za-z0-9\-]+$/.test(value))) { // eslint-disable-line
      callback(this.props.t('cms.properties.edit.detail.property_slug.format_error'));
    } else {
      checkSlugExist(value, callback, () => { callback(this.props.t('cms.properties.edit.detail.property_slug.exist_error')); });
    }
  }

  validateCity = (rule, value, callback) => {
    const { published } = this.props.property.city;
    if (!published) {
      callback(this.props.t('cms.properties.edit.detail.city.state_unpublished'));
    }
    callback();
  }

  validateHeadlineEN = (rule, value, callback) => {
    if (!value && !this.props.form.getFieldValue('headlineCn')) {
      if (isLandlordRole()) {
        callback(this.props.t('cms.properties.edit.detail.headline.landlord_blank_message'));
      } else {
        callback(this.props.t('cms.properties.edit.detail.headline.blank_message'));
      }
    }
    callback();
  }

  validateHeadlineCN = (rule, value, callback) => {
    if (!value && !this.props.form.getFieldValue('headline')) {
      callback(this.props.t('cms.properties.edit.detail.headline.blank_message'));
    }
    callback();
  }

  validateDescEN = (rule, value, callback) => {
    const isCNFilled = this.props.form.getFieldValue('headlineCn') && this.props.form.getFieldValue('descriptionCn');
    if ((!value && this.props.form.getFieldValue('headline')) && !isCNFilled) {
      callback(this.props.t('cms.listing.modal.error_message.can_not_empty'));
    }
    callback();
  }

  validateDescCN = (rule, value, callback) => {
    const isENFilled = this.props.form.getFieldValue('headline') && this.props.form.getFieldValue('description');
    if (!value && this.props.form.getFieldValue('headlineCn') && !isENFilled) {
      callback(this.props.t('cms.listing.modal.error_message.can_not_empty'));
    }
    callback();
  }

  onEnTabBlur = () => {
    setTimeout(() => {
      this.props.form.validateFields(['descriptionCn', 'headlineCn'], { force: true });
    }, 100);
  }

  onCnTabBlur = () => {
    setTimeout(() => {
      this.props.form.validateFields(['description', 'headline'], { force: true });
    }, 100);
  }

  getTabLabel = (label) => {
    const { form } = this.props;
    const { getFieldError } = form;
    let cnErrorIcon = false;
    if (label === 'CN') {
      cnErrorIcon = getFieldError('headlineCn') || getFieldError('descriptionCn');
    } else {
      cnErrorIcon = getFieldError('headline') || getFieldError('description');
    }
    return (
      <span>
        <If condition={ cnErrorIcon }>
          <Icon type="exclamation-circle" style={ { color: '#ed9b1e' } } />
        </If>
        {this.props.t('cms.properties.edit.detail.tab_type', { type: label })}
      </span>
    );
  }

  render() {
    const {
      getFieldDecorator, getFieldValue, getFieldError,
    } = this.props.form;
    const { t, property } = this.props;
    const { TabPane } = Tabs;
    return (
      <Form className="detail-tab" layout="vertical">
        <div className="detail-tab__column">
          <h5 className="detail-tab__title">
            {t('cms.properties.edit.detail.subtitle.base_information')}
          </h5>
          <FormItem
            label={ t('cms.properties.edit.detail.property_name') }
            colon={ false }
          >
            {getFieldDecorator('name', {
              rules: [{ required: true, message: t('cms.properties.edit.error.blank') }],
              initialValue: property.name,
              validateTrigger: 'onBlur',
            })(
              <Input
                placeholder={ t('cms.properties.edit.detail.property_name.placeholder') }
                onBlur={ this.onNameBlur }
              />,
            )}
          </FormItem>

          <If condition={ !isLandlordRole() }>
            <FormItem
              label={ t('cms.properties.edit.detail.property_slug') }
              colon={ false }
            >
              {getFieldDecorator('slug', {
                rules: [{ required: true, message: t('cms.properties.edit.error.blank') },
                  { validator: this.validateSlug },
                ],
                initialValue: property.slug,
                validateTrigger: 'onBlur',
              })(
                <Input
                  placeholder={ t('cms.properties.edit.detail.property_slug.placeholder') }
                />,
              )}
            </FormItem>
          </If>

          <FormItem
            className="detail-tab__label--disable detail-tab__label--hide"
            label={ t('cms.properties.edit.detail.type') }
            disabled
            colon={ false }
          >
            {getFieldDecorator('bookingType', {
              initialValue: property.bookingType,
            })(
              <Select
                placeholder={ t('cms.properties.edit.dropdown.placeholder') }
                disabled
              >
                <For each="option" of={ typeOptions } index="key">
                  <Option value={ option.value } key={ key }>{t(option.text)}</Option>
                </For>
              </Select>,
            )}
          </FormItem>
          <FormItem
            className="property-edit__label--disable"
            label={ t('cms.properties.edit.detail.landlord') }
            colon={ false }
          >
            {getFieldDecorator('landlord', {
              initialValue: property.landlord ? property.landlord.name : null,
            })(

              <Select
                placeholder={ t('cms.properties.edit.dropdown.placeholder') }
                disabled
              />,
            )}
          </FormItem>
          <FormItem
            className="property-edit__label--disable"
            label={ t('cms.properties.edit.detail.Country') }
            colon={ false }
          >
            {getFieldDecorator('country', {
              initialValue: property.city && property.city.country ?
                property.city.country.name : null,
            })(
              <Select
                placeholder={ t('cms.properties.edit.dropdown.placeholder') }
                disabled
              />,
            )}
          </FormItem>
          <FormItem
            className={ 'property-edit__label--disable detail-tab__city' }
            label={ this.displayCityLabel() }
            colon={ false }
          >
            {getFieldDecorator('city', {
              rules: [{ validator: this.validateCity },
              ],
              initialValue: property.city ? property.city.name : null,
            })(
              <Select
                placeholder={ t('cms.properties.edit.dropdown.placeholder') }
                disabled
              />,
            )}
            <If condition={ getFieldError('city') }>
              <Link
                className="detail-tab__city--status"
                to={ generatePath('city.edit', {
                  slug: property.city.slug,
                }) }
              >
                {this.props.t('cms.properties.edit.detail.city.state_change')}
              </Link>
            </If>
            <CurrencyBar
              t={ t }
              countryData={ property }
            />
          </FormItem>
          <FormItem
            label={ this.bedsLabel() }
            colon={ false }
          >
            {
              getFieldDecorator('totalBeds', {
                initialValue: property.totalBeds,
                trigger: 'onChange',
                validateTrigger: 'onBlur',
              })(
                <InputNumber
                  min={ 0 }
                  placeholder={ t('cms.properties.edit.detail.beds_number.placeholder') }
                  precision={ 0 }
                />,
              )}
          </FormItem>
          <div className="detail-tab__title detail-tab__title--cancellation">
            {t('cms.properties.edit.detail.cancelation_policy')}
          </div>
          <div className="detail-tab__switch-item">
            <div className="detail-tab__item-title">
              {t('cms.properties.edit.detail.cancelation_policy.display_controller')}
            </div>
            { getFieldDecorator('cancellationChecked', {
              valuePropName: 'checked',
              initialValue: property.cancellationChecked,
              trigger: 'onChange',
              validateTrigger: 'onBlur',
            })(
              <Switch
                className="detail-tab__cancel-switch"
                checkedChildren={ <Svg className="detail-tab__switch-check-icon" hash="create-tick" /> }
              />,
            ) }
          </div>
          <FormItem
            label={ t('cms.properties.edit.detail.free_cancellation_period') }
            colon={ false }
          >
            {getFieldDecorator('freeCancellationPeriod', {
              initialValue:
                property.freeCancellationPeriod ? property.freeCancellationPeriod : undefined,
            })(
              <Select
                placeholder={ t('cms.properties.edit.detail.free_cancellation_period.placeholder') }
              >
                <For each="item" of={ freeCancellationPeriodOptions }>
                  <Select.Option
                    value={ item.value }
                    key={ item.value }
                  >{t(item.text)}</Select.Option>
                </For>
              </Select>,
            )}
          </FormItem>
          <div className="detail-tab__other-cancellation">
            <span className="detail-tab__other-text">{t('cms.properties.edit.detail.cancelation_policy.others')}</span>
            {
              getFieldDecorator('noVisaNoPay', {
                valuePropName: 'checked',
                initialValue: property.noVisaNoPay,
                trigger: 'onChange',
                validateTrigger: 'onBlur',
              })(
                <Checkbox className="detail-tab__cancel-checkbox">
                  {t('cms.properties.edit.detail.cancelation_policy.no_visa_no_pay')}
                </Checkbox>,
              )
            }
            {
              getFieldDecorator('noPlaceNoPay', {
                valuePropName: 'checked',
                initialValue: property.noPlaceNoPay,
                trigger: 'onChange',
                validateTrigger: 'onBlur',
              })(
                <Checkbox className="detail-tab__cancel-checkbox">
                  {t('cms.properties.edit.detail.cancelation_policy.no_place_no_pay')}
                </Checkbox>,
              )
            }
          </div>
          <FormItem
            className="detail-tab__label__quill"
            label={ this.viewExampleLabel(t('cms.properties.edit.detail.cancelation_policy'), '') }
            colon={ false }
          >
            {getFieldDecorator('cancellationProcess', {
              initialValue: htmlMinify(property.cancellationProcess),
              validateTrigger: 'onChange',
            })(
              <ReactQuill
                placeholder={ t('cms.properties.edit.detail.cancelation_policy.plcaeholder') }
                fontTypes={ [3, false] }
              />
              ,
            )}
            {this.quillCounter(getFieldValue('cancellationProcess'))}
          </FormItem>
          <FormItem
            className="detail-tab__label__quill"
            label={ this.viewExampleLabel(t('cms.properties.edit.detail.cancelation_policy.covid_19'), '') }
            colon={ false }
          >
            {getFieldDecorator('covid19Policy', {
              initialValue: htmlMinify(property.covid19Policy),
              validateTrigger: 'onChange',
            })(
              <ReactQuill
                placeholder={ t('cms.properties.edit.detail.cancelation_policy.plcaeholder') }
                fontTypes={ [3, false] }
              />
              ,
            )}
            {this.quillCounter(getFieldValue('covid19Policy'))}
          </FormItem>
        </div>
        <div className={ 'detail-tab__column detail-tab__desc' }>
          <h5 className="detail-tab__title">
            {t('cms.properties.edit.detail.subtitle.detailed_information')}
          </h5>
          <Tabs defaultActiveKey={ isLandlordRole() ? 'EN' : 'CN' }>
            <If condition={ !isLandlordRole() }>
              <TabPane tab={ this.getTabLabel('CN') } key="CN">
                <FormItem
                  className="detail-tab__label__quill"
                  label={ this.viewExampleLabel(t('cms.properties.edit.detail.headline'), '', true) }
                  colon={ false }
                >{getFieldDecorator('headlineCn', {
                    initialValue:
                property.headlineCn ? property.headlineCn : undefined,
                    rules: [{ max: 120, message: ' ' }, { validator: this.validateHeadlineCN }],
                    validateTrigger: 'onChange',
                  })(
                    <TextArea
                      style={ { height: '80px' } }
                      placeholder={ t('cms.properties.edit.detail.headline.place_holder') }
                      onBlur={ this.onCnTabBlur }
                    />,
                  )}
                  {this.textAreaCounter(getFieldValue('headlineCn'), 120)}
                </FormItem>
                <FormItem
                  className="detail-tab__label__quill"
                  label={ this.viewExampleLabel(t('cms.properties.edit.detail.desc'), '') }
                  colon={ false }
                >
                  {getFieldDecorator('descriptionCn', {
                    rules: [{ validator: this.validateDescCN }],
                    initialValue: htmlMinify(property.descriptionCn),
                    normalize: this.changeRichText,
                  })(
                    <ReactQuill
                      placeholder={ t('cms.properties.edit.detail.desc.placeholder') }
                      fontTypes={ [3, false] }
                      onBlur={ this.onCnTabBlur }
                    />,
                  )}
                  {this.quillCounter(getFieldValue('descriptionCn'))}
                </FormItem>
              </TabPane>
            </If>
            <TabPane tab={ this.getTabLabel('EN') } key="EN">
              <FormItem
                className="detail-tab__label__quill"
                label={ this.viewExampleLabel(t('cms.properties.edit.detail.headline'), '', true) }
                colon={ false }
              >{getFieldDecorator('headline', {
                  initialValue:
              property.headline ? property.headline : undefined,
                  rules: [{ max: 300, message: ' ', required: isLandlordRole() }, { validator: this.validateHeadlineEN }],
                  validateTrigger: 'onChange',
                })(
                  <TextArea
                    style={ { height: '80px' } }
                    placeholder={ t('cms.properties.edit.detail.headline.place_holder') }
                    onBlur={ this.onEnTabBlur }
                  />,
                )}
                {this.textAreaCounter(getFieldValue('headline'), 300)}
              </FormItem>
              <FormItem
                className="detail-tab__label__quill"
                label={ this.viewExampleLabel(t('cms.properties.edit.detail.desc'), '') }
                colon={ false }
              >
                {getFieldDecorator('description', {
                  rules: [{ validator: this.validateDescEN, required: isLandlordRole() }],
                  initialValue: htmlMinify(property.description),
                  normalize: this.changeRichText,
                })(
                  <ReactQuill
                    placeholder={ t('cms.properties.edit.detail.desc.placeholder') }
                    fontTypes={ [3, false] }
                    onBlur={ this.onEnTabBlur }
                  />,
                )}
                {this.quillCounter(getFieldValue('description'))}
              </FormItem>
            </TabPane>
          </Tabs>

          <If condition={ !isLandlordRole() }>
            <div className="others-tab__ranking-settings">
              <div className="detail-tab__title">
                {t('cms.properties.edit.others.ranking_setting')}
              </div>
              <Form.Item label={ t('cms.properties.edit.others.ranking_type') }>
                {
                  getFieldDecorator('rankType', {
                    initialValue: this.rankType,
                  })(
                    <Radio.Group
                      onChange={ this.changeRankingType }
                    >
                      <For each="option" of={ rankTypeOptions } index="key">
                        <Radio value={ option.value } key={ key }>
                          {t(option.text)}
                        </Radio>
                      </For>
                    </Radio.Group>,
                  )
                }
              </Form.Item>
              <Form.Item label={ (
                <div>
                  {t('cms.properties.edit.others.ranking_value')}
                  <span className="others-tab__sub-label">(0-1000)</span>
                </div>) }
              >
                {
                  getFieldDecorator('rank', {
                    initialValue: property.rank,
                  })(
                    <InputNumber
                      min={ 0 }
                      max={ 1000 }
                      precision={ 0 }
                      onChange={ this.changeRankingValue }
                      placeholder={ t('cms.properties.edit.others.ranking_value.placeholder') }
                    />,
                  )
                }
              </Form.Item>
            </div>
          </If>
        </div>
      </Form>
    );
  }
}

DetailTab.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  property: PropTypes.object.isRequired,
};

const onFieldsChange = (props, changedFields) => {
  const fields = removeUntouchedFields(changedFields, 'details');

  if (Object.keys(fields).includes('totalBeds')) {
    // eslint-disable-next-line radix
    fields.totalBeds.value = parseInt(fields.totalBeds.value);
  }
  setEditedFields('details', fields);
  props.setFieldsHaveChanged();
};


export default Form.create({
  name: 'detail_tab',
  onFieldsChange,
})(DetailTab);
