import type { Translations } from "../types/i18n";

/**
 * English translations
 *
 * Default language for Now & Then application.
 */
export const en: Translations = {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    reset: "Reset",
    apply: "Apply",
    clear: "Clear",
    search: "Search",
    filter: "Filter",
    export: "Export",
    share: "Share",
    info: "Info",
    help: "Help",
    settings: "Settings",
    about: "About",
    na: "N/A",
    unknown: "Unknown",
  },

  header: {
    title: "Then & Now",
    location: "Gaza",
    subtitle: "A God's-Eye View of the Genocide in Gaza: Before & After Satellite Imagery",
    dashboard: "Dashboard",
    data: "Data",
    timeline: "Timeline",
    statistics: "Statistics",
    helpPalestine: "Help Palestine",
    about: "About",
    resources: {
      title: "Resources",
      donate: "Donate",
      organizations: "Organizations",
      research: "Research & Reports",
      media: "Media & Documentation",
      education: "Educational Resources",
      legal: "Legal & Advocacy",
      trackers: "Other Heritage Trackers",
      howItWorks: "How It Works",
    },
  },

  map: {
    streetView: "Street",
    satelliteView: "Satellite",
    baseline2014: "2014 Baseline",
    preConflict2023: "Pre-Conflict (Aug 2023)",
    current: "Current",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    showSiteMarkers: "Show site markers",
    switchTo: "Switch to",
    satelliteImagery: "satellite imagery",
  },

  timeline: {
    play: "Play",
    pause: "Pause",
    playTooltip: "Animate the left map to show site destruction events over time",
    speed: "Speed",
    syncMap: "Sync Map",
    showUnknownDates: "Show Unknown Dates",
    showUnknownDatesTooltip:
      "Sites without destruction dates are shown using their survey date instead",
    zoomToSite: "Zoom to Site",
    showMapMarkers: "Show Map Markers",
    comparisonMode: "Comparison Mode",
    dateRange: "Date Range",
    startDate: "Start Date",
    endDate: "End Date",
    previous: "Previous",
    previousAriaLabel: "Go to previous destruction event",
    previousTitle: "Navigate to previous site destruction event",
    next: "Next",
    nextAriaLabel: "Go to next destruction event",
    nextTitle: "Navigate to next site destruction event",
    dateFilter: "Date",
    from: "From",
    to: "to",
    clear: "Clear",
    clearFilter: "Clear date filter",
    keyboard: "Keyboard",
    playPause: "Play/Pause",
    step: "Step",
    jump: "Jump",
    tooltipDefault:
      "Click Play to animate through destruction events on the left map. Use the date filter to focus on specific time periods. Click dots to see site details.",
    tooltipAdvanced:
      "Sites timeline: each dot is a heritage site, placed on the date it was destroyed. Click a dot to select that site on the maps and in the sites list; use Previous/Next to step between events. Switch to the Imagery tab to move through the dates of available satellite imagery instead.",
    tooltipImagery:
      "Imagery timeline: each tick is a date the satellite archive has imagery for. Drag a handle to change which imagery the maps show. Switch to the Sites tab to browse heritage sites by their destruction date instead.",
    interval: "Interval",
    intervalAsLargeAsPossible: "As large as possible",
    intervalAsLargeAsPossibleTooltip:
      "Before map is the earliest available release, and After map is the latest available release.",
    intervalAsSmallAsPossible: "As small as possible",
    intervalAsSmallAsPossibleTooltip:
      "Before map is the last release preceding the destruction date.",
    interval1Month: "1 month (30 days)",
    interval1MonthTooltip: "Before map is dated 30 days before the destruction date.",
    interval1Year: "1 year",
    interval1YearTooltip: "Before map is dated 1 year before the destruction date.",
    interval5Years: "5 years",
    interval5YearsTooltip: "Before map is dated 5 years before the destruction date.",
    syncMapVersion: "Sync Map Version",
    syncMapVersionTooltip:
      "Automatically jumps to the satellite imagery release closest to (and after) each site's destruction date",
    mapVersionRange: "Map Version Range",
    mapVersionRangeTooltip:
      "Pick which satellite imagery releases the before/after maps show. Only days with a release can be selected.",
    beforeImageryDate: "Before imagery",
    afterImageryDate: "After imagery",
    manualMapVersion: "Manual Map Version Range",
    manualMapVersionTooltip:
      "Keeps the satellite imagery you picked on the slider when you click a site",
    unknownDate: "Unknown",
    noImageryAvailable: "No imagery releases available",
    separateTimelines: "Separate Timelines",
    separateTimelinesTooltip:
      "Show the imagery slider and the site timeline stacked instead of as tabs",
    tabImagery: "Imagery",
    tabSites: "Sites",
    advancedSettings: "Advanced Settings",
    showImagerySlider: "Show Imagery Slider",
    showImagerySliderTooltip:
      "Add the satellite imagery slider alongside the site timeline",
    darkMode: "Dark Mode",
    language: "Language",
  },

  table: {
    name: "Name",
    type: "Type",
    status: "Status",
    yearBuilt: "Year Built",
    dateDestroyed: "Date Destroyed",
    location: "Location",
    verifiedBy: "Verified By",
    compact: "Compact",
    expanded: "Expanded",
    mobile: "Mobile",
    viewDetails: "View Details",
    sortBy: "Sort by",
    heritageSites: "Heritage Sites",
    expandTable: "Expand table to see all columns",
    selectExportFormat: "Select export format",
    export: "Export",
    siteName: "Site Name",
    destructionDate: "Destruction Date",
    destructionDateGregorian: "Destruction Date (Gregorian)",
    destructionDateIslamic: "Destruction Date (Islamic)",
    surveyDate: "Survey Date",
    tooltip:
      "Click any site row to view detailed information. Use column headers to sort.",
    tooltipDashboard:
      "Click any site row to jump to them on the map and timeline. Drag the right side of the table to expand, or click the Expand button to go to the Data page.",
    tooltipDataPage:
      "Browse and filter all heritage sites. Click any row to view detailed information. Use column headers to sort. Export filtered data using the export button above.",
    builtGregorian: "Built (Gregorian)",
    builtIslamic: "Built (Islamic)",
    showing: "Showing",
    site: "site",
    sites: "sites",
    islamic: "Islamic",
    showIslamicDates: "Show Islamic Dates",
    description: "Description",
    coordinates: "Coordinates",
    sources: "Sources",
    lastUpdated: "Last Updated",
  },

  filters: {
    filters: "Filters",
    filterActive: "Filter active",
    settings: "Settings",
    sites: "Sites",
    clear: "Clear",
    clearAll: "Clear All",
    searchPlaceholder: "Search...",
    search: "Search",
    clearSearch: "Clear search",
    openFilters: "Open filters menu",
    hideFilters: "Hide",
    showFilters: "Show filters",
    switchToSidebar: "Switch to sidebar",
    switchToTopBar: "Switch to top bar",
    typeFilter: "Type Filter",
    statusFilter: "Status Filter",
    allTypes: "All Types",
    allStatuses: "All Statuses",
    creationYearRange: "Creation Year Range",
    destructionDateRange: "Destruction Date Range",
    applyFilters: "Apply Filters",
    clearFilters: "Clear Filters",
    siteType: "Site Type",
    type: "Type",
    selectTypes: "Select types...",
    status: "Status",
    selectStatus: "Select status...",
    destructionDate: "Destruction Date Range",
    yearBuilt: "Year Built Range",
    showingCount: "Showing {{filtered}} of {{total}} sites",
    apply: "Apply",
    closeFilters: "Close filters",
    fromDate: "From",
    toDate: "To",
    fromYear: "From year",
    toYear: "To year",
  },

  siteTypes: {
    mosque: "Mosque",
    church: "Church",
    archaeological: "Archaeological Site",
    museum: "Museum",
    historicBuilding: "Historic Building",
    hospital: "Hospital",
    school: "School / University",
    monument: "Monument",
    cemetery: "Cemetery",
    archive: "Archive",
  },

  siteStatus: {
    destroyed: "Destroyed",
    heavilyDamaged: "Severely Damaged",
    looted: "Looted",
    damaged: "Moderately Damaged",
    abandoned: "Abandoned",
    unknown: "Unverified",
    unharmed: "Undamaged",
  },

  stats: {
    title: "Statistics",
    totalSites: "Total Sites",
    destroyed: "Destroyed",
    damaged: "Damaged",
    ancientSites: "Ancient Sites",
    legalFramework: "Legal Framework",
    notableLosses: "Notable Losses",
  },

  timelinePage: {
    title: "Satellite Timeline",
    backToMain: "Back to Main View",
    releases: "Releases",
    satelliteDates: "Satellite imagery dates",
    siteDestruction: "Site destruction events",
    playAnimation: "Play animation",
    pauseAnimation: "Pause animation",
    resetTimeline: "Reset timeline",
    nextEvent: "Next event",
    previousEvent: "Previous event",
    waybackTooltip:
      "Navigate through historical satellite imagery versions. Click anywhere on the timeline to jump to that date. Use Previous/Next buttons or hover over gray lines to see exact dates. Enable Comparison Mode to view before/after satellite imagery side-by-side.",
  },

  siteDetail: {
    overview: "Overview",
    historicalSignificance: "Historical Significance",
    culturalValue: "Cultural Value",
    sources: "Sources",
    images: "Images",
    coordinates: "Coordinates",
    coordinatesApproximate: "approximate",
    verificationSources: "Verification Sources",
    siteType: "Site Type",
    yearBuilt: "Year Built",
    status: "Status",
    dateDestroyed: "Date Destroyed/Damaged",
    surveyDate: "Survey Date",
    lastUpdated: "Last Updated",
    description: "Description",
    whatWasLost: "What Was Lost",
    beforeDestruction: "Before destruction",
    afterDestruction: "After destruction",
    seeMore: "See More",
  },

  modals: {
    confirmClose: "Are you sure you want to close?",
    unsavedChanges: "You have unsaved changes.",
  },

  errors: {
    loadingFailed: "Failed to load data",
    networkError: "Network error occurred",
    notFound: "Not found",
    invalidData: "Invalid data format",
    exportFailed: "Export failed",
    somethingWrong: "Something went wrong",
    unexpectedError: "An unexpected error occurred. Please try again.",
    tryAgain: "Try Again",
    persistsContact: "If this problem persists, please contact support.",
  },

  aria: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Toggle dark mode",
    toggleLanguage: "Change language",
    filterControl: "Filter control",
    timelineControl: "Timeline control",
    mapControl: "Map control",
    switchToLightMode: "Switch to light mode",
    switchToDarkMode: "Switch to dark mode",
    viewGithub: "View source code on GitHub",
    helpPalestineDonate: "Help Palestine - Donate to relief efforts",
    aboutHeritageTracker: "About Now & Then",
    resizeTable: "Resize table",
    dragToResizeTable: "Drag to resize table",
    clearSearch: "Clear search",
  },

  pagination: {
    showingPage: "Showing page",
    of: "of",
    totalSites: "total sites",
    previous: "Previous",
    next: "Next",
    goToPage: "Go to page",
  },

  loading: {
    message: "Loading...",
    pleaseWait: "Loading content, please wait...",
  },

  donate: {
    title: "Help Palestine",
    description: "Reputable organizations providing essential humanitarian aid to Palestinians.",
    organizationsSection: "Relief Organizations",
    focus: "Focus:",
    donateButton: "Donate",
    disclaimer: "Note:",
    disclaimerText:
      "Now & Then is not affiliated with these organizations. Please research before donating.",
    unrwaDesc:
      "UN agency providing education, healthcare, and emergency aid to Palestinian refugees.",
    mapDesc: "Medical services and supplies for Palestinians in occupied territories.",
    pcrfDesc: "Free medical care for injured and sick children in Palestine.",
    msfDesc: "Emergency medical care and surgical services in Gaza and West Bank.",
  },

  footer: {
    title: "Gaza: Then & Now",
    sources: "UNESCO, Forensic Architecture, Heritage for Peace",
    github: "Github",
    donate: "Donate",
    about: "About",
    copyright: "© {year} Gaza: Then & Now",
    lastUpdated: "Last Updated: {date}",
  },

  legend: {
    colorKey: "Color Key:",
  },

  resources: {
    organizations: {
      title: "Organizations",
      description:
        "Palestinian heritage, human rights, and humanitarian organizations working for justice and preservation.",
      heritageSection: "Heritage & Documentation",
      humanRightsSection: "Human Rights Organizations",
      humanitarianSection: "Humanitarian Aid",
      legalSection: "Legal Institutions",
      unescoDesc:
        "Leading international organization for cultural heritage protection and assessment.",
      h4pDesc: "NGO dedicated to protecting cultural heritage in conflict zones.",
      forensicDesc:
        "Research agency investigating human rights violations through spatial and architectural analysis.",
      alhaqDesc:
        "Independent Palestinian non-governmental human rights organization established in 1979.",
      btselemDesc:
        "Israeli human rights organization documenting human rights violations in occupied territories.",
      amnestyDesc: "Global human rights monitoring and advocacy for Palestinian rights.",
      hrwDesc:
        "International human rights organization documenting abuses and advocating for change.",
      unrwaDesc:
        "UN agency providing education, healthcare, and emergency aid to Palestinian refugees.",
      mapDesc: "UK-based charity providing medical and humanitarian assistance to Palestinians.",
      pcrfDesc:
        "Non-profit providing free medical care to children in the Middle East regardless of nationality or religion.",
      icjDesc: "UN's principal judicial organ hearing cases on international law violations.",
      iccDesc: "International tribunal investigating war crimes and crimes against humanity.",
    },
    research: {
      title: "Research & Reports",
      description:
        "Academic research, official reports, and documentation projects on Palestinian heritage and human rights.",
      officialReportsSection: "Official Reports & Assessments",
      documentationSection: "Documentation Projects",
      academicSection: "Academic Publications",
      databasesSection: "Databases & Archives",
      unescoReportDesc:
        "Ongoing satellite-based assessment of damage to cultural heritage sites in Gaza.",
      ochaDesc:
        "Real-time humanitarian situation reports and data on occupied Palestinian territory.",
      unrwaReportsDesc: "Detailed reports on humanitarian conditions and refugee needs.",
      forensicProjectsDesc:
        "Evidence-based investigations using spatial analysis and open-source data.",
      airwarsDesc: "Non-profit tracking civilian casualties from international airstrikes.",
      euromedDesc:
        "Independent organization documenting human rights violations and legal advocacy.",
      palestineStudiesDesc:
        "Leading academic journal on Palestinian history, politics, and culture since 1971.",
      holyLandJournalDesc:
        "Peer-reviewed journal covering history, politics, and heritage of Palestine.",
      meripDesc: "Independent non-profit providing critical analysis of Middle East affairs.",
      openMapsDesc:
        "Interactive mapping platform documenting Palestinian towns, villages, and historical sites.",
      rememberedDesc:
        "Comprehensive database of destroyed Palestinian villages and refugee stories.",
    },
    media: {
      title: "Media & Documentation",
      description:
        "Photo archives, documentaries, news sources, and social media accounts documenting Palestinian life and heritage.",
      photoArchivesSection: "Photo & Film Archives",
      newsOutletsSection: "News Outlets",
      documentariesSection: "Documentary Films",
      socialMediaSection: "Social Media Documentation",
      palMuseumDesc:
        "Public digital archive of Palestinian social history built by The Palestinian Museum.",
      unrwaArchiveDesc: "70+ years of photographs and films documenting Palestinian refugee life.",
      alJazeeraDesc:
        "Comprehensive coverage of Palestinian news, politics, and humanitarian situation.",
      meeDesc:
        "Independent news organization covering Middle East with focus on Palestinian affairs.",
      eintifadaDesc: "Non-profit providing news, analysis, and commentary on Palestinian struggle.",
      mondoweissDesc:
        "News website devoted to covering American foreign policy in the Middle East.",
      "972Desc": "Magazine providing news and analysis from Israeli and Palestinian journalists.",
      occupationMindDesc: "Documentary examining US media coverage of Israel-Palestine conflict.",
      gazaFightsDesc: "Documentary on Gaza's 2018-2019 Great March of Return protests.",
      eyeOnPalDesc:
        "Instagram account documenting daily life, protests, and humanitarian situation in Palestine.",
      pymDesc: "Transnational, independent grassroots organization of Palestinian youth activists.",
    },
    education: {
      title: "Educational Resources",
      description:
        "Teaching materials, historical context, books, and curricula for learning about Palestinian history and heritage.",
      teachingResourcesSection: "Teaching Resources & Curricula",
      historicalContextSection: "Historical Context & Timelines",
      booksSection: "Books & Publications",
      youthResourcesSection: "Youth & Children's Resources",
      zinnDesc:
        "Free downloadable lessons and resources for teaching Palestine in K-12 classrooms.",
      t4cDesc:
        "Booklist of vetted children's and young adult titles on Palestine, from Teaching for Change.",
      rethinkingDesc:
        "Social justice education publisher with a collection of Palestine teaching resources.",
      timelineDesc:
        "Interactive visual timeline of key events in Palestinian history from 1799 to present.",
      nakbaArchiveDesc:
        "Digital archive documenting the 1948 Nakba through survivor testimonies and historical records.",
      ipsDesc:
        "Oldest institute in the world devoted exclusively to documentation and research on Palestinian affairs.",
      khalidiDesc:
        "Definitive history of modern Palestine from leading historian at Columbia University.",
      pappeDesc:
        "Groundbreaking historical account of systematic expulsion of Palestinians in 1947-1949.",
      masalhaDesc: "Comprehensive history challenging colonial narratives about Palestine's past.",
      pisforpalDesc:
        "Alphabet book introducing children to Palestinian culture, food, and history.",
      sittisKeyDesc: "Children's story about Palestinian family memory and connection to homeland.",
    },
    legal: {
      title: "Legal & Advocacy",
      description:
        "International court cases, legal advocacy organizations, UN resolutions, and advocacy campaigns for Palestinian rights.",
      internationalCourtsSection: "International Courts & Tribunals",
      legalAdvocacySection: "Legal Advocacy Organizations",
      unResolutionsSection: "UN Resolutions & Reports",
      advocacyCampaignsSection: "Advocacy Campaigns",
      icjCaseDesc:
        "Historic case alleging violations of Genocide Convention in Gaza, filed December 2023.",
      iccInvestigationDesc:
        "Ongoing investigation into alleged war crimes in occupied Palestinian territory since 2021.",
      unRapporteurDesc:
        "UN expert monitoring and reporting on human rights situation in occupied territories.",
      ccrDesc: "Non-profit legal advocacy organization defending constitutional and human rights.",
      palLegalDesc:
        "Organization protecting the rights of Palestine advocates in the United States.",
      adalahDesc: "Legal center working to protect rights of Palestinian citizens of Israel.",
      alhaqLegalDesc:
        "Palestinian human rights organization providing legal representation and documentation.",
      gaResolutionsDesc:
        "Collection of General Assembly resolutions on Palestinian rights and self-determination.",
      scResolutionsDesc:
        "Security Council resolutions on the question of Palestine.",
      unCommitteeDesc: "Committee supporting inalienable rights of Palestinian people since 1975.",
      bdsDesc:
        "Palestinian-led movement for boycott, divestment, and sanctions until international law compliance.",
      jvpDesc:
        "Organization of Jewish Americans advocating for Palestinian rights and end to occupation.",
      ampDesc:
        "Grassroots organization educating the public about Palestine and supporting activism.",
      uscprDesc: "National coalition working to change US policy toward Palestine/Israel.",
    },
    trackers: {
      title: "Other Heritage Trackers",
      description:
        "Similar projects documenting heritage destruction and conflict in other regions, plus global documentation platforms.",
      palestineSection: "Palestine-Specific Trackers",
      syriaSection: "Syria Heritage Trackers",
      yemenSection: "Yemen Conflict Documentation",
      ukraineSection: "Ukraine Heritage Protection",
      globalSection: "Global Heritage & Conflict Documentation",
      openMapsDesc:
        "Interactive maps of Palestinian geography, demolished villages, and cultural sites.",
      vizPalDesc:
        "Data-driven storytelling about Palestine through infographics and visualizations.",
      syrianArchiveDesc:
        "Digital register of Syrian cultural heritage built from over 300,000 archived items.",
      dayAfterDesc:
        "Syrian civil society organization working on heritage protection and post-conflict planning.",
      asorSyriaDesc: "Weekly reports on cultural heritage destruction in Syria since 2014.",
      yemenDataDesc: "Independent project documenting airstrikes and civilian casualties in Yemen.",
      yemenArchiveDesc:
        "Digital archive preserving documentation of Yemen conflict for accountability.",
      ukraineLabDesc:
        "Real-time monitoring of cultural heritage sites at risk in Ukraine using satellite imagery.",
      smithsonianDesc:
        "Initiative protecting cultural heritage threatened by conflict and natural disasters worldwide.",
      bellingcatDesc:
        "Investigative journalism network using open-source data to document conflicts globally.",
      syrianArchiveOrgDesc:
        "Preserving and verifying digital documentation of human rights violations in Syria.",
      mnemonicDesc:
        "Organization archiving digital documentation from conflict zones for justice and accountability.",
    },
  },
};
