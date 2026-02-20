RSS_SOURCES = [
    # ── Türkiye (TR) ──────────────────────────────────────────────────────────
    {"url": "https://www.hurriyet.com.tr/rss/gundem",               "category": "gundem",    "source": "Hürriyet",        "country": "TR"},
    {"url": "https://www.milliyet.com.tr/rss/rssNew/gundemRss.xml", "category": "gundem",    "source": "Milliyet",        "country": "TR"},
    {"url": "https://www.chip.com.tr/feed",                         "category": "teknoloji", "source": "Chip",            "country": "TR"},
    {"url": "https://webrazzi.com/feed/",                           "category": "teknoloji", "source": "Webrazzi",        "country": "TR"},
    {"url": "https://www.hurriyet.com.tr/rss/spor",                 "category": "spor",      "source": "Hürriyet Spor",   "country": "TR"},
    {"url": "https://www.hurriyet.com.tr/rss/ekonomi",              "category": "ekonomi",   "source": "Hürriyet Ekonomi","country": "TR"},
    {"url": "https://www.bbc.com/turkce/index.xml",                 "category": "dunya",     "source": "BBC Türkçe",      "country": "TR"},
    {"url": "https://bilimfili.com/feed/",                          "category": "bilim",     "source": "Bilim Fili",      "country": "TR"},

    # ── Amerika (US) ──────────────────────────────────────────────────────────
    {"url": "https://feeds.nbcnews.com/nbcnews/public/news",        "category": "gundem",    "source": "NBC News",        "country": "US"},
    {"url": "http://rss.cnn.com/rss/edition_technology.rss",        "category": "teknoloji", "source": "CNN Tech",        "country": "US"},
    {"url": "https://feeds.skynews.com/feeds/rss/world.xml",        "category": "dunya",     "source": "Sky News",        "country": "US"},
    {"url": "https://www.nasa.gov/rss/dyn/breaking_news.rss",       "category": "bilim",     "source": "NASA",            "country": "US"},

    # ── İngiltere (GB) ────────────────────────────────────────────────────────
    {"url": "http://feeds.bbci.co.uk/news/rss.xml",                 "category": "gundem",    "source": "BBC News",        "country": "GB"},
    {"url": "http://feeds.bbci.co.uk/news/technology/rss.xml",      "category": "teknoloji", "source": "BBC Tech",        "country": "GB"},
    {"url": "http://feeds.bbci.co.uk/sport/rss.xml?edition=uk",     "category": "spor",      "source": "BBC Sport",       "country": "GB"},
    {"url": "https://www.theguardian.com/world/rss",                "category": "dunya",     "source": "The Guardian",    "country": "GB"},

    # ── Almanya (DE) ──────────────────────────────────────────────────────────
    {"url": "https://rss.dw.com/rdf/rss-en-all",                   "category": "gundem",    "source": "DW English",      "country": "DE"},
    {"url": "https://rss.dw.com/rdf/rss-en-sci-tech",              "category": "teknoloji", "source": "DW Tech",         "country": "DE"},

    # ── Fransa (FR) ───────────────────────────────────────────────────────────
    {"url": "https://www.france24.com/en/rss",                      "category": "dunya",     "source": "France 24",       "country": "FR"},

    # ── Japonya (JP) ──────────────────────────────────────────────────────────
    {"url": "https://www3.nhk.or.jp/rss/news/cat0.xml",             "category": "gundem",    "source": "NHK World",       "country": "JP"},
]

CATEGORY_LABELS = {
    "gundem": "Gündem",
    "teknoloji": "Teknoloji",
    "spor": "Spor",
    "ekonomi": "Ekonomi",
    "dunya": "Dünya",
    "bilim": "Bilim",
}

COUNTRY_LABELS = {
    "TR": "Türkiye",
    "US": "Amerika",
    "GB": "İngiltere",
    "DE": "Almanya",
    "FR": "Fransa",
    "JP": "Japonya",
}
