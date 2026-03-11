import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Rect, Line, G } from 'react-native-svg';

const arrowIcon = require('../assets/arrow_icon.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Frame dimensions - landscape oriented for bicycle
const FRAME_WIDTH = SCREEN_WIDTH * 0.8;
const FRAME_HEIGHT = SCREEN_HEIGHT * 0.65;

// Export frame coordinates for cropping
export const getFrameDimensions = () => {
    const frameX = (SCREEN_WIDTH - FRAME_WIDTH) / 2;
    const frameY = 40;

    return {
        x: frameX,
        y: frameY,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        screenWidth: SCREEN_WIDTH,
        screenHeight: SCREEN_HEIGHT,
    };
};

interface BikeFrameOverlayProps {
    overlayOpacity?: Animated.Value;
}

export const BikeFrameOverlay: React.FC<BikeFrameOverlayProps> = ({ overlayOpacity }) => {
    const frameX = (SCREEN_WIDTH - FRAME_WIDTH) / 2;
    const frameY = 120;

    // Center of the frame
    const centerX = SCREEN_WIDTH / 2;
    const centerY = frameY + FRAME_HEIGHT / 2;

    return (
        <View style={styles.container} pointerEvents="none">
            <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
                {/* Semi-transparent overlay outside the frame */}
                <G>
                    {/* Top overlay */}
                    <Rect
                        x={0}
                        y={0}
                        width={SCREEN_WIDTH}
                        height={frameY}
                        fill="rgba(0, 0, 0, 0.6)"
                    />
                    {/* Left overlay */}
                    <Rect
                        x={0}
                        y={frameY}
                        width={frameX}
                        height={FRAME_HEIGHT}
                        fill="rgba(0, 0, 0, 0.6)"
                    />
                    {/* Right overlay */}
                    <Rect
                        x={frameX + FRAME_WIDTH}
                        y={frameY}
                        width={frameX}
                        height={FRAME_HEIGHT}
                        fill="rgba(0, 0, 0, 0.6)"
                    />
                    {/* Bottom overlay */}
                    <Rect
                        x={0}
                        y={frameY + FRAME_HEIGHT}
                        width={SCREEN_WIDTH}
                        height={SCREEN_HEIGHT}
                        fill="rgba(0, 0, 0, 0.6)"
                    />
                </G>

                {/* Yellow frame border with rounded corners */}
                <Rect
                    x={frameX}
                    y={frameY}
                    width={FRAME_WIDTH}
                    height={FRAME_HEIGHT}
                    rx={16}
                    ry={16}
                    stroke="#FFD700"
                    strokeWidth={4}
                    fill="none"
                />

                {/* Green dashed center guidelines */}
                <G stroke="#00CC00" strokeWidth={3} fill="none" opacity={0.8}>
                    {/* Vertical center line */}
                    <Line
                        x1={centerX}
                        y1={frameY + 10}
                        x2={centerX}
                        y2={frameY + FRAME_HEIGHT - 10}
                        strokeDasharray="12, 8"
                    />
                    {/* Horizontal center line */}
                    <Line
                        x1={frameX + 10}
                        y1={centerY}
                        x2={frameX + FRAME_WIDTH - 10}
                        y2={centerY}
                        strokeDasharray="12, 8"
                    />
                </G>
            </Svg>

            {/* Labels and arrows - animated with bike overlay */}
            <Animated.View style={[styles.labelsContainer, overlayOpacity ? { opacity: overlayOpacity } : {}]}>
                {/* Top label: ハンドル側 */}
                <View style={[styles.labelRow, { top: frameY + 12 }]}>
                    <Text style={styles.labelText}>ハンドル側</Text>
                </View>

                {/* Top arrow icon - smaller, pointing to top label */}
                <Image
                    source={arrowIcon}
                    style={[
                        styles.arrowImageSmall,
                        {
                            top: frameY + 30,
                            left: centerX + 55,
                            transform: [{ rotate: '40deg' }, { scaleX: -1 }],
                        },
                    ]}
                    resizeMode="contain"
                />

                {/* Middle label: 自転車を中心に */}
                <View style={[styles.labelRow, { top: centerY + 15 }]}>
                    <Text style={styles.labelText}>自転車を中心に</Text>
                </View>

                {/* Middle arrow icon - pointing to intersection of guidelines */}
                <Image
                    source={arrowIcon}
                    style={[
                        styles.arrowImage,
                        {
                            top: centerY - 55,
                            left: centerX - 5,
                            transform: [{ rotate: '135deg' }],
                        },
                    ]}
                    resizeMode="contain"
                />

                {/* Bottom label: 後輪側 */}
                <View style={[styles.labelRow, { top: frameY + FRAME_HEIGHT - 55 }]}>
                    <Text style={styles.labelText}>後輪側</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    labelsContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    labelRow: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    labelText: {
        backgroundColor: 'rgba(50, 50, 50, 0.8)',
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        overflow: 'hidden',
    },
    arrowImage: {
        position: 'absolute',
        width: 45,
        height: 45,
    },
    arrowImageSmall: {
        position: 'absolute',
        width: 40,
        height: 40,
    },
});
