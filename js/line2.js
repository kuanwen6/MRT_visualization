var format = d3.time.format("%Y");
var percentFormat = d3.format(".2p");
var _f = d3.format(".0f");

var margin = {top: 25, right: 200, bottom: 30, left: 50},
    width = 680 - margin.left - margin.right+730,
    height = 500 - margin.top - margin.bottom;

    width1 = 430;

var x = d3.scale.ordinal()
      .rangeRoundBands([0, width1],.3);

var y = d3.scale.linear()
      .rangeRound([height,0]);

var z = d3.scale.category20b()
      .domain(["2","1","0"])
      .range(["#e6550d","#31a354","#a55194"]);

var z2 = d3.scale.category20b()
      .domain(["2","1","0"])
      .range(["#fdae6b","#e6550d","#31a354"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%Y"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right")
    .tickFormat(d3.format(".2s"));

var LyAxis= d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var nest = d3.nest()
    .key(function(d) { return d.type; });

var line = d3.svg.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.value); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var legendClassArray = [];

var yMaxValue=5228331;  //use python to generate this value
var maxMoney=125352358.7142857;

d3.csv("data/money_y.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.year = format.parse(d.year);
  })

  //x.domain(d3.extent(data, function(d) { return d.month; }));
  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0,maxMoney]).nice();

  svg.append("text")
        .attr("transform", "translate(-35,-20)")
        .attr("dy", ".71em")
        .text("營業額 (元)");

  svg.append("g")
      .attr("class", "y axis2")
      .call(LyAxis)

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.year); })
      .attr("width", x.rangeBand())
      .attr("fill","#add8e6")
      //.attr("width", 20)
      .attr("y", function(d) { return y(d.money); })
      .attr("height", function(d) { return height - y(d.money); })
      .on("mouseover", function() { tooltip.style("display", null); })
      .on("mouseout", function() { tooltip.style("display", "none"); })
      .on("mousemove", function(d) {
        var year=d.year.getFullYear();

        var xPosition = d3.mouse(this)[0] - 15;
        var yPosition = d3.mouse(this)[1] - 25;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select("text").text(year+"年營業額:"+_f(d.money)+"(元)");

        d3.csv("data/ticket_y.csv", function(error, data) {
        if (error) throw error;
         data.forEach(function(d) {
          d.year = format.parse(d.year);
           d.value = +d.value;
          });
          piePlot(data,year)
          var title=svg.selectAll(".title")
            .text(year+"年份票卡比例")
        });
      });

      var tooltip = svg.append("g")
                   .attr("class", "tooltip")
                   .style("display", "none");
      tooltip.append("rect")
        .attr("class", "toolrect")
        .attr("width", 220)
        .attr("height", 30)
        .attr("fill", "white")
        .style("opacity", 0.9);

    tooltip.append("text")
        .attr("x", 10)
        .attr("dy", "1.2em")
        .attr("font-size", "17px")
        .attr("font-weight", "bold");

});

var radius = 270 / 2;

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.value; });



d3.csv("data/ticket_y.csv", function(error, data) {
  if (error) throw error;
  data.forEach(function(d) {
    d.year = format.parse(d.year);
    d.value = +d.value;
  });

  var layers = nest.entries(data);

  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0,yMaxValue]).nice();

svg.append("text")
        .attr("transform", "translate("+ width1 +",-20)")
        .attr("dy", ".71em")
        .text("流量 (次)");


  svg.selectAll(".layer")
      .data(layers)
      .enter().append("path")
      .attr("class", "layer")
      .attr("transform", "translate(12,0)")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d,i) { return z(i); })

  svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) {  return x(d.year)+12; })
        .attr("cy", function(d) { return y(d.value); })
        .style("fill", function(d,i) {
          switch(d.type)
          {
            case "total":
              return z(0)
            case "ticket":
              return z(1)
            case "one_way":
              return z(2)
            default:
          }
        });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width1 + ",0)")
      .call(yAxis);

    var legend = svg.selectAll(".legend")
      .data(z.domain().slice().reverse())
      .enter().append("g")
      .attr("class", function (d) {

        legendClassArray.push(d);
        return "legend";
      })
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  //reverse order to match order in which bars are stacked
  legendClassArray = legendClassArray.reverse();

  legend.append("circle")
      .attr("cy", 8)
      .attr("cx", width1 + 65)
      .attr("r", 3.5)
      .style("fill", z)
      .attr("id", function (d, i) {
        return "id" + d;
      })

  legend.append("line")
      .attr("x1", width1+53)
      .attr("y1", 8)
      .attr("x2", width1+77)
      .attr("y2", 8)
      .style("stroke", z)

  legend.append("text")
      .attr("x", width1 + 86)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return "總和"
          case "1":
            return "票卡"
          case "2":
            return "單程票"
          default:
        }
      });

  svg.append("rect")
      .attr("x",width1 + 56)
      .attr("y",60)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill","#add8e6")

  svg.append("text")
      .attr("x", width1 + 86)
      .attr("y", 69)
      .attr("dy", ".35em")
      .text("營業額");

