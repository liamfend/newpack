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

    this.method = ['ALL', 'OFFLINE_BILLING', 'SYS_AUTO_COLLECTED'];
    this.status = ['ALL', 'NEW', 'PENDING_INVOICE', 'INVOICED', 'PAID'];
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
            receivableMethod: values.receivableMethod.toLowerCase() !== 'all' ?
              values.receivableMethod : null,
            status: values.status.toLowerCase() !== 'all' ? values.status : null,
            referenceId: values.referenceId || null,
            invoicedAtStart: values.invoiceDate[0] ?
              moment(values.invoiceDate[0]).format('YYYY-MM-DD') : null,
            invoicedAtEnd: values.invoiceDate[1] ?
              moment(values.invoiceDate[1]).format('YYYY-MM-DD') : null,
            paidAtStart: values.paidDate[0] ?
              moment(values.paidDate[0]).format('YYYY-MM-DD') : null,
            paidAtEnd: values.paidDate[1] ?
              moment(values.paidDate[1]).format('YYYY-MM-DD') : null,
            invoiceNumber: values.invoiceNumber || null,
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
      <div className="receive__filter">
        <Form
          className={ classNames('receive__filter__form', {
            'receive__filter__form--more': !this.state.showMore,
          }) }
        >
          <Row gutter={ 24 }>
            <Col span={ 8 }>
              <Form.Item
                className="receive__filter__item"
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
                className="receive__filter__item"
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
              className={ classNames('', { 'receive__filter__col--hidden': this.state.showMore }) }
            >
              <Form.Item
                className="receive__filter__item"
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
            className={ classNames('', { 'receive__filter__row--hidden': this.state.showMore }) }
          >
            <Col span={ 8 }>
              <Form.Item
                className="receive__filter__item"
                label={ t('cms.billing.receive.table.filiter.method.lable') }
              >
                { getFieldDecorator('receivableMethod', {
                  initialValue: this.props.filters.receivableMethod || 'ALL',
                })(
                  <Select>
                    <For of={ this.method } each="type">
                      <Select.Option value={ type } key={ type } >
                        { t(`cms.billing.receive.table.method.${type.toLowerCase()}`) }
                      </Select.Option>
                    </For>
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 }>
              <Form.Item
                className="receive__filter__item"
                label={ t('cms.billing.receive.table.filiter.status.lable') }
              >
                { getFieldDecorator('status', {
                  initialValue: this.props.filters.status || 'ALL',
                })(
                  <Select>
                    <For of={ this.status } each="type">
                      <Select.Option value={ type } key={ type } >
                        { t(`cms.billing.receive.table.receive_status.${type.toLowerCase()}`) }
                      </Select.Option>
                    </For>
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 }>
              <Form.Item
                className="receive__filter__item"
                label={ t('cms.billing.receive.table.filiter.receivables_number.lable') }
              >
                { getFieldDecorator('referenceId', {
                  initialValue: this.props.filters.referenceId || null,
                })(
                  <Input placeholder={ t('cms.billing.receive.table.filiter.receivables_number.placeholder') } />,
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row
            gutter={ 24 }
            className={ classNames('', { 'receive__filter__row--hidden': this.state.showMore }) }
          >
            <Col span={ 8 }>
              <Form.Item
                className="receive__filter__item"
                label={ t('cms.billing.receive.table.filiter.invoice_date.lable') }
              >
                { getFieldDecorator('invoiceDate', {
                  initialValue: [this.props.filters.invoicedAtStart,
                    this.props.filters.invoicedAtEnd],
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
                className="receive__filter__item"
                label={ t('cms.billing.receive.table.filiter.paid_date.lable') }
              >
                { getFieldDecorator('paidDate', {
                  initialValue: [this.props.filters.paidAtStart, this.props.filters.paidAtEnd],
                })(
                  <DatePicker.RangePicker
                    format={ dateFormat }
                    onChange={ () => {} }
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 } >
              <Form.Item
                className="receive__filter__item"
                label={ t('cms.billing.receive.table.filiter.invoice_number.lable') }
              >
                { getFieldDecorator('invoiceNumber', {
                  initialValue: this.props.filters.invoiceNumber || null,
                })(
                  <Input
                    placeholder={ t('cms.billing.receive.table.filiter.invoice_number.placeholder') }
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
          <div
            className={ classNames('receive__filter__btns', {
              'receive__filter__btns--more': !this.state.showMore,
            }) }
          >
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
