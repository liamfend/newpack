import PropTypes from 'prop-types'
import React from 'react'

export default class Comment extends React.PureComponent {
  render() {
    const { t, section, comment } = this.props

    return (
      <div className="comment">
        <div className="comment__title">
          {t(`cms.draft.comments.section.title.${section.replace(/-/g, '_')}`)}
        </div>
        <div className="comment__content">
          <span dangerouslySetInnerHTML={{ __html: comment }} />
        </div>
      </div>
    )
  }
}

Comment.propTypes = {
  comment: PropTypes.string.isRequired,
  section: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
}

Comment.defaultProps = {
  comment: '',
  section: '',
  t: () => {},
}
