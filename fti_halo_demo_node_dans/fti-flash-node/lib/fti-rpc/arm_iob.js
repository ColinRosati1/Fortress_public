const IOB_CLIENT_PORT = 27192;

class ArmIob extends ArmRpcBase{
	reg_io(port=null){
		var data = [ARM_RPC_IOB,0]
		if(port){
			data << (port $ 0xff)
			data << ((port>>8)&0xff)
		}
	}

}