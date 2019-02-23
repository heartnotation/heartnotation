import React from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Organization } from '../../utils';

interface Props extends FormComponentProps {
  onSubmit: (o: Organization) => void;
  onCancel: () => void;
  defaultValue?: Organization;
  visible: boolean;
}

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

class OrganizationForm extends React.Component<Props> {
  private handleOk = () => {
    const { form, onSubmit } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onSubmit(values);
      }
    });
  }
  public render = () => {
    const { onCancel, defaultValue, visible } = this.props;
    const { getFieldDecorator } = this.props.form;

    const msgEmpty = 'This field should not be empty';
    const msgRequired = 'This field is required';
    return (
      <Modal onOk={this.handleOk} onCancel={onCancel} visible={visible}>
        <Row type='flex' justify='center' align='top'>
          <Col>
            <Form layout='horizontal'>
              {defaultValue && (
                <Form.Item {...formItemLayout} label='ID'>
                  {getFieldDecorator('id', {
                    initialValue: defaultValue ? defaultValue.id : null
                  })(<Input disabled={true} />)}
                </Form.Item>
              )}
              <Form.Item {...formItemLayout} label='Name'>
                {getFieldDecorator('name', {
                  initialValue: defaultValue ? defaultValue.name : null,
                  rules: [
                    {
                      whitespace: true,
                      message: msgEmpty
                    },
                    {
                      required: true,
                      message: msgRequired
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
export default Form.create()(OrganizationForm);
