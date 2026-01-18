import { YStack, H2, Button, Input, Paragraph, XStack, Card } from 'tamagui'
import { useState } from 'react'
import { SleepService } from '../../services/sleep'
import { useRouter } from 'expo-router'
import { Moon, Save } from 'lucide-react-native'

export default function AddSleepScreen() {
    const router = useRouter();
    const [hours, setHours] = useState('7.5');

    const handleSave = async () => {
        const value = parseFloat(hours);
        if (!isNaN(value)) {
            await SleepService.logSleep(value);
            router.back();
        }
    };

    return (
        <YStack f={1} bg="$background" ai="center" jc="center" p="$4" space="$4">
            <Moon size={64} color="#5B4DFF" />
            <H2>Log Sleep</H2>
            <Paragraph ta="center" theme="alt2">How many hours did you sleep last night?</Paragraph>

            <Card size="$6" elevated bordered p="$4" w="100%" maw={300}>
                <XStack ai="center" space="$2">
                    <Input
                        f={1}
                        value={hours}
                        onChangeText={setHours}
                        keyboardType="numeric"
                        size="$5"
                        ta="center"
                        fontSize="$8"
                    />
                    <Paragraph size="$5">Hrs</Paragraph>
                </XStack>
            </Card>

            <Button
                mt="$4"
                size="$5"
                theme="active"
                icon={Save}
                onPress={handleSave}
                w="100%"
                maw={300}
            >
                Save Sleep Log
            </Button>
        </YStack>
    )
}
