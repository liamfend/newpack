import React from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import { getHtmlLength } from '~helpers/property-edit';
import { debounce } from '~helpers/throttle';

export default class ReactQuillWrapper extends React.Component {
  constructor() {
    super();
    this.handleChange = debounce(500, this.onChange);
  }

  shouldComponentUpdate(nextProps) {
    // eslint-disable-next-line react/prop-types
    if (this.props.value === nextProps.value) {
      return false;
    }
    return true;
  }

  changeRichText = (value) => {
    if (getHtmlLength(value) === 0) { return ''; }
    return value;
  }

  onChange= (content, delta, source) => {
    if (source === 'user') {
      this.props.onChange(
        this.changeRichText(content));
    }
  }

  onBlur = (range, source, editor) => {
    if (this.props.onBlur) { this.props.onBlur(this.changeRichText(editor.getHTML())); }
  }

  formats = [
    'header',
    'bold', 'italic', 'underline', 'link',
    'list', 'bullet',
  ]

  render() {
    return (
      <ReactQuill
        { ...this.props }
        onChange={ this.handleChange }
        onBlur={ this.onBlur }
        modules={ {
          toolbar: [
            [{ header: this.props.fontTypes }],
            ['bold', 'italic', 'underline', 'link'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
          ],
        } }
        formats={ this.formats }
      />
    );
  }
}

ReactQuillWrapper.propTypes = {
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  fontTypes: PropTypes.array,
};

ReactQuillWrapper.defaultProps = {
  fontTypes: [1, 2, 3, false],
  onChange: () => {},
  onBlur: () => {},
};
