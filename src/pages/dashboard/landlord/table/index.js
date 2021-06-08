import React from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Tooltip } from 'antd';
import generatePath from '~settings/routing';
import { communicationStatus } from '~constants';
import { contractStatus } from '~constants/landlord';
import { billingCountries } from '~constants/billing-country';
import SearchComponent from '~components/search-component';

export default class LandlordTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visibility: {
        landlordName: false,
        billingCountry: false,
      },
    };
  }

  getTableColumns = () => {
    const { t, landlordNameList, filters } = this.props;
    return [
      {
        title: t('cms.landlord.landlord_name.table'),
        dataIndex: 'name',
        width: '30%',
        key: 'name',
        render: name => <Tooltip placement="topLeft" title={ name }>{ name }</Tooltip>,
        filterDropdown: (
          <div>
            <label ref={ (node) => { this.landlordNameTargetNode = node; } } />
            <SearchComponent
              t={ t }
              targetInput={ this.landlordNameTargetNode }
              options={ landlordNameList }
              onBlur={ (value) => {
                this.props.handleSetFilters({
                  landlordSlugs: value.value.map(landlord => landlord.slug),
                  pageNumber: 1,
                });
              } }
              onChange={ (value) => {
                if (!value.currentItem) {
                  this.props.updateLandlordList();
                }
              } }
              keyValue="slug"
              showSelectAll={ false }
              selectList={ filters.landlordSlugs }
            />
          </div>
        ),
        filterIcon: (
          <Icon
            type="search"
            style={ { color: filters.landlordSlugs.length > 0 ? '#38b2a6' : '#c8c9cb' } }
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
        title: t('cms.landlord.billing_city.table'),
        dataIndex: 'billingCity',
        width: '18%',
        key: 'billingCity',
        render: billingCity => billingCity || '-',
      },
      {
        title: t('cms.landlord.billing_country.table'),
        dataIndex: 'billingCountry',
        width: '18%',
        key: 'billingCountry',
        render: billingCountry => billingCountry || '-',
        filterDropdown: (
          <div>
            <label ref={ (node) => { this.billingCountryTargetNode = node; } } />
            <SearchComponent
              t={ t }
              targetInput={ this.billingCountryTargetNode }
              options={ billingCountries.map(country => ({ name: country })) }
              onBlur={ (value) => {
                this.props.handleSetFilters({
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
            type="search"
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
        title: t('cms.landlord.property_number.table'),
        dataIndex: 'propertiesCount',
        width: '18%',
        key: 'propertiesCount',
        render: propertiesCount => propertiesCount || 0,
      },
      {
        title: t('cms.landlord.contract_attached.table'),
        dataIndex: 'contractAttachedStatus',
        width: '16%',
        key: 'contractAttachedStatus',
        render: (contractAttachedStatus) => {
          if (contractAttachedStatus === contractStatus.EXPIRED) {
            return <Icon type="close" style={ { color: '#63656a' } } />;
          }
          if (contractAttachedStatus === contractStatus.ACTIVE) {
            return <Icon type="check" style={ { color: '#419061' } } />;
          }
          if (contractAttachedStatus === contractStatus.INACTIVE) {
            return <Icon type="check" style={ { color: '#f9a600' } } />;
          }

          return null;
        },
      },
    ];
  }

  handleTableChange = (pagination) => {
    this.props.handleSetFilters({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  handleClickLandlordRecord = (record) => {
    this.props.history.push(generatePath('landlord', { landlordSlug: record.slug }));
    this.props.setCurrentLandlord(record);
  };

  render() {
    return (
      <div className="landlord-table">
        <Table
          rowKey="id"
          columns={ this.getTableColumns() }
          className="table-list"
          dataSource={ this.props.landlords }
          pagination={ {
            current: this.props.filters.pageNumber,
            pageSize: this.props.filters.pageSize,
            showSizeChanger: true,
            total: this.props.landlordCount,
          } }
          loading={ this.props.getLandlordsStatus === communicationStatus.FETCHING }
          onChange={ this.handleTableChange }
          onRow={ record => ({
            onClick: () => this.handleClickLandlordRecord(record), // click row
          }) }
        />
      </div>
    );
  }
}

LandlordTable.propTypes = {
  t: PropTypes.func.isRequired,
  landlords: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  landlordCount: PropTypes.number.isRequired,
  getLandlordsStatus: PropTypes.string.isRequired,
  handleSetFilters: PropTypes.func.isRequired,
  landlordNameList: PropTypes.array.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  setCurrentLandlord: PropTypes.func.isRequired,
  updateLandlordList: PropTypes.func.isRequired,
};

LandlordTable.defaultProps = {
  t: () => {},
  landlords: [],
  filters: {},
  landlordCount: 0,
  getLandlordsStatus: '',
  handleSetFilters: () => {},
  landlordNameList: [],
  history: {
    push: () => {},
  },
  setCurrentLandlord: () => {},
  updateLandlordList: () => {},
};
