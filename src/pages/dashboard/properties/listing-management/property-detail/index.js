import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getSymbolFromCurrency } from '~base/global/helpers/currency';
import { Form, Row, Col, Switch, Select, Checkbox, Input, InputNumber, Radio } from 'antd';
import { toLower } from 'lodash';
import {
  rankTypeOptions,
  freeCancellationPeriodOptions,
  longtailFreeCancellationPeriodOptions,
  billingCycleOptions,
  draftLongtailCancellationPeriod,
} from '~constants/property-field-options';
import { longtailCancellationPeriod } from '~helpers/longtail-cancellation-period';
import { getBillingCycleText, getRankTypeValue } from '~helpers/property-field-option';
import { CreateTick as CreateTickIcon } from "~components/svgs";
import ReactQuill from '~components/react-quill';
import PropertyDetailWrapper from '~components/property-detail-wrapper';
import enhanceForm from '~hocs/enhance-form';
import * as queries from '~settings/queries';
import { fetch } from '~helpers/graphql';
import { getHtmlLength, htmlMinify, checkSlugExist } from '~helpers/property-edit';
import {
  propertyStatus,
  propertyTenancyAgreementUnit,
  propertyTenancyAgreementField,
  propertyTenancyAgreementTimeType,
  propertyTenancyAgreementCalculateType,
} from '~constants/listing-management';
import { propertyDraftCategory, propertyDraftStatus } from '~constants/pending-approval';
import { generateSlug } from '~helpers';
import LongtailFreeCancellationPeriod from '~components/longtail-cancellation-policy';

const FormItem = Form.Item;
const { TextArea } = Input;

