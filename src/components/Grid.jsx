import React, { Component } from "react";
import Node from "./Node";
import List from "./List";

//ok this component is a fucking mess but i will try my best to explain it
//all the comments for dijkstra,A* and the maze generator are purely implementation oriented,
//if you want to really understand the code look about those algorithms online,
//I learned Dijkstra and A* with computerphile videos
//and the maze generation general idea with this video : https://www.youtube.com/watch?v=elMXlO28Q1U

//const declaration
const ROW_NUMBER = 23; //23
const COL_NUMBER = 51; //51
//and an event trigger, which will just trigger every event listener that listen for the event name that you pass to the function
//(this app is heavily based on event, i couldnt found another way to centralised the nodes but to update there state themself)
const sendEvent = name => {
  const event = new CustomEvent(name);
  document.dispatchEvent(event);
};

export default class Grid extends Component {
  //this component has no input
  constructor(props) {
    super(props);
    //variable declaration
    this.addWalls = false;
    this.removeWalls = false;
    this.addWeights = false;
    this.removeWeights = false;
    this.mousePressed = false;
    this.weightToggle = false;
    this.moveStart = false;
    this.moveEnd = false;
    this.launchID = undefined;
    this.activeAlgo = null;
    this.diagonal = false; //not implemented yet
    this.algos = ["Dijkstra", "A*", "Random"];
    this.speeds = ["Fast", "Normal", "Slow"];
    this.speed = 20;
    this.refresh = ["ON", "OFF"];
    this.autoRefresh = true;
    this.endNode = {
      row: 11,
      col: 45
    };
    this.startNode = {
      row: 11,
      col: 5
    };
    this.grid = [];
  }
  //when the component is rendered, we prevent the right click pop up, I know its a bad things to do
  //but its just that if every time you add a weight you have this pop up its annoying
  componentDidMount() {
    document.getElementById("grid").addEventListener("contextmenu", e => {
      e.preventDefault();
    });
  }
  //this is to create the grid, wich is just an array of array of nodes (declaration of the class at the end)
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
  //this is to reset all the nodes
  //we also reset the launchID
  //and we tell the nodes they have been reset by triggering the event
  //the difference of reset vs clear is that reset is path related (visited nodes and path)
  // and clear is obstacle related (walls and weight)
  //the update input is in cas we want to reset them but not update them visualy
  reset = (update = true) => {
    this.launchID = Math.random();
    this.grid.forEach(row => row.forEach(node => node.reset()));
    if (update) {
      sendEvent("reset");
    }
  };
  //this is to clear all the nodes
  //and we also call reset at the end
  clear = (update = true) => {
    this.launchID = Math.random();
    this.grid.forEach(row => row.forEach(node => node.clear()));
    this.reset(update);
  };
  //this is to handle the visualize button click
  visualizeButtonHandler = () => {
    this.launch(true);
  };
  //this is the function that launch the algorithm
  //its input is if we have the animtion or not
  //if you click visualize you have the animation
  //but if you move the start node around you dont want to have the animation
  launch = (animation = false) => {
    if (this.activeAlgo != null) {
      //first we reset all the nodes
      this.reset();
      const startNode = this.grid[this.startNode.row][this.startNode.col];
      //then we initialize the start node distance
      startNode.distance = 0;
      //then we look wich algo is active and fire it up
      if (this.activeAlgo === this.algos[0]) {
        this.Dijkstra(
          startNode,
          this.endNode.row,
          this.endNode.col,
          false,
          false,
          this.launchID,
          animation
        );
      }
      if (this.activeAlgo === this.algos[1]) {
        this.Dijkstra(
          startNode,
          this.endNode.row,
          this.endNode.col,
          true,
          false,
          this.launchID,
          animation
        );
      }
      if (this.activeAlgo === this.algos[2]) {
        this.Dijkstra(
          startNode,
          this.endNode.row,
          this.endNode.col,
          false,
          true,
          this.launchID,
          animation
        );
      }
      //then if there is no animation we just told the nodes to update themself
      if (!animation) {
        sendEvent("update");
      }
    } else {
      //if there is no algorithm choosen we just do a little animation on the select button
      const element = document.getElementById("algo-list");
      element.classList.add("choose-algo");
      setTimeout(() => {
        element.classList.remove("choose-algo");
      }, 200);
    }
  };
  //the nodes component handle the moue down/enter themself, but we handle the mouseUp here
  //we just rest all the variable related to create/delete/move things around
  handleMouseUp = () => {
    this.addWalls = false;
    this.removeWalls = false;
    this.addWeights = false;
    this.removeWeights = false;
    this.mousePressed = false;
    this.moveStart = false;
    this.moveEnd = false;
    this.weightToggle = false;
    //and if the auto refresh is toggle we update the path
    if (this.autoRefresh) {
      this.launch();
    }
  };
  //change the active variable based on woch one has been choosen in the list
  handleAlgoChange = content => {
    this.activeAlgo = content;
  };

