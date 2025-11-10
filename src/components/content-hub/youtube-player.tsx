
import { ContentHubItem } from "@/lib/content-hub-seeder";

export const YouTubePlayer = ({ item }: { item: ContentHubItem }) => {
    if (!item.youtubeUrl) return null;
    
    // Extract video ID from URL
    const extractYouTubeId = (url: string): string | null => {
        if (!url) return null;
        let videoId = '';
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                videoId = urlObj.pathname.substring(1);
            } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
                if (urlObj.pathname === '/watch') {
                    videoId = urlObj.searchParams.get('v') || '';
                } else if (urlObj.pathname.startsWith('/embed/')) {
                    videoId = urlObj.pathname.substring(7);
                }
            }
            // Handle URLs with list parameters
            const listParamIndex = videoId.indexOf('&');
            if (listParamIndex !== -1) {
                videoId = videoId.substring(0, listParamIndex);
            }
            return videoId;
        } catch (e) {
            console.error("Invalid YouTube URL", url);
            return null;
        }
    }
    
    const videoId = extractYouTubeId(item.youtubeUrl);

    if (!videoId) return <p className="text-destructive">Could not load video. Invalid YouTube URL provided.</p>;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;

    return (
        <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden border">
            <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title={item.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
}
