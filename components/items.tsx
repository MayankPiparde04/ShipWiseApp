import { useAppTheme } from '@/hooks/useAppTheme';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ItemsScreen() {
  const theme = useAppTheme();
  
  return (
    <SafeAreaView className={`flex-1 ${theme.bg}`}>
      <View className="flex-1 p-6">
        <Text className={`text-2xl font-bold ${theme.text} mb-4`}>
          Items Management
        </Text>
        <Text className={theme.textSecondary}>
          Manage your inventory items here
        </Text>
      </View>
    </SafeAreaView>
  );
}
