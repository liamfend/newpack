import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import queryString from 'query-string';
import { Table, Pagination, Spin, DatePicker, Icon, Radio, Button, Tooltip } from 'antd';
import { BulkHistory as BulkHistoryIcon, TemplateDownload as TemplateDownloadIcon } from "~components/svgs";
import authControl from '~components/auth-control';
import { communicationStatus, platformEntity, entityAction } from '~constants';
import generatePath from '~settings/routing';
import * as reconciliationActions from '~actions/reconciliation';
import * as landlordActions from '~actions/landlord';
import { mergeSearchParams } from '~helpers/history';
import SearchComponent from '~components/search-component';
import BulkUpdate from '~pages/dashboard/reconciliation/bulk-update';
import BulkHistory from '~pages/dashboard/reconciliation/bulk-history';
import { billingCountries } from '~constants/billing-country';
import { downloadExcelFile } from '~pages/dashboard/reconciliation/utils';

const mapStateToProps = state => ({
  reconciliations: state.dashboard.reconciliation.toJS().reconciliationLandlordsList.payload,
  totalCount: state.dashboard.reconciliation.toJS().reconciliationLandlordsList.totalCount,
  status: state.dashboard.reconciliation.toJS().communication.reconciliationLandlordsList.status,
});

const mapDispatchToProps = dispatch => ({
  listReconciliationLandlords: (params) => {
    dispatch(reconciliationActions.listReconciliationLandlords(params));
  },
  searchLandlordList: (successCallback) => {
    dispatch(landlordActions.searchLandlordList(successCallback));
  },
});
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(platformEntity.BOOKINGS_OPPORTUNITIES, entityAction.READ)
export default class Reconciliation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {
        pageSize: 20,
        pageNumber: 1,
        landlordIds: [],
        billingCountry: [],
        completedAtEnd: moment().endOf('month').format('YYYY-MM-DDTHH:mm:ssZ'),
        completedAtStart: moment().startOf('year').format('YYYY-MM-DDTHH:mm:ssZ'),
        reconciliationOption: null,
      },
      visibility: {
        landlordName: false,
        billingCountry: false,
        reconciliationOption: false,
      },
      landlordsList: [],
      showBulkUpdate: false,
      showBulkHistory: false,
    };
  }

  componentDidMount() {
    const searchParams = queryString.parse(this.props.location.search);

    if (searchParams.landlordIds && typeof searchParams.landlordIds === 'string') {
      searchParams.landlordIds = [searchParams.landlordIds];
    }
    if (searchParams.billingCountry && typeof searchParams.billingCountry === 'string') {
      searchParams.billingCountry = [searchParams.billingCountry];
    }
    this.handleSetFilters(searchParams);
    this.props.searchLandlordList((res) => {
      this.setState({ landlordsList: res.search.edges.map(landlord => landlord.node) });
    });
  }

  getTableColumns = () => {
    const { t } = this.props;
    const { filters, landlordsList } = this.state;
    return [
      {
        title: t('cms.reconciliation.table.title.partner_name'),
        key: 'name',
        className: 'reconciliation__column',
        render: (text, record) => (record.landlord ? record.landlord.name : ''),
        width: '25%',
        filterDropdown: (
          <div>
            <label ref={ (node) => { this.landlordNameTargetNode = node; } } />
            <SearchComponent
              t={ t }
              targetInput={ this.landlordNameTargetNode }
              options={ landlordsList }
              onBlur={ (value) => {
                this.handleSetFilters({
                  landlordIds: value.value.map(landlord => landlord.id),
                  pageNumber: 1,
                });
              } }
              keyValue="id"
              showSelectAll={ false }
              selectList={ filters.landlordIds }
            />
          </div>
        ),
        filterIcon: (
          <Icon
            type="search"
            style={ { color: filters.landlordIds.length > 0 ? '#38b2a6' : '#c8c9cb' } }
          />
        ),
        filterDropdownVisible: this.state.visibility.landlordName,
        onFilterDropdownVisibleChange: (view) => {
          if (view && this.landlordNameTargetNode) {
            setTimeout(() => {
              this.landlordNameTargetNode.click();
            }, 0);
          }
          this.setState({
            visibility: Object.assign(this.state.visibility, { landlordName: view }),
          });
        },
      },
      {
        title: t('cms.reconciliation.table.title.billing_country'),
        key: 'country',
        className: 'reconciliation__column',
        render: (text, record) => (record.landlord ? record.landlord.billingCountry : ''),
        width: '15%',
        filterDropdown: (
          <div>
            <label ref={ (node) => { this.billingCountryTargetNode = node; } } />
            <SearchComponent
              t={ t }
              targetInput={ this.billingCountryTargetNode }
              options={ billingCountries.map(country => ({ name: country })) }
              onBlur={ (value) => {
                this.handleSetFilters({
                  billingCountry: value.value.map(country => country.name),
                  pageNumber: 1,
                });
              } }
              keyValue="name"
              showSelectAll={ false }
              selectList={ filters.billingCountry }
            />
          </div>
        ),
        filterIcon: (
          <Icon
            type="filter"
            theme="filled"
            style={ { color: filters.billingCountry.length > 0 ? '#38b2a6' : '#c8c9cb' } }
          />
        ),
        filterDropdownVisible: this.state.visibility.billingCountry,
        onFilterDropdownVisibleChange: (view) => {
          if (view && this.billingCountryTargetNode) {
            setTimeout(() => {
              this.billingCountryTargetNode.click();
            }, 0);
          }
          this.setState({
            visibility: Object.assign(this.state.visibility, { billingCountry: view }),
          });
        },
      },
      {
        title: t('cms.reconciliation.table.title.billing_city'),
        key: 'city',
        className: 'reconciliation__column',
        render: (text, record) => (record.landlord ? record.landlord.billingCity : ''),
        width: '15%',
      },
      {
        title: t('cms.reconciliation.table.title.reconciliation_option'),
        key: 'reconciliationOption',
        className: 'reconciliation__column',
        render: (text, record) => (record.landlord && record.landlord.reconciliationOption ?
          t(`cms.reconciliation.table.label.${record.landlord.reconciliationOption.toLowerCase()}`) : ''),
        width: '15%',
        filterDropdown: (
          <div>
            <label ref={ (node) => { this.reconciliationOptionTargetNode = node; } } />
            <Radio.Group
              onChange={ this.handleReconciliationOptionChange }
              value={ this.state.filters.reconciliationOption }
            >
              <For
                of={ ['BOOKING_COMPLETED', 'STUDENT_CHECK_IN', 'STUDENT_CHECK_OUT'] }
                each="option"
                index="key"
              >
                <Radio
                  value={ option }
                  key={ key }
                  style={ {
                    display: 'block',
                    padding: '0 16px',
                    height: '30px',
                    lineHeight: '30px',
                  } }
                >
                  {t(`cms.reconciliation.table.label.${option.toLowerCase()}`)}
                </Radio>
              </For>
            </Radio.Group>
            <div className="reconciliation__filter-reset-footer" >
              <button
                className="reconciliation__filter-reset-btn"
                onClick={ this.handleReconciliationOptionReset }
              >
                {t('cms.reconciliation.table.filiter.reset.btn')}
              </button>
            </div>
          </div>
        ),
        filterIcon: (
          <Icon
            type="filter"
            theme="filled"
            style={ { color: filters.reconciliationOption != null ? '#38b2a6' : '#c8c9cb' } }
          />
        ),
        filterDropdownVisible: this.state.visibility.reconciliationOption,
        onFilterDropdownVisibleChange: (view) => {
          if (view && this.reconciliationOptionTargetNode) {
            setTimeout(() => {
              this.reconciliationOptionTargetNode.click();
            }, 0);
          } else if (!view && this.reconciliationOptionTargetNode) {
            this.handleSetFilters({
              reconciliationOption: this.state.filters.reconciliationOption,
            });
          }
          this.setState({
            visibility: Object.assign(this.state.visibility, { reconciliationOption: view }),
          });
        },
      },
      {
        title: t('cms.reconciliation.table.title.total_booking_number'),
        key: 'totalBookingNumber',
        className: 'reconciliation__column',
        dataIndex: 'totalBookingNumber',
      },
      {
        title: t('cms.reconciliation.table.title.approved_booking_number'),
        key: 'approveedBookingNumber',
        className: 'reconciliation__column',
        dataIndex: 'approvedBookingNumber',
      },
    ];
  };

  onShowSizeChange = (current, pageSize) => {
    this.handleSetFilters({
      pageSize: Number(pageSize),
      pageNumber: 1,
    });
  };

  onRowClicked = (record) => {
    if (record && record.landlord && record.landlord.id) {
      this.props.history.push(generatePath('reconciliation.view', { id: record.landlord.id }));
    }
  };

  onPageNumberChange = (pageNumber) => {
    this.handleSetFilters({ pageNumber: Number(pageNumber) });
  }

  handleSetFilters = (filters, screenTop = false) => {
    const newfilters = Object.assign({}, this.state.filters, filters);
    if ((!moment(newfilters.completedAtStart).isValid() ||
      moment(newfilters.completedAtStart).isBefore(moment().subtract(1, 'year').startOf('year'))) || (
      !moment(newfilters.completedAtEnd).isValid() ||
        moment(newfilters.completedAtEnd).isBefore(moment().subtract(1, 'year').startOf('year'))
    )) {
      newfilters.completedAtStart = moment().startOf('year').format('YYYY-MM-DDTHH:mm:ssZ');
      newfilters.completedAtEnd = moment().endOf('month').format('YYYY-MM-DDTHH:mm:ssZ');
    }

    this.setState({ filters: newfilters }, () => {
      this.handleReloadListReconciliationLandlords(screenTop);
    });
  };

  handleReloadListReconciliationLandlords = (scroonTop = false) => {
    this.props.listReconciliationLandlords(this.state.filters);
    this.props.history.push(mergeSearchParams(this.state.filters, {
      pageSize: 20,
      pageNumber: 1,
      landlordIds: [],
      billingCountry: [],
      completedAtEnd: moment().endOf('month').format('YYYY-MM-DDTHH:mm:ssZ'),
      completedAtStart: moment().startOf('year').format('YYYY-MM-DDTHH:mm:ssZ'),
      reconciliationOption: null,
    }));

    if (scroonTop) {
      window.scrollTo(0, 0);
    }
  };

  indexDataSource = reconciliations => reconciliations.map((reconciliation, index) => ({
    ...reconciliation,
    index,
  }));

  handleDatePickerStartChange = (value) => {
    if (value) {
      this.state.filters.completedAtStart = value.startOf('month').format('YYYY-MM-DDTHH:mm:ssZ');
    } else {
      this.state.filters.completedAtStart = null;
    }
    this.setState(this.state, () => {
      if ((this.state.filters.completedAtStart && this.state.filters.completedAtEnd) ||
        (!this.state.filters.completedAtStart && !this.state.filters.completedAtEnd)) {
        this.handleSetFilters({});
      }
    });
  };

  handleDatePickerEndChange = (value) => {
    if (value) {
      this.state.filters.completedAtEnd = value.endOf('month').format('YYYY-MM-DDTHH:mm:ssZ');
    } else {
      this.state.filters.completedAtEnd = null;
    }
    this.setState(this.state, () => {
      if ((this.state.filters.completedAtStart && this.state.filters.completedAtEnd) ||
        (!this.state.filters.completedAtStart && !this.state.filters.completedAtEnd)) {
        this.handleSetFilters({});
      }
    });
  };

  handleDatePickerStartRanger = (currentDate) => {
    if (this.state.filters.completedAtEnd) {
      return moment(this.state.filters.completedAtEnd).subtract(12, 'months').isAfter(currentDate) ||
        moment(this.state.filters.completedAtEnd).isBefore(currentDate) ||
        moment(currentDate).isBefore(moment().subtract(1, 'year').startOf('year'));
    }
    return moment(currentDate).isBefore(moment().subtract(1, 'year').startOf('year'));
  };

  handleDatePickerEndRanger = (currentDate) => {
    if (this.state.filters.completedAtStart) {
      return moment(this.state.filters.completedAtStart).add(12, 'months').isBefore(currentDate) ||
        moment(this.state.filters.completedAtStart).isAfter(currentDate) ||
        moment(currentDate).isBefore(moment().subtract(1, 'year').startOf('year'));
    }
    return moment(currentDate).isBefore(moment().subtract(1, 'year').startOf('year'));
  };

  handleReconciliationOptionChange = (e) => {
    const { target } = e;
    if (target.value) {
      this.state.filters.reconciliationOption = target.value;
      this.setState(this.state);
    }
  };

  handleReconciliationOptionReset = () => {
    this.state.filters.reconciliationOption = null;
    this.setState(this.state);
  };

  handleBulkUpdate = () => {
    this.setState({ showBulkUpdate: true });
  };

  handleCloseBulkUpdate = () => {
    this.setState({ showBulkUpdate: false });
  };

  handleDownloadTemplate = () => {
    const DEFAULT_TEMPLATE_FILENAME = 'Bookings bulk update template final.xlsx';
    downloadExcelFile(DEFAULT_TEMPLATE_FILENAME);
  };

  handleBulkHistory = () => {
    this.setState({ showBulkHistory: true });
  };

  handleCloseBulkHistory = () => {
    this.setState({ showBulkHistory: false });
  };

  render() {
    const {
      t,
      status,
      totalCount,
      reconciliations,
    } = this.props;
    const { MonthPicker } = DatePicker;
    return (
      <div className="reconciliation">
        <div className="reconciliation__container">
          <Spin spinning={ status === communicationStatus.FETCHING }>
            <div className="reconciliation__header">
              <h1 className="reconciliation__title">{t('cms.reconciliation.list.title')}</h1>
              <div className="reconciliation__date-month-picker">
                <MonthPicker
                  value={ this.state.filters.completedAtStart ?
                    moment(this.state.filters.completedAtStart) : null }
                  placeholder={ t('cms.reconciliation.datepicker.placeholder.start_time') }
                  disabledDate={ this.handleDatePickerStartRanger }
                  format="MM/YYYY"
                  onChange={ this.handleDatePickerStartChange }
                  className="reconciliation__datepicker--start"
                  defaultPickerValue={ this.state.filters.completedAtEnd ?
                    moment(this.state.filters.completedAtEnd) : moment() }
                />
                <span className="reconciliation__separator">~</span>
                <MonthPicker
                  value={ this.state.filters.completedAtEnd ?
                    moment(this.state.filters.completedAtEnd) : null }
                  placeholder={ t('cms.reconciliation.datepicker.placeholder.end_time') }
                  disabledDate={ this.handleDatePickerEndRanger }
                  format="MM/YYYY"
                  onChange={ this.handleDatePickerEndChange }
                  className="reconciliation__datepicker--end"
                  defaultPickerValue={ this.state.filters.completedAtStart ?
                    moment(this.state.filters.completedAtStart) : moment() }
                />
              </div>

              <div className="reconciliation__btn-wrap">
                <Tooltip
                  placement="topLeft"
                  title={ t('cms.reconciliation.tooltip.bulk_update_history') }
                  arrowPointAtCenter
                >
                  <Button
                    className="reconciliation__icon-btn reconciliation__icon-btn--history"
                    onClick={ this.handleBulkHistory }
                  >
                    <BulkHistoryIcon className="reconciliation__icon-btn__icon" />
                  </Button>
                </Tooltip>
                <Tooltip
                  placement="topLeft"
                  title={ t('cms.reconciliation.tooltip.download_template') }
                  arrowPointAtCenter
                >
                  <Button
                    className="reconciliation__icon-btn reconciliation__icon-btn--download"
                    onClick={ this.handleDownloadTemplate }
                  >
                    <TemplateDownloadIcon className="reconciliation__icon-btn__icon" />
                  </Button>
                </Tooltip>
                <Button
                  className="reconciliation__bulk-update-btn"
                  type="primary"
                  onClick={ this.handleBulkUpdate }
                >
                  { t('cms.reconciliation.booking.bulk_update.button') }
                </Button>
              </div>
            </div>

            <div className="reconciliation__body">
              <label className="reconciliation__total-count">
                {t('cms.reconciliation.list.total_landlord', {
                  number: totalCount,
                })}
              </label>
              <Table
                className="reconciliation__table"
                dataSource={ this.indexDataSource(reconciliations) }
                columns={ this.getTableColumns() }
                pagination={ false }
                rowKey={ record => record.index }
                onRow={ record => ({
                  onClick: () => {
                    this.onRowClicked(record);
                  },
                }) }
              />
            </div>

            <div className="reconciliation__footer">
              <Pagination
                showSizeChanger
                onShowSizeChange={ this.onShowSizeChange }
                pageSizeOptions={ ['10', '20', '30', '40'] }
                total={ totalCount }
                pageSize={ Number(this.state.filters.pageSize) }
                current={ Number(this.state.filters.pageNumber) }
                onChange={ this.onPageNumberChange }
              />
            </div>
          </Spin>
        </div>
        <If condition={ this.state.showBulkUpdate }>
          <BulkUpdate
            cancel={ this.handleCloseBulkUpdate }
            openBulkHistory={ this.handleBulkHistory }
          />
        </If>
        <If condition={ this.state.showBulkHistory }>
          <BulkHistory
            cancel={ this.handleCloseBulkHistory }
          />
        </If>
      </div>
    );
  }
}

Reconciliation.propTypes = {
  t: PropTypes.func.isRequired,
  status: PropTypes.string,
  totalCount: PropTypes.number,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  reconciliations: PropTypes.array,
  listReconciliationLandlords: PropTypes.func,
  searchLandlordList: PropTypes.func,
};

Reconciliation.defaultProps = {
  t: () => {},
  reconciliations: [],
  listReconciliationLandlords: () => {},
  searchLandlordList: () => {},
  status: '',
  totalCount: 0,
};
