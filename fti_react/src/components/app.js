//=======================================================================
//HOW TO USE APP:
//	node server.js
//	access localhost:4000
//=======================================================================
'use strict'
// import {Component, PropTypes} from 'react';

import React from 'react';
// import FtiHelper from './fti-classes.js';
// import {FtiHelper} from 'fti-classes.js';
import { Router, browserHistory } from 'react-router';
import FtiHelper from '../server';

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

var Scan = React.createClass({
	getInitialState: function(e){
		return this.state;
	},

	onSetDsp: function(dspip){
	    console.log(dspip)
	    var arm = new Fti.ArmRpc.ArmRpc(dspip);
	    var self = this;
	    var cb = function(e){
	     if(e == 1){
	        self.setState({isSet:false, arm:null, dsp:null})  
	      }

	    }
	    arm.setCallBack(cb)
	    var dsp = FtiRpc.udp(dspip);
	    console.log("now echo")
	    arm.echo_cb(function(){
	      console.log("echoed")
	      arm.dsp_open_cb(function(){
	        console.log("dsp_opened")
	        self.bindSo(dspip)
	        setTimeout(function(){
	           self.bindNP(dspip)
	         },2000);
	       
	      })
    });
    this.setState({dspip:dspip, isSet:true, arm:arm, dsp:dsp, dspfound:true})
  },

	render:function(){
		return(
		<div className="scan">
			 <DetectorList onSelectDsp={this.onSetDsp}></DetectorList>
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

var DetectorList = React.createClass({
  getInitialState: function(){
    return {busy:false, list:[]}
  },
  doLocate: function(){
    var Locator = new FtiHelper();
    var dspip;
    var dspips = [];
    var self = this;
    this.setState({busy:true})
    Locator.scan_for_dsp_board(function(e){
      if(e.length == 0){
        self.setState({busy:false, list:[]});
      }
      for(var i = 0; i < e.length; i++){
    if(e[i].board_type==1){
      var ip = e[i].ip.split('.').map(function(e){return parseInt(e)});
      var nifip = e[i].nif_ip.split('.').map(function(e){return parseInt(e)});
      console.log(ip)
  if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
    //dsp not visible
    console.log('dsp not visible')
  
     var aStr = "To communicate with the detector, change the interface ip to be on the same network as the detector ("+ip.join('.')+").\n Current interface ip is " + e[i].nif_ip 
      + "\nSuggested ip is " + ip.slice(0,3).join('.') + ".1\n\nAttempt to relocate after changing the ip.";
      alert(aStr);
    }else{
      console.log('dsp visible')
      dspip = ip.join('.');
      console.log(dspip);
      dspips.push(dspip);
       self.setState({busy:false, list:dspips})
      }
      
       }

    }
   
    })
  },

  render: function(){
    //listview? radioboxes? 
    return (<div className="detectorList">
        <button onClick={this.doLocate}>Locate</button>
        <DropDownCont onChange={this.props.onSelectDsp} data={this.state.list} busy={this.state.busy}/>
        <ManualSelect connect={this.props.onSelectDsp}/>
      </div>)
  }
})

var DropDownCont = React.createClass({

  onSelect:function(e){
    e.preventDefault();
    if(e.target.value != 'none'){
      this.props.onChange(e.target.value)
  
    }
  },
  render: function(){
    var options = this.props.data.map(function(o){
      return (<option value={o}>{o}</option>)
    });

    return (<select onChange={this.onSelect}>
            <option value="none">Select DSP</option>
            {options}
          </select>)
  }
})

var ManualSelect = React.createClass({
  getInitialState: function(){
    return {value:""}
  },
  onChange: function(e){
    e.preventDefault();
    this.setState({value:e.target.value})
  },
  connect:function(){
    this.props.connect(this.state.value.trim())
  },
  render: function(){
   return( <div className="manSel">
      <input type="text" onChange={this.onChange} value={this.state.value}/><button onClick={this.connect}>Connect</button>
    </div>)
  }
})

React.render(
	<div>
	<Header/>
	<Scan/>
	{/* <InterceptorContent/>*/}
	<MainContent/>
	</div>,
	document.getElementById('content')

);
