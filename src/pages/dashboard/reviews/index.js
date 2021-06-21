import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import * as actions from '~actions/reviews';
import { Radio } from 'antd';
import { withRouter } from 'react-router-dom';
import update from 'immutability-helper';
import ReviewsTab from '~pages/dashboard/reviews/table';
import { mergeSearchParams } from '~helpers/history';
import queryString from 'query-string';
import { platformEntity, entityAction } from '~constants';
import authControl from '~components/auth-control';

const mapStateToProps = state => ({
  list: state.dashboard.reviews.get('list').toJS(),
  communication: state.dashboard.reviews.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  getReviews: (filters) => {
    dispatch(actions.getReviews(filters));
  },
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
@authControl(
  platformEntity.REVIEWS_REVIEWS,
  entityAction.READ,
)
export default class Reviews extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSearchParams = {
      pageNumber: 1,
      pageSize: 10,
    };

    this.state = {
      filters: this.formatFilters({}),
    };

    this.reviewsStatus = ['APPROVED', 'NEW', 'REJECTED'];
  }

  componentDidMount() {
    this.props.history.push({});
    this.props.getReviews({});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      const searchDate = queryString.parse(nextProps.location.search);
      const filters = this.formatFilters(searchDate);

      this.props.getReviews(filters || {});
      this.setFilters(filters);
    }
  }

  handleChangeStatus = (e) => {
    const params = this.formatFilters({});
    params.statuses = [e.target.value];

    this.pushState(params);
  }

  formatFilters = (filters) => {
    const newFilter = filters;
    if (
      newFilter && newFilter.statuses
      && typeof newFilter.statuses === 'string'
    ) {
      newFilter.statuses = [newFilter.statuses];
    }

    return {
      pageNumber: Number(filters.pageNumber) || 1,
      pageSize: Number(filters.pageSize) || 10,
      statuses: filters.statuses || [],
      propertySlugs:
        filters.propertySlugs && filters.propertySlugs.length > 0 ?
          filters.propertySlugs : null,
      ratingMax: Number(filters.ratingMax) || null,
      ratingMin: Number(filters.ratingMin) || null,
      content: filters.content || null,
      updatedAtMax: filters.updatedAtMax || null,
      updatedAtMin: filters.updatedAtMin || null,
    };
  };

  setFilters = (value) => {
    this.setState({
      filters: update(this.state.filters, { $set: value }),
    });
  }

  pushState = (data) => {
    this.props.history.push(mergeSearchParams(data, this.defaultSearchParams));
  };

  handleTableChange = (pagination) => {
    const params = {
      pageNumber: pagination.current,
    };

    if (pagination.pageSize !== this.state.filters.pageSize) {
      params.pageSize = pagination.pageSize;
      params.pageNumber = 1;
    }

    this.pushState(params);
  };

  handleSearch = (value, type) => {
    const params = { [type]: value, pageNumber: 1 };
    this.pushState(params);
  };

  searchScore = (min, max) => {
    const params = { ratingMin: min, ratingMax: max, pageNumber: 1 };
    this.pushState(params);
  };

  searchDate = (min, max) => {
    const params = { updatedAtMin: min, updatedAtMax: max, pageNumber: 1 };
    this.pushState(params);
  };

  render() {
    const { t, list, communication } = this.props;
    return (
      <div className="reviews">
        <Radio.Group
          defaultValue="all"
          onChange={ this.handleChangeStatus }
        >
          <For each="status" of={ this.reviewsStatus }>
            <Radio.Button
              value={ status }
              key={ status }
              checked={ (
                this.state.filters.statuses &&
                this.state.filters.statuses.length > 0 ?
                  this.state.filters.statuses[0] : 'APPROVED'
              ) === status }
            >
              { t(`cms.reviews.${status.toLowerCase()}`) }
              <If condition={ status === 'NEW' && list.newStatusCount > 0 }>
                &nbsp;({ list.newStatusCount })
              </If>
            </Radio.Button>
          </For>
        </Radio.Group>

        <ReviewsTab
          t={ t }
          filters={ this.state.filters }
          list={ list }
          communication={ communication }
          getReviews={ this.props.getReviews }
          handleTableChange={ this.handleTableChange }
          onSearch={ this.handleSearch }
          searchScore={ this.searchScore }
          searchDate={ this.searchDate }
        />
      </div>
    );
  }
}

Reviews.propTypes = {
  t: PropTypes.func.isRequired,
  getReviews: PropTypes.func,
  list: PropTypes.object,
  communication: PropTypes.object,
  location: PropTypes.object,
  history: PropTypes.object,
};

Reviews.defaultProps = {
  t: () => {},
  getReviews: () => {},
  list: {},
  communication: {},
  location: {},
  history: {},
};
