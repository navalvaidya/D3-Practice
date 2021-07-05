/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 3 - CoinStats
*/
		
const MARGIN = { LEFT: 20, RIGHT: 100, TOP: 50, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")
const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// time parser for x-scale
// const parseTime = d3.timeParse("%Y")
// for tooltip
const bisectDate = d3.bisector(d => d.date).left

// scales
const x = d3.scaleTime()
	.domain([new Date(2012,1,1),new Date(2018,1,1)])
	.range([0, WIDTH])
const y = d3.scaleLinear().range([HEIGHT, 0])

// axis generators
const xAxisCall = d3.axisBottom()
	// .ticks(5)
	// .tickFormat(d=>d.getFullYear())
const yAxisCall = d3.axisLeft()
	.ticks(6)
	.tickFormat(d => `${parseInt(d / 1000)}k`)

// axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
const yAxis = g.append("g")
	.attr("class", "y axis")
    
// y-axis label
yAxis.append("text")
	.attr("class", "axis-title")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#5D6971")
	.text("Population)")

// line path generator
const line = d3.line()
	.x(d => x(d.date))
	.y(d => y(d[yValue]))

// add line to chart
const dLine = g.append("path")
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", "grey")
	.attr("stroke-width", "3px")

const currencies = ["bitcoin","bitcoin_cash","ethereum","litecoin","ripple"];
let formattedData;
let selectedCoin="bitcoin";
let yValue = "price_usd";


d3.json("data/coins.json").then(data => {
	// console.log(data);
	// clean data
	
	currencies.forEach(d=>{
		data[d] = data[d].filter((currencyData)=>{
			return currencyData.price_usd!==null
		}).map(record=>{
			record["market_cap"] = +record["market_cap"]
			record["price_usd"] = +record["price_usd"]
			record["date"] = parseTime(record["date"])
			record["24h_vol"] = +record["24h_vol"]
			return record
		})
		console.log(data[d])
	})
	formattedData = data;
	// set scale domains
	update()

})


	/******************************** Tooltip Code ********************************/

const focus = g.append("g")
	.attr("class", "focus")
	.style("display", "none")

focus.append("line")
	.attr("class", "x-hover-line hover-line")
	.attr("y1", 0)
	.attr("y2", HEIGHT)

focus.append("line")
	.attr("class", "y-hover-line hover-line")
	.attr("x1", 0)
	.attr("x2", WIDTH)

focus.append("circle")
	.attr("r", 7.5)

focus.append("text")
	.attr("x", 15)
	.attr("dy", ".31em")

g.append("rect")
	.attr("class", "overlay")
	.attr("width", WIDTH)
	.attr("height", HEIGHT)
	.on("mouseover", () => focus.style("display", null))
	.on("mouseout", () => focus.style("display", "none"))
	.on("mousemove", mousemove)

function mousemove() {
	const x0 = x.invert(d3.mouse(this)[0])
	const i = bisectDate(formattedData[selectedCoin], x0, 1)
	const d0 = formattedData[selectedCoin][i - 1]
	const d1 = formattedData[selectedCoin][i]
	const d = x0 - d0.date > d1.date - x0 ? d1 : d0
	focus.attr("transform", `translate(${x(d.date)}, ${y(d[yValue])})`)
	focus.select("text").text(d[yValue])
	focus.select(".x-hover-line").attr("y2", HEIGHT - y(d[yValue]))
	focus.select(".y-hover-line").attr("x2", -x(d.date))
	/******************************** Tooltip Code ********************************/
}


function update(){
	const t = d3.transition().duration(1000)
	var sliderValues = $("#date-slider").slider("values")
	var filteredData = formattedData[selectedCoin].filter((d)=>{
		return (d.date>=sliderValues[0] && d.date<=sliderValues[1])
	})
	x.domain(d3.extent(filteredData, d => new Date(d.date)))
	// y.domain(d3.extent(coinData,d=>d.price_usd))
	y.domain([
		d3.min(filteredData, d => d[yValue]) / 1.005, 
		d3.max(filteredData, d => d[yValue]) * 1.005
	])

	const formatSi = d3.format(".2s")
	function formatAbbreviation(x) {
		const s = formatSi(x)
		switch (s[s.length - 1]) {
			case "G": return s.slice(0, -1) + "B" // billions
			case "k": return s.slice(0, -1) + "K" // thousands
		}
		return s
	}
	
	// generate axes once scales have been set
	xAxisCall.scale(x)
	xAxis.transition(t).call(xAxisCall)
	yAxisCall.scale(y)
	yAxis.transition(t).call(yAxisCall.tickFormat(formatAbbreviation))
	
	dLine.transition(t).attr("d", line(filteredData))
}

$("#coin-select").on("change",function(){
	selectedCoin = $(this).val()
	update()
})

$("#var-select").on("change",function(){
	yValue = $(this).val()
	update()
})

$("#date-slider").slider({
	range:true,
	min:parseTime('12/05/2013').getTime(),
	max:parseTime('31/10/2017').getTime(),
	step:86400,
	values:[parseTime('12/05/2013').getTime(),parseTime('31/10/2017').getTime(),],
	slide:(event,ui)=>{
		$("#dateLabel1").text(formatTime(new Date(ui.values[0])))
		$("#dateLabel2").text(formatTime(new Date(ui.values[1])))
		update()
	}
})
