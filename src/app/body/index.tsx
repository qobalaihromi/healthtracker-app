import { useState, useEffect } from 'react';
import { YStack, H2, Input, Button, Text, XStack, Card, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { db } from '../../db/client';
import { dailyLogs } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default function BodyMetricsScreen() {
    const router = useRouter();
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [waist, setWaist] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);

    useEffect(() => {
        loadTodaysMetrics();
    }, []);

    const loadTodaysMetrics = async () => {
        const today = new Date().toISOString().split('T')[0];
        const log = await db.select().from(dailyLogs).where(eq(dailyLogs.date, today));
        if (log.length > 0) {
            setWeight(log[0].weight_kg?.toString() || '');
            setHeight(log[0].height_cm?.toString() || '');
            setWaist(log[0].waist_cm?.toString() || '');
            calculateBMI(log[0].weight_kg, log[0].height_cm);
        }
    };

    const calculateBMI = (w: number | null, h: number | null) => {
        if (w && h) {
            const hM = h / 100;
            const bmiValue = w / (hM * hM);
            setBmi(parseFloat(bmiValue.toFixed(1)));
        }
    };

    const handleSave = async () => {
        const today = new Date().toISOString().split('T')[0];
        const w = parseFloat(weight);
        const h = parseFloat(height);
        const wa = parseFloat(waist);

        // Update local state BMI
        calculateBMI(w, h);

        const existing = await db.select().from(dailyLogs).where(eq(dailyLogs.date, today));

        if (existing.length > 0) {
            await db.update(dailyLogs).set({
                weight_kg: w || null,
                height_cm: h || null,
                waist_cm: wa || null,
                updated_at: new Date()
            }).where(eq(dailyLogs.date, today));
        } else {
            await db.insert(dailyLogs).values({
                date: today,
                weight_kg: w || null,
                height_cm: h || null,
                waist_cm: wa || null
            });
        }

        router.back();
    };

    return (
        <ScrollView f={1} bg="$background" contentContainerStyle={{ padding: 20 }}>
            <YStack space="$4" maxWidth={600} w="100%" alignSelf="center">
                <H2 ta="center" mb="$2">Body Metrics 📏</H2>

                {bmi !== null && (
                    <Card p="$4" bg="$blue4" ai="center" jc="center" mb="$4">
                        <H2 color="$blue10">{bmi}</H2>
                        <Text color="$blue10">Current BMI</Text>
                    </Card>
                )}

                <YStack space="$2">
                    <Text fontWeight="bold">Weight (kg)</Text>
                    <Input
                        placeholder="e.g. 70"
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={setWeight}
                        size="$4"
                    />
                </YStack>

                <YStack space="$2">
                    <Text fontWeight="bold">Height (cm)</Text>
                    <Input
                        placeholder="e.g. 175"
                        keyboardType="numeric"
                        value={height}
                        onChangeText={setHeight}
                        size="$4"
                    />
                </YStack>

                <YStack space="$2">
                    <Text fontWeight="bold">Waist Circumference (cm)</Text>
                    <Input
                        placeholder="e.g. 80"
                        keyboardType="numeric"
                        value={waist}
                        onChangeText={setWaist}
                        size="$4"
                    />
                </YStack>

                <Button
                    mt="$4"
                    theme="active"
                    size="$5"
                    onPress={handleSave}
                    pressStyle={{ opacity: 0.8 }}
                >
                    Save Metrics
                </Button>
            </YStack>
        </ScrollView>
    );
}
