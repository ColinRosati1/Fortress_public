'use strict';
var React = require('react');
var ReactDom = require('react-dom');
var Fti = require('./fti-flash-node');
var arloc = Fti.ArmFind;
var ArmConfig = Fti.ArmConfig;
//var ipc = require('ipc')
const {ipcRenderer} = require('electron');
var dgram = require('dgram');
var FtiRpc = Fti.Rpc.FtiRpc;
var fs = require('fs');


var PKT_TYPES = {
  'PKT_TYPE_PHASE':1,
  'PKT_TYPE_PATTERN':2,
  'PKT_TYPE_EXIT':16,
  'PKT_TYPE_SEC_READ':17,
  'PKT_TYPE_SEC_WRITE':18,
  'PKT_TYPE_NET_EVENT':19,
  'PKT_TYPE_REJ_PHASE':20
};

const RPC_VERSION       = 0;
const RPC_READ          = 1;
const RPC_ECHO          = 2;
const RPC_WRITE         = 3;
const RPC_KERNEL        = 4;
const RPC_SCOPE_TRIGGER = 5;
const RPC_SCOPE_SIGNALS = 6;

const KERN_API_RPC = 19;
const KAPI_RPC_TEST = 32;

const DSP_SCOPE_PORT = 10004

const HALO_TEST_DELAY = 1;

const KAPI_IBTEST_PASSES_FE_READ = 210
const KAPI_IBTEST_PASSES_NFE_READ = 214
const KAPI_IBTEST_PASSES_SS_READ = 218  

const KAPI_IBTEST_PASSES_FE_WRITE = 90//212
const KAPI_IBTEST_PASSES_NFE_WRITE = 94
const KAPI_IBTEST_PASSES_SS_WRITE = 98 

function dsp_rpc_paylod_for (n_func, i16_args, byte_data) {
        var rpc = [];
        var n_args = i16_args.length;
        var bytes = [];
        if (n_args > 3) n_args = 3;
        if (typeof byte_data == "string") {
          for(var i=0; i<byte_data.length; i++) {
              bytes.push(byte_data.charCodeAt(i));
          }         
        } else if (byte_data instanceof Array) {
          bytes = byte_data;
         }
        rpc[0] = n_func;
        rpc[1] = n_args;
        if (bytes.length > 0) rpc[1] += 4;
        var j=2;
        for(var i=0; i<n_args; i++) {
          rpc[j] = i16_args[i] & 0xff; j+= 1;
          rpc[j] = (i16_args[i] >> 8) & 0xff; j+= 1;
        }
        if (bytes.length > 0) rpc = rpc.concat(bytes);
        
        var cs = fletcherCheckBytes(rpc);
        var cs1=255-((cs[0]+cs[1])%255); 
        var cs2=255-((cs[0]+cs1)%255);
        rpc.push(cs1);
        rpc.push(cs2);
        var buf = new Uint8Array(rpc);
        console.log(buf)
        return Buffer.from(buf)
    }
function fletcherCheckBytes (data) {
        var c1=0, c2=0;
        for(var i=0; i<data.length; i++) {
          c1 += data[i]; if (c1 >=255) c1 -= 255;
          c2 += c1;      if (c2 >=255) c2 -= 255;
        }
        return [c1,c2];
      }


class Signals{
  constructor(){
    var labels = ['Index', 'Eye', 'R', 'X', 'Detection']
  }
}


/***************************************************************************************************************/
/* Locator Functions                                                                                           */
/***************************************************************************************************************/
class FtiHelper{
  constructor(ip){


  }

