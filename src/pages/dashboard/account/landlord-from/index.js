import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import cookies from 'js-cookie';
import classNames from 'classnames';
import { Form, Input, Row, Switch, message, Icon, Col, Radio, Transfer } from 'antd';
import TableColumnSearch from '~components/table-column-search';
import { validateEmojiRegex, validateEmail } from '~helpers/validate';
import { cookieNames } from '~constants';
import { getItem } from '~base/global/helpers/storage';

export default class landlordForm extends React.Component {
  constructor() {
    super();

    this.state = {
      landlordProperties: [],
      targetKeys: [],
    };
  }

  componentDidMount() {
    if (this.props.data) {
      this.handleFilledData(this.props.data);
    }
  }

  handleFilledData = (data) => {
    const level = this.props.accountLevel;
    this.props.form.setFieldsValue({
      enabled: data.enabled,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      landlordId: data.landlord && data.landlord.id,
      level,
    });

    if (data.landlord && data.landlord.slug) {
      this.getLandlordProperties(
        data.landlord.slug,
        this.props.properties.map(property => property.node.id),
      );
    }
  };

  getLandlordProperties = (slug, targetKeys = []) => {
    axios({
      method: 'post',
      url: endpoints.getLandlordProperties.url(),
      data: queries.landlordProperties({ slug }),
    }).then((response) => {
      if (response &&
        response.data &&
        response.data.data &&
        response.data.data.properties &&
        response.data.data.properties.edges) {
        this.setState({
          landlordProperties: response.data.data.properties.edges,
          targetKeys,
        });
        if (targetKeys) {
          this.props.form.setFieldsValue({ properties: targetKeys });
        }
      }
    }).catch(() => {

    });
  };

  handleSearch = (value) => {
    this.clearPropertiesList(value.id);
    this.props.onSearchLandlord();
    this.getLandlordProperties(value.slug);
  }

  getHeader = () => {
    const authorization = `Bearer ${cookies.get(cookieNames.token)}`;
    const headers = {
      Authorization: authorization,
      'Accept-Language': 'en-us',
    };
    const authPayload = getItem('PMS_CURRENT_USER_AUTH');

    if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
      headers['Current-Role'] = authPayload.payload.currentRoleSlug;
    }

