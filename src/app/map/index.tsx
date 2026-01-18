import { useRef, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Alert } from 'react-native';
import MapView, { UrlTile, Polyline, Marker } from 'react-native-maps';
import { YStack, Button, Text, Card, H2, XStack } from 'tamagui';
import * as Location from 'expo-location';
import { Play, Pause, StopCircle, Timer, Move, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { db } from '../../db/client';
import { activities } from '../../db/schema';

const OSM_URL_TEMPLATE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

// Haversine Formula for Distance (meters)
const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d * 1000; // Meters
};

const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
};

export default function MapScreen() {
    const mapRef = useRef<MapView>(null);
    const router = useRouter();

    // State
    const [status, setStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
    const [locationPermission, setLocationPermission] = useState(false);
    const [pathCoordinates, setPathCoordinates] = useState<any[]>([]);

    // Stats
    const [distanceMeters, setDistanceMeters] = useState(0);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [startTime, setStartTime] = useState<string | null>(null);

    // Initial Setup
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return;
            }
            setLocationPermission(true);

            const loc = await Location.getCurrentPositionAsync({});
            mapRef.current?.animateToRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        })();
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (status === 'recording') {
            interval = setInterval(() => {
                setDurationSeconds(prev => prev + 1);
            }, 1000);
        } else if (status === 'paused' || status === 'idle') {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [status]);

    const startRecording = async () => {
        setStatus('recording');
        setStartTime(new Date().toISOString());

        // Reset if starting fresh
        if (status === 'idle') {
            setPathCoordinates([]);
            setDistanceMeters(0);
            setDurationSeconds(0);
        }

        const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 1000,
                distanceInterval: 3, // Update every 3 meters
            },
            (loc) => {
                const newCoord = {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                };

                // Calculate Distance
                setPathCoordinates(prev => {
                    if (prev.length > 0) {
                        const last = prev[prev.length - 1];
                        const dist = getDistanceFromLatLonInMeters(
                            last.latitude, last.longitude,
                            newCoord.latitude, newCoord.longitude
                        );
                        setDistanceMeters(old => old + dist);
                    }
                    return [...prev, newCoord];
                });

                mapRef.current?.animateCamera({ center: newCoord, zoom: 18 });
            }
        );
        setCurrentSubscription(sub);
    };

    const stopRecording = async () => {
        setStatus('idle');
        if (currentSubscription) {
            currentSubscription.remove();
            setCurrentSubscription(null);
        }

        // Calculate Stats
        const avgPace = distanceMeters > 0 ? (durationSeconds / 60) / (distanceMeters / 1000) : 0;
        const endTime = new Date().toISOString();

        // Save to DB
        try {
            await db.insert(activities).values({
                type: 'run',
                start_time: startTime || new Date().toISOString(),
                end_time: endTime,
                duration_seconds: durationSeconds,
                distance_meters: distanceMeters,
                avg_pace: parseFloat(avgPace.toFixed(2)),
                path_coordinates: JSON.stringify(pathCoordinates)
            });

            Alert.alert(
                "Run Finished! 🎉",
                `Distance: ${(distanceMeters / 1000).toFixed(2)} km\nTime: ${formatTime(durationSeconds)}\nPace: ${formatPace(avgPace)}`,
                [{ text: "OK", onPress: () => router.back() }]
            );

        } catch (e) {
            console.error("Failed to save activity", e);
            Alert.alert("Error", "Failed to save activity.");
        }
    };

    // Formatters
    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s < 10 ? '0' : ''}${s}`;
    };

    const formatPace = (pace: number) => {
        if (!isFinite(pace) || pace === 0) return "-'--\"";
        const mins = Math.floor(pace);
        const secs = Math.round((pace - mins) * 60);
        return `${mins}'${secs < 10 ? '0' : ''}${secs}"`;
    };

    return (
        <YStack f={1}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={null}
                rotateEnabled={false}
                showsUserLocation={true}
            >
                <UrlTile urlTemplate={OSM_URL_TEMPLATE} maximumZ={19} flipY={false} />
                <Polyline coordinates={pathCoordinates} strokeColor="#FF5500" strokeWidth={6} />
            </MapView>

            {/* LIVE STATS OVERLAY */}
            <YStack pos="absolute" t={60} l={20} r={20}>
                <Card p="$4" theme="dark" bordered elevated>
                    <XStack jc="space-between" ai="center">
                        <YStack ai="center">
                            <Text color="$color" fontSize="$2" theme="alt2">TIME</Text>
                            <H2>{formatTime(durationSeconds)}</H2>
                        </YStack>
                        <YStack ai="center">
                            <Text color="$color" fontSize="$2" theme="alt2">DIST (KM)</Text>
                            <H2>{(distanceMeters / 1000).toFixed(2)}</H2>
                        </YStack>
                        <YStack ai="center">
                            <Text color="$color" fontSize="$2" theme="alt2">PACE</Text>
                            <H2>{formatPace(distanceMeters > 0 ? (durationSeconds / 60) / (distanceMeters / 1000) : 0)}</H2>
                        </YStack>
                    </XStack>
                </Card>
            </YStack>

            {/* CONTROLS */}
            <YStack pos="absolute" b={40} l={20} r={20} space="$3">
                {status === 'idle' ? (
                    <Button size="$6" theme="active" icon={Play} onPress={startRecording} disabled={!locationPermission}>
                        Start Activity
                    </Button>
                ) : (
                    <Button size="$6" theme="red" icon={StopCircle} onPress={stopRecording}>
                        Finish
                    </Button>
                )}
            </YStack>
        </YStack>
    );
}
