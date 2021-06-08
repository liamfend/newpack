/* eslint-disable react/prop-types */
/* eslint-disable operator-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { SelectableGroup, createSelectable } from 'react-selectable-fast';

// eslint-disable-next-line react/prop-types
const Item = ({ selectableRef, selected, item }) => (
  <div
    className={ `floor-item ${selected ? 'floor-item--selected' : ''}` }
    ref={ selectableRef }
  >
    {item}
  </div>
);

class Floor extends React.PureComponent {
  constructor() {
    super();
    this.flatArr = [];
    this.state = {
      outerArr: [],
      floors: [],
    };
  }

  /**
   * this.flatArr 初始为[-2, -1, ..., 17], 此方法将 this.flatArr 每十个分为一组存入 outerArr 中来控制显示几行
   * 更新最终渲染的数组outerArr, 结构为 [[-2, -1, ..., 7], [8, 9, ..., 17 ] ..., [..., 47]]
  */
  updateStateOuterArr = (value) => {
    this.setState((state) => {
      const { outerArr } = state;
      const rows = Math.ceil(this.flatArr.length / 10);
      for (let i = 0; i < rows; i++) {
        outerArr[i] = this.flatArr.slice(i * 10, (i * 10) + 10);
      }
      return {
        outerArr: [...outerArr],
        floors: value,
      };
    });
  }

  initFloors = (value) => {
    const withoutFloorsArr = [];
    if (!value.length || Math.max(...value) <= 17) {
      for (let i = -2; i <= 17; i++) {
        withoutFloorsArr.push(i);
      }
      this.flatArr = withoutFloorsArr;
    } else {
      const maxFloor = Math.max(...value);
      const totalFlatArr = [];
      for (let i = -2; i <= 47; i++) {
        totalFlatArr.push(i);
      }
      // totalFlatArr = [-2, -1, 0, ... 47]
      const towDimensionArr = [];
      for (let i = 0; i < Math.ceil(totalFlatArr.length / 10); i++) {
        towDimensionArr[i] = totalFlatArr.slice(i * 10, (i * 10) + 10);
      }
      // towDimensionArr = [[-2, -1, ..., 7], [8, 9, ..., 17 ] ..., [..., 47]]

      const maxFloorRowIndex = towDimensionArr.findIndex(item => item.includes(maxFloor));
      this.flatArr = towDimensionArr.slice(0, maxFloorRowIndex + 1).flat();
    }
  }

  addMore = (e) => {
    e.preventDefault();
    const { flatArr } = this;
    const newArr = [];
    for (let i = flatArr[(flatArr.length - 1)] + 1; i <= flatArr[(flatArr.length - 1)] + 10; i++) {
      if (i <= 47) {
        newArr.push(i);
      }
    }
    this.flatArr = flatArr.concat(newArr);
    this.updateStateOuterArr();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value && !this.props.value) {
      this.initFloors(nextProps.value);
      this.updateStateOuterArr(nextProps.value);
    }
  }

  handleSelectionFinish = (selectedItems) => {
    this.setState({
      floors: selectedItems.map(selectedItem => selectedItem.props.item),
    });
    this.props.onChange(this.state.floors);
  }

  render() {
    const { t } = this.props;
    const SelectableItem = createSelectable(Item);
    return (
      <div>
        <SelectableGroup
          className="select-wrapper"
          enableDeselect
          selectboxClassName="select-box"
          onSelectionFinish={ this.handleSelectionFinish }
        >
          <For of={ this.state.outerArr } each="rowItem" index="index">
            <div style={ { display: 'flex', justifyContent: 'space-between' } } key={ index }>
              <For of={ rowItem } each="floorItem">
                <SelectableItem
                  key={ floorItem }
                  item={ floorItem }
                  selected={ this.props.value.map(Number).includes(floorItem) }
                />
              </For>
            </div>
          </For>
        </SelectableGroup>
        <If condition={ this.state.outerArr.length !== 5 }>
          <a className="add-more" role="button" tabIndex="0" onClick={ this.addMore }>{t('cms.properties.edit.rooms.floor.add_more')}</a>
        </If>
      </div>
    );
  }
}

Floor.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

Floor.defaultProps = {
  t: () => { },
  onChange: () => { },
};

export default Floor;
