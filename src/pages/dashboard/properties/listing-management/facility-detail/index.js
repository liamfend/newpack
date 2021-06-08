import React from 'react';
import { Form, Radio, Checkbox } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import enhanceForm from '~hocs/enhance-form';
import { fetch } from '~helpers/graphql';
import * as queries from '~settings/queries';
// import OthersFacilities from '~components/others-facilities';
import PropertyDetailWrapper from '~components/property-detail-wrapper';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
@enhanceForm()
export default class FacilitiesTab extends React.Component {
  constructor(props) {
    super(props);

    this.facilitiesList = this.formatFacilityList(props.property);
    this.typeList = ['amenity', 'bills', 'security', 'rule'];
    this.countLimit = 40;
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  mergeChangeFacilties = (changeFacilities) => {
    const { facilities } = this.props.property;
    Object.keys(changeFacilities).forEach((fieldName) => {
      const field = changeFacilities[fieldName];
      if (field) {
        if (fieldName === 'array') {
          // other
          // TODO
        } else if (typeof field === 'boolean') {
          // check box
          const distIndex = facilities.findIndex(item => item.slug === fieldName);
          facilities[distIndex].checked = field;
        } else if (typeof field === 'string') {
          // radio box
          facilities.forEach((item, index) => {
            if (`group_${item.group}` === fieldName) {
              facilities[index].checked = (item.slug === field);
            }
          });
        }
      }
      if (field === false) {
        const distIndex = facilities.findIndex(item => item.slug === fieldName);
        facilities[distIndex].checked = field;
      }
    });
    return { facilities };
  }

  handleSave = (callback = () => {}) => {
    this.props.form.validateFieldsAndScroll((errors) => {
      const { afterSave, property, form, changeFields } = this.props;
      if (!errors || errors.length === 0) {
        const fieldsValue = form.getFieldsValue();
        const selectSlugs = this.getSelectSlugs(fieldsValue);
        fetch(queries.bindPropertyFacilities({
          facilitySlugs: selectSlugs,
          propertyId: property.id,
        })).then((res) => {
          if (res.bindPropertyFacilities
            && res.bindPropertyFacilities.result) {
            afterSave(this.mergeChangeFacilties(changeFields));
            callback({ status: 'success', isUpdated: true });
          }
        }).catch((e) => {
          callback({ status: 'err', err: e });
        });
      } else {
        callback({ status: 'success', isUpdated: false });
      }
    });
  }

  getSelectSlugs = (fileds) => {
    const selectSlugs = [];
    Object.keys(fileds).forEach((fieldName) => {
      const field = fileds[fieldName];
      if (field) {
        if (fieldName === 'array') {
          // other
          selectSlugs.push(...field);
        } else if (typeof field === 'boolean') {
          // check box
          selectSlugs.push(fieldName);
        } else if (typeof field === 'string') {
          // radio box
          selectSlugs.push(field);
        }
      }
    });
    return selectSlugs;
  }


  formatFacilityList = (data) => {
    if (!data.facilities) {
      return {};
    }
    const formatFacilitiesList = {};
    data.facilities.map((facility) => {
      if (!formatFacilitiesList[facility.tags[0]]) {
        formatFacilitiesList[facility.tags[0]] = {};
      }

      if (facility.group) {
        if (!formatFacilitiesList[facility.tags[0]][facility.group]) {
          if (facility.group === 'others') {
            if (facility.checked) {
              formatFacilitiesList[facility.tags[0]][facility.group] = {
                list: [facility.slug],
                type: 'others',
              };
            }
          } else {
            formatFacilitiesList[facility.tags[0]][facility.group] = {
              list: [facility.slug],
              type: 'radio',
            };
          }
        } else if (facility.group !== 'others' || facility.checked === true) {
          formatFacilitiesList[facility.tags[0]][facility.group].list.push(facility.slug);
        }
      } else if (!formatFacilitiesList[facility.tags[0]][facility.slug]) {
        formatFacilitiesList[facility.tags[0]][facility.slug] = {
          list: [facility.slug],
          type: 'tick',
        };
      } else {
        formatFacilitiesList[facility.tags[0]][facility.slug].list.push(facility.slug);
      }

      return true;
    });

    return formatFacilitiesList;
  }

  groupFacilitiesByType = (type, facilities) => {
    const radioGroup = {};
    const checkGroup = {};
    const otherGroup = {};
    const keyList = Object.keys(facilities);

    keyList.map((facility) => {
      if (facilities[facility].type === 'radio') {
        radioGroup[facility] = facilities[facility];
      } else if (facilities[facility].type === 'tick') {
        checkGroup[facility] = facilities[facility];
      } else {
        otherGroup[facility] = facilities[facility];
      }

      return true;
    });

    return this.generateFacilityBlock(type, radioGroup, checkGroup, otherGroup);
  };

  findPropertyFacilityBySlug = (facilitySlug, group) => {
    let result = null;
    if (
      this.props.property &&
      this.props.property.facilities &&
      typeof this.props.property.facilities === 'object'
    ) {
      result = this.props.property.facilities.find(facility => facilitySlug === facility.slug
        && (group ? group === facility.group : true));
    }

    return result;
  };

  findPropertyFacilityBySlugList = (facilitiesSlugs) => {
    let result = null;
    if (facilitiesSlugs && typeof facilitiesSlugs === 'object') {
      result = facilitiesSlugs.find(slug =>
        this.findPropertyFacilityBySlug(slug) &&
        this.findPropertyFacilityBySlug(slug).checked,
      );
    }

    return result;
  };

  generateFacilityBlock(type, radioGroup, checkGroup) {
    const radioKeys = Object.keys(radioGroup);
    const checkKeys = Object.keys(checkGroup);

    const { getFieldDecorator } = this.props.form;

    return (
      <div className={ `facility-tab__type-block facility-tab__type-block--${type}` }>
        <If condition={ checkKeys.length > 0 }>
          <div className={ `facility-tab__check-block facility-tab__check-block--${type}` }>
            <For each="check" of={ checkKeys } index="checkIndex">
              <For each="item" of={ checkGroup[check].list }>
                <div
                  className={ classNames('facility-tab__check-item-container', {
                    'facility-tab__check-item-container-clear': checkIndex % 3 === 0,
                  }) }
                  key={ item }
                >
                  <FormItem>
                    { getFieldDecorator(item, {
                      valuePropName: 'checked',
                      initialValue: this.findPropertyFacilityBySlug(item) ?
                        this.findPropertyFacilityBySlug(item).checked : '',
                    })(
                      <Checkbox
                        onChange={ this.handleChange }
                      >
                        { this.findPropertyFacilityBySlug(item) ? this.findPropertyFacilityBySlug(item).label : '' }
                      </Checkbox>,
                    ) }
                  </FormItem>
                </div>
              </For>
            </For>
          </div>
        </If>
        <div className={ `facility-tab__radio-block facility-tab__radio-block--${type}` }>
          <For each="radio" of={ radioKeys }>
            <div className="facility-tab__radio-group-container" key={ radio }>
              <p className="facility-tab__radio-group-title">
                { this.props.t(`cms.properties.edit.facilities.item.label.${radio}`) }
              </p>
              <FormItem>
                { getFieldDecorator(`group_${radio}`, {
                  initialValue: this.findPropertyFacilityBySlugList(radioGroup[radio].list),
                })(
                  <RadioGroup
                    className="facility-tab__radio-group"
                    onChange={ this.handleChange }
                  >
                    <For
                      each="item"
                      of={
                        radioGroup[radio].list.filter(item => !item.includes('no_service'))
                          .concat([radioGroup[radio].list.find(item => item.includes('no_service'))])
                      }
                    >
                      <div className="facility-tab__radio-item-container" key={ item }>
                        <Radio value={ item }>{ this.findPropertyFacilityBySlug(item) ?
                          this.findPropertyFacilityBySlug(item).label : '' }
                        </Radio>
                      </div>
                    </For>
                  </RadioGroup>,
                ) }
              </FormItem>
            </div>
          </For>
          {/* TODO: Other hide templately */}
          {/* <If condition={ type === 'amenity' }>
            <div className={ 'facility-tab__other-item-container' }>
              <p className="facility-tab__radio-group-title">
                { this.props.t('cms.properties.edit.facilities.item.label.others') }
                <Tooltip
                  title={ this.props.t('cms.properties.edit.facilities.item.label.others.tips') }>
                  <Icon type="question-circle" className="facility-tab__tips-icon" />
                </Tooltip>
              </p>
              <FormItem>
                { getFieldDecorator('others', {
                  trigger: 'onChange',
                  rules: [{ validator: (rule, value, callback) => {
                    if (value && value.length > this.countLimit) {
                      callback('error');
                      return;
                    }
                    callback();
                  } }],
                })(
                  <OthersFacilities
                    ref={ (node) => { this.othersFacilities = node; } }
                    facilitiesList={ otherGroup.others && otherGroup.others.list
                      ? otherGroup.others.list : [] }
                    findPropertyFacilityBySlug={ this.findPropertyFacilityBySlug }
                    t={ this.props.t }
                    countLimit={ this.countLimit }
                    onChange={ this.handleChange }
                  />,
                ) }
              </FormItem>
            </div>
          </If> */}
        </div>
      </div>
    );
  }

  render() {
    const { t, property } = this.props;
    return (
      <PropertyDetailWrapper
        t={ t }
        isPublished={ property.status === 'PUBLISHED' }
        onClickSave={ this.handleSave }
      >
        <div className="facility-tab">
          <Form className="facility-tab__form">
            <For each="type" of={ this.typeList }>
              <div className="facility-tab__block" key={ type }>
                <h3 className="facility-tab__title">
                  { this.props.t(`cms.properties.edit.facilities.type_title.${type}`) }
                </h3>
                { this.groupFacilitiesByType(type, this.facilitiesList[type]) }
              </div>
            </For>
          </Form>
        </div>
      </PropertyDetailWrapper>
    );
  }
}

FacilitiesTab.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object, // eslint-disable-line react/require-default-props
  property: PropTypes.object.isRequired,
  afterSave: PropTypes.func,
  changeFields: PropTypes.object,
  onRef: PropTypes.func.isRequired,
};

FacilitiesTab.defaultProps = {
  t: () => {},
  afterSave: () => {},
  changeFields: {},
  onRef: () => {},
};
