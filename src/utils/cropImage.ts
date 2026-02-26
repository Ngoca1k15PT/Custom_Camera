import ImageEditor from '@react-native-community/image-editor';
import { Image } from 'react-native';

interface FrameDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
    screenWidth: number;
    screenHeight: number;
}

/**
 * Crops an image based on the frame overlay dimensions
 * @param imageUri - The URI of the image to crop
 * @param frameDimensions - The dimensions of the frame overlay on the screen
 * @returns Promise with the URI of the cropped image
 */
export const cropImageToFrame = async (
    imageUri: string,
    frameDimensions: FrameDimensions
): Promise<string> => {
    try {
        console.log('📸 Starting crop process...');
        console.log('Image URI:', imageUri);
        console.log('Frame dimensions:', frameDimensions);

        // Get the actual image dimensions
        const imageSize = await getImageSize(imageUri);
        console.log('Image size:', imageSize);

        // Calculate aspect ratios
        const imageAspectRatio = imageSize.width / imageSize.height;
        const screenAspectRatio = frameDimensions.screenWidth / frameDimensions.screenHeight;
        console.log('Image aspect ratio:', imageAspectRatio);
        console.log('Screen aspect ratio:', screenAspectRatio);

        // Determine how the image is scaled to fit the screen
        // The camera preview typically uses "cover" scaling (fill the screen, may crop sides)
        let scale: number;
        let offsetX = 0;
        let offsetY = 0;

        if (imageAspectRatio > screenAspectRatio) {
            // Image is wider than screen - will be cropped horizontally
            scale = imageSize.height / frameDimensions.screenHeight;
            offsetX = (imageSize.width - frameDimensions.screenWidth * scale) / 2;
            console.log('Image wider than screen, horizontal crop');
        } else {
            // Image is taller than screen - will be cropped vertically
            scale = imageSize.width / frameDimensions.screenWidth;
            offsetY = (imageSize.height - frameDimensions.screenHeight * scale) / 2;
            console.log('Image taller than screen, vertical crop');
        }

        console.log('Scale factor:', scale);
        console.log('Offset X:', offsetX, 'Offset Y:', offsetY);

        // Convert screen coordinates to image coordinates
        const cropData = {
            offset: {
                x: Math.round(frameDimensions.x * scale + offsetX),
                y: Math.round(frameDimensions.y * scale + offsetY),
            },
            size: {
                width: Math.round(frameDimensions.width * scale),
                height: Math.round(frameDimensions.height * scale),
            },
        };
        console.log('Crop data:', cropData);

        // Perform the crop
        const croppedImage = await ImageEditor.cropImage(imageUri, cropData);
        console.log('✅ Crop successful! URI:', croppedImage.uri);

        return croppedImage.uri;
    } catch (error) {
        console.error('❌ Error cropping image:', error);
        throw error;
    }
};

/**
 * Gets the dimensions of an image
 * @param uri - The URI of the image
 * @returns Promise with width and height of the image
 */
const getImageSize = (uri: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        Image.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            (error) => reject(error)
        );
    });
};
