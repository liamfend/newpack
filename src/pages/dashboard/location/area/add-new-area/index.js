import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Icon, Form, Input, message } from 'antd';
import modal from '~components/modal';
import * as areaActions from '~actions/location/area';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TableColumnSearch from '~components/table-column-search';
import { communicationStatus } from '~constants';

const mapStateToProps = state => ({
  areaCommunication: state.dashboard.area.get('communication').toJS().create,
  cityCommunication: state.dashboard.city.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  createArea: (data) => {
    dispatch(areaActions.createArea(data));
  },

  checkAreaExist: (slug, onSuccess) => {
    dispatch(areaActions.checkAreaExist(slug, onSuccess));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@modal({ className: 'add-new-area-modal' }, true)
class AddNewArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cityId: null,
      isRepeated: false,
      areaExist: false,
      isFetchingArea: false,
      isFocus: false,
      isSave: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.areaCommunication.status === communicationStatus.IDLE
        && this.props.areaCommunication.status === communicationStatus.FETCHING
    ) {
      message.success(this.props.t('cms.location.table.add_new.success', { tableType: 'Area' }));
      this.props.createSuccess();
    }
  }

  handleSave = (e) => {
    e.preventDefault();
    const areaSlug = this.props.form.getFieldValue('areaSlug');

    if (!areaSlug && !this.props.form.getFieldsError(['areaSlug']).areaSlug) {
      this.setState({
        isSave: true,
      });
    }

    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        const areaData = {};
        areaData.name = values.areaName;
        areaData.slug = values.areaSlug;
        areaData.cityNodeId = this.state.cityId;

        this.props.createArea(areaData);
      }
    });
  }

  handleGenerateBtn = () => {
    this.setState({
      isSave: false,
    });
    const areaName = this.props.form.getFieldValue('areaName');
    if (areaName && this.isValidate(areaName)) {
      const generateSlug = areaName.trim().toLowerCase().replace(/\s+/g, '-');
      this.props.form.setFieldsValue({
        areaSlug: generateSlug,
      });

      this.setState({
        isFetchingArea: true,
        areaExist: false,
      });
      this.props.checkAreaExist(generateSlug, (data) => {
        if (data && data.area) {
          this.props.form.setFieldsValue({
            areaSlug: null,
          });
          this.props.form.setFields({
            areaSlug: {
              errors: [new Error(this.props.t('cms.location.table.add_new.slug_already_exists.message'))],
            },
          });
          this.state.areaExist = true;
        }

        this.state.isFetchingArea = false;
        this.setState(this.state);
      });
    } else {
      // If no name clear input and show error
      this.props.form.resetFields(['areaSlug']);
      this.props.form.validateFields(['areaSlug']);
    }
  }

  handleInputSlug = () => {
    this.props.form.validateFields(['areaSlug']);
  }

  handleSlugFocus = () => {
    this.setState({
      isFocus: true,
    });
  }

  handleSlugBlur = () => {
    const areaSlug = this.props.form.getFieldValue('areaSlug');
    if (areaSlug) {
      const generateSlug = areaSlug.toLowerCase().replace(/\s+/g, '-');
      this.props.form.setFieldsValue({
        areaSlug: generateSlug,
      });
    }
    this.setState({
      isFetchingArea: true,
      areaExist: false,
    });
    this.props.checkAreaExist(areaSlug, (data) => {
      if (data && data.area) {
        this.props.form.setFieldsValue({
          areaSlug: null,
        });
        this.props.form.setFields({
          areaSlug: {
            errors: [new Error(this.props.t('cms.location.table.add_new.slug_already_exists.message'))],
          },
        });
        this.state.areaExist = true;
      }

      this.state.isFetchingArea = false;
      this.setState(this.state);
    });

    this.props.form.validateFields(['areaSlug']);
  }

  handleSearch = (slug, value) => {
    this.setState({
      cityId: value.id,
    });

    this.props.form.setFieldsValue({
      city: slug,
    });
  }

  isValidate = (value) => {
    if (value) {
      return (/^[A-Za-z\s0-9-]+$/g.test(value.trim()));
    }
    return false;
  };

  isCorrectSlug = (inputSlug) => {
    if (inputSlug) {
      if (!(/^[a-z0-9-]+$/g.test(inputSlug.trim()))) {
        return this.props.t('cms.location.table.add_new.slug.message');
      }
    }

    return false;
  };

  handleChangeName = () => {
    this.setState({
      isRepeated: false,
      areaExist: false,
      isSave: false,
    });
    this.props.form.resetFields(['areaSlug']);
    this.props.form.setFieldsValue({
      areaSlug: null,
    });
  };

  resetValue = (searchType) => {
    if (searchType === 'city') {
      this.props.form.resetFields(['city']);
      this.props.form.setFieldsValue({
        city: null,
      });
    }
  }

  render() {
    const { t } = this.props;
    const { getFieldDecorator, getFieldValue, getFieldsError } = this.props.form;

    return (
      <div className="add-new-area">
        <h2 className="add-new-area__title">
          { t('cms.location.table.add_new_area.button') }
        </h2>
        <button onClick={ this.props.onClose } className="add-new-area__close-btn" >
          <Icon type="close" style={ { fontSize: '12px', color: '#9e9e9e' } } />
        </button>
        <Form className="add-new-area__form" onSubmit={ this.handleSave }>
          <div className="add-new-area__form-left">
            <Form.Item>
              <span className="add-new-area__label">{ t('cms.location.table.add_new.area_name') }</span>
              { getFieldDecorator('areaName', {
                rules: [{
                  required: true,
                  message: t('cms.location.table.add_new.area_name.message'),
                },
                ],
                initialValue: getFieldValue('areaName'),
                trigger: 'onChange',
              })(
                <Input
                  onChange={ this.handleChangeName }
                  className="details-form__name-input"
                  placeholder={ t('cms.location.table.add_new.area_name.placeholder') }
                />,
              )}
            </Form.Item>
            <Form.Item>
              <span
                className={ classNames('add-new-area__label', {
                  'add-new-area__label-disabled': !this.isValidate(getFieldValue('areaName')),

                }) }
              >
                { t('cms.location.table.add_new.area_slug') }
              </span>
              {
                getFieldDecorator('areaSlug', {
                  rules: [
                    {
                      required: true,
                      message: t('cms.location.table.add_new.area_slug.massage'),
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (
                          (value && this.state.isRepeated) || this.isCorrectSlug(value)
                        ) {
                          callback(t('cms.location.table.add_new.slug.message'));
                        } else {
                          callback();
                        }
                      },
                    },
                  ],
                  initialValue: getFieldValue('areaSlug'),
                  trigger: 'onChange',
                })(
                  <Input
                    disabled={
                      this.state.isSave ?
                        this.state.isSave :
                        !this.state.areaExist
                      && !getFieldsError(['areaSlug']).areaSlug
                      && (!getFieldValue('areaName') || this.isValidate(getFieldValue('areaName')))
                    }
                    className="add-new-area__city-slug"
                    placeholder={ t('cms.city.add_new_city.generate.placeholder') }
                    suffix={
                      <Button
                        className={ classNames('add-new-area__city-slug-btn', {
                          'add-new-area__city-slug-btn--disable': !this.isValidate(getFieldValue('areaName')),
                        }) }
                        onClick={ this.handleGenerateBtn }
                        disabled={ !this.isValidate(getFieldValue('areaName')) }
                      >
                        {t('cms.city.add_new_city.table.city_slug.btn_text')}
                      </Button>
                    }
                    onChange={ this.handleInputSlug }
                    onBlur={ this.handleSlugBlur }
                    onFocus={ this.handleSlugFocus }
                  />,
                )}
            </Form.Item>
            <Form.Item>
              <div className="filter">
                <div>
                  <span className="add-new-area__label"> { t('cms.table.column.city') } </span>
                  {
                    getFieldDecorator('city', {
                      rules: [{
                        required: true,
                        message: t('cms.city.add_new_city.table.city_name.message'),
                      }],
                      initialValue: getFieldValue('city'),
                      trigger: 'onChange',
                    })(
                      <TableColumnSearch
                        searchType="city"
                        isLocaitonCustom
                        showCountry
                        placeholder={ t('cms.location.table.add_new_area.search_city.placeholder') }
                        onSearch={ (slug, value) => { this.handleSearch(slug, value); } }
                        t={ t }
                        resetValue={ this.resetValue }
                      />
                      ,
                    )}
                </div>
              </div>
            </Form.Item>
          </div>
          <hr className="add-new-area__line" />
          <button type="submit" className="add-new-area__save-btn">
            { t('cms.form.button.save') }
          </button>
        </Form>

      </div>
    );
  }
}

AddNewArea.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  createArea: PropTypes.func,
  checkAreaExist: PropTypes.func,
  areaCommunication: PropTypes.object,
  createSuccess: () => {},
};
AddNewArea.defaultProps = {
  t: () => {},
  createArea: () => {},
  checkAreaExist: () => {},
  areaCommunication: {},
  createSuccess: () => {},
};

const AddNewAreaForm = Form.create()(AddNewArea);

export default AddNewAreaForm;
