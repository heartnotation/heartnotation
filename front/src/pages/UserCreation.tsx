import React, { Component } from 'react';
import { Form, Input, Button, Select, AutoComplete, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { OptionProps } from 'antd/lib/select';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../utils';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

const formTailLayout = {
  wrapperCol: { span: 14, offset: 10 }
};

interface Organization {
  id: number;
  name: string;
  is_active: boolean;
}

interface States {
  organizations: Organization[];
  organizationsSearch: string[];
}

class UserCreation extends Component<FormComponentProps, States> {
  constructor(props: FormComponentProps) {
    super(props);
    this.state = {
      organizations: [],
      organizationsSearch: []
    };
  }

  public componentDidMount = () => {
    const organizationsAjax: Promise<Organization[]> = axios
      .get<Organization[]>(`${API_URL}/organizations`)
      .then((res: AxiosResponse<Organization[]>) => {
        return res.data;
      });

    Promise.all([organizationsAjax]).then((allResponse: Organization[][]) => {
      console.log(allResponse);
      this.setState({
        organizations: allResponse[0]
      });
    });
  }

  public handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { organizations } = this.state;
      if (!err) {
        if (values.organization_id) {
          const findOrgaId = organizations.find(
            (o: Organization) => o.name === values.organization_id
          );
          values.organization_id =
            findOrgaId === undefined ? null : findOrgaId.id;
        } else {
          values.organization_id = null;
        }
        console.log('Received values of form: ', values); // à envoyer vers la route du back
      }
    });
  }

  private filterNoCaseSensitive = (value: string, items: string[]) => {
    const v = value.toLowerCase();
    return items.filter(i => i.toLowerCase().startsWith(v));
  }

  public handleSearchOrganization = (value: string) => {
    const { organizations } = this.state;
    const organizationsSearch = this.filterNoCaseSensitive(
      value,
      organizations.map((o: Organization) => o.name)
    );
    this.setState({
      organizationsSearch:
        organizationsSearch.length !== organizations.length
          ? organizationsSearch
          : []
    });
  }

  public validateOrganization = (_: any, value: any, callback: any) => {
    const { organizations } = this.state;
    if (
      value &&
      !organizations.map((o: Organization) => o.name).includes(value)
    ) {
      callback('This organization doesn\'t exist');
    }
    callback();
  }

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { organizationsSearch } = this.state;
    const msgEmpty = 'This field should not be empty';
    const msgRequired = 'This field is required';
    return (
      <Row type='flex' justify='center' align='top'>
        <Col span={8}>
          <Form layout='horizontal' onSubmit={this.handleSubmit}>
            <Form.Item {...formItemLayout} label='Email Address'>
              {getFieldDecorator('email', {
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
            <Form.Item {...formItemLayout} label='Role'>
              {getFieldDecorator('role', {
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
            <Form.Item {...formItemLayout} label='Organization'>
              {getFieldDecorator('organization_id', {
                initialValue: null,
                rules: [
                  {
                    whitespace: true,
                    message: msgEmpty
                  },
                  { validator: this.validateOrganization }
                ]
              })(
                <AutoComplete
                  dataSource={organizationsSearch}
                  onSearch={this.handleSearchOrganization}
                />
              )}
            </Form.Item>
            <Form.Item {...formTailLayout}>
              <Button type='primary' htmlType='submit'>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    );
  }
}

export default Form.create()(UserCreation);