  get_interface_ip(mac){
    var host_mac = mac.split(/[-]|[:]/).map(function(e){
      return parseInt("0x"+e);
    }) 
  }
  change_dsp_ip(callBack){
    var self = this;
    this.scan_for_dsp_board(function(e){
      console.log(e)
      callBack(e);
      self.send_ip_change(e)
    })
  }
  scan_for_dsp_board(callBack){

    arloc.ArmLocator.scan(1500, function(e){
      console.log(e)
      callBack(e)
    })
  }
  send_ip_change(e){
    var ds;
    console.log(e)
    e.forEach(function(board){
      console.log(board)
      if(board.board_type == 1){
        ds = board
      }
    })
    var nifip = ds.nif_ip
    var ip = nifip.split('.').map(function(e){return parseInt(e)});
    var n = ip[3] + 1;
    if(n==0||n==255){
      n = 50
    }
    var new_ip = [ip[0],ip[1],ip[2],n].join('.');
    var querystring = "mac:" + ds.mac+ ", mode:static, ip:" + new_ip + ", nm:255.255.255.0"
    console.log(querystring)
    ArmConfig.parse(querystring);

  }
}


/***************************************************************************************************************/
/* Main Content                                                                                                */
/***************************************************************************************************************/
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
var TestConfig = React.createClass({
  getInitialState:function () {
    // body...
    return({TestMode:'select mode', mode:0, met:0})
  },
  componentDidMount:function () {
    // body...

  },
  initTestState: function (m, callBack) {
   
    // body...
    var self = this;

    var dsp = this.props.dsp;
   dsp.rpc2(dsp_rpc_paylod_for(19,[608,0,0], [m]),function() {
    //operator
      dsp.rpc2(dsp_rpc_paylod_for(19,[572,0,0], [m]), function () {
        //ack
        dsp.rpc2(dsp_rpc_paylod_for(19,[576,1,0],[m,0]),function () {
          // body...
          dsp.rpc2(dsp_rpc_paylod_for(19,[576,0,0],[m,1]),function(){
            dsp.rpc2(dsp_rpc_paylod_for(19,[576,0,0],[m,2]),function(){
              dsp.rpc2(dsp_rpc_paylod_for(19,[584,self.state.met,0],[m,0]), function () {
                // body...
                callBack();
              })
              
            })
          })
        })
       
        // body...
      })
      // body...
    })
  },
  setTestMode:function (mo) {
    // body...
    var modes = ['Prompt', 'Manual','Halo','Manual 2', 'Halo 2']
    var self = this;
    var dsp = this.props.dsp;
    dsp.rpc2(dsp_rpc_paylod_for(19,[624,mo,0],""),function(e,rinfo) {
      // body...
      //console.log(e)
     // dsp.rpc2(dsp_rpc_paylod_for(19,))
      self.initTestState(mo - 1, function () {
        // body...
        self.props.setMode(mo - 1)
        self.setState({TestMode:modes[mo]})
      })
    })
  }, 
  onSelectMode:function (e) {
    // body...
    this.setState({mode:e.target.value})
    if(e.target.value != 0){
      this.setTestMode(e.target.value);
    }
  },
  onMetChange:function (e) {
    // body...
    var self = this;
    if(this.state.mode != 0){
      var dsp = this.props.dsp
      dsp.rpc2(dsp_rpc_paylod_for(19,[584,e.target.value,0],[this.state.mode - 1,0]), function () {
        // body...

      })

    }
    this.setState({met:e.target.value})
  },
  render: function () {
    // body...
     var modes = ['Prompt', 'Manual','Halo','Manual 2', 'Halo 2']
     var metals = ['Ferrous','Non-Ferrous','Stainless']
     var self = this;
    var opts = modes.map(function (m,i) {
      // body...
      if(self.state.mode == i){
        return <option value={i} selected>{m}</option>
      }else{
        return <option value={i}>{m}</option>
      }
    })
    var selectMetal  = ""
    if(this.state.mode != 0){
      var metOpts = metals.map(function(me,i){
        if(self.state.met == i){
          return <option value={i} selected>{me}</option>
        }else{
           return <option value={i}>{me}</option>
        }
      })
      selectMetal = (<select onChange={this.onMetChange}>
          {metOpts}
        </select>)
    }
    return(<div>
      <div>
      <label style={{width:200,display:'inline-block'}}>Test Mode:{this.state.TestMode}</label>
      <select onChange={this.onSelectMode}>
      {opts}
      </select>
      </div><div>
      <label style={{width:200,display:'inline-block'}}>Metal Type:{metals[this.state.met]}</label>
      {selectMetal}
      </div>
    </div>)
  }

})
var Content = React.createClass({
  getInitialState: function(){
    var ph = function(e){
    	console.log(e)
    }
    return {dspip:"", isSet:false, arm:null, dsp:null, so:null, bound:false, dspfound:false, packetHandler:ph, mode:0}
  },
  onSetDsp: function(dspip){
    console.log(dspip)
    var arm = new Fti.ArmRpc.ArmRpc(dspip);
    var self = this;
    var cb = function(e){
     if(e == 1){
        self.setState({isSet:false, arm:null, dsp:null})  
      }
      
      //  console.log(e)
      //}
    }
    arm.setCallBack(cb)
    var dsp = FtiRpc.udp(dspip);
    console.log("now echo")
    arm.echo_cb(function(){
      console.log("echoed")
    	arm.dsp_open_cb(function(){
        console.log("dsp_opened")
    		self.bindSo(dspip)
    	})
    });
    this.setState({dspip:dspip, isSet:true, arm:arm, dsp:dsp, dspfound:true})
  },
  setPH: function(f){
    //console.log(f)
  	this.setState({packetHandler:f});
  },
  bindSo: function(ip){
  	if(this.state.bound){
      return;
    }
    var self = this;
    var so = dgram.createSocket({'type':'udp4'})
    so.bind(DSP_SCOPE_PORT,'0.0.0.0', function(){
      console.log('bound')
      so.on('message', function(e,rinfo){
          console.log(e)
         // console.log(self.state.packetHandler(e))
          self.state.packetHandler(e)
          
         
    })
    });
    
    this.setState({so:so, bound:true})
  },
  setHaloParams: function(f,n,s, callBack){
    console.log(f)
    var dsp = this.state.dsp;

    dsp.rpc1(KERN_API_RPC, [KAPI_IBTEST_PASSES_SS_WRITE, s], "",1.0, function(){
        console.log('SS set');
        //setTimeout()
        //98%32 = 2

        dsp.rpc1(KERN_API_RPC, [KAPI_IBTEST_PASSES_FE_WRITE, f], "",1.0, function(){
          console.log("FE set")
          //160315 bug - dsp thinks this is [90,90] instead of [90,f] so I get 90%32 = 26
          dsp.rpc1(KERN_API_RPC, [KAPI_IBTEST_PASSES_NFE_WRITE, n], "",1.0, function(){
            //94%32 = 30
            console.log("NFE set")
            if(callBack){
              callBack();
        
            }
          })
        })  
      });

  },
  haloTest: function(t){
    console.log(t)
    var dsp = this.state.dsp;
    var self = this;
    if(t == 0){
     dsp.rpc0(6,[3*231,5,1]);
     
    }else {
      dsp.rpc0(6,[3*231,5,1]);
      setTimeout(function(){
       dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST, self.state.mode,0])
      }, HALO_TEST_DELAY*1000)
    }
  },
  triggerTest: function () {
    // body...
    var dsp = this.state.dsp;
    dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST, this.state.mode,0])
  },
  photoEye: function(){
    var dsp = this.state.dsp;
    dsp.rpc0(5,[0,1,1])
  },
  reconnect: function(){
    this.onSetDsp(this.state.dspip)
  },
  readFSS: function(){
    ipcRenderer.send('readfss');
    console.log('readfss');
  },
  setMode: function (m) {
    // body...
    this.setState({mode:m})
  },
  render: function(){
    var active =(<div>
        <span>Not Connected</span>
        </div>)
    var reconnect = ""
    if(this.state.isSet == true){
      active = (<div>
        <span>Connected</span>
        </div>)
      }else if(this.state.dspfound == true){
        active =(<div>
        <span>Not Connected</span>
        <button onClick={this.reconnect}>Reconnect</button>
        </div>)
    }
    var testConfig = ""
    if(this.state.isSet){
      testConfig = <TestConfig setMode={this.setMode} dsp={this.state.dsp}/>
    }
    return (<div>
         <DetectorList onSelectDsp={this.onSetDsp}/>
         {active}
         <button hidden onClick={this.readFSS}>Open Fss File</button>
         {testConfig}
        <ScopeContainer haloTest={this.haloTest} dsp={this.state.dsp} setPH={this.setPH}
         isSet={this.state.isSet} plotName="ScopePlot" halo={1} plotDivId="fti_plot" triggerTest={this.triggerTest}/>
        <ScopeContainer haloTest={this.haloTest} dsp={this.state.dsp} setPH={this.setPH}
         isSet={this.state.isSet} plotName="ScopePlot" halo={0} plotDivId="fti_plot_man" triggerTest={this.triggerTest}/>
      </div>)
  }
})


