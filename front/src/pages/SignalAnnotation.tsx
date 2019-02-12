import axios from 'axios';
import * as d3 from 'd3';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Row, Col, Icon, Switch, Button, Tag, Steps } from 'antd';
import loadingGif from '../assets/images/loading.gif';
import HeaderSignalAnnotation from '../fragments/signalAnnotation/HeaderSignalAnnotation';

interface RouteProps extends RouteComponentProps<{ id: string }> {}

interface MyData {
  yData: number;
  xData: number;
}
interface State {
  leads: MyData[][];
  loading: boolean;
  moving: boolean;
}

class SignalAnnotation extends Component<RouteProps, State> {
  public constructor(props: RouteProps) {
    super(props);
    this.state = {
      leads: [],
      loading: true,
      moving: true
    };
  }

  public onChange = (checked: boolean) => {
    if(checked === true) {
      d3.select(".zoom").style("display", "none");
    } else {
      d3.select(".zoom").style("display", "block");
    }
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
          leads[j].push({
            xData: i * leadNumber + j,
            yData: datas[i * leadNumber + j]
          });
        }
      }
    }

    await this.setState({ leads, loading: false });

    const svgWidth = window.innerWidth;
    const svgHeight = 600;
    const margin = { top: 20, right: 50, bottom: 100, left: 50 };
    const margin2 = { top: svgHeight - 70, right: 50, bottom: 30, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    const height2 = svgHeight - margin2.top - margin2.bottom;

    const svg = d3
      .select('#signal')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const focus = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const context = svg
      .append('g')
      .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');

    const dataset2 = leads[2];

    const xMax = d3.max(dataset2, d => d.xData);
    const yMax = d3.max(dataset2, d => d.yData) + 5000;
    const xMin = d3.min(dataset2, d => d.xData);
    const yMin = d3.min(dataset2, d => d.yData) - 5000;

    const xScale = d3
      .scaleLinear()
      .range([0, width])
      .domain([0, xMax ? xMax : 0]);

    const yScale = d3
      .scaleLinear()
      .range([0, height])
      .domain([yMax ? yMax : 0, yMin ? yMin : 0]);

    const xScale2 = d3
      .scaleLinear()
      .range([0, width])
      .domain([0, xMax ? xMax : 0]);

    const yScale2 = d3
      .scaleLinear()
      .range([0, height2])
      .domain([yMax ? yMax : 0, yMin ? yMin : 0]);

    dataset2.sort((a, b) => {
      return a.xData - b.xData;
    });

    const lineMain1 = d3
      .line<MyData>()
      .x(d => xScale(d.xData))
      .y(d => yScale(d.yData))
      .curve(d3.curveBasis);

    focus
      .datum<MyData[]>(dataset2)
      .append('path')
      .attr('class', 'line')
      .attr('d', lineMain1);

    const linePreview1 = d3
      .line<MyData>()
      .x(d => xScale2(d.xData))
      .y(d => yScale2(d.yData))
      .curve(d3.curveBasis);

    context
      .datum<MyData[]>(dataset2)
      .append('path')
      .attr('class', 'line')
      .attr('d', linePreview1);

    const yAxis = d3.axisLeft(yScale).tickSize(-width);
    const yAxisGroup = focus.append('g').call(yAxis);

    const xAxis = d3.axisBottom(xScale).tickSize(-height);
    const xAxisGroup = focus
      .append('g')
      .call(xAxis)
      .attr('transform', 'translate(0,' + height + ')');

    const xAxis2 = d3.axisBottom(xScale2);
    const xAxisGroup2 = context
      .append('g')
      .call(xAxis2)
      .attr('transform', 'translate(0,' + height2 + ')');

 
    const zoom: any = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed)
      .filter(() => this.state.moving);

    const brush: any = d3
      .brushX()
      .extent([[0, 0], [width, height2]])
      .on('brush end', brushed);

    const brushAnnotation: any = d3
      .brushX()
      .extent([[0, 0], [width, height]])
      .on('end', () => {
        console.log(d3.event.selection.map(xScale.invert, xScale));
        console.log('Il faut enregistrer les coordonnées')
      });

    focus
      .append('g')
      .attr('class', 'brush')
      .call(brushAnnotation);

    focus
      .append('rect')
      .attr('class', 'zoom')
      .attr('width', width)
      .attr('height', height)
      .call(zoom);

    context
      .append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, xScale2.range());

    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
      xScale.domain(d3.event.transform.rescaleX(xScale2).domain());
      focus
        .datum<MyData[]>(dataset2)
        .select('.line')
        .attr('d', lineMain1);
      xAxisGroup.call(xAxis);

      context
        .select('.brush')
        .call(brush.move, [
          xScale2(d3.event.transform.rescaleX(xScale2).domain()[0]),
          xScale2(d3.event.transform.rescaleX(xScale2).domain()[1])
        ]);
    }

    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
      if (d3.event.selection) {
        xScale.domain([
          xScale2.invert(d3.event.selection[0]),
          xScale2.invert(d3.event.selection[1])
        ]);
      }

      focus
        .datum<MyData[]>(dataset2)
        .select('.line')
        .attr('d', lineMain1);
      xAxisGroup.call(xAxis);
    }

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    focus.select('.line').attr('clip-path', 'url(#clip)');
  }

  

  public render = () => {
    const { loading } = this.state;
    const Step = Steps.Step;

    if (loading) {
      return (
        <img
          style={{ width: '50%', display: 'block', margin: 'auto' }}
          src={loadingGif}
          alt='Loading'
        />
      );
    }

    return (
      <div>
        <HeaderSignalAnnotation annotation_id={123} />
        <div className='signal-main-container'>
          <div className='signal-legend-container'>
            <Tag color='magenta'>magenta</Tag>
            <Tag color='red'>red</Tag>
            <Tag color='volcano'>volcano</Tag>
            <Tag color='orange'>orange</Tag>
            <Tag color='gold'>gold</Tag>
            <Tag color='lime'>lime</Tag>
            <Tag color='green'>green</Tag>
            <Tag color='cyan'>cyan</Tag>
            <Tag color='blue'>blue</Tag>
            <Tag color='geekblue'>geekblue</Tag>
            <Tag color='purple'>purple</Tag>
          </div>
          <div className='signal-toolbox-container'>
            Navigation Mode <Switch onChange={this.onChange} /> Annotation Mode
          </div>
          <div className='signal-graph-container' id='signal' />
        </div>
      </div>
    );
  }
}

export default withRouter(SignalAnnotation);
