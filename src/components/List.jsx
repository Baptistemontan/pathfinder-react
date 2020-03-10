import React, { Component } from "react";

export default class List extends Component {
  constructor(props) {
    super(props);
    this.list = this.props.choices;
    this.question = this.props.question;
    this.handleChange = this.props.handleChange;
    this.id = this.props.id;
    this.state = {
      active: false,
      name: this.props.name
    };
  }
  handleListClick = () => {
    if (this.state.active) {
      this.setState({ active: false });
    } else {
      this.setState({ active: true });
    }
  };
  handleOptionClick = content => {
    this.setState({ name: content, active: false });
    this.handleChange(content);
  };
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
            {this.list.map((name, index) => {
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