  //toggle the auto refresh
  handleRefreshChange = content => {
    if (content === "ON") {
      this.autoRefresh = true;
    } else {
      this.autoRefresh = false;
    }
  };
  //change the speed animation based on the choice made
  handleSpeedChange = content => {
    if (content === "Slow") {
      this.speed = 40;
    } else if (content === "Normal") {
      this.speed = 20;
    } else {
      this.speed = 10;
    }
  };
  //this launch the maze generation
  //we reset all the nodes but don't update them(cause we reset them after)
  handleMazeGeneration = () => {
    this.clear(false);
    //we make each node a wall, exept the end/start nodes
    this.grid.forEach(row =>
      row.forEach(node => {
        if (!node.isStart && !node.isEnd) {
          node.isWall = true;
        }
      })
    );
    //and then we call the maze generator who will just cut its way through the walls
    this.mazeGenerator(this.grid[1][1]);
    //then we reset the node again because we modified the isVisited properties of most of them
    this.reset();
  };

  render() {
    this.initGrid();
    return (
      <div className="main">
        <nav className="nav-bar">
          <div className="title">
            <p>PathFinder</p>
          </div>
          <div className="options-bar noselect">
            <List
              handleChange={this.handleAlgoChange}
              name="Select Algorithm"
              choices={this.algos}
              id="algo-list"
              question="Algorithm :"
            />
            <div className="button" onClick={this.visualizeButtonHandler}>
              Visualize
            </div>
            <div className="button" onClick={this.reset}>
              Clear Path
            </div>
            <div className="button" onClick={this.clear}>
              Clear Walls & Weights
            </div>

            <List
              handleChange={this.handleRefreshChange}
              name={this.refresh[0]}
              choices={this.refresh}
              id="refresh-list"
              question="Auto Refresh :"
            />
            <List
              handleChange={this.handleSpeedChange}
              name={this.speeds[1]}
              choices={this.speeds}
              id="speed-list"
              question="Speed :"
            />
            <div className="button" onClick={this.handleMazeGeneration}>
              Generate Maze
            </div>
          </div>
        </nav>
        <div id="exemple">
          <div className="exemple-container">
            <p>Unvisited/Blank Node :</p>
            <div className="node exemple"></div>
          </div>
          <div className="exemple-container">
            <p>Wall Node :</p>
            <div className="node exemple node-wall"></div>
          </div>

          <div className="exemple-container">
            <p>Visited Node :</p>
            <div className="node exemple node-visited"></div>
          </div>
          <div className="exemple-container">
            <p>Path Node :</p>
            <div className="node exemple node-path"></div>
          </div>
          <div className="exemple-container">
            <p>Weighted Node (cost 15 to cross) :</p>
            <div className="node exemple node-weight">
              <div>
                <i className="fas fa-weight-hanging iweight"></i>
              </div>
            </div>
          </div>
        </div>
        <div id="grid" className="noselect" onMouseUp={this.handleMouseUp}>
          {this.grid.map(row =>
            row.map(node => {
              return (
                <Node
                  id={"node" + node.row + "-" + node.col}
                  key={node.row + "-" + node.col}
                  row={node.row}
                  col={node.col}
                  parent={this}
                />
              );
            })
          )}
        </div>
      </div>
    );
  }
  //big oof
  //so here is my implementation of dijkstra
  //Im sure its can be optimised but meh
  //so in input: the start node, the goal row/col, if we use A* or not,random or not,the launchID and if we enable animation
  //so first the launchID, what the heck is that? well if the animation is still going throught and then boum you want a maze
  //you will have your maze but the setTimeout are goig to say: 'I dont care, my mission is to make you a visited node'
  //so to prevent that before each launch of the algorithm i create a random launchID
  //so in the setTimeout I look if the ID has changed, if yes, it dont do shit and my maze is fine
  //so to stop the animation to occur I just change one variable
  //and the random argument is just a troll, this will just shuffle the node queue
  //wich make the algorithm look randomly around
  Dijkstra(
    parentNode,
    goalRow,
    goalCol,
    astar,
    random,
    ID,
    animation = false,
    nodeQueue = [],
    iteration = 0
  ) {
    //here are the vectors for looking at the neighbours
    const vectors = [
      { row: 1, col: 0 },
      { row: -1, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: -1 }
    ];
    // NOT IMPLEMENTED YET
    if (this.diagonal) {
      vectors.push(
        { row: 1, col: 1 },
        { row: -1, col: 1 },
        { row: -1, col: -1 },
        { row: 1, col: -1 }
      );
    }
    //the function to call to sort the queue
    const sortQueue = () =>
      nodeQueue.sort((a, b) => {
        if (astar) {
          //if we use A* we sort by the distance to the origins + the heurisric distance
          const comparaison =
            a.distance + a.heuristic - (b.distance + b.heuristic);
          //if the comparaison decide which of the 2 elements is the better we return it
          if (comparaison !== 0) {
            return comparaison;
          }
          //otherwise compare the heuristic value of the 2 elements
          return a.heuristic - b.heuristic;
        } else if (random) {
          if (a.isEnd) {
            return -1;
          }
          if (b.isEnd) {
            return 1;
          }
          //with random we random sort the list
          return Math.random() - 0.5;
        } else {
          // with vanilla Dijkstra we sort by the distance to the origin
          return a.distance - b.distance;
        }
      });
    //the function that check the neigbours of the active nodes
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
          //if it was never visited before we set it to true
          neighbourNode.isVisited = true;
          //if we have animation on, we set a timeout to update the node
          if (animation) {
            setTimeout(() => {
              if (this.launchID === ID) {
                neighbourNode.updateVisited();
              }
              //this commented line is because I used to set the timeout based on the distance to the origin
              //but to really show how the algorithm work i based it on when she has been visited
              // }, neighbourNode.distance * this.speed);
            }, iteration * this.speed);
          }
        }
      }
    };
    //here is the function to call to update visually the path
    //the offset is the amount of time the visited animation take
    //beause we want to update the path after
    const pathFounded = (parent, offset) => {
      //we skip the start node
      if (!parent.isStart) {
        if (animation) {
          setTimeout(() => {
            if (this.launchID === ID) {
              parent.updatePath();
            }
          }, (offset + parent.distance) * this.speed);
        } else {
          parent.isPath = true;
        }
        pathFounded(parent.parentNode, offset);
      }
    };
    //here we just cycle through each vector to check the neighbours of the current active node
    vectors.forEach(vector => {
      testNeighbour(parentNode.row + vector.row, parentNode.col + vector.col);
    });
    //then we sort the queue
    sortQueue();
    //and get the next 'parent' node
    const nextNode = nodeQueue[0];
    //if nextNode is undefined, that mean that every possible path as been explore but the end has never been reached, so there is no path to the end node
    if (nextNode === undefined) {
      return false;
    }
    //we remove it from the queue
    nodeQueue.shift();
    //and mark it as checked so we will never look at it again
    nextNode.isChecked = true;
    if (nextNode.isEnd) {
      // pathFounded(nextNode, nextNode.distance);
      pathFounded(nextNode, iteration);
      return true;
    }
    //and we call dijktra again and pass it the new Active Node, the Queue and increment the iteration count
    return this.Dijkstra(
      nextNode,
      goalRow,
      goalCol,
      astar,
      random,
      ID,
      animation,
      nodeQueue,
      iteration + 1
    );
  }

  //this maze generator is  just a recursive backtracking
  //we give him an active node
  mazeGenerator(parentNode) {
    //it set it to visited and remove the walls on it
    parentNode.isVisited = true;
    parentNode.isWall = false;
    //its the same vectors than the path finding algorithms but with an scale of 2
    const vectors = [
      { row: 2, col: 0 },
      { row: -2, col: 0 },
      { row: 0, col: 2 },
      { row: 0, col: -2 }
    ];
    const availablesNeigbours = [];
    //thi function will test the giver neigbours
    const testNeigbours = (row, col) => {
      if (row < ROW_NUMBER && row >= 0 && col < COL_NUMBER && col >= 0) {
        //we skip it if its out of bound or if its already been visited
        const neighbourNode = this.grid[row][col];
        if (!neighbourNode.isVisited) {
          //then we add it to the neigbours queue
          availablesNeigbours.push(neighbourNode);
        }
      }
    };
    //this is to remove the walls between this node and the next node
    const openMiddleNode = node => {
      const row = (node.row + parentNode.row) / 2;
      const col = (node.col + parentNode.col) / 2;
      this.grid[row][col].isWall = false;
    };
    //we test all our neigbours node
    vectors.forEach(vector => {
      testNeigbours(parentNode.row + vector.row, parentNode.col + vector.col);
    });
    //if there is no available neighbours we stop for this node
    if (!availablesNeigbours.length) {
      return false;
    }
    //we want a random number between 0 and the number of neigbours we have - 1
    const randomNeighbour = Math.floor(
      Math.random() * availablesNeigbours.length
    );
    //we now have our random neibour
    const nextNode = availablesNeigbours[randomNeighbour];
    nextNode.parentNode = parentNode;
    //we remove the wall between them
    openMiddleNode(nextNode);
    //and call the function on it
    this.mazeGenerator(nextNode);
    //when the recursion of the nextnode end the current node might still have neigbours, so we call the function again on itself
    return this.mazeGenerator(parentNode);
    //and thats it
  }
}

//node class declaration

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
  //call to reset path related things
  reset() {
    this.isChecked = false;
    this.isVisited = false;
    this.isPath = false;
    this.distance = undefined;
    this.heuristic = undefined;
  }
  //update the visited state of its corresponding node component
  updateVisited() {
    const eventName = "node-" + this.row + "-" + this.col + "-visited";
    sendEvent(eventName);
  }
  //update the path state of its corresponding node component
  updatePath() {
    this.isPath = true;
    const eventName = "node-" + this.row + "-" + this.col + "-path";
    sendEvent(eventName);
  }
  //reset the end/start state of its corresponding node
  updateIO() {
    this.isStart = false;
    this.isEnd = false;
    const eventName = "node-" + this.row + "-" + this.col + "-IO";
    sendEvent(eventName);
  }
  //clear wall and weight
  clear() {
    this.isWall = false;
    this.weight = 1;
  }
}
