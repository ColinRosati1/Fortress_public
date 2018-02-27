'use strict';
var Fti = require('./fti-flash-node');
var arloc = Fti.ArmFind;
var dgram = require('dgram');
const KAPI_RPC_ETHERNETIP = 100;
const KAPI_RPC_REJ_DEL_CLOCK_READ = 70;
const DRPC_NUMBER = 19;
const NP_RPC = 13;
class NetPollEvents{
    constructor(detector_ip, vdef, callback)
    {
        var self = this;
        this.ip = detector_ip;
        this.vdef = vdef;
        this.record_deps = [];
        this.param_last_val = [];
        this.param_last_val["ProdName"] = "*********************";
        this.faults = "";
        this.faults_array = [];
        this.event_info = {string: "",
        this.callback = callback;
        self.init_net_poll_events_server();
    }
    init_net_poll_events_server(){
        var self = this;
        var so = dgram.createSocket('udp4')
        so.on("listening", function () {
            self.init_net_poll_events(so.address().port);
        });
        so.on('message', function(e,rinfo){
//                                                            console.log("new message from: "+rinfo.address)
            if(self.ip == rinfo.address){
//                                  console.log(e)
                if(e)
                {
                    self.parse_net_poll_event(e);
                }
                e = null;
                rinfo = null;
            }
        });
        so.bind({address: '0.0.0.0',port: 0,exclusive: true});
    }
    init_net_poll_events(port){
        var FtiRpc = Fti.Rpc.FtiRpc;
        var self = this;
        var dsp = FtiRpc.udp(this.ip);
        console.log(port)
        dsp.rpc0(DRPC_NUMBER,[KAPI_RPC_ETHERNETIP,port]);
        setTimeout(function () {
            dsp.rpc0(NP_RPC,[]);
            setTimeout(function () {
                            dsp.rpc0(DRPC_NUMBER,[KAPI_RPC_REJ_DEL_CLOCK_READ]);
            }, 100)
        }, 100)
        /*setInterval(function () {
            dsp.rpc0(DRPC_NUMBER,[KAPI_RPC_ETHERNETIP,port]);
            setTimeout(function () {
                            dsp.rpc0(NP_RPC,[]);
            }, 100)
        },10000)*/
        dsp.port.socket.on('message', function (message, remote) {
           // CAN I HANDLE THE RECIVED REPLY HERE????
            if(message.readUInt16LE(1)==KAPI_RPC_REJ_DEL_CLOCK_READ)
            {
                            self.record_deps["ProdRec.RejModeEmu"]=message.readUInt16LE(3);
            }
//                                            console.log(message);
        });

    }
    // parse_net_poll_event(buf){
    // var key = buf.readUInt16LE(0);
    // var res = "";
    // var self = this;
    // //              console.log("packet received: " + buf.toString('hex'));
    // //              console.log("Key: " + "0x" + key.toString(16));
    // var value = buf.readUInt16LE(2);
    // for(var e in this.vdef["@net_poll_h"])
    // {
    //     if((this.vdef["@net_poll_h"][e] == (key & 0xf000)) && ((e=="NET_POLL_PROD_SYS_VAR") || (e=="NET_POLL_PROD_REC_VAR")))
    // {
    //     //ignore these for now
    //                     this.event_info = this.parse_rec(buf,e);
    //     //            if((this.event_info.parameters[0].param_name != 'PRecordDate') && (this.event_info.parameters[0].param_name != 'SRecordDate')){
    //                                     this.callback(this.event_info, this.ip);
    //     //            }
    // }
    // else if((this.vdef["@net_poll_h"][e] == key) && (e=="NET_POLL_FAULT"))
    // {
    // var value = buf.readUInt16LE(2);
    // var date_time = this.parse_date_time(buf.slice(4,8));
    // var idx = key & 0xff;
    //                     this.faults = this.parse_faults(key,value).string;
    //                     this.faults_array = this.parse_faults(key,value).faults;
    // }
    // else if(((this.vdef["@net_poll_h"][e]+1) == key) && (e=="NET_POLL_FAULT"))

    // {

    // var value = buf.readUInt16LE(2);

    // var date_time = this.parse_date_time(buf.slice(4,8));

    //                     this.clear_event_info();

    //                     this.event_info.string = date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2) + " " + this.pad(date_time[3],2)

    //                                                                                                                                                                                                                                     + ":" + this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2) + " => " + e;

    //                     this.event_info.date_time = {year: date_time[0], month: date_time[1], day: date_time[2], hours: date_time[3], min: date_time[4], sec: date_time[5]};

    //                     this.event_info.net_poll_h = e;

    // var idx = key & 0xff;

    //                     this.faults = this.faults + this.parse_faults(key,value).string;

    //                     if(this.faults == "")

    //                                     this.faults = "No faults";

    //                     if(this.parse_faults(key,value) != "")

    //                     {

    //                                     this.event_info.string = this.event_info.string + ": " + this.faults;

    //                                     this.event_info.faults = this.faults_array.concat(this.parse_faults(key,value).faults);

    //                                     this.callback(this.event_info, this.ip);

    //                     }

    // }

    // else if(this.vdef["@net_poll_h"][e] == key)

    // {

    // var value = buf.readUInt16LE(2);

    // var date_time = this.parse_date_time(buf.slice(4,8));



    //                     this.event_info.string = date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2) + " " + this.pad(date_time[3],2)

    //                                                                                                                                                                                                                                     + ":" + this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2) + " => " + e;

    //                     this.event_info.date_time = {year: date_time[0], month: date_time[1], day: date_time[2], hours: date_time[3], min: date_time[4], sec: date_time[5]};

    //                     this.event_info.net_poll_h = e;

    //                     this.event_info.parameters = [];

    //                     this.event_info.faults = [];



    //                     if(e == "NET_POLL_REJECT_ID")

    //                     {

    //                                     this.event_info.string = this.event_info.string + ", Signal: " + this.event_info.rejects.signal + ", Rejects: " + value;

    //                                     this.event_info.rejects.number = value;

    //                     }

    //                     else if(e == "NET_POLL_OPERATOR_NO")

    //                     {

    //                                     this.event_info.string = this.event_info.string + " " + (value&0xff).toString();

    //                                     this.event_info.test.operator_no = value & 0xff;

    //                                     if((value&0xff00) == 256)

    //                                     {

    //                                                     this.event_info.string = this.event_info.string + ", Test Request Manual1";

    //                                                     this.event_info.test.request = "Manual1";

    //                                     }

    //                                     else if((value&0xff00) == 512)

    //                                     {

    //                                                     this.event_info.string = this.event_info.string + ", Test Request Halo1";

    //                                                     this.event_info.test.request = "Halo1";

    //                                     }

    //                                     else if((value&0xff00) == 768)

    //                                     {

    //                                                     this.event_info.string = this.event_info.string + ", Test Request Manual2";

    //                                                     this.event_info.test.request = "Manual2";

    //                                     }

    //                                     else if((value&0xff00) == 1024)

    //                                     {

    //                                                     this.event_info.string = this.event_info.string + ", Test Request Halo2";

    //                                                     this.event_info.test.request = "Halo2";

    //                                     }

    //                     }

    //                     this.callback(this.event_info, this.ip);

    // }

    //     else if(this.vdef["@net_poll_h"][e] == (key & 0xff00))

    //     {

    //                     var value = buf.readUInt16LE(2);



    //                     if(e == "NET_POLL_REJECT")

    //                     {

    //                                     var date_time = this.parse_date_time(buf.slice(4,8));

    //                                     this.event_info.string = date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2) + " " + this.pad(date_time[3],2)

    //                                                                                                                                                                                                                                                     + ":" + this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2) + " => " + e;

    //                                     this.event_info.date_time = {year: date_time[0], month: date_time[1], day: date_time[2], hours: date_time[3], min: date_time[4], sec: date_time[5]};

    //                                     this.event_info.net_poll_h = e;

    //                                     this.event_info.parameters = [];

    //                                     this.event_info.faults = [];

    //                                     if((key & 1<<2) && !(key & 1<<3))

    //                                     {

    //                                                     this.event_info.string = this.event_info.string + " => Test: Fe, " + value.toString();

    //                                                     this.event_info.test.type = "Fe";

    //                                                     this.event_info.test.signal = value;

    //                                                     this.callback(this.event_info, this.ip);

    //                                     }

    //                                     else if(!(key & 1<<2) && (key & 1<<3))

    //                                     {

    //                                                     this.event_info.string = this.event_info.string + " => Test: NFe, " + value.toString();

    //                                                     this.event_info.test.type = "NFe";

    //                                                     this.event_info.test.signal = value;

    //                                                     this.callback(this.event_info, this.ip);

    //                                     }

    //                                     else if((key & 1<<2) && (key & 1<<3))

    //                                     {

    //                                                     this.event_info.string = this.event_info.string + " => Test: SS, " + value.toString();

    //                                                     this.event_info.test.type = "SS";

    //                                                     this.event_info.test.signal = value;

    //                                                     this.callback(this.event_info, this.ip);

    //                                     }

    //                                     else

    //                                     {

    //                                                     this.event_info.test = {operator_no: null, request: null, type: null, signal: null};

    //                                                     this.event_info.string = this.event_info.string + ": " + value.toString();

    //                                                     this.event_info.rejects.signal = value;

    //                                                     this.callback(this.event_info, this.ip);

    //                                     }

