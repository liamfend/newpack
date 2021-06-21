import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { lowerCase } from 'lodash';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Icon, Table, Tooltip, Input } from 'antd';
import LandlordModal from '~pages/dashboard/account/landlord-modal';
import ViewAccountModal from '~pages/dashboard/account/view-landlord-modal';
import SearchComponent from '~components/search-component';
import * as accountActions from '~actions/account';
import {
  communicationStatus,
  sortDirectionMapping,
  platformEntity,
  entityAction,
} from '~constants';
import showElementByAuth from '~helpers/auth';

const DEFAULT_ACCOUNT_LEVEL = 'landlord';

const mapStateToProps = (state) => {
  const data = state.dashboard.account.toJS();

  return {
    listStatus: data.communication.landlordList.status,
    users: data.landlordList.payload,
    total: data.landlordList.total,
  };
};

const mapDispatchToProps = dispatch => ({
  getLandlordContacts: (params, onSuccess) => {
    dispatch(accountActions.getLandlordContacts(params, onSuccess));
  },
  getLandlordList: (onSuccess) => {
    dispatch(accountActions.getLandlordList(onSuccess));
  },
  getLandlordContactProperty: (params, onSuccess) => {
    dispatch(accountActions.getLandlordContactProperty(params, onSuccess));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class LandlordManagement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showCreateModal: false,
      showEditModal: false,
      showViewModal: false,
      editData: {},
      searchComponentTarget: null,
      landlordList: [],
      selectLandlord: [],
      openLandlordSearch: false,
      sortDirection: sortDirectionMapping.descend,
      isSearch: false,
      tableHeight: 0,
      email: null,
      loadingData: false,
      selectedProperties: [],
      accountLevel: null,
      loadingGetLandlordContactProperty: true,
      filters: {
        pageNumber: 1,
        pageSize: 10,
        email: null,
        sortDirection: 'DESCENDING',
        landlordSlugs: null,
      },
    };

    this.columns = [
      {
        title: 'Account email',
        dataIndex: 'email',
        key: 'account-email',
        width: '30%',
        filterIcon: () => (<Icon
          type="search"
          style={ {
            color: this.state.email ? '#38b2a6' : '#c8c9cb',
            backgroundColor: 'transparent',
          } }
        />),
        filterDropdown: (
          <div className="reviews-tab__filter">
            <Input
              allowClear
              style={ { width: 214 } }
              onChange={ this.handleSearchEmail }
              placeholder={ this.props.t('cms.landlord_account.table.email.placeholder') }
            />
          </div>
        ),
        onFilterDropdownVisibleChange: (e) => {
          if (!e) {
            if (this.state.filters.email) {
              this.state.filters.pageNumber = 1;
              this.setState(this.state, () => {
                this.getList();
              });
            } else {
              this.getList();
            }
          }
        },
        render: (text, record) => (
          <div style={ { wordWrap: 'break-word', wordBreak: 'break-word' } }>
            { record.email ? record.email : '-' }
          </div>
        ),
      },
      {
        title: 'Landlord name',
        dataIndex: 'landlord',
        key: 'landlord-name',
        width: '35%',
        render: text => (
          <span>{ text && text.name ? text.name : '-' }</span>
        ),
      },
      {
        title: 'Updated time',
        dataIndex: 'updatedAt',
        key: 'updated-time',
        width: '20%',
        sorter: true,
        render: text => (
          <Choose>
            <When condition={ text }>
              <span>{ moment(text).format('DD/MM/YYYY') }</span>
            </When>
            <Otherwise>
              <span> - </span>
            </Otherwise>
          </Choose>
        ),
      },
      {
        title: 'Action',
        key: 'landlord-action',
        width: '15%',
        render: (text, record) => (
          <If condition={ showElementByAuth(
            platformEntity.IDENTITY_CMS_USERS,
            entityAction.UPDATE,
          ) }
          >
            <button
              onClick={ () => { this.handleViewRecord(record); } }
              className="landlord-account-management__btn"
            >
              <Icon type="edit" />
            </button>
          </If>
        ),
      },
    ];
  }

  componentDidMount() {
    this.props.getLandlordContacts(this.state.filters, () => {
      this.props.getLandlordList(res => this.formatLandlordData(res));
    });

    this.getLandlordTableHeight();
    window.addEventListener('resize', this.getLandlordTableHeight);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.listStatus === communicationStatus.IDLE &&
      nextProps.listStatus === communicationStatus.FETCHING) {
      this.handleTableLoading(true);
    }

    if (this.props.listStatus === communicationStatus.FETCHING &&
      nextProps.listStatus === communicationStatus.IDLE) {
      this.handleTableLoading(false);
    }
  }

  componentWillUnMount() {
    window.removeEventListener('resize', this.getLandlordTableHeight);
  }

  handleTableLoading = (value) => {
    this.setState({ loadingData: value });
  };

  handleSearchEmail = ({ target: { value } }) => {
    this.state.filters.email = value.trim() || null;
    this.setState(this.state);
  };

  getList = () => {
    this.props.getLandlordContacts(this.state.filters);
  }

  setSearchComponentTarget = (node) => {
    if (!this.state.searchComponentTarget) {
      this.setState({ searchComponentTarget: node });
    }
  };

  formatLandlordData = (res) => {
    let landlordList = [];
    if (res && res.search && res.search.edges) {
      landlordList = res.search.edges.map(item => item.node);
    }

    this.setState({ landlordList });
  };

  handleLandlordSelect = (value) => {
    this.setState({
      selectLandlord: value.value,
      isSearch: true,
    });
  };

  handleLandlordFilterClick = () => {
    if (!this.state.openLandlordSearch) {
      this.setState({ openLandlordSearch: true });
    }
  }

  handleViewRecord = (record) => {
    this.setState({
      showViewModal: true,
      editData: record,
    });
  }

  clickCreateModal = () => {
    this.setState({
      showCreateModal: !this.state.showCreateModal,
    });
  }

  clickEditModal = () => {
    this.setState({
      showEditModal: !this.state.showEditModal,
    });
  }

  clickViewModal = () => {
    if (this.state.showViewModal) {
      this.state.selectedProperties = [];
      this.state.loadingGetLandlordContactProperty = true;
    }
    this.state.showViewModal = !this.state.showViewModal;
    this.setState(this.state);
  }

  handleTableChange = (pagination, filters, sorter) => {
    let sortDirection;
    if (sorter.order) {
      sortDirection = sorter.order === 'ascend' ? 'ASCENDING' : 'DESCENDING';
    }

    if (sortDirection && this.state.filters.sortDirection !== sortDirection) {
      this.state.filters.sortDirection = sortDirection;
      this.setState(this.state.filters);

      this.props.getLandlordContacts(this.state.filters);
    }
  }

  getSelectLandlord = () => {
    const allSelect = [];
    if (this.state.selectLandlord
      && this.state.selectLandlord.length > 0) {
      this.state.selectLandlord.map((landlord) => {
        allSelect.push(landlord.slug);

        return true;
      });
    }

    return allSelect;
  }

  searchAccount = () => {
    if (this.state.isSearch) {
      this.state.filters = {
        landlordSlugs: this.getSelectLandlord(),
        pageNumber: 1,
        pageSize: 10,
        email: null,
        sortDirection: 'DESCENDING',
      };

      this.props.getLandlordContacts(this.state.filters);
    }

    this.setState({
      openLandlordSearch: false,
      isSearch: false,
    });
  }

  getSearchTipsTitle = () => {
    let titleText = '';
    if (this.state.selectLandlord.length > 0) {
      this.state.selectLandlord.map((landlord, index) => {
        if ((index + 1) === this.getSelectLandlord().length) {
          titleText = titleText.concat(landlord.name);
        } else {
          titleText = titleText.concat(landlord.name, ',');
        }
        return true;
      });
    }
    return titleText;
  }

  getLandlordTableHeight = () => {
    if (this.landlordManagement) {
      this.setState({ tableHeight: this.landlordManagement.clientHeight - 190 });
    }
  }

  openEditModal = () => {
    this.setState({
      showViewModal: false,
      showEditModal: true,
    });
  };

  handlePaginationChange = (pageNumber) => {
    if (pageNumber && pageNumber !== this.state.filters.pageNumber) {
      this.state.filters.pageNumber = pageNumber;

      this.setState(this.state);
      this.getList();
    }
  };

  handlePageSizeChange = (current, size) => {
    if (current !== size) {
      this.state.filters.pageNumber = 1;
      this.state.filters.pageSize = size;

      this.setState(this.state);
      this.getList();
    }
  };

  handleLandlordContactProperty = (email) => {
    this.props.getLandlordContactProperty({ email }, (res) => {
      if (res &&
        res.landlordContacts &&
        res.landlordContacts.edges &&
        res.landlordContacts.edges[0] &&
        res.landlordContacts.edges[0].node &&
        res.landlordContacts.edges[0].node.properties &&
        res.landlordContacts.edges[0].node.properties.edges) {
        this.setState({
          selectedProperties: res.landlordContacts.edges[0].node.properties.edges,
          loadingGetLandlordContactProperty: false,
          accountLevel: lowerCase(res.landlordContacts.edges[0].node.accountLevel),
        });
      }
    });
  };

  render() {
    const { t } = this.props;
    return (
      <div className="landlord-account-management" ref={ (node) => { this.landlordManagement = node; } }>
        <div className="landlord-account-management__header">
          <div
            ref={ (node) => { this.landlordSelectorcontainer = node; } }
            className="landlord-account-management__landlord-selector-container"
          >
            <Tooltip
              trigger="hover"
              arrowPointAtCenter
              overlayClassName={
                this.getSelectLandlord().length > 0 ?
                  '' : 'landlord-account-management__search-tips-hidden'
              }
              placement="top"
              title={ this.getSearchTipsTitle() }
            >
              <label
                role="presentation"
                className="landlord-account-management__landlord-name-label"
                ref={ (node) => { this.setSearchComponentTarget(node); } }
                onClick={ this.handleLandlordFilterClick }
              >
                {
                  this.state.selectLandlord.length > 0 ?
                    t('cms.account.landlord_account_managing.search_count_title',
                      { count: this.state.selectLandlord.length })
                    : t('cms.account.landlord_account_managing.search_title')
                }
                <Icon type={ this.state.openLandlordSearch ? 'up' : 'down' } />
              </label>
            </Tooltip>
            <SearchComponent
              options={ this.state.landlordList }
              targetInput={ this.state.searchComponentTarget }
              container={ this.landlordSelectorcontainer }
              keyValue="slug"
              t={ t }
              onChange={ this.handleLandlordSelect }
              onBlur={ this.searchAccount }
              showSelectAll={ false }
            />
          </div>

          <button
            className="landlord-account-management__btn
            landlord-account-management__create-new-account"
            type="button"
            onClick={ this.clickCreateModal }
          >
            <Icon type="plus" style={ { fontSize: '12px', marginLeft: '4px' } } />
            { t('cms.account.landlord_account_managing.create_new.account.btn') }
          </button>
        </div>

        <div className="landlord-account-management__content">
          <Table
            loading={ this.state.loadingData }
            style={ { height: '100%' } }
            rowKey={ user => user.id }
            dataSource={ this.props.users }
            columns={ this.columns }
            pagination={ {
              current: this.state.filters.pageNumber,
              pageSize: this.state.filters.pageSize,
              total: this.props.total,
              showSizeChanger: true,
              onChange: this.handlePaginationChange,
              onShowSizeChange: this.handlePageSizeChange,
            } }
            onChange={ this.handleTableChange }
            scroll={ { y: this.state.tableHeight } }
          />
        </div>
        <If condition={ this.state.showCreateModal }>
          <LandlordModal
            activeModal
            t={ t }
            onClose={ this.clickCreateModal }
            modalType="add"
            getList={ this.getList }
            isLandlord
            properties={ this.state.selectedProperties }
            accountLevel={ DEFAULT_ACCOUNT_LEVEL }
            loading={ this.state.loadingGetLandlordContactProperty }
          />
        </If>
        <If condition={ this.state.showEditModal }>
          <div className="landlord-account-management__edit-modal">
            <LandlordModal
              activeModal
              t={ t }
              onClose={ this.clickEditModal }
              modalType="edit"
              data={ this.state.editData }
              history={ this.props.history }
              getList={ this.getList }
              isLandlord
              properties={ this.state.selectedProperties }
              accountLevel={ this.state.accountLevel }
              loading={ this.state.loadingGetLandlordContactProperty }
            />
          </div>
        </If>
        <If condition={ this.state.showViewModal }>
          <div className="landlord-account-management__edit-modal">
            <ViewAccountModal
              activeModal
              t={ t }
              onClose={ this.clickViewModal }
              data={ this.state.editData }
              onOpenEditModal={ this.openEditModal }
              properties={ this.state.selectedProperties }
              accountLevel={ this.state.accountLevel }
              loading={ this.state.loadingGetLandlordContactProperty }
              handleLandlordContactProperty={ this.handleLandlordContactProperty }
            />
          </div>
        </If>
      </div>
    );
  }
}

LandlordManagement.propTypes = {
  t: PropTypes.func,
  getLandlordList: PropTypes.func,
  listStatus: PropTypes.string,
  users: PropTypes.object,
  history: PropTypes.object,
  getLandlordContacts: PropTypes.func,
  getLandlordContactProperty: PropTypes.func,
  total: PropTypes.number,
};

LandlordManagement.defaultProps = {
  getLandlordList: () => {},
  t: () => {},
  listStatus: '',
  users: {},
  history: {},
  total: 0,
  getLandlordContacts: () => {},
  getLandlordContactProperty: () => {},
};
