import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';

export default class ContentText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.reviewTextContainer) {
        const ellipsisNode = this.reviewTextContainer.querySelector('.reviews-tab__more');
        if (ellipsisNode) {
          ellipsisNode.addEventListener('click', this.handleMore);
        }
      }
    }, 0);
  }

  componentWillUnMount() {
    if (this.reviewTextContainer) {
      const ellipsisNode = this.reviewTextContainer.querySelector('.reviews-tab__more');
      if (ellipsisNode) {
        ellipsisNode.removeEventListener('click', this.handleMore);
      }
    }
  }

  handleMore = () => {
    this.setState({
      showMore: !this.state.showMore,
    });
  };

  render() {
    const { t, record } = this.props;

    return (
      <div className="reviews-tab__content" key={ record.id } ref={ (node) => { this.reviewTextContainer = node; } }>
        <HTMLEllipsis
          unsafeHTML={ record.content.concat('&nbsp;&nbsp;',
            t(`cms.reviews.review.${record.nickname ? 'nick_name' : 'no_name'}`, {
              nickname: record.nickname,
            })) }
          maxLine={ this.state.showMore ? '100' : '3' }
          className={ classNames('ellipsis-html', { 'reviews-tab__content-text':
      (record.propertyImages && record.propertyImages.length > 0)
      || (record.unitTypeImages && record.unitTypeImages.length > 0),
          }) }
          ellipsisHTML={ `...<button class='rich-text__new-more reviews-tab__more' 
        key=${record.id}>${
        t('cms.reviews.table.log_section.more.btn')
      }</button>` }
        />
      </div>
    );
  }
}

ContentText.propTypes = {
  t: PropTypes.func.isRequired,
  record: PropTypes.object,
};

ContentText.defaultProps = {
  t: () => {},
  record: {},
};
