import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { Form, Button, Input, Row, Col, Select, DatePicker, Icon, AutoComplete } from 'antd';

class RefundFilter extends React.Component {
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

    this.refundType = ['ALL', 'DEPOSIT', 'FIRST_RENTAL'];
    this.status = ['ALL', 'NEW', 'PENDING_REFUND', 'REFUND_CONFIRMATION', 'REFUNDED'];
    this.refundFrom = ['ALL', 'ACCOMMODATION_PARTNER', 'STCOM'];
    this.refundTo = ['ALL', 'TENANT', 'STCOM'];
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
            refundType: values.refundType.toLowerCase() !== 'all' ?
              values.refundType : null,
            status: values.status.toLowerCase() !== 'all' ? values.status : null,
            refundId: values.refundId || null,
            refundFrom: values.refundFrom.toLowerCase() !== 'all' ? values.refundFrom : null,
            refundTo: values.refundTo.toLowerCase() !== 'all' ? values.refundTo : null,
            refundedAtStart: values.refundDate[0] ?
              moment(values.refundDate[0]).format('YYYY-MM-DD') : null,
            refundedAtEnd: values.refundDate[1] ?
              moment(values.refundDate[1]).format('YYYY-MM-DD') : null,
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
      <div className="refund__filter">
        <Form
          className={ classNames('refund__filter__form', {
            'refund__filter__form--more': !this.state.showMore,
          }) }
        >
          <Row gutter={ 24 }>
            <Col span={ 8 }>
              <Form.Item
                className="refund__filter__item"
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
                className="refund__filter__item"
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
              className={ classNames('', { 'refund__filter__col--hidden': this.state.showMore }) }
            >
              <Form.Item
                className="refund__filter__item"
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
            className={ classNames('', { 'refund__filter__row--hidden': this.state.showMore }) }
          >
            <Col span={ 8 }>
              <Form.Item
                className="refund__filter__item"
                label={ t('cms.billing.refund.table.filiter.refund_type.lable') }
              >
                { getFieldDecorator('refundType', {
                  initialValue: this.props.filters.refundType || 'ALL',
                })(
                  <Select>
                    <For of={ this.refundType } each="type">
                      <Select.Option value={ type } key={ type } >
                        { t(`cms.billing.refund.table.refund_type.${type.toLowerCase()}`) }
                      </Select.Option>
                    </For>
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 }>
              <Form.Item
                className="refund__filter__item"
                label={ t('cms.billing.refund.table.filiter.status.lable') }
              >
                { getFieldDecorator('status', {
                  initialValue: this.props.filters.status || 'ALL',
                })(
                  <Select>
                    <For of={ this.status } each="type">
                      <Select.Option value={ type } key={ type } >
                        { t(`cms.billing.refund.table.refund_status.${type.toLowerCase()}`) }
                      </Select.Option>
                    </For>
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 }>
              <Form.Item
                className="refund__filter__item"
                label={ t('cms.billing.refund.table.filiter.refund_number.lable') }
              >
                { getFieldDecorator('refundId', {
                  initialValue: this.props.filters.refundId || null,
                })(
                  <Input placeholder={ t('cms.billing.refund.table.filiter.refund_number.placeholder') } />,
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row
            gutter={ 24 }
            className={ classNames('', { 'refund__filter__row--hidden': this.state.showMore }) }
          >
            <Col span={ 8 }>
              <Form.Item
                className="refund__filter__item"
                label={ t('cms.billing.refund.table.filiter.refund_from.lable') }
              >
                { getFieldDecorator('refundFrom', {
                  initialValue: this.props.filters.refundFrom || 'ALL',
                })(
                  <Select>
                    <For of={ this.refundFrom } each="type">
                      <Select.Option value={ type } key={ type } >
                        { t(`cms.billing.refund.table.refund_from.${type.toLowerCase()}`) }
                      </Select.Option>
                    </For>
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 } >
              <Form.Item
                className="refund__filter__item"
                label={ t('cms.billing.refund.table.filiter.refund_to.lable') }
              >
                { getFieldDecorator('refundTo', {
                  initialValue: this.props.filters.refundTo || 'ALL',
                })(
                  <Select>
                    <For of={ this.refundTo } each="type">
                      <Select.Option value={ type } key={ type } >
                        { t(`cms.billing.refund.table.refund_to.${type.toLowerCase()}`) }
                      </Select.Option>
                    </For>
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={ 8 }>
              <Form.Item
                className="refund__filter__item"
                label={ t('cms.billing.refund.table.filiter.refund_date.lable') }
              >
                { getFieldDecorator('refundDate', {
                  initialValue: [this.props.filters.refundedAtStart,
                    this.props.filters.refundedAtEnd],
                })(
                  <DatePicker.RangePicker
                    format={ dateFormat }
                    onChange={ () => {} }
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
          <div
            className={ classNames('refund__filter__btns', {
              'refund__filter__btns--more': !this.state.showMore,
            }) }
          >
            <Button onClick={ this.handleResetBtn }>
              { t('cms.billing.tarnsfer.table.filiter.reset.btn') }
            </Button>
            <Button
              onClick={ this.handleFiliter }
              type="primary"
              style={ { margin: '0 12px' } }
              htmlType="submit"
            >
              { t('cms.billing.tarnsfer.table.filiter.search.btn') }
            </Button>
            <button onClick={ this.handleShowMoreBtn } className="refund__filter__btn-more">
              { t(`cms.billing.tarnsfer.table.filiter.${this.state.showMore ? 'more' : 'less'}.btn`) }
              <Icon type={ this.state.showMore ? 'down' : 'up' } className="refund__filter__btn-icon" />
            </button>
          </div>
        </Form>
      </div>
    );
  }
}

RefundFilter.propTypes = {
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

RefundFilter.defaultProps = {
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

export default Form.create()(RefundFilter);
