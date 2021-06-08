import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import cookies from 'js-cookie';
import { message, Select, Spin } from 'antd';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import update from 'immutability-helper';
import { getItem } from '~base/global/helpers/storage';
import { cookieNames } from '~constants';

const Option = Select.Option;

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: [],
      value: props.defaultValue,
      fetching: false,
    };

    this.timeout = null;
  }

  componentDidMount() {
    if (this.props.defaultValue) {
      this.handleSearch(this.props.defaultValue);
    }
  }

  handleSelect = (value) => {
    if (value) {
      this.props.onSelect(value);
    }
  };

  handleSearch = (value) => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    if (!value) {
      this.setState({
        value: update(this.state.value, { $set: value }),
      });
      return;
    }

    this.setState({
      fetching: true,
    });

    this.timeout = setTimeout(() => {
      const headers = {
        Authorization: `Bearer ${cookies.get(cookieNames.token)}`,
      };
      const authPayload = getItem('PMS_CURRENT_USER_AUTH');
      if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
        headers['Current-Role'] = authPayload.payload.currentRoleSlug;
      }
      axios({
        method: 'post',
        url: endpoints.search.url(this.props.searchType),
        data: queries.search({ query: value }, this.props.searchType),
        headers,
      }).then((response) => {
        if (!response.data.errors) {
          const results = response.data.data.search.edges.map(item => ({
            id: item.node.id,
            name: item.node.name,
          }));
          this.setState({
            results: update(this.state.results, { $set: results }),
            fetching: false,
          });
        } else {
          message.error(this.props.t('cms.message.error'));
        }
      })
        .catch(() => {
          message.error(this.props.t('cms.message.error'));
        });
    }, 300);
  };

  render() {
    return (
      <Select
        ref={ this.props.saveRef }
        showSearch
        autoFocus
        className="add-property__search"
        defaultActiveFirstOption={ false }
        showArrow={ false }
        placeholder={ this.props.placeholder }
        filterOption={ false }
        defaultValue={ this.props.defaultValue }
        notFoundContent={ <If condition={ this.state.fetching }><Spin size="small" /></If> }
        onSearch={ this.handleSearch }
        onSelect={ this.props.onSelect }
        onBlur={ this.props.onSelect }
      >
        <For each="d" of={ this.state.results }>
          <Option value={ d.id } key={ d.id } >{d.name}</Option>
        </For>
      </Select>
    );
  }
}

Search.propTypes = {
  placeholder: PropTypes.string,
  searchType: PropTypes.string,
  defaultValue: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  saveRef: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

Search.defaultProps = {
  placeholder: '',
  searchType: '',
  defaultValue: '',
  onSelect: () => {},
  t: () => {},
};
