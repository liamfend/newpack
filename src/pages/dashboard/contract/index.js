import React from 'react';
import { Form, Pagination, Icon, Empty, Spin } from 'antd';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { communicationStatus, platformEntity, entityAction } from '~constants';
import moment from 'moment';
import * as contractActions from '~actions/contract';
import * as landlordActions from '~actions/landlord';
import { withTranslation } from 'react-i18next';
import ContractFilter from '~pages/dashboard/contract/contract-filter';
import ContractEmpty from '~pages/dashboard/contract/contract-empty';
import ContractModal from '~pages/dashboard/contract/contract-modal';
import ContractList from '~pages/dashboard/contract/contract-list';
import { withRouter } from 'react-router-dom';
import { mergeSearchParams } from '~helpers/history';
import generatePath from '~settings/routing';
import showElementByAuth from '~helpers/auth';
import authControl from '~components/auth-control';


const mapStateToProps = (state) => {
  const contract = state.dashboard.contract.toJS();
  const landlord = state.dashboard.landlord.toJS();
  return {
    contracts: contract.list.payload,
    landlordList: contract.landlord,
    totalCount: contract.list.total,
    listCommunication: contract.listCommunication,
    preparedContract: landlord.preparedContract,
  };
};

const mapDispatchToProps = dispatch => ({
  searchLandlordList: (value) => {
    dispatch(contractActions.searchLandlordList(value));
  },
  getContractList: (filter, sucessAction) => {
    dispatch(contractActions.getContractList(filter, sucessAction));
  },
  deleteContract: (id) => {
    dispatch(contractActions.deleteContract({ id }));
  },
  queryLandlord: (slug, sucessAction) => {
    dispatch(contractActions.queryLandlord(slug, sucessAction));
  },
  setPreparedContract: (payload) => {
    dispatch(landlordActions.setPreparedContract(payload));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@withRouter
@authControl(platformEntity.PROPERTIES_CONTRACTS, entityAction.READ)
class Contract extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSearchParams = {
      pageNumber: 1,
      pageSize: 10,
    };
    this.state = {
      filterState: true,
      isLarge: true,
      isEmpty: false,
      showContractModal: false,
      contractList: props.contracts,
      loadingData: false,
      pageParams: {
        currentNum: Number(queryString.parse(this.props.location.search)
          .pageNumber) || this.defaultSearchParams.pageNumber,
        pageSize: Number(queryString.parse(this.props.location.search)
          .pageSize) || this.defaultSearchParams.pageSize,
      },
      editContract: {},
      firstLoading: true,
      isFillPreparedContract: false,
    };
  }

  componentDidMount() {
    this.props.searchLandlordList('');
    this.handleFilters();
    this.largeStyle();
    window.addEventListener('resize', this.largeStyle);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.listCommunication.status === communicationStatus.FETCHING &&
      this.props.listCommunication.status === communicationStatus.IDLE) {
      this.setState({ loadingData: true });
    }

    if (nextProps.listCommunication.status === communicationStatus.IDLE &&
      this.props.listCommunication.status === communicationStatus.FETCHING) {
      this.setState({ loadingData: false });
    }

    if (nextProps.location.search !== this.props.location.search &&
      Object.keys(nextProps.location.search).length === 0) {
      this.handleResetData();
      const urlParams = queryString.parse(nextProps.location.search);
      const formatFilters = this.formatFilters(urlParams);
      this.props.getContractList(formatFilters);
    }

    if (!this.props.preparedContract && nextProps.preparedContract) {
      this.setState({
        showContractModal: true,
      }, () => {
        this.setState({
          isFillPreparedContract: true,
        });
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.largeStyle);

    // reset prepared contract from landlord detail page
    this.props.setPreparedContract(null);
  }

  handleEditContract = (contract) => {
    this.setState({
      editContract: contract,
      showContractModal: true,
    });
  };

  handleDeleteContract = (contract) => {
    this.handleResetData();
    this.props.deleteContract(contract.id);
  };

  largeStyle = () => {
    const dashboardLayout = document.querySelector('.dashboard__layout');
    const dashboardLayoutWidth = dashboardLayout ? dashboardLayout.clientWidth : 0;

    if (dashboardLayoutWidth >= 1050) {
      this.setState({
        isLarge: true,
      });
    }

    if (dashboardLayoutWidth < 1050) {
      this.setState({
        isLarge: false,
      });
    }
  }

  handleFilters = () => {
    const urlParams = queryString.parse(this.props.location.search);
    const formatFilters = this.formatFilters(urlParams);
    this.props.getContractList(formatFilters, () => {
      this.setState({
        firstLoading: false,
      });
    });

    if (formatFilters.signedDateStart && formatFilters.signedDateEnd) {
      const signedDate = [moment(formatFilters.signedDateStart),
        moment(formatFilters.signedDateEnd)];
      this.props.form.setFieldsValue({
        signedDate,
      });
      this.contractFilter.state.filterForm.signedDate = signedDate;
    }

    if (formatFilters.statuses) {
      this.props.form.setFieldsValue({
        contractStatus: formatFilters.statuses.toLowerCase(),
      });
      this.contractFilter.state.filterForm.contractStatus = formatFilters.statuses.toLowerCase();
    }

    if (formatFilters.landlordSlugs && formatFilters.landlordSlugs.length > 0) {
      if (typeof (formatFilters.landlordSlugs) === 'string') {
        formatFilters.landlordSlugs = [formatFilters.landlordSlugs];
      }
      this.landlordPromise(formatFilters.landlordSlugs);
    }
  };

  landlordPromise = (landlord) => {
    const value = Promise.all(
      landlord.map(item => (
        new Promise((resolve) => {
          this.props.queryLandlord(item, (res) => {
            resolve(res);
          });
        })
      )),
    );

    value.then((res) => {
      const field = {};
      field.landlord = res.map(item => item.landlord.name).join('; ');
      this.props.form.setFieldsValue(field);
      this.contractFilter.state.filterForm.landlord = res.map(item => item.landlord.slug);
    });
  }

  formatFilters = filters => ({
    landlordSlugs: filters.landlordSlugs || null,
    pageNumber: Number(filters.pageNumber) || this.defaultSearchParams.pageNumber,
    pageSize: Number(filters.pageSize) || this.defaultSearchParams.pageSize,
    statuses: filters.statuses ? filters.statuses.toUpperCase() : null,
    signedDateStart: filters.signedDateStart || null,
    signedDateEnd: filters.signedDateEnd || null,
    sortDirection: filters.sortDirection || null,
  })

  changePageNum = (page, pageSize) => {
    const urlParams = queryString.parse(this.props.location.search);
    const formatFilters = this.formatFilters(urlParams);
    formatFilters.pageNumber = page;
    this.state.pageParams.currentNum = page;

    if (pageSize !== formatFilters.pageSize) {
      formatFilters.pageSize = pageSize;
      formatFilters.pageNumber = this.defaultSearchParams.pageNumber;
      this.state.pageParams.currentNum = this.defaultSearchParams.pageNumber;
      this.state.pageParams.pageSize = pageSize;
    }

    this.setState(this.state);
    this.props.history.push(mergeSearchParams(formatFilters, this.defaultSearchParams));
    this.props.getContractList(formatFilters);
  }

  setPageParams = (currentNum = this.defaultSearchParams.pageNumber,
    pageSize = this.defaultSearchParams.pageSize) => {
    this.setState({
      pageParams: {
        currentNum,
        pageSize,
      },
    });
  }

  changeFilterState = () => {
    this.setState({
      filterState: !this.state.filterState,
    });
  }

  addNewContract = () => {
    this.setState({ showContractModal: true });
  }

  handleContractModal = (value) => {
    if (!value) {
      this.state.editContract = {};
    }
    this.setState({ showContractModal: value });
  }

  handleResetData = () => {
    this.contractFilter.props.form.resetFields(['landlord', 'signedDate', 'contractStatus']);
    this.contractFilter.state.filterForm = {
      landlord: [],
      signedDate: [],
      contractStatus: '',
    };
    this.contractFilter.state.selectedLandlords = [];
    this.contractFilter.searchComponent.handleClear();
    const landlordInput = document.querySelector('.search-component__input');
    if (landlordInput) {
      landlordInput.value = '';
    }
    this.setPageParams();
    const url = generatePath('contract');
    this.props.history.push(url);
  }

  render() {
    const { t } = this.props;

    return (
      <div className="contract-content">
        <If condition={ this.state.firstLoading }>
          <div className="property-edit__loading"><Spin /></div>
        </If>
        <div className={ classNames('contract-content__loading', {
          'contract-content__loading--show': this.state.loadingData && !this.state.firstLoading,
        }) }
        >
          <Icon type="loading" style={ { fontSize: '30px' } } />
        </div>
        <Form>
          <div className="contract-content__header">
            <div className="contract-content__number">
              {this.props.totalCount} {t('cms.sidebar.menu.contract')}
            </div>
            <If condition={ showElementByAuth(
              platformEntity.PROPERTIES_CONTRACTS,
              entityAction.CREATE,
            ) }
            >
              <button className="contract-content__add" type="button" onClick={ () => { this.handleContractModal(true); } }>
                {t('cms.contract.add_new.btn')}
              </button>
            </If>
          </div>
          <ContractFilter
            form={ this.props.form }
            filterState={ this.state.filterState }
            isLarge={ this.state.isLarge }
            changeFilterState={ this.changeFilterState }
            landlordList={ this.props.landlordList }
            t={ this.props.t }
            isEmpty={ this.props.contracts.length === 0 &&
            Object.keys(queryString.parse(this.props.location.search)).length === 0 }
            getContractList={ this.props.getContractList }
            history={ this.props.history }
            ref={ (node) => { this.contractFilter = node; } }
            setPageParams={ this.setPageParams }
            defaultSearchParams={ this.defaultSearchParams }
          />
          <If condition={ this.props.contracts.length > 0 }>
            <ContractList
              dataSource={ this.props.contracts }
              handleEditContract={ this.handleEditContract }
              handleDeleteContract={ this.handleDeleteContract }
              t={ this.props.t }
              formatFilters={ this.formatFilters }
              location={ this.props.location }
              getContractList={ this.props.getContractList }
              history={ this.props.history }
              defaultSearchParams={ this.defaultSearchParams }

            />
            <Pagination
              showSizeChanger
              onShowSizeChange={ this.changePageNum }
              defaultCurrent={ this.defaultSearchParams.pageNumber }
              total={ this.props.totalCount }
              onChange={ this.changePageNum }
              current={ this.state.pageParams.currentNum }
              pageSize={ this.state.pageParams.pageSize }
            />
          </If>
          <If condition={ this.props.contracts.length === 0 &&
            Object.keys(queryString.parse(this.props.location.search)).length === 0 }
          >
            <ContractEmpty
              filterState={ this.state.filterState }
              t={ this.props.t }
              typeName={ 'contract' }
              openModal={ this.addNewContract }
            />
          </If>
          <If condition={ this.props.contracts.length === 0 &&
          Object.keys(queryString.parse(this.props.location.search)).length !== 0 }
          >
            <Empty image={ Empty.PRESENTED_IMAGE_SIMPLE } />
          </If>
        </Form>

        <If condition={ this.state.showContractModal }>
          <ContractModal
            activeModal={ this.state.showContractModal }
            t={ this.props.t }
            handleContractModal={ this.handleContractModal }
            editContract={ this.state.editContract }
            contractFilter={ this.contractFilter }
            handleResetData={ this.handleResetData }
            preparedContract={ this.props.preparedContract }
            isFillPreparedContract={ this.state.isFillPreparedContract }
          />
        </If>
      </div>
    );
  }
}

Contract.propTypes = {
  getContractList: PropTypes.func,
  form: PropTypes.object.isRequired,
  searchLandlordList: PropTypes.func,
  landlordList: PropTypes.array,
  t: PropTypes.func,
  contracts: PropTypes.array,
  deleteContract: PropTypes.func,
  location: PropTypes.object,
  queryLandlord: PropTypes.func,
  history: PropTypes.object,
  totalCount: PropTypes.number,
  listCommunication: PropTypes.shape({
    status: PropTypes.string.isRequired,
  }),
  preparedContract: PropTypes.object,
  setPreparedContract: PropTypes.func.isRequired,
};

Contract.defaultProps = {
  getContractList: () => {},
  getPropertyDetail: () => {},
  deleteContract: () => {},
  searchLandlordList: () => {},
  t: () => {},
  rooms: [],
  contracts: [],
  landlordList: [],
  location: {},
  queryLandlord: () => {},
  history: {},
  totalCount: 0,
  listCommunication: {
    status: '',
  },
  preparedContract: {},
  setPreparedContract: () => {},
};

export default Form.create({
  name: 'contract_form',
})(Contract);
