import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, logout, updateUserContext } = useAuth();
  const { height } = useWindowDimensions();

  // Theme integration
  const theme = useAppTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
    address: user?.address || "",
  });

  // Update editedUser when user data changes
  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        company: user.company || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Call API to update user data
      const response = await apiService.updateUserProfile({
        name: editedUser.name,
        phone: editedUser.phone,
        company: editedUser.company,
        address: editedUser.address,
      });

      if (response.success) {
        // Only update context with the new user data, do not pass the whole user object
        await updateUserContext({
          name: editedUser.name,
          phone: editedUser.phone,
          company: editedUser.company,
          address: editedUser.address,
        });

        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully");
      } else {
        Alert.alert("Error", response.message || "Failed to update profile");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Utility to mask email and phone for privacy
  const maskEmail = (email: string | undefined) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (!name || !domain) return "****";
    return name[0] + "****@" + domain;
  };

  const maskPhone = (phone: string | undefined) => {
    if (!phone) return "";
    if (phone.length <= 4) return "****";
    return phone.slice(0, 2) + "****" + phone.slice(-2);
  };

  // Render profile fields - either as text or input
  const renderField = (
    icon: string,
    label: string,
    value: string | undefined,
    key: string
  ) => {
    let displayValue = value;
    if (!isEditing) {
      if (key === "email") displayValue = maskEmail(value);
      if (key === "phone") displayValue = maskPhone(value);
    }
    return (
      <View className="mb-4">
        <Text className={`${theme.textMuted} text-xs mb-1 flex-row items-center`}>
          <Ionicons name={icon as any} size={14} color={theme.textMuted} /> {label}
        </Text>

        {isEditing && key !== "email" ? (
          <TextInput
            className={`${theme.cardBg} ${theme.text} p-3 rounded-lg ${theme.border} border`}
            value={editedUser[key as keyof typeof editedUser]}
            onChangeText={(text) =>
              setEditedUser({ ...editedUser, [key]: text })
            }
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor={theme.textMuted}
          />
        ) : (
          <Text className={`${theme.textSecondary} ml-5`}>
            {displayValue || `No ${label.toLowerCase()} provided`}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${theme.bg}`}>
      <StatusBar style="light" translucent={true} />
      <ScrollView className="flex-1">
        {/* Header with avatar */}
        <View
          style={{ height: height * 0.25 }}
          className={`${theme.cardBg} px-6 pt-6 pb-12 items-center justify-center`}
        >
          <View className="items-center">
            <View className={`w-24 h-24 rounded-full ${theme.cardBg} items-center justify-center border-2 border-blue-500`}>
              <Text className={`text-3xl font-semibold ${theme.accentText}`}>
                {getInitials(user?.name)}
              </Text>
            </View>
            <Text className={`text-xl font-bold ${theme.text} mt-3`}>
              {user?.name || "User"}
            </Text>

            {!isEditing && (
              <TouchableOpacity
                className={`mt-2 ${theme.accent} px-4 py-2 rounded-full flex-row items-center`}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text className="ml-1 text-white font-medium">Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="px-6 pt-6 pb-10">
          {/* Profile Information Card */}
          <View className={`${theme.cardBg} rounded-xl shadow-md p-5 mb-6 ${theme.border} border`}>
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                {/* <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center">
                  <Ionicons name="person" size={18} color="#ffffff" />
                </View> */}
                <Text className={`text-lg font-semibold ${theme.text} ml-2`}>
                  Personal Information
                </Text>
              </View>

              {isEditing && (
                <View className="flex-row space-x-2 gap-2">
                  <TouchableOpacity
                    className={`${theme.cardBg} p-2 rounded-lg ${theme.border} border`}
                    onPress={() => setIsEditing(false)}
                  >
                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`${theme.accent} p-2 rounded-lg`}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Ionicons name="checkmark" size={18} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {renderField("person-outline", "Full Name", user?.name, "name")}
            {renderField("mail-outline", "Email", user?.email, "email")}
            {renderField("call-outline", "Phone", user?.phone, "phone")}
            {renderField("business-outline", "Company", user?.company, "company")}
            {renderField("location-outline", "Address", user?.address, "address")}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="bg-red-600 p-4 rounded-lg shadow-sm mb-6 border border-red-500"
            onPress={logout}
          >
            <View className="flex-row justify-center items-center">
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text className="text-white text-center font-semibold ml-2">
                Logout
              </Text>
            </View>
          </TouchableOpacity>

          <Text className={`${theme.textMuted} text-xs text-center`}>
            ShipWise App v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}