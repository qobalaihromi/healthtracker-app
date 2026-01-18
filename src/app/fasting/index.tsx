import { useRef, useState, useEffect } from 'react';
import { YStack, H2, Text, Button, Card, Circle, Progress, XStack } from 'tamagui';
import { FastingService } from '../../services/fasting';
import { Play, Square, Utensils } from 'lucide-react-native';

export default function FastingScreen() {
    const [activeFast, setActiveFast] = useState<any>(null);
    const [elapsed, setElapsed] = useState(0);
    const intervalRef = useRef<any>(null);

    const checkStatus = async () => {
        const fast = await FastingService.getCurrentFast();
        setActiveFast(fast);
        if (fast) {
            updateElapsed(fast.start_time);
        } else {
            setElapsed(0);
        }
    };

    const updateElapsed = (startTime: string) => {
        const start = new Date(startTime).getTime();
        const now = new Date().getTime();
        setElapsed(Math.floor((now - start) / 1000));
    };

    useEffect(() => {
        checkStatus();
        intervalRef.current = setInterval(() => {
            if (activeFast) {
                updateElapsed(activeFast.start_time);
            }
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [activeFast]);

    const handleStart = async () => {
        await FastingService.startFast(16); // Default 16:8
        checkStatus();
    };

    const handleStop = async () => {
        await FastingService.endFast();
        setActiveFast(null);
        setElapsed(0);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <YStack f={1} ai="center" jc="center" p="$4" space="$5">
            <H2>{activeFast ? 'You are Fasting 🔥' : 'Ready to Fast?'}</H2>

            <Circle size={250} bw={4} boc={activeFast ? '$orange10' : '$gray5'} ai="center" jc="center">
                <Text fontSize="$9" fontWeight="bold">
                    {formatTime(elapsed)}
                </Text>
                <Text fontSize="$4" theme="alt2" mt="$2">
                    {activeFast ? 'Elapsed Time' : 'Not Started'}
                </Text>
            </Circle>

            {activeFast ? (
                <Button
                    size="$6"
                    theme="red"
                    icon={Square}
                    onPress={handleStop}
                    w="80%"
                >
                    End Fasting (Eat)
                </Button>
            ) : (
                <Button
                    size="$6"
                    theme="active"
                    icon={Utensils}
                    onPress={handleStart}
                    w="80%"
                >
                    Start Fasting (16H)
                </Button>
            )}

            <Card elevated bordered p="$4">
                <XStack space="$4" ai="center">
                    <Text>Target: 16 Hours</Text>
                    <Text>Method: 16:8</Text>
                </XStack>
            </Card>
        </YStack>
    );
}
