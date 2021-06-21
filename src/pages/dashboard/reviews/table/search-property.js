import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import cookies from 'js-cookie';
import { message, AutoComplete } from 'antd';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import { cookieNames } from '~constants';
import { getItem } from '~base/global/helpers/storage';

export default class SearchProperty extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchList: [],
      showNoResultOption: false,
    };

    this.name = '';
  }

  componentDidMount() {
    if (this.props.defaultValue) {
      this.getPropertyName();
    }
  }

  getProperties = (value) => {
    const authorization = `Bearer ${cookies.get(cookieNames.token)}`;
    const headers = {
      Authorization: authorization,
      'Accept-Language': 'en-us',
    };
    const authPayload = getItem('PMS_CURRENT_USER_AUTH');

    if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
      headers['Current-Role'] = authPayload.payload.currentRoleSlug;
    }
    if (value) {
      axios({
        method: 'post',
        url: endpoints.search.url('property'),
        data: queries.searchProperty({
          pageNumber: 1,
          pageSize: 10,
          query: value,
        }, 'property'),
        headers,
      }).then((response) => {
        this.setState({
          searchList: response.data.data.search.edges,
          showNoResultOption: response.data.data.search.edges.length === 0,
        });
      }).catch(() => {
        message.error(this.props.t('cms.message.error'));
      });
    }
  }

  handleChange = (e) => {
    this.getProperties(e);
    this.setState({
      searchList: [],
    });

    if (!e) {
      this.props.inputChange(e, 'propertySlugs');
    }
  }

  render() {
    const { t } = this.props;

    return (
      <div className="reviews-tab__search-propery">
        <AutoComplete
          allowClear
          style={ { width: 200 } }
          placeholder={ t('cms.reviews.search.property.placeholder') }
          onChange={ this.handleChange }
          onSelect={ (e) => { this.props.inputChange(e, 'propertySlugs'); } }
          getPopupContainer={ triggerNode => triggerNode.parentElement }
        >
          { this.state.searchList.map(d => (
            <AutoComplete.Option key={ d.node.slug } disabled={ false }>
              { d.node.name }
            </AutoComplete.Option>
          ))}
        </AutoComplete>
      </div>
    );
  }
}

SearchProperty.propTypes = {
  t: PropTypes.func.isRequired,
  inputChange: PropTypes.func,
  defaultValue: PropTypes.string,
};

SearchProperty.defaultProps = {
  t: () => { },
  inputChange: () => {},
  defaultValue: '',
};
