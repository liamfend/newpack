import React from 'react'
import PropTypes from 'prop-types'
import { Input, Form, Tooltip } from 'antd'
import SearchComponent from '~components/search-component'

export default class CombinedSearchComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchComponentVisible: false,
      searchComponentSelectedRooms: props.rooms
        .map(item => item.node)
        .filter(item => {
          const unitTypeIds = props.virtualTourLink.unitTypeIdToLinkId
          return unitTypeIds.includes(item.id)
        }),
    }
  }
  render() {
    const { t, rooms, form, virtualTourLink, disabled } = this.props
    const { getFieldDecorator, setFieldsValue } = form
    return (
      <div
        className="combined-search-component"
        ref={node => {
          this.searchComponentContainer = node
        }}
      >
        <Form.Item>
          {getFieldDecorator(`combinedSearchComponent-${virtualTourLink.id}`, {
            initialValue: this.state.searchComponentSelectedRooms.map(item => item.name).join('; '),
            rules: [{ required: true, message: this.props.t('cms.properties.edit.error.blank') }],
          })(
            <Input
              className="combined-search-component__input"
              ref={node => {
                this.targetInput = node.input
              }}
              onFocus={() => {
                this.setState({ searchComponentVisible: true })
              }}
              disabled={disabled}
              placeholder={t('cms.gallery.select_room.placeholder')}
            />,
          )}
          <If condition={this.state.searchComponentVisible}>
            <SearchComponent
              t={t}
              targetInput={this.targetInput}
              container={this.searchComponentContainer}
              options={rooms.map(room => room.node)}
              type={'input'}
              onChange={value => {
                const field = {}
                field[`combinedSearchComponent-${virtualTourLink.id}`] = value.value
                  .map(item => item.name)
                  .join('; ')
                setFieldsValue(field)
                this.setState(
                  {
                    searchComponentSelectedRooms: value.value,
                  },
                  () => {
                    this.props.onChange(virtualTourLink, this.state.searchComponentSelectedRooms)
                  },
                )
              }}
              keyValue="id"
              className="search-component"
              selectList={this.state.searchComponentSelectedRooms.map(item => item.id)}
            />
          </If>
        </Form.Item>
        <If condition={this.state.searchComponentSelectedRooms.length}>
          <Tooltip
            arrowPointAtCenter
            getPopupContainer={() => this.searchComponentContainer}
            placement="topRight"
            title={this.state.searchComponentSelectedRooms.map(item => (
              <div key={item.id} className="indicator-text">
                {item.name}
              </div>
            ))}
          >
            <div className="indicator">+{this.state.searchComponentSelectedRooms.length}</div>
          </Tooltip>
        </If>
      </div>
    )
  }
}

CombinedSearchComponent.propTypes = {
  t: PropTypes.func,
  onChange: PropTypes.func,
  rooms: PropTypes.array,
  form: PropTypes.object,
  virtualTourLink: PropTypes.object,
  disabled: PropTypes.bool,
}

CombinedSearchComponent.defaultProps = {
  t: () => {},
  onChange: () => {},
  rooms: [],
  form: {},
  virtualTourLink: {},
  disabled: false,
}
