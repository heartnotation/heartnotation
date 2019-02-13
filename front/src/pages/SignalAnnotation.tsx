import * as d3 from 'd3';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Tag, Alert, Switch } from 'antd';
import loadingGif from '../assets/images/loading.gif';
import { Annotation, Point } from '../utils';
import HeaderSignalAnnotation from '../fragments/signalAnnotation/HeaderSignalAnnotation';

interface RouteProps extends RouteComponentProps<{ id: string }> {
  getAnnotation: (id: number) => Promise<Annotation>;
  changeAnnotation: (datas: Annotation) => Promise<Annotation>;
}

interface State {
  annotation?: Annotation;
  loading: boolean;
  moving: boolean;
  error?: string;
}

interface GraphElement {
  selector:string;
  data:Point[];
  object: d3.Line<Point> | d3.Area<Point>;
}

class SignalAnnotation extends Component<RouteProps, State> {
  public constructor(props: RouteProps) {
    super(props);
    this.state = {
      loading: true,
      moving: true
    };
  }

  public onChange = (checked: boolean) => {
    if(checked === true) {
      d3.select('.zoom').style('display', 'none');
    } else {
      d3.select('.zoom').style('display', 'block');
    }
  }

  public componentDidMount = async () => {
    const {
      match: {
        params: { id }
      },
      getAnnotation
    } = this.props;

    const annotation = await getAnnotation(parseInt(id, 10));
    const l = annotation.signal;
    let leads: Point[][];
    const graphElements:GraphElement[] = [];
    let idGraphElement:number = 0;

    if (!l) {
      this.setState({ error: 'No signal found', loading: false });
      return;
    } else {
      leads = l;
      this.setState({ loading: false, annotation });
    }

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

    const dataset2: Point[] = leads[1];

    const yMa = d3.max(dataset2, d => d.y);
    const yMi = d3.min(dataset2, d => d.y);

    const xMax = d3.max(dataset2, d => d.x);
    const yMax = (yMa ? yMa : 0) + 100;
    const xMin = d3.min(dataset2, d => d.x);
    const yMin = (yMi ? yMi : 0) - 100;

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
      return a.x - b.x;
    });

    const lineMain1 = d3
      .line<Point>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);

    focus
      .datum<Point[]>(dataset2)
      .append('g')
      .attr('id', 'mainGraph')
      .append('path')
      .attr('class', 'line')
      .attr('id', 'line')
      .attr('d', lineMain1);

    const linePreview1 = d3
      .line<Point>()
      .x(d => xScale2(d.x))
      .y(d => yScale2(d.y))
      .curve(d3.curveBasis);

    graphElements.push({ selector:'#line', data: dataset2, object: lineMain1});

    context
      .datum<Point[]>(dataset2)
      .append('g')
      .attr('id', 'previewGraph')
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
        const domain = d3.event.selection.map(xScale.invert, xScale);
        const xStart = domain[0];
        const xEnd = domain[1];
        const areaData = [{x: xStart, y: yMax }, {x: xEnd, y: yMax}];

        const areaMainGraph = d3.area<Point>()
          .x(d => xScale(d.x))
          .y0(yScale(yMin))
          .y1(d => yScale(d.y));

        const areaPreviewGraph = d3.area<Point>()
          .x(d => xScale2(d.x))
          .y0(yScale2(yMin))
          .y1(d => yScale2(d.y));

        focus.select('#mainGraph').append('path')
          .datum<Point[]>(areaData)
          .attr('class', 'interval-area')
          .attr('id', 'interval-area-' + idGraphElement)
          .attr('d', areaMainGraph)
          .attr('clip-path', 'url(#clip)');

        context.select('#previewGraph').append('path')
          .datum<Point[]>(areaData)
          .attr('class', 'interval-area-preview')
          .attr('id', 'interval-area-preview-' + idGraphElement)
          .attr('d', areaPreviewGraph);

        graphElements.push({ selector:'#interval-area-' + idGraphElement, data: areaData, object: areaMainGraph});
        idGraphElement++;
        console.log(xStart + '     ' + xEnd);
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

      for(const g of graphElements) {
        focus
          .datum<Point[]>(g.data)
          .select(g.selector)
          .attr('d', g.object);
      }
      
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

      for(const g of graphElements) {
        focus
          .datum<Point[]>(g.data)
          .select(g.selector)
          .attr('d', g.object);
      }

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

  public handleClickValidate = async (
    e: React.FormEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const { annotation } = this.state;
    if (annotation) {
      try {
        await this.props.changeAnnotation({
          ...annotation,
          status: { ...annotation.status, id: 4 }
        });
        this.props.history.push('/');
      } catch (e) {
        console.error(e);
      }
    }
  }

  public render = () => {
    const { loading, annotation, error } = this.state;

    if (loading) {
      return (
        <img
          style={{ width: '50%', display: 'block', margin: 'auto' }}
          src={loadingGif}
          alt='Loading'
        />
      );
    }
    if (error) {
      return <Alert message={error} type='error' />;
    }

    return (
      annotation && (
        <div>
          <HeaderSignalAnnotation annotation={annotation} />
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
      )
    );
  }
}

export default withRouter(SignalAnnotation);
