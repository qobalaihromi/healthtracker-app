import { YStack, XStack, Input, Button, ScrollView, Text, Card, H4, Paragraph } from 'tamagui'
import { useState } from 'react'
import { FoodService, FoodItem } from '../../services/food'
import { useRouter } from 'expo-router'
import { Search, Plus } from 'lucide-react-native'

export default function AddFoodScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodItem[]>(FoodService.searchLocal(''));
    const [loading, setLoading] = useState(false);

    const handleSearch = async (text: string) => {
        setQuery(text);
        // Search Local First
        let items = FoodService.searchLocal(text);

        // If few results, trigger Online search (debounced in real app)
        if (items.length < 3 && text.length > 2) {
            setLoading(true);
            const onlineItems = await FoodService.searchOnline(text);
            items = [...items, ...onlineItems];
            setLoading(false);
        }
        setResults(items);
    };

    const handleLog = async (item: FoodItem) => {
        await FoodService.logFood(item, 'snack'); // Defaulting to snack for MVP
        router.back();
    };

    return (
        <YStack f={1} bg="$background" pt="$8" px="$4">
            <XStack ai="center" space="$2" mb="$4">
                <Input
                    f={1}
                    placeholder="Search food (e.g. Nasi Goreng)..."
                    value={query}
                    onChangeText={handleSearch}
                    size="$4"
                />
                <Button size="$4" icon={Search} circular />
            </XStack>

            <ScrollView showsVerticalScrollIndicator={false}>
                {results.map((item, index) => (
                    <Card key={index} mb="$3" p="$3" bordered onPress={() => handleLog(item)}>
                        <XStack jc="space-between" ai="center">
                            <YStack>
                                <H4>{item.food_name}</H4>
                                <Paragraph theme="alt2">{item.calories} Kcal • Sugar: {item.sugar}g</Paragraph>
                            </YStack>
                            <Button size="$3" icon={Plus} circular theme="green" />
                        </XStack>
                    </Card>
                ))}
                {loading && <Text ta="center">Searching online database...</Text>}
            </ScrollView>
        </YStack>
    )
}
