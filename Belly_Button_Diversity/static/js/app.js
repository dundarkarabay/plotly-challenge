function buildMetadata(sample) {

  (async function () {
    // Use `d3.json` to fetch the metadata for a sample
    let data = await d3.json(`/metadata/${sample}`);
    // Use d3 to select the panel with id of `#sample-metadata` and clear any existing metadata
    d3.selectAll("div#sample-metadata>tr").remove();
    // Use `Object.entries` to add each key and value pair to the panel
    const dataArray = Object.entries(data);
    // Hint: Inside the loop, you will need to use d3 to append new tags for each key-value in the metadata.
    for(let i=0; i<dataArray.length;i++){
      d3.select("div#sample-metadata").append("tr").append("td").text(`${dataArray[i][0]}: ${dataArray[i][1]}`);
    }

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    const traceGauge = {
      type: 'pie',
      showlegend: false,
      hole: 0.6,
      rotation: 90,
      values: [20, 20, 20, 20, 20, 20, 20, 20, 20, 180],
      text: ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9'],
      direction: 'clockwise',
      textinfo: 'text',
      textposition: 'inside',
      marker: {
      colors: ["#E5FFCC","#CCFF99","#B2FF66","#99FF33","#80FF00","#66CC00","#4C9900","#336600","193300","white"],
      labels: ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9']
      }
    }

    const needleLength = 0.2*Math.sqrt(2);
    const washFREQ = parseInt(data.WFREQ);
    const radians = washFREQ * Math.PI / 9
    const x_1 = (0.5 - (needleLength*Math.cos(radians)));
    const y_1 = (0.5 + (needleLength*Math.sin(radians)));

    const gaugeLayout = {
      shapes: [{
        type: 'line',
        fillcolor: '850000',
        x0: 0.5,
        y0: 0.5,
        x1: x_1,
        y1: y_1,
        line: {
          color: '850000'
        }
      }],
      title: 'Belly Button Washing Frequency',
      annotations: [{
        text: "Scrubs per Week",
          font: {
          size: 13
        },
        x: 0.5,
        y: 1.125,
        showarrow: false,
        align: 'center',
      }],
      hovermode: false,
      xaxis: {visible: false, range: [-1, 1]},
      yaxis: {visible: false, range: [-1, 1]}
    }

    const dataGauge = [traceGauge]
    Plotly.plot('gauge', dataGauge, gaugeLayout)   
  })()
}

// function updateGaugePlotly(sample) {
//   (async function () {
//     let data = await d3.json(`/metadata/${sample}`);
//     const needleLength = 0.2*Math.sqrt(2);
//     const washFREQ = parseInt(data.WFREQ);
//     const radians = washFREQ * Math.PI / 9
//     const x_1 = (0.5 - (needleLength*Math.cos(radians)));
//     const y_1 = (0.5 + (needleLength*Math.sin(radians)));
//     const new_gaugeLayout = {
//       shapes: [{
//         x1: x_1,
//         y1: y_1,
//       }]
//     };
//     Plotly.update('gauge', new_gaugeLayout);
//   })()
// }

function buildCharts(sample) {
  (async function () {
    // Use `d3.json` to fetch the sample data for the plots
    const data = await d3.json(`/samples/${sample}`);
    // Transforming the data to an arry ob objects so that we can easily sort them.
    const dataLength = data.otu_ids.length;
    const transformedData = [];

    for (let i=0; i<dataLength; i++){
      let dict = {
        "otu_ids": data.otu_ids[i],
        "otu_labels": data.otu_labels[i],
        "sample_values": data.sample_values[i] 
      };
      transformedData.push(dict);
    }
    // Sorting the transformed data from highest to lowest based on sample_values.
    const new_data = transformedData.sort((minimum, maximum) => maximum.sample_values-minimum.sample_values);
    // Slicing the ordered data.
    const first_ten_new_data = new_data.slice(0,10);
    // Building the pie chart
    const tracePie = {
      values: first_ten_new_data.map(d=> d.sample_values),
      labels: first_ten_new_data.map(d=> d.otu_ids),
      hovertext: first_ten_new_data.map(d=> d.otu_labels),
      type: "pie"
    };

    const pieLayout = {
      legend: {
        traceorder: 'grouped'
      }
    };

    Plotly.plot("pie", [tracePie], pieLayout);
    // Building the scatter plot
    console.log(transformedData);
    const traceScatter = {
      x: transformedData.map(d=> d.otu_ids),
      y: transformedData.map(d=> d.sample_values),
      type: "scatter",
      mode: 'markers',
      text: transformedData.map(d=> d.otu_labels),
      marker: {
        hoverinfo:"x+y",
        size: transformedData.map(d=> d.sample_values),
        color: transformedData.map(d=> d.otu_ids)
      }
    };

    const scatterLayout = {
      hovermode:'closest',
      xaxis:{zeroline:false, title: "OTU ID"},
      yaxis:{zeroline:false}
    };

    Plotly.plot("bubble", [traceScatter], scatterLayout);
  })()
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  // updateGaugePlotly(newSample);
}

// Initialize the dashboard
init();
