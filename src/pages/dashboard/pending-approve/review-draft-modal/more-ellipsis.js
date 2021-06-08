import React from 'react';
import PropTypes from 'prop-types';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';

export default class MoreEllipsis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.richTextContainer) {
        const ellipsisNode = this.richTextContainer.querySelector('.rich-text__old-more');
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
    const { title, content, innerClassName, t } = this.props;
    const moreHint = t('cms.properties.pending_approval.modal.more_hint');

    return (
      <div ref={ (node) => { this.richTextContainer = node; } }>
        <If condition={ content !== undefined }>
          <span className={ `review-draft__details__title ${innerClassName}` }>
            { title }
          </span>
          <HTMLEllipsis
            unsafeHTML={ content }
            maxLine={ this.state.showMore ? '100' : '1' }
            className="ellipsis-html"
            ellipsisHTML={ `...<span class='rich-text__old-more'>${moreHint}</span>` }
          />
        </If>
      </div>
    );
  }
}


MoreEllipsis.propTypes = {
  t: PropTypes.func,
  title: PropTypes.string,
  content: PropTypes.string,
  innerClassName: PropTypes.string,
};

MoreEllipsis.defaultProps = {
  t: () => {},
  title: '',
  content: '',
  innerClassName: '',
};
