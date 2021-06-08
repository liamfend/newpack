import React from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Icon,
  Menu,
  Form,
  Input,
  Button,
  Select,
  Dropdown,
  DatePicker,
  InputNumber,
  Popover,
} from 'antd';
import FilterCard from '~components/filter-card';

class FilterModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: [...props.applyFilters],
      editFilter: null,
      startValue: null,
      endValue: null,
    };
  }

  handleRemoveFilter = (type) => {
    this.setState({
      filters: this.state.filters.filter(filter => filter.filterType !== type),
    });
  };

  getAvailableFilterType = () => {
    const selectedFtiler = this.state.filters.map(filter => filter.filterType);

    return this.props.filterTypeList.filter(type => selectedFtiler.indexOf(type) === -1);
  }

  handleFilterClick = (type) => {
    this.setState({ editFilter: type });
  }

  filterMenu = () => (
    <Menu>
      <For of={ this.getAvailableFilterType() } each="filterType">
        <Menu.Item
          key={ filterType }
          onClick={ () => { this.handleFilterClick(filterType); } }
        >
          { this.props.t(`cms.properties.change_log.filter_type.${filterType}`) }
        </Menu.Item>
      </For>
    </Menu>
  )

  disabledStartDate = (startValue) => {
    const { endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
    // return startValue.valueOf() > endValue.valueOf() ||
    // startValue.valueOf() < moment(endValue).subtract('90', 'days').valueOf();
  };

  disabledEndDate = (endValue) => {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() < startValue.valueOf();
    // return endValue.valueOf() < startValue.valueOf() ||
    // endValue.valueOf() > moment(startValue).add('90', 'days').valueOf();
  };

  onChange = (field, value, callback) => {
    this.setState({
      [field]: value,
    }, () => {
      callback();
    });
  };

  onStartChange = (value) => {
    this.onChange('startValue', value, () => {
      this.props.form.validateFields(['end_date']);
    });
  };

  onEndChange = (value) => {
    this.onChange('endValue', value, () => {
      this.props.form.validateFields(['start_date']);
    });
  };

  handleFilterComfirm = () => {
    this.props.form.validateFields((error, values) => {
      if (!error && this.state.editFilter) {
        if (this.state.editFilter === 'log_date') {
          this.handleoperatorFilter({
            filterType: this.state.editFilter,
            operator1: [
              values.start_date ? values.start_date.format('YYYY-MM-DD') : '',
              values.end_date ? values.end_date.format('YYYY-MM-DD') : '',
            ],
          });
        } else {
          const data = {
            filterType: this.state.editFilter,
            operator1: values.operator1,
            operator2: values[`${this.state.editFilter}_operator2`],
          };

          if (this.state.editFilter === 'change_by') {
            data.operator2 = this.props.cmsUserList.find(user =>
              user.email === values[`${this.state.editFilter}_operator2`],
            );
          }

          this.handleoperatorFilter(data);
        }

        this.setState({
          editFilter: null,
          startValue: null,
          endValue: null,
        });
      }
    });
  };

  handleoperatorFilter = (value) => {
    const currentFilterTypeList = this.state.filters.map(filter => filter.filterType);
    if (value.filterType && currentFilterTypeList.indexOf(value.filterType) === -1) {
      this.state.filters.push(value);
      this.setState(this.state);
    }
  };

  handleFilterReset = () => {
    this.setState({
      startValue: null,
      endValue: null,
    });
    this.props.form.resetFields();
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="filter-modal">
        <div className="filter-modal__body">
          <h4 className="filter-modal__title">
            { this.props.t('cms.properties.change_log.filter_modal.title') }
          </h4>
          <div className="filter-modal__filter-btn-container" ref={ (node) => { this.filterBtnContainer = node; } }>
            <If condition={ this.getAvailableFilterType().length > 0 }>
              <Dropdown
                overlay={ this.filterMenu() }
                disabled={ this.state.editFilter }
                getPopupContainer={ () => this.filterBtnContainer }
                trigger={ ['click'] }
              >
                <Button className="filter-modal__filter-btn" size="large">
                  <Icon type="filter" theme="filled" className="filter-modal__filter-btn-icon" />
                  { this.props.t('cms.properties.change_log.filter_modal.btn.add_new_filter') }
                </Button>
              </Dropdown>
            </If>
          </div>

          <If condition={ this.state.editFilter }>
            <div className="filter-modal__edit-filter-container">
              <button
                type="button"
                onClick={ () => { this.handleFilterClick(null); } }
                className="filter-modal__edit-close-btn"
              >
                <Icon type="close" style={ { fontSize: '12px' } } />
              </button>
              <Form>
                <Form.Item className="filter-modal__form-item">
                  <p className="filter-modal__field-label">
                    { this.props.t('cms.properties.change_log.filter_modal.label.filter_by') }
                  </p>
                  {getFieldDecorator('filter_name', {
                    initialValue: this.props.t(`cms.properties.change_log.filter_type.${this.state.editFilter}`),
                  })(
                    <Input className="filter-modal__edit-filter-name" disabled />,
                  )}
                </Form.Item>
                {/* Log date */}
                <If condition={ this.state.editFilter === 'log_date' }>
                  <p className="filter-modal__field-label">{
                    this.props.t('cms.properties.change_log.filter_modal.label.filter_by')
                  }</p>
                  <Row gutter={ 16 }>
                    <Col span={ 12 }>
                      <Form.Item className="filter-modal__form-item">
                        {getFieldDecorator('start_date', {
                          initialValue: this.state.startValue,
                          rules: [
                            { validator: (rule, value, callback) => {
                              if (!value && !this.props.form.getFieldValue('end_date')) {
                                callback(this.props.t('cms.properties.change_log.filter_modal.error_msg.select_a_date'));
                              } else {
                                callback();
                              }
                            } },
                          ],
                        })(
                          <DatePicker
                            className="filter-modal__date-picker"
                            disabledDate={ this.disabledStartDate }
                            format="YYYY-MM-DD"
                            placeholder={ this.props.t('cms.properties.change_log.filter_modal.label.start_date') }
                            onChange={ this.onStartChange }
                          />,
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={ 12 }>
                      <Form.Item className="filter-modal__form-item">
                        {getFieldDecorator('end_date', {
                          initialValue: this.state.endValue,
                          rules: [
                            { validator: (rule, value, callback) => {
                              if (!value && !this.props.form.getFieldValue('start_date')) {
                                callback(' ');
                              } else {
                                callback();
                              }
                            } },
                          ],
                        })(
                          <DatePicker
                            className="filter-modal__date-picker"
                            disabledDate={ this.disabledEndDate }
                            format="YYYY-MM-DD"
                            placeholder={ this.props.t('cms.properties.change_log.filter_modal.label.end_date') }
                            onChange={ this.onEndChange }
                          />,
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </If>
                {/* Other filter */}
                <If condition={ this.state.editFilter !== 'log_date' }>
                  <Form.Item className="filter-modal__form-item">
                    <p className="filter-modal__field-label">
                      { this.props.t('cms.properties.change_log.filter_modal.label.operate_1') }
                    </p>
                    {getFieldDecorator('operator1', {
                      initialValue: 'equals',
                    })(
                      <Select className="filter-modal__select">
                        <Select.Option key="equals">{
                          this.props.t('cms.properties.change_log.filter_modal.operate_1_value.equals')
                        }</Select.Option>
                      </Select>,
                    )}
                  </Form.Item>
                  <Form.Item className="filter-modal__form-item">
                    <p className="filter-modal__field-label">
                      { this.props.t('cms.properties.change_log.filter_modal.label.operate_1') }
                    </p>
                    <If condition={ this.state.editFilter === 'log_section' }>
                      {getFieldDecorator('log_section_operator2', {
                        rules: [{
                          required: true,
                          message: this.props.t('cms.properties.change_log.filter_modal.error_msg.no_empty'),
                        }],
                      })(
                        <Select
                          placeholder={ this.props.t('cms.properties.change_log.filter_modal.placeholder.log_section') }
                          className="filter-modal__select"
                        >
                          <Select.Option key="details">
                            {this.props.t('cms.properties.change_log.filter_modal.log_section_value.details')}
                          </Select.Option>
                          <Select.Option key="address">
                            {this.props.t('cms.properties.change_log.filter_modal.log_section_value.address')}
                          </Select.Option>
                          <Select.Option key="facility">
                            {this.props.t('cms.properties.change_log.filter_modal.log_section_value.facility')}
                          </Select.Option>
                          <Select.Option key="rooms">
                            {this.props.t('cms.properties.change_log.filter_modal.log_section_value.rooms')}
                          </Select.Option>
                          <Select.Option key="listings">
                            {this.props.t('cms.properties.change_log.filter_modal.log_section_value.listings')}
                          </Select.Option>
                        </Select>,
                      )}
                    </If>
                    <If condition={ this.state.editFilter === 'change_by' }>
                      {getFieldDecorator('change_by_operator2', {
                        rules: [{
                          required: true,
                          message: this.props.t('cms.properties.change_log.filter_modal.error_msg.no_empty'),
                        }],
                      })(
                        <Select
                          placeholder={ this.props.t('cms.properties.change_log.filter_modal.placeholder.user_email') }
                          className="filter-modal__select"
                        >
                          <For of={ this.props.cmsUserList } each="user">
                            <Select.Option key={ user.email } value={ user.email }>
                              { user.email }
                            </Select.Option>
                          </For>
                        </Select>,
                      )}
                    </If>
                    <If condition={ this.state.editFilter === 'modal_id' }>
                      {getFieldDecorator('modal_id_operator2', {
                        rules: [{
                          required: true,
                          message: this.props.t('cms.properties.change_log.filter_modal.error_msg.no_empty'),
                        }],
                      })(
                        <InputNumber className="filter-modal__input-number" min={ 0 } />,
                      )}
                    </If>
                  </Form.Item>
                </If>
                <div className="filter-modal__btn-container">
                  <button
                    type="button"
                    className="filter-modal__btn filter-modal__btn--reset"
                    onClick={ this.handleFilterReset }
                  >
                    { this.props.t('cms.properties.change_log.filter_modal.btn.reset') }
                  </button>
                  <button
                    type="submit"
                    onClick={ this.handleFilterComfirm }
                    className="filter-modal__btn filter-modal__btn--confirm"
                  >
                    { this.props.t('cms.properties.change_log.filter_modal.btn.confirm') }
                  </button>
                </div>
              </Form>
            </div>
          </If>

          <If condition={ this.state.filters.length > 0 }>
            <div className="filter-modal__filters-container">
              <For of={ this.state.filters } each="filter">
                <FilterCard
                  key={ filter.filterType }
                  filter={ filter }
                  onClose={ () => { this.handleRemoveFilter(filter.filterType); } }
                  t={ this.props.t }
                />
              </For>
            </div>
          </If>
        </div>

        <div className="filter-modal__footer">
          <button
            type="button"
            className="filter-modal__btn filter-modal__btn--cancel"
            onClick={ this.props.onClose }
          >
            { this.props.t('cms.properties.change_log.filter_modal.btn.cancel') }
          </button>
          <Choose>
            <When condition={ this.state.editFilter }>
              <Popover
                content={ this.props.t('cms.properties.change_log.filter_modal.reminder.confirm_editing') }
                placement="topRight"
              >
                <Button type="primary" disabled>
                  { this.props.t('cms.properties.change_log.filter_modal.btn.apply') }
                </Button>
              </Popover>
            </When>
            <Otherwise>
              <Button
                type="primary"
                onClick={ () => { this.props.onApply(this.state.filters); } }
                className="filter-modal__btn filter-modal__btn--apply"
                disabled={ this.state.editFilter }
              >
                { this.props.t('cms.properties.change_log.filter_modal.btn.apply') }
              </Button>
            </Otherwise>
          </Choose>
        </div>
      </div>
    );
  }
}

FilterModal.propTypes = {
  applyFilters: PropTypes.array,
  filterTypeList: PropTypes.array,
  onClose: PropTypes.func,
  onApply: PropTypes.func,
  form: PropTypes.shape({
    validateFields: PropTypes.func.isRequired,
    getFieldDecorator: PropTypes.func.isRequired,
    resetFields: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired,
  cmsUserList: PropTypes.array,
};

FilterModal.defaultProps = {
  onApply: () => {},
  onClose: () => {},
  filterTypeList: [],
  applyFilters: [],
  t: () => {},
  cmsUserList: [],
};

const FilterModalForm = Form.create()(FilterModal);

export default FilterModalForm;

