import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, G, Polygon, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Frame dimensions - landscape oriented for bicycle
const FRAME_WIDTH = SCREEN_WIDTH * 0.8;
const FRAME_HEIGHT = SCREEN_HEIGHT * 0.65;
const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;

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

export const BikeFrameOverlay: React.FC = () => {
    const frameX = (SCREEN_WIDTH - FRAME_WIDTH) / 2;
    const frameY = 120;

    // Center of the frame
    const centerX = SCREEN_WIDTH / 2;
    const centerY = frameY + FRAME_HEIGHT / 2;

    // Arrow dimensions
    const arrowHeadSize = 12;
    const arrowOffset = 50; // offset from center line for left/right arrows

    return (
        <View style={styles.container} pointerEvents="none">
            <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
                <Defs>
                    <LinearGradient id="arrowGradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#00FF00" stopOpacity="0.9" />
                        <Stop offset="1" stopColor="#00CC00" stopOpacity="0.7" />
                    </LinearGradient>
                </Defs>

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

                {/* Corner guides */}
                <G stroke="#00FF00" strokeWidth={CORNER_WIDTH} fill="none">
                    {/* Top-left corner */}
                    <Line
                        x1={frameX}
                        y1={frameY}
                        x2={frameX + CORNER_SIZE}
                        y2={frameY}
                    />
                    <Line
                        x1={frameX}
                        y1={frameY}
                        x2={frameX}
                        y2={frameY + CORNER_SIZE}
                    />

                    {/* Top-right corner */}
                    <Line
                        x1={frameX + FRAME_WIDTH - CORNER_SIZE}
                        y1={frameY}
                        x2={frameX + FRAME_WIDTH}
                        y2={frameY}
                    />
                    <Line
                        x1={frameX + FRAME_WIDTH}
                        y1={frameY}
                        x2={frameX + FRAME_WIDTH}
                        y2={frameY + CORNER_SIZE}
                    />

                    {/* Bottom-left corner */}
                    <Line
                        x1={frameX}
                        y1={frameY + FRAME_HEIGHT - CORNER_SIZE}
                        x2={frameX}
                        y2={frameY + FRAME_HEIGHT}
                    />
                    <Line
                        x1={frameX}
                        y1={frameY + FRAME_HEIGHT}
                        x2={frameX + CORNER_SIZE}
                        y2={frameY + FRAME_HEIGHT}
                    />

                    {/* Bottom-right corner */}
                    <Line
                        x1={frameX + FRAME_WIDTH}
                        y1={frameY + FRAME_HEIGHT - CORNER_SIZE}
                        x2={frameX + FRAME_WIDTH}
                        y2={frameY + FRAME_HEIGHT}
                    />
                    <Line
                        x1={frameX + FRAME_WIDTH - CORNER_SIZE}
                        y1={frameY + FRAME_HEIGHT}
                        x2={frameX + FRAME_WIDTH}
                        y2={frameY + FRAME_HEIGHT}
                    />
                </G>

                {/* Center guidelines */}
                <G stroke="#00FF00" strokeWidth={1.5} fill="none" opacity={0.3}>
                    {/* Vertical center line */}
                    <Line
                        x1={centerX}
                        y1={frameY}
                        x2={centerX}
                        y2={frameY + FRAME_HEIGHT}
                        strokeDasharray="10, 10"
                    />
                    {/* Horizontal center line */}
                    <Line
                        x1={frameX}
                        y1={centerY}
                        x2={frameX + FRAME_WIDTH}
                        y2={centerY}
                        strokeDasharray="10, 10"
                    />
                </G>

                {/* === Directional guidance arrows === */}

                {/* Upward arrow (top of frame - indicating front of bike) */}
                <G opacity={0.8}>
                    {/* Arrow shaft */}
                    <Line
                        x1={centerX}
                        y1={frameY + 60}
                        x2={centerX}
                        y2={frameY + 110}
                        stroke="#FFFFFF"
                        strokeWidth={2.5}
                    />
                    {/* Arrow head pointing up */}
                    <Polygon
                        points={`
                            ${centerX},${frameY + 48}
                            ${centerX - arrowHeadSize},${frameY + 68}
                            ${centerX + arrowHeadSize},${frameY + 68}
                        `}
                        fill="#FFFFFF"
                        opacity={0.9}
                    />
                    {/* Label: Đầu xe (Front) */}
                    <SvgText
                        x={centerX}
                        y={frameY + 130}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={13}
                        fontWeight="600"
                        opacity={0.85}
                    >
                        Đầu xe
                    </SvgText>
                </G>

                {/* Downward arrow (bottom of frame - indicating rear of bike) */}
                <G opacity={0.8}>
                    {/* Arrow shaft */}
                    <Line
                        x1={centerX}
                        y1={frameY + FRAME_HEIGHT - 110}
                        x2={centerX}
                        y2={frameY + FRAME_HEIGHT - 60}
                        stroke="#FFFFFF"
                        strokeWidth={2.5}
                    />
                    {/* Arrow head pointing down */}
                    <Polygon
                        points={`
                            ${centerX},${frameY + FRAME_HEIGHT - 48}
                            ${centerX - arrowHeadSize},${frameY + FRAME_HEIGHT - 68}
                            ${centerX + arrowHeadSize},${frameY + FRAME_HEIGHT - 68}
                        `}
                        fill="#FFFFFF"
                        opacity={0.9}
                    />
                    {/* Label: Đuôi xe (Rear) */}
                    <SvgText
                        x={centerX}
                        y={frameY + FRAME_HEIGHT - 120}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={13}
                        fontWeight="600"
                        opacity={0.85}
                    >
                        Đuôi xe
                    </SvgText>
                </G>

                {/* Bicycle icon hint - simple bike silhouette using lines */}
                <G opacity={0.2} stroke="#FFFFFF" strokeWidth={1.5} fill="none">
                    {/* Simplified vertical bike outline */}
                    {/* Top wheel */}
                    <Line
                        x1={centerX - 15}
                        y1={centerY - 45}
                        x2={centerX + 15}
                        y2={centerY - 45}
                    />
                    <Line
                        x1={centerX - 15}
                        y1={centerY - 45}
                        x2={centerX - 15}
                        y2={centerY - 25}
                    />
                    <Line
                        x1={centerX + 15}
                        y1={centerY - 45}
                        x2={centerX + 15}
                        y2={centerY - 25}
                    />
                    <Line
                        x1={centerX - 15}
                        y1={centerY - 25}
                        x2={centerX + 15}
                        y2={centerY - 25}
                    />
                    {/* Frame connecting wheels */}
                    <Line
                        x1={centerX}
                        y1={centerY - 25}
                        x2={centerX}
                        y2={centerY + 25}
                    />
                    {/* Bottom wheel */}
                    <Line
                        x1={centerX - 15}
                        y1={centerY + 25}
                        x2={centerX + 15}
                        y2={centerY + 25}
                    />
                    <Line
                        x1={centerX - 15}
                        y1={centerY + 25}
                        x2={centerX - 15}
                        y2={centerY + 45}
                    />
                    <Line
                        x1={centerX + 15}
                        y1={centerY + 25}
                        x2={centerX + 15}
                        y2={centerY + 45}
                    />
                    <Line
                        x1={centerX - 15}
                        y1={centerY + 45}
                        x2={centerX + 15}
                        y2={centerY + 45}
                    />
                </G>
            </Svg>

            {/* Instruction text overlay inside the frame */}
            <View style={[styles.guidanceTextContainer, { top: centerY - 12 }]}>
                <Text style={styles.guidanceText}>
                    Đặt xe đạp nằm dọc theo khung hướng dẫn
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guidanceTextContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    guidanceText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});
