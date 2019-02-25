import * as d3 from 'd3';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Alert, message } from 'antd';
import loadingGif from '../assets/images/loading.gif';
import { Annotation, Point, Interval, api } from '../utils';
import HeaderSignalAnnotation from '../fragments/signalAnnotation/HeaderSignalAnnotation';
import FormIntervalSignalAnnotation from '../fragments/signalAnnotation/FormIntervalSignalAnnotation';
import NotFound from './errors/NotFound';
import { element } from 'prop-types';
import { Tag } from '../utils/objects';

interface RouteProps extends RouteComponentProps<{ id: string }> {
  getAnnotation: (id: number) => Promise<Annotation>;
  changeAnnotation: (datas: Annotation) => Promise<Annotation>;
  getIntervals: (a: Annotation) => Promise<Interval[]>;
}

interface State {
  annotation?: Annotation;
  loading: boolean;
  moving: boolean;
  error?: string;
  refresh: boolean;
  popperVisible: boolean;
  xIntervalStart?: number;
  xIntervalEnd?: number;
  intervalSelectors: string[];
  graphElements: GraphElement[];
  intervals: Interval[];
}

interface GraphElement {
  selector: string;
  data: Point[];
  object: d3.Line<Point> | d3.Area<Point>;
}

class SignalAnnotation extends Component<RouteProps, State> {
  public constructor(props: RouteProps) {
    super(props);
    this.state = {
      loading: true,
      moving: true,
      refresh: false,
      popperVisible: false,
      graphElements: [],
      intervalSelectors: [],
      intervals: []
    };
  }

  public onChange = (checked: boolean) => {
    if (checked === true) {
      d3.select('.zoom').style('display', 'none');
    } else {
      d3.select('.zoom').style('display', 'block');
    }
  }

  private getIntervalsData = (
    { time_start, time_end }: { time_start: number; time_end: number },
    yMax: number,
    yMin: number,
    xScale: any,
    yScale: any
  ): {
    datas: [{ x: number; y: number }, { x: number; y: number }];
    area: d3.Area<Point>;
  } => {
    const intervalData: [{ x: number; y: number }, { x: number; y: number }] = [
      { x: time_start, y: yMax },
      { x: time_end, y: yMax }
    ];
    const areaGraph = d3
      .area<Point>()
      .x(d => xScale(d.x))
      .y0(yScale(yMin))
      .y1(d => yScale(d.y));
    return { datas: intervalData, area: areaGraph };
  }

  private drawInterval = (
    {
      datas,
      area
    }: {
      datas: [{ x: number; y: number }, { x: number; y: number }];
      area: d3.Area<Point>;
    },
    selection: d3.Selection<SVGGElement, {}, HTMLElement, any>,
    selector: string,
    id: number,
    className: string,
    color?: string
  ) => {
    selection
      .select(selector)
      .append('path')
      .datum<Point[]>(datas)
      .attr('class', className)
      .attr('id', `${className}-${id}`)
      .attr('d', area)
      .attr('clip-path', 'url(#clip)')
      .style('fill', color ? color : 'grey')
      .style('stroke', color ? color : 'grey')
      .style('opacity', '0.4');
  }

  public componentDidMount = async () => {
    const {
      match: {
        params: { id }
      },
      getAnnotation,
      getIntervals
    } = this.props;

    const colors = ['blue', 'green', 'red'];
    let annotation;
    let intervals;
    try {
      annotation = await getAnnotation(parseInt(id, 10));
      intervals = await getIntervals(annotation);
    } catch (e) {
      if (e.status === 404) {
        this.setState({ refresh: true });
      }
      return;
    }
    let leads: Point[][];
    let idGraphElement: number = 0;

    if (!annotation.signal) {
      this.setState({ error: 'No signal found', loading: false });
      return;
    } else {
      leads = annotation.signal;
      this.setState({ loading: false, annotation, intervals });
    }

    const svgWidth = window.innerWidth - 20;
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

    const yMa = d3.max(leads, lead => d3.max(lead, data => data.y));
    const yMi = d3.min(leads, lead => d3.min(lead, data => data.y));

    const xMax = d3.max(leads, lead => d3.max(lead, data => data.x));
    const yMax = (yMa ? yMa : 0) + 100;
    const xMin = d3.min(leads, lead => d3.min(lead, data => data.x));
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
      .domain(xScale.domain());

    const yScale2 = d3
      .scaleLinear()
      .range([0, height2])
      .domain(yScale.domain());

    focus.append('g').attr('id', 'mainGraph');

    context.append('g').attr('id', 'previewGraph');

    let i = 0;
    for (const lead of leads) {
      lead.sort((a, b) => {
        return a.x - b.x;
      });

      const lineMain = d3
        .line<Point>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis);

      focus
        .datum<Point[]>(lead)
        .select('#mainGraph')
        .append('path')
        .attr('class', 'line')
        .attr('id', 'line' + i)
        .attr('d', lineMain)
        .attr('stroke', _ => colors[i % colors.length])
        .attr('clip-path', 'url(#clip)');

      const linePreview = d3
        .line<Point>()
        .x(d => xScale2(d.x))
        .y(d => yScale2(d.y))
        .curve(d3.curveBasis);

      this.setState({
        graphElements: [
          ...this.state.graphElements,
          {
            selector: '#line' + i,
            data: lead,
            object: lineMain
          }
        ]
      });

      context
        .datum<Point[]>(lead)
        .select('#previewGraph')
        .append('path')
        .attr('class', 'line')
        .attr('d', linePreview)
        .attr('stroke', _ => colors[i % colors.length]);

      i++;
    }

    const yAxis = d3.axisLeft(yScale).tickSize(-width);
    const yAxisGroup = focus.append('g').call(yAxis);

