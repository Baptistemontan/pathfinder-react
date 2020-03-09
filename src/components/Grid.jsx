import React, { Component } from "react";
// import "./Grid.css";
import Node from "./Node";

const ROW_NUMBER = 25; //25
const COL_NUMBER = 50; //50
const UPDATE_DELAY = 30;
const sendEvent = name => {
  const event = new CustomEvent(name);
  document.dispatchEvent(event);
};

export default class Grid extends Component {
  constructor(props) {
    super(props);
    this.addWalls = false;
    this.removeWalls = false;
    this.addWeights = false;
    this.removeWeights = false;
    this.mousePressed = false;
    this.weightToggle = false;
    this.moveStart = false;
    this.moveEnd = false;
    this.diagonal = false;
    this.launchID = undefined;
    this.timeOutRef = undefined;
    this.launchDelay = false;
    this.endNode = {
      row: 13,
      col: 45,
      assigned: true
    };
    this.startNode = {
      row: 13,
      col: 5,
      assigned: true
    };
    this.grid = [];
  }

  initGrid = () => {
    for (let row = 0; row < ROW_NUMBER; row++) {
      this.grid[row] = [];
      for (let col = 0; col < COL_NUMBER; col++) {
        this.grid[row][col] = new createNode(row, col);
        if (row === this.startNode.row && col === this.startNode.col) {
          this.grid[row][col].isStart = true;
        }
        if (row === this.endNode.row && col === this.endNode.col) {
          this.grid[row][col].isEnd = true;
        }
      }
    }
  };
  reset() {
    this.grid.forEach(row => row.forEach(node => node.reset()));
    sendEvent("reset");
  }

  visualizeButtonHandler = () => {
    this.launch(true);
  };
  weightButtonHandler = () => {
    if (this.weightToggle) {
      this.weightToggle = false;
    } else {
      this.weightToggle = true;
    }
  };

  launch = (animation = false) => {
    console.time("timer");
    this.reset();
    this.launchID = Math.random();
    const startNode = this.grid[this.startNode.row][this.startNode.col];
    startNode.distance = 0;
    this.Dijkstra(
      startNode,
      this.endNode.row,
      this.endNode.col,
      true,
      this.launchID,
      animation
    );
    if (!animation) {
      sendEvent("update");
    }
    console.timeEnd("timer");
  };

  handleMouseUp = () => {
    clearTimeout(this.timeOutRef);
    this.launchDelay = false;
    this.addWalls = false;
    this.removeWalls = false;
    this.addWeights = false;
    this.removeWeights = false;
    this.mousePressed = false;
    this.moveStart = false;
    this.moveEnd = false;
    this.launch();
  };

