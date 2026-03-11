import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    GestureResponderEvent,
    Dimensions,
    PanResponder,
    Animated,
    Easing,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { bikeSvgXml } from '../assets/bikeSvg';

// Arrow icon
const arrowIcon = require('../assets/arrow_icon.png');
import {
    Camera,
    useCameraDevice,
    useCodeScanner,
} from 'react-native-vision-camera';
import { useCameraPermissions } from '../hooks/useCameraPermissions';
import { BikeFrameOverlay, getFrameDimensions } from './BikeFrameOverlay';
import { cropImageToFrame } from '../utils/cropImage';

// Frame dimensions matching BikeFrameOverlay
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const FRAME_WIDTH = SCREEN_WIDTH * 0.8;
const FRAME_HEIGHT = SCREEN_HEIGHT * 0.65;

export const CameraScreen: React.FC = () => {
    const camera = useRef<Camera>(null);
    const device = useCameraDevice('back');
    const { hasPermission, isRequesting, requestPermission } = useCameraPermissions();
    const [photo, setPhoto] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [zoom, setZoom] = useState(1);
    const lastPinchDistance = useRef<number | null>(null);
    const lastZoom = useRef(0.5);

    // Phase 1: Bike blinks 3s → Phase 2: Bike solid + arrow blinks 3s → Phase 3: both fade out
    const bikeOpacity = useRef(new Animated.Value(0)).current;
    const arrowOpacity = useRef(new Animated.Value(0)).current;
    const [overlayVisible, setOverlayVisible] = useState(true);

    useEffect(() => {
        // --- Phase 1: Bike SVG blinks for 3 seconds ---
        const bikeBlinkLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(bikeOpacity, {
                    toValue: 0.55,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bikeOpacity, {
                    toValue: 0.1,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );
        bikeBlinkLoop.start();

        // --- Phase 2: After 3s, stop bike blink → bike solid, arrow blinks ---
        const phase2Timer = setTimeout(() => {
            bikeBlinkLoop.stop();
            // Bike stays solid
            Animated.timing(bikeOpacity, {
                toValue: 0.45,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Arrow blinks for 3 seconds
            const arrowBlinkLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(arrowOpacity, {
                        toValue: 0.9,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(arrowOpacity, {
                        toValue: 0.15,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            );
            arrowBlinkLoop.start();

            // --- Phase 3: After another 3s, fade out both and hide ---
            const phase3Timer = setTimeout(() => {
                arrowBlinkLoop.stop();
                Animated.parallel([
                    Animated.timing(bikeOpacity, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(arrowOpacity, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setOverlayVisible(false);
                });
            }, 3000);

            cleanupPhase3 = phase3Timer;
        }, 3000);

        let cleanupPhase3: ReturnType<typeof setTimeout> | null = null;

        return () => {
            clearTimeout(phase2Timer);
            if (cleanupPhase3) clearTimeout(cleanupPhase3);
            bikeBlinkLoop.stop();
        };
    }, [bikeOpacity, arrowOpacity]);

    const minZoom = 0.5;
    const maxZoom = device?.maxZoom ?? 10;

    // Calculate distance between two touch points
    const getDistance = (touches: GestureResponderEvent['nativeEvent']['touches']) => {
        if (touches.length < 2) return 0;
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = useCallback((event: GestureResponderEvent) => {
        const { touches } = event.nativeEvent;
        if (touches.length === 2) {
            lastPinchDistance.current = getDistance(touches);
            lastZoom.current = zoom;
        }
    }, [zoom]);

    const handleTouchMove = useCallback((event: GestureResponderEvent) => {
        const { touches } = event.nativeEvent;
        if (touches.length === 2 && lastPinchDistance.current !== null) {
            const currentDistance = getDistance(touches);
            const scale = currentDistance / lastPinchDistance.current;
            const newZoom = Math.min(Math.max(lastZoom.current * scale, minZoom), maxZoom);
            setZoom(newZoom);
        }
    }, [maxZoom]);

    const handleTouchEnd = useCallback(() => {
        lastPinchDistance.current = null;
    }, []);

    // Zoom slider - using refs so PanResponder always has current values
    const sliderLayoutX = useRef(0);
    const sliderLayoutWidth = useRef(0);
    const maxZoomRef = useRef(maxZoom);
    maxZoomRef.current = maxZoom;

    const onSliderLayout = useCallback((event: any) => {
        const { x, width } = event.nativeEvent.layout;
        sliderLayoutWidth.current = width;
        // Use pageX from measure for absolute position
        event.target?.measure?.((_x: number, _y: number, _w: number, _h: number, pageX: number) => {
            sliderLayoutX.current = pageX;
        });
    }, []);

    const zoomSliderPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: (evt) => {
                // Calculate zoom from initial touch position
                const touchX = evt.nativeEvent.pageX;
                const relativeX = touchX - sliderLayoutX.current;
                const w = sliderLayoutWidth.current;
                if (w > 0) {
                    const fraction = Math.max(0, Math.min(relativeX / w, 1));
                    const newZoom = 0.5 + fraction * (maxZoomRef.current - 1);
                    setZoom(newZoom);
                }
            },
            onPanResponderMove: (evt) => {
                const touchX = evt.nativeEvent.pageX;
                const relativeX = touchX - sliderLayoutX.current;
                const w = sliderLayoutWidth.current;
                if (w > 0) {
                    const fraction = Math.max(0, Math.min(relativeX / w, 1));
                    const newZoom = 0.5 + fraction * (maxZoomRef.current - 1);
                    setZoom(newZoom);
                }
            },
        })
    ).current;

    const zoomFraction = (zoom - minZoom) / (maxZoom - minZoom);

    const handleTakePhoto = useCallback(async () => {
        if (!camera.current) return;

        try {
            setIsCapturing(true);
            const capturedPhoto = await camera.current.takePhoto({
                flash: 'off',
                enableShutterSound: true,
            });

            const photoUri = `file://${capturedPhoto.path}`;
            console.log('📷 Photo captured:', photoUri);

            try {
                // Get frame dimensions for cropping
                const frameDimensions = getFrameDimensions();
                console.log('🖼️ Frame dimensions:', frameDimensions);

                // Crop the image to match the frame overlay
                const croppedImageUri = await cropImageToFrame(
                    photoUri,
                    frameDimensions
                );

                console.log('✅ Setting cropped photo');
                setPhoto(croppedImageUri);
            } catch (cropError) {
                console.error('❌ Crop failed, using original photo:', cropError);
                Alert.alert(
                    'Thông báo',
                    'Không thể crop ảnh. Đang hiển thị ảnh gốc.',
                    [{ text: 'OK' }]
                );
                setPhoto(photoUri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
        } finally {
            setIsCapturing(false);
        }
    }, []);

    const handleRetake = useCallback(() => {
        setPhoto(null);
    }, []);

    const handleUsPhoto = useCallback(() => {
        Alert.alert(
            'Ảnh đã chụp',
            'Ảnh đã được lưu thành công!',
            [
                {
                    text: 'OK',
                    onPress: () => setPhoto(null),
                },
            ]
        );
    }, []);

    // Loading state
    if (!device) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#00FF00" />
                <Text style={styles.errorText}>Đang tải camera...</Text>
            </View>
        );
    }

    // Permission denied
    if (!hasPermission) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>
                    Ứng dụng cần quyền truy cập camera
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                    disabled={isRequesting}
                >
                    <Text style={styles.permissionButtonText}>
                        {isRequesting ? 'Đang yêu cầu...' : 'Cấp quyền Camera'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Photo preview
    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo }} style={styles.previewImage} />
                <View style={styles.previewActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleRetake}>
                        <Text style={styles.actionButtonText}>Chụp lại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.usePhotoButton]}
                        onPress={handleUsPhoto}
                    >
                        <Text style={styles.actionButtonText}>Sử dụng ảnh</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Camera view
    return (
        <View
            style={styles.container}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
                zoom={zoom}
            />

            <BikeFrameOverlay overlayOpacity={bikeOpacity} />

            {/* SVG overlay + arrow: bike blinks 3s → bike solid + arrow blinks 3s → both hide */}


            {/* Instruction text - above frame */}
            <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                    自転車をガイドフレーム内に置いてください。
                </Text>
            </View>

            {/* Zoom indicator */}
            {/* {zoom > 0.5 && (
                <View style={styles.zoomIndicator}>
                    <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
                </View>
            )} */}

            {/* Zoom slider bar - horizontal, below frame */}
            <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>0.5x</Text>
                <View
                    onLayout={onSliderLayout}
                    style={styles.sliderTrack}
                    {...zoomSliderPanResponder.panHandlers}
                >
                    <View
                        style={[
                            styles.sliderFill,
                            { width: `${zoomFraction * 100}%` },
                        ]}
                    />
                    <View
                        style={[
                            styles.sliderThumb,
                            { left: `${zoomFraction * 100}%` },
                        ]}
                    />
                </View>
                <Text style={styles.sliderLabel}>{Math.round(maxZoom)}x</Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.captureButton, isCapturing && styles.capturingButton]}
                    onPress={handleTakePhoto}
                    disabled={isCapturing}
                >
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    errorText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    permissionButton: {
        backgroundColor: '#00FF00',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
    zoomIndicator: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    zoomText: {
        color: '#00FF00',
        fontSize: 16,
        fontWeight: '700',
    },
    sliderContainer: {
        position: 'absolute',
        bottom: 160,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    sliderTrack: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        marginHorizontal: 10,
        justifyContent: 'center',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: '#00FF00',
        borderRadius: 3,
        position: 'absolute',
        left: 0,
    },
    sliderThumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#00FF00',
        position: 'absolute',
        top: -8,
        marginLeft: -11,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 3,
    },
    sliderLabel: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 40,
        alignItems: 'center',
    },
    instructionContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    instructionText: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'white',
    },
    capturingButton: {
        opacity: 0.6,
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'white',
    },
    previewImage: {
        flex: 1,
        resizeMode: 'contain',
    },
    previewActions: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    actionButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'white',
    },
    usePhotoButton: {
        backgroundColor: '#00FF00',
        borderColor: '#00FF00',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    svgOverlayContainer: {
        position: 'absolute',
        top: 120,
        left: (SCREEN_WIDTH - FRAME_WIDTH) / 2,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIconContainer: {
        position: 'absolute',
        top: 120 + FRAME_HEIGHT / 2 - 30,
        left: (SCREEN_WIDTH / 2) + 10,
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scaleX: -1 }],
    },
    arrowIcon: {
        width: 80,
        height: 80,
    },
});
