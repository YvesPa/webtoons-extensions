export interface WebtoonDto {
    result: WebtoonResultDto;
    success: boolean;
    message?: string;
}

export interface WebtoonResultDto {

}

export interface WebtoonChaptersListDto extends WebtoonResultDto {
    episodeList: WebtoonChaptersElemDto[]
    nextCursor: number
}

export interface  WebtoonChaptersElemDto{
    episodeNo: number;
    thumbnail: string;
    episodeTitle: string;
    viewerLink: string;
    exposureDateMillis: number;
    displayUp: boolean;
    hasBgm: boolean;
}