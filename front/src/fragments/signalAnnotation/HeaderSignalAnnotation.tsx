import React, { Component } from 'react';
import { Row, Col, Icon, Switch, Button, Steps, Alert } from 'antd';
import { Annotation, StatusInserter, Status, api } from '../../utils';
import { RouteComponentProps, withRouter } from 'react-router';
import ChatDrawerAnnotation from '../chatAnnotation/ChatDrawerAnnotation';

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
  handleSubmit: (s: StatusInserter) => void;
}

const ValidateButton = (props: PropsButton) => {
  return (
    <Button
      type='primary'
      icon='check-circle'
      size='large'
      onClick={() => {
        props.handleSubmit({
          enum_status_id: 5,
          user_id: 1,
          annotation_id: props.annotation.id
        });
      }}
    >
      Validate
    </Button>
  );
};

const InvalidateButton = (props: PropsButton) => {
  return (
    <Button
      type='danger'
      icon='close-circle'
      size='large'
      onClick={() => {
        props.handleSubmit({
          enum_status_id: 3,
          user_id: 1,
          annotation_id: props.annotation.id
        });
      }}
    >
      Invalidate
    </Button>
  );
};

const CompleteButton = (props: PropsButton) => {
  return (
    <Button
      type='default'
      icon='check-circle'
      size='large'
      onClick={() => {
        props.handleSubmit({
          enum_status_id: 4,
          user_id: 1,
          annotation_id: props.annotation.id
        });
      }}
    >
      Complete
    </Button>
  );
};

const ConditionalButton = (props: PropsButton) => {
  const { conditionnal_id } = props;
  if (conditionnal_id === 0) {
    return <CompleteButton {...props} />;
  } else if (conditionnal_id === 1) {
    return (
      <>
        <Col span={12}>
          <InvalidateButton key={1} {...props} />
        </Col>
        <Col span={12}>
          <ValidateButton key={2} {...props} />
        </Col>
      </>
    );
  } else if (conditionnal_id === 2) {
    return null;
  }
  return null;
};

class HeaderSignalAnnotation extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let step = -1;
    if (props.annotation.status) {
      props.annotation.status.sort(
        (s1: Status, s2: Status) => s2.date.getTime() - s1.date.getTime()
      );
      switch (props.annotation.status[0].enum_status.name) {
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
  }

  public handleSubmit = (s: StatusInserter) => {
    api
      .sendStatus(s)
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
          <ChatDrawerAnnotation annotation_id={this.props.annotation.id} />
        </Col>
        <Col span={4}>
          <Row type='flex' align='middle' justify='end'>
            <ConditionalButton
              conditionnal_id={stepProcess}
              annotation={annotation}
              handleSubmit={this.handleSubmit}
            />
            {error && <Alert message={error} type='error' />}
          </Row>
        </Col>
      </Row>
    );
  }
}

export default withRouter(HeaderSignalAnnotation);
