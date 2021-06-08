import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DatePicker, Row, Col, Select, Icon, Form, Input, Tooltip } from 'antd';
import moment from 'moment';
import { mergeSearchParams } from '~helpers/history';
import SearchComponent from '~components/search-component';

export default class ContractFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLandlords: [],
      searchComponentVisible: true,
      filterForm: {
        landlord: [],
        signedDate: [],
        contractStatus: '',
      },
    };
  }


  formatFilters = filters => ({
    landlordSlugs: filters.landlord || null,
    pageNumber: Number(filters.pageNumber) || null,
    pageSize: Number(filters.pageSize) || null,
    statuses: filters.contractStatus ? filters.contractStatus.toUpperCase() : null,
    signedDateStart: filters.signedDate.length > 0 ? moment(filters.signedDate[0]).format('YYYY-MM-DD') : null,
    signedDateEnd: filters.signedDate.length > 0 ? moment(filters.signedDate[1]).format('YYYY-MM-DD') : null,
    sortDirection: filters.sortDirection || null,
  });

  inquireFilter = () => {
    const { filterForm } = this.state;
    const queryParams = this.formatFilters(filterForm);
    this.pushState(queryParams);
    this.props.getContractList(queryParams);
    this.props.setPageParams();
  }

  pushState = (data) => {
    this.props.history.push(mergeSearchParams(data, this.props.defaultSearchParams));
  };

  setFilterForm = (data, type) => {
    this.state.filterForm[type] = data;
  }

  resetFilter = () => {
    this.props.form.resetFields();
    this.state.filterForm = {
      landlord: [],
      signedDate: [],
      contractStatus: '',
    };

    this.setState(this.state);
    this.searchComponent.handleClear();

    const inputItem = document.querySelector('.search-component__input');
    if (inputItem) {
      inputItem.value = '';
    }
  }

  changeFilter = () => {
    this.props.changeFilterState();
  }

  render() {
    const { filterForm } = this.state;
    const { form, t, isEmpty, landlordList } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const { RangePicker } = DatePicker;
    const dateFormat = 'DD/MM/YYYY';

    return (
      <div className={ classNames('contract-filter', { 'contract-filter__content-empty': isEmpty }) }>
        <Row style={ { width: '100%' } }>
          <Col span={ this.props.isLarge ? 10 : 24 }>
            <div className={ classNames('contract-filter__box', { 'contract-filter__large': !this.props.isLarge }) }>
              <span className={ classNames('contract-filter__title', { 'contract-filter__title-empty': isEmpty }) }>
                {t('cms.table.column.landlord')}:
              </span>
              <Form.Item>
                {
                  getFieldDecorator('landlord', {
                    validateTrigger: 'onChange',
                  })(
                    <Input
                      className="combined-search-component__input"
                      ref={ (node) => { this.targetInput = node.input; } }
                      disabled={ isEmpty }
                      placeholder={ t('cms.contract.filter.landlord_name.placeholder') }
                    />,
                  )
                }
                <If condition={ this.state.selectedLandlords.length }>
                  <Tooltip
                    arrowPointAtCenter
                    placement="topRight"
                    title={ this.state.selectedLandlords.map(item => <div key={ item.id } className="indicator-text">{item.name}</div>) }
                  >
                    <div className="indicator">{this.state.selectedLandlords.length}</div>
                  </Tooltip>
                </If>
                <If condition={ this.state.searchComponentVisible }>
                  <SearchComponent
                    t={ t }
                    targetInput={ this.targetInput }
                    container={ this.searchComponentContainer }
                    options={ landlordList.map(landlord => landlord.node) }
                    type={ 'input' }
                    onChange={ (value) => {
                      const field = {};
                      field.landlord = value.value.map(item => item.name).join('; ');
                      setFieldsValue(field);
                      this.setState({
                        selectedLandlords: value.value,
                      });
                      filterForm.landlord = value.value.map(item => item.slug);
                    } }
                    keyValue="id"
                    className="search-component"
                    ref={ (node) => { this.searchComponent = node; } }
                    showSelectAll={ false }
                  />
                </If>
              </Form.Item>
            </div>
          </Col>
          <Col span={ this.props.isLarge ? 10 : 24 }>
            <div
              className={ classNames('contract-filter__box', { 'contract-filter__large': !this.props.isLarge }) }
            >
              <span className={ classNames('contract-filter__title', { 'contract-filter__title-empty': isEmpty }) }>
                {t('cms.contract.filter.contract_status')}:
              </span>
              <Form.Item>
                {
                  getFieldDecorator('contractStatus', {
                    validateTrigger: 'onChange',
                    initialValue: filterForm.contractStatus ?
                      filterForm.contractStatus : undefined,
                  })(
                    <Select
                      className="contract-filter__common-size"
                      disabled={ isEmpty }
                      onChange={ data => this.setFilterForm(data, 'contractStatus') }
                      placeholder={ t('cms.contract.filter.contract_status.placeholder') }
                    >
                      <Select.Option value="inactive" label={ t('cms.property.commission.list.status.inactive') }>
                        <span className="contract-filter__circle" style={ { backgroundColor: '#f9b495' } } />
                        {t('cms.property.commission.list.status.inactive')}
                      </Select.Option>
                      <Select.Option value="active" label={ t('cms.property.commission.list.status.active') }>
                        <span className="contract-filter__circle" style={ { backgroundColor: '#4db253' } } />
                        {t('cms.property.commission.list.status.active')}
                      </Select.Option>
                      <Select.Option value="expire" label={ t('cms.property.commission.list.status.expire') }>
                        <span className="contract-filter__circle" style={ { backgroundColor: '#c8c9cb' } } />
                        {t('cms.property.commission.list.status.expire')}
                      </Select.Option>
                    </Select>,
                  )
                }
              </Form.Item>
            </div>
          </Col>
          <If condition={ !this.props.filterState }>
            <Col span={ this.props.isLarge ? 4 : 24 }>
              <div className="contract-filter__inquire">
                <span
                  className={ classNames('contract-filter__act', { 'contract-filter__btn-empty': isEmpty }) }
                  role="button"
                  tabIndex="0"
                  onClick={ this.inquireFilter }
                >
                  {t('cms.contract.filter.inquire')}
                </span>
                <span className="contract-filter__interval">|</span>
                <span
                  className={ classNames('contract-filter__act', { 'contract-filter__btn-empty': isEmpty }) }
                  role="button"
                  tabIndex="0"
                  onClick={ this.resetFilter }
                >
                  {t('cms.contract.filter.reset')}
                </span>
                <span
                  role="button"
                  tabIndex="0"
                  className={ classNames('contract-filter__down', { 'contract-filter__down-empty': isEmpty }) }
                  onClick={ isEmpty ? null : this.changeFilter }
                >
                  <Icon type="down" />
                </span>
              </div>
            </Col>
          </If>
        </Row>
        <If condition={ this.props.filterState }>
          <Row>
            <Col span={ this.props.isLarge ? 10 : 24 }>
              <div
                className={ classNames('contract-filter__box', { 'contract-filter__large': !this.props.isLarge }) }
                ref={ (node) => { this.signData = node; } }
              >
                <span className={ classNames('contract-filter__title', { 'contract-filter__title-empty': isEmpty }) }>
                  {t('cms.contract.filter.signed_date')}:
                </span>
                <Form.Item>
                  {
                    getFieldDecorator('signedDate', {
                      validateTrigger: 'onChange',
                    })(
                      <RangePicker
                        className="contract-filter__common-size"
                        getCalendarContainer={ () => this.signData }
                        format={ dateFormat }
                        disabled={ isEmpty }
                        onChange={ data => this.setFilterForm(data, 'signedDate') }
                      />,
                    )
                  }
                </Form.Item>
              </div>
            </Col>
            <Col span={ this.props.isLarge ? 10 : 24 } />
            <If condition={ this.props.filterState }>
              <Col span={ this.props.isLarge ? 4 : 24 }>
                <div className="contract-filter__inquire">
                  <span
                    className={ classNames('contract-filter__act', { 'contract-filter__btn-empty': isEmpty }) }
                    role="button"
                    tabIndex="0"
                    onClick={ this.inquireFilter }
                  >
                    {t('cms.contract.filter.inquire')}
                  </span>
                  <span className="contract-filter__interval">|</span>
                  <span
                    className={ classNames('contract-filter__act', { 'contract-filter__btn-empty': isEmpty }) }
                    role="button"
                    tabIndex="0"
                    onClick={ this.resetFilter }
                  >
                    {t('cms.contract.filter.reset')}
                  </span>
                  <span
                    role="button"
                    tabIndex="0"
                    className={ classNames('contract-filter__down', { 'contract-filter__down-empty': isEmpty }) }
                    onClick={ isEmpty ? null : this.props.changeFilterState }
                  >
                    <Icon type="up" />
                  </span>
                </div>
              </Col>
            </If>
          </Row>
        </If>
      </div>);
  }
}

ContractFilter.propTypes = {
  isLarge: PropTypes.bool.isRequired,
  filterState: PropTypes.bool.isRequired,
  changeFilterState: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  isEmpty: PropTypes.bool.isRequired,
  landlordList: PropTypes.array,
  history: PropTypes.object.isRequired,
  getContractList: PropTypes.func.isRequired,
  setPageParams: PropTypes.func.isRequired,
  defaultSearchParams: PropTypes.object.isRequired,
};

ContractFilter.defaultProps = {
  landlordList: [],
};
