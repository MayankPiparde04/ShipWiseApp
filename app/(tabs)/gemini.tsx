// backup 2

import { useInventory } from "@/contexts/InventoryContext";
import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<any>(null);

  const [galleryPermission, requestGalleryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [viewMode, setViewMode] = useState<"capture" | "review">("capture");
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(
    null
  );
  const [cameraKey, setCameraKey] = useState(1); // Add key to force re-render camera when needed
  const router = useRouter();
  const { predictItemDimensions } = useInventory();
  const [isPredicting, setIsPredicting] = useState(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-center mb-3 text-lg">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
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
      setCapturedImages((prevImages) => [...prevImages, photo.uri]);
      setCurrentImageIndex(newIndex);
      setViewMode("review");
    } catch (error) {
      console.error("Failed to take picture:", error);
      alert(
        "Failed to capture image. Would you like to select from gallery instead?"
      );

      // Instead of confirm which might not work well on mobile,
      // directly offer gallery as an option
      pickImage();
    }
  };

  const pickImage = async () => {
    try {
      // Always request permission before trying to access the gallery
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
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
        setCapturedImages((prevImages) => [...prevImages, newImageUri]);
        setCurrentImageIndex(newIndex);
        setViewMode("review");
      }
    } catch (error) {
      console.error("Error picking image from gallery:", error);
      alert("There was a problem accessing your gallery. Please try again.");
    }
  };

  // Function to accept the image and proceed to analysis
  const acceptImage = async () => {
    if (currentImageIndex !== null && capturedImages[currentImageIndex]) {
      const imageUri = capturedImages[currentImageIndex];
      setIsPredicting(true);
      try {
        // Provide default values for better prediction accuracy
        const prediction = await predictItemDimensions(
          imageUri,
          'coin', // Default reference object
          'cm',   // Default unit
          'Product for shipping dimension analysis' // Default context
        );
        setIsPredicting(false);

        if (
          prediction &&
          prediction.success &&
          prediction.data &&
          prediction.data.prediction
        ) {
          // Redirect to inventory with pre-filled data
          router.replace({
            pathname: "/(tabs)/inventory",
            params: {
              prefill: JSON.stringify(prediction.data.prediction),
            },
          });
        } else {
          Alert.alert(
            "Prediction Failed",
            prediction?.message || "Unable to analyze the image. Please try with a clearer image or different lighting."
          );
        }
      } catch (error: any) {
        setIsPredicting(false);
        console.error('Prediction error in component:', error);
        
        Alert.alert(
          "AI Analysis Error", 
          error?.message || "Failed to analyze the image. Please check your connection and try again.",
          [
            { text: "Retry", onPress: () => acceptImage() },
            { text: "Cancel", style: "cancel" }
          ]
        );
      }
    } else {
      Alert.alert(
        "No Image Selected",
        "Please capture or select an image before proceeding."
      );
    }
  };

  // Function to reject the current image
  const rejectImage = () => {
    if (currentImageIndex !== null) {
      // Remove the current image from the array
      setCapturedImages((prevImages) =>
        prevImages.filter((_, index) => index !== currentImageIndex)
      );

      // Return to capture mode if no images left, otherwise show the last image
      if (capturedImages.length <= 1) {
        setViewMode("capture");
        setCurrentImageIndex(null);
      } else {
        setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
      }
    }
  };

  // Return to capture mode
  const backToCapture = () => {
    setViewMode("capture");
    // Don't reset camera when going back to capture mode
    // This prevents the continuous reinitialization issue

    // Add a slight delay to ensure UI updates properly
    setTimeout(() => {
      console.log("Back to capture mode");
    }, 100);
  };

  return (
    <View className="flex-1 bg-black">
      {isPredicting && (
        <View className="absolute inset-0 z-50 bg-black/80 justify-center items-center">
          <ActivityIndicator size="large" color="#22d3ee" />
          <Text className="text-white mt-4 text-lg">
            Predicting item dimensions...
          </Text>
        </View>
      )}
      {/* Camera or Review View - 80% of height */}
      <View className="h-[80%]">
        {viewMode === "capture" ? (
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
                width: "100%",
                height: "100%",
              }}
            />
          </View>
        ) : (
          // Image review view - improved layout
          <View className="flex-1 bg-black justify-center items-center relative">
            {currentImageIndex !== null && capturedImages[currentImageIndex] ? (
              <>
                <Image
                  source={{ uri: capturedImages[currentImageIndex] }}
                  className="w-full h-full"
                  resizeMode="contain"
                  onError={(e) =>
                    console.error("Image loading error:", e.nativeEvent.error)
                  }
                />
                {/* Positioned back button for better visibility */}
                <View className="absolute bottom-4 left-4 z-10">
                  <TouchableOpacity
                    className="bg-gray-800/80 p-3 rounded-full shadow-lg"
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
                  className="mt-4 bg-blue-600 px-6 py-3 rounded-lg shadow-lg"
                  onPress={backToCapture}
                >
                  <Text className="text-white font-medium">Back to Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Controls section - 20% of height */}
      <View className="h-[20%] bg-gray-900 pt-2">
        {viewMode === "capture" ? (
          // Camera controls for capture mode - improved alignment
          <View className="flex-row justify-around items-center px-4 py-3">
            <TouchableOpacity
              className="w-14 h-14 rounded-full bg-gray-700/90 justify-center items-center shadow-md"
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 justify-center items-center shadow-lg"
              onPress={takePicture}
            >
              <View className="w-16 h-16 rounded-full bg-white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-14 h-14 rounded-full bg-gray-700/90 justify-center items-center shadow-md"
              onPress={pickImage}
            >
              <Ionicons name="images" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          // Accept/Reject controls for review mode - better spacing and size
          <View className="flex-1 flex-row justify-center items-center px-4 gap-10">
            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-red-600 justify-center items-center shadow-lg"
              onPress={rejectImage}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-green-600 justify-center items-center shadow-lg"
              onPress={acceptImage}
            >
              <Ionicons name="checkmark" size={30} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Image preview section - only show in capture mode */}
        {viewMode === "capture" && capturedImages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 pb-4 pt-1"
          >
            {capturedImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setCurrentImageIndex(index);
                  setViewMode("review");
                }}
                className="mr-2 border-2 border-transparent active:border-blue-500 rounded-md"
              >
                <Image
                  source={{ uri: image }}
                  className="w-16 h-16 rounded-md"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
