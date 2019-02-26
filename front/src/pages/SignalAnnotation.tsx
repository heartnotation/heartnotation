import * as d3 from 'd3';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Alert, message } from 'antd';
import loadingGif from '../assets/images/loading.gif';
import { Annotation, Point, Interval } from '../utils';
import HeaderSignalAnnotation from '../fragments/signalAnnotation/HeaderSignalAnnotation';
import FormIntervalSignalAnnotation from '../fragments/signalAnnotation/FormIntervalSignalAnnotation';
import NotFound from './errors/NotFound';
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
  mainGraph?: d3.Selection<SVGGElement, {}, HTMLElement, any>;
  preview?: d3.Selection<SVGGElement, {}, HTMLElement, any>;
}

interface GraphElement {
  id: number;
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
    scales: { x: any; y: any };
    yLimits: { max: number; min: number };
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
    return {
      datas: intervalData,
      area: areaGraph,
      scales: { x: xScale, y: yScale },
      yLimits: { max: yMax, min: yMin }
    };
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
    colors: string[]
  ) => {
    const color = this.getColors(selection, id, colors);

    selection
      .select(selector)
      .append('path')
      .datum<Point[]>(datas)
      .attr('class', className)
      .attr('id', `${className}-${id}`)
      .attr('d', area)
      .attr('clip-path', 'url(#clip)')
      .style('fill', color)
      .style('stroke', 'grey')
      .style('opacity', '0.2');
  }

  private getColors = (
    selection: d3.Selection<SVGGElement, {}, HTMLElement, any>,
    id: number,
    colors: string[]
  ): string => {
    if (colors.length > 1) {
      const grad = selection
        .append('linearGradient')
        .attr('id', `gradient-${id}`);
      const steps = 100 / (colors.length - 1);
      colors.forEach((c, index) => {
        grad
          .append('stop')
          .attr('offset', `${Math.round(index * steps)}%`)
          .style('stop-color', c);
      });
      return `url(#gradient-${id})`;
    } else if (colors.length === 1) {
      return colors[0];
    } else {
      return 'grey';
    }
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

    const width = window.innerWidth - 20;
    const height = 600;
    const margin = { top: 20, right: 50, bottom: 20, left: 50 };
    const heightPreview = 25;

    const canvasFocus = d3
      .select('#signal')
      .append('canvas')
      .attr('width', width - margin.right - margin.left)
      .attr('height', height)
      .style('margin-top', margin.top + 'px')
      .style('margin-bottom', margin.bottom + 'px')
      .style('margin-right', margin.right + 'px')
      .style('margin-left', margin.left + 'px');

    const svgFocus = d3
      .select('#signal')
      .append('svg')
      .attr('width', width)
      .attr('height', height + margin.top + margin.bottom)
      .append('g');

    const canvasPreview = d3
      .select('#context')
      .append('canvas')
      .attr('width', width - margin.right - margin.left)
      .attr('height', heightPreview)
      .style('margin-top', margin.top + 'px')
      .style('margin-bottom', margin.bottom + 'px')
      .style('margin-right', margin.right + 'px')
      .style('margin-left', margin.left + 'px');

    const svgPreview = d3
      .select('#context')
      .append('svg')
      .attr('width', width)
      .attr('height', heightPreview + margin.top + margin.bottom)
      .append('g');

    this.setState({ mainGraph: focus, preview: context });

    const yMa = d3.max(leads, lead => d3.max(lead, data => data.y));
    const yMi = d3.min(leads, lead => d3.min(lead, data => data.y));

    const xMax = d3.max(leads, lead => d3.max(lead, data => data.x));
    const yMax = (yMa ? yMa : 0) * 1.1;
    const xMin = d3.min(leads, lead => d3.min(lead, data => data.x));
    const yMin = (yMi ? yMi : 0) * 1.1;

    const xScale = d3
      .scaleLinear()
      .range([0, width - margin.left - margin.right])
      .domain([0, xMax ? xMax : 0]);

    const yScale = d3
      .scaleLinear()
      .range([0, height])
      .domain([yMax ? yMax : 0, yMin ? yMin : 0])
      .nice();

    const xScalePreview = d3
      .scaleLinear()
      .range([0, width - margin.left - margin.right])
      .domain(xScale.domain());

    const yScalePreview = d3
      .scaleLinear()
      .range([0, heightPreview])
      .domain(yScale.domain())
      .nice();

    const yAxis = d3
      .axisLeft(yScale)
      .tickSize(-width + margin.left + margin.right); // Longueur des axes horizontaux
    const yAxisGroup = svgFocus
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
      .call(yAxis);

    const xAxis = d3.axisBottom(xScale).tickSize(-height);
    const xAxisGroup = svgFocus
      .append('g')
      .attr(
        'transform',
        'translate(' + margin.left + ', ' + (height + margin.top) + ')'
      )
      .call(xAxis);

    const xAxisPreview = d3.axisBottom(xScalePreview);
    const xAxisGroupPreview = svgPreview
      .append('g')
      .attr(
        'transform',
        'translate(' + margin.left + ',' + (heightPreview + margin.top) + ')'
      )
      .call(xAxisPreview);

    const canvasFocusNode = canvasFocus.node();
    const canvasPreviewNode = canvasPreview.node();

    if (!canvasFocusNode || !canvasPreviewNode) {
      return;
    }
      this.setState({
        graphElements: [
          ...this.state.graphElements,
          {
            id: i,
            selector: '#line' + i,
            data: lead,
            object: lineMain
          }
        ]
      });

    const canvasFocusContext = canvasFocusNode.getContext('2d');
    const canvasPreviewContext = canvasPreviewNode.getContext('2d');

    if (!canvasFocusContext || !canvasPreviewContext) {
      return;
    }

    const drawLeads = (context: any, scaleX: any, scaleY: any) => {
      let color = 0;
      context.lineWidth = 2;
      for (const lead of leads) {
        lead.sort((a, b) => {
          return a.x - b.x;
        });
        context.beginPath();
        context.strokeStyle = colors[color % colors.length];
        lead.forEach(point => {
          const px = scaleX(point.x);
          const py = scaleY(point.y);

          context.lineTo(px, py);
        });
        context.stroke();
        color++;
      }
    };

    const drawFocus = (transform: any) => {
      const scaleX = transform.rescaleX(xScale);

      xAxisGroup.call(xAxis.scale(scaleX));
      yAxisGroup.call(yAxis.scale(yScale));

      canvasFocusContext.clearRect(0, 0, width, height);

      drawLeads(canvasFocusContext, scaleX, yScale);

      console.log(this.state.graphElements);
      for (const g of this.state.graphElements) {
        g.object.x(d => scaleX(d.x));
        svgFocus
          .datum<Point[]>(g.data)
          .select(g.selector)
          .attr('d', g.object);
      }
    };

    const drawPreview = (transform: any) => {
      xAxisGroupPreview.call(xAxisPreview.scale(xScalePreview));
      drawLeads(canvasPreviewContext, xScalePreview, yScalePreview);
    };

    const zoomed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
      svgPreview
        .select('.brush')
        .call(brush.move, [
          xScalePreview(d3.event.transform.rescaleX(xScalePreview).domain()[0]),
          xScalePreview(d3.event.transform.rescaleX(xScalePreview).domain()[1])
        ]);
      drawFocus(d3.event.transform);
    };

    const brushed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;

      if (d3.event.selection) {
        xScale.domain([
          xScalePreview.invert(d3.event.selection[0]),
          xScalePreview.invert(d3.event.selection[1])
        ]);

        drawFocus(d3.zoomIdentity);
      }

      xAxisGroup.call(xAxis);
    };

    const zoom: any = d3
      .zoom()
      .scaleExtent([1, 10000]) // Zoom x1 to x10000
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed);

    const brush: any = d3
      .brushX()
      .extent([[0, 0], [width - margin.left - margin.right, heightPreview]])
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
        interval.tags ? interval.tags.map(inter => inter.color) : []
      );
      this.drawInterval(
        this.getIntervalsData(interval, yMax, yMin, xScale2, yScale2),
        context,
        '#previewGraph',
        idGraphElement,
        'interval-area-preview',
        interval.tags ? interval.tags.map(inter => inter.color) : []
      );
      const graphElement = {
        id: idGraphElement,
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
      .extent([[0, 0], [width - margin.left - margin.right, height]])
      .on('end', () => {
        if (!d3.event.selection) {
          return;
        }
        const domain = d3.event.selection.map(xScale.invert, xScale);
        const xStart = domain[0];
        const xEnd = domain[1];
        const areaData = [{ x: xStart, y: 0 }, { x: xEnd, y: 0 }];

        const areaMainGraph = d3
          .area<Point>()
          .x(d => xScale(d.x))
          .y0(yScale(yScale.domain()[0]))
          .y1(yScale(yScale.domain()[1]));

        const areaPreviewGraph = d3
          .area<Point>()
          .x(d => xScalePreview(d.x))
          .y0(yScalePreview(yScalePreview.domain()[0]))
          .y1(yScalePreview(yScalePreview.domain()[1]));

        svgFocus
          .select('#interval-container')
          .append('path')
          .datum<Point[]>(areaData)
          .attr('class', 'interval-area')
          .attr('id', 'interval-area-' + idGraphElement)
          .attr('d', areaMainGraph)
          .attr(
            'transform',
            'translate(' + margin.left + ', ' + margin.top + ')'
          ).attr('clip-path', 'url(#clip)');

        svgPreview
          .append('path')
          .datum<Point[]>(areaData)
          .attr('class', 'interval-area-preview')
          .attr('id', 'interval-area-preview-' + idGraphElement)
          .attr('d', areaPreviewGraph)
          .attr(
            'transform',
            'translate(' + margin.left + ', ' + margin.top + ')'
          );

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
          'interval-area',
          []
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
          'interval-area-preview',
          []
        );

        const graphElement = {
          id: idGraphElement,
          selector: `#interval-area-${idGraphElement}`,
          data: [{ x: xStart, y: yMax }, { x: xEnd, y: yMax }],
          object: mainGraphDatas.area
        };
        this.setState({
          graphElements: [
            ...this.state.graphElements,
            ...[
              graphElement,
              {
                ...graphElement,
                object: previewGraphDatas.area,
                selector: `#interval-area-preview-${idGraphElement}`
              }
            ]
          ],
          popperVisible: true,
          xIntervalStart: xStart,
          xIntervalEnd: xEnd,
          intervalSelectors: [
            ...this.state.intervalSelectors,
            `#interval-area-${idGraphElement}`,
            `#interval-area-preview-${idGraphElement}`
          ]
        });

        d3.select('#brush-createinterval').call(brushAnnotation.move, null); // Remove the brush selection

        idGraphElement++;
      });

    svgPreview
      .append('g')
      .attr('class', 'brush')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
      .call(brush)
      .call(brush.move, xScalePreview.range());

    svgFocus.append('g').attr('id', 'interval-container');

    svgFocus
      .append('g')
      .attr('class', 'brush')
      .attr('id', 'brush-createinterval')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
      .call(brushAnnotation);

    svgFocus
      .append('rect')
      .attr('class', 'zoom')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height)
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
      .call(zoom);

    svgFocus
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height);

    drawPreview(d3.zoomIdentity);
    drawFocus(d3.zoomIdentity);
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
    const { mainGraph, graphElements } = this.state;
    const colors = tags.map(t => t.color);

    selectors.forEach(s => {
      const selection = d3.select(s);
      const interval = graphElements.find(g => g.selector === s);

      selection
        .style('fill', this.getColors(mainGraph!, interval!.id, colors))
        .style('stroke', tags ? tags[0].color : 'grey')
        .style('opacity', '0.4');
    });
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
            <div className='signal-context-container' id='context' />
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
