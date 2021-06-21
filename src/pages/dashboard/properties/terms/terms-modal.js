import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Modal, Form, Input, DatePicker, Checkbox, Row, Col, Upload, Icon, message } from 'antd';
import { Files as FilesIcon } from "~components/svgs";
import { getFileSizeString } from '~helpers/jstool';
import moment from 'moment';
import { connect } from 'react-redux';
import { uploadPropertyTermsFile, createPropertyTerms, updatePropertyTerms, getPropertyTerms } from '~actions/properties/terms';
import { uploadTermsFileErrors as errors } from '~constants/errors';
import { validateEmojiRegex } from '~helpers/validate';

const TermsModal = ({
  t,
  defaultTerms,
  handleType,
  onClose,
  form,
  property,
  createTerms,
  updateTerms,
  uploadTermsFile,
  getTerms,
}) => {
  const defaultFile = defaultTerms.url ? {
    name: defaultTerms.fileName,
    url: defaultTerms.url,
  } : null;
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(defaultFile);
  const [selectedFileError, setSelectedFileError] = useState(false);

  const { getFieldDecorator, getFieldValue } = form;

  const handleFormSubmit = useCallback((newTerms, url) => {
    const params = {
      title: newTerms.title,
      url: url || newTerms.file.url,
      validFrom: newTerms.validFrom,
      validTill: newTerms.validTill,
    };
    const propertyDetails = property || {};
    if (defaultTerms && defaultTerms.id) { // update
      params.id = defaultTerms.id;
      updateTerms(params, () => {
        message.success(t('cms.terms.update.success'));
        setLoading(false);
        getTerms(propertyDetails.slug);
        onClose();
      });
    } else { // create
      params.propertyId = propertyDetails.id;
      createTerms(params, () => {
        message.success(t('cms.terms.create.success'));
        setLoading(false);
        getTerms(propertyDetails.slug);
        onClose();
      });
    }
  });

  const handleConfirm = useCallback((newTerms) => {
    if (
      defaultTerms
      && defaultTerms.url
      && defaultTerms.url === newTerms.file.url
    ) { // need not upload file
      handleFormSubmit(newTerms);
      return;
    }
    setLoading(true);
    uploadTermsFile(newTerms.file, (result) => {
      handleFormSubmit(newTerms, result.url);
    }, (err) => {
      if (err.errorCode === errors.INVALID_PROPERTY_TERMS_FILE_TYPE) {
        message.error(t('cms.terms.modal.file.upload.type.error'));
      } else {
        message.error(t('cms.terms.modal.file.upload.error'));
      }
      setLoading(false);
    });
  });

  const handleClickConfirm = useCallback(() => {
    form.validateFieldsAndScroll(
      (err) => {
        if (err || !selectedFile) {
          if (!selectedFile) {
            setSelectedFileError('cms.terms.modal.form.emptyError');
          }
        } else {
          setSelectedFileError(null);
          const params = form.getFieldsValue();
          handleConfirm({
            title: params.name,
            validFrom: params.validFrom ? moment(params.validFrom).format('YYYY-MM-DD') : null,
            validTill: !params.openEnd && params.validEnd ? moment(params.validEnd).format('YYYY-MM-DD') : null,
            file: selectedFile,
          });
        }
      },
    );
  });

  const handleClickDeleteFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const disabledValidFrom = (startValue, endValue) => {
    if (!startValue || !endValue) {
      return false;
    }

    return startValue.valueOf() > endValue.valueOf();
  };

  const disabledValidEnd = (startValue, endValue) => {
    if (!startValue || !endValue) {
      return false;
    }

    return endValue.valueOf() <= startValue.valueOf();
  };

  let validFrom = null;
  let validEnd = null;

  const fileProps = {
    name: 'Terms file upload',
    showUploadList: false,
    accept: '.png,.pdf,.docx',
    beforeUpload: () => false,
    onChange: (e) => {
      if (e && e.file) {
        const size = e.file.size || 0;
        if (size > 0 && size / 1024 / 1024 < 10) {
          setSelectedFile(e.file);
          setSelectedFileError(null);
        } else {
          setSelectedFileError('cms.terms.modal.form.file.size.error');
        }
      }
    },
  };

  return (
    <Modal
      visible
      layout="vertical"
      maskClosable={ false }
      title={
        (
          <span className="terms-modal__title">{ t(`cms.terms.modal.title.${handleType}`) }</span>
        )
      }
      okText={ t('cms.landlord.modal.confirm.button') }
      okButtonProps={ {
        loading,
      } }
      onOk={ handleClickConfirm }
      onCancel={ onClose }
      className="terms-modal"
    >
      <Form className="terms-modal__contain">
        <Form.Item
          label={ t('cms.terms.list.row.name') }
          colon={ false }
        >
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: t('cms.terms.modal.form.emptyError') },
              {
                validator: (rule, value, callback) => {
                  if (!validateEmojiRegex(value)) {
                    callback('error');
                  }
                  callback();
                },
                message: t('cms.terms.modal.form.error_emoji'),
              },
            ],
            initialValue: defaultTerms.title,
            validateTrigger: 'onBlur',
          })(
            <Input
              placeholder={ t('cms.terms.list.row.name') }
              maxLength={ 80 }
            />,
          )}
        </Form.Item>

        <div className="terms-modal__valid-date">
          <Row gutter={ 16 }>
            <Col span={ 12 }>
              <div className="terms-modal__valid-from-date" >
                <label className="terms-modal__label terms-modal__label--required">
                  { t('cms.terms.modal.valid.from') }
                </label>
                <Form.Item>
                  <div ref={ (node) => { validFrom = node; } }>
                    { getFieldDecorator('validFrom', {
                      rules: [{
                        required: true,
                        message: t('cms.terms.modal.form.emptyError'),
                      }],
                      initialValue: defaultTerms.validFrom ? moment(defaultTerms.validFrom) : null,
                    })(
                      <DatePicker
                        style={ { width: '100%', height: '32px', borderRadius: '2px' } }
                        getCalendarContainer={ validFrom }
                        format="ll"
                        disabledDate={
                          fromValue => disabledValidFrom(fromValue, getFieldValue('validEnd'))
                        }
                      />,
                    )}
                  </div>
                </Form.Item>
              </div>
            </Col>

            <Col span={ 12 }>
              <div className="terms-modal__valid-from-date" >
                <label className="terms-modal__label terms-modal__label--required">
                  { t('cms.terms.modal.valid.end') }
                  <div className="terms-modal__open-end">
                    <div className="terms-modal__open-end-checkbox">
                      <Form.Item>
                        { getFieldDecorator('openEnd', {
                          valuePropName: 'checked',
                          initialValue: defaultTerms.id && !defaultTerms.validTill,
                        })(
                          <Checkbox />,
                        )}
                      </Form.Item>
                    </div>
                    <span className="terms-modal__open-end-text">
                      {t('cms.terms.modal.valid.open_end')}
                    </span>
                  </div>
                </label>
                <Form.Item>
                  <div ref={ (node) => { validEnd = node; } }>
                    { getFieldDecorator('validEnd', {
                      rules: [{
                        required: !getFieldValue('openEnd'),
                        message: t('cms.terms.modal.form.emptyError'),
                      }],
                      initialValue: defaultTerms.validTill ? moment(defaultTerms.validTill) : null,
                    })(
                      <DatePicker
                        style={ { width: '100%', height: '32px', borderRadius: '2px' } }
                        getCalendarContainer={ validEnd }
                        format="ll"
                        disabledDate={
                          endValue => disabledValidEnd(getFieldValue('validFrom'), endValue)
                        }
                        disabled={ getFieldValue('openEnd') }
                        placeholder={ getFieldValue('openEnd') ? '' : t('cms.terms.modal.valid.end.placeholder') }
                      />,
                    )}
                  </div>
                </Form.Item>
              </div>
            </Col>
          </Row>
        </div>

        <div className="terms-modal__file">
          <label className="terms-modal__label terms-modal__label--required">
            { t('cms.terms.modal.file') }
          </label>
          <Choose>
            <When condition={ selectedFile }>
              <div className="terms-modal__file-wrap">
                <div className="terms-modal__file-wrap__left">
                  <FilesIcon className="terms-modal__file-wrap__file-icon" />
                  <span className="terms-modal__file-wrap__file-name">
                    { selectedFile.name }
                  </span>
                  <If condition={ selectedFile.size }>
                    <span className="terms-modal__file-wrap__file-name">
                      { `(${getFileSizeString(selectedFile.size)})` }
                    </span>
                  </If>
                </div>
                <button
                  type="button"
                  className="terms-modal__file-wrap__delete-btn"
                  onClick={ handleClickDeleteFile }
                >
                  <Icon type="delete" className="terms-modal__file-wrap__delete-icon" />
                </button>
              </div>
            </When>
            <Otherwise>
              <Upload.Dragger { ...fileProps }>
                <div
                  className={ classNames('terms-modal__upload-excel', {
                    'terms-modal__upload-excel__error': !!selectedFileError,
                    'terms-modal__upload-excel__selected': !!selectedFile,
                  }) }
                >
                  <Icon type="plus" className="terms-modal__upload-excel__upload-icon" />
                  <div className="terms-modal__upload-excel__text">
                    <div className="terms-modal__upload-excel__description">
                      { t('cms.terms.modal.upload_file.description') }
                    </div>
                    <div className="terms-modal__upload-excel__tips">
                      { t('cms.terms.modal.upload_file.tips') }
                    </div>
                  </div>
                </div>
              </Upload.Dragger>
            </Otherwise>
          </Choose>
          <If condition={ selectedFileError }>
            <div className="terms-modal__file__error">
              { t(selectedFileError) }
            </div>
          </If>
        </div>

      </Form>
    </Modal>
  );
};

