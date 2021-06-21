import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';

export default class RichText extends React.PureComponent {
  componentDidMount() {
    setTimeout(() => {
      if (this.richTextContainer) {
        const ellipsisNode = this.richTextContainer.querySelector('.rich-text__old-more');
        const ellipsisWithTooltipNode = this.richTextContainer.querySelector('.rich-text__new-more');
        if (ellipsisWithTooltipNode) {
          if (ellipsisNode) {
            ellipsisNode.parentNode.replaceChild(ellipsisWithTooltipNode, ellipsisNode);
          } else {
            ellipsisWithTooltipNode.parentNode.removeChild(ellipsisWithTooltipNode);
          }
        }
      }
    }, 0);
  }

  render() {
    const moreHint = this.props.t('cms.change_log.detail.more_hint');
    return (
      <div
        className="rich-text"
        ref={ (node) => { this.richTextContainer = node; } }
      >
        <Tooltip
          overlayClassName="rich-text__more-tooltip"
          title={ <span dangerouslySetInnerHTML={ { __html: this.props.unsafeHTML } } /> }
        >
          <span className="rich-text__new-more">{ moreHint }</span>
        </Tooltip>
        <HTMLEllipsis
          unsafeHTML={ this.props.unsafeHTML }
          maxLine="6"
          className="ellipsis-html"
          ellipsisHTML={ `...<span class='rich-text__old-more'>${moreHint}</span>` }
        />
      </div>
    );
  }
}

RichText.propTypes = {
  unsafeHTML: PropTypes.string,
  t: PropTypes.func.isRequired,
};

RichText.defaultProps = {
  unsafeHTML: '',
  t: () => {},
};
