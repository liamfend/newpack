import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class PendingApproveListCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      publishDrafts: [],
      unPublishDrafts: [],
    };
  }

  formatPendingApproveList = () => {
    const { drafts } = this.props;
    const publishDrafts = [];
    const unPublishDrafts = [];

    drafts.sort((a, b) => {
      if (a === b) {
        return 0;
      }
      return moment(b.updatedAt) - moment(a.updatedAt);
    });

    drafts.forEach(item =>
      (item.propertyPublished ? unPublishDrafts.push(item) : publishDrafts.push(item)));

    this.setState({ publishDrafts, unPublishDrafts });
  }

  renderCard = draft => (
    <div
      className="pending-approve__card"
      onClick={ () => { this.props.reviewDraft(draft, draft.draftsCategory); } }
      role="presentation"
    >
      <span className="pending-approve__card__property-name">
        { draft.propertyName }
        <If condition={ draft.draftsCategory.length === 1 && draft.propertyPublished }>
          <span className="pending-approve__card__category">
            { draft.draftsCategory.includes('DETAIL') ? '(Details)' : '(Gallery)' }
          </span>
        </If>
      </span>
      <span className="pending-approve__card-city-date">
        <span className="pending-approve__card__city">
          <span className="pending-approve__card__blank">{ draft.city.name },</span>
          <span className="pending-approve__card__blank">{ draft.city.country.name },</span>
        </span>
        <span className="pending-approve__card__update">
          { moment(draft.updatedAt).format('DD/MM/YYYY') }
        </span>
      </span>
      <If condition={ draft.landlord && draft.landlord.name }>
        <div className="pending-approve__card__landlord">
          <h4 className="pending-approve__card__landlord-title">
            { this.props.t('cms.properties.pending_approval.list.landlord_name') }
          </h4>
          <span className="pending-approve__card__landlord-name">
            { draft.landlord.name }
          </span>
        </div>
      </If>
    </div>
  );

  componentDidMount() {
    this.formatPendingApproveList();
  }

  componentWillReceiveProps(prevProps) {
    if (prevProps.drafts !== this.props.drafts) {
      this.formatPendingApproveList();
    }
  }

  render() {
    const { t } = this.props;

    const { publishDrafts, unPublishDrafts } = this.state;
    return (
      <div className="pending-approve__card-component">
        <If condition={ publishDrafts.length > 0 }>
          <div className="pending-approve__list-content">
            <div className="pending-approve__list-category">
              <span className="pending-approve__list-category__block" />
              <span className="pending-approve__list-category__title">
                { t('cms.properties.property_card.draft.pending.title.publish') }
              </span>
            </div>
            <For each="draft" of={ publishDrafts } index="index">
              <div className="pending-approve__list-hover" key={ `publish-${index}` }>
                { this.renderCard(draft) }
              </div>
            </For>
          </div>
        </If>
        <If condition={ unPublishDrafts.length > 0 }>
          <div className="pending-approve__list-content">
            <div className="pending-approve__list-category">
              <span className="pending-approve__list-category__block" />
              <span className="pending-approve__list-category__title">
                { t('cms.properties.property_card.draft.pending.title.unpublish') }
              </span>
            </div>
            <For each="draft" of={ unPublishDrafts } index="index">
              <div className="pending-approve__list-hover" key={ `unPublish-${index}` }>
                { this.renderCard(draft) }
              </div>
            </For>
          </div>
        </If>
      </div>
    );
  }
}
PendingApproveListCard.propTypes = {
  t: PropTypes.func.isRequired,
  drafts: PropTypes.array,
  reviewDraft: PropTypes.func,
};
PendingApproveListCard.defaultProps = {
  t: () => {},
  drafts: [],
  reviewDraft: () => {},
};
