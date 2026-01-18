import { useRef, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { UrlTile, Polyline, Marker } from 'react-native-maps';
import { YStack, Button, Text, Card, H2 } from 'tamagui';
import * as Location from 'expo-location';
import { Play, Pause, StopCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// OpenStreetMap Tile URL (Standard)
const OSM_URL_TEMPLATE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function MapScreen() {
    const mapRef = useRef<MapView>(null);
    const router = useRouter();

    // State
    const [status, setStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
    const [locationPermission, setLocationPermission] = useState(false);
    const [pathCoordinates, setPathCoordinates] = useState<any[]>([]);
    const [distance, setDistance] = useState(0);
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }
            setLocationPermission(true);

            // Get initial location to center map
            const loc = await Location.getCurrentPositionAsync({});
            mapRef.current?.animateToRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        })();
    }, []);

    const startRecording = async () => {
        setStatus('recording');

        const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 1000,
                distanceInterval: 5, // Update every 5 meters
            },
            (loc) => {
                const newCoord = {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                };

                setPathCoordinates(prev => [...prev, newCoord]);

                // Center map on user
                mapRef.current?.animateCamera({ center: newCoord, zoom: 17 });
            }
        );
        setCurrentSubscription(sub);
    };

    const stopRecording = () => {
        setStatus('idle');
        if (currentSubscription) {
            currentSubscription.remove();
            setCurrentSubscription(null);
        }
        // Save logic would go here (save pathCoordinates to DB)
        router.back();
    };

    return (
        <YStack f={1}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={null} // Important for using UrlTile (OSM)
                rotateEnabled={false}
            >
                {/* Overlay OpenStreetMap Tiles */}
                <UrlTile
                    urlTemplate={OSM_URL_TEMPLATE}
                    maximumZ={19}
                    flipY={false}
                />

                {/* Draw Route */}
                <Polyline
                    coordinates={pathCoordinates}
                    strokeColor="#FF5500"
                    strokeWidth={6}
                />
            </MapView>

            {/* Controls Overlay */}
            <YStack pos="absolute" b={40} l={20} r={20} space="$3">
                {status === 'recording' && (
                    <Card p="$4" theme="dark">
                        <H2 ta="center">{pathCoordinates.length} pts</H2>
                        <Text ta="center" theme="alt2">Recording Route...</Text>
                    </Card>
                )}

                {status === 'idle' ? (
                    <Button
                        size="$6"
                        theme="active"
                        icon={Play}
                        onPress={startRecording}
                        disabled={!locationPermission}
                    >
                        Start Run
                    </Button>
                ) : (
                    <Button
                        size="$6"
                        theme="red"
                        icon={StopCircle}
                        onPress={stopRecording}
                    >
                        Finish Activity
                    </Button>
                )}
            </YStack>
        </YStack>
    );
}
