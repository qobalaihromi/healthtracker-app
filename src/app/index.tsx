import { YStack, Text, Button, XStack, Card, H2, H4, Paragraph, Theme, ScrollView } from 'tamagui'
import { useEffect, useState, useCallback } from 'react'
import { Pedometer } from 'expo-sensors';
import { PedometerService } from '../services/pedometer'
import { Footprints, Flame, Timer, Weight, Ruler, Activity } from 'lucide-react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { db } from '../db/client';
import { dailyLogs } from '../db/schema';
import { eq } from 'drizzle-orm';

export default function HomeScreen() {
    const router = useRouter();
    const [steps, setSteps] = useState(0);
    const [weight, setWeight] = useState('-');
    const [bmi, setBmi] = useState('-');
    const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');

    // Subscribe to Pedometer
    useEffect(() => {
        let subscription: any;
        const subscribe = async () => {
            const available = await PedometerService.isAvailable();
            setIsPedometerAvailable(available ? 'available' : 'unavailable');
            if (available) {
                const granted = await PedometerService.requestPermissions();
                if (granted) {
                    const initialSteps = await PedometerService.getTodaysSteps();
                    setSteps(initialSteps);
                    subscription = Pedometer.watchStepCount(result => {
                        setSteps(result.steps);
                        PedometerService.saveSteps(result.steps);
                    });
                }
            }
        };
        subscribe();
        return () => subscription && subscription.remove();
    }, []);

    // Reload Data on Focus (Steps, Weight)
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const today = new Date().toISOString().split('T')[0];
                const log = await db.select().from(dailyLogs).where(eq(dailyLogs.date, today));
                if (log.length > 0) {
                    setWeight(log[0].weight_kg ? `${log[0].weight_kg}kg` : '-');

                    if (log[0].weight_kg && log[0].height_cm) {
                        const hM = log[0].height_cm / 100;
                        const bmiVal = log[0].weight_kg / (hM * hM);
                        setBmi(bmiVal.toFixed(1));
                    }
                }
            };
            loadData();
        }, [])
    );

    return (
        <ScrollView f={1} bg="$background" contentContainerStyle={{ paddingBottom: 40 }}>
            <YStack pt="$8" px="$4" space="$4">
                <H2 col="$color">Today's Activity</H2>

                {/* Steps Card */}
                <Card elevated bordered size="$4" p="$4" theme="orange">
                    <XStack ai="center" space="$4">
                        <YStack bg="$orange5" p="$3" br="$10">
                            <Footprints size={32} color="white" />
                        </YStack>
                        <YStack>
                            <H4>{steps}</H4>
                            <Paragraph theme="alt2">Steps Taken</Paragraph>
                        </YStack>
                    </XStack>
                </Card>

                {/* Metrics Grid */}
                <XStack space="$4">
                    <Card f={1} elevated bordered p="$4" theme="red" onPress={() => router.push('/fasting/')}>
                        <YStack space="$2">
                            <Flame size={24} color="gray" />
                            <H4>Fasting</H4>
                            <Paragraph size="$2" theme="alt2">Timer</Paragraph>
                        </YStack>
                    </Card>

                    <Card f={1} elevated bordered p="$4" theme="blue" onPress={() => router.push('/sleep/add')}>
                        <YStack space="$2">
                            <Timer size={24} color="gray" />
                            <H4>Sleep</H4>
                            <Paragraph size="$2" theme="alt2">Log Time</Paragraph>
                        </YStack>
                    </Card>
                </XStack>

                {/* Body Metrics Row */}
                <XStack space="$4">
                    <Card f={1} elevated bordered p="$4" theme="green" onPress={() => router.push('/body/')}>
                        <YStack space="$2">
                            <Weight size={24} color="gray" />
                            <H4>{weight}</H4>
                            <Paragraph size="$2" theme="alt2">Weight</Paragraph>
                        </YStack>
                    </Card>

                    <Card f={1} elevated bordered p="$4" theme="green" onPress={() => router.push('/body/')}>
                        <YStack space="$2">
                            <Activity size={24} color="gray" />
                            <H4>{bmi}</H4>
                            <Paragraph size="$2" theme="alt2">BMI</Paragraph>
                        </YStack>
                    </Card>
                </XStack>

                <Button mt="$2" theme="active" onPress={() => router.push('/food/add')}>
                    Log Food
                </Button>

                <Button iconAfter={Footprints} theme="alt1" onPress={() => router.push('/map/')}>
                    Start Run / Walk
                </Button>

                <Button theme="alt2" onPress={() => router.push('/activities/')}>
                    📜 View Activity History
                </Button>

                {/* BLE BUTTON HIDDEN FOR EXPO GO */}
                {/* 
                <Button f={1} theme="purple" onPress={() => alert('Scanning for devices...')}>
                    Sync Band
                </Button> 
                */}

            </YStack>
        </ScrollView>
    )
}
