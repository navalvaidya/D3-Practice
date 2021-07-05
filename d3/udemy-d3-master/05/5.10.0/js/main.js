/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const MARGIN = {LEFT:100,RIGHT:10,TOP:10,BOTTOM:100}
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
	.attr("width",WIDTH+MARGIN.LEFT+MARGIN.RIGHT)
	.attr("height",HEIGHT+MARGIN.TOP+MARGIN.BOTTOM)

const g = svg.append("g")
	.attr("transform",`translate(${MARGIN.LEFT},${MARGIN.TOP})`)

const xLabel = g.append("text")
	.attr("class","x axis-label")
	.attr("x",WIDTH/2)
	.attr("y",HEIGHT+60)
	.attr("font-size","20px")
	.attr("text-anchor","middle")
	.text("GDP Per Capita ($)")

const yLabel = g.append("text")
	.attr("class","y axis-label")
	.attr("x", - (HEIGHT / 2))
  	.attr("y", -60)
  	.attr("font-size", "20px")
  	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Life Expectancy (Years)")  

const yearLabel = g.append("text")
	.attr("class","year-label")
	.attr("x",WIDTH-60)
	.attr("y",HEIGHT-30)
	.attr("font-size","20px")

const x = d3.scaleLog()
	.base(10)
	.domain([100,150000])
	.range([0,WIDTH])

const y = d3.scaleLinear()
	.domain([0,90])
	.range([HEIGHT,0])

const area = d3.scaleLinear()
	.range([25*Math.PI, 1500*Math.PI])
	.domain([2000, 1400000000])

const colorScale = d3.scaleOrdinal(d3.schemePastel1)

const xAxisGroup = g.append("g")
	.attr("class","x axis")
	.attr("transform",`translate(0,${HEIGHT})`)

const yAxisGroup = g.append("g")
	.attr("class","y-axis")
	
const xAxisCall = d3.axisBottom(x)
	.ticks(3)
	.tickValues([400,4000,40000])
	.tickFormat(d=>d)

xAxisGroup
	.call(xAxisCall)
	.selectAll("text")
	.attr("y","15")
	.attr("x","10")
	.attr("text-anchor","end")
	
const yAxisCall = d3.axisLeft(y)
yAxisGroup.call(yAxisCall)
	
const continents = ["europe","asia","americas","africa"]

const legend = g.append("g")
	.attr("transform",`translate(${WIDTH-10},${HEIGHT-125})`)

continents.forEach((continent,i)=>{
	const legendRow = legend.append("g")
		.attr("transform",`translate(0,${i*20})`)

	legendRow.append("rect")
		.attr("width",10)
		.attr("height",10)
		.attr("fill",colorScale(continent))

	legendRow.append("text")
		.attr("x",-10)
		.attr("y",10)
		.attr("text-anchor","end")
		.style("text-transform","capitalize")
		.text(continent)
})

var yearIndex=0;
let formattedData;
let interval;
d3.json("data/data.json").then(function(data){
	formattedData = data.map(yearObj=>{
		yearObj.countries = yearObj.countries.filter(countryData=>{
			return countryData.life_exp!==null && countryData.income!=null
		})
		return yearObj
	})
})

function step(){
	if(yearIndex>=formattedData.length){
		interval.stop()
	}
	// else{
	// 	yearIndex=0;
	// }
	update(formattedData[yearIndex])
	yearIndex = yearIndex+1
}

function update(data){
	let countries = data.countries
	const continent = $("#continent-select").val()
	const t = d3.transition()
		.duration(50)
	yearLabel.text(data.year)
	const filteredData = data.countries.filter(d=>{
		if(continent==="all") return true
		else{
			return d.continent===continent
		}
	})
	
	const circ = g.selectAll("circle")
		.data(filteredData,d=>d.country)
	
	circ.exit().remove()

	circ.enter().append("circle")
		.attr("fill",(d)=>colorScale(d.continent))
		.merge(circ)
		.attr("cx",(d)=>x(d.income))
		.attr("cy",(d)=>y(d.life_exp))
		.attr("r",d => Math.sqrt(area(d.population) / Math.PI))

	$("#year")[0].innerHTML = data.year
	$("#date-slider").slider("value",+data.year)
}

$("#play-button").on("click",function(){
	
	const button = $(this)
	if(button.text()==="Play"){
		button.text("Pause")
		interval = setInterval(step,100)
	}
	else if(button.text()==="Pause"){
		button.text("Play")
		clearInterval(interval)
	}
})

$("#reset-button").on("click",function(){
	yearIndex=0;
	update(formattedData[yearIndex])
})

$("#continent-select").on("change",function(){
	update(formattedData[yearIndex])
})

$("#date-slider").slider({
	min:1800,
	max:2014,
	step:1,
	slide:(event,ui)=>{
		time = ui.value-1800
		update(formattedData[time])
	}
})