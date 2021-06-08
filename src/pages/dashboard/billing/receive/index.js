import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Breadcrumb } from 'antd';
import * as actions from '~actions/billing';
import generatePath from '~settings/routing';
import queryString from 'query-string';
import update from 'immutability-helper';
import ReceiveTable from '~pages/dashboard/billing/receive/table';
import ReceiveFiliter from '~pages/dashboard/billing/receive/filiter';
import { mergeSearchParams } from '~helpers/history';

const mapStateToProps = state => ({
  list: state.dashboard.billing.get('receiveList').toJS(),
  communication: state.dashboard.billing.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  listOrderReceivables: (filters) => {
    dispatch(actions.listOrderReceivables(filters));
  },
  searchLandlordList: (value, successCallback) => {
    dispatch(actions.searchLandlordList(value, successCallback));
  },
  searchPropertyList: (value, successCallback) => {
    dispatch(actions.searchPropertyList(value, successCallback));
  },
  updateOrderReceivable: (data, successCallback) => {
    dispatch(actions.updateOrderReceivable(data, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class Receive extends React.Component {
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

      this.props.history.push(generatePath('billing.receivables', {}, params));
      this.setFilters(params);
    } else {
      this.props.history.push({});
    }
    this.props.listOrderReceivables(params);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.location.search !== this.props.location.search &&
      this.props.location.search.indexOf('cardSearchStatus') === -1
    ) {
      const searchDate = queryString.parse(nextProps.location.search);
      const filters = this.formatFilters(searchDate);

      this.props.listOrderReceivables(filters || {});
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
      receivableMethod: filters.receivableMethod || null,
      status: filters.status || null,
      referenceId: filters.referenceId || null,
      invoicedAtStart: filters.invoicedAtStart || null,
      invoicedAtEnd: filters.invoicedAtEnd || null,
      paidAtStart: filters.paidAtStart || null,
      paidAtEnd: filters.paidAtEnd || null,
      invoiceNumber: filters.invoiceNumber || null,
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

  pushState = (data) => {
    this.props.history.push(mergeSearchParams(data, this.defaultSearchParams));
  };

  handelPendingReceivables = (data, onSuccess = () => {}) => {
    this.props.updateOrderReceivable(data, () => {
      this.props.listOrderReceivables(this.state.filters);
      onSuccess();
    });
  }

  render() {
    const { t } = this.props;

    return (
      <div className="receive">
        <div className="receive__header">
          <div className="receive__bread-crumb">
            <Breadcrumb>
              <Breadcrumb.Item>
                <a
                  className="receive__bread-crumb-text"
                  href={ generatePath('billing', {}) }
                >
                  { t('cms.billing.tarnsfer.header.menu_link.billing') }
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span className="receive__bread-crumb-text">
                  { t('cms.billing.tarnsfer.header.menu_link.receivable') }
                </span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h2 className="receive__title">
            { t('cms.billing.tarnsfer.header.menu_link.receivable') }
          </h2>
        </div>
        <div className="receive__content">
          <ReceiveFiliter
            t={ t }
            filters={ this.state.filters }
            pushState={ this.pushState }
            history={ this.props.history }
            searchLandlordList={ this.props.searchLandlordList }
            searchPropertyList={ this.props.searchPropertyList }
          />
          <ReceiveTable
            t={ t }
            list={ this.props.list }
            history={ this.props.history }
            communication={ this.props.communication }
            filters={ this.state.filters }
            handlePaginationChange={ this.handlePaginationChange }
            handlePageSizeChange={ this.handlePageSizeChange }
            pendingReceivables={ this.handelPendingReceivables }
          />
        </div>
      </div>
    );
  }
}

Receive.propTypes = {
  t: PropTypes.func.isRequired,
  listOrderReceivables: PropTypes.func,
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
  updateOrderReceivable: PropTypes.func.isRequired,
};

Receive.defaultProps = {
  t: () => {},
  listOrderReceivables: () => {},
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
  updateOrderReceivable: () => {},
};