@enhanceForm()
export default class PropertyDetail extends React.Component {
  constructor(props) {
    super(props);
    this.mergedProperty = this.mergeDraft();
    this.rankType = getRankTypeValue({ ...this.mergedProperty });

    this.propertyTenancyAgreementCalculateTypeList =
      Object.keys(propertyTenancyAgreementCalculateType);
    this.propertyTenancyAgreementParams = [
      'calculateType',
      'field',
      'timeType',
      'unit',
      'value',
    ];
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  mergeDraft = () => {
    const { property } = this.props;
    // unpublished property always show raw data
    if (
      property &&
      property.drafts &&
      property.drafts.edges.length > 0 &&
      property.status === propertyStatus.PUBLISHED
    ) {
      const propertyDrafts = property.drafts.edges.map(draft => draft.node);
      const detailDraft = propertyDrafts.find((draft) => {
        const { category, status } = draft;
        return category === propertyDraftCategory.DETAIL && status === propertyDraftStatus.PENDING;
      });

      if (detailDraft) {
        const data = Object.assign({}, property, detailDraft.changes);

        if (data.cancellationPeriod) {
          data.cancellationPeriod =
          draftLongtailCancellationPeriod[data.cancellationPeriod] || data.cancellationPeriod;
        }

        return data;
      }

      return property;
    }

    return property;
  }

  quillCounter = (html) => {
    const number = getHtmlLength(html);
    return (
      <div className={ classNames('property-detail__counter') }>
        { number }
      </div>
    );
  }

  getCityCountry = () => {
    const cityArr = [];

    if (this.mergedProperty.city) {
      cityArr.push(this.mergedProperty.city.name);

      if (this.mergedProperty.city.country) {
        cityArr.push(this.mergedProperty.city.country.name);
      }
    }

    return cityArr.join();
  };

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

  validateHeadlineCN = (rule, value, callback) => {
    if (!value && !this.props.form.getFieldValue('headline')) {
      callback(this.props.t('cms.properties.edit.detail.headline.blank_message'));
    }
    callback();
  }

  textAreaCounter = (text, limit) => {
    const number = text && text.trim() ? text.trim().length : 0;
    return (
      <div className={ classNames('property-detail__counter', { 'property-detail__counter--red': number > limit }) }>
        {`${number}/${limit}`}
      </div>
    );
  }

  validateHeadlineEN = (rule, value, callback) => {
    if (!value && !this.props.form.getFieldValue('headlineCn')) {
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

  requestParams = (changeFields) => {
    let internalFieldsParams = {};
    const detailsParams = Object.assign({}, changeFields);

    if ('rank' in changeFields) {
      const { rank } = changeFields;
      internalFieldsParams = Object.assign(internalFieldsParams, { rank });
      delete detailsParams.rank;
    }
    if ('rankType' in changeFields) {
      const { rankType } = changeFields;
      internalFieldsParams = Object.assign(internalFieldsParams, { rankType });
      delete detailsParams.rankType;
    }

    return { internalFieldsParams, detailsParams };
  };

  beforeSave = (callback) => {
    this.props.checkDraftReviewmodal(() => this.handleSubmit(callback));
  };

  handleSubmit = (callback = () => {}) => {
    this.props.form.validateFieldsAndScroll(
      { scroll: { offsetTop: 76, offsetBottom: 76 } },
      (err) => {
        if (!err) {
          const {
            changeFields,
            property,
          } = this.props;
          const requests = [];
          const isLongtail = this.mergedProperty && this.mergedProperty.landlord &&
          this.mergedProperty.landlord.bookingJourney === 'SEMI_AUTOMATIC';
          if (isLongtail && !this.mergedProperty.cancellationPeriod) {
            changeFields.cancellationPeriod =
            longtailCancellationPeriod.BEFORE_MOVE_IN_CALENDAR_DAYS_14;
          }

          const isCreateAction = !property.tenancyAgreement;
          let hasTenancyAgreementChanged = false;
          const propertyTenancyAgreementChangeParams = {};
          if (isLongtail) {
            // Call update/create property tenancy agreement if needed.
            this.propertyTenancyAgreementParams.forEach((param) => {
              const key = `tenancyAgreement${param.charAt(0).toUpperCase() + param.slice(1)}`;
              if (!(key in changeFields)) {
                return;
              }

              if (param === 'timeType') {
                propertyTenancyAgreementChangeParams[param] = changeFields[key] ?
                  propertyTenancyAgreementTimeType.FIXED :
                  propertyTenancyAgreementTimeType.ANYTIME;
              } else {
                propertyTenancyAgreementChangeParams[param] = changeFields[key];
              }
              delete changeFields[key];
              hasTenancyAgreementChanged = true;
            });
          }

          const { internalFieldsParams, detailsParams } = this.requestParams(changeFields);

          if (Object.keys(internalFieldsParams).length > 0) {
            requests.push(fetch(queries.updatePropertyInternalFields(
              Object.assign(internalFieldsParams, { id: property.id }),
            )));
          }
          if (Object.keys(detailsParams).length > 0) {
            requests.push(fetch(queries.updatePropertyDetails(
              Object.assign(detailsParams, { id: property.id }),
            )));
          }
          if (isLongtail && (hasTenancyAgreementChanged || isCreateAction)) {
            const data = this.buildPropertyTenancyAgreementData(
              propertyTenancyAgreementChangeParams, isCreateAction,
            );
            changeFields.tenancyAgreement = data;
            const query = isCreateAction ?
              queries.createPropertyTenancyAgreement(data) :
              queries.updatePropertyTenancyAgreement(data);
            requests.push(fetch(query));
          }

          const changeParams = Object.assign({}, changeFields);
          if (changeParams.rankType) {
            changeParams.rankStar = changeParams.rankType === 'STAR';
            changeParams.rankBlacksheep = changeParams.rankType === 'BLACKSHEEP';

            delete changeParams.rankType;
          }

          Promise.all(requests).then((res) => {
            if (res.length > 0 && Object.values(res[0])[0] && Object.values(res[0])[0].property) {
              const { drafts } = Object.values(res[0])[0].property;
              changeParams.drafts = drafts;
            }
            this.props.afterSave(changeParams);

            callback({ status: 'success', isUpdated: true });
          }).catch((e) => {
            callback({ status: 'err', err: e });
          });
        } else {
          callback({ status: 'success', isUpdated: false });
        }
      },
    );
  };

  buildPropertyTenancyAgreementData = (data, isCreateAction = false) => {
    const params = { ...data };
    const defaultParams = {};

    if (isCreateAction) {
      defaultParams.propertyId = this.props.property.id;
      defaultParams.timeType = propertyTenancyAgreementTimeType.ANYTIME;
      defaultParams.calculateType = propertyTenancyAgreementCalculateType.BEFORE;
      defaultParams.field = propertyTenancyAgreementField.MOVE_IN_DATE;
    } else {
      defaultParams.id = this.mergedProperty.tenancyAgreement.id;
    }

    if (params.timeType === propertyTenancyAgreementTimeType.FIXED) {
      defaultParams.unit = propertyTenancyAgreementUnit.DAY;
      defaultParams.value = 1;
    } else if (params.timeType === propertyTenancyAgreementTimeType.ANYTIME) {
      params.unit = null;
      params.value = null;
    }
    return Object.assign(defaultParams, params);
  };

  handleBlurNumberInput = (field) => {
    if (this.props.form.getFieldValue(field) === null) {
      this.props.form.setFieldsValue({ [field]: 0 });
    }
  };

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

  isValidated = () => {
    const fieldsError = this.props.form.getFieldsError();
    return Object.values(fieldsError).filter(error => error).length === 0;
  }

  render() {
    const {
      t,
      property,
      form: { getFieldDecorator, getFieldValue },
      rejectedDraftIds,
    } = this.props;
    const { Option } = Select;
    const isLongtail = this.mergedProperty.landlord &&
    this.mergedProperty.landlord.bookingJourney === 'SEMI_AUTOMATIC';

    return (
      <PropertyDetailWrapper
        t={ t }
        isPublished={ property.status === propertyStatus.PUBLISHED }
        onClickSave={ this.beforeSave }
        rejectedDraftIds={ rejectedDraftIds }
        expirePropertyDraft={ this.props.expirePropertyDraft }
        isValidated={ this.isValidated() }
      >
        <Form className="property-detail">
          <p className="property-detail__subtitle">
            { t('cms.properties.edit.detail.basic_information') }
          </p>
          <Row>
            <Col span={ 24 }>
              <div className="property-detail__basic-info">
                <span className="property-detail__basic-label">
                  { t('cms.properties.edit.detail.landlord') }
                </span>
                <span className="property-detail__basic-text property-detail__basic-text--ellipsis">
                  { this.mergedProperty.landlord ? this.mergedProperty.landlord.name : null }
                </span>
                <span className="property-detail__line" />
                <span className="property-detail__basic-label">
                  { t('cms.properties.edit.detail.City') }
                </span>
                <span className="property-detail__basic-text">
                  { this.getCityCountry() }
                </span>
                <span className="property-detail__line" />
                <span className="property-detail__basic-label">
                  { t('cms.properties.edit.detail.currency') }
                </span>
                <span className="property-detail__basic-text">
                  { this.mergedProperty ? `${this.mergedProperty.currency} - ${getSymbolFromCurrency(this.mergedProperty.currency)}` : '-' }
                </span>
                <span className="property-detail__line" />
                <span className="property-detail__basic-label">
                  { t('cms.properties.edit.detail.billing_cycle') }
                </span>
                <span className="property-detail__basic-text">
                  { this.mergedProperty ? getBillingCycleText(this.mergedProperty.billingCycle, billingCycleOptions) : '-'}
                </span>
              </div>
            </Col>
          </Row>
          <Row gutter={ 24 }>
            <Col span={ 12 }>
              <FormItem
                label={ t('cms.properties.edit.detail.property_name') }
                colon={ false }
              >
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: t('cms.properties.edit.error.blank') }],
                  initialValue: this.mergedProperty.name,
                  validateTrigger: 'onBlur',
                })(
                  <Input
                    placeholder={ t('cms.properties.edit.detail.property_name.placeholder') }
                    onBlur={ this.onNameBlur }
                  />,
                )}
              </FormItem>
            </Col>
            <Col span={ 12 }>
              <FormItem
                label={ t('cms.properties.edit.detail.property_slug') }
                colon={ false }
              >
                {getFieldDecorator('slug', {
                  rules: [
                    { required: true, message: t('cms.properties.edit.error.blank') },
                    { validator: this.validateSlug },
                  ],
                  initialValue: this.mergedProperty.slug,
                  validateTrigger: 'onBlur',
                })(
                  <Input
                    placeholder={ t('cms.properties.edit.detail.property_slug.placeholder') }
                  />,
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={ 24 }>
            <Col span={ 12 }>
              <FormItem
                label={ t('cms.properties.edit.detail.beds_number') }
                colon={ false }
              >
                {
                  getFieldDecorator('totalBeds', {
                    initialValue: this.mergedProperty.totalBeds,
                    trigger: 'onChange',
                    validateTrigger: 'onBlur',
                  })(
                    <InputNumber
                      min={ 0 }
                      placeholder={ t('cms.properties.edit.detail.beds_number.placeholder') }
                      precision={ 0 }
                      onBlur={ () => this.handleBlurNumberInput('totalBeds') }
                    />,
                  )}
              </FormItem>
            </Col>
          </Row>
          <p className="property-detail__subtitle">
            { t('cms.properties.edit.detail.cancelation_policy') }
          </p>
          <Choose>
            <When condition={ isLongtail } >
              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <FormItem
                    label={ t('cms.properties.edit.detail.cancellation_period') }
                    colon={ false }
                  >
                    <div ref={ (node) => { this.cancellationPeriod = node; } }>
                      {getFieldDecorator('cancellationPeriod', {
                        initialValue: this.mergedProperty.cancellationPeriod ?
                          this.mergedProperty.cancellationPeriod.toUpperCase() :
                          longtailCancellationPeriod.BEFORE_MOVE_IN_CALENDAR_DAYS_14,
                      })(
                        <Select
                          placeholder={ t('cms.properties.edit.detail.cancellation_period.placeholder') }
                          getPopupContainer={ () => this.cancellationPeriod }
                        >
                          <For each="item" of={ longtailFreeCancellationPeriodOptions }>
                            <Select.Option
                              value={ item.value }
                              key={ item.value }
                            >
                              { t(item.text) }
                            </Select.Option>
                          </For>
                        </Select>,
                      )}
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={ 24 }>
                <LongtailFreeCancellationPeriod
                  t={ t }
                  freeCancellationPeriod={ getFieldValue('cancellationPeriod') ||
                    this.mergedProperty.cancellationPeriod.toUpperCase() }
                />
              </Row>
            </When>
            <Otherwise>
              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <div className="property-detail__switch-item">
                    <span className="property-detail__item-title">
                      { t('cms.properties.edit.detail.cancelation_policy.display_controller') }
                    </span>
                    { getFieldDecorator('cancellationChecked', {
                      valuePropName: 'checked',
                      initialValue: this.mergedProperty.cancellationChecked,
                      trigger: 'onChange',
                      validateTrigger: 'onBlur',
                    })(
                      <Switch
                        className="property-detail__cancel-switch"
                        checkedChildren={ <CreateTickIcon className="property-detail__switch-check-icon" /> }
                      />,
                    ) }
                  </div>
                </Col>
              </Row>
              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <FormItem
                    label={ t('cms.properties.edit.detail.free_cancellation_period') }
                    colon={ false }
                  >
                    <div ref={ (node) => { this.freeCancellationPeriod = node; } }>
                      {getFieldDecorator('freeCancellationPeriod', {
                        initialValue:
                          this.mergedProperty.freeCancellationPeriod ?
                            this.mergedProperty.freeCancellationPeriod :
                            undefined,
                      })(
                        <Select
                          placeholder={ t('cms.properties.edit.detail.free_cancellation_period.placeholder') }
                          getPopupContainer={ () => this.freeCancellationPeriod }
                        >
                          <For each="item" of={ freeCancellationPeriodOptions }>
                            <Select.Option
                              value={ item.value }
                              key={ item.value }
                            >
                              { t(item.text) }
                            </Select.Option>
                          </For>
                        </Select>,
                      )}
                    </div>
                  </FormItem>
                </Col>
                <Col span={ 12 }>
                  <div className="property-detail__student-booking-guarantee">
                    <div className="property-detail__label">
                      { t('cms.properties.edit.detail.cancelation_policy.student_booking_guarantee') }
                    </div>
                    <div className="property-detail__checkbox-wrap">
                      {
                        getFieldDecorator('noVisaNoPay', {
                          valuePropName: 'checked',
                          initialValue: this.mergedProperty.noVisaNoPay,
                          trigger: 'onChange',
                          validateTrigger: 'onBlur',
                        })(
                          <Checkbox className="property-detail__cancel-checkbox">
                            { t('cms.properties.edit.detail.cancelation_policy.no_visa_no_pay') }
                          </Checkbox>,
                        )
                      }
                      {
                        getFieldDecorator('noPlaceNoPay', {
                          valuePropName: 'checked',
                          initialValue: this.mergedProperty.noPlaceNoPay,
                          trigger: 'onChange',
                          validateTrigger: 'onBlur',
                        })(
                          <Checkbox className="property-detail__cancel-checkbox">
                            { t('cms.properties.edit.detail.cancelation_policy.no_place_no_pay') }
                          </Checkbox>,
                        )
                      }
                    </div>
                  </div>
                </Col>
              </Row>
              <Row gutter={ 24 }>
                <Col span={ 12 }>
                  <FormItem
                    label={ t('cms.properties.edit.detail.cancelation_policy') }
                    colon={ false }
                  >
                    {getFieldDecorator('cancellationProcess', {
                      initialValue: htmlMinify(this.mergedProperty.cancellationProcess),
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
                </Col>
                <Col span={ 12 }>
                  <FormItem
                    label={ t('cms.properties.edit.detail.cancelation_policy.covid_19.label') }
                    colon={ false }
                  >
                    {getFieldDecorator('covid19Policy', {
                      initialValue: htmlMinify(this.mergedProperty.covid19Policy),
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
                </Col>
              </Row>
            </Otherwise>
          </Choose>

          <If condition={ isLongtail }>
            <p className="property-detail__subtitle">
              {t('cms.properties.edit.detail.tenancy_agreement')}
            </p>
            <Row gutter={ 24 }>
              <Col span={ 12 }>
                <Row gutter={ 4 }>
                  <Col span={ 24 } className="property-detail__tenancy-agreement-time-type-container">
                    <label className="property-detail__tenancy-agreement-time-type-label">
                      {t('cms.properties.edit.detail.tenancy_agreement.label')}
                    </label>
                    <FormItem className="property-detail__tenancy-agreement-time-type">
                      {getFieldDecorator('tenancyAgreementTimeType', {
                        valuePropName: 'checked',
                        initialValue:
                          property.tenancyAgreement &&
                          property.tenancyAgreement.timeType &&
                          property.tenancyAgreement.timeType ===
                            propertyTenancyAgreementTimeType.FIXED,
                      })(
                        <Checkbox className="property-detail__tenancy-agreement-time-label">
                          {t('cms.properties.edit.detail.tenancy_agreement.checkbox.label')}
                        </Checkbox>,
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={ 8 }>
                  <If condition={ getFieldValue('tenancyAgreementTimeType') }>
                    <Col span={ 5 } className="property-detail__tenancy-agreement-container">
                      <FormItem>
                        {getFieldDecorator('tenancyAgreementValue', {
                          initialValue:
                            property.tenancyAgreement &&
                            property.tenancyAgreement.value ?
                              property.tenancyAgreement.value : 1,
                          rules: [{ required: true, message: ' ' }],
                        })(
                          <InputNumber
                            min={ 1 }
                            max={ 365 }
                            precision={ 0 }
                            className="property-detail__tenancy-agreement-value"
                          />,
                        )}
                      </FormItem>
                    </Col>
                    <Col span={ 5 }>
                      <FormItem>
                        {getFieldDecorator('tenancyAgreementUnit', {
                          validateTrigger: 'onChange',
                          initialValue:
                            property.tenancyAgreement &&
                            property.tenancyAgreement.unit ?
                              property.tenancyAgreement.unit :
                              propertyTenancyAgreementUnit.DAY,
                        })(
                          <Select disabled className="property-detail__tenancy-agreement-unit">
                            <Option value={ propertyTenancyAgreementUnit.DAY } >
                              {t('cms.properties.edit.detail.tenancy_agreement.unit.day')}
                            </Option>
                          </Select>,
                        )}
                      </FormItem>
                    </Col>
                  </If>
                  <If condition={ !getFieldValue('tenancyAgreementTimeType') }>
                    <Col span={ 10 }>
                      <Input disabled value={ t('cms.properties.edit.detail.tenancy_agreement.value.anytime') } />
                    </Col>
                  </If>
                  <Col span={ 7 }>
                    <FormItem>
                      {getFieldDecorator('tenancyAgreementCalculateType', {
                        validateTrigger: 'onChange',
                        initialValue:
                          property.tenancyAgreement &&
                          property.tenancyAgreement.calculateType ?
                            property.tenancyAgreement.calculateType :
                            propertyTenancyAgreementCalculateType.BEFORE,
                      })(
                        <Select className="property-detail__tenancy-agreement-calculate-type">
                          <For of={ this.propertyTenancyAgreementCalculateTypeList } each="type">
                            <Option
                              value={ type }
                              key={ type }
                              className="property-detail__tenancy-agreement-calculate-option"
                            >
                              {t(`cms.properties.edit.detail.tenancy_agreement.calculate_type.option.${toLower(type)}`)}
                            </Option>
                          </For>
                        </Select>,
                      )}
                    </FormItem>
                  </Col>
                  <Col span={ 7 }>
                    <FormItem>
                      {getFieldDecorator('tenancyAgreementField', {
                        validateTrigger: 'onChange',
                        initialValue:
                          property.tenancyAgreement &&
                          property.tenancyAgreement.calculateType ?
                            property.tenancyAgreement.field :
                            propertyTenancyAgreementField.MOVE_IN_DATE,
                      })(
                        <Select disabled className="property-detail__tenancy-agreement-field">
                          <Option value={ propertyTenancyAgreementField.MOVE_IN_DATE }>
                            {t('cms.properties.edit.detail.tenancy_agreement.field.move_in_date')}
                          </Option>
                        </Select>,
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
            </Row>
          </If>

          <p className="property-detail__subtitle">
            { t('cms.properties.edit.detail.property_description') }
          </p>
          <Row gutter={ 24 }>
            <Col span={ 12 }>
              <div className="property-detail__description-wrap">
                <FormItem
                  label={ t('cms.properties.edit.detail.headline_cn') }
                  colon={ false }
                >
                  {getFieldDecorator('headlineCn', {
                    initialValue: this.mergedProperty.headlineCn ?
                      this.mergedProperty.headlineCn :
                      undefined,
                    rules: [{ max: 120, message: ' ' }, { validator: this.validateHeadlineCN }],
                    validateTrigger: 'onChange',
                  })(
                    <TextArea
                      style={ { height: '48px' } }
                      placeholder={ t('cms.properties.edit.detail.headline.place_holder') }
                      onBlur={ this.onCnTabBlur }
                      className="property-detail__headline-textarea"
                    />,
                  )}
                  { this.textAreaCounter(getFieldValue('headlineCn'), 120) }
                </FormItem>
                <FormItem
                  label={ t('cms.properties.edit.detail.desc_cn') }
                  colon={ false }
                >
                  {getFieldDecorator('descriptionCn', {
                    rules: [
                      { validator: this.validateDescCN },
                    ],
                    initialValue: htmlMinify(this.mergedProperty.descriptionCn),
                    normalize: this.changeRichText,
                  })(
                    <ReactQuill
                      placeholder={ t('cms.properties.edit.detail.desc.placeholder') }
                      fontTypes={ [3, false] }
                      onBlur={ this.onCnTabBlur }
                    />,
                  )}
                  { this.quillCounter(getFieldValue('descriptionCn')) }
                </FormItem>
              </div>
            </Col>
            <Col span={ 12 }>
              <div className="property-detail__description-wrap">
                <FormItem
                  label={ t('cms.properties.edit.detail.headline_en') }
                  colon={ false }
                >
                  {getFieldDecorator('headline', {
                    initialValue: this.mergedProperty.headline ?
                      this.mergedProperty.headline : undefined,
                    rules: [
                      { max: 300, message: ' ', required: false },
                      { validator: this.validateHeadlineEN },
                    ],
                    validateTrigger: 'onChange',
                  })(
                    <TextArea
                      style={ { height: '48px' } }
                      placeholder={ t('cms.properties.edit.detail.headline.place_holder') }
                      onBlur={ this.onEnTabBlur }
                      className="property-detail__headline-textarea"
                    />,
                  )}
                  { this.textAreaCounter(getFieldValue('headline'), 300) }
                </FormItem>
                <FormItem
                  label={ t('cms.properties.edit.detail.desc_en') }
                  colon={ false }
                >
                  {getFieldDecorator('description', {
                    rules: [
                      { validator: this.validateDescEN, required: false },
                    ],
                    initialValue: htmlMinify(this.mergedProperty.description),
                    normalize: this.changeRichText,
                  })(
                    <ReactQuill
                      placeholder={ t('cms.properties.edit.detail.desc.placeholder') }
                      fontTypes={ [3, false] }
                      onBlur={ this.onEnTabBlur }
                    />,
                  )}
                  { this.quillCounter(getFieldValue('description')) }
                </FormItem>
              </div>
            </Col>
          </Row>
          <p className="property-detail__subtitle">
            { t('cms.properties.edit.detail.srp_ranking_setting') }
          </p>
          <Row gutter={ 24 }>
            <Col span={ 12 }>
              <Form.Item label={ t('cms.properties.edit.others.ranking_type') }>
                <div className="property-detail__ranking-type-wrap">
                  {
                    getFieldDecorator('rankType', {
                      initialValue: this.rankType,
                    })(
                      <Radio.Group>
                        <For each="option" of={ rankTypeOptions } index="key">
                          <Radio value={ option.value } key={ key }>
                            { t(option.text) }
                          </Radio>
                        </For>
                      </Radio.Group>,
                    )
                  }
                </div>
              </Form.Item>
            </Col>
            <Col span={ 12 }>
              <Form.Item
                label={ t('cms.properties.edit.others.ranking_value') }
              >
                {
                  getFieldDecorator('rank', {
                    initialValue: this.mergedProperty.rank,
                  })(
                    <InputNumber
                      min={ 0 }
                      max={ 1000 }
                      precision={ 0 }
                      placeholder={ t('cms.properties.edit.others.ranking_value.placeholder') }
                      onBlur={ () => this.handleBlurNumberInput('rank') }
                    />,
                  )
                }
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </PropertyDetailWrapper>
    );
  }
}

PropertyDetail.propTypes = {
  t: PropTypes.func.isRequired,
  property: PropTypes.object,
  form: PropTypes.shape({ // eslint-disable-line react/require-default-props
    validateFields: PropTypes.func.isRequired,
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    setFields: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
    validateFieldsAndScroll: PropTypes.func.isRequired,
    getFieldsError: PropTypes.func.isRequired,
  }),
  afterSave: PropTypes.func.isRequired,
  changeFields: PropTypes.object.isRequired,
  onRef: PropTypes.func.isRequired,
  rejectedDraftIds: PropTypes.array,
  expirePropertyDraft: PropTypes.func,
  checkDraftReviewmodal: PropTypes.func,
};

PropertyDetail.defaultProps = {
  t: () => {},
  property: {},
  afterSave: () => {},
  changeFields: {},
  onRef: () => {},
  rejectedDraftIds: [],
  expirePropertyDraft: () => {},
  checkDraftReviewmodal: () => {},
};
