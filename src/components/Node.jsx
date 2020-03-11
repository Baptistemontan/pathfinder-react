import React, { Component } from "react";

//weight const
const WEIGHT = 15;

export default class Node extends Component {
  constructor(props) {
    super(props);
    //in input it take the parent element and its row/col
    this.parent = this.props.parent;
    this.row = this.props.row;
    this.col = this.props.col;
    this.node = this.parent.grid[this.row][this.col];
    this.launch = this.parent.launch;
    //the state initialisation
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
  //this handle the mouse down, i define what action is goin to be made when the mouse will enter other nodes
  //if the actual node is a wall we say that we want to remove walls
  //if its empty and we right click we want to add weight
  //if its the start node we want to move it
  //you got the point
  onMouseDown = e => {
    this.parent.launchID = null;
    if (!this.parent.autoRefresh) {
      this.parent.reset();
    }
    //if the button == 2 that mean its a right click
    //wich mean the user want to add/remove weights
    if (e.button === 2) {
      this.parent.weightToggle = true;
    }
    this.parent.mousePressed = true;
    if (this.node.isStart || this.node.isEnd) {
      if (this.node.isStart) {
        this.parent.moveStart = true;
      } else {
        this.parent.moveEnd = true;
      }
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

    //and we call the mouseEnter handler because the click event happend after the enter event
    this.onMouseEnter();
  };
  //here we do thing based on what has been defined by the mouseDown handler
  onMouseEnter = () => {
    if (this.parent.mousePressed) {
      if ((this.parent.moveStart || this.parent.moveEnd) && !this.node.isWall) {
        //if we want to move the start/end node we set the actual one to true and update the ex one
        if (this.parent.moveStart && !this.node.isStart) {
          this.node.isStart = true;
          const exNodeRow = this.parent.startNode.row;
          const exNodeCol = this.parent.startNode.col;
          this.parent.grid[exNodeRow][exNodeCol].updateIO();
          this.parent.startNode.row = this.row;
          this.parent.startNode.col = this.col;
          this.setState({ isStart: true });
        } else if (this.parent.moveEnd && !this.node.isEnd) {
          this.node.isEnd = true;
          const exNodeRow = this.parent.endNode.row;
          const exNodeCol = this.parent.endNode.col;
          this.parent.grid[exNodeRow][exNodeCol].updateIO();
          this.parent.endNode.row = this.row;
          this.parent.endNode.col = this.col;
          this.setState({ isEnd: true });
        }
        //if the autoRefrsh is on we refresh the path
        if (this.parent.autoRefresh) {
          this.launch();
        }
      } else {
        //here i if we want to add/remove walls/weights
        if (
          this.parent.addWalls &&
          !this.node.isWall &&
          this.node.weight === 1
        ) {
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
      }
    }
  };
  //this is the handler for when the update event is send
  //it just change the visited/path state
  onUpdate = () => {
    this.node = this.parent.grid[this.row][this.col];
    if (this.node.isPath) {
      this.setState({ isPath: true });
    } else if (this.node.isVisited) {
      this.setState({ isVisited: true });
    }
  };
  //this is the handlers for the animations update,
  //the animation is based on timeout that send event to the node
  //this one update the visited state
  onVisitedUpdate = () => {
    this.setState({ isVisited: true });
  };
  //and this one the path state
  onPathUpdate = () => {
    this.setState({ isPath: true });
  };
  //this is the reset event handler
  onReset = () => {
    this.node = this.parent.grid[this.row][this.col];
    this.setState({
      isPath: false,
      isVisited: false,
      isChecked: false,
      isWall: this.node.isWall,
      weight: this.node.weight
    });
  };
  //this handle the reset io event, it update to false end/start state
  onIOUpdate = () => {
    this.setState({ isStart: false, isEnd: false });
  };
  //when the component has been rendered we add its event listener
  componentDidMount() {
    const eventName = "node-" + this.row + "-" + this.col;
    document.addEventListener("update", this.onUpdate);
    document.addEventListener("reset", this.onReset);
    document.addEventListener(eventName + "-visited", this.onVisitedUpdate);
    document.addEventListener(eventName + "-path", this.onPathUpdate);
    document.addEventListener(eventName + "-IO", this.onIOUpdate);
  }
  render() {
    const { isStart, isEnd, isWall, isVisited, isPath, weight } = this.state;
    //we just update the class of the div based onthe state
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
      >
        <div>
          {/* these are the start/end/weight icons wich will be render or not by the css based on the class */}
          <i className="far fa-dot-circle iend"></i>
          <i className="far fa-compass istart"></i>
          <i className="fas fa-weight-hanging iweight"></i>
        </div>
      </div>
    );
  }
}