    return headers;
  };

  isLandlordUser = () => {
    axios({
      method: 'post',
      url: endpoints.commissionModal.url(),
      headers: this.getHeader(),
      data: queries.getLandlordContacts({
        email: this.props.form.getFieldValue('email').trim(),
      }),
    }).then((response) => {
      if (
        typeof response.data.errors === 'undefined'
        && response.data.data
        && response.data.data.landlordContacts
        && response.data.data.landlordContacts.totalCount
      ) {
        this.props.form.setFields({ email: {
          value: this.props.form.getFieldValue('email'),
          errors: [new Error(this.props.t('cms.account.landlord_account_managing.create_modal.account_email.already_registered_err'))],
        } });

        this.props.alreadyExists(true);
      } else {
        this.props.alreadyExists(false);
      }
    })
      .catch(() => {
        message.error(this.props.t('cms.message.error'));
      });
  };

  handleChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  };

  handleLevelChange = (event) => {
    if (event && event.target && event.target.value === 'landlord') {
      this.clearPropertiesList(this.props.form.getFieldValue('landlordId'));
    }
  };

  clearPropertiesList = (landlordId = undefined) => {
    if (this.state.landlordProperties !== [] && this.state.targetKeys !== []) {
      if (!landlordId) {
        this.state.landlordProperties = [];
      }

      this.state.targetKeys = [];
      this.setState(this.state);
      this.props.form.setFieldsValue({
        properties: [],
        landlordId,
      });
    }
  };

  render() {
    const { t, modalType, data } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const inputWidth = 390;
    return (
      <div>
        <div className="landlord-modal__from-title">
          <span>
            { t('cms.account.landlord_account_managing.view.modal.basic_information')}
          </span>
        </div>
        <If condition={ this.props.modalType !== 'add' }>
          <Form.Item>
            <div className="landlord-modal__enable-pms-access">
              <span className="landlord-modal__label landlord-modal__label--switch">
                { t('cms.account.landlord_account_managing.create_modal.enable_landlord_access.lable') }
              </span>
              { getFieldDecorator('enabled', {
                initialValue: this.props.isEnabled,
                valuePropName: 'checked',
                trigger: 'onChange',
              })(
                <Switch
                  className="landlord-modal__switch-btn"
                  checkedChildren={ <Icon type="check" /> }
                  unCheckedChildren={ <Icon type="close" /> }
                />,
              )}
            </div>
          </Form.Item>
        </If>
        <Row>
          <Col span={ 12 }>
            <Form.Item>
              <span className={ classNames('landlord-modal__label', {
                'landlord-modal__label--disabled': modalType !== 'add',
              }) }
              >
                { t('cms.account.landlord_account_managing.create_modal.account_email.lable') }
              </span>
              { getFieldDecorator('email', {
                rules: [
                  { required: true, message: t('cms.property.commission.not_be_empty.err') },
                  {
                    validator: (rule, value, callback) => {
                      if (value
                        && !(validateEmojiRegex(value)
                        && validateEmail(value))
                      ) {
                        callback('error');
                      }
                      if (
                        value && modalType === 'add'
                        && (validateEmojiRegex(value) && validateEmail(value))
                      ) {
                        this.isLandlordUser();
                      }
                      callback();
                    },
                    message: t('cms.account.landlord_account_managing.create_modal.account_email.valid_err'),
                  },
                ],
                validateTrigger: 'onBlur',
              })(
                <Input
                  disabled={ modalType !== 'add' }
                  style={ { width: inputWidth, marginRight: 38 } }
                  placeholder={ t('cms.account.landlord_account_managing.create_modal.account_email.placeholder') }
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={ 12 } >
            <Form.Item>
              <span className="landlord-modal__label">
                { t('cms.account.landlord_account_managing.create_modal.landlord_name.lable') }
              </span>
              { getFieldDecorator('landlordId', {
                rules: [
                  { required: true, message: t('cms.property.commission.not_be_empty.err') },
                ],
                trigger: 'onChange',
              })(
                <TableColumnSearch
                  t={ t }
                  valueData={ data && data.landlord && data.landlord.name ? data.landlord.name : '' }
                  allowClear
                  isLocaitonCustom
                  searchType="landlord"
                  placeholder={ t('cms.account.landlord_account_managing.create_modal.landlord_name.placeholder') }
                  onSearch={ (slug, value) => { this.handleSearch(value); } }
                  saveSearchValue={ () => {
                    setTimeout(this.clearPropertiesList(), 300);
                  } }
                />,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={ 12 }>
            <Form.Item>
              <span className="landlord-modal__label">
                { t('cms.account.landlord_account_managing.create_modal.first_name.lable') }
              </span>
              { getFieldDecorator('firstName', {
                rules: [
                  { required: true, message: t('cms.property.commission.not_be_empty.err') },
                  { max: 250, message: t('cms.account.landlord_account_managing.create_modal.first_name.characters_err') },
                  {
                    validator: (rule, value, callback) => {
                      if (value && !validateEmojiRegex(value)) {
                        callback('error');
                      }
                      callback();
                    },
                    message: t('cms.account.landlord_account_managing.create_modal.first_name.valid_err'),
                  },
                ],
                trigger: 'onChange',
              })(
                <Input
                  style={ { width: inputWidth, marginRight: 38 } }
                  placeholder={ t('cms.account.landlord_account_managing.create_modal.first_name.placeholder') }
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={ 12 }>
            <Form.Item>
              <span className="landlord-modal__label">
                { t('cms.account.landlord_account_managing.create_modal.last_name.lable') }
              </span>
              { getFieldDecorator('lastName', {
                rules: [
                  { required: true, message: t('cms.property.commission.not_be_empty.err') },
                  { max: 250, message: t('cms.account.landlord_account_managing.create_modal.last_name.characters_err') },
                  {
                    validator: (rule, value, callback) => {
                      if (value && !validateEmojiRegex(value)) {
                        callback('error');
                      }
                      callback();
                    },
                    message: t('cms.account.landlord_account_managing.create_modal.last_name.valid_err'),
                  },
                ],
                trigger: 'onChange',
              })(
                <Input
                  style={ { width: inputWidth, marginRight: 0 } }
                  placeholder={ t('cms.account.landlord_account_managing.create_modal.last_name.placeholder') }
                />,
              )}
            </Form.Item>
          </Col>
        </Row>
        <div className="landlord-modal__from-title">
          <span>
            { t('cms.account.landlord_account_managing.view.modal.account_level') }
          </span>
        </div>
        <Form.Item>
          { getFieldDecorator('level', {
            initialValue: 'landlord',
            trigger: 'onChange',
          })(
            <Radio.Group name="radiogroup" onChange={ this.handleLevelChange }>
              <Radio value={ 'landlord' }>{t('cms.account.landlord_account_managing.view.modal.landlord_level.lable')}</Radio>
              <Radio value={ 'property' }>{t('cms.account.landlord_account_managing.view.modal.proprty_level.lable')}</Radio>
            </Radio.Group>,
          )}
        </Form.Item>
        <If condition={ getFieldValue('level') === 'property' }>
          <div
            className={ classNames('landlord-modal__enable-pms-access', {
              'landlord-modal__hidden': getFieldValue('level') !== 'property',
            }) }
          >
            <div className="landlord-modal__properties">
              <span className="landlord-modal__label">
                { t('cms.account.landlord_account_managing.view.modal.proprty_name.lable') }
                <span className="landlord-modal__access-to">
                  { t('cms.account.landlord_account_managing.view.modal.access_to.lable') }
                </span>
              </span>
              <Form.Item>
                { getFieldDecorator('properties', {
                  trigger: 'onChange',
                  rules: [
                    { required: true, message: t('cms.property.commission.not_be_empty.err') },
                  ],
                })(
                  <Transfer
                    dataSource={ this.state.landlordProperties }
                    showSearch
                    rowKey={ item => item.node.id }
                    style={ { width: '100%' } }
                    targetKeys={ this.state.targetKeys }
                    locale={ {
                      itemUnit: 'property',
                      itemsUnit: 'properties',
                      searchPlaceholder: 'Enter search content',
                    } }
                    onChange={ this.handleChange }
                    render={ item => item.node.name.toLowerCase() }
                    listStyle={ { width: 'calc(50% - 20px)', height: '236px', backgroundColor: '#fff' } }
                  />,
                )}
              </Form.Item>
            </div>
          </div>
        </If>
      </div>
    );
  }
}

landlordForm.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object,
  alreadyExists: PropTypes.func,
  onSearchLandlord: PropTypes.func,
  modalType: PropTypes.string,
  isEnabled: PropTypes.bool,
  data: PropTypes.object,
  properties: PropTypes.array,
  accountLevel: PropTypes.string,
};

landlordForm.defaultProps = {
  t: () => {},
  form: {},
  alreadyExists: () => {},
  onSearchLandlord: () => {},
  modalType: '',
  isEnabled: false,
  data: null,
  properties: [],
  accountLevel: null,
};
