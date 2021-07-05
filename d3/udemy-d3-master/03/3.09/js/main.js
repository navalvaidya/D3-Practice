/*
*    main.js
*    Mastering Data Visualization with D3.js
*    3.9 - Margins and groups
*/
const MARGIN = {LEFT:100, RIGHT:10, TOP:10, BOTTOM:100}
const WIDTH = 600-MARGIN.LEFT-MARGIN.RIGHT;
const HEIGHT = 400 -MARGIN.TOP-MARGIN.BOTTOM;

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform",`translate(${MARGIN.LEFT},${MARGIN.TOP})`)

d3.json("data/buildings.json").then(data => {
  data.forEach(d => {
    d.height = Number(d.height)
  })

  const x = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, WIDTH])
    .paddingInner(0.3)
    .paddingOuter(0.2)
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.height)])
    .range([HEIGHT, 0])
    // .range([0, HEIGHT])

  const colorScale = d3.scaleOrdinal()
    .domain(["africa","asia","europe","americas"])
    .range(d3.schemeCategory10)  

  const xAxisCall = d3.axisBottom(x)
  g.append("g")
    .attr("class","x axis")
    .attr("transform",`translate(0,${HEIGHT})`)
    .call(xAxisCall)
    .selectAll("text")
      .attr("y",10)
      .attr("x",-5)
      .attr("text-anchor","end")
      .attr("transform","rotate(-40)")

  const yAxisCall = d3.axisLeft(y)
    .ticks(3)
    .tickFormat(d=>d + "m")
  g.append("g")
    .attr("class","y axis")
    .call(yAxisCall)
    

  const rects = g.selectAll("rect")
    .data(data)
  
  rects.enter().append("rect")
    .attr("y", 0)
    .attr("x", (d) => x(d.name))
    .attr("width", x.bandwidth)
    .attr("height", d => y(d.height))
    .attr("fill", "grey")
})