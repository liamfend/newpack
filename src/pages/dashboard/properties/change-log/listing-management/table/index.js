import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import { Table, Drawer } from 'antd';
import { communicationStatus, sortDirectionMapping } from '~constants';
import { changeLogSections } from '~constants/change-log';
import DetailModal from '~pages/dashboard/properties/change-log/listing-management/detail-modal';

export default class LogList extends React.Component {
  constructor() {
    super();
    this.state = {
      isOpenDetailDrawer: false,
      activeChangeLogId: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.showFilterModal && nextProps.showFilterModal) {
      this.setState({
        isOpenDetailDrawer: false,
        activeChangeLogId: '',
      });
    }
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.handleCloseDetailDrawer();
    this.props.setFilters({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sortDirection: sorter.order ? sortDirectionMapping[sorter.order] : null,
    });
  };

  getTableColumns = () => {
    const { t, filters } = this.props;
    return [
      {
        title: t('cms.change_log.log_date.table.header'),
        dataIndex: 'logDate',
        key: 'logDate',
        sorter: true,
        sortOrder: sortDirectionMapping[filters.sortDirection] || false,
        render: logDate => (logDate ? moment(logDate).format('DD/MM/YY HH:mm') : '-'),
      },
      {
        title: t('cms.change_log.account_name.table.header'),
        dataIndex: 'accountName',
        key: 'accountName',
        render: accountName => `${accountName && accountName.firstName} ${accountName && accountName.lastName}`,
      },
      {
        title: t('cms.change_log.log_section.table.header'),
        dataIndex: 'logSection',
        key: 'logSection',
        render: logSection => t(`cms.change_log.log_section.${changeLogSections[logSection]}`),
      },
      {
        title: t('cms.change_log.entry_type.table.header'),
        dataIndex: 'entryType',
        key: 'entryType',
        render: entryType => t(`cms.change_log.entry_type.${entryType.toLocaleLowerCase()}`),
      },
    ];
  }

  handleClickLog = (record) => {
    this.setState({
      isOpenDetailDrawer: true,
      activeChangeLogId: record.id,
    });
    this.props.setActiveChangeLog(record);
  };

  handleCloseDetailDrawer = () => {
    this.setState({
      isOpenDetailDrawer: false,
      activeChangeLogId: '',
    });
  };

  render() {
    return (
      <div className="change-log-table">
        <Table
          rowKey="id"
          tableLayout="fixed"
          scroll={ { y: `calc(100vh - ${this.props.applyFilters.length > 0 ? '384' : '326'}px)` } }
          columns={ this.getTableColumns() }
          className={ classNames('change-log-table__table', {
            'change-log-table__table--with-filter': this.props.applyFilters.length > 0,
          }) }
          dataSource={ this.props.changeLogs }
          pagination={ {
            current: this.props.filters.pageNumber,
            pageSize: this.props.filters.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30', '40', '50'],
            showQuickJumper: true,
            total: this.props.totalCount,
          } }
          loading={ this.props.getChangeLogsStatus === communicationStatus.FETCHING }
          onChange={ this.handleTableChange }
          onRow={ record => ({
            onClick: () => this.handleClickLog(record), // click row
          }) }
          rowClassName={ (record) => {
            if (record.id === this.state.activeChangeLogId) {
              return 'change-log-table__active-log-row';
            }
            return '';
          } }
        />
        <Drawer
          mask={ false }
          placement="right"
          visible={ this.state.isOpenDetailDrawer }
          closable={ false }
          destroyOnClose
          width="740px"
          getContainer={ false }
          style={ { position: 'absolute' } }
        >
          <DetailModal
            activeChangeLog={ this.props.activeChangeLog }
            t={ this.props.t }
            onClose={ this.handleCloseDetailDrawer }
          />
        </Drawer>
      </div>
    );
  }
}

LogList.propTypes = {
  t: PropTypes.func.isRequired,
  changeLogs: PropTypes.array,
  getChangeLogsStatus: PropTypes.string,
  filters: PropTypes.shape({
    pageNumber: PropTypes.number,
    pageSize: PropTypes.number,
    sortDirection: PropTypes.string,
  }),
  setFilters: PropTypes.func.isRequired,
  totalCount: PropTypes.number,
  setActiveChangeLog: PropTypes.func.isRequired,
  activeChangeLog: PropTypes.object,
  applyFilters: PropTypes.array,
  showFilterModal: PropTypes.bool,
};

LogList.defaultProps = {
  t: () => {},
  changeLogs: [],
  getChangeLogsStatus: '',
  filters: {
    pageNumber: 1,
    pageSize: 50,
    sortDirection: '',
  },
  setFilters: () => {},
  totalCount: 0,
  setActiveChangeLog: () => {},
  activeChangeLog: {},
  applyFilters: [],
  showFilterModal: false,
};
