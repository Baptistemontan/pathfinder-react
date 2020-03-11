import React, { Component } from "react";

//here is the component to the droping list selector
//its the one who i need the most to rework the HTML/CSS
export default class List extends Component {
  constructor(props) {
    super(props);
    //in input it take an array of choices
    this.choices = this.props.choices;
    //and a "question", which is just the "algorithm :" in front of the drop list
    this.question = this.props.question;
    //a function from its parent wich need the choice in input and will do stuff with it
    this.handleChange = this.props.handleChange;
    //and an ID
    this.id = this.props.id;
    //and the state need 2 things, if its active an the name of the selection
    this.state = {
      active: false,
      name: this.props.name
    };
  }
  //thats when you click on the list
  //it just change toggle the state.active
  handleListClick = () => {
    if (this.state.active) {
      this.setState({ active: false });
    } else {
      this.setState({ active: true });
    }
  };
  //and thats the handler for when you choose an option
  //it change the selection (I dont know why i called it name but whatever, might change that in the future)
  //and close the options
  //and passe the selected item to the change handler
  handleOptionClick = content => {
    this.setState({ name: content, active: false });
    this.handleChange(content);
  };
  //Yeah CSS is a bitch I cant figure out how you center text vertically, so its not centered and it looks like crap
  //I know I do something very weird here and the css that goes along is crappy as hell
  //but it slapt that shit together just to have something to look at, I will change that in the future
  //(thats one of the benefit of React, the component way)
  render() {
    const optionsContainerClass =
      "options-container" + (this.state.active ? " active" : "");
    return (
      <div className="drop-list noselect" id={this.id}>
        <div className="list-question button" onClick={this.handleListClick}>
          {this.question}
        </div>
        <div className="select-box">
          <div className="list-button button" onClick={this.handleListClick}>
            {this.state.name}
          </div>
          <div className={optionsContainerClass}>
            {this.choices.map((name, index) => {
              return (
                <div
                  className="option"
                  key={name}
                  onClick={() => this.handleOptionClick(name)}
                >
                  <input
                    type="radio"
                    className="radio"
                    id={this.id + "option" + index}
                    name="category"
                  />
                  <label htmlFor={this.id + "option" + index}>{name}</label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
