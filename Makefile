DTC=dtc 
all: m41t93-rpi.dtb
m41t93-rpi.dtb: m41t93-rpi.dts
	$(DTC) -@ -I dts -O dtb -o m41t93-Rpi.Dtbo m41t93-rpi.Dts
 
install-m41t93-rpi.dtbo: m41t93-rpi.dtbo
	cp m41t93-rpi.dtbo /boot/overlays/
 
install: install-m41t93-rpi.dtbo

clean:
	rm *.dtbo
