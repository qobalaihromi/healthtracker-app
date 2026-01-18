import { useState, useCallback } from 'react';
import { YStack, H2, Text, Card, XStack, ScrollView, Paragraph, Button } from 'tamagui';
import { useRouter, useFocusEffect } from 'expo-router';
import { db } from '../../db/client';
import { activities } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { MapPin, Clock, Activity, ChevronRight } from 'lucide-react-native';

type ActivityRow = typeof activities.$inferSelect;

export default function ActivitiesScreen() {
    const router = useRouter();
    const [activityList, setActivityList] = useState<ActivityRow[]>([]);

    useFocusEffect(
        useCallback(() => {
            const loadActivities = async () => {
                const data = await db.select().from(activities).orderBy(desc(activities.created_at));
                setActivityList(data);
            };
            loadActivities();
        }, [])
    );

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
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

    return (
        <ScrollView f={1} bg="$background" contentContainerStyle={{ padding: 20 }}>
            <YStack space="$4">
                <H2>Activity History 🏃</H2>

                {activityList.length === 0 ? (
                    <Card p="$4" bordered>
                        <YStack ai="center" space="$2">
                            <Activity size={48} color="gray" />
                            <Text theme="alt2">No activities yet.</Text>
                            <Text theme="alt2" size="$2">Start your first run to see it here!</Text>
                        </YStack>
                    </Card>
                ) : (
                    activityList.map((item) => (
                        <Card
                            key={item.id}
                            p="$4"
                            bordered
                            elevate
                            pressStyle={{ scale: 0.98 }}
                            onPress={() => router.push(`/activities/${item.id}`)}
                        >
                            <XStack jc="space-between" ai="center">
                                <YStack f={1} space="$1">
                                    <Text fontWeight="bold" fontSize="$5">{item.type === 'run' ? '🏃 Run' : '🚶 Walk'}</Text>
                                    <XStack ai="center" space="$2">
                                        <Clock size={14} color="gray" />
                                        <Paragraph size="$2" theme="alt2">{formatDate(item.start_time)}</Paragraph>
                                    </XStack>
                                    <XStack space="$4" mt="$2">
                                        <YStack>
                                            <Text fontWeight="bold">{((item.distance_meters || 0) / 1000).toFixed(2)} km</Text>
                                            <Text size="$1" theme="alt2">Distance</Text>
                                        </YStack>
                                        <YStack>
                                            <Text fontWeight="bold">{formatDuration(item.duration_seconds || 0)}</Text>
                                            <Text size="$1" theme="alt2">Duration</Text>
                                        </YStack>
                                        <YStack>
                                            <Text fontWeight="bold">{item.avg_pace?.toFixed(2) || '-'}</Text>
                                            <Text size="$1" theme="alt2">Pace (min/km)</Text>
                                        </YStack>
                                    </XStack>
                                </YStack>
                                <ChevronRight size={24} color="gray" />
                            </XStack>
                        </Card>
                    ))
                )}

                <Button mt="$4" onPress={() => router.back()}>
                    Back to Home
                </Button>
            </YStack>
        </ScrollView>
    );
}
