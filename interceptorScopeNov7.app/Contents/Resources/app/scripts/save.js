var React = require('react');
var ReactDom = require('react-dom')
const electron = require('electron')
//const {app} = electron;
const {ipcRenderer} = electron;
var fs = require('fs')

/*ipc.on('sigdata', function(event, data){
	console.log(event)
	console.log(data)
})*/

var Container = React.createClass({
	getInitialState: function(){
		
		return ({prefs:{"CustomerName":"Daniel","ProductDescription":"","Notes":""},data:[], set:false})

	},
	componentWillMount: function(){
		//read file in main process or main window...
		var self = this;
		var pjson = {"CustomerName":"Daniel","ProductDescription":"","Notes":""}
   
		ipcRenderer.on('sigdata', function(p){
			console.log(p)
			self.setState({data:p['Channels'], set:true})
		})
		ipcRenderer.on('loadPrefs', function(p){
			console.log(p)
			self.setState({prefs:p})
			console.log("loaded prefs")
		});

	},
	saveChanges: function(p){
		console.log(p)
		this.setState({prefs:p})
		ipc.send("savePrefs",p)
	},
	saveFss: function(){
		if(this.state.prefs['Path']){


		var prefs = this.state.prefs;
		var channels = this.state.data;
		var fss ={}
		fss["CustomerName"] = prefs["CustomerName"];
		fss["ProductDescription"] = prefs["ProductDescription"];
		fss["Notes"] = prefs["Notes"]
		fss["TimeStamp"] = new Date(Date.now()).toString();
		fss["Channels"] = channels;//{"R":channels[0],"X":channels[1],"Detection":channels[2],"Product Count":channels[3],"Eye":channels[4]}
		console.log(JSON.stringify(fss))
		fs.writeFile(this.state.prefs["Path"]+'/res.fss', JSON.stringify(fss))
	}
	else{
		alert("Set output path first.")
		//write fss using prefs
	}
	},
	render: function (){
		var pi = ""
		if(this.state.set){
			console.log(this.state.set)
			pi = (<PreferenceInterface prefs={this.state.prefs} saveChanges={this.saveChanges}/>)
		}
		//<PreferenceInterface prefs={this.state.prefs}/>
		return (<div>{pi}
			<button onClick={this.saveFss}>Save Fss</button>
			</div>)
	}
});

var PreferenceInterface = React.createClass({
	getInitialState: function(){
		return({prefs:this.props.prefs, changed:false})
	},
	componentWillMount: function(){
		var self = this;
		ipcRenderer.on('prefsDoneUpdate', function(){
			self.setState({changed:false})
		})
	},
	grabPath: function(path){
		var prefs = this.state.prefs;
		prefs["Path"] = path;
		this.setState({prefs:prefs, changed:true})

	},
	handleText: function(i,v){
		var keys = ["Path", "CustomerName", "ProductDescription", ]
		var prefs = this.state.prefs
		prefs[keys[i]] = v;
		this.setState({prefs:prefs, changed:true})
	},
	saveChanges: function(){
		this.props.saveChanges(this.state.prefs)
	},
	render: function(){
		//path
		//customer
		//prod desc
		//notes
		//detector size
		//frequency
		var but = ""
		if(this.state.changed){
			but = (<button onClick={this.saveChanges}>save</button>)
		}
		console.log(this.state.prefs)
		console.log(this.state.prefs["Path"])
		return (<div>
			<div><label>Preferences</label></div>

			<HackWebkitDirectory winput='wfileinput' passVal={this.grabPath} showPath={true}/>
			<label>{this.state.prefs["Path"]}</label>
			<CustomTextInput name="Customer" prefInd={1} handle={this.handleText} value={this.state.prefs["CustomerName"]}/>
			<CustomTextInput name="Product Description" prefInd={2} handle={this.handleText} value={this.state.prefs["ProductDescription"]}/>
			<CustomTextInput name="Notes" prefInd={3} handle={this.handleText} value={this.state.prefs["Notes"]}/>
			<CustomTextInput name="Detector Size" prefInd={4} handle={this.handleText} value={this.state.prefs["DetSize"]}/>
			<CustomTextInput name="Frequency" prefInd={5}  handle={this.handleText} value={this.state.prefs["Freq"]}/>
			{but}
			</div>)
	}
})
var CustomTextInput = React.createClass({
	getInitialState: function(){
		return ({value:this.props.value})
	},
	changeVal: function(e){
		this.setState({value:e.target.value})
		this.props.handle(this.props.prefInd,e.target.value)
	},
	render: function(){
		return (<div className="customTextInput">
			<label>{this.props.name}</label>
			<input type='text' onChange={this.changeVal} value={this.state.value}/>
			</div>)
	}	
})
var CustomPathInput = React.createClass({
	render: function(){
		return (<div></div>)
	}
})


var HackWebkitDirectory = React.createClass({
	getInitialState: function(){
		return({pathSet:false, path:"", name: "", showPath:this.props.showPath})
	},
	click: function(){
		var self = this;
		//wfileinput is a hidden input type='file' multiple webkitdirectory defined in index.html
		var form = document.getElementById(this.props.winput);
		console.log('hi')
		form.onchange = function(){
			if(form.files[0]){
				console.log(form.files[0].path)	
				self.setState({pathSet:true, path:form.files[0].path, name:form.files[0].name})
				self.passVal(form.files[0].path);
			}

			
		}
		form.click();

		//console.log(form)

	},
	passVal: function(p){
		//clear onchange handler so we can reuse this form
		//천잰가... ㅋㅋ
		console.log(p)
		document.getElementById(this.props.winput).onchange = null;
		document.getElementById(this.props.winput).value = ""
		this.props.passVal(p);
	
		
		
	},
	render: function(){
		var label = ""
		if((this.state.pathSet) && (this.state.showPath)){
			label = <label>{this.state.name}</label>
		}

		return(<div className='hackWebkitDirectory'>
			<button onClick={this.click}>Browse</button>
			{label}
			</div>);
	}
})

ReactDom.render(<Container/>,document.getElementById('content'));