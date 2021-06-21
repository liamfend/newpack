import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { Form, Button, Input, Row, Col, Select, DatePicker, Icon, AutoComplete } from 'antd';

class TransferFilter extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSearchParams = {
      pageNumber: 1,
      pageSize: 10,
    };

    this.state = {
      showMore: true,
      landlordSearchResults: [],
      propertySearchResults: [],
      landlordSlug: null,
      propertySlug: null,
    };

    this.types = ['ALL', 'DEPOSIT', 'FIRST_RENTAL'];
    this.status = ['ALL', 'NEW', 'PENDING_TRANSFER', 'TRANSFERRED'];
  }

  handleFiliter = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values) {
          const newValues = {
            landlordSlug: this.state.landlordSlug && values.landlord ?
              this.state.landlordSlug : null,
            propertySlug: this.state.propertySlug && values.property ?
              this.state.propertySlug : null,
            orderReferenceId: values.orderReferenceId || null,
            transferType: values.transferType.toLowerCase() !== 'all' ? values.transferType : null,
            status: values.status.toLowerCase() !== 'all' ? values.status : null,
            referenceId: values.referenceId || null,
            PlanningTransferDatetimeStart: values.planingTransferDate[0] ?
              moment(values.planingTransferDate[0]).format('YYYY-MM-DD') : null,
            PlanningTransferDatetimeEnd: values.planingTransferDate[1] ?
              moment(values.planingTransferDate[1]).format('YYYY-MM-DD') : null,
            ActualTransferDatetimeStart: values.actualTransferDate[0] ?
              moment(values.actualTransferDate[0]).format('YYYY-MM-DD') : null,
            ActualTransferDatetimeEnd: values.actualTransferDate[1] ?
              moment(values.actualTransferDate[1]).format('YYYY-MM-DD') : null,
          };
          const filters = {
            pageNumber: 1,
            pageSize: 10,
          };

          Object.keys(newValues).map((key) => {
            if (newValues[key] || this.props.filters[key]) {
              filters[key] = newValues[key];
            }

            return true;
          });

          this.props.pushState(filters);
        }
      }
    });
  };

  handleResetBtn = () => {
    this.props.form.resetFields();
    this.setState({
      landlordSearchResults: [],
      propertySearchResults: [],
      landlordSlug: null,
      propertySlug: null,
    });
    this.props.history.push({});
  }

  handleShowMoreBtn = () => {
    this.setState({
      showMore: !this.state.showMore,
    });
  }

  handleLandlordChange = (e) => {
    this.props.searchLandlordList(e, (res) => {
      this.setState({
        landlordSearchResults: res.search.edges.map(landlord => landlord.node),
      });
    });
  }

  handleLandlordSelect = (slug) => {
    this.setState({
      landlordSlug: slug,
    });
  }

  handlePropertyChange = (e) => {
    this.props.searchPropertyList(e, (res) => {
      this.setState({
        propertySearchResults: res.search.edges.map(property => property.node),
      });
    });
  }

  handlePropertySelect = (slug) => {
    this.setState({
      propertySlug: slug,
    });
  }

  render() {
    const { t } = this.props;
    const { getFieldDecorator } = this.props.form;
    const dateFormat = 'DD/MM/YYYY';

    return (
      <div className="transfer__filter">
        <Form className="transfer__filter__form">
          <Row gutter={ 24 }>
            <Col span={ 8 }>
              <Form.Item
                className="transfer__filter__item"
                label={ t('cms.billing.tarnsfer.table.filiter.landlord.lable') }
              >
                { getFieldDecorator('landlord', {
                  initialValue: this.props.filters.landlord || null,
                })(
                  <AutoComplete
                    onSelect={ this.handleLandlordSelect }
                    onChange={ this.handleLandlordChange }
                    placeholder={ t('cms.billing.tarnsfer.table.filiter.landlord.placeholder') }
                  >
                    <For of={ this.state.landlordSearchResults } each="item">
                      <AutoComplete.Option key={ item.id } value={ item.slug }>
                        { item.name }
                      </AutoComplete.Option>
                    </For>
                  </AutoComplete>,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 }>
              <Form.Item
                className="transfer__filter__item"
                label={ t('cms.billing.tarnsfer.table.filiter.property.lable') }
              >
                { getFieldDecorator('property', {
                  initialValue: this.props.filters.property || null,
                })(
                  <AutoComplete
                    onSelect={ this.handlePropertySelect }
                    onChange={ this.handlePropertyChange }
                    placeholder={ t('cms.billing.tarnsfer.table.filiter.property.placeholder') }
                  >
                    <For of={ this.state.propertySearchResults } each="item">
                      <AutoComplete.Option key={ item.id } value={ item.slug }>
                        { item.name }
                      </AutoComplete.Option>
                    </For>
                  </AutoComplete>,
                )}
              </Form.Item>
            </Col>
            <Col
              span={ 8 }
              className={ classNames('', { 'transfer__filter__col--hidden': this.state.showMore }) }
            >
              <Form.Item
                className="transfer__filter__item"
                label={ t('cms.billing.tarnsfer.table.filiter.booking_number.lable') }
              >
                { getFieldDecorator('orderReferenceId', {
                  initialValue: this.props.filters.orderReferenceId || null,
                })(
                  <Input
                    placeholder={ t('cms.billing.tarnsfer.table.filiter.booking_number.placeholder') }
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row
            gutter={ 24 }
            className={ classNames('', { 'transfer__filter__row--hidden': this.state.showMore }) }
          >
            <Col span={ 8 }>
              <Form.Item
                className="transfer__filter__item"
                label={ t('cms.billing.tarnsfer.table.filiter.type.lable') }
              >
                { getFieldDecorator('transferType', {
                  initialValue: this.props.filters.transferType || 'ALL',
                })(
                  <Select>
                    <For of={ this.types } each="type">
                      <Select.Option value={ type } key={ type } >
                        { t(`cms.billing.tarnsfer.table.transfer_type.${type.toLowerCase()}`) }
                      </Select.Option>
                    </For>
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 }>
              <Form.Item
                className="transfer__filter__item"
                label={ t('cms.billing.tarnsfer.table.filiter.status.lable') }
              >
                { getFieldDecorator('status', {
                  initialValue: this.props.filters.status || 'ALL',
                })(
                  <Select>
                    <For of={ this.status } each="type">
                      <Select.Option value={ type } key={ type } >
                        { t(`cms.billing.tarnsfer.table.transfer_status.${type.toLowerCase()}`) }
                      </Select.Option>
                    </For>
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 }>
              <Form.Item
                className="transfer__filter__item"
                label={ t('cms.billing.tarnsfer.table.filiter.transfer_number.lable') }
              >
                { getFieldDecorator('referenceId', {
                  initialValue: this.props.filters.referenceId || null,
                })(
                  <Input placeholder={ t('cms.billing.tarnsfer.table.filiter.transfer_number.placeholder') } />,
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row
            gutter={ 24 }
            className={ classNames('', { 'transfer__filter__row--hidden': this.state.showMore }) }
          >
            <Col span={ 8 }>
              <Form.Item
                className="transfer__filter__item"
                label={ t('cms.billing.tarnsfer.table.filiter.planing_transfer_date.lable') }
              >
                { getFieldDecorator('planingTransferDate', {
                  initialValue: [this.props.filters.PlanningTransferDatetimeStart,
                    this.props.filters.PlanningTransferDatetimeEnd],
                })(
                  <DatePicker.RangePicker
                    format={ dateFormat }
                    onChange={ () => {} }
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 }>
              <Form.Item
                className="transfer__filter__item"
                label={ t('cms.billing.tarnsfer.table.filiter.actual_transfer_date.lable') }
              >
                { getFieldDecorator('actualTransferDate', {
                  initialValue: [this.props.filters.ActualTransferDatetimeStart,
                    this.props.filters.ActualTransferDatetimeEnd],
                })(
                  <DatePicker.RangePicker
                    format={ dateFormat }
                    onChange={ () => {} }
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
          <div className="transfer__filter__btns">
            <Button onClick={ this.handleResetBtn }>
              { t('cms.billing.tarnsfer.table.filiter.reset.btn') }
            </Button>
            <Button
              type="primary"
              style={ { margin: '0 12px' } }
              htmlType="submit"
              onClick={ this.handleFiliter }
            >
              { t('cms.billing.tarnsfer.table.filiter.search.btn') }
            </Button>
            <button onClick={ this.handleShowMoreBtn } className="receive__filter__btn-more">
              { t(`cms.billing.tarnsfer.table.filiter.${this.state.showMore ? 'more' : 'less'}.btn`) }
              <Icon type={ this.state.showMore ? 'down' : 'up' } className="receive__filter__btn-icon" />
            </button>
          </div>
        </Form>
      </div>
    );
  }
}

TransferFilter.propTypes = {
  t: PropTypes.func.isRequired,
  filters: PropTypes.object,
  form: PropTypes.object,
  searchLandlordList: PropTypes.func.isRequired,
  searchPropertyList: PropTypes.func.isRequired,
  pushState: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
};

TransferFilter.defaultProps = {
  t: () => {},
  filters: {},
  form: {},
  searchLandlordList: () => {},
  searchPropertyList: () => {},
  pushState: () => {},
  history: {
    push: () => {},
  },
};

export default Form.create()(TransferFilter);
