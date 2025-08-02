import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";

export default function ProfileScreen() {
  const { user, logout, updateUserContext } = useAuth();
  const { height } = useWindowDimensions();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    address: user?.address || ''
  });

  // Update editedUser when user data changes
  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        address: user.address || ''
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
        address: editedUser.address
      });
      
      if (response.success) {
        // Update context with new user data
        updateUserContext({
          ...user,
          ...editedUser
        });
        
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Render profile fields - either as text or input
  const renderField = (icon: string, label: string, value: string | undefined, key: string) => {
    return (
      <View className="mb-4">
        <Text className="text-gray-400 text-xs mb-1 flex-row items-center">
          <Ionicons name={icon as any} size={14} color="#9ca3af" /> {' '}
          {label}
        </Text>
        
        {isEditing && key !== 'email' ? (
          <TextInput
            className="bg-gray-800 text-white p-3 rounded-lg border border-gray-700"
            value={editedUser[key as keyof typeof editedUser]}
            onChangeText={(text) => setEditedUser({...editedUser, [key]: text})}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor="#6b7280"
          />
        ) : (
          <Text className="text-gray-200 ml-5">{value || `No ${label.toLowerCase()} provided`}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <StatusBar style="light" />
      <ScrollView className="flex-1">
        {/* Header with avatar */}
        <View 
          style={{ height: height * 0.25 }}
          className="bg-indigo-900 px-6 pt-6 pb-12 items-center justify-center"
        >
          <View className="items-center">
            {user?.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                className="w-24 h-24 rounded-full border-4 border-gray-950" 
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-gray-800 items-center justify-center">
                <Text className="text-3xl font-semibold text-blue-400">
                  {getInitials(user?.name)}
                </Text>
              </View>
            )}
            
            <Text className="text-xl font-bold text-white mt-3">
              {user?.name || 'User'}
            </Text>
            
            {!isEditing && (
              <TouchableOpacity 
                className="mt-2 bg-white/20 px-4 py-2 rounded-full flex-row items-center"
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text className="ml-1 text-white">Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View className="px-6 pt-6 pb-10">
          {/* Profile Information Card */}
          <View className="bg-gray-900 rounded-xl shadow-md p-5 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-blue-900/30 items-center justify-center">
                  <Ionicons name="person" size={18} color="#60a5fa" />
                </View>
                <Text className="text-lg font-semibold text-white ml-2">Personal Information</Text>
              </View>
              
              {isEditing && (
                <View className="flex-row">
                  <TouchableOpacity 
                    className="mr-2 bg-gray-800 p-2 rounded-lg"
                    onPress={() => setIsEditing(false)}
                  >
                    <Ionicons name="close" size={18} color="#e5e7eb" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="bg-blue-600 p-2 rounded-lg"
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
            
            {renderField('person-outline', 'Full Name', user?.name, 'name')}
            {renderField('mail-outline', 'Email', user?.email, 'email')}
            {renderField('call-outline', 'Phone', user?.phone, 'phone')}
            {renderField('business-outline', 'Company', user?.company, 'company')}
            {renderField('location-outline', 'Address', user?.address, 'address')}
          </View>
          
          {/* Simplified Logout Button */}
          <TouchableOpacity
            className="bg-red-600 p-4 rounded-lg shadow-sm mb-6"
            onPress={logout}
          >
            <View className="flex-row justify-center items-center">
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text className="text-white text-center font-semibold ml-2">Logout</Text>
            </View>
          </TouchableOpacity>
          
          <Text className="text-gray-500 text-xs text-center">
            ShipWise App v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}