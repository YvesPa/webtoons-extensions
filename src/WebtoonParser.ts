import {
    SourceManga,
    Chapter,
    ChapterDetails,
    PagedResults,
    PartialSourceManga,
    Tag
} from '@paperback/types'

import { Cheerio, CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import { WebtoonChaptersListDto, WebtoonChaptersElemDto } from './WebtoonDtos';
type CheerioElement = Cheerio<Element>;

export class WebtoonParser {

    constructor(
        private locale: string,
        private BASE_URL: string) 
    { }

    parseDetails($: CheerioAPI, mangaId: string): SourceManga {
        const detailElement = $(
            "#wrap > #container > #content > div.cont_box > div.detail_header > div.info",
        );
        const infoElement = $("#_asideDetail") as CheerioElement;
        const isCanvas = mangaId.startsWith("/canvas");

        const [image, title] = isCanvas
            ? [
                  this.parseCanvasDetailsThumbnail($),
                  detailElement.find("h3").text().trim(),
              ]
            : [
                  this.parseDetailsThumbnail($),
                  detailElement.find("h1").text().trim(),
              ];

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                image: image,
                titles: [title],
                author: detailElement.find('.author_area').text().trim(),
                artist: '',
                desc: infoElement.find('p.summary').text(),
                tags: [
                    App.createTagSection({
                        id: '0',
                        label: 'genres',
                        tags: detailElement.find('.genre').toArray().map(genre => App.createTag({ id: $(genre).text(), label: $(genre).text() }))
                    })
                ],
                status: this.parseStatus(infoElement)
            })
        })
    }

    parseStatus(infoElement: CheerioElement): string {
        const statusElement = infoElement.find('p.day_info')
        const bubbleTest = statusElement.find('span').text() ?? ''
        return statusElement.text()?.replace(bubbleTest, '')
    }

    parseDetailsThumbnail($: CheerioAPI): string {
        const thumb =
            $("#wrap > #container > #content > div.detail_bg")
                .attr("style")
                ?.match(/url\('(.*?)'\)/)?.[1] ?? "";
        const meta = $("meta[property='og:image']").attr("content") ?? "";
        return meta ?? thumb;
    }
    
    parseCanvasDetailsThumbnail($: CheerioAPI): string {
        return $("#content > div.cont_box span.thmb > img").attr("src") ?? "";
    }

    parseChaptersList(dto: WebtoonChaptersListDto): Chapter[] {
        return dto.episodeList.map(elem => this.parseChapter(elem));
    }

    parseChapter(elem: WebtoonChaptersElemDto): Chapter {
        return App.createChapter({
            id: elem.viewerLink.replace(`/${this.locale}/`,""),
            name: elem.episodeTitle,
            chapNum: Number(elem.episodeNo),
            time: new Date(elem.exposureDateMillis),
        });
    }
  
    parseChapterDetails($: CheerioAPI, mangaId: string, chapterId: string): ChapterDetails {
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: $('div#_imageList img').toArray().map(elem => $(elem).attr('data-url') ?? '')
        })
    }

    parsePopularTitles($: CheerioAPI): PartialSourceManga[] {
        return $('div#content div.webtoon_list_wrap ul.webtoon_list li a')
            .toArray()
            .filter(elem => $(elem).find('strong.title'))
            .map(elem => this.parseMangaFromElement($(elem)))
    }

    parseTodayTitles($: CheerioAPI, allTitles: boolean): PartialSourceManga[] {
        const mangas: PartialSourceManga[] = [];

        const list = $(
            `div#content div.webtoon_list_wrap ul.webtoon_list li a`,
        );
        for (
            let i = 0;
            i <= list.length - 1 && (allTitles || mangas.length < 10);
            i++
        ) {
            if ($(list[i]).find("strong.title"))
                mangas.push(this.parseMangaFromElement($(list[i])));
        }

        return mangas;
    }
