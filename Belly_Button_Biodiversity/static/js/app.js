function buildMetadata(sample) {

  
  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/" + sample).then(function(data) {

    // Use d3 to select the panel with id of `#sample-metadata`
    panel = d3.select("#sample-metadata");
    
    panel.html("");
    
    Object.entries(data).forEach(function([key, value]) {
      panel.append("p").html(key + ": " + value);
    });
  

  });
}

function buildGaugeData(sample) {
  d3.json("/wfreq/" + sample).then(function(data) {

    buildGauge(data.WFREQ);

  });
}

function buildCharts(sample) {

  // fetch the sample data for the plots
  d3.json("/samples/" + sample).then(function(data) {
    // @TODO: Build a Bubble Chart using the sample data

    trace = [{x: data.otu_ids, y: data.sample_values, 
      mode: 'markers',
      marker: { size: data.sample_values, color: data.otu_ids },
      text: data.otu_labels
     }];

     Plotly.newPlot('bubble', trace);

  
    // otu_ids, and labels (10 each).

    sample_values10 = data.sample_values.slice(0,10);
    otu_ids10 = data.otu_ids.slice(0,10);
    otu_labels10 = data.otu_labels.slice(0,10);
    trace1 = [{values: sample_values10,
    labels: otu_ids10,
    text: otu_labels10,
    textinfo: 'percent',
    type: 'pie' }];
    Plotly.newPlot('pie',trace1);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text("BB_" + sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    buildGaugeData(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  buildGaugeData(newSample);
}

// Initialize the dashboard
init();