var ye=2016,tol;
  var data2 = new Array()

  data.forEach(function(d) {
    var Obj = new Object();
    var a=d.year.getFullYear();
    if(a === ye )
    {
      if(d.type === "total")
      {
        tol=d.value;
      }
      else
      {
        Obj.value = +d.value;
        data2.push(Obj);
        if(d.type === "one_way")
        {
          var Obj = new Object();
          Obj.value = tol-data2[0].value-data2[1].value;
          data2.push(Obj);
        }
      }
    }
  });

  var path = svg.datum(data2).selectAll(".pie")
      .data(pie)
    .enter().append("path")
    .attr("class", "pie")
      .attr("transform",  "translate("+(width1+360) +","+(height/2)+")" )
      .style("opacity",0.8)
      .attr("fill", function(d, i) { return z2(i); })
      .attr("d", arc)
      .each(function(d) { this._current = d; });

  var title=svg.append("text")
      .attr("x", width -132)
      .attr("y", height/2-70)
      .attr("class", "title")
      .style("font-size",22)
      .text(ye+"年份票卡比例")

  var legend2 = svg.selectAll(".legend2")
      .data(z2.domain().slice().reverse())
      .enter().append("g")
      .attr("class", "legend2")
      .attr("transform", function(d, i) { return "translate(0," + (i * 35+180) + ")"; });

  for(i=0;i<4;i++)
  {
    svg.append("line")
      .style("stroke", "grey")
      .attr("transform", function() { return "translate(0," + (i * 35+171) + ")"; })
      .attr("x1", width - 145)
      .attr("y1", 0)
      .attr("x2", width +  65)
      .attr("y2", 0);
  }

  legend2.append("rect")
      .attr("x", width - 140)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill-opacity", 0.8)
      .style("fill", z2)

  legend2.append("text")
      .attr("x", width -119)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return "票卡";
          case "1":
            return "單程票";
          case "2":
            return "其他";
          default:
        }
      });

  legend2.append("text")
      .attr("x", width -70)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("class", "text1")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return _f(data2[0].value)+"(次)"
          case "1":
            return _f(data2[1].value)+"(次)"
          case "2":
            return _f(data2[2].value)+"(次)"
          default:
        }
      });

  legend2.append("text")
      .attr("x", width +20)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("class", "text2")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return  percentFormat(data2[0].value/tol)
          case "1":
            return  percentFormat(data2[1].value/tol)
          case "2":
            return  percentFormat(data2[2].value/tol)
          default:
        }
      });



});


function piePlot(data,year)
{
   var tol;
  var data2 = new Array()

 data.forEach(function(d) {
    var Obj = new Object();
    var a=d.year.getFullYear();
    if(a === year )
    {
      if(d.type === "total")
      {
        tol=d.value;
      }
      else
      {
        Obj.value = +d.value;
        data2.push(Obj);
        if(d.type === "one_way")
        {
          var Obj = new Object();
          Obj.value = tol-data2[0].value-data2[1].value;
          data2.push(Obj);
        }
      }
    }
  });

  var path = svg.datum(data2).selectAll(".pie")

    pie.value(function(d) { return d.value; }); // change the value function
    path = path.data(pie); // compute the new angles
    path.transition().duration(500).attrTween("d", arcTween); // redraw the arcs

    var legend2 = svg.selectAll(".legend2")

  legend2.selectAll(".text1")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return _f(data2[0].value)+"(次)"
          case "1":
            return _f(data2[1].value)+"(次)"
          case "2":
            return _f(data2[2].value)+"(次)"
          default:
        }
      });

  legend2.selectAll(".text2")
      .text(function(d) {
        switch(d)
        {
          case "0":
            return  percentFormat(data2[0].value/tol)
          case "1":
            return  percentFormat(data2[1].value/tol)
          case "2":
            return  percentFormat(data2[2].value/tol)
          default:
        }
      });
}

function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
}