/*
    parseOngoingTitles($: CheerioAPI, allTitles: boolean): PartialSourceManga[] {
        const mangas: PartialSourceManga[] = []
        let maxChild = 0

        $('div#dailyList > div').each((_ : number, elem: Element) => {
            if ($(elem).find('li').length > maxChild) maxChild = $(elem).find('li').length
        })

        for (let i = 1; i <= maxChild; i++) {
            if(!allTitles && mangas.length >= 14) return mangas
            $('div#dailyList > div li:nth-child(' + i + ') a.daily_card_item').each((_ : number, elem: any) => {
                if ($(elem).find('p.subj'))
                    mangas.push(this.parseMangaFromElement($(elem as Element)))
            })
        }

        return mangas
    }

    parseCompletedTitles($: CheerioAPI, allTitles: boolean): PartialSourceManga[] {
        const mangas: PartialSourceManga[] = []

        const list = $('div.daily_lst.comp li a')
        for(let i = 0; i <= list.length && (allTitles || mangas.length < 10); i++){
            if($(list[i]).find('p.subj'))
                mangas.push(this.parseMangaFromElement($(list[i])))
        }

        return mangas
    }
*/
    parseCanvasRecommendedTitles($: CheerioAPI): PartialSourceManga[] {
        return $('#recommendArea li.rolling-item')
            .toArray()
            .map(elem => this.parseCanvasFromRecommendedElement($(elem)))
    }

    parseCanvasFromRecommendedElement(elem: CheerioElement): PartialSourceManga {
        return App.createPartialSourceManga({
            mangaId: elem.find('a').attr('href')?.replace(this.BASE_URL + '/', '') ?? '',
            title: elem.find('p.subj').text(),
            image: elem.find('img').attr('src') ?? '',
            subtitle: 'Canvas'
        })
    }

    parseCanvasPopularTitles($: CheerioAPI): PartialSourceManga[] {
        return $('div.challenge_lst li a')
            .toArray()
            .map(elem => this.parseCanvasFromElement($(elem)))
    }

    parseMangaFromElement(elem: CheerioElement): PartialSourceManga {
        return App.createPartialSourceManga({
            mangaId: elem.attr('href')?.replace(this.BASE_URL + '/', '') ?? '',
            title: elem.find('strong.title').text(),
            image: elem.find('img').attr('src') ?? ''
        })
    }

    parseCanvasFromElement(elem: CheerioElement): PartialSourceManga {
        return App.createPartialSourceManga({
            mangaId: elem.attr('href')?.replace(this.BASE_URL + '/', '') ?? '',
            title: elem.find('strong.title').text(),
            image: elem.find('img').attr('src') ?? '',
            subtitle: 'Canvas'
        })
    }

    parseSearchResults($: CheerioAPI, canvas_wanted: boolean): PagedResults {
        const items: PartialSourceManga[] = []
        items.push(...$('#content > div.webtoon_list_wrap ul li a._card_item')
            .toArray()
            .map(elem => this.parseMangaFromElement($(elem))))

        if (canvas_wanted) {
            items.push(...$('#content > div.card_wrap.search li a.challenge_item')
                .toArray()
                .map(elem => this.parseCanvasFromElement($(elem))))
        }

        return App.createPagedResults({
            results: items
        })
    }
    
    parseGenres($: CheerioAPI): Tag[]{
        return  $('#content > div#genre_wrap > div.snb_inner > ul li')
            .toArray()
            .map(elem => this.parseTagFromElement($(elem)))
    }
    
    parseCanvasGenres($: CheerioAPI): Tag[]{
        return $('#content > div#genre_wrap > div.snb_inner > ul li')
            .toArray()
            .filter(elem => $(elem).attr('data-genre') && $(elem).attr('data-genre') !== 'ALL')
            .map(elem => this.parseCanvasTagFromElement($(elem)))
    }

    parseTagFromElement(elem: CheerioElement): Tag {
        return App.createTag({
            id: elem.find('a').attr('data-genre') ?? '',
            label: elem.find('a').text().trim()
        })
    }
    
    parseCanvasTagFromElement(elem: CheerioElement): Tag {
        return App.createTag({
            id: 'CANVAS$$' + (elem.attr('data-genre') ?? ''),
            label: elem.find('a').text().trim()
        })
    }

    parseTagResults($: CheerioAPI): PagedResults {
        return App.createPagedResults({
            results: $("#content > div.webtoon_list_wrap ul li a")
                .toArray()
                .map(elem => this.parseMangaFromElement($(elem)))
        })
    }

}
