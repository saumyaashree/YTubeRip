"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  Clapperboard,
  Download,
  Film,
  Loader2,
  Music,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { intelligentFormatConversion } from "@/ai/flows/intelligent-format-conversion";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type VideoDetails = {
  title: string;
  author: string;
  thumbnail: string;
};

const formatIcons: Record<string, React.ElementType> = {
  mp4: Clapperboard,
  mp3: Music,
  webm: Film,
};

export function Downloader() {
  const [url, setUrl] = useState("");
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [selectedFormat, setSelectedFormat] = useState("mp4");
  const [selectedResolution, setSelectedResolution] = useState("1080p");
  
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ selectedFormat: string; reason: string } | null>(null);
  const [requestedFormatForAi, setRequestedFormatForAi] = useState('');

  const [isAiLoading, startAiTransition] = useTransition();

  const { toast } = useToast();
  const thumbnailPlaceholder = PlaceHolderImages.find(p => p.id === 'yt-thumbnail-1');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDownloading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isDownloading]);

  const handleFetchVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !url.includes("youtube.com")) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL.",
      });
      return;
    }

    setIsFetching(true);
    setTimeout(() => {
      setVideoDetails({
        title: "Journey Through the Cosmos - Epic Space Animation",
        author: "AstroVisions",
        thumbnail: thumbnailPlaceholder?.imageUrl || "https://picsum.photos/seed/yt-thumb-1/1280/720",
      });
      setIsFetching(false);
    }, 1500);
  };
  
  const startSimulatedDownload = (format: string) => {
    setIsDownloading(true);
    setProgress(0);
  };

  const handleDownload = async () => {
    const availableFormats = ["webm", "mp3"]; // Mock available formats

    if (availableFormats.includes(selectedFormat)) {
      startSimulatedDownload(selectedFormat);
    } else {
      setRequestedFormatForAi(selectedFormat);
      startAiTransition(async () => {
        try {
          const suggestion = await intelligentFormatConversion({
            requestedFormat: selectedFormat,
            availableFormats,
          });
          setAiSuggestion(suggestion);
          setShowAiModal(true);
        } catch (error) {
          console.error("AI format conversion failed:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not suggest an alternative format. Please try again.",
          });
        }
      });
    }
  };

  const handleAiConfirm = () => {
    if (aiSuggestion) {
      toast({
        title: "Format Changed",
        description: `Downloading in ${aiSuggestion.selectedFormat.toUpperCase()} format as suggested.`,
      });
      startSimulatedDownload(aiSuggestion.selectedFormat);
    }
  };

  const resetState = () => {
    setUrl("");
    setVideoDetails(null);
    setIsDownloading(false);
    setProgress(0);
    setSelectedFormat("mp4");
    setSelectedResolution("1080p");
  };

  const renderFormatItem = (format: string) => {
    const Icon = formatIcons[format] || Clapperboard;
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span>{format.toUpperCase()}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-2xl px-0">
      <Card className="shadow-lg transition-all duration-500">
        {!videoDetails && !isDownloading && (
          <>
            <CardHeader>
              <CardTitle>Start Your Download</CardTitle>
              <CardDescription>
                Paste the YouTube video link below to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFetchVideo}>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isFetching}
                    className="flex-grow"
                  />
                  <Button type="submit" disabled={isFetching} className="w-full sm:w-auto">
                    {isFetching && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isFetching ? "Fetching..." : "Fetch Video"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {videoDetails && !isDownloading && (
          <div className="animate-in fade-in-0 duration-500">
            <CardHeader>
                <CardTitle>Ready to Download</CardTitle>
                <CardDescription>
                    Choose your desired format and resolution.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden relative shadow-md">
                <Image
                  src={videoDetails.thumbnail}
                  alt={videoDetails.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint="abstract design"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{videoDetails.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{videoDetails.author}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="format">Format</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">{renderFormatItem("mp4")}</SelectItem>
                        <SelectItem value="mp3">{renderFormatItem("mp3")}</SelectItem>
                        <SelectItem value="webm">{renderFormatItem("webm")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select value={selectedResolution} onValueChange={setSelectedResolution} disabled={selectedFormat === 'mp3'}>
                      <SelectTrigger id="resolution">
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="480p">480p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setVideoDetails(null)}>Cancel</Button>
                <Button onClick={handleDownload} disabled={isAiLoading} className="bg-accent hover:bg-accent/90">
                    {(isAiLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAiLoading ? 'Analyzing...' : <Download className="mr-2 h-4 w-4" />}
                    Download
                </Button>
            </CardFooter>
          </div>
        )}
        
        {isDownloading && (
            <div className="animate-in fade-in-0 duration-500 p-6">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-center">Downloading...</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col items-center">
                    <div className="w-full max-w-sm">
                        <Progress value={progress} className="w-full" />
                        <p className="text-center text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
                    </div>
                    {progress === 100 && (
                        <div className="text-center mt-4 animate-in fade-in-0 duration-500">
                            <p className="font-semibold text-primary">Download Complete!</p>
                            <Button onClick={resetState} className="mt-4">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Download Another Video
                            </Button>
                        </div>
                    )}
                </CardContent>
            </div>
        )}

      </Card>
      
      <AlertDialog open={showAiModal} onOpenChange={setShowAiModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Intelligent Format Suggestion
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              The requested format <span className="font-semibold text-foreground">{`'${requestedFormatForAi.toUpperCase()}'`}</span> is not available.
              <br/><br/>
              <span className="font-semibold text-foreground">Reasoning:</span> {aiSuggestion?.reason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAiConfirm} className="bg-accent hover:bg-accent/90">
                Proceed with {aiSuggestion?.selectedFormat.toUpperCase()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
