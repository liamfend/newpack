import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Icon } from 'antd';
import { communicationStatus, platformEntity, entityAction } from '~constants';
import showElementByAuth from '~helpers/auth';


export default class TableList extends React.Component {
  constructor() {
    super();

    this.entityMapping = {
      city: platformEntity.LOCATIONS_CITIES,
      area: platformEntity.LOCATIONS_AREAS,
      university: platformEntity.UNIVERSITIES_UNIVERSITIES,
    };
  }

  render() {
    const { t } = this.props;
    return (
      <div className="table-list">
        <div className="table-header">
          <div className="table-header__container">
            <h1 className="table-header__heading">
              { t(`cms.location.table.num_${this.props.type}`,
                { num: this.props.list.total }) }
            </h1>
            <If condition={ showElementByAuth(
              this.entityMapping[this.props.type],
              entityAction.CREATE,
            ) }
            >
              <div className="table-header__button-container">
                <Button onClick={ this.props.onAddNewBtn } >
                  <Icon type="plus" className="table-list__icon-plus" />
                  { t(`cms.location.table.add_new_${this.props.type}.button`) }
                </Button>
              </div>
            </If>
          </div>
        </div>
        <div className="table-list__wrapper" >
          <Table
            rowKey="id"
            scroll={ { x: '0' } }
            className="table-list"
            columns={ this.props.tableColumns }
            dataSource={ this.props.list.payload }
            onChange={ this.props.handleTableChange }
            loading={ this.props.communication.list.status === communicationStatus.FETCHING }
            pagination={ {
              current: this.props.filters.pageNumber,
              pageSize: this.props.filters.pageSize,
              showSizeChanger: true,
              hideOnSinglePage: false,
              total: this.props.list.total,
            } }
          />
        </div>
      </div>
    );
  }
}

TableList.propTypes = {
  t: PropTypes.func.isRequired,
  type: PropTypes.string,
  list: PropTypes.object,
  handleTableChange: PropTypes.func,
  communication: PropTypes.object,
  filters: PropTypes.object,
  onAddNewBtn: PropTypes.func,
  tableColumns: PropTypes.array,
};

TableList.defaultProps = {
  t: () => {},
  type: '',
  list: {},
  handleTableChange: () => {},
  communication: {},
  filters: {},
  onAddNewBtn: () => {},
  tableColumns: [],
};
