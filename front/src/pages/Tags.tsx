import React, { Component } from 'react';
import AddButton from '../fragments/fixedButton/AddButton';
// TODO

class Tags extends Component {
  public render() {
    return (
      <div>
        <AddButton onClick={this.onClick} />
      </div>
    );
  }
}
export default Tags;
