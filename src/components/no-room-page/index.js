import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon } from 'antd'
import { Empty as EmptyIcon } from '~components/svgs'

export default class NoRoomPage extends React.PureComponent {
  render() {
    const { t } = this.props
    return (
      <div className="no-room-page">
        <EmptyIcon className="icon-box" />
        <p className="no-room-hint">{t('cms.properties.edit.rooms.no_room_hint')}</p>
        <Button
          type="primary"
          onClick={() => {
            this.props.handleAddRoomBtnClick()
          }}
        >
          <Icon type="plus" className="icon-plus" />
          {t('cms.property.listing_management.go_to_add_room.btn')}
        </Button>
      </div>
    )
  }
}

NoRoomPage.propTypes = {
  t: PropTypes.func.isRequired,
  handleAddRoomBtnClick: PropTypes.func.isRequired,
}

NoRoomPage.defaultProps = {
  t: () => {},
  handleAddRoomBtnClick: () => {},
}
