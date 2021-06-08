import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Row, Col, Form, Select, Input, Popconfirm, Icon, message } from 'antd';
import { connect } from 'react-redux';
import * as recordActions from '~actions/properties/property-list';
import modal from '~components/modal';
import ReactQuill from '~components/react-quill';
import { getHtmlLength, htmlMinify } from '~helpers/property-edit';
import generatePath from '~settings/routing';

const mapDispatchToProps = dispatch => ({
  updatePropertyNote: (params, successCallback, failedCallback) => {
    dispatch(recordActions.updatePropertyNote(params, successCallback, failedCallback));
  },
  editPropertyNote: (params, successCallback, failedCallback) => {
    dispatch(recordActions.editPropertyNote(params, successCallback, failedCallback));
  },
  deletePropertyNote: (params, successCallback, failedCallback) => {
    dispatch(recordActions.deletePropertyNote(params, successCallback, failedCallback));
  },
});

@connect(null, mapDispatchToProps)
@modal({ className: 'record-form-modal' }, true)

export default class RecordFormModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFieldsChange: false,
    };

    this.contractStage = ['PROSPECT', 'CONTACTED', 'DUALLY_SIGNED', 'LOST', 'CHANGE_OWNERSHIP'];
  }

  componentDidMount() {
    this.setModalData();

    window.onbeforeunload = (e) => {
      if (this.props.form.isFieldsTouched()) {
        const msg = this.props.t('cms.properties.edit.leave_alert.content');
        // eslint-disable-next-line no-param-reassign
        e = e || window.event;
        if (e) {
          e.returnValue = msg;
        }

        return msg;
      }
      return null;
    };
  }

  setModalData = () => {
    const { editNodeInfo, modalType } = this.props;

    if (modalType === 'add') {
      return;
    }

    const formData = {};
    formData.contractStage = editNodeInfo.newContractStage;
    formData.noteSubject = editNodeInfo.title;
    formData.noteDescription = editNodeInfo.description ? editNodeInfo.description : this.props.t('cms.property.record.form_modal.description_text');

    this.props.form.setFieldsValue(formData);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { modalType, property, editNodeInfo } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.closeModal();
        const formatValues = {};
        if (modalType === 'add') {
          formatValues.contractStage = values.contractStage;
          formatValues.title = values.noteSubject ? values.noteSubject : 'Untitled note';
          formatValues.description = values.noteDescription;

          formatValues.propertyId = property.id;
          this.props.updatePropertyNote(formatValues, () => {
            message.success(this.props.t('cms.property.record.form_modal.update_stage.success'));
            this.freshNote();
          }, () => {
            message.error(this.props.t('cms.auth.login.alert.clienterror'));
          });
        } else {
          formatValues.description = values.noteDescription;
          formatValues.title = values.noteSubject;
          formatValues.id = editNodeInfo.id;
          this.props.editPropertyNote(formatValues, () => {
            message.success(this.props.t('cms.property.record.form_modal.update_note.success'));
            this.freshNote();
          }, () => {
            message.error(this.props.t('cms.auth.login.alert.clienterror'));
          });
        }
      }
    });
  }

  freshNote = () => {
    this.props.getPropertyNote(decodeURIComponent(this.props.match.params.propertySlug));
  }

  closeRecordModal = () => {
    this.setState({
      isFieldsChange: this.props.form.isFieldsTouched(),
    });

    if (!this.props.form.isFieldsTouched()) {
      this.props.closeModal();
    }
  }

  closePopModal = () => {
    this.setState({
      isFieldsChange: false,
    });
  }

  quillCounter = (html) => {
    const number = getHtmlLength(html);
    return (
      <div className={ classNames('detail-tab__counter') }>
        {number}
      </div>
    );
  }

  handleSelectChange = (value) => {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({
      noteSubject: this.props.t(`cms.property.record.form_modal.note.${value.toLowerCase()}`),
    });
  }

  handleDeleteRecord = () => {
    const { editNodeInfo } = this.props;
    this.props.deletePropertyNote({ id: editNodeInfo.id }, () => {
      message.success(this.props.t('cms.property.record.form_modal.delete.success'));
      this.props.closeModal();
      this.freshNote();
    }, () => {
      message.error(this.props.t('cms.auth.login.alert.clienterror'));
    });
  }

  render() {
    const { t, form, modalType, property } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    return (
      <div className="record-form">
        <div className="record-form__header">
          {t('cms.property.record.form_modal.title')}
        </div>
        <Popconfirm
          trigger="click"
          visible={ this.state.isFieldsChange }
          title={ t('cms.property.commission_form_modal.close.tips.title') }
          placement="left"
          onConfirm={ this.props.closeModal }
          onCancel={ this.closePopModal }
          okText={ t('cms.properties.edit.btn.yes') }
          cancelText={ t('cms.properties.edit.btn.no') }
        >
          <button
            onClick={ this.closeRecordModal }
            className="commission-from__close-btn"
          >
            <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
          </button>
        </Popconfirm>
        <div className="record-form__content">
          <div className="record-form__tips">
            <Icon type="exclamation-circle" />
            <span>
              {t('cms.property.record.form_modal.tips')}
            </span>
          </div>
          <Row className="record-form__row">
            <Col span={ 12 }>
              <Form.Item>
                <div className="record-form__title record-form__title--required">
                  {t('cms.property.record.form_modal.stage.title')}
                </div>
                {
                  getFieldDecorator('contractStage', {
                    rules: [{
                      required: true,
                      validator: (rule, value, callback) => {
                        if (value && value === 'DUALLY_SIGNED' && property.commissionTierCount === 0) {
                          callback(' ');
                        } else if (!value || value === '') {
                          callback(t('cms.property.commission.not_be_empty.err'));
                        } else {
                          callback();
                        }
                      },
                    }],
                  })(
                    <Select
                      disabled={ modalType === 'edit' }
                      placeholder={ t('cms.property.record.form_modal.stage.placeholder') }
                      onChange={ this.handleSelectChange }
                    >
                      <For of={ this.contractStage } each="type">
                        <Select.Option
                          value={ type }
                          key={ type }
                        >
                          {t(`cms.property.record.form_modal.stage.${type.toLowerCase()}`)}
                        </Select.Option>
                      </For>
                    </Select>,
                  )
                }
              </Form.Item>
              <If condition={ property.commissionTierCount === 0 && getFieldValue('contractStage') === 'DUALLY_SIGNED' }>
                <div className="record-form__contract-error">
                  <p className="record-form__contract-error-content">{t('cms.property.contract_modal.stage_error.commission')}</p>
                  <Link
                    className="record-form__contract-error-link"
                    to={ generatePath('property.commission', { propertySlug: property.slug }) }
                  >
                    {t('cms.property.contract_modal.stage_error.commission_link')}
                  </Link>
                </div>
              </If>
            </Col>
            <Col span={ 12 }>
              <Form.Item className="record-form__stage">
                <div className="record-form__title">
                  {t('cms.property.record.form_modal.note.title')}
                </div>
                {
                  getFieldDecorator('noteSubject', {
                    rules: [{
                      max: 250,
                      message: t('cms.properties.create.create_confirmation.error_length'),
                    }],
                  })(
                    <Input
                      placeholder={ t('cms.property.record.form_modal.note.placeholder') }
                    />,
                  )
                }
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col className="record-form__description-part">
              <Form.Item >
                <div className="record-form__title">
                  {t('cms.property.record.form_modal.description.title')}
                </div>
                {getFieldDecorator('noteDescription', {
                  rules: [{
                    max: 1000,
                    message: t('cms.properties.record.note_content.description.error_length'),
                  }],
                  initialValue: htmlMinify(t('cms.property.record.form_modal.description_text')),
                  validateTrigger: 'onChange',
                })(
                  <ReactQuill
                    placeholder={ t('cms.properties.edit.detail.cancelation_policy.plcaeholder') }
                    fontTypes={ [3, false] }
                  />
                  ,
                )}
                {this.quillCounter(getFieldValue('noteDescription'))}
              </Form.Item>
            </Col>
          </Row>
        </div>
        <div className="record-form__conform">
          <If condition={ modalType === 'edit' }>
            <Popconfirm
              placement="topLeft"
              title={ t('cms.property.record.form_modal.delete.tips') }
              onConfirm={ (e) => { e.stopPropagation(); this.handleDeleteRecord(); } }
              onCancel={ (e) => { e.stopPropagation(); } }
              okText={ t('cms.properties.edit.btn.yes') }
              okType="danger"
              cancelText={ t('cms.properties.edit.btn.no') }
            >
              <div className="record-form__delete-action">
                <Icon
                  type="delete"
                  style={ {
                    color: '#38b2a6',
                  } }
                />
                <span className="record-form__delete-text">
                  {t('cms.form.button.delete')}
                </span>
              </div>
            </Popconfirm>
          </If>
          <button
            className={ classNames('record-form__conform--btn', {
              'record-form__conform--disabled': property.commissionTierCount === 0 && getFieldValue('contractStage') === 'DUALLY_SIGNED',
            }) }
            type="button"
            disabled={ property.commissionTierCount === 0 && getFieldValue('contractStage') === 'DUALLY_SIGNED' }
            onClick={ this.handleSubmit }
          >
            {t('cms.property.record.form_modal.btn.confirm')}
          </button></div>
      </div>
    );
  }
}

RecordFormModal.propTypes = {
  form: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  modalType: PropTypes.string.isRequired,
  property: PropTypes.object.isRequired,
  updatePropertyNote: PropTypes.func,
  editNodeInfo: PropTypes.object.isRequired,
  deletePropertyNote: PropTypes.func,
  editPropertyNote: PropTypes.func,
  getPropertyNote: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
};

RecordFormModal.defaultProps = {
  updatePropertyNote: () => {},
  deletePropertyNote: () => {},
  editPropertyNote: () => {},
};
