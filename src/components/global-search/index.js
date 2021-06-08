import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import queryString from 'query-string';
import cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { Input, AutoComplete, Icon, message } from 'antd';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import generatePath from '~settings/routing';
import { cookieNames } from '~constants';
import { getNameBySlug } from '~helpers/property-edit';
import { extractSearchParams } from '~helpers/history';
import { getItem } from '~base/global/helpers/storage';
import { isLandlordRole } from '~helpers/auth';

export default class GlobalSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      source: [],
      value: '',
      lastSearch: { name: '', slug: '' },
    };
    this.timeout = null;
  }

  componentDidMount() {
    const searchParams = queryString.parse(this.props.search).search;
    const { type, slug } = extractSearchParams(searchParams);
    this.fillNameBySlug(type, slug);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pathname !== this.props.pathname && nextProps.pathname !== generatePath('properties', {})) {
      this.setState({ source: [], value: '', lastSearch: { name: '', slug: '' } });
    }
    if (nextProps.search !== this.props.search) {
      const searchParams = queryString.parse(nextProps.search).search;
      const { type, slug } = extractSearchParams(searchParams);
      if (type && slug) {
        if (slug !== this.state.lastSearch.slug) {
          if (slug) {
            this.fillNameBySlug(type, slug);
          } else {
            this.setState({ value: '', lastSearch: { name: '', slug: '' } });
          }
        }
      }
    }
  }

  fillNameBySlug = (type, slug) => {
    let query = null;
    switch (type) {
      case 'countrySlug':
        query = queries.queryCountry;
        break;
      case 'citySlug':
        query = queries.queryCity;
        break;
      case 'landlordSlug':
        query = queries.queryLandlord;
        break;
      default:
        query = null;
    }

    if (query && slug) {
      getNameBySlug(query({ slug }))
        .then((name) => {
          this.setState({ value: name, lastSearch: { name, slug } });
        });
    }
  }

  boldKeyword = (text, keyword) => text.replace(new RegExp(keyword, 'i'), '<strong>$&</strong>')

  getChildren = () => {
    if (this.state.source === null) {
      return [(
        <AutoComplete.Option key="noResult">
          <span className="autocomplete__primary-text">
            { this.props.t('cms.message.auto_complete.no_result') }
          </span>
        </AutoComplete.Option>
      )];
    }

    const result = [];
    this.state.source.map((group) => {
      if (group.children && group.children.length > 0) {
        result.push(
          <AutoComplete.OptGroup
            key={ group.title }
            label={ group.title }
          >
            <For each="item" of={ group.children }>
              <AutoComplete.Option key={ item.slug } value={ item.title }>
                <Link
                  to={ this.path(item.type, item.slug) }
                  className="autocomplete__link"
                >
                  <p className="autocomplete__primary-text-container">
                    <span className="autocomplete__primary-text" dangerouslySetInnerHTML={ { __html: this.boldKeyword(item.title, this.state.value.trim()) } } />
                    <If condition={ item.subTitle }>
                      <span className="autocomplete__secondary-text">
                        { item.subTitle }
                      </span>
                    </If>
                  </p>
                </Link>
              </AutoComplete.Option>
            </For>
          </AutoComplete.OptGroup>,
        );
      }
      return true;
    });
    return result;
  };

  handleSearch = (value) => {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.fetch(value ? value.trim() : '');
    }, 300);
  };

  handleSelect = (value, option) => {
    if (value !== 'noResult') {
      this.setState({ value, lastSearch: { name: value, slug: option.key } });
    }
  };

  handleChange = (value, e) => {
    if (typeof e.props.children === 'string') {
      this.setState({ value });
    }
  }

  handleBlur = () => {
    if (this.state.value !== this.state.lastSearch) {
      this.setState({ value: this.state.lastSearch.name });
    }
  }

  fetch = (query) => {
    const headers = {
      'Accept-language': 'en-us',
      Authorization: cookies.get(cookieNames.token) ? `Bearer ${cookies.get(cookieNames.token)}` : '',
    };
    const authPayload = getItem('PMS_CURRENT_USER_AUTH');
    if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
      headers['Current-Role'] = authPayload.payload.currentRoleSlug;
    }
    axios({
      method: 'post',
      url: endpoints.search.url(),
      data: queries.search({ query }),
      headers,
    }).then((response) => {
      if (!response.data.errors) {
        this.processResult(response.data.data.search.edges);
      } else {
        // TODO add more detail error message
        message.error(this.props.t('cms.message.error'));
      }
    })
      .catch(() => {
        // TODO add more detail error message
        message.error(this.props.t('cms.message.error'));
      });
  };

  processResult = (results) => {
    if (!results || results.length === 0) {
      this.setState(Object.assign({}, this.state, { source: null }));
      return false;
    }

    const data = {
      property: [],
      city: [],
      country: [],
      landlord: [],
    };

    results.map((item) => {
      let subTitle = null;
      if (item.node.city) {
        subTitle = `${item.node.city.name}, ${item.node.city.country.name}`;
      } else if (item.node.country) {
        subTitle = item.node.country.name;
      }

      if (
        !(isLandlordRole()
        && item.node.type.toLowerCase() === 'property'
        && item.node.status === 'NEW'
        )) {
        data[item.node.type.toLowerCase()].push({
          title: item.node.name,
          subTitle,
          slug: item.node.slug,
          id: item.node.id,
          type: item.node.type,
        });
      }

      return true;
    });

    this.setState(Object.assign({}, this.state, {
      source: [
        {
          title: this.props.t('cms.search.title.property'),
          children: data.property,
        },
        {
          title: this.props.t('cms.search.title.country'),
          children: data.country,
        },
        {
          title: this.props.t('cms.search.title.city'),
          children: data.city,
        },
        {
          title: this.props.t('cms.search.title.landlord'),
          children: data.landlord,
        },
      ],
    }));

    return true;
  };

  path = (type, value) => {
    const search = `${`${type.toLowerCase()}Slug`}_${value}`;
    switch (type) {
      case 'Landlord':
      case 'Country':
      case 'City':
        return generatePath('properties', {}, { search });
      case 'Property':
        return generatePath('property.homepage', { propertySlug: value });
      default:
        return false;
    }
  };

  clearFilter=(e) => {
    e.stopPropagation();
    this.setState({ source: [], value: '', lastSearch: { name: '', slug: '' } });
    this.props.history.push(generatePath('properties', {}));
  }

  render() {
    return (
      <AutoComplete
        allowClear={ false }
        className="autocomplete"
        dropdownClassName="autocomplete__dropdown"
        dataSource={ this.getChildren() }
        placeholder={ this.props.t('cms.search.input.placeholder') }
        optionLabelProp="value"
        onSearch={ this.handleSearch }
        onSelect={ this.handleSelect }
        onChange={ this.handleChange }
        onBlur={ this.handleBlur }
        value={ this.state.value }
      >
        <Input
          prefix={ <Icon type="search" className="autocomplete__icon" /> }
          value={ this.state.value }
          className="autocomplete__input"
          suffix={
            this.state.lastSearch.name ?
              <Icon type="close-circle" className="autocomplete__icon" onClick={ this.clearFilter } /> : null
          }
        />
      </AutoComplete>
    );
  }
}

GlobalSearch.propTypes = {
  t: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  search: PropTypes.string,
};

GlobalSearch.defaultProps = {
  t: () => {},
  search: '',
};
