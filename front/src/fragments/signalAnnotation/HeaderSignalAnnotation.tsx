import React, { Component } from 'react';
import { Row, Col, Icon, Switch, Button, Steps, Alert, Tooltip } from 'antd';
import { Annotation, StatusInserter, Status, api } from '../../utils';
import { RouteComponentProps, withRouter } from 'react-router';
import { withAuth, AuthProps } from '../../utils/auth';
import ChatDrawerAnnotation from '../chatAnnotation/ChatDrawerAnnotation';

interface State {
  stepProcess: number;
  mode: 'Navigation' | 'Annotation' | 'Edit';
  error?: string;
  finalTitle: 'Canceled' | 'Validated';
  finalStatus: 'wait' | 'process' | 'finish' | 'error' | undefined;
}

interface Props extends RouteComponentProps, AuthProps {
  annotation: Annotation;
  onToggle: (tool: 'Navigation' | 'Annotation' | 'Edit') => void;
}

interface PropsButton extends AuthProps {
  conditionnal_id: number;
  annotation: Annotation;
  handleSubmit: (s: StatusInserter) => void;
}

const ValidateButton = (props: PropsButton) => {
  const { user } = props;
  return props.user.role.name === 'Gestionnaire' ? (
    <Button
      type='primary'
      icon='check-circle'
      size='large'
      onClick={() => {
        props.handleSubmit({
          status: 5,
          id: props.annotation.id
        });
      }}
    >
      Validate
    </Button>
  ) : null;
};

const InvalidateButton = (props: PropsButton) => {
  const { user } = props;
  return props.user.role.name === 'Gestionnaire' ? (
    <Button
      type='danger'
      icon='close-circle'
      size='large'
      onClick={() => {
        props.handleSubmit({
          status: 3,
          id: props.annotation.id
        });
      }}
    >
      Invalidate
    </Button>
  ) : null;
};

const CompleteButton = (props: PropsButton) => {
  const { user } = props;
  return props.user.role.name === 'Annotateur' ? (
    <Button
      type='default'
      icon='check-circle'
      size='large'
      onClick={() => {
        props.handleSubmit({
          status: 4,
          id: props.annotation.id
        });
      }}
    >
      Complete
    </Button>
  ) : null;
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

const StepsProcess = (state: State) => {
  const { stepProcess, finalStatus, finalTitle } = state;
  const { Step } = Steps;
  return (
    <Steps
      style={{ paddingTop: 30 }}
      progressDot={true}
      current={stepProcess}
      size='default'
    >
      <Step title='In Progress' />
      <Step title='Completed' />
      <Step title={finalTitle} status={finalStatus} />
    </Steps>
  );
};

class HeaderSignalAnnotation extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let step = -1;
    if (props.annotation.status) {
      props.annotation.status.sort(
        (s1: Status, s2: Status) => s2.date.getTime() - s1.date.getTime()
      );
      let finalT: 'Canceled' | 'Validated' = 'Validated';
      let finalS: 'wait' | 'process' | 'finish' | 'error' | undefined;
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
        case 'CANCELED':
          step = 3;
          finalT = 'Canceled';
          finalS = 'error';
          break;
        default:
          break;
      }
      this.state = {
        stepProcess: step,
        mode: 'Navigation',
        finalTitle: finalT,
        finalStatus: finalS
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
        this.setState({ error: 'Error during using button of header' });
      });
  }

  private handleToggle = (tool: 'Navigation' | 'Annotation' | 'Edit') => {
    this.setState({ mode: tool }, () => this.props.onToggle(tool));
  }

  public render() {
    const { annotation, user } = this.props;
    const { stepProcess, error, mode } = this.state;

    return [
      <Row
        key={1}
        type='flex'
        className='signal-header'
        align='middle'
        justify='space-between'
      >
        <Col span={8}>
          {user.role.name === 'Annotateur' && stepProcess === 0 && (
            <Col span={8}>
              <Button.Group>
                <Tooltip
                  placement='top'
                  title={
                    <div className='text-center'>
                      Switch to navigation mode
                      <br />
                      (zoom and drag)
                    </div>
                  }
                >
                  <Button
                    type='primary'
                    size='large'
                    icon='drag'
                    onClick={() => this.handleToggle('Navigation')}
                  />
                </Tooltip>
                <Tooltip
                  placement='top'
                  title={
                    <div className='text-center'>
                      Switch to annotation mode
                      <br />
                      (creation only)
                    </div>
                  }
                >
                  <Button
                    type='primary'
                    size='large'
                    icon='box-plot'
                    onClick={() => this.handleToggle('Annotation')}
                  />
                </Tooltip>
                <Tooltip
                  placement='top'
                  title={
                    <div className='text-center'>
                      Switch to edit mode
                      <br />
                      (edit and delete annotations)
                    </div>
                  }
                >
                  <Button
                    type='primary'
                    size='large'
                    icon='select'
                    onClick={() => this.handleToggle('Edit')}
                  />
                </Tooltip>
              </Button.Group>
              {' ' + mode} Mode
            </Col>
          )}
        </Col>
        <Col span={8}>
          <StepsProcess
            stepProcess={stepProcess}
            mode={this.state.mode}
            finalTitle={this.state.finalTitle}
            finalStatus={this.state.finalStatus}
          />
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
              user={user}
            />
            {error && <Alert message={error} type='error' />}
          </Row>
        </Col>
      </Row>
    ];
  }
}

export default withRouter(withAuth(HeaderSignalAnnotation));
