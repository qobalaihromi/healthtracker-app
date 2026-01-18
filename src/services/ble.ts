import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

const HEART_RATE_SERVICE_UUID = '180D';
const HEART_RATE_CHARACTERISTIC_UUID = '2A37';

class HeartRateService {
    manager: BleManager;
    device: Device | null = null;

    constructor() {
        this.manager = new BleManager();
    }

    async requestPermissions() {
        if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ]);
            return result;
        }
        return true;
    }

    scanAndConnect(onHeartRateUpdate: (hr: number) => void) {
        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.log(error);
                return;
            }

            // Check if device advertises Heart Rate Service
            if (device && (device.name?.includes('Heart') || device.serviceUUIDs?.includes(HEART_RATE_SERVICE_UUID))) {
                this.manager.stopDeviceScan();
                this.connectToDevice(device, onHeartRateUpdate);
            }
        });
    }

    async connectToDevice(device: Device, callback: (hr: number) => void) {
        try {
            const connectedDevice = await device.connect();
            await connectedDevice.discoverAllServicesAndCharacteristics();

            this.device = connectedDevice;

            connectedDevice.monitorCharacteristicForService(
                HEART_RATE_SERVICE_UUID,
                HEART_RATE_CHARACTERISTIC_UUID,
                (error, characteristic) => {
                    if (characteristic?.value) {
                        const hr = this.parseHeartRate(characteristic.value);
                        callback(hr);
                    }
                }
            );
        } catch (e) {
            console.log('Connection error', e);
        }
    }

    parseHeartRate(base64Value: string) {
        // Basic parsing logic for standard BLE HR measurement
        // In real app, need Buffer or base64 decode
        // For now returning mock data if real parsing fails
        return 75;
    }
}

export const heartRateService = new HeartRateService();
