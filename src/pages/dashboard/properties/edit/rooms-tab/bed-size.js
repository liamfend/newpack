/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Radio, Row, Col, Select, Input, InputNumber, Icon, Form } from 'antd';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import bedSizeConst from '~constants/bedSize';
import { updateMutation } from '~client/constants';

export default class BedSize extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      unifiedUnitTypeBedSizes: props.bedSizeType === 'UNIFIED' ? Immutable.fromJS(props.unitTypeBedSizes).toJS() : [{
        id: `fake-id-${moment().format('x')}`,
        type: '',
        width: null,
        length: null,
        bedCount: null,
      }],
      differentUnitTypeBedSizes: props.bedSizeType === 'DIFFERENT' ? Immutable.fromJS(props.unitTypeBedSizes).toJS() : [
        {
          id: 'fake-id-0',
          type: '',
          width: null,
          length: null,
          bedCount: null,
        },
        {
          id: 'fake-id-1',
          type: '',
          width: null,
          length: null,
          bedCount: null,
        },
      ],
      countrySlug: ['uk', 'au', 'us'].includes(props.countrySlug) ? props.countrySlug : 'common',
    };
    this.differenetSizeBlocks = [];
  }

  combineUnitTypeBedSizes = () => {
    const bedSizeType = this.props.form.getFieldValue('bedSizeType');
    const apiUnitTypeBedSizes =
      this.props.unitTypeBedSizes && cloneDeep(this.props.unitTypeBedSizes)
        .filter(bedSize => bedSize.action !== updateMutation.INSERT)
        .map((item) => {
          item.action = updateMutation.DELETE;
          return item;
        });
    // filter for remove bedSize from copied room

    switch (bedSizeType) {
      case 'UNIFIED': {
        if (this.props.bedSizeType !== bedSizeType) {
          this.props.onChange(this.state.unifiedUnitTypeBedSizes.concat(apiUnitTypeBedSizes));
        } else {
          this.props.onChange(this.state.unifiedUnitTypeBedSizes);
        }
        break;
      }
      case 'DIFFERENT': {
        if (this.props.bedSizeType !== bedSizeType) {
          this.props.onChange(this.state.differentUnitTypeBedSizes.concat(apiUnitTypeBedSizes));
        } else {
          this.props.onChange(this.state.differentUnitTypeBedSizes);
        }
        break;
      }
      default: break;
    }
  }

  handleRadioChange = (value) => {
    const { unifiedUnitTypeBedSizes, differentUnitTypeBedSizes } = this.state;
    if (value === 'UNIFIED') {
      this.props.form.setFields({
        unitTypeBedSizes: {
          value: JSON.parse(JSON.stringify(unifiedUnitTypeBedSizes)), errors: null,
        },
      });
      if (!unifiedUnitTypeBedSizes.length || unifiedUnitTypeBedSizes.filter(item =>
        ((item.action && item.action !== updateMutation.DELETE) || !item.action)).length > 1) {
        this.setState({
          unifiedUnitTypeBedSizes: [
            {
              id: `fake-id-${moment().format('x')}`,
              type: '',
              width: null,
              length: null,
              bedCount: null,
            },
          ],
        });
      }
    } else if (value === 'DIFFERENT') {
      this.props.form.setFields({
        unitTypeBedSizes: {
          value: JSON.parse(JSON.stringify(differentUnitTypeBedSizes)), errors: null,
        },
      });
      if (!differentUnitTypeBedSizes.length || differentUnitTypeBedSizes.length < 2) {
        this.setState({
          differentUnitTypeBedSizes: [
            {
              id: 'fake-id-0',
              type: '',
              width: null,
              length: null,
              bedCount: null,
            },
            {
              id: 'fake-id-1',
              type: '',
              width: null,
              length: null,
              bedCount: null,
            },
          ],
        });
      }
    }
  }

  addNewSize = () => {
    this.setState({
      differentUnitTypeBedSizes: this.state.differentUnitTypeBedSizes.concat([{
        id: `fake-id-${moment().format('x')}`,
        type: '',
        width: null,
        length: null,
        bedCount: null,
      }]),
    });
  }

  deleteBedSize = (bedSizeId) => {
    const copiedDifferentUnitTypeBedSizes = cloneDeep(this.state.differentUnitTypeBedSizes);
    copiedDifferentUnitTypeBedSizes.map((item) => {
      if (bedSizeId === item.id) {
        if (!String(item.id).includes('fake-id')) {
          item.action = updateMutation.DELETE;
        } else {
          copiedDifferentUnitTypeBedSizes.splice(copiedDifferentUnitTypeBedSizes
            .findIndex(copiedItem => copiedItem.id === bedSizeId), 1);
        }
      }
      return item;
    });
    this.setState({
      differentUnitTypeBedSizes: copiedDifferentUnitTypeBedSizes,
    }, () => {
      this.props.onChange(this.state.differentUnitTypeBedSizes);
    });
  }

  changeBedSize = (bedSizeId, type, value) => {
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    const bedSizeType = this.props.form.getFieldValue('bedSizeType');
    if ((!Number.isNaN(value) && reg.test(value)) || value.trim() === '' || value === '-') {
      this.setState((state) => {
        const { unifiedUnitTypeBedSizes, differentUnitTypeBedSizes } = state;
        const newUnifiedUnitTypeBedSizes = [];
        const newDifferentUnitTypeBedSizes = [];
        if (bedSizeType === 'UNIFIED') {
          unifiedUnitTypeBedSizes.map((item) => {
            const newItem = { ...item };
            if (bedSizeId === item.id) {
              if (type === 'value1') {
                newItem.width = value ? Number(value) : null;
              } else if (type === 'value2') {
                newItem.length = value ? Number(value) : null;
              }
              if (newItem.id && !String(newItem.id).includes('fake-id')) {
                newItem.action = updateMutation.UPDATE;
              } else {
                newItem.action = updateMutation.INSERT;
              }
            }
            newUnifiedUnitTypeBedSizes.push(newItem);
            return true;
          });
          return {
            unifiedUnitTypeBedSizes: [...newUnifiedUnitTypeBedSizes],
          };
        }
        differentUnitTypeBedSizes.map((item) => {
          const newItem = { ...item };
          if (bedSizeId === item.id) {
            if (type === 'value1') {
              newItem.width = value ? Number(value) : null;
            } else if (type === 'value2') {
              newItem.length = value ? Number(value) : null;
            } else if (type === 'value3') {
              newItem.bedCount = value;
            }
            if (newItem.id && !String(newItem.id).includes('fake-id')) {
              newItem.action = updateMutation.UPDATE;
            } else {
              newItem.action = updateMutation.INSERT;
            }
          }

          newDifferentUnitTypeBedSizes.push(newItem);
          return true;
        });
        return {
          differentUnitTypeBedSizes: [...newDifferentUnitTypeBedSizes],
        };
      }, () => {
        this.combineUnitTypeBedSizes();
      });
    }
  }

  handleSelectChange = (bedSizeId, value) => {
    const { setFieldsValue } = this.props.form;
    const { countrySlug } = this.state;
    const preFilledItem =
      bedSizeConst[countrySlug].filter(item => item.type === value)[0] || '';
    const bedSizeType = this.props.form.getFieldValue('bedSizeType');
    setFieldsValue({
      [`bedSizeWidth_${bedSizeId}`]: preFilledItem.width,
      [`bedSizeLength_${bedSizeId}`]: preFilledItem.length,
    });

    this.setState((state) => {
      const { unifiedUnitTypeBedSizes, differentUnitTypeBedSizes } = state;
      const newUnifiedUnitTypeBedSizes = [];
      const newDifferentUnitTypeBedSizes = [];
      if (bedSizeType === 'UNIFIED') {
        unifiedUnitTypeBedSizes.map((item) => {
          const newItem = { ...item };
          if (bedSizeId === newItem.id) {
            newItem.type = value.toUpperCase();
            newItem.width = preFilledItem && preFilledItem.width;
            newItem.length = preFilledItem && preFilledItem.length;
            if (newItem.id && !String(newItem.id).includes('fake-id')) {
              newItem.action = updateMutation.UPDATE;
            } else {
              newItem.action = updateMutation.INSERT;
            }
          }

          newUnifiedUnitTypeBedSizes.push(newItem);
          return true;
        });
        return {
          unifiedUnitTypeBedSizes: [...newUnifiedUnitTypeBedSizes],
        };
      }

      differentUnitTypeBedSizes.map((item) => {
        const newItem = { ...item };
        if (bedSizeId === newItem.id) {
          newItem.type = value.toUpperCase();
          newItem.width = preFilledItem && preFilledItem.width;
          newItem.length = preFilledItem && preFilledItem.length;
          if (newItem.id && !String(newItem.id).includes('fake-id')) {
            newItem.action = updateMutation.UPDATE;
          } else {
            newItem.action = updateMutation.INSERT;
          }
        }
        newDifferentUnitTypeBedSizes.push(newItem);
        return true;
      });
      return {
        differentUnitTypeBedSizes: [...newDifferentUnitTypeBedSizes],
      };
    }, () => {
      this.combineUnitTypeBedSizes();
    });
  }

  componentWillMount() {
    this.handleRadioChange(this.props.bedSizeType);
  }

  componentWillReceiveProps(nextProps) {
    if (Number(nextProps.bedCount) === 1 &&
      Number(nextProps.bedCount) !== Number(this.props.bedCount) && this.props.bedSizeType !== 'UNIFIED') {
      this.radioGroup.props.onChange({ target: { value: 'UNIFIED' } });
    }
  }

  render() {
    const { t, form: { getFieldDecorator, getFieldValue } } = this.props;
    const { countrySlug, unifiedUnitTypeBedSizes, differentUnitTypeBedSizes } = this.state;
    return (
      <div>
        {
          getFieldDecorator('bedSizeType')(
            <Radio.Group ref={ (node) => { this.radioGroup = node; } } style={ { width: '100%' } } onChange={ (e) => { this.handleRadioChange(e.target.value); } }>
              <Row gutter={ 16 }>
                <Col span={ 12 }>
                  <Radio value="UNIFIED">
                    {t('cms.properties.edit.rooms.bed_size.bed_size_type.uninfied_size')}
                  </Radio>
                </Col>
                <Col span={ 12 }>
                  <Radio value="DIFFERENT" disabled={ Number(this.props.bedCount) === 1 }>
                    {t('cms.properties.edit.rooms.bed_size.bed_size_type.different_sizes')}
                  </Radio>
                </Col>
              </Row>
            </Radio.Group>,
          )
        }
        <Choose>
          <When condition={ getFieldValue('bedSizeType') === 'UNIFIED' }>
            <div className="unified-size-block">
              <For of={ unifiedUnitTypeBedSizes.filter(item => (!item.action || (item.action && item.action !== updateMutation.DELETE))) } each="unifiedSizeItem" index="unifiedSizeIdx">
                <div className="row-wrapper" key={ unifiedSizeIdx } ref={ (node) => { this.unifiedSizeBlock = node; } }>
                  <Row gutter={ 16 }>
                    <Col span={ 12 }>
                      {
                        getFieldDecorator(`unifiedSize_${unifiedSizeIdx}`, {
                          initialValue: unifiedSizeItem.type !== null ? unifiedSizeItem.type.toLowerCase() : 'not_specific',
                        })(
                          <Select
                            className="bed-size__select"
                            getPopupContainer={ () => this.unifiedSizeBlock }
                            placeholder={ t('cms.properties.edit.rooms.bed_size.select_bed_type') }
                            onChange={ (type) => {
                              this.handleSelectChange(unifiedSizeItem.id, type);
                            } }
                            onBlur={ (type) => {
                              this.handleSelectChange(unifiedSizeItem.id, type);
                            } }
                          >
                            <For of={ bedSizeConst[countrySlug] } each="bedItem">
                              <Select.Option key={ bedItem.type } value={ bedItem.type }>{t(`cms.properties.edit.rooms.bed_size.${bedItem.type}`)}</Select.Option>
                            </For>
                          </Select>,
                        )}
                    </Col>
                    <Col span={ 12 }>
                      <Row>
                        <Col span={ 10 }>
                          <Form.Item>
                            {
                              getFieldDecorator(`bedSizeWidth_${unifiedSizeItem.id}`, {
                                initialValue: unifiedSizeItem.width,
                                validateTrigger: 'onBlur',
                                rules: [{
                                  required: getFieldValue(`unifiedSize_${unifiedSizeIdx}`) && getFieldValue(`bedSizeLength_${unifiedSizeItem.id}`),
                                  message: t('cms.properties.edit.error.width_required'),
                                }],
                              })(
                                <Input
                                  autoComplete="off"
                                  className={ classNames({ 'no-error': !getFieldValue(`unifiedSize_${unifiedSizeIdx}`) }) }
                                  onChange={ (e) => {
                                    this.changeBedSize(unifiedSizeItem.id, 'value1', e.target.value);
                                  } }
                                  disabled={ getFieldValue(`unifiedSize_${unifiedSizeIdx}`) === 'not_specific' }
                                />,
                              )
                            }
                          </Form.Item>
                        </Col>
                        <Col span={ 2 }>
                          <div className="x">x</div>
                        </Col>
                        <Col span={ 12 }>
                          <Form.Item>
                            {
                              getFieldDecorator(`bedSizeLength_${unifiedSizeItem.id}`, {
                                initialValue: unifiedSizeItem.length,
                                validateTrigger: 'onBlur',
                                rules: [{
                                  required: getFieldValue(`unifiedSize_${unifiedSizeIdx}`) && getFieldValue(`bedSizeWidth_${unifiedSizeItem.id}`),
                                  message: t('cms.properties.edit.error.length_required'),
                                }],
                              })(
                                <Input
                                  autoComplete="off"
                                  className={ classNames({ 'no-error': !getFieldValue(`unifiedSize_${unifiedSizeIdx}`) }) }
                                  onChange={ (e) => { this.changeBedSize(unifiedSizeItem.id, 'value2', e.target.value); } }
                                  disabled={ getFieldValue(`unifiedSize_${unifiedSizeIdx}`) === 'not_specific' }
                                />,
                              )
                            }
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </For>
            </div>
          </When>
          <Otherwise>
            <div className="different-sizes-block">
              <For of={ differentUnitTypeBedSizes.filter(item => (!item.action || (item.action && (item.action !== updateMutation.DELETE)))) } each="differentSizeItem" index="differentSizeIdx">
                <div className="row-wrapper" key={ differentSizeIdx } ref={ (node) => { this.differenetSizeBlocks[differentSizeIdx] = node; } }>
                  <Row gutter={ 16 }>
                    <Col span={ 12 }>
                      {
                        getFieldDecorator(`differentSize_${differentSizeIdx}`, {
                          initialValue: differentSizeItem.type !== null ? differentSizeItem.type.toLowerCase() : 'not_specific',
                        })(
                          <Select
                            getPopupContainer={ () => this.differenetSizeBlocks[differentSizeIdx] }
                            placeholder={ t('cms.properties.edit.rooms.bed_size.select_bed_type') }
                            onChange={ (type) => {
                              this.handleSelectChange(differentSizeItem.id, type);
                            } }
                            onBlur={ (type) => {
                              this.handleSelectChange(differentSizeItem.id, type);
                            } }
                          >
                            <For of={ bedSizeConst[countrySlug] } each="bedItem" index="bedTypeIdx">
                              <Select.Option key={ bedTypeIdx } value={ bedItem.type }>{t(`cms.properties.edit.rooms.bed_size.${bedItem.type}`)}</Select.Option>
                            </For>
                          </Select>,
                        )}
                    </Col>
                    <Col span={ 8 }>
                      <Row>
                        <Col span={ 11 }>
                          <Form.Item>
                            {
                              getFieldDecorator(`bedSizeWidth_${differentSizeItem.id}`, {
                                initialValue: differentSizeItem.width,
                                validateTrigger: 'onBlur',
                                rules: [{
                                  required: getFieldValue(`differentSize_${differentSizeIdx}`) && getFieldValue(`bedSizeLength_${differentSizeItem.id}`),
                                  message: t('cms.properties.edit.error.width_required'),
                                }],
                              })(
                                <Input
                                  autoComplete="off"
                                  className={ classNames({ 'no-error': !getFieldValue(`differentSize_${differentSizeIdx}`) }) }
                                  onChange={ (e) => { this.changeBedSize(differentSizeItem.id, 'value1', e.target.value); } }
                                  disabled={ getFieldValue(`differentSize_${differentSizeIdx}`) === 'not_specific' }
                                />,
                              )
                            }
                          </Form.Item>
                        </Col>
                        <Col span={ 2 }>
                          <div className="x">x</div>
                        </Col>
                        <Col span={ 11 }>
                          <Form.Item>
                            {
                              getFieldDecorator(`bedSizeLength_${differentSizeItem.id}`, {
                                initialValue: differentSizeItem.length,
                                validateTrigger: 'onBlur',
                                rules: [{
                                  required: getFieldValue(`differentSize_${differentSizeIdx}`) && getFieldValue(`bedSizeWidth_${differentSizeItem.id}`),
                                  message: t('cms.properties.edit.error.length_required'),
                                }],
                              })(
                                <Input
                                  autoComplete="off"
                                  className={ classNames({ 'no-error': !getFieldValue(`differentSize_${differentSizeIdx}`) }) }
                                  onChange={ (e) => { this.changeBedSize(differentSizeItem.id, 'value2', e.target.value); } }
                                  disabled={ getFieldValue(`differentSize_${differentSizeIdx}`) === 'not_specific' }
                                />,
                              )
                            }
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={ 4 }>
                      <InputNumber className="no-error" min={ 0 } value={ differentSizeItem.bedCount } onChange={ (value) => { this.changeBedSize(differentSizeItem.id, 'value3', value); } } />
                    </Col>
                  </Row>
                  <If condition={ differentUnitTypeBedSizes.filter(item =>
                    (!item.action || (item.action && item.action
                      !== updateMutation.DELETE))).length > 2 }
                  >
                    <Icon className="icon-delete" type="minus-circle" onClick={ () => { this.deleteBedSize(differentSizeItem.id); } } />
                  </If>
                </div>
              </For>
              <a className="add-new-size" role="button" tabIndex="0" onClick={ this.addNewSize }>{t('cms.properties.edit.rooms.bed_size.add_new_size')}</a>
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

BedSize.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  unitTypeBedSizes: PropTypes.array,
  countrySlug: PropTypes.string.isRequired,
  bedSizeType: PropTypes.string,
  bedCount: PropTypes.any,
};

BedSize.defaultProps = {
  t: () => { },
  onChange: () => { },
  form: {},
  unitTypeBedSizes: [],
  countrySlug: '',
  bedSizeType: 'UNIFIED',
  bedCount: null,
};
