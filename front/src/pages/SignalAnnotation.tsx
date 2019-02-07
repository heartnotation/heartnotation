import axios from 'axios';
import * as d3 from 'd3';
import * as d3Zoom from 'd3-zoom';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Row, Col, Icon, Switch, Button, Tag } from 'antd';

interface RouteProps extends RouteComponentProps<{ id: string }> {}

interface MyData {
  yData: number;
  xData: number;
}
interface State {
  leads: MyData[][];
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
          leads[j].push({
            xData: i * leadNumber + j,
            yData: datas[i * leadNumber + j]
          });
        }
      }
    }

    await this.setState({ leads });

    // const leadData: number[] = leads[2];

    // const svgWidth = 4000; // 0.8 * window.innerWidth;
    // const svgHeight = 400;

    // const svg = d3
    //   .select('#signal')
    //   .attr('width', svgWidth)
    //   .attr('height', svgHeight);

    // const marginMainGraph = { top: 20, right: 20, bottom: 110, left: 40 };
    // const marginPreviewGraph = { top: 430, right: 20, bottom: 30, left: 40 };
    // const width = svgWidth - marginMainGraph.left - marginMainGraph.right;
    // const heightMainGraph =
    //   svgHeight - marginMainGraph.top - marginMainGraph.bottom;
    // const heightPreviewGraph =
    //   svgHeight - marginPreviewGraph.top - marginPreviewGraph.bottom;

    // const xMainGraph = d3.scaleLinear().range([0, leadData.length]);
    // const xPreviewGraph = d3.scaleLinear().range([0, leadData.length]);
    // const yMainGraph = d3.scaleLinear().range([heightMainGraph, 0]);
    // const yPreviewGraph = d3.scaleLinear().range([heightPreviewGraph, 0]);

    // const xAxisMainGraph = d3.axisBottom(xMainGraph);
    // const xAxisPreviewGraph = d3.axisBottom(xPreviewGraph);
    // const yAxisMainGraph = d3.axisLeft(yMainGraph);

    // const chart = svg
    //   .append('g')
    //   .attr('class', 'focus')
    //   .attr(
    //     'transform',
    //     'translate(' + marginMainGraph.left + ',' + marginMainGraph.top + ')'
    //   )
    //   .attr('clip-path', 'url(#clip)');

    // const focus = svg
    //   .append('g')
    //   .attr('class', 'focus')
    //   .attr(
    //     'transform',
    //     'translate(' + marginMainGraph.left + ',' + marginMainGraph.top + ')'
    //   );

    // const context = svg
    //   .append('g')
    //   .attr('class', 'context')
    //   .attr(
    //     'transform',
    //     'translate(' +
    //       marginPreviewGraph.left +
    //       ',' +
    //       marginPreviewGraph.top +
    //       ')'
    //   );

    // const lineMainGraph = d3
    //   .line<number>()
    //   .x((_, index) => xMainGraph(index))
    //   .y(d => yMainGraph(d));

    // const linePreviewGraph = d3
    //   .line<number>()
    //   .x((_, index) => xMainGraph(index))
    //   .y(d => yMainGraph(d));

    // const clip = svg
    //   .append('defs')
    //   .append('svg:clipPath')
    //   .attr('id', 'clip')
    //   .append('svg:rect')
    //   .attr('width', width)
    //   .attr('height', heightMainGraph)
    //   .attr('x', 0)
    //   .attr('y', 0);

    // const yMin = d3.min(leadData);
    // const yMax = d3.max(leadData);

    // xMainGraph.domain([0, leadData.length]);
    // yMainGraph.domain([yMin ? yMin : 0, yMax ? yMax : 0]);
    // xPreviewGraph.domain(xMainGraph.domain());
    // yPreviewGraph.domain(yMainGraph.domain());

    // focus
    //   .append('g')
    //   .attr('class', 'axis axis--x')
    //   .attr('transform', 'translate(0,' + heightMainGraph + ')')
    //   .call(xAxisMainGraph);

    // focus
    //   .append('g')
    //   .attr('class', 'axis axis--y')
    //   .call(yAxisMainGraph);

    // chart
    //   .append('path')
    //   .datum(leadData)
    //   .attr('class', 'line')
    //   .attr('d', lineMainGraph);

    // context
    //   .append('path')
    //   .datum(leadData)
    //   .attr('class', 'line')
    //   .attr('d', linePreviewGraph);

    // context
    //   .append('g')
    //   .attr('class', 'axis axis--x')
    //   .attr('transform', 'translate(0,' + heightPreviewGraph + ')')
    //   .call(xAxisPreviewGraph);

    // const brush = d3.brushX().extent([[0, 0], [width, heightPreviewGraph]]);
    // const zoom = d3
    //   .zoom()
    //   .scaleExtent([1, Infinity])
    //   .translateExtent([[0, 0], [width, heightMainGraph]])
    //   .extent([[0, 0], [width, heightMainGraph]]);

    // const zoomed = () => {
    //   if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') {
    //     return;
    //   } // ignore zoom-by-brush
    //   const t = d3.event.transform;
    //   xMainGraph.domain(t.rescaleX(xPreviewGraph).domain());
    //   /*chart.select('.line').attr('d', lineMainGraph);
    //   focus.select('.axis--x').call(xAxisMainGraph);
    //   context
    //     .select('.brush')
    //     .call(brush.move, xMainGraph.range().map(t.invertX, t));*/
    // };

    // const brushed = () => {
    //   if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') {
    //     return;
    //   } // ignore brush-by-zoom
    //   const s = d3.event.selection || xPreviewGraph.range();
    //   xMainGraph.domain(s.map(xPreviewGraph.invert, xPreviewGraph));
    //  /* chart.select('.line').attr('d', lineMainGraph);
    //   focus.select('.axis--x').call(xAxisMainGraph);
    //   svg
    //     .select('.zoom')
    //     .call(
    //       zoom.transform,
    //       d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
    //     );*/
    // };

    // brush.on('brush end', brushed);
    // zoom.on('zoom', zoomed);

    // context
    //   .append('g')
    //   .attr('class', 'brush')
    //   .call(brush)
    //   .call(brush.move, xMainGraph.range());

    /*
    const svgWidth = 3000;
    const svgHeight = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    const height = svgHeight - margin.top - margin.bottom;

    const l: number[] = leads[2];

    const svg = d3
      .select('#signal')
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
      .attr('d', line);*/

    const svgWidth = window.innerWidth;
    const svgHeight = 600;
    const margin = { top: 20, right: 50, bottom: 100, left: 50 };
    const margin2 = { top: svgHeight - 70, right: 50, bottom: 30, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    const height2 = svgHeight - margin2.top - margin2.bottom;

    // add svg with margin !important
    // this is svg is actually group
    const svg = d3
      .select('#signal')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const focus = svg
      .append('g') // add group to leave margin for axis
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const context = svg
      .append('g')
      .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');

    /*
    const dataset2: MyData[] = [
      {
        xData: 5,
        yData: 20
      },
      {
        xData: 480,
        yData: 90
      },
      {
        xData: 250,
        yData: 50
      },
      {
        xData: 100,
        yData: 33
      },
      {
        xData: 330,
        yData: 95
      },
      {
        xData: 410,
        yData: 12
      },
      {
        xData: 475,
        yData: 44
      },
      {
        xData: 25,
        yData: 67
      },
      {
        xData: 85,
        yData: 21
      },
      {
        xData: 220,
        yData: 88
      }
    ];*/

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
      .domain([yMax ? yMax : 0, 0]);

    const xScale2 = d3
      .scaleLinear()
      .range([0, width])
      .domain([0, xMax ? xMax : 0]);

    const yScale2 = d3
      .scaleLinear()
      .range([0, height2])
      .domain([yMax ? yMax : 0, 0]);

    // sort x
    dataset2.sort((a, b) => {
      return a.xData - b.xData;
    });

    const line = d3
      .line<MyData>()
      .x(d => xScale(d.xData))
      .y(d => yScale(d.yData))
      .curve(d3.curveBasis);

    focus
      .datum<MyData[]>(dataset2)
      .append('path')
      .attr('class', 'line')
      .attr('d', line);

    const line2 = d3
      .line<MyData>()
      .x(d => xScale2(d.xData))
      .y(d => yScale2(d.yData))
      .curve(d3.curveBasis); // default is d3.curveLinear

    context
      .datum<MyData[]>(dataset2)
      .append('path')
      .attr('class', 'line')
      .attr('d', line2);

    // add x and y axis
    const yAxis = d3.axisLeft(yScale).tickSize(-width);
    const yAxisGroup = focus.append('g').call(yAxis);

    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(-height); /*.tickFormat("");remove tick label*/
    const xAxisGroup = focus
      .append('g')
      .call(xAxis)
      .attr('transform', 'translate(0,' + height + ')');

    const xAxis2 = d3.axisBottom(xScale2); // no need to create grid
    const xAxisGroup2 = context
      .append('g')
      .call(xAxis2)
      .attr('transform', 'translate(0,' + height2 + ')');

    // add zoom
    const zoom = d3
      .zoom()
      .scaleExtent([1, Infinity]) // <1 means can resize smaller than  original size
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]) // view point size
      .on('zoom', zoomed);

    svg
      .append('rect')
      .attr('class', 'zoom')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .call(() => zoom);

    const brush = d3
      .brushX()
      .extent([[0, 0], [width, height2]]) // (x0,y0)  (x1,y1)
      .on('brush end', brushed); // when mouse up, move the selection to the exact tick //start(mouse down), brush(mouse move), end(mouse up)

    context
      .append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, xScale2.range());

    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
      xScale.domain(d3.event.transform.rescaleX(xScale2).domain());
      focus
        .datum<MyData[]>(dataset2)
        .select('.line')
        .attr('d', line);
      xAxisGroup.call(xAxis); // rescale x

      // brush area
      context
        .select('.brush')
        .call(() => brush.move, [
          xScale2(d3.event.transform.rescaleX(xScale2).domain()[0]),
          xScale2(d3.event.transform.rescaleX(xScale2).domain()[1])
        ]);
    }

    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
      xScale.domain([
        xScale2.invert(d3.event.selection[0]),
        xScale2.invert(d3.event.selection[1])
      ]);
      focus
        .datum<MyData[]>(dataset2)
        .select('.line')
        .attr('d', line);
      xAxisGroup.call(xAxis); // rescale x
    }

    // add clip path to the svg
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
          <div className='signal-graph-container' id='signal' />
        </div>
      </div>
    );
  }
}

export default withRouter(SignalAnnotation);
