import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { ActivityIndicator, Button, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<any>(null);
  
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();

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

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        // Ensure we properly access the takePicture method with the correct API
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8, // Reduce quality slightly to avoid memory issues
          skipProcessing: true, // Skip additional processing that might cause errors
        });
        setCapturedImages(prevImages => [...prevImages, photo.uri]);
      } catch (error) {
        console.error("Failed to take picture:", error);
        // Alert user about the error
        alert("Failed to capture image. Please try again.");
      }
    } else {
      console.log("Camera ref is not ready or camera is not ready yet");
    }
  };

  const pickImage = async () => {
    if (!galleryPermission?.granted) {
      await requestGalleryPermission();
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setCapturedImages(prevImages => [...prevImages, result.assets[0].uri]);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Camera View - 80% of height */}
      <View className="h-[80%]">
        {!isCameraReady && (
          <View className="absolute inset-0 z-10 flex items-center justify-center bg-black">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-white mt-2">Initializing camera...</Text>
          </View>
        )}
        
        <CameraView 
          ref={cameraRef}
          className="flex-1 bg-black" 
          facing={facing}
          onCameraReady={onCameraReady}
          style={{ height: '100%', width: '100%' }}
        />
      </View>
      
      {/* Controls and features section - 20% of height */}
      <View className="h-[20%] bg-gray-900">
        {/* Camera controls */}
        <View className="flex-1 flex-row justify-around items-center px-4 pt-2">
          <TouchableOpacity 
            className="w-14 h-14 rounded-full bg-gray-600/80 justify-center items-center" 
            onPress={toggleCameraFacing}
          >
            <Text className="text-white text-lg">Flip</Text>
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
            <Text className="text-white text-lg">Gallery</Text>
          </TouchableOpacity>
        </View>
        
        {/* Image preview scrollview */}
        {capturedImages.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="px-2 pb-2"
          >
            {capturedImages.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                className="w-16 h-16 rounded-md mx-1"
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
