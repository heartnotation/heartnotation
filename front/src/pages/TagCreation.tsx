import React, { Component } from 'react';
import { Form, Input, Button, Select, Row, Col, Alert, Modal } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { OptionProps } from 'antd/lib/select';
import { RouteComponentProps, withRouter } from 'react-router';
import { Organization, Role, Tag } from '../utils';
import { getAllUsers } from '../utils/api';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

const formTailLayout = {
  wrapperCol: { span: 14, offset: 10 }
};

interface States {
  loading: boolean;
}

interface Props extends FormComponentProps, RouteComponentProps {
  parent_id?: number;
  sendTag: (datas: Tag) => Promise<Tag>;
  handleCancel: () => void;
  handleOk: () => void;
  modalVisible: boolean;
}

class TagCreation extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  public handleOk = (e: React.FormEvent<any>) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        this.props
          .sendTag(values)
          .then(() => {
            this.props.handleOk();
            this.setState({ loading: false });
          })
          .catch(() =>
            this.setState({
              loading: false
            })
          );
      }
    });
  }

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.state;
    // const msgEmpty = 'This field should not be empty';
    const msgRequired = 'This field is required';
    const wrongColorFormat = 'Empty or wrong color format';

    return (
      <Modal
        key={2}
        title='Create tag'
        visible={this.props.modalVisible}
        onCancel={this.props.handleCancel}
        onOk={this.handleOk}
        confirmLoading={loading}
      >
        <Row type='flex' justify='center' align='top'>
          <Col span={15}>
            <Form layout='horizontal'>
              <Form.Item {...formItemLayout} label='Tag name'>
                {getFieldDecorator('name', {
                  rules: [
                    {
                      required: true,
                      message: msgRequired
                    }
                  ]
                })(<Input />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Tag parent id'>
                {getFieldDecorator('parent_id', {
                  initialValue: this.props.parent_id
                })(<Input disabled={true} />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Tag color'>
                {getFieldDecorator('color', {
                  initialValue: [],
                  rules: [
                    {
                      required: true,
                      message: wrongColorFormat,
                      pattern: new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
                    }
                  ]
                })(<Input />)}
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default Form.create()(withRouter(TagCreation));
