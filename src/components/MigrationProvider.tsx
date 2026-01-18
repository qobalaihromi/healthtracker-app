import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '../db/client';
import migrations from '../../drizzle/migrations';
import { View, Text, ActivityIndicator } from 'react-native';
import { YStack, Paragraph } from 'tamagui';

export function MigrationProvider({ children }: { children: React.ReactNode }) {
    const { success, error } = useMigrations(db, migrations);

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: 'red', fontSize: 16 }}>Migration Error: {error.message}</Text>
            </View>
        );
    }

    if (!success) {
        return (
            <YStack f={1} ai="center" jc="center">
                <ActivityIndicator size="large" color="#0000ff" />
                <Paragraph mt="$4">Initializing Database...</Paragraph>
            </YStack>
        );
    }

    return <>{children}</>;
}
