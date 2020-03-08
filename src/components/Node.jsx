import React, { Component } from "react";
import "./Node.css";

const TIMEOUT_DELAY = 50;
const WEIGHT = 15;

export default class Node extends Component {
  constructor(props) {
    super(props);
    this.parent = this.props.parent;
    this.row = this.props.row;
    this.col = this.props.col;
    this.node = this.parent.grid[this.row][this.col];
    this.launch = this.props.launch;
    this.timeoutRef = undefined;
    this.state = {
      isWall: false,
      weight: 1,
      isStart: this.node.isStart,
      isEnd: this.node.isEnd,
      isChecked: false,
      isVisited: false,
      isPath: false
    };
  }

  onMouseDown = () => {
    this.parent.mousePressed = true;
    if (this.node.isStart || this.node.isEnd) {
    } else {
      if (this.parent.weightToggle) {
        if (this.node.weight > 1) {
          this.parent.removeWeights = true;
        } else {
          this.parent.addWeights = true;
        }
      } else {
        if (this.node.isWall) {
          this.parent.removeWalls = true;
        } else {
          this.parent.addWalls = true;
        }
      }
    }
    this.onMouseEnter();
  };
  onMouseEnter = () => {
    if (this.parent.mousePressed) {
      clearTimeout(this.parent.timeOutRef);
      if (this.parent.addWalls && !this.node.isWall && this.node.weight === 1) {
        this.node.isWall = true;
        this.setState({ isWall: true });
      } else if (this.parent.removeWalls && this.node.isWall) {
        this.node.isWall = false;
        this.setState({ isWall: false });
      } else if (
        this.parent.addWeights &&
        this.node.weight === 1 &&
        !this.node.isWall
      ) {
        this.node.weight = WEIGHT;
        this.setState({ weight: WEIGHT });
      } else if (this.parent.removeWeights && this.node.weight > 1) {
        this.node.weight = 1;
        this.setState({ weight: 1 });
      }
      this.parent.timeOutRef = setTimeout(() => {
        this.parent.launchDelay = true;
      }, TIMEOUT_DELAY);
    }
    if (this.parent.launchDelay) {
      this.launch();
      this.parent.launchDelay = false;
    }
  };
  onUpdate = () => {
    this.node = this.parent.grid[this.row][this.col];
    if (this.node.isVisited) {
      this.setState({ isVisited: true });
    }
    if (this.node.isPath) {
      this.setState({ isPath: true });
    }
  };
  onVisitedUpdate = () => {
    this.setState({ isVisited: true });
  };
  onPathUpdate = () => {
    this.setState({ isPath: true });
  };
  onReset = () => {
    this.setState({ isPath: false, isVisited: false, isChecked: false });
  };
  componentDidMount() {
    const eventName = "node-" + this.row + "-" + this.col;
    const grid = document.getElementById("grid");
    grid.addEventListener("update", this.onUpdate);
    grid.addEventListener("reset", this.onReset);
    grid.addEventListener(eventName + "-visited", this.onVisitedUpdate);
    grid.addEventListener(eventName + "-path", this.onPathUpdate);
  }
  render() {
    const { isStart, isEnd, isWall, isVisited, isPath, weight } = this.state;
    let classNames = "node ";
    classNames += isStart
      ? "node-start"
      : isEnd
      ? "node-end"
      : isWall
      ? "node-wall"
      : isPath
      ? "node-path"
      : isVisited
      ? "node-visited"
      : "";
    classNames += weight > 1 ? " node-weight" : "";
    return (
      <div
        className={classNames}
        onMouseDown={this.onMouseDown}
        onMouseEnter={this.onMouseEnter}
      ></div>
    );
  }
}