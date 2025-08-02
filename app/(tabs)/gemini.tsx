// backup 1

import { Ionicons } from '@expo/vector-icons'; // Added icons import
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Button, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<any>(null);
  
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [viewMode, setViewMode] = useState<'capture' | 'review'>('capture');
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [cameraKey, setCameraKey] = useState(1); // Add key to force re-render camera when needed
  const router = useRouter();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-center mb-3 text-lg">We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Handle camera ready state
  const onCameraReady = () => {
    console.log("Camera is ready");
    setCameraReady(true);
  };
  
  // Define the missing onCameraError function
  const onCameraError = (error: any) => {
    console.error("Camera error:", error);
    setCameraReady(false);
    // Try to reinitialize camera once instead of continuous resets
    if (cameraKey === 1) {
      setCameraKey(2);
    }
  };

  // Alternative capture method in case the primary one fails
  const captureWithBackup = async () => {
    try {
      // First try the standard method
      if (cameraRef.current && isCameraReady) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          skipProcessing: true,
        });
        return photo;
      }
      throw new Error("Camera not ready");
    } catch (error) {
      console.warn("Primary capture failed, trying backup method");
      throw error; // Let the main handler deal with it
    }
  };

  const takePicture = async () => {
    console.log("Attempting to take picture");
    
    // Only proceed if camera ready flag is true
    if (!isCameraReady) {
      alert("Camera is still initializing. Please wait.");
      return;
    }
    
    try {
      console.log("Camera ref exists and is ready");
      // Try the capture with possible fallbacks
      const photo = await captureWithBackup();
      
      console.log("Picture taken successfully:", photo.uri);
      const newIndex = capturedImages.length;
      setCapturedImages(prevImages => [...prevImages, photo.uri]);
      setCurrentImageIndex(newIndex);
      setViewMode('review');
    } catch (error) {
      console.error("Failed to take picture:", error);
      alert("Failed to capture image. Would you like to select from gallery instead?");
      
      // Instead of confirm which might not work well on mobile,
      // directly offer gallery as an option
      pickImage();
    }
  };

  const pickImage = async () => {
    try {
      // Always request permission before trying to access the gallery
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed: Using MediaTypeOptions instead of MediaType
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log("Gallery result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUri = result.assets[0].uri;
        console.log("Selected image from gallery:", newImageUri);
        
        // Add the selected image and immediately show it
        const newIndex = capturedImages.length;
        setCapturedImages(prevImages => [...prevImages, newImageUri]);
        setCurrentImageIndex(newIndex);
        setViewMode('review');
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
      alert("There was a problem accessing your gallery. Please try again.");
    }
  };

  // Function to accept the image and proceed to analysis
  const acceptImage = () => {
    if (currentImageIndex !== null && capturedImages[currentImageIndex]) {
      // Navigate to analysis page with the selected image
      const imageUri = capturedImages[currentImageIndex];
      console.log("Navigating to analysis with image:", imageUri);
      
      router.push({
        pathname: '/analysis',
        params: { imageUri }
      });
    } else {
      console.error("No image selected or image URI is invalid");
      alert("There was a problem with the selected image. Please try again.");
    }
  };

  // Function to reject the current image
  const rejectImage = () => {
    if (currentImageIndex !== null) {
      // Remove the current image from the array
      setCapturedImages(prevImages => 
        prevImages.filter((_, index) => index !== currentImageIndex)
      );
      
      // Return to capture mode if no images left, otherwise show the last image
      if (capturedImages.length <= 1) {
        setViewMode('capture');
        setCurrentImageIndex(null);
      } else {
        setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
      }
    }
  };

  // Return to capture mode
  const backToCapture = () => {
    setViewMode('capture');
    // Don't reset camera when going back to capture mode
    // This prevents the continuous reinitialization issue
    
    // Add a slight delay to ensure UI updates properly
    setTimeout(() => {
      console.log("Back to capture mode");
    }, 100);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Camera or Review View - 85% of height */}
      <View className="h-[85%]">
        {viewMode === 'capture' ? (
          // Camera capture view
          <View className="flex-1">
            {!isCameraReady && (
              <View className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white mt-2">Initializing camera...</Text>
              </View>
            )}
            
            <CameraView 
              key={cameraKey}
              ref={cameraRef}
              className="flex-1" 
              facing={facing}
              onCameraReady={onCameraReady}
              onMountError={onCameraError}
              style={{
                width: '100%',
                height: '100%'
              }}
            />
          </View>
        ) : (
          // Image review view
          <View className="flex-1 bg-black justify-center items-center">
            {currentImageIndex !== null && capturedImages[currentImageIndex] ? (
              <>
                <Image
                  source={{ uri: capturedImages[currentImageIndex] }}
                  className="w-full h-full"
                  resizeMode="contain"
                  onError={(e) => console.error("Image loading error:", e.nativeEvent.error)}
                />
                <View className="absolute bottom-4 left-4 z-10">
                  <TouchableOpacity 
                    className="bg-gray-800/70 p-3 rounded-full"
                    onPress={backToCapture}
                  >
                    <Ionicons name="arrow-back" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-white text-lg">No image available</Text>
                <TouchableOpacity 
                  className="mt-4 bg-blue-500 p-3 rounded-lg"
                  onPress={backToCapture}
                >
                  <Text className="text-white">Back to Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Controls section - 15% of height */}
      <View className="h-[15%] bg-gray-900">
        {viewMode === 'capture' ? (
          // Camera controls for capture mode
          <View className="flex-1 flex-row justify-around items-center px-4 pt-2">
            <TouchableOpacity 
              className="w-14 h-14 rounded-full bg-gray-600/80 justify-center items-center" 
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 justify-center items-center" 
              onPress={takePicture}
            >
              <View className="w-12 h-12 rounded-full bg-white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-14 h-14 rounded-full bg-gray-600/80 justify-center items-center" 
              onPress={pickImage}
            >
              <Ionicons name="images" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          // Accept/Reject controls for review mode
          <View className="flex-1 flex-row justify-around items-center px-4">
            <TouchableOpacity 
              className="w-16 h-16 rounded-full bg-red-500 justify-center items-center" 
              onPress={rejectImage}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-16 h-16 rounded-full bg-green-500 justify-center items-center" 
              onPress={acceptImage}
            >
              <Ionicons name="checkmark" size={30} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Image preview section - only show in capture mode */}
        {viewMode === 'capture' && capturedImages.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="px-2 pb-2"
          >
            {capturedImages.map((image, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => {
                  setCurrentImageIndex(index);
                  setViewMode('review');
                }}
              >
                <Image
                  source={{ uri: image }}
                  className="w-16 h-16 rounded-md mx-1"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
