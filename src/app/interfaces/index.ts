/**
 * Interfaces
 */

export interface Track {
    album_coverart_100x100: string;
    album_id: number;
    album_name: string;
    artist_id: number;
    artist_name: string;
    has_lyrics: number;
    lyrics_id: number;
    track_id: number;
    track_length: number;
    track_name: string;
    track_rating: number;
}

export interface Lyrics {
    lyrics_id: number;
    restricted: number;
    lyrics_body: string;
    pixel_tracking_url: string;
    lyrics_copyright: string;
}

export interface Artist {
    artist_id: number;
    artist_name: string;
    artist_rating: number;
    artist_twitter_url: string;
}
