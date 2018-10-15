// Called on page load
function init() {
  getSamples();
}

init();

// available sample
function getSamples() {
  // select element
  var selDataset = document.getElementById('Sample_Dataset');
  // Use the list of sample names to populate the select sample
  Plotly.d3.json('/names', function (error, samplenames) {
      
      for (var i = 0; i < samplenames.length; i++) {
          var option = document.createElement('option');
          option.text = samplenames[i];
          option.value = samplenames[i];
          selDataset.appendChild(option)
      }
      getData(samplenames[0], buildCharts);
  })
}

// Function to get the sample data from the routes - sample/sample and 'otu'
function getData(sample, callback) {

  Plotly.d3.json('/samples/'+sample, function (error, sampleData) {
      if (error) return console.warn(error);
      console.log("i am get Data")
      Plotly.d3.json('/tu', function (error, otuData) {
          console.log('OtuData',otuData);
          if (error) return console.warn(error);
          console.log('sampleData',sampleData);
          callback(sampleData, otuData);
      });
  });
  Plotly.d3.json('/metadata/'+sample, function(error, metaData) {
      if (error) return console.warn(error);
      console.log('i am get metadata')
      updateMetaData(metaData);
  });

}

function optionChanged(newSample){
    getData(newSample, updateCharts);
}

// Function to build the basic charts when the page loads
function buildCharts(sampleData, otuData) {

  // Loop through sample data and find the OTU Taxonomic Name
  var labels = sampleData['otu_ids'].map(function (item) {
      return otuData[item]
  });
  // Build PIE Chart
  console.log("I am get charts")
  console.log(sampleData['sample_values'].slice(0, 10))
  console.log(sampleData['otu_ids'].slice(0, 10))
  console.log(labels.slice(0, 10))

  var piedata = [{

      values: sampleData['sample_values'].slice(0, 10),
      labels: sampleData['otu_ids'].slice(0, 10),
      hovertext: labels.slice(0, 10),
      hoverinfo: 'hovertext',
      type: 'pie'
  }];

  var pielayout = { height:400, width:400 };

  var PIE = document.getElementById('pie');
  Plotly.plot(PIE, piedata, pielayout);

  // Bubble Chart

  var bubbleData = [{
      x: sampleData['otu_ids'],
      y: sampleData['sample_values'],
      text: labels,
      mode: 'markers',
      marker: {
          size: sampleData['sample_values'],
          color: sampleData['otu_ids'],
          colorscale: "Earth",
      }
  }];

  var bubblechart = { height:600, width:1200, hovermode: 'closest', xaxis: { title: 'OTU ID' } };
  var BUBBLE = document.getElementById('bubble');
  Plotly.plot(BUBBLE, bubbleData, bubblechart);
}

// Function to update the charts based on the sample selection
function updateCharts(sampleData, otuData) {

  
  var sampleValues = sampleData['sample_values'];
  var otuIDs = sampleData['otu_ids'];
  // Return the OTU Description for each otuID in the dataset
  var labels = otuIDs.map(function(item) {
      return otuData[item]
  });
    
  // Update the Bubble Chart with the new data
  var BUBBLE = document.getElementById('bubble');
  Plotly.restyle(BUBBLE, 'x', [otuIDs]);
  Plotly.restyle(BUBBLE, 'y', [sampleValues]);
  Plotly.restyle(BUBBLE, 'text', [labels]);
  Plotly.restyle(BUBBLE, 'marker.size', [sampleValues]);
  Plotly.restyle(BUBBLE, 'marker.color', [otuIDs]);
  
  // Update the Pie Chart with the new data
  // Use slice to select only the top 10 OTUs for the pie chart
  var PIEchart = document.getElementById('pie');
  var pieUpdate = {
      values: [sampleValues.slice(0, 10)], 
      labels: [otuIDs.slice(0, 10)],
      hovertext: [labels.slice(0, 10)],
      hoverinfo: 'hovertext',
      type: 'pie'
  };
  
  Plotly.restyle(PIEchart, pieUpdate);
  
}

// Function to update sample data
function updateMetaData(data) {
  // page element existing metadata
  var samplepage = document.getElementById("sample-metadata");

  samplepage.innerHTML = '';
  
  // loop create new metadata tags
  for(var item in data) {
      h6tag = document.createElement("h6");
      h6Text = document.createTextNode(`${item}: ${data[item]}`);
      h6tag.append(h6Text);
      samplePanel.appendChild(h6tag);
  }

}