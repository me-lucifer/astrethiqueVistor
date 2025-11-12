
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Mic, Video, AlertTriangle } from 'lucide-react';
import { Progress } from '../ui/progress';

const MicVisualizer = () => {
    const [level, setLevel] = useState(0);

    useEffect(() => {
        let animationFrameId: number;
        const visualize = () => {
            setLevel(Math.random() * 80 + 10);
            animationFrameId = requestAnimationFrame(visualize);
        };
        visualize();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="flex items-center gap-2">
            <Progress value={level} className="w-24 h-1.5" />
            <span className="text-xs text-muted-foreground">Test</span>
        </div>
    );
};

export function PermissionsOverlay({ onJoin }: { onJoin: () => void }) {
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        let stream: MediaStream;
        const getPermissions = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing media devices.", err);
            }
        };
        getPermissions();

        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const toggleVideo = (enabled: boolean) => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(track => track.enabled = enabled);
        }
        setCameraEnabled(enabled);
    }
    
    const toggleAudio = (enabled: boolean) => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => track.enabled = enabled);
        }
        setMicEnabled(enabled);
    }
    
    return (
        <div className="h-screen w-screen bg-black/80 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-background/80 backdrop-blur-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-center">Ready to join?</CardTitle>
                    <CardDescription className="text-center">
                        Check your camera and microphone settings before entering.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="aspect-video w-full bg-black rounded-lg flex items-center justify-center overflow-hidden">
                       {cameraEnabled ? (
                           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                       ) : (
                           <p className="text-muted-foreground">
                               Camera is off
                           </p>
                       )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="mic-toggle" className="font-medium flex items-center gap-2">
                                    <Mic className="h-4 w-4" /> Microphone
                                </Label>
                                <Switch id="mic-toggle" checked={micEnabled} onCheckedChange={(checked) => toggleAudio(checked)} />
                            </div>
                            <Select defaultValue="default" disabled={!micEnabled}>
                                <SelectTrigger aria-label="Select microphone"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default - Internal Microphone</SelectItem>
                                    <SelectItem value="mic2">External USB Mic</SelectItem>
                                </SelectContent>
                            </Select>
                            {micEnabled && <MicVisualizer />}
                        </div>
                         <div className="p-4 rounded-lg border space-y-3">
                             <div className="flex items-center justify-between">
                                <Label htmlFor="cam-toggle" className="font-medium flex items-center gap-2">
                                    <Video className="h-4 w-4" /> Camera
                                </Label>
                                <Switch id="cam-toggle" checked={cameraEnabled} onCheckedChange={(checked) => toggleVideo(checked)} />
                            </div>
                             <Select defaultValue="default" disabled={!cameraEnabled}>
                                <SelectTrigger aria-label="Select camera"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default - FaceTime HD Camera</SelectItem>
                                    <SelectItem value="cam2">External Webcam</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/50 text-yellow-300 flex items-start gap-3 text-sm">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                            Your browser may ask for camera and microphone permissions. Please grant access to continue.
                        </p>
                    </div>

                    <Button size="lg" className="w-full" onClick={onJoin}>
                        Join Call
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
