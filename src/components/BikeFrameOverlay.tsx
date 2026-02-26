import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, G } from 'react-native-svg';

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
                <G stroke="#00FF00" strokeWidth={1.5} fill="none" opacity={0.5}>
                    {/* Vertical center line */}
                    <Line
                        x1={SCREEN_WIDTH / 2}
                        y1={frameY}
                        x2={SCREEN_WIDTH / 2}
                        y2={frameY + FRAME_HEIGHT}
                        strokeDasharray="10, 10"
                    />
                    {/* Horizontal center line */}
                    <Line
                        x1={frameX}
                        y1={SCREEN_HEIGHT / 2}
                        x2={frameX + FRAME_WIDTH}
                        y2={SCREEN_HEIGHT / 2}
                        strokeDasharray="10, 10"
                    />
                </G>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
