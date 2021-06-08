import React from 'react';
import { Form, Radio, Checkbox, Tooltip, Icon } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import OthersFacilities from '~components/others-facilities';
import { setEditedFields } from '~helpers/property-edit';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
class FacilitiesTab extends React.Component {
  constructor(props) {
    super(props);

    this.facilitiesList = this.formatFacilityList(props.property);
    this.typeList = ['amenity', 'bills', 'security', 'rule'];
    this.countLimit = 40;
  }

  formatFacilityList = (data) => {
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

  generateFacilityBlock(type, radioGroup, checkGroup, otherGroup) {
    const radioKeys = Object.keys(radioGroup);
    const checkKeys = Object.keys(checkGroup);

    const { getFieldDecorator } = this.props.form;

    return (
      <div className={ `facility-tab__type-block facility-tab__type-block--${type}` }>
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
                    <Checkbox>
                      { this.findPropertyFacilityBySlug(item) ? this.findPropertyFacilityBySlug(item).label : '' }
                    </Checkbox>,
                  ) }
                </FormItem>
              </div>
            </For>
          </For>
        </div>
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
                  <RadioGroup className="facility-tab__radio-group">
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

          <If condition={ type === 'amenity' }>
            <div className={ 'facility-tab__other-item-container' }>
              <p className="facility-tab__radio-group-title">
                { this.props.t('cms.properties.edit.facilities.item.label.others') }
                <Tooltip title={ this.props.t('cms.properties.edit.facilities.item.label.others.tips') }>
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
                  />,
                ) }
              </FormItem>
            </div>
          </If>
        </div>
      </div>
    );
  }

  render() {
    return (
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
    );
  }
}

FacilitiesTab.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  property: PropTypes.object.isRequired,
};

FacilitiesTab.defaultProps = {
  t: () => {},
};


const onFieldsChange = (props, changedFields) => {
  const fields = changedFields;
  if (Object.keys(fields).includes('others')) {
    if (fields.others.value.length > 50) {
      fields.others.errors = 'error';
    }
  }
  setEditedFields('facilities', fields);
  props.setFieldsHaveChanged();
};

const FacilitiesForm = Form.create({
  name: 'facilities_tab',
  onFieldsChange,
})(FacilitiesTab);

export default FacilitiesForm;
