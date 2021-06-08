import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Select, Form, Row, Col, Radio, Tooltip, Icon, Divider } from 'antd';
import { reconciliationOption, reconciliationFrequencies } from '~constants/landlord';
import PropertiesTransfer from '~pages/dashboard/landlord/modal/properties-transfer';
import { communicationStatus } from '~constants';
import { getReconciliationPreferenceList } from '~actions/landlord';

const DEFAULT_RECONCILIATION_PREFERENCE = 'LANDLORD_PORTAL';

const mapStateToProps = ({ dashboard: { landlord } }) => {
  const { reconciliationPreferenceList, communication } = landlord.toJS();
  return {
    reconciliationPreference: reconciliationPreferenceList,
    isFetchingReconciliationPreference:
      communication.getReconciliationPreferenceList.status === communicationStatus.FETCHING,
  };
};

const mapDispatchToProps = dispatch => ({
  getReconciliationPreferenceList: () => {
    dispatch(getReconciliationPreferenceList());
  },
});
@connect(mapStateToProps, mapDispatchToProps)
export default class BillingAndReconciliation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectCountdownDays: null,
    };
    this.props.getReconciliationPreferenceList();
  }

  componentDidMount() {
    if (this.props.landlord && this.props.type === 'edit') {
      this.formatProperties();
    }
  }

  formatProperties = () => {
    const { properties } = this.props.landlord;
    let autoConfirmProperties = [];

    if (properties && properties.edges && properties.edges.length > 0) {
      properties.edges.map((property) => {
        if (
          property && property.node
          && property.node.autoConfirmSettings
          && property.node.autoConfirmSettings.bookingAutoConfirm
        ) {
          const countdownDays = property.node.autoConfirmSettings.countdownDays;

          const countdownDaysData =
          autoConfirmProperties.find(item => item.countdownDays === countdownDays);

          autoConfirmProperties =
          autoConfirmProperties.filter(item => item.countdownDays !== countdownDays);
          autoConfirmProperties.push({
            countdownDays: property.node.autoConfirmSettings.countdownDays,
            propertyIds: countdownDaysData && countdownDaysData.propertyIds ?
              [property.node.id].concat(countdownDaysData.propertyIds) : [property.node.id],
          });
        }

        return true;
      });
    }

    this.props.setShowPropertiesTransfer(autoConfirmProperties.length < 1);
    this.props.setConfirmSettings(autoConfirmProperties);
  }

  handleChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  };

  handleEditBtn = (count) => {
    this.setState({
      selectCountdownDays: Number(count),
    });

    this.props.setShowPropertiesTransfer(true);
  }

  handleUpdateConfirmSettings = (count, targetKeys) => {
    if (!targetKeys && !this.state.selectCountdownDays) {
      this.props.setShowPropertiesTransfer(this.props.confirmSettings.length < 1);
      return;
    }

    const newConfirmSettings =
    this.props.confirmSettings.filter(item =>
      item.countdownDays !== count && item.countdownDays !== this.state.selectCountdownDays);

    if (count && targetKeys) {
      const countdownDaysData =
      this.props.confirmSettings.find(item => item.countdownDays === count);
      let countdownPropertyIds =
      countdownDaysData && countdownDaysData.propertyIds && !this.state.selectCountdownDays ?
        targetKeys.concat(countdownDaysData.propertyIds) : targetKeys;

      if (
        this.state.selectCountdownDays && this.state.selectCountdownDays !== count
        && countdownDaysData && countdownDaysData.propertyIds
      ) {
        countdownPropertyIds = targetKeys.concat(countdownDaysData.propertyIds);
      }

      newConfirmSettings.push({
        countdownDays: count,
        propertyIds: countdownPropertyIds,
      });
    }

    this.setState({
      selectCountdownDays: null,
    });

    this.props.setShowPropertiesTransfer(newConfirmSettings.length < 1);
    this.props.setConfirmSettings(newConfirmSettings);
  }

  handleDeletedBtn = (count) => {
    if (count) {
      const newConfirmSettings =
      this.props.confirmSettings.filter(item =>
        item.countdownDays !== count);

      this.props.setConfirmSettings(newConfirmSettings);
      this.props.setShowPropertiesTransfer(newConfirmSettings.length < 1);
    }
  }

  handleAddNewBtn = () => {
    this.setState({
      selectCountdownDays: null,
    });

    this.props.setShowPropertiesTransfer(true);
  }

  getTransferProperties = () => {
    const { properties } = this.props.landlord;
    const allLandlordProperties = [];
    let autoConfirmPropertiesId = [];
    const filterConfirmSettings = this.props.confirmSettings.filter(item =>
      item.countdownDays !== this.state.selectCountdownDays);

    if (filterConfirmSettings && filterConfirmSettings.length > 0) {
      filterConfirmSettings.map((item) => {
        autoConfirmPropertiesId = autoConfirmPropertiesId.concat(item.propertyIds);
        return true;
      });
    }

    if (properties && properties.edges && properties.edges.length > 0) {
      properties.edges.map((property) => {
        const propertyData = property;
        propertyData.disabled = autoConfirmPropertiesId.indexOf(property.node.id) !== -1;

        allLandlordProperties.push(propertyData);

        return true;
      });
    }

    return allLandlordProperties;
  }

  render() {
    const {
      t,
      landlord,
      type,
      confirmSettings,
      showPropertiesTransfer,
      reconciliationPreference,
      isFetchingReconciliationPreference,
    } = this.props;
    const { selectCountdownDays } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const hasConfirmSettings = confirmSettings.length > 0;
    const selectTargetKeys = selectCountdownDays && hasConfirmSettings
      && confirmSettings.find(item => item.countdownDays === selectCountdownDays);

    return (
      <section className="landlord-info__section">
        <p className="landlord-info__section-title" ref={ (node) => { this.reconciliationContainer = node; } }>
          { t('cms.landlord.detail.billing_and_reconciliation.title') }
        </p>
        <Row gutter={ 24 }>
          <Col span={ 12 }>
            <Form.Item
              colon={ false }
              label={ t('cms.landlord.detail.reconciliation_preference.label') }
            >
              { getFieldDecorator('reconciliationPreference', {
                initialValue: reconciliationPreference.length > 0 ?
                  (landlord.reconciliationPreference || DEFAULT_RECONCILIATION_PREFERENCE) :
                  undefined,
              })(
                <Select
                  getPopupContainer={ () => this.reconciliationContainer }
                  placeholder={ t('cms.landlord.detail.reconciliation_preference.placeholder') }
                  loading={ isFetchingReconciliationPreference }
                >
                  <For of={ reconciliationPreference } each="option" index="index">
                    <Select.Option key={ index } value={ option }>
                      { t(`cms.landlord.modal.${option.toLowerCase()}.option`) }
                    </Select.Option>
                  </For>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={ 12 }>
            <Form.Item
              label={ t('cms.landlord.detail.reconciliation_frequency.label') }
              colon={ false }
            >
              { getFieldDecorator('reconciliationFrequency', {
                rules: [
                  {
                    required: true,
                    message: t('cms.landlord.modal.error.blank'),
                  },
                ],
                initialValue: landlord.reconciliationFrequency || undefined,
              })(
                <Select
                  getPopupContainer={ () => this.reconciliationContainer }
                  placeholder={ t('cms.landlord.detail.reconciliation_frequency.placeholder') }
                >
                  <For of={ reconciliationFrequencies } each="option" index="index">
                    <Select.Option key={ index } value={ option }>
                      { t(`cms.landlord.modal.${option.toLowerCase()}.option`) }
                    </Select.Option>
                  </For>
                </Select>,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={ 24 }>
          <Col span={ 12 }>
            <Form.Item
              label={ t('cms.landlord.detail.reconciliation_option.label') }
              colon={ false }
            >
              { getFieldDecorator('reconciliationOption', {
                rules: [
                  {
                    required: true,
                    message: t('cms.landlord.modal.error.blank'),
                  },
                ],
                initialValue: landlord.reconciliationOption || undefined,
              })(
                <Select
                  getPopupContainer={ () => this.reconciliationContainer }
                  placeholder={ t('cms.landlord.detail.reconciliation_option.placeholder') }
                >
                  <For of={ reconciliationOption } each="option" index="index">
                    <Select.Option key={ index } value={ option }>
                      { t(`cms.landlord.modal.reconciliation_option.${option.toLowerCase()}.option`) }
                    </Select.Option>
                  </For>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <div ref={ (node) => { this.reconciliationRadioContainer = node; } }>
            <If condition={ getFieldValue('reconciliationOption') === 'BOOKING_COMPLETED' }>
              <Col span={ 12 }>
                <Form.Item
                  label={ t('cms.landlord.detail.booking_auto_confirm.label') }
                  colon={ false }
                >
                  { getFieldDecorator('bookingAutoConfirm', {
                    rules: [
                      {
                        required: true,
                        message: t('cms.landlord.modal.error.blank'),
                      },
                    ],
                    initialValue: !!landlord.bookingAutoConfirm,
                  })(
                    <Radio.Group name="radiogroup">
                      <Choose>
                        <When condition={
                          type === 'create' || !(landlord && landlord.properties
                          && landlord.properties.edges && landlord.properties.edges.length > 0)
                        }
                        >
                          <Tooltip
                            placement="top"
                            arrowPointAtCenter
                            overlayClassName="landlord-info__radio-tooltip"
                            getPopupContainer={ () => this.reconciliationRadioContainer }
                            title={ t('cms.landlord.detail.booking_auto_confirm.tips') }
                          >
                            <Radio disabled value>
                              <span className="landlord-info__radio-text">
                                { t('cms.form.value.yes') }
                              </span>
                            </Radio>
                          </Tooltip>
                        </When>
                        <Otherwise>
                          <Radio value>{ t('cms.form.value.yes') }</Radio>
                        </Otherwise>
                      </Choose>
                      <Choose>
                        <When condition={ type === 'create' }>
                          <Tooltip
                            placement="top"
                            arrowPointAtCenter
                            overlayClassName="landlord-info__radio-tooltip landlord-info__radio-tooltip--no"
                            getPopupContainer={ () => this.reconciliationRadioContainer }
                            title={ t('cms.landlord.detail.booking_auto_confirm.tips') }
                          >
                            <Radio disabled defaultChecked value={ false }>
                              <span className="landlord-info__radio-text">
                                { t('cms.form.value.no') }
                              </span>
                            </Radio>
                          </Tooltip>
                        </When>
                        <Otherwise>
                          <Radio value={ false }>{ t('cms.form.value.no') }</Radio>
                        </Otherwise>
                      </Choose>
                    </Radio.Group>,
                  )}
                </Form.Item>
              </Col>
            </If>
          </div>
        </Row>
        <If condition={
          getFieldValue('bookingAutoConfirm') &&
          getFieldValue('reconciliationOption') === 'BOOKING_COMPLETED'
        }
        >
          <If condition={ hasConfirmSettings }>
            <For of={ confirmSettings } each="item" index="index">
              <If condition={ item }>
                <div className="landlord-info__properties" key={ `${index}-countdown-days-${item.countdownDays}` }>
                  {t('cms.landlord.landlord_details.auto_complete_info.content_1', {
                    number: item.propertyIds ? item.propertyIds.length : 0,
                  })}
                  <span className="landlord-detail__auto-confirm-info-blod">{item.countdownDays}</span>
                  {t('cms.landlord.landlord_details.auto_complete_info.content_2')}
                  <div className="landlord-info__btns">
                    <button
                      className={ classNames('landlord-info__btn', {
                        'landlord-info__btn--disabled': showPropertiesTransfer,
                      }) }
                      disabled={ showPropertiesTransfer }
                      onClick={ () => { this.handleEditBtn(item.countdownDays); } }
                    >
                      <Icon type="edit" />
                    </button>
                    <Divider type="vertical" />
                    <button
                      className={ classNames('landlord-info__btn', {
                        'landlord-info__btn--disabled': showPropertiesTransfer,
                      }) }
                      disabled={ showPropertiesTransfer }
                      onClick={ () => { this.handleDeletedBtn(item.countdownDays); } }
                    >
                      <Icon type="delete" />
                    </button>
                  </div>
                </div>
              </If>
            </For>
          </If>
          <If condition={ showPropertiesTransfer }>
            <PropertiesTransfer
              t={ t }
              form={ this.props.form }
              landlordProperties={ this.getTransferProperties() }
              targetKeys={ selectCountdownDays && selectTargetKeys ?
                selectTargetKeys.propertyIds : [] }
              countdownDays={ Number(this.state.selectCountdownDays) }
              onUpdateConfirmSettings={ this.handleUpdateConfirmSettings }
              reconciliationContainer={ this.reconciliationContainer }
            />
          </If>
          <If condition={ hasConfirmSettings }>
            <button
              onClick={ this.handleAddNewBtn }
              disabled={ showPropertiesTransfer }
              className={ classNames('landlord-info__btn landlord-info__btn--add', {
                'landlord-info__btn--disabled': showPropertiesTransfer,
              }) }
            >
              {t('cms.landlord.modal.button.add_new')}
            </button>
          </If>
        </If>
      </section>
    );
  }
}

BillingAndReconciliation.propTypes = {
  t: PropTypes.func,
  form: PropTypes.object,
  landlord: PropTypes.object,
  type: PropTypes.string,
  setConfirmSettings: PropTypes.func,
  confirmSettings: PropTypes.array,
  showPropertiesTransfer: PropTypes.bool,
  setShowPropertiesTransfer: PropTypes.func,
  getReconciliationPreferenceList: PropTypes.func,
  reconciliationPreference: PropTypes.array,
  isFetchingReconciliationPreference: PropTypes.bool,
};
BillingAndReconciliation.defaultProps = {
  t: () => {},
  form: {},
  landlord: {},
  type: 'create',
  setConfirmSettings: () => {},
  confirmSettings: [],
  showPropertiesTransfer: false,
  setShowPropertiesTransfer: () => {},
  getReconciliationPreferenceList: () => {},
  reconciliationPreference: [],
  isFetchingReconciliationPreference: false,
};
