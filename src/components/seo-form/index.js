import PropTypes from 'prop-types';
import React from 'react';

import classNames from 'classnames';
import { Form, Row, Col, Input, Checkbox, Tooltip } from 'antd';
import updatePayloadDetails, { handleSEOTemplate } from '~helpers/location';

const { TextArea } = Input;

class SEOForm extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = {
      tipsWidth: 300,
    };
  }
  componentDidMount() {
    this.mounted = true;
    this.getTipsWidth();
    window.addEventListener('resize', this.getTipsWidth);
  }

  componentWillUnmount() {
    this.mounted = false;
    document.removeEventListener('resize', this.getTipsWidth);
  }

  handleTemplateEnabledChange = (field) => {
    this.props.form.resetFields([field]);
  }

  textCounter = (text, limit) => {
    const number = text ? text.length : 0;
    return (
      <div className={ classNames('seo-form__counter', {
        'seo-form__counter--red': number > limit,
      })
      }
      >
        {`${number}/${limit}`}
      </div>
    );
  }

  getTipsWidth = () => {
    const seoComponent = document.querySelector('.seo-form__headline-container');
    if (seoComponent && this.mounted) {
      this.setState({
        tipsWidth: seoComponent.offsetWidth ? seoComponent.offsetWidth : 300,
      });
    }
  }

  getTooltipData = (container, fieldValue) => ({
    trigger: 'click',
    placement: 'bottomLeft',
    title: this.props.t('cms.location.edit.seo.input.tip'),
    overlayStyle: { minWidth: this.state.tipsWidth },
    getPopupContainer: () => container,
    overlayClassName: fieldValue ? 'seo-form__input-tips--disable' : '',
  });

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;

    return (
      <div className={ classNames('seo-form', this.props.className) }>
        <Form className="seo-form__form">
          <Row>
            <p className="seo-form__summary">
              { this.props.t('cms.edit.seo.summary.tips') }
            </p>
          </Row>
          <Row gutter={ 100 }>
            <Col span={ 12 }>
              <h3 className="seo-form__block-title">
                { this.props.t('cms.edit.seo.block.title.h1', {
                  type: this.props.type,
                }) }
              </h3>
              <div className="seo-form__headline-container">
                <label className="seo-form__label seo-form__label--disabled">
                  <span className="seo-form__label--required">*&nbsp;</span>
                  { this.props.t('cms.edit.seo.label.srp_intro_headline') }
                </label>
                <Form.Item
                  className="seo-form__checkbox-container"
                  ref={ (node) => { this.srpIntroHeadlineEnabled = node; } }
                >
                  { getFieldDecorator('srpIntroHeadlineEnabled', {
                    initialValue: this.props.data && this.props.data.srpIntroHeadlineEnabled,
                    valuePropName: 'checked',
                    rules: [{
                      required: false,
                    }],
                  })(
                    <Checkbox onChange={ () => { this.handleTemplateEnabledChange('srpIntroHeadline'); } }>
                      <Tooltip
                        trigger="hover"
                        title={ this.props.data && this.props.data.seoTemplate &&
                          handleSEOTemplate(
                            this.props.data.name,
                            this.props.data.seoTemplate.srpIntroHeadline,
                            this.props.type,
                          )
                        }
                      >
                        <span className="seo-form__template-enabled">
                          { this.props.t('cms.edit.seo.checkbox.label.template_enabled') }
                        </span>
                      </Tooltip>
                    </Checkbox>,
                  ) }
                </Form.Item>

                <Form.Item className="seo-form__item-container">
                  <div className="seo-form__tips-container" ref={ (node) => { this.seoHeadlineContainer = node; } }>
                    <Tooltip { ...this.getTooltipData(this.seoHeadlineContainer, getFieldValue('srpIntroHeadlineEnabled')) }>
                      { getFieldDecorator('srpIntroHeadline', {
                        initialValue: this.props.data && !getFieldValue('srpIntroHeadlineEnabled') ?
                          this.props.data.srpIntroHeadline : this.props.t('cms.edit.seo.input.disabled.placeholder'),
                        rules: [{
                          required: !getFieldValue('srpIntroHeadlineEnabled'),
                          validator: (rule, value, callback) => {
                            if (!value || value.length > 100) {
                              callback(!value ?
                                this.props.t('cms.properties.edit.error.blank') :
                                this.props.t('cms.properties.edit.error.format_error_message'),
                              );
                            } else {
                              callback();
                            }
                          },
                        }],
                        validateTrigger: 'onBlur',
                      })(<Input ref={ (node) => { this.InputContainer = node; } } disabled={ getFieldValue('srpIntroHeadlineEnabled') } />) }
                    </Tooltip>
                  </div>
                  { this.textCounter(getFieldValue('srpIntroHeadline'), 100) }
                </Form.Item>
              </div>

              <div className="seo-form__paragraph-container">
                <label className="seo-form__label seo-form__label--disabled">
                  <span className="seo-form__label--required">*&nbsp;</span>
                  { this.props.t('cms.edit.seo.label.srp_intro_paragraph') }
                </label>
                <Form.Item className="seo-form__checkbox-container">
                  { getFieldDecorator('srpIntroParagraphEnabled', {
                    initialValue: this.props.data && this.props.data.srpIntroParagraphEnabled,
                    valuePropName: 'checked',
                    rules: [{
                      required: false,
                    }],
                  })(
                    <Checkbox onChange={ () => { this.handleTemplateEnabledChange('srpIntroParagraph'); } }>
                      <Tooltip
                        trigger="hover"
                        title={ this.props.data && this.props.data.seoTemplate &&
                          handleSEOTemplate(
                            this.props.data.name,
                            this.props.data.seoTemplate.srpIntroParagraph,
                            this.props.type,
                          )
                        }
                      >
                        <span className="seo-form__template-enabled">
                          { this.props.t('cms.edit.seo.checkbox.label.template_enabled') }
                        </span>
                      </Tooltip>
                    </Checkbox>) }
                </Form.Item>
                <Form.Item className="seo-form__item-container">
                  <div className="seo-form__tips-container" ref={ (node) => { this.seoParagraphContainer = node; } }>
                    <Tooltip { ...this.getTooltipData(this.seoParagraphContainer, getFieldValue('srpIntroParagraphEnabled')) } >
                      { getFieldDecorator('srpIntroParagraph', {
                        initialValue: this.props.data && !this.props.data.srpIntroParagraphEnabled ?
                          this.props.data.srpIntroParagraph : this.props.t('cms.edit.seo.input.disabled.placeholder'),
                        rules: [{
                          required: !getFieldValue('srpIntroParagraphEnabled'),
                          validator: (rule, value, callback) => {
                            if (!value || value.length > 5000) {
                              callback(!value ?
                                this.props.t('cms.properties.edit.error.blank') :
                                this.props.t('cms.properties.edit.error.format_error_message'),
                              );
                            } else {
                              callback();
                            }
                          },
                        }],
                        validateTrigger: 'onBlur',
                      })(<TextArea rows={ 5 } disabled={ getFieldValue('srpIntroParagraphEnabled') } />) }
                    </Tooltip>
                  </div>
                  { this.textCounter(getFieldValue('srpIntroParagraph'), 5000) }
                </Form.Item>
              </div>
            </Col>
            <Col span={ 12 }>
              <h3 className="seo-form__block-title">{ this.props.t('cms.edit.seo.block.title.meta', {
                type: this.props.type,
              }) }</h3>
              <div className="seo-form__meta-title-container">
                <label className="seo-form__label seo-form__label--disabled">
                  <span className="seo-form__label--required">*&nbsp;</span>
                  { this.props.t('cms.edit.seo.label.meta_title') }
                </label>
                <Form.Item className="seo-form__checkbox-container">
                  { getFieldDecorator('metaTitleEnabled', {
                    initialValue: this.props.data && this.props.data.metaTitleEnabled,
                    valuePropName: 'checked',
                    rules: [{
                      required: false,
                    }],
                  })(<Checkbox onChange={ () => { this.handleTemplateEnabledChange('metaTitle'); } }>
                    <Tooltip
                      trigger="hover"
                      title={ this.props.data && this.props.data.seoTemplate &&
                        handleSEOTemplate(
                          this.props.data.name,
                          this.props.data.seoTemplate.metaTitle,
                          this.props.type,
                        ) }
                    >
                      <span className="seo-form__template-enabled">
                        { this.props.t('cms.edit.seo.checkbox.label.template_enabled') }
                      </span>
                    </Tooltip>
                  </Checkbox>) }
                </Form.Item>
                <Form.Item className="seo-form__item-container">
                  <div className="seo-form__tips-container" ref={ (node) => { this.seoMetaTitleContainer = node; } }>
                    <Tooltip { ...this.getTooltipData(this.seoMetaTitleContainer, getFieldValue('metaTitleEnabled')) }>
                      { getFieldDecorator('metaTitle', {
                        initialValue: this.props.data && !this.props.data.metaTitleEnabled ?
                          this.props.data.metaTitle : this.props.t('cms.edit.seo.input.disabled.placeholder'),
                        rules: [{
                          required: !getFieldValue('metaTitleEnabled'),
                          validator: (rule, value, callback) => {
                            if (!value || value.length > 200) {
                              callback(!value ?
                                this.props.t('cms.properties.edit.error.blank') :
                                this.props.t('cms.properties.edit.error.format_error_message'),
                              );
                            } else {
                              callback();
                            }
                          },
                        }],
                        validateTrigger: 'onBlur',
                      })(<Input disabled={ getFieldValue('metaTitleEnabled') } />) }
                    </Tooltip>
                  </div>
                  { this.textCounter(getFieldValue('metaTitle'), 200) }
                </Form.Item>
              </div>
              <div className="seo-form__meta-desc-container">
                <label className="seo-form__label seo-form__label--disabled">
                  <span className="seo-form__label--required">*&nbsp;</span>
                  { this.props.t('cms.edit.seo.label.meta_description') }
                </label>
                <Form.Item className="seo-form__checkbox-container">
                  { getFieldDecorator('metaDescriptionEnabled', {
                    initialValue: this.props.data && this.props.data.metaDescriptionEnabled,
                    valuePropName: 'checked',
                    rules: [{
                      required: false,
                    }],
                  })(<Checkbox onChange={ () => { this.handleTemplateEnabledChange('metaDescription'); } }>
                    <Tooltip
                      trigger="hover"
                      title={ this.props.data && this.props.data.seoTemplate &&
                        handleSEOTemplate(
                          this.props.data.name,
                          this.props.data.seoTemplate.metaDescription,
                          this.props.type,
                        ) }
                    >
                      <span className="seo-form__template-enabled">
                        { this.props.t('cms.edit.seo.checkbox.label.template_enabled') }
                      </span>
                    </Tooltip>
                  </Checkbox>) }
                </Form.Item>
                <Form.Item className="seo-form__item-container">
                  <div className="seo-form__tips-container" ref={ (node) => { this.seoMetaDescriptionContainer = node; } }>
                    <Tooltip { ...this.getTooltipData(this.seoMetaDescriptionContainer, getFieldValue('metaDescriptionEnabled')) }>
                      { getFieldDecorator('metaDescription', {
                        initialValue: this.props.data && !this.props.data.metaDescriptionEnabled ?
                          this.props.data.metaDescription : this.props.t('cms.edit.seo.input.disabled.placeholder'),
                        rules: [{
                          required: !getFieldValue('metaDescriptionEnabled'),
                          validator: (rule, value, callback) => {
                            if (!value || value.length > 500) {
                              callback(!value ?
                                this.props.t('cms.properties.edit.error.blank') :
                                this.props.t('cms.properties.edit.error.format_error_message'),
                              );
                            } else {
                              callback();
                            }
                          },
                        }],
                        validateTrigger: 'onBlur',
                      })(<TextArea rows={ 5 } disabled={ getFieldValue('metaDescriptionEnabled') } />) }
                    </Tooltip>
                  </div>
                  { this.textCounter(getFieldValue('metaDescription'), 500) }
                </Form.Item>
              </div>
              <div className="seo-form__meta-keywords-container">
                <label className="seo-form__label seo-form__label--disabled">
                  { this.props.t('cms.edit.seo.label.meta_keywords') }
                </label>
                <Form.Item className="seo-form__checkbox-container">
                  { getFieldDecorator('metaKeywordsEnabled', {
                    initialValue: this.props.data && this.props.data.metaKeywordsEnabled,
                    valuePropName: 'checked',
                    rules: [{
                      required: false,
                    }],
                  })(<Checkbox onChange={ () => { this.handleTemplateEnabledChange('metaKeywords'); } }>
                    <Tooltip
                      trigger="hover"
                      title={ this.props.data && this.props.data.seoTemplate &&
                        handleSEOTemplate(
                          this.props.data.name,
                          this.props.data.seoTemplate.metaKeywords,
                          this.props.type,
                        ) }
                    >
                      <span className="seo-form__template-enabled">
                        { this.props.t('cms.edit.seo.checkbox.label.template_enabled') }
                      </span>
                    </Tooltip>
                  </Checkbox>) }
                </Form.Item>
                <Form.Item className="seo-form__item-container">
                  <div className="seo-form__tips-container" ref={ (node) => { this.seoMetaKeywordsContainer = node; } }>
                    <Tooltip { ...this.getTooltipData(this.seoMetaKeywordsContainer, getFieldValue('metaKeywordsEnabled')) }>
                      { getFieldDecorator('metaKeywords', {
                        initialValue: this.props.data && !this.props.data.metaKeywordsEnabled ?
                          this.props.data.metaKeywords : this.props.t('cms.edit.seo.input.disabled.placeholder'),
                        rules: [{
                          required: !getFieldValue('metaKeywordsEnabled'),
                          validator: (rule, value, callback) => {
                            if (value && value.length > 500) {
                              callback(!value ?
                                this.props.t('cms.properties.edit.error.blank') :
                                this.props.t('cms.properties.edit.error.format_error_message'),
                              );
                            } else {
                              callback();
                            }
                          } }],
                        validateTrigger: 'onBlur',
                      })(<TextArea rows={ 5 } disabled={ getFieldValue('metaKeywordsEnabled') } />) }
                    </Tooltip>
                  </div>
                  { this.textCounter(getFieldValue('metaKeywords'), 500) }
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

SEOForm.propTypes = {
  t: PropTypes.func.isRequired,
  className: PropTypes.string,
  form: PropTypes.object.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string,
    seoTemplate: PropTypes.shape({
      metaDescription: PropTypes.string,
      metaKeywords: PropTypes.string,
      metaTitle: PropTypes.string,
      srpIntroHeadline: PropTypes.string,
      srpIntroParagraph: PropTypes.string,
      type: PropTypes.string,
    }),
    srpIntroHeadline: PropTypes.string,
    srpIntroHeadlineEnabled: PropTypes.bool,
    srpIntroParagraph: PropTypes.string,
    srpIntroParagraphEnabled: PropTypes.bool,
    metaDescription: PropTypes.string,
    metaDescriptionEnabled: PropTypes.bool,
    metaKeywords: PropTypes.string,
    metaKeywordsEnabled: PropTypes.bool,
    metaTitle: PropTypes.string,
    metaTitleEnabled: PropTypes.bool,
  }),
  type: PropTypes.string.isRequired,
};

SEOForm.defaultProps = {
  t: () => {},
  className: '',
  data: null,
};

export default Form.create({
  name: 'seo_form',
  onFieldsChange: (props, changedFields) => {
    const data = { ...changedFields };
    const { getFieldValue } = props.form;

    if (getFieldValue('srpIntroHeadlineEnabled') && data && data.srpIntroHeadline) {
      delete data.srpIntroHeadline;
    }

    if (getFieldValue('srpIntroParagraphEnabled') && data.srpIntroParagraph) {
      delete data.srpIntroParagraph;
    }

    if (getFieldValue('metaDescriptionEnabled') && data.metaDescription) {
      delete data.metaDescription;
    }

    if (getFieldValue('metaKeywordsEnabled') && data.metaKeywords) {
      delete data.metaKeywords;
    }

    if (getFieldValue('metaTitleEnabled') && data.metaTitle) {
      delete data.metaTitle;
    }

    const result = updatePayloadDetails(props.data, props.type, data, 'seo');

    if (result) {
      props.setTabStatus(result);
    }
  },
})(SEOForm);