var Header = React.createClass({
  getInitialState: function(){
    return ({ipc:0})
  },
  sendIPC: function(){
    ipcRenderer.send('toggle', this.state.ipc)
    if(this.state.ipc == 0){
      this.setState({ipc:1})
    }else{
      this.setState({ipc:0})
    }
  },
	render: function(){
		return (<div className="header">
		<div className="fortresslogo">
			<img src={"assets/img/NewFortressTechnologyLogo-BLK-trans.png"} style={{height:60}} />
		</div>
	<div className="halologo">
		<img src={"assets/img/Halo.png"} style={{height:50}} onClick={this.sendIPC} />
	</div>
	</div>)
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
    /*Locator.change_dsp_ip(function(){
      
      var n_ip = nifip;
      var n = n_ip[3] + 1;
      if(n==0||n==255){

      n = 50
      }
        dspip = [n_ip[0],n_ip[1],n_ip[2],n].join('.');
        dspips.push(dspip);
        self.setState({busy:false, list:dspips})
      });*/
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
      
     // create list with this list of ips
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

var ScopeContainer = React.createClass({
  getInitialState: function(){
    //var arm = null;
    //var dsp = null;
    

  
   // arm.echo_cb(function(){arm.dsp_open()}, arm)
    return({data:[], layout:{"showlegend": true,
  "xaxis": {"showgrid": true,"showline": false,"zeroline": false},
  "yaxis": {"showgrid": true,"showline": false,"zeroline": false},"legend": {},"margin": {}},
  hastrace:false, dsp:this.props.dsp, init:false,  ra:[],xa:[], chans:[],sigs:[], labels:[], mode:1, halo:0, peak:1
})
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
  haloTest: function(){
    this.setState({ind:693})
    this.props.setPH(this.process_sig_packet);
    this.clearData();
    this.props.haloTest(this.state.halo);

  },
  reqScope: function(s,m,t){
    var dsp = this.state.dsp;

  
    if(t == 1){
    	this.props.setPH(this.process_sig_packet);
       this.setState({packetHandler:this.process_sig_packet})
    }
    console.log(s)
    dsp.rpc1(6,[0,0,0],"",1.0,function(e,rinfo){
      dsp.rpc1(5,[0,0,0],"",1.0, function(e,rinfo){
          console.log(m)
          if(t==1){
            dsp.rpc0(6,s)  
      	  }
      })
    })
   // this.setState({reqMode:m, triggerOn:true, ra:[],xa:[], sigs:[]})
    
  },
  
  sendRpc: function(type, args){
    var dsp = this.state.dsp;
    dsp.rpc1(type,args,"",1.0, function(e,rinfo){
      console.log(e)
    })
  },
  process_sig_packet: function(pkt){
    var ind = this.state.ind
    ind--;
    console.log(ind)
   //console.log(pkt.readUInt16LE(0))
    var idx = pkt.readInt16LE(0)//pkt.readInt16LE(0);
    var r = pkt.readInt16LE(2);
    var x = pkt.readInt16LE(4);
    var ra = this.state.ra;
    var xa = this.state.xa;
    ra.push(r);
    xa.push(x);

    this.setState({ra:ra, xa:xa, ind:ind})
    if(idx==1){
       var dat = [[{"y":ra.slice(0),"type":"scatter","mode":"lines","connectgaps":true,"name":"R Channel"},
                      {"y":xa.slice(0),"type":"scatter","mode":"lines","connectgaps":true,"name":"X Channel"}], 0]
      this.plotCallBack(dat)
    }
   // console.log(idx)
  },
   process_phase_packet: function(pkt){
    var mode = pkt.readUInt8(0);
    var flags = pkt.readUInt8(1);
    var idx = pkt.readInt16LE(2);
     var chans = [];
     var peak = this.state.peak;
    for(var i = 4; i<pkt.byteLength; i+=2){
      var val = pkt.readInt16LE(i)
      if(Math.abs(val)>peak){
        peak = Math.abs(val)
      }
      chans.push(val);
    }
    var eye = ((flags & 0x80) == 0 ) ? 0 : 1;
    var cnt = (flags & 0x7f);
       console.log(cnt)
    
    chans.unshift(eye);
   
    if(cnt == 0){
      console.log('how do I get here')
      return this.on_sig_ready()
    }
    var sigs = this.state.sigs
    var sl = sigs.length
    for(var s = 0; s<(chans.length - sl); s++){
      sigs.unshift([]);
    }
    for(var c = 0; c<chans.length;c++){
      console.log(chans[c])
      //this.state.channels[this.state.labels[c]].push(chans[c])
      sigs[c].push(chans[c])
    }
    if(idx<0){
     var dsp = this.state.dsp
     dsp.trigger_fss(0);
     this.on_sig_ready();
    }
    this.setState({sigs:sigs, peak:peak})

  },
     process_phase_packet_int: function(pkt){
    var mode = pkt.readUInt8(0);
    var flags = pkt.readUInt8(1);
    var idx = pkt.readInt16LE(2);
     var chans = [];
     var peak = this.state.peak;
    for(var i = 4; i<pkt.byteLength; i+=2){
      var val = pkt.readInt16LE(i)
      if(Math.abs(val)>peak){
        peak = Math.abs(val)
      }
      chans.push(val);
    }
    var eye = ((flags & 0x80) == 0 ) ? 0 : 1;
    var cnt = (flags & 0x7f);
       console.log(cnt)
    
    chans.unshift(eye);
   
    if(cnt == 0){
      console.log('how do I get here')
      return this.on_sig_ready_int()
    }
    var sigs = this.state.sigs
    var sl = sigs.length
    for(var s = 0; s<(chans.length - sl); s++){
      sigs.unshift([]);
    }
    for(var c = 0; c<chans.length;c++){
      console.log(chans[c])
      //this.state.channels[this.state.labels[c]].push(chans[c])
      sigs[c].push(chans[c])
    }
    if(idx<0){
     var dsp = this.state.dsp
     dsp.trigger_fss(0);
     this.on_sig_ready_int();
    }
    this.setState({sigs:sigs, peak:peak})

  },
  haloChanged: function(e){
    //e.preventDefault();
    this.setState({halo:e.target.value})
  },
  photoEye: function(){
    var dsp = this.props.dsp
    this.props.setPH(this.process_phase_packet)
    dsp.rpc1(6,[0,0,0],"",1.0,function(e,rinfo){
      dsp.rpc1(5,[0,0,0],"",1.0, function(e,rinfo){
     
    dsp.rpc0(5,[0,1,1])
    })});
  },
  photoEyeInt: function(){
var dsp = this.props.dsp
    this.props.setPH(this.process_phase_packet_int)
    dsp.rpc1(6,[0,0,0],"",1.0,function(e,rinfo){
      dsp.rpc1(5,[0,0,0],"",1.0, function(e,rinfo){
     
    dsp.rpc0(5,[0,1,0x8001])
    })});

  },
  on_sig_ready: function(){
    console.log('onsigREADY')
    this.extract_sigs();
  },
  on_sig_ready_int: function(){
    console.log('onsigREADY')
    this.extract_sigs_int();
  },
  extract_sigs: function(){
    var sigs = this.state.sigs;
    
    var names = ['Eye', 'R', 'X', 'Detection', 'Product Count']

   // var eye = sigs[0];
    //var rch = sigs[1];
    //var xch = sigs[2];
    //var dch = sigs[3];
    var peak = this.state.peak;
    var out = sigs.map(function(s,i){
      if(i==0){
        var eyeArray = s.map(function(e){
          return e*peak
        })
        return {"y":eyeArray,"type":"scatter","mode":"lines","connectgaps":true,"name":names[i]}

      }else if(i<5){
      return {"y":s.slice(0),"type":"scatter","mode":"lines","connectgaps":true,"name":names[i]}

      }else{
      return {"y":s.slice(0),"type":"scatter","mode":"lines","connectgaps":true,"name":i.toString()}

      }
    });
    var dat = [out,0]
    this.clearTriggers(function(){console.log('cleared triggers')}); 
    this.plotCallBack(dat)
    //this.setState({sigs:[]})
  },
  extract_sigs_int: function(){
    var sigs = this.state.sigs;
    
    var names = ['Eye', 'R - A', 'X - A', 'Detection - A', 'Product Count - A', 'R - B', 'X - B', 'Detection - B', 'Product Count - B' ]

   // var eye = sigs[0];
    //var rch = sigs[1];
    //var xch = sigs[2];
    //var dch = sigs[3];
    var peak = this.state.peak;
    var out = sigs.map(function(s,i){
      if(i==0){
        var eyeArray = s.map(function(e){
          return e*peak
        })
        return {"y":eyeArray,"type":"scatter","mode":"lines","connectgaps":true,"name":names[i]}

      }else if(i<9){
      return {"y":s.slice(0),"type":"scatter","mode":"lines","connectgaps":true,"name":names[i]}

      }else{
      return {"y":s.slice(0),"type":"scatter","mode":"lines","connectgaps":true,"name":i.toString()}

      }
    });
    var dat = [out,0]
    this.clearTriggers(function(){console.log('cleared triggers')}); 
    this.plotCallBack(dat)
    //this.setState({sigs:[]})
  },
  clearTriggers: function(callBack){
    var dsp = this.props.dsp
   dsp.rpc1(6,[0,0,0],"",1.0,function(e,rinfo){
      dsp.rpc1(5,[0,0,0],"",1.0, function(e,rinfo){
      if(callBack){callBack(); }
   // dsp.rpc0(5,[0,1,1])
    })});
  },
  saveToFss: function(){
    var names = ['Eye','R','X','Detection','Product Count']
    console.log(this.state.sigs)
    var chans = {};
    for(var i=0;i<this.state.sigs.length;i++){
      chans[names[i]] = this.state.sigs[i].slice(0);
    }
    var fssout = {}
    fssout['Channels'] = chans
    console.log(fssout)
    ipcRenderer.send('fss', fssout)
  },
  clearData: function(){
  var dif = document.getElementById(this.props.plotDivId);
  Plotly.newPlot(dif, [], this.state.layout);
  this.setState({data:[], ra:[],xa:[], chans:[],sigs:[],peak:1})
  },
  triggerTest: function (argument) {
    // body...
    this.props.triggerTest();
  },
  render: function(){
    var opts = ['Manual','Halo']
    var self = this;
    var _opts = opts.map(function (o,i) {
      // body...
      if(i == self.state.halo){
        return <option value={i} selected>{o}</option>
      }else{
        return <option value={i}>{o}</option>
      
      }
    })
    var sel = (<select onChange={this.haloChanged}>
             {_opts}
            </select>)
    var halo = (<div>

            {sel}
            <button onClick={this.haloTest}>Request Scope</button>
            <button onClick={this.photoEye}>Trigger Photoeye</button>
            <button onClick={this.triggerTest}>Send Test Signal</button>
            <button hidden onClick={this.photoEyeInt}>Trigger Photoeye 2</button>
            <button onClick={this.clearData}>Clear Data</button>
            <button hidden onClick={this.saveToFss}>Save as FSS</button>
            </div>)
    
    return(
    <div className="container">
    {halo}
     <div id={this.props.plotDivId} className="js-plotly-plot"/>
    
    </div>);
  }
});

ReactDom.render(<div><Header/><Content/></div>, document.getElementById('content'));
