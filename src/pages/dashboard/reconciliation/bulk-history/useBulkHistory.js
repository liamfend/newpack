import React, { useState, useCallback, useEffect } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { toLower, kebabCase, trim } from 'lodash';
import i18next from 'i18next';
import { Icon, Input, Button, Checkbox, Tooltip } from 'antd';
import { downloadExcelFile } from '~pages/dashboard/reconciliation/utils';
import SearchCmsUser from '~components/search-cms-user';

const useBulkHistory = ({ getHistory }) => {
  const updateStatusList = ['NEW', 'IN_PROCESS', 'DONE'];
  const dateTemplate = 'DD/MM/YYYY HH:mm:ss';
  const activeFilterColor = '#38b2a6';
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
    originalFilename: null,
    status: null,
    updatedByUuids: null,
  });
  const [isShowFilterDropdown, setIsShowFilterDropdown] = useState(false);
  const [isShowCheckboxDropdown, setIsShowCheckboxDropdown] = useState(false);
  const [isShowUpdatedByUuidDropdown, setIsShowUpdatedByUuidDropdown] = useState(false);
  const [searchStatusArr, setSearchStatusArr] = useState([]);
  const [searchUpdatedBy, setSearchUpdatedBy] = useState(null);

  useEffect(() => {
    getHistory(filters);
  }, [filters]);

  const handleChangeFilter = useCallback((value, type) => {
    setFilters(Object.assign({}, filters, {
      [`${type}`]: value,
      pageNumber: 1,
    }));
    if (type === 'originalFilename') {
      setIsShowFilterDropdown(false);
    }
    if (type === 'status') {
      setIsShowCheckboxDropdown(false);
    }
    if (type === 'updatedByUuids') {
      setIsShowUpdatedByUuidDropdown(false);
    }
  }, [filters]);

  const handleChangeTable = useCallback((pagination) => {
    const { pageSize, current } = pagination;
    setFilters(Object.assign({}, filters, {
      pageNumber: current,
      pageSize,
    }));
  }, [filters]);

  const handleClickDownloadOriginal = useCallback((fileName) => {
    downloadExcelFile(fileName);
  }, []);

  const historyColumns = [
    {
      title: i18next.t('cms.reconciliation.table.title.file_name'),
      width: 250,
      dataIndex: 'originalFilename',
      key: 'originalFilename',
      fixed: 'left',
      /* eslint-disable */
      filterDropdown: ({ setSelectedKeys, selectedKeys }) => {
      /* eslint-enable */
        const searchedOriginalFileName = trim(selectedKeys) ? trim(selectedKeys) : null;
        return (<span className="bulk-history-modal__search-input">
          <Input
            placeholder={ i18next.t('cms.reconciliation.placeholder.search_file_name') }
            value={ selectedKeys }
            onChange={ e => setSelectedKeys(e.target.value || undefined) }
            onPressEnter={ () => handleChangeFilter(searchedOriginalFileName, 'originalFilename') }
            onBlur={ () => handleChangeFilter(searchedOriginalFileName, 'originalFilename') }
          />
        </span>);
      },
      filterIcon: (
        <Icon
          type="search"
          style={ { color: filters.originalFilename ? activeFilterColor : undefined } }
        />
      ),
      filterDropdownVisible: isShowFilterDropdown,
      render: (text, record) => (
        <span className="bulk-history-modal__file-name">
          <Tooltip title={ text }>
            <span className="bulk-history-modal__name-text">{ text }</span>
          </Tooltip>
          <Button
            size="small"
            className="bulk-history-modal__download-btn"
            onClick={ () => handleClickDownloadOriginal(record.storageFilename) }
          >
            <Icon type="download" className="bulk-history-modal__download-icon" />
          </Button>
        </span>
      ),
      onFilterDropdownVisibleChange: (visible) => {
        setIsShowFilterDropdown(visible);
      },
    },
    {
      title: i18next.t('cms.reconciliation.table.title.status'),
      width: 100,
      dataIndex: 'status',
      key: 'status',
      /* eslint-disable */
      filterDropdown: () => (
      /* eslint-enable */
        <div className="bulk-history-modal__checkbox-wrap">
          <Checkbox.Group
            className="bulk-history-modal__checkbox-group"
            options={ updateStatusList.map(status => ({
              label: i18next.t(`cms.reconciliation.booking.bulk_update.status.${toLower(status)}`),
              value: status,
            })) }
            onChange={ checkedValueArr => setSearchStatusArr(checkedValueArr) }
          />
        </div>
      ),
      filterIcon: (
        <Icon
          type="filter"
          theme="filled"
          style={ {
            color: filters.status && filters.status.length > 0 ? activeFilterColor : undefined,
          } }
        />
      ),
      filterDropdownVisible: isShowCheckboxDropdown,
      render: text => (
        <span className={ classNames('bulk-history-modal__status', {
          [`bulk-history-modal__status--${kebabCase(toLower(text))}`]: text,
        }) }
        >
          { i18next.t(`cms.reconciliation.booking.bulk_update.status.${toLower(text)}`) }
        </span>
      ),
      onFilterDropdownVisibleChange: (visible) => {
        if (!visible) {
          handleChangeFilter(searchStatusArr, 'status');
        }

        setIsShowCheckboxDropdown(visible);
      },
    },
    {
      title: i18next.t('cms.reconciliation.table.title.total_records'),
      width: 100,
      dataIndex: 'totalNum',
      key: 'totalNum',
      render: text => (
        <span className="bulk-history-modal__total-records">
          { text === null ? '-' : text }
        </span>
      ),
    },
    {
      title: i18next.t('cms.reconciliation.table.title.successed_records'),
      width: 100,
      dataIndex: 'successNum',
      key: 'successNum',
      render: text => (
        <span className="bulk-history-modal__success-num">
          { text === null ? '-' : text }
        </span>
      ),
    },
    {
      title: i18next.t('cms.reconciliation.table.title.failed_records'),
      width: 100,
      dataIndex: 'failNum',
      key: 'failNum',
      render: (text, record) => (
        <span className="bulk-history-modal__failed-num">
          { text === null ? '-' : text }
          <If condition={ text && text > 0 }>
            <Button
              size="small"
              className="bulk-history-modal__download-btn"
              onClick={ () => handleClickDownloadOriginal(record.resultFilename) }
            >
              <Icon type="download" className="bulk-history-modal__download-icon" />
            </Button>
          </If>
        </span>
      ),
    },
    {
      title: i18next.t('cms.reconciliation.table.title.created_at'),
      width: 200,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: text => (
        <span className="bulk-history-modal__created-at">
          { text ? moment(text).format(dateTemplate) : '-' }
        </span>
      ),
    },
    {
      title: i18next.t('cms.reconciliation.table.title.completed_at'),
      width: 200,
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: text => (
        <span className="bulk-history-modal__completed-at">
          { text ? moment(text).format(dateTemplate) : '-' }
        </span>),
    },
    {
      title: i18next.t('cms.reconciliation.table.title.updated_by'),
      width: 150,
      dataIndex: 'cmsUser',
      key: 'cmsUser',
      fixed: 'right',
      /* eslint-disable */
      filterDropdown: () => (
      /* eslint-enable */
        <SearchCmsUser
          onChange={ (searchedCmsUser) => {
            setSearchUpdatedBy(searchedCmsUser);
            handleChangeFilter(searchedCmsUser, 'updatedByUuids');
          } }
        />
      ),
      filterIcon: (
        <Icon
          type="filter"
          theme="filled"
          style={ { color: filters.updatedByUuids ? activeFilterColor : undefined } }
        />
      ),
      filterDropdownVisible: isShowUpdatedByUuidDropdown,
      onFilterDropdownVisibleChange: (visible) => {
        if (!visible && !searchUpdatedBy) {
          handleChangeFilter(null, 'updatedByUuids');
        }

        setIsShowUpdatedByUuidDropdown(visible);
      },
      render: text => (
        <Tooltip title={ text }>
          <span className="bulk-history-modal__update-by">
            { text }
          </span>
        </Tooltip>
      ),
    },
  ];

  return {
    pageNumber: filters.pageNumber,
    historyColumns,
    handleChangeTable,
  };
};

export default useBulkHistory;
