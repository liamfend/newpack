import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Breadcrumb } from 'antd';
import * as actions from '~actions/billing';
import generatePath from '~settings/routing';
import queryString from 'query-string';
import update from 'immutability-helper';
import TransferTable from '~pages/dashboard/billing/transfer/table';
import TransferFiliter from '~pages/dashboard/billing/transfer/filiter';
import { mergeSearchParams } from '~helpers/history';

const mapStateToProps = state => ({
  list: state.dashboard.billing.get('transferList').toJS(),
  communication: state.dashboard.billing.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  listOrderTransfers: (filters) => {
    dispatch(actions.listOrderTransfers(filters));
  },
  searchLandlordList: (value, successCallback) => {
    dispatch(actions.searchLandlordList(value, successCallback));
  },
  searchPropertyList: (value, successCallback) => {
    dispatch(actions.searchPropertyList(value, successCallback));
  },
  updateOrderTransferStatus: (params, successCallback) => {
    dispatch(actions.updateOrderTransferStatus(params, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class Transfer extends React.Component {
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

      this.props.history.push(generatePath('billing.transfers', {}, params));
      this.setFilters(params);
    } else {
      this.props.history.push({});
    }
    this.props.listOrderTransfers(params);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.location.search !== this.props.location.search &&
      this.props.location.search.indexOf('cardSearchStatus') === -1
    ) {
      const searchDate = queryString.parse(nextProps.location.search);
      const filters = this.formatFilters(searchDate);

      this.props.listOrderTransfers(filters || {});
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
      transferType: filters.transferType || null,
      PlanningTransferDatetimeEnd: filters.PlanningTransferDatetimeEnd || null,
      PlanningTransferDatetimeStart: filters.PlanningTransferDatetimeStart || null,
      ActualTransferDatetimeEnd: filters.ActualTransferDatetimeEnd || null,
      ActualTransferDatetimeStart: filters.ActualTransferDatetimeStart || null,
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

  updateOrderTransferStatus = (id, transactionNo, onSuccess = () => {}) => {
    const data = { id };
    if (transactionNo) {
      data.transactionNo = transactionNo;
    }

    this.props.updateOrderTransferStatus(data, () => {
      onSuccess();
      this.props.listOrderTransfers(this.state.filters);
    });
  }

  render() {
    const { t } = this.props;

    return (
      <div className="transfer">
        <div className="transfer__header">
          <div className="transfer__bread-crumb">
            <Breadcrumb>
              <Breadcrumb.Item>
                <a
                  className="transfer__bread-crumb-text"
                  href={ generatePath('billing', {}) }
                >
                  { t('cms.billing.tarnsfer.header.menu_link.billing') }
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span className="transfer__bread-crumb-text">
                  { t('cms.billing.tarnsfer.header.menu_link.transfer') }
                </span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <h2 className="transfer__title">
            { t('cms.billing.tarnsfer.header.title') }
          </h2>
        </div>
        <div className="transfer__content">
          <TransferFiliter
            t={ t }
            filters={ this.state.filters }
            pushState={ this.pushState }
            searchLandlordList={ this.props.searchLandlordList }
            searchPropertyList={ this.props.searchPropertyList }
            history={ this.props.history }
          />
          <TransferTable
            t={ t }
            list={ this.props.list }
            history={ this.props.history }
            communication={ this.props.communication }
            filters={ this.state.filters }
            handlePaginationChange={ this.handlePaginationChange }
            handlePageSizeChange={ this.handlePageSizeChange }
            updateOrderTransferStatus={ this.updateOrderTransferStatus }
          />
        </div>
      </div>
    );
  }
}

Transfer.propTypes = {
  t: PropTypes.func.isRequired,
  listOrderTransfers: PropTypes.func,
  list: PropTypes.object,
  communication: PropTypes.shape({
    transferList: PropTypes.object,
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  searchLandlordList: PropTypes.func.isRequired,
  searchPropertyList: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  updateOrderTransferStatus: PropTypes.func.isRequired,
};

Transfer.defaultProps = {
  t: () => {},
  listOrderTransfers: () => {},
  list: {},
  communication: {
    transferList: {},
  },
  history: {
    push: () => {},
  },
  searchLandlordList: () => {},
  searchPropertyList: () => {},
  location: {
    search: '',
  },
  updateOrderTransferStatus: () => {},
};
