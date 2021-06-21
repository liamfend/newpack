import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Breadcrumb } from 'antd';
import * as actions from '~actions/billing';
import generatePath from '~settings/routing';
import queryString from 'query-string';
import update from 'immutability-helper';
import { mergeSearchParams } from '~helpers/history';
import RefundTable from '~pages/dashboard/billing/refund/table';
import RefundFiliter from '~pages/dashboard/billing/refund/filiter';

const mapStateToProps = state => ({
  list: state.dashboard.billing.get('refundList').toJS(),
  communication: state.dashboard.billing.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  listOrderRefunds: (filters) => {
    dispatch(actions.listOrderRefunds(filters));
  },
  searchLandlordList: (value, successCallback) => {
    dispatch(actions.searchLandlordList(value, successCallback));
  },
  searchPropertyList: (value, successCallback) => {
    dispatch(actions.searchPropertyList(value, successCallback));
  },
  financialRefund: (params, successCallback) => {
    dispatch(actions.financialRefund(params, successCallback));
  },
  refundConfirm: (params, successCallback) => {
    dispatch(actions.refundConfirm(params, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class Refund extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSearchParams = {
      pageNumber: 1,
      pageSize: 10,
    };

    this.state = {
      filters: this.formatFilters({}),
    };
  }

  componentDidMount() {
    const params = {};
    const searchDate = queryString.parse(this.props.location.search);

    if (searchDate && searchDate.cardSearchStatus) {
      params.status = searchDate.cardSearchStatus;

      this.props.history.push(generatePath('billing.refunds', {}, params));
      this.setFilters(params);
    } else {
      this.props.history.push({});
    }
    this.props.listOrderRefunds(params);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.location.search !== this.props.location.search &&
      this.props.location.search.indexOf('cardSearchStatus') === -1
    ) {
      const searchDate = queryString.parse(nextProps.location.search);
      const filters = this.formatFilters(searchDate);

      this.props.listOrderRefunds(filters || {});
      this.setFilters(filters);
    }
  }

  formatFilters = (filters) => {
    const newFilter = filters;
    if (
      newFilter && newFilter.stages
      && typeof newFilter.stages === 'string'
    ) {
      newFilter.stages = [newFilter.stages];
    }

    return {
      pageNumber: Number(filters.pageNumber) || 1,
      pageSize: Number(filters.pageSize) || 10,
      landlordSlug: filters.landlordSlug || null,
      propertySlug: filters.propertySlug || null,
      orderReferenceId: filters.orderReferenceId || null,
      refundType: filters.refundType || null,
      status: filters.status || null,
      refundId: filters.refundId || null,
      refundFrom: filters.refundFrom || null,
      refundTo: filters.refundTo || null,
      refundedAtStart: filters.refundedAtStart || null,
      refundedAtEnd: filters.refundedAtEnd || null,
    };
  };

  setFilters = (value) => {
    this.setState({
      filters: update(this.state.filters, { $set: value }),
    });
  }

  handlePaginationChange = (number) => {
    if (number && number !== this.state.filters.pageNumber) {
      const params = { pageNumber: number };
      this.pushState(params);
    }
  };

  handlePageSizeChange = (current, size) => {
    if (current !== size) {
      const params = { pageNumber: 1, pageSize: size };
      this.pushState(params);
    }
  };

  handleSearchBtn = () => {
    const searchDate = queryString.parse(this.props.location.search);
    const filters = this.formatFilters(searchDate);

    this.props.listOrderRefunds(filters || {});
    this.setFilters(filters);
  }

  pushState = (filters) => {
    this.props.history.push(mergeSearchParams(filters, this.defaultSearchParams));
  };

  updateRefundStatus = (type, refundId) => {
    const data = { id: refundId };
    if (type === 'refunded') {
      this.props.financialRefund(data, () => {
        this.props.listOrderRefunds(this.state.filters);
      });
    } else {
      this.props.refundConfirm(data, () => {
        this.props.listOrderRefunds(this.state.filters);
      });
    }
  }

  render() {
    const { t, list } = this.props;

    return (
      <div className="refund">
        <div className="refund__header">
          <div className="refund__bread-crumb">
            <Breadcrumb>
              <Breadcrumb.Item>
                <a
                  className="refund__bread-crumb-text"
                  href={ generatePath('billing', {}) }
                >
                  { t('cms.billing.tarnsfer.header.menu_link.billing') }
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span className="refund__bread-crumb-text">
                  { t('cms.billing.tarnsfer.header.menu_link.refund') }
                </span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h2 className="refund__title">
            { t('cms.billing.refund.header.title') }
          </h2>
        </div>
        <div className="refund__content">
          <RefundFiliter
            t={ t }
            filters={ this.state.filters }
            pushState={ this.pushState }
            history={ this.props.history }
            searchLandlordList={ this.props.searchLandlordList }
            searchPropertyList={ this.props.searchPropertyList }
          />
          <RefundTable
            t={ t }
            list={ list }
            history={ this.props.history }
            communication={ this.props.communication }
            filters={ this.state.filters }
            handlePaginationChange={ this.handlePaginationChange }
            handlePageSizeChange={ this.handlePageSizeChange }
            updateRefundStatus={ this.updateRefundStatus }
          />
        </div>
      </div>
    );
  }
}

Refund.propTypes = {
  t: PropTypes.func.isRequired,
  listOrderRefunds: PropTypes.func,
  list: PropTypes.object,
  communication: PropTypes.shape({
    receiveList: PropTypes.object,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  searchLandlordList: PropTypes.func.isRequired,
  searchPropertyList: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  financialRefund: PropTypes.func.isRequired,
  refundConfirm: PropTypes.func.isRequired,
};

Refund.defaultProps = {
  t: () => {},
  listOrderRefunds: () => {},
  list: {},
  communication: {
    receiveList: {},
  },
  history: {
    push: () => {},
  },
  searchLandlordList: () => {},
  searchPropertyList: () => {},
  location: {
    search: '',
  },
  financialRefund: () => {},
  refundConfirm: () => {},
};