  render() {
    this.initGrid();
    return (
      <div className="main" onMouseUp={this.handleMouseUp}>
        <button onClick={this.visualizeButtonHandler}>Visualize</button>
        <button onClick={this.weightButtonHandler}>toggle Weight</button>
        <div id="grid" className="noselect">
          {this.grid.map(row =>
            row.map(node => {
              return (
                <Node
                  id={"node" + node.row + "-" + node.col}
                  key={node.row + "-" + node.col}
                  row={node.row}
                  col={node.col}
                  parent={this}
                  launch={this.launch}
                />
              );
            })
          )}
        </div>
      </div>
    );
  }
  Dijkstra(
    parentNode,
    goalRow,
    goalCol,
    astar,
    ID,
    animation = false,
    nodeQueue = [],
    iteration = 0
  ) {
    const vectors = [
      { row: 1, col: 0 },
      { row: -1, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: -1 }
    ];
    if (this.diagonal) {
      vectors.push(
        { row: 1, col: 1 },
        { row: -1, col: 1 },
        { row: -1, col: -1 },
        { row: 1, col: -1 }
      );
    }
    const sortQueue = () =>
      nodeQueue.sort((a, b) => {
        if (astar) {
          //if we use A* we sort by the distance to the origins + the heurisric distance
          const comparaison =
            a.distance + a.heuristic - (b.distance + b.heuristic);
          // return comparaison;
          //if the comparaison decide which of the 2 elements is the better we return it
          if (comparaison !== 0) {
            return comparaison;
          }
          //otherwise compare the heuristic value of the 2 elements
          return a.heuristic - b.heuristic;
        } else {
          // here we sort by the distance to the origin
          return a.distance - b.distance;
        }
      });
    const testNeighbour = (row, col) => {
      //if its off limit we dont try it
      if (row < ROW_NUMBER && row >= 0 && col < COL_NUMBER && col >= 0) {
        //we retrieve the node
        const neighbourNode = this.grid[row][col];
        //if its a wall,the origin or the node checked, we dont need to try so we end the function
        if (
          neighbourNode.isWall ||
          neighbourNode.isChecked ||
          neighbourNode.isStart
        ) {
          return false; // the return is just to end the function, we dont need to return false
        }
        //to simplify the algorithms I consider undefined as infinity
        //so if its the first time we visit the node we add it to the queue
        if (neighbourNode.distance === undefined) {
          nodeQueue.push(neighbourNode);
        }
        //if it has an infinite distance or if the weight + the 'parent' node distance is less than its actual distance
        //we update its distance and its parent
        if (
          neighbourNode.weight + parentNode.distance < neighbourNode.distance ||
          neighbourNode.distance === undefined
        ) {
          neighbourNode.distance = neighbourNode.weight + parentNode.distance;
          neighbourNode.parentNode = parentNode;
        }
        //if we use A* we assign a heuristic value to the node
        if (astar && neighbourNode.heuristic === undefined) {
          //I propose 2 ways to compute this heuristic value,
          //I didnt made any research on wich one is the best for this case (a grid)
          // but i found the first one to look better with the animations turned on
          //the fisrt on is the min amount of node you ould have to cross if there is no wall or weighted nodes
          //the second one is pure euclidian distance
          //feel free to uncomment/comment those line and try by yourself
          // 1
          neighbourNode.heuristic =
            Math.abs(col - goalCol) + Math.abs(row - goalRow);
          // 2
          // neighbourNode.heuristic = Math.sqrt(
          //   (row - goalRow) ** 2 + (col - goalCol) ** 2
          // );
        }
        // if we are doing some time comparaison we can desactivate the visual update,
        // who will just prevent nodes to refresh their class attributes
        //this if statement is purely visual, so we can skip it

        if (!neighbourNode.isVisited) {
          neighbourNode.isVisited = true;
          if (animation) {
            setTimeout(() => {
              if (this.launchID === ID) {
                neighbourNode.updateVisited();
              }
            }, neighbourNode.distance * UPDATE_DELAY);
          }
        }
      }
    };
    //here is the function to call to update visually the path
    const pathFounded = (parent, offset) => {
      //we skip the start node
      if (!parent.isStart) {
        if (animation) {
          setTimeout(() => {
            if (this.launchID === ID) {
              parent.updatePath();
            }
          }, (offset + parent.distance) * UPDATE_DELAY);
        } else {
          parent.isPath = true;
        }
        pathFounded(parent.parentNode, offset);
      }
    };
    //here we just cycle through each vector to check the neighbours of the current 'parent' node
    vectors.forEach(vector => {
      testNeighbour(parentNode.row + vector.row, parentNode.col + vector.col);
    });
    //then we sort the queue
    sortQueue();
    //and get the next 'parent' node
    const nextNode = nodeQueue[0];
    //if nextNode is undefined, that mean that every possible path as been explore but the end has never been reached, or there is no path to the end node
    if (nextNode === undefined) {
      return false;
    }
    //we remove it from the queue
    nodeQueue.shift();
    //and mark it as checked so we will never look at it again
    nextNode.isChecked = true;
    if (nextNode.isEnd) {
      pathFounded(nextNode, nextNode.distance);
      return true;
    }
    return this.Dijkstra(
      nextNode,
      goalRow,
      goalCol,
      astar,
      ID,
      animation,
      nodeQueue,
      iteration + 1
    );
  }
}

class createNode {
  constructor(row, col) {
    //variable init
    this.row = row;
    this.col = col;
    this.isStart = false;
    this.isEnd = false;
    this.isWall = false;
    this.isVisited = false;
    this.isPath = false;
    this.weight = 1;
    this.distance = undefined;
    this.heuristic = undefined;
  }
  reset() {
    this.isChecked = false;
    this.isVisited = false;
    this.isPath = false;
    this.distance = undefined;
    this.heuristic = undefined;
    this.offset = 0;
    this.delay = 0;
  }
  updateVisited() {
    const eventName = "node-" + this.row + "-" + this.col + "-visited";
    sendEvent(eventName);
  }
  updatePath() {
    this.isPath = true;
    const eventName = "node-" + this.row + "-" + this.col + "-path";
    sendEvent(eventName);
  }
  updateIO() {
    this.isStart = false;
    this.isEnd = false;
    const eventName = "node-" + this.row + "-" + this.col + "-IO";
    sendEvent(eventName);
  }
}
