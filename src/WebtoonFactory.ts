// > npx ts-node ./src/generateClass.ts
// to lunch the factory

export class WebtoonConfiguration
{
    public SourceName: string
    public Locale: string
    public Version: string
    public HaveTrending: boolean
    public SourceTags: string
    public SpecialCode: string
    public LanguageInfo: string

    constructor(input?: Partial<WebtoonConfiguration> ){
        this.SourceName = input?.SourceName ?? 'WebtoonEN'
        this.Locale = input?.Locale ?? 'en'
        this.Version = input?.Version ?? '0.0.0'
        this.HaveTrending = input?.HaveTrending !== undefined ? input.HaveTrending : true
        this.LanguageInfo = input?.LanguageInfo ?? "English"
        this.SourceTags = input?.LanguageInfo === undefined ? '[]' : `[{text: '${input.LanguageInfo}', type: BadgeColor.GREY}]`
        this.SpecialCode = input?.SpecialCode ?? ''
    }
}

export const WebtoonFactory : WebtoonConfiguration[] = 
[
    new WebtoonConfiguration(),
    new WebtoonConfiguration({SourceName: 'WebtoonFR', Locale: 'fr', LanguageInfo: 'French'}),
    new WebtoonConfiguration({SourceName: 'WebtoonES', Locale: 'es', LanguageInfo: 'Spanish', HaveTrending: false}),
    new WebtoonConfiguration({SourceName: 'WebtoonDE', Locale: 'de', LanguageInfo: 'German', HaveTrending: false}),
    new WebtoonConfiguration({SourceName: 'WebtoonZH', Locale: 'zh-hant',  LanguageInfo: 'Chinese (Traditional)'}),
    new WebtoonConfiguration({SourceName: 'WebtoonTH', Locale: 'th', LanguageInfo: 'Thai'}),
    new WebtoonConfiguration({SourceName: 'WebtoonID', Locale: 'id', LanguageInfo: 'Indonesian'})
]