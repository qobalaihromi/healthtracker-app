module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Required for Tamagui compiler (optional but recommended for performance)
            // [
            //   '@tamagui/babel-plugin',
            //   {
            //     components: ['tamagui'],
            //     config: './tamagui.config.ts',
            //     logTimings: true,
            //     disableExtraction: process.env.NODE_ENV === 'development',
            //   },
            // ],
            // Reanimated plugin if needed later
            // 'react-native-reanimated/plugin',
        ],
    };
};
