import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// utility functions
const shallowEquals = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) {
    return false;
  }

  let equals = true;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      equals = false;
    }
  }

  return equals;
};

const arrayDiff = (arr1, arr2) => arr1.map((a, i) => (a - arr2[i]));

// display a single cell
const GridCell = props => (
  <div
    className={ classNames('grid-cell', {
      'grid-cell--food': props.foodCell,
      'grid-cell--snake': props.snakeCell,
    }) }
    style={ { height: `${props.size}px`, width: `${props.size}px` } }
  />
);

GridCell.propTypes = {
  size: PropTypes.number.isRequired,
  foodCell: PropTypes.bool,
  snakeCell: PropTypes.any,
};

GridCell.defaultProps = {
  foodCell: false,
  snakeCell: 0,
};

// the main view
export default class SnakeGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      snake: [],
      food: [],
      // 0 = not started, 1 = in progress, 2= finished
      status: 0,
      // using keycodes to indicate direction
      direction: 39,
    };
  }

  componentWillUnmount() {
    this.removeTimers();
  }

  // randomly place snake food
  moveFood = () => {
    if (this.moveFoodTimeout) {
      clearTimeout(this.moveFoodTimeout);
    }

    const x = parseInt(Math.random() * this.numCells, 10);
    const y = parseInt(Math.random() * this.numCells, 10);
    this.setState({ food: [x, y] });
    this.moveFoodTimeout = setTimeout(this.moveFood, 5000);
  }

  setDirection = ({ keyCode }) => {
    // if it's the same direction or simply reversing, ignore
    let changeDirection = true;
    [[38, 40], [37, 39]].forEach((dir) => {
      if (dir.indexOf(this.state.direction) > -1 && dir.indexOf(keyCode) > -1) {
        changeDirection = false;
      }
    });

    if (changeDirection) {
      this.setState({ direction: keyCode });
    }
  }

  moveSnake = () => {
    const newSnake = [];
    // set in the new "head" of the snake
    switch (this.state.direction) {
      // down
      case 40:
        newSnake[0] = [this.state.snake[0][0], this.state.snake[0][1] + 1];
        break;
        // up
      case 38:
        newSnake[0] = [this.state.snake[0][0], this.state.snake[0][1] - 1];
        break;
        // right
      case 39:
        newSnake[0] = [this.state.snake[0][0] + 1, this.state.snake[0][1]];
        break;
        // left
      case 37:
        newSnake[0] = [this.state.snake[0][0] - 1, this.state.snake[0][1]];
        break;
      default:
        break;
    }
    // now shift each "body" segment to the previous segment's position
    [].push.apply(
      newSnake,
      this.state.snake.slice(1).map((s, i) =>
        // since we're starting from the second item in the list,
        // just use the index, which will refer to the previous item
        // in the original list
        this.state.snake[i]),
    );

    this.setState({ snake: newSnake });

    this.checkIfAteFood(newSnake);
    if (!this.isValid(newSnake[0]) || !this.doesntOverlap(newSnake)) {
      // end the game
      this.endGame();
    }
  }

  checkIfAteFood = (newSnake) => {
    if (!shallowEquals(newSnake[0], this.state.food)) {
      return false;
    }
    // snake gets longer
    let newSnakeSegment;
    const lastSegment = newSnake[newSnake.length - 1];

    // where should we position the new snake segment?
    // here are some potential positions, we can choose the best looking one
    const lastPositionOptions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

    // the snake is moving along the y-axis, so try that instead
    if (newSnake.length > 1) {
      lastPositionOptions[0] = arrayDiff(lastSegment, newSnake[newSnake.length - 2]);
    }

    for (let i = 0; i < lastPositionOptions.length; i++) {
      newSnakeSegment = [
        lastSegment[0] + lastPositionOptions[i][0],
        lastSegment[1] + lastPositionOptions[i][1],
      ];
      if (this.isValid(newSnakeSegment)) {
        break;
      }
    }

    this.setState({
      snake: newSnake.concat([newSnakeSegment]),
      food: [],
    });
    this.moveFood();
    return true;
  }

  // is the cell's position inside the grid?
  isValid = cell => (
    cell[0] > -1 &&
    cell[1] > -1 &&
    cell[0] < this.numCells &&
    cell[1] < this.numCells
  );

  doesntOverlap = snake => (
    snake.slice(1).filter(c => shallowEquals(snake[0], c)).length === 0
  );

  startGame = () => {
    this.removeTimers();
    this.moveSnakeInterval = setInterval(this.moveSnake, 130);
    this.moveFood();

    this.setState({
      status: 1,
      snake: [[5, 5]],
      food: [10, 10],
    });
    // need to focus so keydown listener will work!
    this.el.focus();
  }

  endGame = () => {
    this.removeTimers();
    this.setState({
      status: 2,
    });
  }

  removeTimers = () => {
    if (this.moveSnakeInterval) clearInterval(this.moveSnakeInterval);
    if (this.moveFoodTimeout) clearTimeout(this.moveFoodTimeout);
  }

  render() {
    // each cell should be approximately 15px wide, so calculate how many we need
    this.numCells = Math.floor(this.props.size / 15);
    const cellSize = this.props.size / this.numCells;
    const cellIndexes = Array.from(Array(this.numCells).keys());
    const cells = cellIndexes.map(y => cellIndexes.map((x) => {
      const foodCell = this.state.food[0] === x && this.state.food[1] === y;
      let snakeCell = this.state.snake.filter(c => c[0] === x && c[1] === y);
      snakeCell = snakeCell.length && snakeCell[0];

      return (
        <GridCell
          foodCell={ foodCell }
          snakeCell={ snakeCell }
          size={ cellSize }
          key={ `${x} ${y}` }
        />
      );
    }));

    let overlay;
    if (this.state.status === 0) {
      overlay = (
        <div className="snake-app__overlay">
          <button onClick={ this.startGame } className="snake-app__button">Start game!</button>
        </div>
      );
    } else if (this.state.status === 2) {
      overlay = (
        <div className="snake-app__overlay">
          <div className="snake-app__label"><b>GAME OVER!</b></div>
          <div className="snake-app__label">Your score: {this.state.snake.length} </div>
          <button onClick={ this.startGame } className="snake-app__button">Start a new game</button>
        </div>
      );
    }
    return (
      <div
        className="snake-app"
        onKeyDown={ this.setDirection }
        style={ {
          width: `${this.props.size}px`,
          height: `${this.props.size}px`,
        } }
        ref={ (el) => { this.el = el; } }
        role="presentation"
        tabIndex={ -1 }
      >
        {overlay}
        <div
          className="grid"
          style={ {
            width: `${this.props.size}px`,
            height: `${this.props.size}px`,
          } }
        >
          {cells}
        </div>
      </div>
    );
  }
}

SnakeGame.propTypes = {
  size: PropTypes.number.isRequired,
};
