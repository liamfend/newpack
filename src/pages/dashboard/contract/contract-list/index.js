import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import { Row, Col, Icon } from 'antd';
import queryString from 'query-string';
import { mergeSearchParams } from '~helpers/history';
import ContractDetail from '~pages/dashboard/contract/contract-list/contract-detail';
import { calContractStatus } from '~helpers/contract';

export default class ContractList extends React.Component {
  constructor() {
    super();
    this.state = {
      currentContract: {},
      SortDescend: false,
    };
  }

  componentDidMount() {
    this.setDefaultContract(this.props.dataSource[0]);
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.dataSource) !== JSON.stringify(this.props.dataSource)) {
      this.setDefaultContract(nextProps.dataSource[0]);
    }

    if (this.props.location.search !== nextProps.location.searc) {
      this.setState({
        SortDescend: queryString.parse(this.props.location.search).sortDirection === 'ASCENDING',
      });
    }
  }

  setDefaultContract = (data) => {
    this.setState({ currentContract: data });
  };

  handleClickLandlordCard = (contract) => {
    this.setState({ currentContract: contract });
  };

  changeSort = () => {
    const urlParams = queryString.parse(this.props.location.search);
    const formatFilters = this.props.formatFilters(urlParams);
    this.setState({ SortDescend: !this.state.SortDescend }, () => {
      if (this.state.SortDescend) {
        formatFilters.sortDirection = 'ASCENDING';
      } else {
        formatFilters.sortDirection = null;
      }
      this.props.getContractList(formatFilters);
      this.props.history.push(mergeSearchParams(formatFilters, this.props.defaultSearchParams));
    });
  }

  render() {
    const { t, handleEditContract, handleDeleteContract } = this.props;
    return (
      <div className="contract-list">
        <div className="contract-list__container">
          <Row className="contract-list__row">
            <Col span={ 7 } style={ { zIndex: 10 } } className="contract-list__col">
              <div className="contract-list__landlord-list">
                <div className="contract-list__list-title">
                  <span className="contract-list__list-title-content">{ t('cms.contract.list.title.contract_list') }</span>
                  <span
                    className="contract-list__list-title-arrow"
                    onClick={ this.changeSort }
                    role="button"
                    tabIndex="0"
                  >
                    <Icon type="caret-up" className={ classNames({ 'contract-list__list-title-arrow--black': this.state.SortDescend }) } />
                    <Icon type="caret-down" className={ classNames({ 'contract-list__list-title-arrow--black': !this.state.SortDescend }) } />
                  </span>
                  <button className="contract-list__sort-btn" type="button" />
                </div>
                <div className="contract-list__card-container">
                  <For each="contract" of={ this.props.dataSource }>
                    <div
                      className={ classNames(`contract-list__landlord-card
                         contract-list__landlord-card--${calContractStatus(contract.effectiveFrom, contract.effectiveTo).toLowerCase()}`, {
                        'contract-list__landlord-card--selected': contract.id === this.state.currentContract.id,
                      }) }
                      key={ contract.id }
                      onClick={ () => { this.handleClickLandlordCard(contract); } }
                      role="presentation"
                    >
                      <p className="contract-list__landlord-name">{ contract.landlord ? contract.landlord.name : '' }</p>
                      <p className="contract-list__update-date">
                        { `${t('cms.contract.list.update_date')}${moment(contract.updatedAt).format('DD/MM/YYYY')}` }
                      </p>
                      <span className="contract-list__status" />
                    </div>
                  </For>
                </div>

              </div>
            </Col>
            <Col span={ 17 } className="contract-list__col">
              <div className="contract-list__contract-detail">
                <ContractDetail
                  contract={ this.state.currentContract }
                  handleEditContract={ handleEditContract }
                  handleDeleteContract={ handleDeleteContract }
                  t={ t }
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>);
  }
}

ContractList.propTypes = {
  t: PropTypes.func,
  dataSource: PropTypes.array,
  handleEditContract: PropTypes.func,
  handleDeleteContract: PropTypes.func,
  location: PropTypes.object.isRequired,
  getContractList: PropTypes.func.isRequired,
  formatFilters: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  defaultSearchParams: PropTypes.object.isRequired,
};

ContractList.defaultProps = {
  dataSource: [],
  handleEditContract: () => {},
  handleDeleteContract: () => {},
  t: () => {},
};
