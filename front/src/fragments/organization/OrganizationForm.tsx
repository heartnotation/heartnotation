import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col, Alert } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Organization } from '../../utils';

interface Props extends FormComponentProps {
  onSubmit: (o: Organization) => Promise<Organization>;
  onOk: () => void;
  onCancel: () => void;
  defaultValue?: Organization;
  visible: boolean;
}

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

const OrganizationForm = (props: Props) => {
  const { onCancel, defaultValue, visible } = props;
  const { getFieldDecorator } = props.form;

  const msgEmpty = 'This field should not be empty';
  const msgRequired = 'This field is required';

  const [error, setError] = useState('');

  const handleOk = () => {
    const { form, onSubmit, onOk } = props;
    form.validateFields((err, values) => {
      if (!err) {
        onSubmit(values)
          .then(onOk)
          .catch(e => setError(e.data));
      }
    });
  };

  return (
    <Modal onOk={handleOk} onCancel={onCancel} visible={visible}>
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
          {error && <Alert message={error} type='error' showIcon={true} />}
        </Col>
      </Row>
    </Modal>
  );
};
export default Form.create()(OrganizationForm);
