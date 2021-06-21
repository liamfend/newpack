import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import cookies from 'js-cookie';
import { Form, Select, Icon, Tooltip, message } from 'antd';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import { cookieNames } from '~constants';
import { RecommendedUniversity as RecommendedUniversityIcon } from "~components/svgs";
import { getItem } from '~base/global/helpers/storage';

export default class RecommendedUniversities extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchList: [],
      showNoResultOption: false,
    };
  }

  getUniversities = (value) => {
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
        url: endpoints.search.url('university'),
        data: queries.searchUniversity({
          pageNumber: 1,
          pageSize: 10,
          publishedStatus: 'PUBLISHED',
          query: value,
        }, 'university'),
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

  handleSearch = (e) => {
    this.getUniversities(e);
  }

  handleChange = () => {
    this.setState({
      searchList: [],
    });
  }

  disabledOption = (id) => {
    const universities = [];
    const recommendedUniversities = this.props.form.getFieldValue('universities');
    if (recommendedUniversities && recommendedUniversities.length >= 3) {
      recommendedUniversities.map((item) => {
        universities.push(item.key);

        return true;
      });

      return universities.indexOf(id) === -1;
    }
    return false;
  }


  getInitialValue = () => {
    const data = [];
    if (
      this.props.property
      && this.props.property.universities
      && this.props.property.universities.length > 0
    ) {
      this.props.property.universities.map((item) => {
        const university = {};
        university.key = item.id;
        university.label = item.name;

        data.push(university);

        return true;
      });
    }

    return data;
  }

  render() {
    const { t, form: { getFieldDecorator } } = this.props;

    return (
      <div className="address-detail__recommended-universities">
        <Tooltip
          placement="top"
          title={ t('cms.properties.edit.address.recommended_universities.tips') }
        >
          <Icon type="question-circle" className="address-detail__universities-icon" />
        </Tooltip>
        <Form.Item
          className="address-detail__label"
          label={ t('cms.properties.edit.address.recommended_universities') }
        >
          <RecommendedUniversityIcon className="address-detail__university-icon" />
          {
            getFieldDecorator('universities', {
              trigger: 'onChange',
              initialValue: this.getInitialValue(),
            })(
              <Select
                allowClear
                labelInValue
                mode="multiple"
                placeholder={ t('cms.properties.edit.address.recommended_universities.placeholder') }
                onChange={ this.handleChange }
                onSearch={ this.handleSearch }
                filterOption={ false }
                notFoundContent={ null }
                getPopupContainer={ triggerNode => triggerNode.parentElement }
              >
                { this.state.searchList.map(d => (
                  <Choose>
                    <When condition={ this.disabledOption(d.node.id) }>
                      <Select.Option key={ d.node.id } disabled>
                        <Tooltip
                          placement="top"
                          title={ t('cms.properties.edit.address.recommended_universities.choose_up_to_three.tips') }
                        >
                          { d.node.name }
                        </Tooltip>
                      </Select.Option>
                    </When>
                    <Otherwise>
                      <Select.Option key={ d.node.id } disabled={ false }>
                        { d.node.name }
                      </Select.Option>
                    </Otherwise>
                  </Choose>
                ))}
                <If condition={
                  this.state.searchList.length === 0
                  && this.state.showNoResultOption
                }
                >
                  <Select.Option key="noResult" disabled>
                    <span className="autocomplete__primary-text">
                      { t('cms.message.auto_complete.no_result') }
                    </span>
                  </Select.Option>
                </If>
              </Select>
              ,
            )
          }
        </Form.Item>
      </div>
    );
  }
}

RecommendedUniversities.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object,
  property: PropTypes.object,
};

RecommendedUniversities.defaultProps = {
  t: () => { },
  form: {},
  property: {},
};
