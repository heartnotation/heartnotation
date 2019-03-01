import React, { Component } from 'react';
import { Form, Input, Row, Col, Modal, Alert } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Tag } from '../utils';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

interface States {
  loading: boolean;
  error: string;
}

interface Props extends FormComponentProps {
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
      loading: false,
      error: ''
    };
  }

  public handleOk = (e: React.FormEvent<any>) => {
    e.preventDefault();
    const {
      form: { validateFields },
      sendTag,
      handleOk
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        sendTag(values)
          .then(() => {
            handleOk();
            this.setState({ loading: false, error: '' });
          })
          .catch(() =>
            this.setState({
              error: 'Failed to send datas',
              loading: false
            })
          );
      }
    });
  }

  public render() {
    const {
      form: { getFieldDecorator },
      modalVisible,
      handleCancel,
      parent_id
    } = this.props;
    const { loading, error } = this.state;
    const msgRequired = 'This field is required';
    const wrongColorFormat = 'Empty or wrong color format';

    return (
      <Modal
        key={2}
        title='Create tag'
        visible={modalVisible}
        onCancel={handleCancel}
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
                  initialValue: parent_id
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
                })(<Input type='color' />)}
              </Form.Item>
            </Form>
            {error && <Alert type='error' message={error} showIcon={true} />}
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default Form.create()(TagCreation);
