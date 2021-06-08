import React from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Checkbox, Col, Row, DatePicker, Transfer, message, Popconfirm } from 'antd';
import { fetch } from '~actions/shared';
import classNames from 'classnames';
import moment from 'moment';
import endpoints from '~settings/endpoints';
import { connect } from 'react-redux';
import * as queries from '~settings/queries';
import modal from '~components/modal';
import TableColumnSearch from '~components/table-column-search';
import ContractUpload from '~components/contract-upload';
import * as actions from '~actions/contract';
import Confirm from '~pages/dashboard/contract/contract-modal/confirm';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';

const mapDispatchToProps = dispatch => ({
  createContract: (params, callback) => {
    dispatch(actions.createContract(params, callback));
  },
  updateContract: (params, callback) => {
    dispatch(actions.updateContract(params, callback));
  },
  bulkDuallySigned: (params) => {
    dispatch(actions.bulkDuallySigned(params));
  },
});
@connect(null, mapDispatchToProps)
@modal({ className: 'contract-modal' }, false)
class ContractModalForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contractModalData: {},
      properties: [],
      targetKeys: [],
      modal: 'add-modal',
      showFileError: null,
      checked: false,
      showPopConfirm: false,
      isTouched: false,
    };
    this.openEndDate = '9999-12-31T00:00:00+00:00';
  }

  componentDidMount() {
    if (this.props.editContract && Object.keys(this.props.editContract).length > 0) {
      this.handleSearch(
        this.props.editContract.landlord.slug,
        this.props.editContract.landlord,
        () => {
          const propertyIds = [];
          const latestPropertyIds = [];
          this.state.properties.map((property) => {
            latestPropertyIds.push(property.node.id);
            return true;
          });
          this.props.editContract.properties.map((property) => {
            if (latestPropertyIds.indexOf(property.id) !== -1) {
              propertyIds.push(property.id);
            }

            return true;
          });
          this.props.form.resetFields(['properties']);
          this.setState({ targetKeys: propertyIds });

          this.props.form.setFieldsValue({
            effectiveFrom: moment(this.props.editContract.effectiveFrom),
            effectiveTo: this.props.editContract.effectiveTo !== moment(this.openEndDate).format('YYYY-MM-DD') ?
              moment(this.props.editContract.effectiveTo) : null,
            signedDate: moment(this.props.editContract.signedDate),
            properties: propertyIds,
          });

          if (this.props.editContract.effectiveTo === moment(this.openEndDate).format('YYYY-MM-DD')) {
            this.props.form.setFieldsValue({ openEnd: true });
          }

          this.state.contractModalData.files = this.props.editContract.files.map((file) => {
            const newFile = { ...file };
            newFile.url = this.buildAuthContractUrl(newFile.source);
            return newFile;
          });
        }, 'edit');
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isFillPreparedContract && this.props.isFillPreparedContract) {
      const { preparedContract } = this.props;
      this.handleSearch(preparedContract.slug, preparedContract);
    }
  }

  buildAuthContractUrl = source => `${endpoints.getContractFile.url()}/${source}`;

  closeContractModal = () => {
    this.setState({
      showPopConfirm: this.state.isTouched || this.props.form.isFieldsTouched(),
    }, () => {
      if (!this.state.showPopConfirm) {
        this.props.handleContractModal(false);
      }
    });
  }

  closePopModal = () => {
    this.setState({
      showPopConfirm: false,
    });
  }

  setContractFiles = (file) => {
    if (!this.state.contractModalData.files) {
      this.state.contractModalData.files = [];
    }
    this.state.contractModalData.files.push(file);
    this.setState(this.state);
  };

  handleClickNext = () => {
    const validate = this.props.form.validateFields();
    Promise.all([validate]).then(() => {
      if (!this.state.contractModalData.files || this.state.contractModalData.files.length === 0) {
        this.setState({ showFileError: true });
        return false;
      }
      this.setState({ showFileError: false });

      const fieldsValue = this.props.form.getFieldsValue();
      this.setState({
        contractModalData: {
          effectiveFrom: fieldsValue.effectiveFrom.format('YYYY-MM-DD'),
          effectiveTo: fieldsValue.effectiveTo ?
            fieldsValue.effectiveTo.format('YYYY-MM-DD') :
            moment(this.openEndDate).format('YYYY-MM-DD'),
          landlord: this.state.contractModalData.landlord,
          signedDate: fieldsValue.signedDate.format('YYYY-MM-DD'),
          files: this.state.contractModalData.files,
          properties: this.state.properties.filter(
            property => this.state.targetKeys.indexOf(property.node.id) !== -1,
          ),
        },
        modal: 'next-modal',
      });
      return true;
    }).catch(() => {
      // Error
    });
  }

  getLandlordProperties = (slug, onSuccess) => {
    fetch({
      dispatch: () => {},
      endpoint: endpoints.getLandlordProperties.url(),
      params: queries.landlordProperties({ slug }),
      onSuccess: (response) => {
        this.state.properties = (response.properties && response.properties.edges) || [];
        this.setState(this.state, () => {
          onSuccess(response);
        });
      },
      onError: () => {
        this.state.properties = [];
        this.setState(this.state);
      },
    });
  };

  handleSearch = (slug, value, onSuccess = () => {}, type = 'create') => {
    this.state.contractModalData.landlord = value;
    this.props.form.setFieldsValue({ landlord: value.name });
    this.getLandlordProperties(slug, onSuccess);
    if (type === 'create' && !this.state.isTouched) {
      this.state.isTouched = true;
    }
    this.setState(this.state);
  };

  resetValue = () => {
    this.state.contractModalData.landlord = {};
    this.state.properties = [];
    this.props.form.resetFields(['landlord']);
    if (!this.state.isTouched) {
      this.state.isTouched = true;
    }
    this.setState(this.state);
  };

  handleTransferChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  };

  handleClickConfirm = () => {
    const files = [];
    this.state.contractModalData.files.map((file) => {
      const item = {
        contentType: file.content_type || file.contentType,
        name: file.name,
        source: file.source,
      };
      files.push(item);
      return true;
    });
    const contractData = {
      effectiveFrom: this.state.contractModalData.effectiveFrom,
      effectiveTo: this.state.contractModalData.effectiveTo,
      landlordId: this.state.contractModalData.landlord.id,
      signedDate: this.state.contractModalData.signedDate,
      files,
      propertyIds: this.state.targetKeys,
    };

    if (this.props.editContract && this.props.editContract.id) {
      contractData.id = this.props.editContract.id;
      this.props.updateContract(contractData, () => {
        message.success(this.props.t('cms.contract.modal.update_success'));
      });
    } else {
      this.props.createContract(contractData, () => {
        message.success(this.props.t('cms.contract.modal.create_success'));
      });
      this.props.handleResetData();
    }

    if (this.props.form.getFieldValue('bulkPropertiesStatus')) {
      this.props.bulkDuallySigned({
        propertyIds: this.getValidateTargetProperties(this.state.targetKeys),
      });
    }

    this.props.handleResetData();
    this.props.handleContractModal(false);
  };

  handleClickBack = () => {
    this.setState({ modal: 'add-modal' });
  };

  handleContractChange = () => {
    this.setState({
      showFileError: false,
      isTouched: true,
    });
  };

  getValidateTargetProperties = (targetKeys) => {
    const { properties } = this.state;
    const validateTargetKeys = properties
      .filter(property =>
        targetKeys.indexOf(property.key) !== -1 && property.node.commissionTierCount !== 0,
      ).map(property => property.key);

    return validateTargetKeys;
  }

  handleContractMediaRemove = (file) => {
    const id = file.id || file.uid;
    this.state.contractModalData.files = this.state.contractModalData.files.filter(
      contractFile => (contractFile.id || contractFile.uid) !== id,
    );
    if (!this.state.isTouched) {
      this.state.isTouched = true;
    }
    this.setState(this.state);
  };

  changeCheckBox = (e) => {
    this.setState({
      checked: e.target.checked,
    });
  }

  disabledStartDate = (startValue, endValue) => {
    if (!startValue || !endValue) {
      return false;
    }

    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = (startValue, endValue) => {
    if (!startValue || !endValue) {
      return false;
    }

    return endValue.valueOf() <= startValue.valueOf();
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <div className="contract-modal-container">
        <Form className={ classNames('contract-modal-container__form', {
          'contract-modal-container__form--show': this.state.modal === 'add-modal',
        }) }
        >
          <div className="contract-modal-container__header-container">
            <Popconfirm
              trigger="click"
              visible={ this.state.showPopConfirm }
              title={ this.props.t('cms.property.commission_form_modal.close.tips.title') }
              placement="left"
              onConfirm={ () => { this.props.handleContractModal(false); } }
              onCancel={ this.closePopModal }
              okText={ this.props.t('cms.properties.edit.btn.yes') }
              cancelText={ this.props.t('cms.properties.edit.btn.no') }
            >
              <button type="button" onClick={ this.closeContractModal } className="contract-modal-container__btn">
                <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
              </button>
            </Popconfirm>
          </div>

          <div className="contract-modal-container__content-container">
            <h2 className="contract-modal-container__title">{ this.props.t('cms.contract.add_new_contract.title.add_new_contract') }</h2>

            <Row gutter={ 80 } className="contract-modal-container__row">
              <Col span={ 12 }>
                <p className="contract-modal-container__label">{ this.props.t('cms.contract.add_new_contract.label.landlord_name') }</p>
                <Form.Item>
                  <div className="contract-modal-container__landlord" ref={ (node) => { this.landlordSearch = node; } }>
                    { getFieldDecorator('landlord', {
                      rules: [{
                        required: true,
                        message: this.props.t('cms.listing.modal.error_message.can_not_empty'),
                      }],
                      trigger: 'onChange',
                    })(
                      <TableColumnSearch
                        searchType="landlord"
                        isLocaitonCustom
                        onSearch={ (slug, value) => {
                          this.handleSearch(slug, value);
                        } }
                        t={ this.props.t }
                        placeholder={ this.props.t('cms.properties.create.basic_information.apartment_landlord_placeholder') }
                        valueData={
                          this.state.contractModalData && this.state.contractModalData.landlord ?
                            this.state.contractModalData.landlord.name : ''
                        }
                        resetValue={ this.resetValue }
                        parrentNode={ this.landlordSearch }
                      />,
                    ) }
                  </div>
                </Form.Item>
              </Col>
              <Col span={ 12 }>
                <p className="contract-modal-container__label">{ this.props.t('cms.contract.add_new_contract.label.contract_signed_date') }</p>
                <Form.Item>
                  <div className="contract-modal-container__signed-date" ref={ (node) => { this.contractSigned = node; } }>
                    { getFieldDecorator('signedDate', {
                      rules: [{
                        required: true,
                        message: this.props.t('cms.listing.modal.error_message.can_not_empty') }],
                      trigger: 'onChange',
                    })(
                      <DatePicker
                        getCalendarContainer={ () => this.contractSigned }
                        style={ { width: '100%' } }
                        format={ 'DD/MM/YYYY' }
                      />,
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={ 80 } className="contract-modal-container__row">
              <Col span={ 12 }>
                <p className="contract-modal-container__label">
                  { this.props.t('cms.contract.add_new_contract.label.contract_effective_date') }
                </p>
                <Form.Item>
                  <div
                    className="contract-modal-container__effiectived-date"
                    ref={ (node) => { this.effecitveStartDate = node; } }
                  >
                    { getFieldDecorator('effectiveFrom', {
                      rules: [{
                        required: true,
                        message: this.props.t('cms.listing.modal.error_message.can_not_empty') }],
                      trigger: 'onChange',
                    })(
                      <DatePicker
                        placeholder={ this.props.t('cms.contract.effective_date.start_date') }
                        getCalendarContainer={ () => this.effecitveStartDate }
                        style={ { width: '100%' } }
                        onChange={ () => {} }
                        disabledDate={
                          startValue => this.disabledStartDate(startValue, this.props.form.getFieldValue('effectiveTo'))
                        }
                        format={ 'DD/MM/YYYY' }
                      />,
                    )}
                  </div>
                </Form.Item>
              </Col>
              <Col span={ 12 }>
                <div className="contract-modal-container__open-end">
                  <Form.Item>
                    { getFieldDecorator('openEnd', { valuePropName: 'checked' })(
                      <Checkbox
                        onChange={ () => this.props.form.resetFields(['effectiveTo']) }
                      >
                        <span className="contract-modal-container__open-end-text">
                          {this.props.t('cms.contract.effective_date.open_end')}
                        </span>
                      </Checkbox>,
                    )}
                  </Form.Item>
                </div>
                <Form.Item>
                  <div
                    className="contract-modal-container__effiectived-date"
                    ref={ (node) => { this.effecitveEndDate = node; } }
                  >
                    { getFieldDecorator('effectiveTo', {
                      rules: [{
                        required: !getFieldValue('openEnd'),
                        message: this.props.t('cms.listing.modal.error_message.can_not_empty') }],
                      trigger: 'onChange',
                    })(
                      <DatePicker
                        placeholder={ getFieldValue('openEnd') ? '' : this.props.t('cms.contract.effective_date.end_date') }
                        getCalendarContainer={ () => this.effecitveEndDate }
                        style={ { width: '100%' } }
                        disabled={ getFieldValue('openEnd') }
                        disabledDate={
                          endValue => this.disabledEndDate(getFieldValue('effectiveFrom'), endValue)
                        }
                        format={ 'DD/MM/YYYY' }
                      />,
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Row className="contract-modal-container__row">
              <Col span={ 24 }>
                <p className="contract-modal-container__label">{ this.props.t('cms.contract.add_new_contract.label.contract_upload') }</p>
                <ContractUpload
                  setContractFiles={ this.setContractFiles }
                  onChange={ this.handleContractChange }
                  onMediaRemove={ this.handleContractMediaRemove }
                  files={
                    (this.state.contractModalData && this.state.contractModalData.files) || []
                  }
                  t={ this.props.t }
                />
                <If condition={ this.state.showFileError }>
                  <p className="contract-modal-container__upload-error">
                    { this.props.t('cms.listing.modal.error_message.can_not_empty') }
                  </p>
                </If>
              </Col>
            </Row>

            <Row className="contract-modal-container__row">
              <Col span={ 24 }>
                <p className="contract-modal-container__label">{ this.props.t('cms.contract.add_new_contract.label.property_name') }</p>

                <Form.Item>
                  { getFieldDecorator('properties', {
                    trigger: 'onChange',
                    rules: [{
                      required: true,
                      validator: (rule, value, callback) => {
                        if (value && value.length > 0) {
                          callback();
                        }

                        callback(this.props.t('cms.listing.modal.error_message.can_not_empty'));
                      },
                    }],
                  })(
                    <Transfer
                      dataSource={ this.state.properties }
                      showSearch
                      rowKey={ item => item.node.id }
                      style={ { width: '100%' } }
                      targetKeys={ this.state.targetKeys }
                      locale={ {
                        itemUnit: 'property',
                        itemsUnit: 'properties',
                        searchPlaceholder: 'Enter search content',
                      } }
                      onChange={ this.handleTransferChange }
                      render={ item => item.node.name.toLowerCase() }
                      listStyle={ { width: 'calc(50% - 20px)', height: '236px' } }
                    />,
                  )}
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="contract-modal-container__footer-container">
            <If condition={
              !this.props.editContract ||
              Object.keys(this.props.editContract).length === 0 }
            >
              <Form.Item className="contract-modal-container__checkbox-container">
                { getFieldDecorator('bulkPropertiesStatus', {
                  valuePropName: 'checked',
                })(
                  <Checkbox
                    className="contract-modal-container__checkbox"
                    disabled={ !this.state.properties || this.state.properties.length === 0 ||
                      !showElementByAuth(
                        platformEntity.PROPERTIES_PROPERTIES,
                        entityAction.UPDATE,
                      ) }
                    onChange={ this.changeCheckBox }
                  >
                    { this.props.t('cms.contract.add_new_contract.checkbox.bulk_dually_signed') }
                  </Checkbox>,
                )}
              </Form.Item>
            </If>
            <button
              type="button"
              className="contract-modal-container__btn contract-modal-container__btn--keppel"
              onClick={ this.handleClickNext }
            >{ this.props.t('cms.contract.add_new_contract.btn.next') }</button>
          </div>
        </Form>

        <div className={ classNames('contract-modal-container__confirm-modal', {
          'contract-modal-container__confirm-modal--show': this.state.modal === 'next-modal',
        }) }
        >
          <Confirm
            contract={ this.state.contractModalData }
            handleClickConfirm={ this.handleClickConfirm }
            handleClickBack={ this.handleClickBack }
            t={ this.props.t }
            editContract={ this.props.editContract }
            checked={ this.state.checked }
            closePopModal={ this.closePopModal }
            closeContractModal={ this.closeContractModal }
            handleContractModal={ this.props.handleContractModal }
            showPopConfirm={ this.state.showPopConfirm }
          />
        </div>
      </div>
    );
  }
}

ContractModalForm.propTypes = {
  handleContractModal: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  createContract: PropTypes.func,
  t: PropTypes.func,
  editContract: PropTypes.shape({
    effectiveFrom: PropTypes.string,
    effectiveTo: PropTypes.string,
    signedDate: PropTypes.string,
    landlord: PropTypes.shape({
      slug: PropTypes.string,
      name: PropTypes.string,
    }),
    files: PropTypes.array,
    properties: PropTypes.array,
    id: PropTypes.string,
  }),
  updateContract: PropTypes.func,
  handleResetData: PropTypes.func.isRequired,
  bulkDuallySigned: PropTypes.func,
  isFillPreparedContract: PropTypes.bool,
  preparedContract: PropTypes.object,
};

ContractModalForm.defaultProps = {
  t: () => {},
  createContract: () => {},
  updateContract: () => {},
  editContract: {
    effectiveFrom: '',
    effectiveTo: '',
    signedDate: '',
    landlord: {
      slug: '',
      name: '',
    },
    files: [],
    properties: [],
    id: '',
  },
  contractFilter: {},
  bulkDuallySigned: () => {},
  isFillPreparedContract: false,
  preparedContract: {},
};

export default Form.create({
  name: 'contract-modal-form',
})(ContractModalForm);
