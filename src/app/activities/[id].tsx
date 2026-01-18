import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { YStack, H2, Text, Card, XStack, Button, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { UrlTile, Polyline } from 'react-native-maps';
import { db } from '../../db/client';
import { activities } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { Trash2, ArrowLeft, Clock, MapPin, Activity } from 'lucide-react-native';

const OSM_URL_TEMPLATE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

type ActivityRow = typeof activities.$inferSelect;

export default function ActivityDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const mapRef = useRef<MapView>(null);

    const [activity, setActivity] = useState<ActivityRow | null>(null);
    const [pathCoordinates, setPathCoordinates] = useState<any[]>([]);

    useEffect(() => {
        const loadActivity = async () => {
            if (!id) return;
            const data = await db.select().from(activities).where(eq(activities.id, parseInt(id)));
            if (data.length > 0) {
                setActivity(data[0]);
                // Parse path coordinates
                if (data[0].path_coordinates) {
                    try {
                        const coords = JSON.parse(data[0].path_coordinates);
                        setPathCoordinates(coords);
                        // Fit map to route
                        if (coords.length > 0) {
                            setTimeout(() => {
                                mapRef.current?.fitToCoordinates(coords, {
                                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                                    animated: true
                                });
                            }, 500);
                        }
                    } catch (e) {
                        console.error("Failed to parse coordinates", e);
                    }
                }
            }
        };
        loadActivity();
    }, [id]);

    const handleDelete = async () => {
        Alert.alert(
            "Delete Activity",
            "Are you sure you want to delete this activity?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (id) {
                            await db.delete(activities).where(eq(activities.id, parseInt(id)));
                            router.back();
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (secs: number) => {
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

    if (!activity) {
        return (
            <YStack f={1} bg="$background" ai="center" jc="center">
                <Text>Loading...</Text>
            </YStack>
        );
    }

    return (
        <YStack f={1} bg="$background">
            {/* Map Header */}
            <YStack h={300}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    provider={null}
                    rotateEnabled={false}
                >
                    <UrlTile urlTemplate={OSM_URL_TEMPLATE} maximumZ={19} flipY={false} />
                    <Polyline coordinates={pathCoordinates} strokeColor="#FF5500" strokeWidth={5} />
                </MapView>
            </YStack>

            {/* Stats */}
            <ScrollView f={1} contentContainerStyle={{ padding: 20 }}>
                <YStack space="$4">
                    <XStack jc="space-between" ai="center">
                        <H2>{activity.type === 'run' ? '🏃 Run' : '🚶 Walk'}</H2>
                        <Button size="$3" icon={Trash2} theme="red" onPress={handleDelete}>
                            Delete
                        </Button>
                    </XStack>

                    <Text theme="alt2">{formatDate(activity.start_time)}</Text>

                    {/* Stats Cards */}
                    <XStack space="$4" flexWrap="wrap">
                        <Card f={1} p="$4" bordered minWidth={100}>
                            <YStack ai="center">
                                <MapPin size={20} color="orange" />
                                <Text fontWeight="bold" fontSize="$6">{((activity.distance_meters || 0) / 1000).toFixed(2)}</Text>
                                <Text theme="alt2" size="$2">KM</Text>
                            </YStack>
                        </Card>
                        <Card f={1} p="$4" bordered minWidth={100}>
                            <YStack ai="center">
                                <Clock size={20} color="blue" />
                                <Text fontWeight="bold" fontSize="$6">{formatDuration(activity.duration_seconds || 0)}</Text>
                                <Text theme="alt2" size="$2">Duration</Text>
                            </YStack>
                        </Card>
                        <Card f={1} p="$4" bordered minWidth={100}>
                            <YStack ai="center">
                                <Activity size={20} color="green" />
                                <Text fontWeight="bold" fontSize="$6">{formatPace(activity.avg_pace || 0)}</Text>
                                <Text theme="alt2" size="$2">Pace</Text>
                            </YStack>
                        </Card>
                    </XStack>

                    <Button mt="$4" icon={ArrowLeft} onPress={() => router.back()}>
                        Back to History
                    </Button>
                </YStack>
            </ScrollView>
        </YStack>
    );
}
