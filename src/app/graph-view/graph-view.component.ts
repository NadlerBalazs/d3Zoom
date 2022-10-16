import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from '../data-service.service';
import { Data } from '../model';
import * as d3 from 'd3';
import * as moment from 'moment';

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.css'],
})
export class GraphViewComponent implements OnInit {
  sumstat: any;
  changedDropDown: boolean = false;
  filteredData: Data[] = [];
  constructor(private dataService: DataServiceService) {}

  ngOnInit(): void {
    let data: Data[] = [];
    data = this.dataService.getData();
    this.createSvg(data, true);
  }

  private svg: any;
  private g: any;
  private INTERVALS = [
    'Teljes skála',
    'Elmúlt nap',
    'Elmúlt 3 nap',
    'Elmúlt 7 nap',
  ];
  private MARGIN = { TOP: 20, RIGHT: 20, BOTTOM: 20, LEFT: 25 };
  private WIDTH = 600 - this.MARGIN.LEFT - this.MARGIN.RIGHT;
  private HEIGHT = 400 - this.MARGIN.TOP - this.MARGIN.BOTTOM;

  private createSvg(data: Data[], fill: boolean) {
    if (!fill) {
      d3.select('svg').remove();
    }
    this.sumstat = d3
      .nest()
      .key((d: any) => d.type)
      .entries(data);
    console.log(data);

    // append the svg object to the body of the page

    this.svg = d3
      .select('#graph')
      .append('svg')
      .attr('width', this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
      .attr('height', this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.MARGIN.LEFT + ',' + this.MARGIN.TOP + ')'
      );

    this.g = this.svg
      .append('g')
      .attr('transform', `translate(${this.MARGIN.LEFT}), ${this.MARGIN.TOP}`);

    //Fill the dropdown
    if (fill) {
      d3.select('#selectTimeInterval')
        .selectAll('myOptions')
        .data(this.INTERVALS)
        .enter()
        .append('option')
        .text(function (d) {
          return d;
        })
        .attr('value', function (d) {
          return d;
        });
    }
    this.drawPlot(data);
  }

  // Now I can use this dataset:
  private drawPlot(data: Data[]): void {
    //const bisectDate = d3.bisector((d: any) => d.date).left;
    //x values
    var x = d3
      .scaleTime()
      .domain(
        <[Date, Date]>d3.extent(data, function (d) {
          return d.date;
        })
      )
      .range([0, this.WIDTH]);

    // draw x axis
    var xAxis = this.g
      .append('g')
      .attr('transform', 'translate(0,' + this.HEIGHT + ')')
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([0, <number>d3.max(data, function (d) {
          return +d.value;
        })])
      .range([this.HEIGHT, 0]);

    //draw x axis
    var yAxis = this.g.append('g').call(d3.axisLeft(y));

    // Create the line variable: where both the line and the brush take place
    var line = this.svg.append('g').attr('clip-path', 'url(#clip)');

    d3.select('g')
      .selectAll('.line')
      .append('g')
      .attr('class', 'line')
      .data(this.sumstat)
      .enter()
      .append('path')
      .transition()
      .duration(500)
      .attr('d', function (d: any) {
        console.log(d);
        return d3
          .line()
          .x((d: any) => x(new Date(d.date)))
          .y((d: any) => y(+d.value))
          .curve(d3.curveLinear)(d.values);
      })
      .attr('fill', 'none')
      .attr('stroke', (d: any) => (d.key == 'Type2' ? 'red' : 'blue'))
      .attr('stroke-width', 1);

    this.svg.on('dblclick', () => {
      x.domain(
        <[Date, Date]>d3.extent(data, function (d: any) {
          return d.date;
        })
      );
      xAxis.transition().call(d3.axisBottom(x));
      line
        .select('.line')
        .transition()
        .attr(
          'd',
          d3
            .line()
            .x(function (d: any) {
              return x(new Date(d.date));
            })
            .y(function (d: any) {
              return y(+d.value);
            })
        );
    });

    d3.select('#selectTimeInterval').on('change', (d: any) =>
      this.createSvg(
        this.dataService.defineTimeInterval(
          d3.select('#selectTimeInterval').property('value')
        ),
        false
      )
    );
  }
}
