import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Icon } from 'antd';
import Svg from '~components/svg';
import { propertyStatus } from '~constants/landlord';
import SearchComponent from '~components/search-component';
import TableColumnSearch from '~components/table-column-search';

export default class LandlordPropertyRelated extends React.Component {
  constructor() {
    super();
    this.state = {
      filters: {
        pageNumber: 1,
        pageSize: 10,
        slugs: [],
        citySlug: null,
        countrySlugs: [],
        statuses: [],
        bookNowEnable: [],
      },
      visibility: {
        propertyName: false,
        displayCity: false,
        displayCountry: false,
      },
      propertyNameList: [],
      displayCountryList: [],
      isWithoutFilter: true,
    };
  }

  getNewProperties = () => {
    const { slugs, citySlug, countrySlugs, statuses, bookNowEnable } = this.state.filters;
    if (
      citySlug ||
      slugs.length > 0 ||
      countrySlugs.length > 0 ||
      statuses.length > 0 ||
      bookNowEnable.length > 0
    ) {
      this.setState({ isWithoutFilter: false });
    }
    const propertiesParams = Object.assign({}, this.state.filters, {
      landlordSlug: this.props.landlordSlug,
      bookNowEnable: this.state.filters.bookNowEnable[0],
    });
    this.props.getPropertiesByLandlordSlug(propertiesParams);
  };

  handleTableChange = (pagination, filters) => {
    this.state.filters.pageNumber = pagination.current;
    this.state.filters.pageSize = pagination.pageSize;
    this.state.filters.bookNowEnable = filters.bookNowEnable;
    this.state.filters.statuses = filters.status;
    this.setState({
      filters: this.state.filters,
    }, () => {
      this.getNewProperties();
    });
  };

  getTableColumns = () => {
    const { t, landlordSlug } = this.props;
    const { filters, propertyNameList, displayCountryList } = this.state;
    return [
      {
        title: t('cms.landlord.property_related.property_name.table'),
        dataIndex: 'propertyName',
        width: '30%',
        key: 'propertyName',
        render: propertyName => propertyName || '-',
        filterDropdown: (
          <div>
            <label ref={ (node) => { this.propertyNameTargetNode = node; } } />
            <SearchComponent
              t={ t }
              targetInput={ this.propertyNameTargetNode }
              options={ propertyNameList }
              onBlur={ (value) => {
                this.state.filters.slugs = value.value.map(landlord => landlord.slug);
                this.state.filters.pageNumber = 1;
                this.setState({
                  filters: this.state.filters,
                }, () => {
                  this.getNewProperties();
                });
              } }
              onChange={ (value) => {
                if (!value.currentItem) {
                  this.setState({
                    propertyNameList: [...this.state.propertyNameList],
                  });
                }
              } }
              keyValue="slug"
              showSelectAll={ false }
              selectList={ filters.slugs }
            />
          </div>
        ),
        filterIcon: (
          <Icon
            type="search"
            style={ { color: filters.slugs.length > 0 ? '#38b2a6' : '#c8c9cb' } }
          />
        ),
        filterDropdownVisible: this.state.visibility.propertyName,
        onFilterDropdownVisibleChange: (view) => {
          if (view && this.propertyNameTargetNode) {
            setTimeout(() => {
              this.propertyNameTargetNode.click();
            }, 0);
          }
          if (view && propertyNameList.length === 0) {
            this.props.searchPropertyNameList({ landlordSlug }, (res) => {
              this.setState({
                propertyNameList: res.properties.edges.map(property => property.node),
              });
            });
          }
          this.state.visibility.propertyName = view;
          this.setState({
            visibility: this.state.visibility,
          });
        },
      },
      {
        title: t('cms.landlord.property_related.display_city.table'),
        dataIndex: 'displayCity',
        width: '18%',
        key: 'displayCity',
        render: displayCity => displayCity || '-',
        filterDropdown: (
          <TableColumnSearch
            searchType="city"
            isLocaitonCustom
            placeholder={ t('cms.landlord.property_related.table.column.search.city_name') }
            ref={ (component) => { this.displayCityInput = component; } }
            onSearch={ (slug) => {
              this.state.filters.citySlug = slug;
              this.state.filters.pageNumber = 1;
              this.state.visibility.displayCity = false;
              this.setState({
                filters: this.state.filters,
                visibility: this.state.visibility,
              }, () => {
                this.getNewProperties();
              });
            } }
            t={ t }
          />
        ),
        filterIcon: (
          <Icon
            type="filter"
            theme="filled"
            style={ {
              color: filters.citySlug ? '#38b2a6' : '#c8c9cb',
              backgroundColor: 'transparent',
            } }
          />
        ),
        filterDropdownVisible: this.state.visibility.displayCity,
        onFilterDropdownVisibleChange: (view) => {
          if (!view && this.displayCityInput && this.displayCityInput.getValue() === '') {
            this.state.filters.citySlug = null;
            this.state.filters.pageNumber = 1;
            this.setState({
              filters: this.state.filters,
            }, () => {
              this.getNewProperties();
            });
          }

          this.state.visibility.displayCity = view;
          this.setState({
            visibility: this.state.visibility,
          });
        },
      },
      {
        title: t('cms.landlord.property_related.display_country.table'),
        dataIndex: 'displayCountry',
        width: '18%',
        key: 'displayCountry',
        render: displayCountry => displayCountry || '-',
        filterDropdown: (
          <div>
            <label ref={ (node) => { this.displayCountryTargetNode = node; } } />
            <SearchComponent
              t={ t }
              targetInput={ this.displayCountryTargetNode }
              options={ displayCountryList }
              onBlur={ (value) => {
                this.state.filters.countrySlugs = value.value.map(country => country.slug);
                this.state.filters.pageNumber = 1;
                this.setState({
                  filters: this.state.filters,
                }, () => {
                  this.getNewProperties();
                });
              } }
              onChange={ (value) => {
                if (!value.currentItem) {
                  this.setState({
                    displayCountryList: [...this.state.displayCountryList],
                  });
                }
              } }
              keyValue="slug"
              showSelectAll={ false }
              selectList={ filters.countrySlugs }
            />
          </div>
        ),
        filterIcon: (
          <Icon
            type="search"
            style={ { color: filters.countrySlugs.length > 0 ? '#38b2a6' : '#c8c9cb' } }
          />
        ),
        filterDropdownVisible: this.state.visibility.displayCountry,
        onFilterDropdownVisibleChange: (view) => {
          if (view && this.displayCountryTargetNode) {
            setTimeout(() => {
              this.displayCountryTargetNode.click();
            }, 0);
          }
          if (view && displayCountryList.length === 0) {
            this.props.getDisplayCountryList((res) => {
              this.setState({
                displayCountryList: res.countries.edges.map(country => country.node),
              });
            });
          }
          this.state.visibility.displayCountry = view;
          this.setState({
            visibility: this.state.visibility,
          });
        },

      },
      {
        title: t('cms.landlord.property_related.status.table'),
        dataIndex: 'status',
        width: '18%',
        key: 'status',
        render: status => status || '-',
        filters: [
          { text: t(`cms.landlord.property_related.${propertyStatus.PUBLISHED.toLowerCase()}.option`), value: propertyStatus.PUBLISHED },
          { text: t(`cms.landlord.property_related.${propertyStatus.UNPUBLISHED.toLowerCase()}.option`), value: propertyStatus.UNPUBLISHED },
          { text: t(`cms.landlord.property_related.${propertyStatus.EDITING.toLowerCase()}.option`), value: propertyStatus.EDITING },
          { text: t(`cms.landlord.property_related.${propertyStatus.NEW.toLowerCase()}.option`), value: propertyStatus.NEW },
        ],
        filterMultiple: false,
        filteredValue: filters.statuses,
        filterIcon: (
          <Icon
            type="filter"
            theme="filled"
            style={ {
              color: filters.statuses &&
                filters.statuses.length > 0 ? '#38b2a6' : '#c8c9cb',
              backgroundColor: 'transparent',
            } }
          />
        ),
      },
      {
        title: t('cms.landlord.property_related.book_now_enable.table'),
        dataIndex: 'bookNowEnable',
        width: '16%',
        key: 'bookNowEnable',
        render: (bookNowEnable) => {
          if (bookNowEnable) {
            return <Icon type="check" style={ { color: '#419061' } } />;
          }
          return <Icon type="close" style={ { color: '#63656a' } } />;
        },
        filters: [
          { text: t('cms.landlord.property_related.enable.option'), value: true },
          { text: t('cms.landlord.property_related.disable.option'), value: false },
        ],
        filterMultiple: false,
        filteredValue: filters.bookNowEnable,
        filterIcon: (
          <Icon
            type="filter"
            theme="filled"
            style={ {
              color: filters.bookNowEnable &&
                filters.bookNowEnable.length > 0 ? '#38b2a6' : '#c8c9cb',
              backgroundColor: 'transparent',
            } }
          />
        ),
      },
    ];
  }

