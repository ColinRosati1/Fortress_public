var React = require('react');
var ReactDom = require('react-dom')
var ipc = require('ipc');
var fs = require('fs')





var FssPlot = React.createClass({
  getInitialState: function(){
    //var arm = null;
    //var dsp = null;


  
   // arm.echo_cb(function(){arm.dsp_open()}, arm)
    return({data:[], layout:{"showlegend": true,
  "xaxis": {"showgrid": true,"showline": false,"zeroline": false},
  "yaxis": {"showgrid": true,"showline": false,"zeroline": false},"legend": {},"margin": {}},
  hastrace:false, ra:[],xa:[], chans:[],sigs:[], labels:[], details:{}
})
  },
  plotFromChan: function(chan){
  	console.log(chan)
  	var data = [];
    for(var c in chan){
    	data.push({'y':chan[c].slice(0), "type":"scatter","mode":"lines","connectgaps":true,"name":c})
    }
    this.plotCallBack([data,0])
    
  },
  componentDidMount: function(){
    var self = this;
    var dif = document.getElementById(this.props.plotDivId);
    Plotly.plot(dif, this.state.data, this.state.layout);

    //this.bindSo();
  },
  plotCallBack: function(data){
    console.log(data)
    var divid = document.getElementById(this.props.plotDivId);
      if((divid.data.length!=0)||(divid.data.length != data[0].length)){ Plotly.newPlot(divid, data[0], this.state.layout);}else{
         Plotly.plot(divid, data[0], this.state.layout);
      }
     
      
      Plotly.redraw(divid);
      this.setState({data:data[0], hastrace:true, ra:[], xa:[], triggerOn:false})
      //this.props.setHighlight(data[1])
      
  },
  onFile: function(e){
  	console.log(e.target.files[0].path)
  	var self = this;
  	fs.readFile(e.target.files[0].path, (err, data) => {
  		console.log(JSON.parse(data))
  		self.plotFromChan(JSON.parse(data).Channels)
  		self.setState({details:JSON.parse(data)})
  		console.log(self.state.details)
  	})
  },
  render: function(){
  	var dets = [];
  	for(var d in this.state.details){
  		console.log(d)
  		if(d != 'Channels'){
  			console.log(d)
  			dets.push([d,this.state.details[d]])
  		}
  	}
    console.log(dets)
    var prefs = dets.map(function(d){
    	return (<tr><td>{d[0]}</td><td>{d[1]}</td></tr>)
    })
    var tab = <table>{prefs}</table>
    return(

    <div className="container">
    <input onChange={this.onFile} type='file'>Open Fss File</input>
  	{tab}
     <div id={this.props.plotDivId} className="js-plotly-plot"/>
    	
    
    </div>);
  }
});

ReactDom.render(<FssPlot plotDivId='fss_plot'/>,document.getElementById('content'));