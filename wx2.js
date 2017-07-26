// Wx2Beaconの測定データを取得するプログラム
// Programed by Kazuyuki Eguchi

var noble = require('noble');

var WX2_SERVICE_UUID = '0c4c3000770046f4aa96d5e974e32a54';
var WX2_NOWDATA_UUID = '0c4c3001770046f4aa96d5e974e32a54';

noble.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);
 
    if (state === 'poweredOn') {
        noble.startScanning();
    } else {
        noble.stopScanning();
    }
});

noble.on('scanStart', function() {
    console.log('on -> scanStart');
});
 
noble.on('scanStop', function() {
    console.log('on -> scanStop');
});

noble.on('discover', function(peripheral) {
    console.log('on -> discover: ' + peripheral.advertisement.localName);
    
    if(peripheral.advertisement.localName == 'Env')
    {
    	console.log(peripheral.address);
    	noble.stopScanning();
    	
    	peripheral.on('connect', function() {
       		console.log('on -> connect');
        	this.discoverServices();
    	});
    	
    	peripheral.on('disconnect', function() {
        	console.log('on -> disconnect');
        	process.exit();
    	});
    	
    	peripheral.on('servicesDiscover', function(services) {
    		for(var i = 0; i < services.length; i++) {
 				// console.log(services[i]['uuid']);
 				if(services[i]['uuid'] == WX2_SERVICE_UUID)
 				{
 					services[i].on('includedServicesDiscover', function(includedServiceUuids) {
                    	this.discoverCharacteristics();
                	});
                	
                	services[i].on('characteristicsDiscover', function(characteristics) {
                    	for(var j = 0; j < characteristics.length; j++) {
                        	// console.log(characteristics[j].uuid);
                        	if(characteristics[j].uuid == WX2_NOWDATA_UUID)
                        	{
                        		var WX2_NOWDATA = characteristics[j];
                        		WX2_NOWDATA.read(function(error, data) {
                            		if (data) {
                                		// console.log(data);

										// 温度
                                		var temp = ((data[2] & 0xff) << 8) + (data[1] & 0xff);
                                		temp = temp * 0.01;
                                		
                                		// 湿度
                                		var hum = ((data[4] & 0xff) << 8) + (data[3] & 0xff);
                                		hum = hum * 0.01;
                                		
                                		// 照度
                                		var lum = ((data[6] & 0xff) << 8) + (data[5] & 0xff);
                                		
                                		// UVインデックス
                                		var uv = ((data[8] & 0xff) << 8) + (data[7] & 0xff);
                                		uv = uv * 0.01;

                                		// 気圧
                                		var atom = ((data[10] & 0xff) << 8) + (data[9] & 0xff);
                                		atom = atom * 0.1;

                                		// 騒音
                                		var noise = ((data[12] & 0xff) << 8) + (data[11] & 0xff);
                                		noise = noise * 0.01;
                                		
                                		// 不快指数
                                		var disco = ((data[14] & 0xff) << 8) + (data[13] & 0xff);
                                		disco = disco * 0.01;
                                		
                                		// 熱中症危険度
                                		var heat = ((data[16] & 0xff) << 8) + (data[15] & 0xff);
                                		heat = heat * 0.01;
                                		
                                		// バッテリー電圧
                                		var batt = ((data[18] & 0xff) << 8) + (data[17] & 0xff);
                                		batt = batt * 0.001;

                                		console.log('No=' + data[0]);
                                		console.log('Temp=' + temp + ' ℃');
                                		console.log('Humidity=' + hum + ' %') 
                                		console.log('Luminosity=' + lum + ' lx');
                                		console.log('UV Index=' + uv);
                                		console.log('Atom=' + atom + ' hPa');
                                		console.log('Noise=' + noise + ' dB');
                                		console.log('Discomfort index=' + disco);
                                		console.log('Heat=' + heat + ' ℃');
                                		console.log('Battery=' + batt + ' mv');
                            		}
			                        peripheral.disconnect();
                        		});
                        	}
                        }
                    });
                    
                    services[i].discoverIncludedServices();
 				}
 			}
 		});
 		
 		peripheral.connect();
    }
});