  render() {
    const { t, properties, isLoading } = this.props;
    return (
      <div className="landlord-property-related">
        <Choose>
          <When condition={ properties.length === 0 && this.state.isWithoutFilter }>
            <div className="landlord-property-related__no-property-wrap">
              <Svg className="landlord-property-related__landlord-no-property" hash="landlord-no-property" />
              <div className="landlord-property-related__description">
                { t('cms.landlord.property_related.no_property.description') }
              </div>
              <Button
                type="primary"
                size="large"
                onClick={ this.props.handleCreateProperty }
                className="landlord-property-related__create-property"
              >
                { t('cms.landlord.property_related.create_property.button') }
              </Button>
            </div>
          </When>
          <Otherwise>
            <Table
              rowKey="id"
              scroll={ { x: false } }
              columns={ this.getTableColumns() }
              className="table-list"
              dataSource={ properties }
              onChange={ this.handleTableChange }
              loading={ isLoading }
              pagination={ {
                showSizeChanger: true,
                total: this.props.activePropertiesCount,
              } }
            />
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

LandlordPropertyRelated.propTypes = {
  t: PropTypes.func.isRequired,
  properties: PropTypes.array,
  handleCreateProperty: PropTypes.func.isRequired,
  activePropertiesCount: PropTypes.number,
  getPropertiesByLandlordSlug: PropTypes.func.isRequired,
  landlordSlug: PropTypes.string,
  isLoading: PropTypes.bool,
  searchPropertyNameList: PropTypes.func,
  getDisplayCountryList: PropTypes.func.isRequired,
};

LandlordPropertyRelated.defaultProps = {
  t: () => {},
  properties: [],
  handleCreateProperty: () => {},
  activePropertiesCount: 0,
  getPropertiesByLandlordSlug: () => {},
  landlordSlug: '',
  isLoading: false,
  searchPropertyNameList: () => {},
  getDisplayCountryList: () => {},
};
