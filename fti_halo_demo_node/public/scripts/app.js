var socket = io();


var halomenu = [{className:"link", title:"Ferrous Test", code:'fe'},{className:"link", title:"Non-Ferrous Test", code:'nfe'},
{className:"link", title:"Stainless-Steel Test", code:'ss'}];
var manual = [{className:"link activenav", title:"Manual Test", code:"m"}];

var Header = React.createClass({
	render:function(){
		return(
		<div className="header">
		<div className="fortresslogo">
			<img src={"img/NewFortressTechnologyLogo-BLK-trans.png"} style={{height:60}} />
		</div>
	<div className="halologo">
		<img src={"img/Halo.png"} style={{height:50}} />
	</div>
	</div>
		)
	}
})
var MainContent = React.createClass({
	getInitialState: function(){
		return{halomenu:halomenu, manualmenu:manual}
	},
	componentDidMount: function(){

	},
	setHighlight: function(m){
		if(m == 1){
			var h = [{className:"link activenav", title:"Ferrous Test", code:'fe'},{className:"link", title:"Non-Ferrous Test", code:'nfe'},
			{className:"link", title:"Stainless-Steel Test", code:'ss'}];
			this.setState({halomenu:h})
		}else if(m == 2){
			var h =[{className:"link", title:"Ferrous Test", code:'fe'},{className:"link activenav", title:"Non-Ferrous Test", code:'nfe'},
			{className:"link", title:"Stainless-Steel Test", code:'ss'}];
			this.setState({halomenu:h})
		}else if(m == 3){
			var h =[{className:"link", title:"Ferrous Test", code:'fe'},{className:"link", title:"Non-Ferrous Test", code:'nfe'},
			{className:"link activenav", title:"Stainless-Steel Test", code:'ss'}];
			this.setState({halomenu:h})
		}
	},
	render: function(){
		return(	
		<div className="maincontent">
		<ScopeContainer plotName="halo" menuitems={this.state.halomenu} menuId="halomenu" plotDivId="fti_plot" setHighlight={this.setHighlight}>
		
		</ScopeContainer>
		<ScopeContainer plotName="manual" menuitems={this.state.manualmenu} menuId="menu" plotDivId="fti_plot_man" setHighlight={this.setHighlight}>
		</ScopeContainer>
		</div>
		)
	}
});
var ScopeContainer = React.createClass({
	getInitialState: function(){
		return({data:[], layout:{
  "showlegend": true,
  "xaxis": {
    "showgrid": true,
    "showline": false,
    "zeroline": false
  },
  "yaxis": {
    "showgrid": true,
    "showline": false,
    "zeroline": false},
  "legend": {},
  "margin": {}},
  hastrace:false
})
	},
	componentDidMount: function(){
		var self = this;
		var dif = document.getElementById(this.props.plotDivId);
		Plotly.plot(dif, this.state.data, this.state.layout);
		socket.on(this.props.plotName, function(data){
			
			var divid = document.getElementById(self.props.plotDivId);
			if(divid.data.length==2){Plotly.deleteTraces(divid, [-2,-1])}
			Plotly.plot(divid, data[0], self.state.layout);
			
			Plotly.redraw(divid);
			self.setState({data:data[0], hastrace:true})
			self.props.setHighlight(data[1])
			
		
		})

	},
	render: function(){
		return(
		<div className="container">
		<Menu menuId={this.props.menuId} menuitems={this.props.menuitems}/>
		<div id={this.props.plotDivId} className="js-plotly-plot"/>
		</div>);
	}
});
var Menu = React.createClass({
	handleClick: function(){
		alert(this.props.menuitems.title)
	},
	render: function(){
		var self = this;
		var items = this.props.menuitems.map(function(m){
			return(<MenuItem item={m}/>)
		})
		return(<ul id={this.props.menuId}>{items}</ul>)
	}
});
var MenuItem = React.createClass({
	handleClick: function(){
		socket.emit(this.props.item.code,'hi');
		//alert(this.props.item.title);
	},
	render: function(){
		return(<li><a onClick={this.handleClick} className={this.props.item.className}>{this.props.item.title}</a></li>)
	}
})
var PlotlyDiv = React.createClass({
	render: function(){
		return(<div id={this.props.plotId}></div>)
	}
})

React.render(
	<div>
	<Header/>
	<MainContent/>
	</div>,
	document.getElementById('content')

);
