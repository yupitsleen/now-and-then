/**
 * Internationalization (i18n) type definitions
 *
 * Defines structure for multi-language support including
 * translation keys, locale configuration, and RTL support.
 */

/**
 * Supported locale codes (BCP 47 language tags)
 */
export type LocaleCode = "en" | "ar" | "it";

/**
 * Text direction for locale
 */
export type TextDirection = "ltr" | "rtl";

/**
 * Locale configuration
 */
export interface LocaleConfig {
  /** BCP 47 locale code */
  code: LocaleCode;

  /** Full BCP 47 tag for date/number formatting */
  bcp47: string;

  /** Display name in English */
  name: string;

  /** Display name in native language */
  nativeName: string;

  /** Text direction */
  direction: TextDirection;

  /** Whether this is the default locale */
  isDefault?: boolean;
}

/**
 * Translation namespace structure
 *
 * Organizes translations by feature area for better maintainability.
 */
export interface Translations {
  /** Common UI elements */
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    reset: string;
    apply: string;
    clear: string;
    search: string;
    filter: string;
    export: string;
    share: string;
    info: string;
    help: string;
    settings: string;
    about: string;
    na: string; // "N/A"
    unknown: string; // "Unknown"
  };

  /** Header navigation */
  header: {
    title: string;
    /** Location shown in red after the brand name: "Now & Then: Gaza" */
    location: string;
    subtitle: string;
    dashboard: string;
    data: string;
    timeline: string;
    statistics: string;
    helpPalestine: string;
    about: string;
    resources: {
      title: string;
      donate: string;
      organizations: string;
      research: string;
      media: string;
      education: string;
      legal: string;
      trackers: string;
      howItWorks: string;
    };
  };

  /** Map component */
  map: {
    streetView: string;
    satelliteView: string;
    baseline2014: string;
    preConflict2023: string;
    current: string;
    zoomIn: string;
    zoomOut: string;
    showSiteMarkers: string;
    switchTo: string;
    satelliteImagery: string;
  };

  /** Timeline component */
  timeline: {
    play: string;
    pause: string;
    playTooltip: string;
    speed: string;
    syncMap: string;
    showUnknownDates: string;
    showUnknownDatesTooltip: string;
    zoomToSite: string;
    showMapMarkers: string;
    comparisonMode: string;
    dateRange: string;
    startDate: string;
    endDate: string;
    previous: string;
    previousAriaLabel: string;
    previousTitle: string;
    next: string;
    nextAriaLabel: string;
    nextTitle: string;
    dateFilter: string;
    from: string;
    to: string;
    clear: string;
    clearFilter: string;
    keyboard: string;
    playPause: string;
    step: string;
    jump: string;
    tooltipDefault: string;
    tooltipAdvanced: string;
    tooltipImagery: string;
    interval: string;
    intervalAsLargeAsPossible: string;
    intervalAsLargeAsPossibleTooltip: string;
    intervalAsSmallAsPossible: string;
    intervalAsSmallAsPossibleTooltip: string;
    interval1Month: string;
    interval1MonthTooltip: string;
    interval1Year: string;
    interval1YearTooltip: string;
    interval5Years: string;
    interval5YearsTooltip: string;
    syncMapVersion: string;
    syncMapVersionTooltip: string;
    mapVersionRange: string;
    mapVersionRangeTooltip: string;
    beforeImageryDate: string;
    afterImageryDate: string;
    manualMapVersion: string;
    manualMapVersionTooltip: string;
    unknownDate: string;
    noImageryAvailable: string;
    separateTimelines: string;
    separateTimelinesTooltip: string;
    tabImagery: string;
    tabSites: string;
    advancedSettings: string;
    showImagerySlider: string;
    showImagerySliderTooltip: string;
    darkMode: string;
    language: string;
  };

  /** Table component */
  table: {
    name: string;
    type: string;
    status: string;
    yearBuilt: string;
    dateDestroyed: string;
    location: string;
    verifiedBy: string;
    compact: string;
    expanded: string;
    mobile: string;
    viewDetails: string;
    sortBy: string;
    heritageSites: string;
    expandTable: string;
    selectExportFormat: string;
    export: string;
    siteName: string;
    destructionDate: string;
    destructionDateGregorian: string;
    destructionDateIslamic: string;
    surveyDate: string;
    builtGregorian: string;
    builtIslamic: string;
    showing: string;
    site: string;
    sites: string;
    islamic: string;
    description: string;
    coordinates: string;
    sources: string;
    tooltip: string;
    tooltipDashboard: string;
    tooltipDataPage: string;
    lastUpdated: string;
    showIslamicDates: string;
  };

  /** Filter bar */
  filters: {
    filters: string;
    filterActive: string;
    settings: string;
    sites: string;
    clear: string;
    clearAll: string;
    searchPlaceholder: string;
    search: string;
    clearSearch: string;
    openFilters: string;
    hideFilters: string;
    showFilters: string;
    switchToSidebar: string;
    switchToTopBar: string;
    typeFilter: string;
    statusFilter: string;
    allTypes: string;
    allStatuses: string;
    creationYearRange: string;
    destructionDateRange: string;
    applyFilters: string;
    clearFilters: string;
    siteType: string;
    type: string;
    selectTypes: string;
    status: string;
    selectStatus: string;
    destructionDate: string;
    yearBuilt: string;
    showingCount: string;
    apply: string;
    closeFilters: string;
    fromDate: string;
    toDate: string;
    fromYear: string;
    toYear: string;
  };

  /** Site types */
  siteTypes: {
    mosque: string;
    church: string;
    archaeological: string;
    museum: string;
    historicBuilding: string;
    hospital: string;
    school: string;
    monument: string;
    cemetery: string;
    archive: string;
  };

  /** Site statuses */
  siteStatus: {
    destroyed: string;
    heavilyDamaged: string;
    looted: string;
    damaged: string;
    abandoned: string;
    unknown: string;
    unharmed: string;
  };

  /** Statistics dashboard */
  stats: {
    title: string;
    totalSites: string;
    destroyed: string;
    damaged: string;
    ancientSites: string;
    legalFramework: string;
    notableLosses: string;
  };

  /** Timeline page */
  timelinePage: {
    title: string;
    backToMain: string;
    releases: string;
    satelliteDates: string;
    siteDestruction: string;
    playAnimation: string;
    pauseAnimation: string;
    resetTimeline: string;
    nextEvent: string;
    previousEvent: string;
    waybackTooltip: string;
  };

  /** Site detail panel */
  siteDetail: {
    overview: string;
    historicalSignificance: string;
    culturalValue: string;
    sources: string;
    images: string;
    coordinates: string;
    coordinatesApproximate: string;
    verificationSources: string;
    siteType: string;
    yearBuilt: string;
    status: string;
    dateDestroyed: string;
    surveyDate: string;
    lastUpdated: string;
    description: string;
    whatWasLost: string;
    beforeDestruction: string;
    afterDestruction: string;
    seeMore: string;
  };

  /** Modal dialogs */
  modals: {
    confirmClose: string;
    unsavedChanges: string;
  };

  /** Error messages */
  errors: {
    loadingFailed: string;
    networkError: string;
    notFound: string;
    invalidData: string;
    exportFailed: string;
    somethingWrong: string;
    unexpectedError: string;
    tryAgain: string;
    persistsContact: string;
  };

  /** Accessibility labels */
  aria: {
    openMenu: string;
    closeMenu: string;
    toggleTheme: string;
    toggleLanguage: string;
    filterControl: string;
    timelineControl: string;
    mapControl: string;
    switchToLightMode: string;
    switchToDarkMode: string;
    viewGithub: string;
    helpPalestineDonate: string;
    aboutHeritageTracker: string;
    resizeTable: string;
    dragToResizeTable: string;
    clearSearch: string;
  };

  /** Pagination component */
  pagination: {
    showingPage: string;
    of: string;
    totalSites: string;
    previous: string;
    next: string;
    goToPage: string;
  };

  /** Loading states */
  loading: {
    message: string;
    pleaseWait: string;
  };

  /** Donate modal */
  donate: {
    title: string;
    description: string;
    focus: string;
    donateButton: string;
    disclaimer: string;
    disclaimerText: string;
    organizationsSection: string;
    unrwaDesc: string;
    mapDesc: string;
    pcrfDesc: string;
    msfDesc: string;
  };

  /** Footer component */
  footer: {
    title: string;
    sources: string;
    github: string;
    donate: string;
    about: string;
    copyright: string;
    lastUpdated: string;
  };

  /** Map legend */
  legend: {
    colorKey: string;
  };

  /** Resources pages */
  resources: {
    organizations: {
      title: string;
      description: string;
      heritageSection: string;
      humanRightsSection: string;
      humanitarianSection: string;
      legalSection: string;
      unescoDesc: string;
      h4pDesc: string;
      forensicDesc: string;
      alhaqDesc: string;
      btselemDesc: string;
      amnestyDesc: string;
      hrwDesc: string;
      unrwaDesc: string;
      mapDesc: string;
      pcrfDesc: string;
      icjDesc: string;
      iccDesc: string;
    };
    research: {
      title: string;
      description: string;
      officialReportsSection: string;
      documentationSection: string;
      academicSection: string;
      databasesSection: string;
      unescoReportDesc: string;
      ochaDesc: string;
      unrwaReportsDesc: string;
      forensicProjectsDesc: string;
      airwarsDesc: string;
      euromedDesc: string;
      palestineStudiesDesc: string;
      holyLandJournalDesc: string;
      meripDesc: string;
      openMapsDesc: string;
      rememberedDesc: string;
    };
    media: {
      title: string;
      description: string;
      photoArchivesSection: string;
      newsOutletsSection: string;
      documentariesSection: string;
      socialMediaSection: string;
      palMuseumDesc: string;
      unrwaArchiveDesc: string;
      alJazeeraDesc: string;
      meeDesc: string;
      eintifadaDesc: string;
      mondoweissDesc: string;
      "972Desc": string;
      occupationMindDesc: string;
      gazaFightsDesc: string;
      eyeOnPalDesc: string;
      pymDesc: string;
    };
    education: {
      title: string;
      description: string;
      teachingResourcesSection: string;
      historicalContextSection: string;
      booksSection: string;
      youthResourcesSection: string;
      zinnDesc: string;
      t4cDesc: string;
      rethinkingDesc: string;
      timelineDesc: string;
      nakbaArchiveDesc: string;
      ipsDesc: string;
      khalidiDesc: string;
      pappeDesc: string;
      masalhaDesc: string;
      pisforpalDesc: string;
      sittisKeyDesc: string;
    };
    legal: {
      title: string;
      description: string;
      internationalCourtsSection: string;
      legalAdvocacySection: string;
      unResolutionsSection: string;
      advocacyCampaignsSection: string;
      icjCaseDesc: string;
      iccInvestigationDesc: string;
      unRapporteurDesc: string;
      ccrDesc: string;
      palLegalDesc: string;
      adalahDesc: string;
      alhaqLegalDesc: string;
      gaResolutionsDesc: string;
      scResolutionsDesc: string;
      unCommitteeDesc: string;
      bdsDesc: string;
      jvpDesc: string;
      ampDesc: string;
      uscprDesc: string;
    };
    trackers: {
      title: string;
      description: string;
      palestineSection: string;
      syriaSection: string;
      yemenSection: string;
      ukraineSection: string;
      globalSection: string;
      openMapsDesc: string;
      vizPalDesc: string;
      syrianArchiveDesc: string;
      dayAfterDesc: string;
      asorSyriaDesc: string;
      yemenDataDesc: string;
      yemenArchiveDesc: string;
      ukraineLabDesc: string;
      smithsonianDesc: string;
      bellingcatDesc: string;
      syrianArchiveOrgDesc: string;
      mnemonicDesc: string;
    };
  };
}

