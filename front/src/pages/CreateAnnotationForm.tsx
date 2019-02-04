import React, { Component } from "react";
import "antd/dist/antd.css";
import { Form, Icon, Input, Button } from "antd";

class CreateAnnotationForm extends Component {
  public render() {
    return (
      <Form>
        <Input />
        <Input />
        <Input />
        <Button type="primary">Create</Button>
      </Form>
    );
  }
}

export default CreateAnnotationForm;
