import * as d3 from 'd3';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Tag, Alert, Switch, message, Card, Button } from 'antd';
import loadingGif from '../assets/images/loading.gif';
import { Annotation, Point } from '../utils';
import HeaderSignalAnnotation from '../fragments/signalAnnotation/HeaderSignalAnnotation';
import FormIntervalSignalAnnotation from '../fragments/signalAnnotation/FormIntervalSignalAnnotation';
import NotFound from './errors/NotFound';

interface RouteProps extends RouteComponentProps<{ id: string }> {
  getAnnotation: (id: number) => Promise<Annotation>;
  changeAnnotation: (datas: Annotation) => Promise<Annotation>;
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
      intervalSelectors: []
    };
  }

  public onChange = (checked: boolean) => {
    if (checked === true) {
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

    const colors = ['blue', 'green', 'red'];
    let annotation;
    try {
      annotation = await getAnnotation(parseInt(id, 10));
    } catch (e) {
      if (e.status === 404) {
        this.setState({ refresh: true });
      }
      return;
    }
    let leads: Point[][];
    const idGraphElement: number = 0;

    if (!annotation.signal) {
      this.setState({ error: 'No signal found', loading: false });
      return;
    } else {
      leads = annotation.signal;
      this.setState({ loading: false, annotation });
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
    };

    const drawPreview = (transform: any) => {
      xAxisGroupPreview.call(xAxisPreview.scale(xScalePreview));
      drawLeads(canvasPreviewContext, xScalePreview, yScalePreview);
    };

    const zoomed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
      drawFocus(d3.event.transform);
      svgPreview
        .select('.brush')
        .call(brush.move, [
          xScalePreview(d3.event.transform.rescaleX(xScalePreview).domain()[0]),
          xScalePreview(d3.event.transform.rescaleX(xScalePreview).domain()[1])
        ]);
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

    svgFocus
      .append('rect')
      .attr('class', 'zoom')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height)
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
      .call(zoom);

    svgPreview
      .append('g')
      .attr('class', 'brush')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
      .call(brush)
      .call(brush.move, xScalePreview.range());

    /*
    const brushAnnotation: any = d3
      .brushX()
      .extent([[0, 0], [width, height]])
      .on('end', () => {
        if (!d3.event.selection) {
          return;
        }
        const domain = d3.event.selection.map(xScale.invert, xScale);
        const xStart = domain[0];
        const xEnd = domain[1];
        const areaData = [{ x: xStart, y: yMax }, { x: xEnd, y: yMax }];

        const areaMainGraph = d3
          .area<Point>()
          .x(d => xScale(d.x))
          .y0(yScale(yMin))
          .y1(d => yScale(d.y));

        const areaPreviewGraph = d3
          .area<Point>()
          .x(d => xScale2(d.x))
          .y0(yScale2(yMin))
          .y1(d => yScale2(d.y));

        focus
          .select('#mainGraph')
          .append('path')
          .datum<Point[]>(areaData)
          .attr('class', 'interval-area')
          .attr('id', 'interval-area-' + idGraphElement)
          .attr('d', areaMainGraph)
          .attr('clip-path', 'url(#clip)');

        context
          .select('#previewGraph')
          .append('path')
          .datum<Point[]>(areaData)
          .attr('class', 'interval-area-preview')
          .attr('id', 'interval-area-preview-' + idGraphElement)
          .attr('d', areaPreviewGraph);

        this.setState({
          graphElements: [
            ...this.state.graphElements,
            {
              selector: '#interval-area-' + idGraphElement,
              data: areaData,
              object: areaMainGraph
            }
          ]
        });

        this.setState({
          popperVisible: true,
          xIntervalStart: xStart,
          xIntervalEnd: xEnd,
          intervalSelectors: [
            ...this.state.intervalSelectors,
            '#interval-area-' + idGraphElement,
            '#interval-area-preview-' + idGraphElement
          ]
        });

        d3.select('#brush-createinterval').call(brushAnnotation.move, null); // Remove the brush selection

        idGraphElement++;
      });

    focus
      .append('g')
      .attr('class', 'brush')
      .attr('id', 'brush-createinterval')
      .call(brushAnnotation);*/

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

  public confirmCreate = () => {
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
