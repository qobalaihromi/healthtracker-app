import { YStack, Text, Button, XStack, Card, H2, H4, Paragraph, Theme } from 'tamagui'
import { useEffect, useState } from 'react'
import { Pedometer } from 'expo-sensors';
import { PedometerService } from '../services/pedometer'
import { Footprints, Flame, Timer } from 'lucide-react-native'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
    const router = useRouter();
    const [steps, setSteps] = useState(0);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');

    useEffect(() => {
        let subscription: any;

        const subscribe = async () => {
            const available = await PedometerService.isAvailable();
            setIsPedometerAvailable(available ? 'available' : 'unavailable');

            if (available) {
                const granted = await PedometerService.requestPermissions();
                if (granted) {
                    // Get initial steps
                    const initialSteps = await PedometerService.getTodaysSteps();
                    setSteps(initialSteps);

                    // Subscribe to updates
                    subscription = Pedometer.watchStepCount(result => {
                        setSteps(result.steps);
                        // In a real app, we would debounce this save
                        PedometerService.saveSteps(result.steps);
                    });
                }
            }
        };

        subscribe();

        return () => {
            subscription && subscription.remove();
        };
    }, []);

    return (
        <YStack f={1} bg="$background" pt="$8" px="$4" space="$4">
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

            <XStack space="$4">
                <Card f={1} elevated bordered p="$4" theme="red" onPress={() => router.push('/fasting/')}>
                    <YStack space="$2">
                        <Flame size={24} color="gray" />
                        <H4>0</H4>
                        <Paragraph size="$2" theme="alt2">Fasting</Paragraph>
                    </YStack>
                </Card>

                <Card f={1} elevated bordered p="$4" theme="blue" onPress={() => router.push('/sleep/add')}>
                    <YStack space="$2">
                        <Timer size={24} color="gray" />
                        <H4>0h 0m</H4>
                        <Paragraph size="$2" theme="alt2">Sleep Time</Paragraph>
                    </YStack>
                </Card>
            </XStack>

            <Button mt="$4" theme="active" onPress={() => router.push('/food/add')}>
                Log Food
            </Button>

            <XStack space="$4" mt="$4">
                <Button f={1} iconAfter={Footprints} onPress={() => router.push('/map/')}>
                    Start Activity
                </Button>
                <Button f={1} theme="purple" onPress={() => alert('Scanning for devices...')}>
                    Sync Band
                </Button>
            </XStack>

        </YStack>
    )
}
