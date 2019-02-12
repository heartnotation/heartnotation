import React, { Component } from 'react';
import { Row, Col, Icon, Switch, Button, Steps } from 'antd';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../../utils';

interface State {
  stepProcess: number;
}

interface Status {
  status: {
    name: string;
  };
}

interface Props {
  annotation_id: number;
}

interface PropsButton {
  conditionnal_id: number;
  setProcess: (n: number) => void;
}

function ValidateButton(props: any) {
  return (
    <Button
      type='primary'
      icon='check-circle'
      size='large'
      className='btn-space btn-heartnotation-secondary'
      onClick={() => props.setClick(2)}
    >
      Validate
    </Button>
  );
}

function InvalidateButton(props: any) {
  return (
    <Button
      type='primary'
      icon='close-circle'
      size='large'
      className='btn-space btn-heartnotation-secondary'
      onClick={() => props.setClick(0)}
    >
      Invalidate
    </Button>
  );
}

function CompleteButton(props: any) {
  return (
    <Button
      type='primary'
      icon='check-circle'
      size='large'
      className='btn-space btn-heartnotation-secondary'
      onClick={() => props.setClick(1)}
    >
      Complete
    </Button>
  );
}

function ConditionalButton(props: PropsButton) {
  if (props.conditionnal_id === 0) {
    return <CompleteButton setClick={props.setProcess} />;
  } else if (props.conditionnal_id === 1) {
    return (
      <>
        <ValidateButton setClick={props.setProcess} />
        <InvalidateButton setClick={props.setProcess} />
      </>
    );
  } else if (props.conditionnal_id === 2) {
    return null;
  }
  return null;
}

class HeaderSignalAnnotation extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      stepProcess: 0
    };
  }

  public componentDidMount = () => {
    const { annotation_id } = this.props;
    axios
      .get<Status>('/annotations/' + annotation_id)
      .then((res: AxiosResponse<Status>) => {
        switch (res.data.status.name) {
          case 'IN_PROGRESS':
            this.setState({ stepProcess: 0 });
            break;
          case 'COMPLETED':
            this.setState({ stepProcess: 1 });
            break;
          case 'VALIDATED':
            this.setState({ stepProcess: 2 });
            break;
          default: // error here
        }
        return res.data;
      });
  }

  public setProcess = (value: number) => {
    this.setState({ stepProcess: value });
  }

  public render() {
    const { Step } = Steps;
    const { stepProcess } = this.state;
    return (
      <div className='signal-header'>
        <Row>
          <Col span={4} className='text-left center-vertical-switch'>
            <Switch
              checkedChildren={<Icon type='check' />}
              unCheckedChildren={<Icon type='close' />}
              defaultChecked={true}
            />{' '}
            Display Leads
          </Col>
          <Col span={4} className='text-center'>
            <Button
              type='primary'
              icon='box-plot'
              size='large'
              className='btn-space btn-heartnotation-primary'
            >
              Intervals
            </Button>
            <Button
              type='primary'
              icon='undo'
              size='large'
              className='btn-space btn-heartnotation-primary'
            />
            <Button
              type='primary'
              icon='redo'
              size='large'
              className='btn-space btn-heartnotation-primary'
            />
          </Col>
          <Col span={12} className='text-centered'>
            <Steps progressDot={true} current={stepProcess}>
              <Step title='In Progress' />
              <Step title='Completed' />
              <Step title='Validated' />
            </Steps>
          </Col>
          <Col span={4} className='text-right'>
            <ConditionalButton
              conditionnal_id={stepProcess}
              setProcess={this.setProcess}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default HeaderSignalAnnotation;
