import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Icon, Table } from 'antd';
import CreateAccountModal from '~pages/dashboard/account/create-account-modal';
import EditAccountModal from '~pages/dashboard/account/edit-account-modal';
import * as accountActions from '~actions/account';
import {
  communicationStatus,
  sortDirectionMapping,
  accountSortByMapping,
  platformEntity,
  entityAction,
} from '~constants';
import showElementByAuth, { isSupplyRole, isRegionalSupplyHeadRole } from '~helpers/auth';

const mapStateToProps = (state) => {
  const data = state.dashboard.account.toJS();

  return {
    listStatus: data.communication.list.status,
    users: data.list.payload,
  };
};

const mapDispatchToProps = dispatch => ({
  getUserList: (data) => {
    dispatch(accountActions.getUserList(data));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class InternalManagement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showCreateModal: false,
      showEditModal: false,
      editData: {},
      searchComponentTarget: null,
      sortDirection: sortDirectionMapping.descend,
      tableHeight: 0,
    };

    this.columns = [
      {
        title: this.props.t('cms.account.table_title.account_email'),
        dataIndex: 'email',
        key: 'email',
        width: '30%',
        render: text => (
          <div style={ { wordWrap: 'break-word', wordBreak: 'break-word' } }>
            {text}
          </div>
        ),
      },
      {
        title: this.props.t('cms.account.table_title.user_role'),
        dataIndex: 'userRoles',
        key: 'userRoles',
        width: '35%',
        render: text => (
          <Choose>
            <When condition={ text && text.length > 0 }>
              <For of={ text } each="item" index="index">
                <span key={ item.slug }>
                  { index + 1 !== text.length ? `${item.name},` : item.name }
                </span>
              </For>
            </When>
            <Otherwise>
              <span> - </span>
            </Otherwise>
          </Choose>
        ),
      },
      {
        title: this.props.t('cms.account.table_title.updated_time'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
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
        title: this.props.t('cms.account.table_title.action'),
        key: 'action',
        width: '15%',
        render: (text, record) => (
          <If condition={ showElementByAuth(
            platformEntity.IDENTITY_CMS_USERS,
            entityAction.UPDATE,
          ) }
          >
            <button
              onClick={ () => { this.handleEditRecord(record); } }
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
    this.getLandlordTableHeight();
    this.props.getUserList({});
    window.addEventListener('resize', this.getLandlordTableHeight);
  }

  getList = () => {
    this.props.getUserList({
      sortBy: accountSortByMapping.updatedAt,
      sortDirection: this.state.sortDirection,
    });
  }

  componentWillUnMount() {
    window.removeEventListener('resize', this.getLandlordTableHeight);
  }

  handleEditRecord = (record) => {
    this.setState({
      showEditModal: true,
      editData: record,
    });
  };

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

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      sortDirection: sortDirectionMapping[sorter.order],
    });

    this.props.getUserList({
      sortBy: accountSortByMapping.updatedAt,
      sortDirection: sortDirectionMapping[sorter.order],
    });
  }

  getLandlordTableHeight = () => {
    if (this.landlordManagement) {
      this.setState({ tableHeight: this.landlordManagement.clientHeight - 120 });
    }
  }

  render() {
    const { t } = this.props;
    return (
      <div className="landlord-account-management" ref={ (node) => { this.landlordManagement = node; } }>
        <div className="landlord-account-management__header">
          <If condition={ showElementByAuth(
            platformEntity.IDENTITY_CMS_USERS,
            entityAction.CREATE,
          ) && !isSupplyRole() && !isRegionalSupplyHeadRole() }
          >
            <button
              className="landlord-account-management__btn
              landlord-account-management__create-new-account"
              type="button"
              onClick={ this.clickCreateModal }
            >
              <Icon type="plus" style={ { fontSize: '12px', marginLeft: '4px' } } />
              { t('cms.account.landlord_account_managing.create_new.account.btn') }
            </button>
          </If>
        </div>

        <div className="landlord-account-management__content">
          <Table
            rowKey={ record => record.id }
            dataSource={ this.props.users }
            columns={ this.columns }
            pagination={ false }
            onChange={ this.handleTableChange }
            loading={ this.props.listStatus !== communicationStatus.IDLE }
            scroll={ { y: this.state.tableHeight } }
          />
        </div>
        <If condition={ this.state.showCreateModal }>
          <CreateAccountModal
            activeModal
            t={ t }
            onClose={ this.clickCreateModal }
            modalType="add"
            getList={ this.getList }
          />
        </If>
        <If condition={ this.state.showEditModal }>
          <div className="landlord-account-management__edit-modal">
            <EditAccountModal
              activeModal
              t={ t }
              onClose={ this.clickEditModal }
              modalType="edit"
              data={ this.state.editData }
              history={ this.props.history }
              getList={ this.getList }
            />
          </div>
        </If>
      </div>
    );
  }
}

InternalManagement.propTypes = {
  t: PropTypes.func,
  getUserList: PropTypes.func,
  listStatus: PropTypes.string,
  users: PropTypes.object,
  history: PropTypes.object,
};

InternalManagement.defaultProps = {
  t: () => {},
  getUserList: () => {},
  listStatus: '',
  users: {},
  history: {},
};
