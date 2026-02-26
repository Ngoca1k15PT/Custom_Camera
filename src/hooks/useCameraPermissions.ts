import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Camera } from 'react-native-vision-camera';

export function useCameraPermissions() {
    const [hasPermission, setHasPermission] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        checkPermission();
    }, []);

    const checkPermission = async () => {
        const status = await Camera.getCameraPermissionStatus();
        setHasPermission(status === 'granted');
    };

    const requestPermission = async () => {
        setIsRequesting(true);
        try {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
            return status === 'granted';
        } finally {
            setIsRequesting(false);
        }
    };

    return {
        hasPermission,
        isRequesting,
        requestPermission,
        checkPermission,
    };
}