/**
 * Type-safe translation key paths
 *
 * Allows dot-notation access to nested translation keys
 * e.g., "common.loading", "map.satelliteView"
 */
export type TranslationKey =
  | `common.${keyof Translations["common"]}`
  | `header.${keyof Translations["header"]}`
  | `header.resources.${keyof Translations["header"]["resources"]}`
  | `map.${keyof Translations["map"]}`
  | `timeline.${keyof Translations["timeline"]}`
  | `table.${keyof Translations["table"]}`
  | `filters.${keyof Translations["filters"]}`
  | `siteTypes.${keyof Translations["siteTypes"]}`
  | `siteStatus.${keyof Translations["siteStatus"]}`
  | `stats.${keyof Translations["stats"]}`
  | `timelinePage.${keyof Translations["timelinePage"]}`
  | `siteDetail.${keyof Translations["siteDetail"]}`
  | `modals.${keyof Translations["modals"]}`
  | `errors.${keyof Translations["errors"]}`
  | `aria.${keyof Translations["aria"]}`
  | `pagination.${keyof Translations["pagination"]}`
  | `loading.${keyof Translations["loading"]}`
  | `donate.${keyof Translations["donate"]}`
  | `footer.${keyof Translations["footer"]}`
  | `legend.${keyof Translations["legend"]}`
  | `resources.organizations.${keyof Translations["resources"]["organizations"]}`
  | `resources.research.${keyof Translations["resources"]["research"]}`
  | `resources.media.${keyof Translations["resources"]["media"]}`
  | `resources.education.${keyof Translations["resources"]["education"]}`
  | `resources.legal.${keyof Translations["resources"]["legal"]}`
  | `resources.trackers.${keyof Translations["resources"]["trackers"]}`;

/**
 * Translation function type
 */
export type TranslateFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;
