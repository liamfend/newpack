import React from 'react';
import PropTypes from 'prop-types';

export default class RichTextViewer extends React.Component {
  constructor() {
    super();

    this.state = {
      showDetail: false,
    };
  }

  toggleDetail = () => {
    this.setState({
      showDetail: !this.state.showDetail,
    });
  }

  render() {
    const { t, content } = this.props;
    return (
      <div className="rich-text-viewer">
        <If condition={ this.state.showDetail }>
          <div className="rich-text-viewer__content" dangerouslySetInnerHTML={ { __html: content } } />
        </If>
        <div
          className="rich-text-viewer__link"
          role="presentation"
          onClick={ this.toggleDetail }
        >
          <Choose>
            <When condition={ this.state.showDetail }>
              {t('cms.properties.edit.review_modal.button.fold_detail')}
            </When>
            <Otherwise>
              {t('cms.properties.edit.review_modal.button.view_detail')}
            </Otherwise>
          </Choose>
        </div>
      </div>
    );
  }
}


RichTextViewer.propTypes = {
  content: PropTypes.string,
  t: PropTypes.func,
};

RichTextViewer.defaultProps = {
  content: '',
  t: () => {},
};
