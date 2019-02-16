import React, { Component } from 'react';
import { Row, Col, Icon, Switch, Button, Steps, Alert } from 'antd';
import { Annotation, api } from '../../utils';
import { RouteComponentProps, withRouter } from 'react-router';
import ChatDrawerAnnotation from '../chatAnnotation/ChatDrawerAnnotation';

interface State {
  stepProcess: number;
  mode: 'Navigation' | 'Annotation';
  error?: string;
}

interface Status {
  status: {
    name: string;
  };
}

interface Props extends RouteComponentProps {
  annotation: Annotation;
  onToggle: (state: boolean) => void;
}

interface PropsButton {
  conditionnal_id: number;
  annotation: Annotation;
  handleSubmit: (a: Annotation) => void;
}

function ValidateButton(props: PropsButton) {
  const { annotation, handleSubmit } = props;
  return (
    <Button
      type='primary'
      icon='check-circle'
      size='large'
      className='btn-heartnotation-secondary'
      onClick={() => {
        handleSubmit({
          ...annotation,
          status: { ...annotation.status, id: 5 }
        });
      }}
    >
      Validate
    </Button>
  );
}

function InvalidateButton(props: PropsButton) {
  const { annotation } = props;
  return (
    <Button
      type='primary'
      icon='close-circle'
      size='large'
      className='btn-heartnotation-secondary'
      onClick={() => {
        props.handleSubmit({
          ...annotation,
          status: { ...annotation.status, id: 3 }
        });
      }}
    >
      Invalidate
    </Button>
  );
}

function CompleteButton(props: PropsButton) {
  const { annotation, handleSubmit } = props;
  return (
    <Button
      type='primary'
      icon='check-circle'
      size='large'
      className='btn-heartnotation-secondary'
      onClick={() => {
        handleSubmit({
          ...annotation,
          status: { ...annotation.status, id: 4 }
        });
      }}
    >
      Complete
    </Button>
  );
}

function ConditionalButton(props: PropsButton) {
  const { conditionnal_id } = props;
  if (conditionnal_id === 0) {
    return <CompleteButton {...props} />;
  } else if (conditionnal_id === 1) {
    return (
      <>
        <ValidateButton {...props} />
        <InvalidateButton {...props} />
      </>
    );
  } else if (conditionnal_id === 2) {
    return null;
  }
  return null;
}

class HeaderSignalAnnotation extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let step = -1;
    switch (props.annotation.status.name) {
      case 'IN_PROCESS':
        step = 0;
        break;
      case 'COMPLETED':
        step = 1;
        break;
      case 'VALIDATED':
        step = 2;
        break;
      default:
        break;
    }
    this.state = {
      stepProcess: step,
      mode: 'Navigation'
    };
  }

  public handleSubmit = (annotation: Annotation) => {
    api
      .changeAnnotation(annotation)
      .then(() => {
        this.props.history.push('/');
      })
      .catch(error => {
        this.setState({ error });
      });
  }

  private handleToggle = (toggle: boolean) => {
    this.setState({ mode: toggle ? 'Annotation' : 'Navigation' }, () =>
      this.props.onToggle(toggle)
    );
  }

  public render() {
    const { Step } = Steps;
    const { annotation } = this.props;
    const { stepProcess, error, mode } = this.state;
    return (
      <Row
        type='flex'
        className='signal-header'
        align='middle'
        justify='space-between'
      >
        <Col span={4}>
          <Switch
            checkedChildren={<Icon type='check' />}
            unCheckedChildren={<Icon type='close' />}
            defaultChecked={true}
          />{' '}
          Display Leads
        </Col>
        <Col span={4}>
          {mode} Mode <Switch onChange={this.handleToggle} />
        </Col>
        <Col span={8}>
          <Steps progressDot={true} current={stepProcess}>
            <Step title='In Progress' />
            <Step title='Completed' />
            <Step title='Validated' />
          </Steps>
        </Col>
        <Col offset={1} span={3}>
          <ChatDrawerAnnotation />
        </Col>
        <Col span={4}>
          <ConditionalButton
            conditionnal_id={stepProcess}
            annotation={annotation}
            handleSubmit={this.handleSubmit}
          />
          {error && <Alert message={error} type='error' />}
        </Col>
      </Row>
    );
  }
}

export default withRouter(HeaderSignalAnnotation);
