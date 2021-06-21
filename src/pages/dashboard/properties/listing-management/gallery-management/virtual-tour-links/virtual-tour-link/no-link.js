import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

export default class NoVirtualTourLink extends React.PureComponent {
  render() {
    const { t, section } = this.props;
    return (
      <div className="no-virtual-tour-link">
        <Choose>
          <When condition={ section !== 'Overall' }>
            {t('cms.properties.edit.gallery.no_virtual_tour_link', { section: section.toLowerCase() })}
          </When>
          <Otherwise>
            {t('cms.properties.edit.gallery.no_overall_virtual_tour_link')}
          </Otherwise>
        </Choose>
        <span className="add-virtual-tour-link" onClick={ () => { this.props.onAddAnOtherLink(section); } } role="presentation">
          <Icon type="plus" className="icon-plus" />
          {t('cms.properties.edit.gallery.add_virtual_tour_link')}
        </span>
      </div>
    );
  }
}

NoVirtualTourLink.propTypes = {
  t: PropTypes.func,
  onAddAnOtherLink: PropTypes.func,
  section: PropTypes.string,
};

NoVirtualTourLink.defaultProps = {
  t: () => { },
  onAddAnOtherLink: () => { },
  section: '',
};