TermsModal.propTypes = {
  t: PropTypes.func.isRequired,
  defaultTerms: PropTypes.object,
  handleType: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  form: PropTypes.shape({ // eslint-disable-line react/require-default-props
    validateFields: PropTypes.func.isRequired,
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    setFields: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
    validateFieldsAndScroll: PropTypes.func.isRequired,
    getFieldsError: PropTypes.func.isRequired,
  }),
  property: PropTypes.object,
  createTerms: PropTypes.func.isRequired,
  updateTerms: PropTypes.func.isRequired,
  uploadTermsFile: PropTypes.func.isRequired,
  getTerms: PropTypes.func.isRequired,
};

TermsModal.defaultProps = {
  t: () => {},
  defaultTerms: {},
  handleType: 'create',
  property: {},
  onConfirm: () => {},
  onClose: () => {},
  createTerms: () => {},
  updateTerms: () => {},
  uploadTermsFile: () => {},
  getTerms: () => {},
};

const mapStateToProps = (state) => {
  const propertyTerms = state.dashboard.propertyTerms.toJS();
  return {
    property: propertyTerms.property,
  };
};

const mapDispatchToProps = dispatch => ({
  createTerms: (params, successCallback) => {
    dispatch(createPropertyTerms(params, successCallback));
  },
  updateTerms: (params, successCallback) => {
    dispatch(updatePropertyTerms(params, successCallback));
  },
  uploadTermsFile: uploadPropertyTermsFile,
  getTerms: (slug) => {
    dispatch(getPropertyTerms(slug));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Form.create({ name: 'terms-modal' })(TermsModal));
