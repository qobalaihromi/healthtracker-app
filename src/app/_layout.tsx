import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { TamaguiProvider, Theme } from 'tamagui'
import config from '../../tamagui.config'
import { MigrationProvider } from '../components/MigrationProvider'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    const [loaded] = useFonts({
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    })

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync()
        }
    }, [loaded])

    if (!loaded) return null

    return (
        <TamaguiProvider config={config}>

            <Theme name="light">
                <MigrationProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </MigrationProvider>
            </Theme>
        </TamaguiProvider>
    )
}
