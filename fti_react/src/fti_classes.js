// fti_classes.js 

export class FtiHelper extends React.Component{
  constructor(ip){
    super();

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


export class HaloDemo{
  constructor(ip){
    if(ip){
      this.host_ip = ip.split('.').map(function(e){
        return parseInt(e);
      })
    }else{
      if(!this.host_ip){
        this.get_interface_ip(HOST_NIF_MAC);  
      }
      
    }
  }

  get_interface_ip(mac){
    var host_mac = mac.split(/[-]|[:]/).map(function(e){
      return parseInt("0x"+e);
    }) 
  }
  change_dsp_ip(callBack){
    var self = this;
    this.scan_for_dsp_board(function(e){
      callBack(e)
      self.send_ip_change(e)
    })
  }
  scan_for_dsp_board(callBack){

    arloc.ArmLocator.scan(1500, function(e){
          console.log(e)
    })
  }

  send_ip_change(e){
    var ds;
    e.forEach(function(board){
      if(/^DETECTOR/.test(board.name)){
        ds = board
        ds = new Objrvt
        nif_ip = "192.168.10.50"
        ds.nif_ip;

        var nifip = ds.nif_ip
        var ip = nifip.split('.').map(function(e){return parseInt(e)});
        var n = ip[3] + 1;
        if(n==0||n==255){
          n = 50
        }
        var new_ip = [ip[0],ip[1],ip[2],n].join('.');
        var querystring = "mac:" + e[0].mac+ ", mode:static, ip:" + new_ip + ", nm:255.255.255.0"
        ArmConfig.parse(querystring);
      }
    })

    var nifip = ds.nif_ip
    var ip = nifip.split('.').map(function(e){return parseInt(e)});
    var n = ip[3] + 1;
    if(n==0||n==255){
      n = 50
    }
    var new_ip = [ip[0],ip[1],ip[2],n].join('.');
    var querystring = "mac:" + e[0].mac+ ", mode:static, ip:" + new_ip + ", nm:255.255.255.0"
    ArmConfig.parse(querystring);

  }

  test_fti_rpc(){
    var dsp = FtiRpc.udp('192.168.10.50');
    dsp.scope_comb_test(3*231);
  }


}