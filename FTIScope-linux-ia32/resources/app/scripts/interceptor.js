'use strict';
var React = require('react');
var ReactDom = require('react-dom');
var Fti = require('./fti-flash-node');
var arloc = Fti.ArmFind;
var ArmConfig = Fti.ArmConfig;
const {ipcRenderer} = require('electron');
var moment = require('moment');
//var ipcRenderer = require('ipc');
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

var InterceptorContent = React.createClass({
  getInitialState: function(){
    var ph = function(e){
      console.log(e)
    }
    return {dspip:"", isSet:false, arm:null, dsp:null, so:null, bound:false, dspfound:false, packetHandler:ph,
    prefs:{"CustomerName":"Customer1","ProductDescription":"PRODUCT1","Notes":""},ispathSet:false, testFlag:false}
  }, onSetDsp: function(dspip){
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
  savePrefs: function(prefs){
    console.log(prefs)
    this.setState({prefs:prefs})
  },
  haloTest: function(t){
    console.log(t)
    var dsp = this.state.dsp;
    if(t == 0){
     dsp.rpc0(6,[3*231,5,1]);
    }else if(t == 1){
      this.setHaloParams(1,0,0, function(){
         dsp.rpc0(6,[3*231,3,1]);
          setTimeout(function(){
            dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST, 1]);
            console.log('testing')
          }, HALO_TEST_DELAY*1000)

      })
    }else if(t == 2){
       this.setHaloParams(0,1,0, function(){
         dsp.rpc0(6,[3*231,3,1]);
          setTimeout(function(){
            dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST, 1])
          }, HALO_TEST_DELAY*1000)
      })
    }else if(t == 3){
       this.setHaloParams(0,0,1, function(){
         dsp.rpc0(6,[3*231,3,1]);
          setTimeout(function(){
            dsp.rpc0(KERN_API_RPC, [KAPI_RPC_TEST, 1])
          }, HALO_TEST_DELAY*1000)
      })
    }
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
  pathSet: function(isSet){
    this.setState({ispathSet:isSet})
  },
  saveFssOut:function(data){
    if(this.state.ispathSet){

    console.log(data)
    var prefs = this.state.prefs;
    var channels = data;
    var fss ={}
    fss["CustomerName"] = prefs["CustomerName"];
    fss["ProductDescription"] = prefs["ProductDescription"];
    fss["Notes"] = prefs["Notes"]
    fss["TimeStamp"] = new Date(Date.now()).toString();
    fss["Channels"] = channels;//{"R":channels[0],"X":channels[1],"Detection":channels[2],"Product Count":channels[3],"Eye":channels[4]}
    if(this.state.testFlag){
      fss["Test"] = true
    }

    console.log(JSON.stringify(fss))
    var ts = moment().format('YYYYMMDDhmmss');
    var dir = this.state.prefs["Path"]+'\\'+prefs['CustomerName']+'\\';//+prefs["ProductDescription"]+'/';
    if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    }
    dir = dir + prefs["ProductDescription"] + '\\'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    fs.writeFile(dir+ts+'res.fss', JSON.stringify(fss),(err) => {
      if (err) throw err;
        console.log('The file has been saved!');})
      this.setState({testFlag:false})
  }else{
    alert('Path needs to be set to save plots!')
  }

  },
  setFlag: function(){
    this.setState({testFlag:true})
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
     return (<div>
         <DetectorList onSelectDsp={this.onSetDsp}/>
         {active}
         <button onClick={this.readFSS}>Open Fss File</button>
        <IScope setFlag={this.setFlag} haloTest={this.haloTest} dsp={this.state.dsp} setPH={this.setPH}
         isSet={this.state.isSet} plotName="ScopePlot" halo={1} plotDivId="fti_plot" saveFss={this.saveFssOut}/>
        <PreferenceInterface pathSet={this.pathSet} saveChanges={this.savePrefs} prefs={this.state.prefs}/>
      </div>)
  }
})
var FssContainer = React.createClass({
  render: function(){
    return (<div></div>)
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
		<div className="halologo">
			<img src={"assets/img/NewFortressTechnologyLogo-BLK-trans.png"} style={{height:60}} onClick={this.sendIPC}  />
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
var IScope = React.createClass({
  getInitialState: function(){
     return({data:[], layout:{"showlegend": true,
  "xaxis": {"showgrid": true,"showline": false,"zeroline": false},
  "yaxis": {"showgrid": true,"showline": false,"zeroline": false},"legend": {},"margin": {}},
  hastrace:false, dsp:this.props.dsp, init:false,  ra:[],xa:[], chans:[],sigs:[], labels:[], mode:1, halo:0, peak:1, continuous:true, autoSave:false, packs:0, testFlag:false
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
    Plotly.newPlot(divid, data[0], this.state.layout);
      /*if((divid.data.length!=0)||(divid.data.length != data[0].length)){ Plotly.newPlot(divid, data[0], this.state.layout);}else{
         Plotly.plot(divid, data[0], this.state.layout);
      }*/
     
      
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
    if(!this.state.continuous){
      this.clearTriggers(function(){console.log('cleared triggers')}); 
      
    }
    this.plotCallBack(dat)
    this.saveAndClear(names)
    //this.setState({sigs:[]})
  },
  extract_sigs_int: function(){
    var sigs = this.state.sigs;
    
    var names = ['Eye', 'R - A', 'X - A', 'Detection - A', 'Product Count - A', 'R - B', 'X - B', 'Detection - B', 'Product Count - B' ]

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
   if(!this.state.continuous){

      this.clearTriggers(function(){console.log('cleared triggers')}); 
      
    }    
    this.plotCallBack(dat)
    this.saveAndClear(names)
  },
  clearTriggers: function(callBack){
    var dsp = this.props.dsp
   dsp.rpc1(6,[0,0,0],"",1.0,function(e,rinfo){
      dsp.rpc1(5,[0,0,0],"",1.0, function(e,rinfo){
      if(callBack){callBack(); }
   // dsp.rpc0(5,[0,1,1])
    })});
  },
  saveAndClear:function(n) {
    // body...
    var names = n
    console.log(this.state.sigs)
    var chans = {};
    for(var i=0;i<this.state.sigs.length;i++){
      chans[names[i]] = this.state.sigs[i].slice(0);
    }
   
    if(this.state.autoSave){
      this.props.saveFss(chans);
      
    }
    this.setState({sigs:[], packs:(this.state.packs+1), testFlag:false})
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
  contChange: function(e){
  //  e.preventDefault();
     this.setState({continuous:!this.state.continuous})
  
  },
  autoSaveChange: function(){
    this.setState({autoSave:!this.state.autoSave})
  },
  resetPacks: function(){
    this.setState({packs:0})
  },
  readFss:function(e){
   
    if(e.target.files[0]){
       console.log(e.target.files[0].path)
       var self = this;
       fs.readFile(e.target.files[0].path, (err,f)=>{
          var fi = JSON.parse(f)       
          console.log(JSON.parse(f))
          var plotSigs = [];
          console.log(fi.Channels)
          for(var s in fi.Channels){
            console.log(s)
            console.log(fi.Channels[s])
            plotSigs.push({"y":fi.Channels[s],"type":"scatter","mode":"lines","connectgaps":true,"name":s}) 
          }
          self.plotCallBack([plotSigs,0])
       })
    }
  },
  setTestFlag:function(){
    this.props.setFlag();
  },
  render: function(){
      console.log(this.state.continuous)

    var halo = (<div><select onChange={this.haloChanged}>
              <option value={0}>Manual</option>
              <option value={1}>Ferrous</option>
              <option value={2}>Non-Ferrous</option>
              <option value={3}>Stainless Steel</option>
            </select>
           
            <button onClick={this.haloTest}>Run Test</button>
            <button onClick={this.photoEye}>Trigger Photoeye - Single Chain</button>
            <button onClick={this.photoEyeInt}>Trigger Photoeye - Multi Chain</button>
            <button onClick={this.clearData}>Clear Data</button>
            <button onClick={this.clearTriggers}>Clear Triggers</button>
            <button onClick={this.setTestFlag}>Set Test Flag</button>
            </div>)
    
    return(<div className="iscope">
    {halo}
     <input type='checkbox' checked={this.state.continuous} onChange={this.contChange}/><label>Continuous Mode</label>
    <input type='checkbox' checked={this.state.autoSave} onChange={this.autoSaveChange}/><label>Save Plots Automatically</label>
    <div><label>Open Fss File</label>
     <input type='file' onChange={this.readFss}/></div>
     <div id={this.props.plotDivId} className="js-plotly-plot"/>
     <div>
     <button onClick={this.resetPacks}>Reset Counter</button>
       <label>Packs:{this.state.packs.toString()}</label>
     </div>
    </div>);
  }
})

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
    this.props.pathSet(true)
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
 
    var but = ""
    if(this.state.changed){
      but = (<button onClick={this.saveChanges}>save</button>)
    }
    console.log(this.state.prefs)
    console.log(this.state.prefs["Path"])
    return (<div className='pInterface'>
      <div><label>Preferences<br/></label></div>
      <HackWebkitDirectory winput='wfileinput' passVal={this.grabPath} showPath={true}/>
      <label>{this.state.prefs["Path"]}</label>
      <CustomTextInput name="Customer" prefInd={1} handle={this.handleText} value={this.state.prefs["CustomerName"]}/>
      <CustomTextInput name="Product" prefInd={2} handle={this.handleText} value={this.state.prefs["ProductDescription"]}/>
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

  },
  passVal: function(p){

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
      <label>Save Path:</label>
      
      <button onClick={this.click}>Browse</button>
     <div> {label}</div>
      </div>);
  }
})

var TestFlag = React.createClass({
  getInitialState: function(){
    return ({test:'ss'})
  },
  changeTest: function(e){
    this.setState({test:e.target.value})
  },
  clicked: function(){
    this.props.clicked(this.state.test)
  },
  render:function(){
    return (<div>
      <select onChange={this.changeTest}>
        <option value={'ss'}>SS</option>
        <option value={'fe'}>FE</option>
        <option value={'nfe'}>NFE</option>
      </select>
      <button onClick={this.clicked}>Test Flag</button>
    </div>)
  }
})

ReactDom.render(<div><Header/><InterceptorContent/></div>, document.getElementById('content'));