    const xAxis = d3.axisBottom(xScale).tickSize(-height);
    const xAxisGroup = focus
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    const xAxis2 = d3.axisBottom(xScale2);
    const xAxisGroup2 = context
      .append('g')
      .attr('transform', 'translate(0,' + height2 + ')')
      .call(xAxis2);

    const zoomed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
      xScale.domain(d3.event.transform.rescaleX(xScale2).domain());

      for (const g of this.state.graphElements) {
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
    };

    const brushed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;

      if (d3.event.selection) {
        xScale.domain([
          xScale2.invert(d3.event.selection[0]),
          xScale2.invert(d3.event.selection[1])
        ]);
        // Change graph zone when brush moved
        focus
          .select('.zoom')
          .call(
            zoom.transform,
            d3.zoomIdentity
              .scale(width / (d3.event.selection[1] - d3.event.selection[0]))
              .translate(-d3.event.selection[0], 0)
          );
      }

      for (const g of this.state.graphElements) {
        focus
          .datum<Point[]>(g.data)
          .select(g.selector)
          .attr('d', g.object);
      }

      xAxisGroup.call(xAxis);
    };

    const zoom: any = d3
      .zoom()
      .scaleExtent([1, 10000]) // Zoom x1 to x10000
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed)
      .filter(() => this.state.moving);

    const brush: any = d3
      .brushX()
      .extent([[0, 0], [width, height2]])
      .on('brush end', brushed);

    const graphElements = intervals.map(interval => {
      const mainGraphArea = this.getIntervalsData(
        interval,
        yMax,
        yMin,
        xScale,
        yScale
      );
      this.drawInterval(
        mainGraphArea,
        focus,
        '#mainGraph',
        idGraphElement,
        'interval-area',
        interval.tags ? interval.tags[0].color : undefined
      );
      this.drawInterval(
        this.getIntervalsData(interval, yMax, yMin, xScale2, yScale2),
        context,
        '#previewGraph',
        idGraphElement,
        'interval-area-preview',
        interval.tags ? interval.tags[0].color : undefined
      );
      const graphElement = {
        selector: `#interval-area-${idGraphElement}`,
        data: [
          { x: interval.time_start, y: yMax },
          { x: interval.time_end, y: yMax }
        ],
        object: mainGraphArea.area
      };
      return { elements: graphElement, id: idGraphElement++ };
    });

    this.setState({
      graphElements: [
        ...this.state.graphElements,
        ...graphElements.map(g => g.elements)
      ]
    });

    const brushAnnotation: any = d3
      .brushX()
      .extent([[0, 0], [width, height]])
      .on('end', () => {
        const domain = d3.event.selection.map(xScale.invert, xScale);
        const xStart = domain[0];
        const xEnd = domain[1];

        const mainGraphDatas = this.getIntervalsData(
          { time_start: xStart, time_end: xEnd },
          yMax,
          yMin,
          xScale,
          yScale
        );
        this.drawInterval(
          mainGraphDatas,
          focus,
          '#mainGraph',
          idGraphElement,
          'interval-area'
        );

        const previewGraphDatas = this.getIntervalsData(
          { time_start: xStart, time_end: xEnd },
          yMax,
          yMin,
          xScale2,
          yScale2
        );
        this.drawInterval(
          previewGraphDatas,
          context,
          '#previewGraph',
          idGraphElement,
          'interval-area-preview'
        );

        const graphElement = {
          selector: `#interval-area-${idGraphElement}`,
          data: [{ x: xStart, y: yMax }, { x: xEnd, y: yMax }],
          object: mainGraphDatas.area
        };
        this.setState({
          graphElements: [...this.state.graphElements, graphElement],
          popperVisible: true,
          xIntervalStart: xStart,
          xIntervalEnd: xEnd,
          intervalSelectors: [
            ...this.state.intervalSelectors,
            `#interval-area-${idGraphElement}`,
            `#interval-area-preview-${idGraphElement}`
          ]
        });

        idGraphElement++;
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

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    focus.select('.line').attr('clip-path', 'url(#clip)');
  }

  public confirmDelete = (selectors: string[]) => {
    for (const selector of selectors) {
      d3.select(selector).remove(); // Remove in graph
      this.setState({
        graphElements: this.state.graphElements.filter(
          (g: GraphElement) => g.selector !== selector
        )
      }); // Remove in elements
    }
    this.setState({ popperVisible: false, intervalSelectors: [] });
    message.error('Interval has been deleted.', 5);
  }

  public confirmCreate = (selectors: string[], tags: Tag[]) => {
    selectors.forEach(s =>
      d3
        .select(s)
        .style('fill', tags ? tags[0].color : 'grey')
        .style('stroke', tags ? tags[0].color : 'grey')
        .style('opacity', '0.4')
    );
    this.setState({ popperVisible: false, intervalSelectors: [] });
    message.success(
      'Interval has been created with the information entered.',
      5
    );
  }

  public render = () => {
    const { loading, annotation, error, refresh } = this.state;
    if (refresh) {
      return <NotFound />;
    }
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
          <HeaderSignalAnnotation
            annotation={annotation}
            onToggle={this.onChange}
          />
          <div className='signal-main-container'>
            <div className='signal-graph-container' id='signal' />
          </div>
          {this.state.popperVisible &&
            this.state.annotation &&
            this.state.xIntervalStart &&
            this.state.xIntervalEnd && (
              <FormIntervalSignalAnnotation
                start={this.state.xIntervalStart}
                end={this.state.xIntervalEnd}
                selectors={this.state.intervalSelectors}
                annotation={this.state.annotation}
                confirmCreate={this.confirmCreate}
                confirmDelete={this.confirmDelete}
              />
            )}
        </div>
      )
    );
  }
}

export default withRouter(SignalAnnotation);
