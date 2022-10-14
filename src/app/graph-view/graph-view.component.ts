import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from '../data-service.service';
import { Data } from '../model';
import * as d3 from 'd3';
import { line } from 'd3';

@Component({
  selector: 'app-graph-view',
  templateUrl: './graph-view.component.html',
  styleUrls: ['./graph-view.component.css'],
})
export class GraphViewComponent implements OnInit {
  data: Data[] = [];

  constructor(private dataService: DataServiceService) {}

  ngOnInit(): void {
    this.data = this.dataService.getData();
    this.createSvg();
    this.drawPlot();
    //this.chart(this.data);
  }

  private svg: any;
  private margin = { top: 10, right: 10, bottom: 10, left: 10 };
  private width = 460 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;

  private createSvg(): void {
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    this.svg = d3
      .select('#graph')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + 25 + ',' + 0 + ')');
  }

  // When reading the csv, I must format variables:
  // function(d){
  //   return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
  // },

  // Now I can use this dataset:
  private drawPlot(): void {
    // Add X axis --> it is a date format
    var x = d3
      .scaleTime()
      .domain(
        <[Date, Date]>d3.extent(this.data, function (d) {
          return d.date;
        })
      )
      .range([0, this.width]);
    var xAxis = this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([0, <number>d3.max(this.data, function (d) {
          return +d.value + 0;
        })])
      .range([this.height, 0]);
    var yAxis = this.svg.append('g').call(d3.axisLeft(y));

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = this.svg
      .append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('x', 0)
      .attr('y', 0);

    // Add brushing
    var brush = d3
      .brushX() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [this.width, this.height],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on('end', updateChart); // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the line variable: where both the line and the brush take place
    var line = this.svg.append('g').attr('clip-path', 'url(#clip)');

    // Add the line
    line
      .append('path')
      .datum(this.data)
      .attr('class', 'line') // I add the class line to be able to modify this line later on.
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
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

    // Add the brushing
    line.append('g').attr('class', 'brush').call(brush);

    // A function that set idleTimeOut to null
    var idleTimeout: any;
    function idled() {
      idleTimeout = null;
    }

    // A function that update the chart for given boundaries
    function updateChart() {
      // What are the selected boundaries?
      var extent = d3.event.selection;

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if (!extent) {
        if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
        x.domain([4, 8]);
      } else {
        x.domain([x.invert(extent[0]), x.invert(extent[1])]);
        line.select('.brush').call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      xAxis.transition().duration(1000).call(d3.axisBottom(x));
      line
        .select('.line')
        .transition()
        .duration(1000)
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

      // If user double click, reinitialize the chart
      return;
    }
    this.svg.on('dblclick', () => {
      x.domain(
        <[Date, Date]>d3.extent(this.data, function (d: any) {
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
  }
}
