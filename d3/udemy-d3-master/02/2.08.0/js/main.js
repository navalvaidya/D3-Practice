/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.8 - Activity: Your first visualization!
*/

d3.json('/data/buildings.json').then(data=>{
    data.forEach(d=>{
        d.height = +d.height
    })
    console.log(data);

    const svg = d3.select("#chart-area").append("svg")
    .attr("width",400)
    .attr("height",400)

    const rectangles = svg.selectAll("rect")
        .data(data)
    
    rectangles.enter().append("rect")
        .attr("y",10)
        .attr("x",(d,i)=>(i*60))
        .attr("width",20)
        .attr("height",(d)=>d.height)
        .attr("fill","grey")
}).catch(error=>{
    console.log(error);
})