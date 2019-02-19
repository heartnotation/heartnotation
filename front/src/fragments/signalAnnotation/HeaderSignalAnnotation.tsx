import React, { Component } from 'react';
import { Row, Col, Icon, Switch, Button, Steps, Alert } from 'antd';
import { Annotation, api } from '../../utils';
import { RouteComponentProps, withRouter } from 'react-router';
import ChatDrawerAnnotation from '../chatAnnotation/ChatDrawerAnnotation';
import { forceCenter } from 'd3';

interface State {
  stepProcess: number;
  mode: 'Navigation' | 'Annotation';
  error?: string;
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

const ValidateButton = (props: PropsButton) => {
  const { annotation, handleSubmit } = props;
  return (
    <Button
      type='primary'
      icon='check-circle'
      size='large'
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
};

const InvalidateButton = (props: PropsButton) => {
  const { annotation } = props;
  return (
    <Button
      type='danger'
      icon='close-circle'
      size='large'
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
};

class HeaderSignalAnnotation extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let step = -1;
    console.log(props.annotation);
    switch (props.annotation.status.name) {
      case 'ASSIGNED':
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
        <Col>
          <Steps
            style={{ paddingTop: 30 }}
            progressDot={true}
            current={stepProcess}
            size='default'
          >
            <Step title='In Progress' />
            <Step title='Completed' />
            <Step title='Validated' />
          </Steps>
        </Col>
        <Col offset={1} span={3}>
          <ChatDrawerAnnotation />
        </Col>
        <Col span={4}>
          <Row type='flex' align='middle' justify='end'>
            {error && <Alert message={error} type='error' />}
          </Row>
        </Col>
      </Row>
    );
  }
}

export default withRouter(HeaderSignalAnnotation);
