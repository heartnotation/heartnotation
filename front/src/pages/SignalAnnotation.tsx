import axios from 'axios';
import * as d3 from 'd3';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Row, Col, Icon, Switch, Button } from 'antd';

interface RouteProps extends RouteComponentProps<{ id: string }> {}

interface State {
  leads: number[][];
}

class SignalAnnotation extends Component<RouteProps, State> {
  public constructor(props: RouteProps) {
    super(props);
    this.state = {
      leads: []
    };
  }
  public componentDidMount = async () => {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    const URL = `https://cardiologsdb.blob.core.windows.net/cardiologs-public/ai/${id}.bin`;
    const { data, headers } = await axios.get(URL, {
      responseType: 'arraybuffer'
    });
    const leadNumber = headers.LEAD_NUMBER ? headers.LEAD_NUMBER : 3;
    const datas: Uint16Array = new Uint16Array(data);

    const leads = new Array(leadNumber).fill(null).map(_ => new Array());

    for (let i = 0; i < datas.length; i += leadNumber) {
      for (let j = 0; j < leadNumber; j++) {
        if (datas[i * leadNumber + j] !== undefined) {
          leads[j].push(datas[i * leadNumber + j]);
        }
      }
    }

    await this.setState({ leads });

    const svgWidth = 0.8 * window.innerWidth;
    const svgHeight = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    const height = svgHeight - margin.top - margin.bottom;

    const l: number[] = leads[2];

    const svg = d3
      .select('.signal')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const yMin = d3.min(l);
    const yMax = d3.max(l);

    const x = d3
      .scaleLinear()
      .rangeRound([margin.left, svgWidth - margin.right])
      .domain([0, l.length]);
    const y = d3
      .scaleLinear()
      .range([height - margin.top, margin.bottom])
      .domain([yMin ? yMin : 0, yMax ? yMax : 0]);

    const line = d3
      .line<number>()
      .x((_, index) => x(index))
      .y(d => y(d));

    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .select('.domain')
      .remove();
    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('fill', '#000')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Value');

    g.append('path')
      .datum<number[]>(l)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }

  public render = () => {
    const { leads } = this.state;
    if (!leads.length) {
      return 'Nothing to show';
    }

    return (
      <div>
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
            <Col span={16} className='text-center'>
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
            <Col span={4} className='text-right'>
              <Button
                type='primary'
                icon='check-circle'
                size='large'
                className='btn-space btn-heartnotation-secondary'
              >
                Validate
              </Button>
            </Col>
          </Row>
        </div>
        <div className='signal-main-container'>
          <Row>
            <Col span={20}>
              <div className='signal-graph-container'>
                <svg className='signal' />
              </div>
            </Col>
            <Col span={4}>Legend</Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default withRouter(SignalAnnotation);
