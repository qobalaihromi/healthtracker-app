// import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

const HEART_RATE_SERVICE_UUID = '180D';
const HEART_RATE_CHARACTERISTIC_UUID = '2A37';

// MOCK SERVICE FOR EXPO GO COMPATIBILITY
// To restore BLE, uncomment imports above and the real class below.

class HeartRateService {
    // manager: BleManager;
    device: any | null = null;

    constructor() {
        // this.manager = new BleManager();
        console.log("BLE Service initialized in MOCK MODE (Expo Go)");
    }

    async requestPermissions() {
        console.log("Requesting permissions (Mock)");
        return true;
    }

    scanAndConnect(onHeartRateUpdate: (hr: number) => void) {
        console.log("Scanning started (Mock)...");
        // Simulate connection after 2 seconds
        setTimeout(() => {
            console.log("Mock Device Connected!");
            // Simulate Heart Rate updates
            setInterval(() => {
                const mockHr = 70 + Math.floor(Math.random() * 10);
                onHeartRateUpdate(mockHr);
            }, 1000);
        }, 2000);
    }

    async connectToDevice(device: any, callback: (hr: number) => void) {
        // Mock
    }

    parseHeartRate(base64Value: string) {
        return 75;
    }
}

export const heartRateService = new HeartRateService();

/*
// REAL IMPLEMENTATION (SAVED FOR LATER)
class RealHeartRateService {
    // ... (Original Code)
}
*/
