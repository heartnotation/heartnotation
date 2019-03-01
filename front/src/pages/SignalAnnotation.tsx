import * as d3 from 'd3';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Alert, message, Tag as AntTag } from 'antd';
import loadingGif from '../assets/images/loading.gif';
import { Annotation, Point, Interval, Tag } from '../utils';
import HeaderSignalAnnotation from '../fragments/signalAnnotation/HeaderSignalAnnotation';
import FormIntervalSignalAnnotation from '../fragments/signalAnnotation/FormIntervalSignalAnnotation';
import NotFound from './errors/NotFound';
import { orderIntervals, sizeInterval } from '../utils/intervals';

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
  clickedInterval?: Interval;
  intervalSelectors: string[];
  graphElements: GraphElement[];
  intervals: Interval[];
  mainGraph?: d3.Selection<SVGGElement, {}, HTMLElement, any>;
  authorizedTags: Tag[];
  parentTags: Tag[];
}

interface GraphElement {
  id: number;
  selector: string;
  data: Point[];
  object: d3.Line<Point> | d3.Area<Point>;
}

const LegendTag = ({ color, name }: { color: string; name: string }) => (
  <AntTag
    className='legend-tag'
    style={{
      margin: 4,
      backgroundColor: `${color}B0`,
      fontWeight: 'bold'
    }}
    color={color}
  >
    {name}
  </AntTag>
);
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
      intervals: [],
      authorizedTags: [],
      parentTags: []
    };
  }

  public onToogleTool = (tool: 'Navigation' | 'Annotation' | 'Edit') => {
    if (tool === 'Annotation') {
      d3.select('.zoom').style('display', 'none');
      d3.select('#brush-createinterval').style('display', 'block');
    } else if (tool === 'Edit') {
      d3.select('.zoom').style('display', 'none');
      d3.select('#brush-createinterval').style('display', 'none');
    } else {
      d3.select('.zoom').style('display', 'block');
      d3.select('#brush-createinterval').style('display', 'block');
    }
  }

  private parseTags = (annotation: Annotation, intervals: Interval[]) => {
    const authorizedTag = intervals.map(interval => (interval.tags ? interval.tags : []));
    const usedTags = authorizedTag.length
      ? authorizedTag.reduce((prev, curr) => [
          ...prev,
          ...curr.filter(tag => prev.find(t => t.id === tag.id) === undefined)
        ])
      : [];

    const authorizedTags = annotation.tags;

    const parentTags = usedTags.filter(
      tag => !authorizedTags.find(t => t.id === tag.id)
    );
    return { authorizedTags, parentTags };
  }

  public onClickInterval = (intervalId: number) => {
    this.setState({
      xIntervalStart: undefined,
      xIntervalEnd: undefined,
      popperVisible: true,
      clickedInterval: this.state.intervals.find(
        (inter: Interval) => inter.id === intervalId
      )
    });
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
    const datas: [{ x: number; y: number }, { x: number; y: number }] = [
      { x: time_start, y: yMax },
      { x: time_end, y: yMax }
    ];

    const area = d3
      .area<Point>()
      .x(d => xScale(d.x))
      .y0(d => yScale(d.y))
      .y1(() => yScale(yMin));
    return {
      datas,
      area
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
    margin: any,
    colors: string[]
  ) => {
    const color = this.getColors(selection, id, colors);

    selection
      .select(selector)
      .append('path')
      .datum<Point[]>(datas)
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
      .attr('class', className)
      .attr('id', `${className}-${id}`)
      .attr('d', area)
      .attr('clip-path', 'url(#clip)')
      .style('fill', color)
      .style('stroke', 'grey')
      .style('opacity', '0.4')
      .on('click', () => this.onClickInterval(id));
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

  private drawAllIntervals = (
    yMax: number,
    yMin: number,
    xScale: any,
    yScale: any,
    selection: d3.Selection<SVGGElement, {}, HTMLElement, any>,
    selector: string,
    className: string,
    margin: any
  ) => {
    const { intervals } = this.state;
    const inters = intervals.map((interval, _, array) => {
      const intersectors = array.filter(
        i =>
          i.id !== interval.id &&
          ((interval.time_start > i.time_start &&
            interval.time_start < i.time_end) ||
            (interval.time_end > i.time_start &&
              interval.time_end < i.time_end) ||
            (i.time_start > interval.time_start &&
              i.time_start < interval.time_end) ||
            (i.time_end > interval.time_start &&
              i.time_end < interval.time_end))
      );
      return {
        ...interval,
        colors: interval.tags ? interval.tags.map(t => t.color) : [],
        took: false,
        intersectors
      };
    });
    const lines = sizeInterval(orderIntervals(inters));
    const block = (yMax - yMin) / lines.length;

    lines.map((line, lineNumber) => {
      line
        .map(interval => {
          const yUp = yMax - block * lineNumber;
          const yDown = yUp - block * (interval.additionnalBlock + 1);
          return { ...interval, yMax: yUp, yMin: yDown };
        })
        .forEach(interval => {
          const datas = this.getIntervalsData(
            interval,
            interval.yMax,
            interval.yMin,
            xScale,
            yScale
          );
          this.drawInterval(
            datas,
            selection,
            selector,
            interval.id,
            className,
            margin,
            interval.tags ? interval.tags.map(t => t.color) : []
          );
          const graphElement = {
            id: interval.id,
            selector: `#${className}-${interval.id}`,
            data: [
              { x: interval.time_start, y: interval.yMax },
              { x: interval.time_end, y: interval.yMax }
            ],
            object: datas.area
          };
          this.setState({
            graphElements: [...this.state.graphElements, graphElement]
          });
        });
    });
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

    if (!annotation.signal) {
      this.setState({ error: 'No signal found', loading: false });
      return;
    } else {
      leads = annotation.signal;
      const legend = this.parseTags(annotation, intervals);
      this.setState({ loading: false, annotation, intervals, ...legend });
    }

    const width = document.querySelector('.signal-main-container')!.clientWidth;
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

    this.setState({ mainGraph: svgFocus });

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

    const drawFocus = () => {
      xAxisGroup.call(xAxis.scale(xScale));
      yAxisGroup.call(yAxis.scale(yScale));

      canvasFocusContext.clearRect(0, 0, width, height);

      drawLeads(canvasFocusContext, xScale, yScale);

      for (const g of this.state.graphElements) {
        g.object.x(d => xScale(d.x));
        svgFocus
          .datum<Point[]>(g.data)
          .select(g.selector)
          .attr('d', g.object);
      }
    };

    const drawPreview = () => {
      xAxisGroupPreview.call(xAxisPreview.scale(xScalePreview));
      drawLeads(canvasPreviewContext, xScalePreview, yScalePreview);
    };

    const zoomed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;

      xScale.domain(d3.event.transform.rescaleX(xScalePreview).domain());
      drawFocus();
      xAxisGroup.call(xAxis);
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

        // Change graph zone when brush moved
        svgFocus
          .select('.zoom')
          .call(
            zoom.transform,
            d3.zoomIdentity
              .scale(
                (width - margin.right - margin.left) /
                  (d3.event.selection[1] - d3.event.selection[0])
              )
              .translate(-d3.event.selection[0], 0)
          );

        drawFocus();
      }

      xAxisGroup.call(xAxis);
    };

    const zoom: any = d3
      .zoom()
      .scaleExtent([1, 10000]) // Zoom x1 to x10000
      .translateExtent([[0, 0], [width - margin.right - margin.left, height]])
      .extent([[0, 0], [width - margin.right - margin.left, height]])
      .on('zoom', zoomed);

    const brush: any = d3
      .brushX()
      .extent([[0, 0], [width - margin.left - margin.right, heightPreview]])
      .on('brush end', brushed);

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

        this.setState({
          popperVisible: true,
          xIntervalStart: xStart,
          xIntervalEnd: xEnd
        });

        d3.select('#brush-createinterval').call(brushAnnotation.move, null); // Remove the brush selection
      });

    this.afterCreate = this.afterCreate.bind<SignalAnnotation, any, void>(
      this,
      yScale.domain()[0],
      yScale.domain()[1],
      xScale,
      yScale,
      xScalePreview,
      yScalePreview,
      svgPreview,
      svgFocus,
      margin
    );

    svgPreview.append('g').attr('id', 'interval-preview-container');

    svgPreview
      .append('g')
      .attr('class', 'brush')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
      .call(brush)
      .call(brush.move, xScalePreview.range());

    svgFocus.append('g').attr('id', 'interval-focus-container');

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

    drawPreview();
    drawFocus();
    this.drawAllIntervals(
      yScale.domain()[0],
      yScale.domain()[1],
      xScale,
      yScale,
      svgFocus,
      '#interval-focus-container',
      'interval-area',
      margin
    );
    this.drawAllIntervals(
      yScalePreview.domain()[0],
      yScalePreview.domain()[1],
      xScalePreview,
      yScalePreview,
      svgPreview,
      '#interval-preview-container',
      'interval-area-preview',
      margin
    );
  }

  public confirmDelete = (delInterval: Interval) => {
    this.setState(
      {
        popperVisible: false,
        intervalSelectors: [],
        xIntervalEnd: undefined,
        xIntervalStart: undefined,
        clickedInterval: undefined,
        intervals: this.state.intervals.filter(
          (inter: Interval) => inter.id !== delInterval.id
        )
      },
      () => {
        message.error('Interval has been deleted.', 5);
        this.afterCreate(0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
    );
  }

  private confirmCreate = (newInterval: Interval) => {
    this.setState({
      popperVisible: false,
      intervalSelectors: [],
      xIntervalEnd: undefined,
      xIntervalStart: undefined,
      clickedInterval: undefined
    });
    const exists = this.state.intervals.find(
      (i: Interval) => i.id === newInterval.id
    );
    if (exists) {
      // Interval modification
      exists.tags = newInterval.tags;
      exists.comments = newInterval.comments;
    } else {
      // Interval creation
      this.state.intervals.push(newInterval);
    }
    this.afterCreate(0, 0, 0, 0, 0, 0, 0, 0, 0);
    message.success(
      'Interval has been created with the information entered.',
      5
    );
  }

  private confirmCancel = (canInterval: Interval) => {
    this.setState(
      {
        popperVisible: false,
        intervalSelectors: [],
        xIntervalEnd: undefined,
        xIntervalStart: undefined,
        clickedInterval: undefined
      },
      () => {
        this.afterCreate(0, 0, 0, 0, 0, 0, 0, 0, 0);
        message.info(
          'Tags modifications not saved but interval not deleted',
          5
        );
      }
    );
    const exists = this.state.intervals.find(
      (i: Interval) => i.id === canInterval.id
    );
    if (exists) {
      // Interval modification (comments added)
      exists.tags = canInterval.tags;
      exists.comments = canInterval.comments;
    } else {
      // Interval creation
      this.state.intervals.push(canInterval);
    }
  }

  public afterCreate = (
    yMax: number,
    yMin: number,
    xScale: any,
    yScale: any,
    xScalePreview: any,
    yScalePreview: any,
    svgPreview: any,
    svgFocus: any,
    margin: any
  ) => {
    this.state.graphElements.forEach(graphElement => {
      d3.select(graphElement.selector).remove();
    });

    this.setState({ graphElements: [] });
    this.drawAllIntervals(
      yMax,
      yMin,
      xScale,
      yScale,
      svgFocus,
      '#interval-focus-container',
      'interval-area',
      margin
    );

    this.drawAllIntervals(
      yMax,
      yMin,
      xScalePreview,
      yScalePreview,
      svgPreview,
      '#interval-preview-container',
      'interval-area-preview',
      margin
    );

    this.setState({
      popperVisible: false,
      intervalSelectors: [],
      xIntervalEnd: undefined,
      xIntervalStart: undefined,
      clickedInterval: undefined
    });
  }

  public render = () => {
    const {
      loading,
      annotation,
      error,
      refresh,
      authorizedTags,
      parentTags
    } = this.state;
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
            onToggle={this.onToogleTool}
          />
          <div className='signal-main-container'>
            <div className='signal-graph-container' id='signal' />
            <div className='signal-context-container' id='context' />
          </div>
          <div className='signal-legend-container'>
            {parentTags.length > 0 && [
              <h3 key={0}>Parent Tags</h3>,
              parentTags.map(tag => (
                <div key={tag.id}>
                  <LegendTag {...tag} />
                </div>
              ))
            ]}
            <h3>Authorized Tags</h3>
            {authorizedTags.map(tag => (
              <div key={tag.id}>
                <LegendTag {...tag} />
              </div>
            ))}
          </div>
          {this.state.popperVisible &&
            this.state.annotation &&
            ((this.state.xIntervalStart && this.state.xIntervalEnd) ||
              this.state.clickedInterval) && (
              <FormIntervalSignalAnnotation
                start={this.state.xIntervalStart}
                end={this.state.xIntervalEnd}
                clickedInterval={this.state.clickedInterval}
                selectors={this.state.intervalSelectors}
                annotation={this.state.annotation}
                confirmCreate={this.confirmCreate}
                confirmDelete={this.confirmDelete}
                confirmCancel={this.confirmCancel}
              />
            )}
        </div>
      )
    );
  }
}

export default withRouter(SignalAnnotation);
