# Timeline Tutorial - Satellite Comparison Guide

**Want to see before/after satellite imagery? You're in the right place.**

The Timeline page gives you access to **186 historical satellite images** from 2014-2025, with powerful side-by-side comparison tools. This page looks complex, but it's designed for one purpose: **show visual evidence of heritage destruction**.

---

## What You're Looking At

The Timeline page has **4 main areas**:

```
┌─────────────────────────────────────────────────────────┐
│  1. FILTER BAR (Top)                                    │
│     Filter which sites you see                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ 2. SATELLITE MAP │  │  (Comparison     │             │
│  │    Full-screen   │  │   Mode Shows     │             │
│  │    satellite     │  │   Two Maps)      │             │
│  │    imagery       │  │                  │             │
│  └──────────────────┘  └──────────────────┘             │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 3. WAYBACK SLIDER                               │    │
│  │    186 historical satellite images              │    │
│  │    2014 ────────────────────────────── 2025     │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 4. SITE TIMELINE                                │    │
│  │    Destruction events (red dots)                │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

This guide will show you how to use each area to investigate destruction events.

---

## Single Map Mode (Default) - Simple Satellite View

When you first load the page, you'll see **one full-screen map** showing satellite imagery.

### What You See

**Satellite Map:**
- Full-screen satellite view of Gaza
- Green date label at top: **"Dec 15, 2024"** (or current Wayback release)
- Site markers show heritage sites as colored dots
- Each marker's color indicates status (red = destroyed, orange = damaged, etc.)

**Map Settings (Bottom-Left):**
- **☑ Zoom to Site**: Automatically zoom when you select a site
- **☑ Show Map Markers**: Toggle visibility of site markers
  - Tip: Turn off markers for clearer satellite imagery

**How It Works:**
- Drag the **Wayback Slider** (below map) to change which date's satellite imagery you see
- Map updates to show imagery from that date
- Date label updates to show current selection

### Quick Start (30 seconds)

1. Look at the Wayback Slider (section 3 below the map)
2. Find the **green handle** (scrubber)
3. **Drag it left/right** → Map updates to show different dates
4. Notice the **date label** at top of map changes

**That's it!** You're now viewing historical satellite imagery.

---

## Comparison Mode - Side-by-Side Before/After

This is where the Timeline page really shines. **Compare two different dates side-by-side.**

### How to Enable

**Click "Comparison Mode" button** above the Wayback Slider

### What Changes

**Two Maps Appear:**
```
┌───────────────────┐  ┌───────────────────┐
│ BEFORE            │  │ AFTER             │
│ Yellow: Oct 1 '23 │  │ Green: Nov 1 '23  │
│                   │  │                   │
│ [Older imagery]   │  │ [Newer imagery]   │
│                   │  │                   │
│ ☑ Zoom ☑ Markers  │  │ ☑ Zoom ☑ Markers  │
└───────────────────┘  └───────────────────┘
```

**Two Scrubbers Appear:**
- **Yellow scrubber** (below timeline): Controls "Before" map (left)
- **Green scrubber** (above timeline): Controls "After" map (right)

**Synchronized Movement:**
- Pan one map → Other map follows
- Zoom one map → Other map matches
- Select a site → Both maps show it

### Comparison Interval Dropdown

**Located above Wayback Slider, next to Comparison Mode button**

**Options:**
- **1 Day Before**: Before = After minus 1 day
- **1 Week Before**: Before = After minus 1 week
- **1 Month Before**: Before = After minus 1 month (default)
- **3 Months Before**: Before = After minus 3 months
- **6 Months Before**: Before = After minus 6 months
- **1 Year Before**: Before = After minus 1 year
- **Custom**: Drag scrubbers independently

**How It Works:**
1. Select an interval (e.g., "1 Month Before")
2. Drag the **green scrubber** (After date)
3. **Yellow scrubber** automatically moves to maintain the interval
4. Example: Green at Nov 1 2023 → Yellow at Oct 1 2023 (1 month before)

**Why This Is Useful:**
- Quickly compare "immediately before" vs "immediately after" destruction
- No need to calculate dates manually
- Ensures you're seeing the right time window

---

## Wayback Slider - 186 Historical Images

This is the **core control** of the Timeline page. It lets you select from 186 satellite image releases.

### Understanding the Slider

**Visual Elements:**
```
        Green Scrubber ◉
2014    2016    2018    2020    2022    2024
│││││││││││││││││││││││││││││││││││││││││││
●────────────●─●────────────●──────●
◉ Yellow Scrubber (Comparison Mode only)
```

**Year Labels:**
- **2014, 2016, 2018...**: Positioned at actual dates
- Spaced proportionally (not evenly)

**Gray Lines:**
- **186 vertical tick marks**: One per satellite image release
- Notice they get **denser** in recent years (more frequent captures)
- Early years (2014-2018): ~4-6 images per year
- Recent years (2023-2025): ~12-20 images per year

**Red Dots:**
- Each dot = one heritage site destroyed
- Multiple dots stack vertically if destroyed on same date
- Click dot → highlights that site on map

**Scrubbers:**
- **Green handle** (always visible): "After" date
- **Yellow handle** (comparison mode): "Before" date

### Interactions

**Dragging:**
- Click and drag either scrubber to change dates
- Map updates in real-time
- Snaps to closest of 186 available releases

**Clicking Timeline:**
- Click anywhere on timeline
- Closest scrubber moves to that position
- If both scrubbers visible → moves whichever is closer

**Previous/Next Buttons:**
- **Previous ⏮**: Jump to previous Wayback release (left)
- **Next ⏭**: Jump to next Wayback release (right)
- Works on whichever scrubber was moved last

**Keyboard Shortcuts:**
- **Left/Right Arrows**: Move to previous/next release
- **PageUp/PageDown**: Jump 10 releases
- **Home**: First release (2014)
- **End**: Last release (2025)

**Tooltips:**
- Hover over timeline → Shows exact date
- Helpful for finding specific dates

---

## Site Timeline - Destruction Events

The site timeline is the app's landing view; the comparison controls below hook into it.

### What It Shows

**Visual Elements:**
- Horizontal timeline with year markers
- Red dots for destruction events
- Navigation buttons (Previous/Next/Reset)

### Special Feature: Sync Map on Dot Click

**Toggle (Bottom-Left): ☑ Sync map on dot click**

**When ON:**
1. Click any red dot
2. Site highlights on map
3. **Wayback scrubber automatically jumps** to find imagery showing the destruction
4. In Comparison Mode:
   - Green scrubber → First imagery AFTER destruction date
   - Yellow scrubber → Calculated "before" date based on interval

**When OFF:**
1. Click any red dot
2. Site highlights on map
3. Wayback scrubber stays where it is (you control it manually)

**Why This Matters:**
- **ON** = "Show me satellite evidence of this destruction" (automatic)
- **OFF** = "I'll manually find the imagery I want" (manual control)

### Reset Button

- Resets Wayback scrubbers to initial positions
- Useful after exploring many dates
- One click to start over

---

## Your First Investigation - Try This! (5 minutes)

Let's investigate a real destruction event step by step.

### Step 1: Find a Destroyed Site (1 minute)

**Using Filter Bar:**
1. Click "Status" button at top
2. Check "Destroyed"
3. See filtered sites appear as markers on map

**Using Site Timeline:**
1. Look at bottom timeline
2. Find a red dot (destruction event)
3. Click it
4. Site highlights on map

### Step 2: Enable Comparison Mode (30 seconds)

1. Click **"Comparison Mode"** button above Wayback Slider
2. Screen splits into two maps
3. Yellow and green scrubbers appear
4. Set interval to **"1 Month Before"**

### Step 3: Auto-Sync to Destruction Date (1 minute)

1. Make sure **"Sync map on dot click"** is checked (bottom-left)
2. Click a **red dot** on Site Timeline
3. Watch what happens:
   - Site highlights on both maps
   - Green scrubber jumps to first imagery AFTER destruction
   - Yellow scrubber jumps to 1 month before
   - Date labels update on both maps

4. You're now seeing **before/after** imagery automatically!

### Step 4: Examine the Evidence (2 minutes)

**Left Map (Before):**
- Yellow date label shows date before destruction
- See the site intact (if imagery resolution allows)
- Note surrounding buildings and structures

**Right Map (After):**
- Green date label shows date after destruction
- Compare to left map
- Look for changes: rubble, damage, cleared areas

**Adjust as Needed:**
- **Zoom in** for closer look (both maps zoom together)
- **Pan** to see surrounding context
- **Change interval** if you need wider/narrower time window
- **Drag scrubbers** manually for precise dates

### Step 5: Try Another Site (30 seconds)

1. Click different red dot on Site Timeline
2. Scrubbers automatically jump to new dates
3. Maps update to show new location
4. Compare before/after for this site

**Congratulations!** You've just conducted satellite-based verification of heritage destruction.

---

## Advanced Techniques

### Finding the Best Imagery

**Problem:** Sometimes imagery is cloudy or low-resolution.

**Solution:**
1. Look at gray tick marks on Wayback Slider
2. Notice how they're denser in recent years
3. For recent events (2023+), try multiple nearby releases
4. Use Previous/Next buttons to step through options
5. Pick the clearest imagery

### Investigating Gradual Damage

**Problem:** Site wasn't destroyed in one event - damage occurred over months.

**Solution:**
1. Turn OFF "Sync map on dot click"
2. Manually drag green scrubber through time
3. Watch the site change step by step
4. Note when damage first appears, worsens, etc.
5. In Comparison Mode, keep yellow scrubber at "initial intact" and move green scrubber forward

### Documenting Multiple Sites in One Area

**Problem:** Want to compare destruction in a specific neighborhood.

**Solution:**
1. Use Filter Bar → Search for neighborhood name
2. Zoom to that area on maps
3. Turn OFF "Zoom to Site" (so map doesn't jump when you click sites)
4. Click through red dots on timeline
5. Sites highlight one by one, but map stays on same area
6. Take screenshots for each site with before/after imagery

### Creating a Presentation

**Problem:** Need before/after images for a report.

**Solution:**
1. Enable Comparison Mode
2. Select site from Site Timeline
3. Adjust Comparison Interval to show desired time window
4. Use Previous/Next to find clearest imagery
5. Take screenshot (Ctrl+Shift+S in most browsers)
6. Repeat for other sites
7. Click site name → Opens modal with full details and sources
8. Copy source citations for attribution

---

## Common Questions

### "Why are some dates missing?"

**186 satellite releases** means ~186 specific dates from 2014-2025.

- **Not every day** has imagery (satellites don't capture daily)
- **Early years** have fewer captures (4-6 per year)
- **Recent years** have more frequent captures (12-20 per year)
- Scrubber **snaps to closest available** release

### "What's the difference between the two timelines?"

**Wayback Slider (middle):**
- Controls which **satellite imagery** you see
- 186 releases from 2014-2025
- Gray lines show available imagery dates

**Site Timeline (bottom):**
- Shows when **sites were destroyed**
- Red dots are destruction events

### "Why does 'Sync map on dot click' sometimes jump to unexpected dates?"

The system finds the **first available Wayback release AFTER** the destruction date.

**Example:**
- Site destroyed: October 15, 2023
- Next available imagery: November 3, 2023
- Green scrubber jumps to Nov 3 (closest imagery showing aftermath)

**Why?**
- Satellites don't capture every day
- System picks earliest post-destruction evidence
- You can manually adjust scrubbers if needed

### "Can I see the exact date of each satellite image?"

**Yes!** Three ways:
1. **Hover** over Wayback Slider → Tooltip shows date
2. **Look at date label** on map (top center)
3. **Drag scrubber** → Date label updates in real-time

### "How do I zoom to a site without Comparison Mode jumping around?"

**Two options:**
1. **Turn OFF "Zoom to Site"** in map settings (bottom-left)
   - Manually zoom/pan to area you want
   - Click sites → They highlight, but map stays put

2. **Use Custom interval**
   - Set Comparison Interval to "Custom"
   - Click site
   - Scrubbers won't auto-jump
   - Manually adjust as needed

### "What does 'Adaptive zoom' mean in the date labels?"

**Background:**
- ESRI Wayback imagery quality varies by date
- Recent imagery (2022+): Higher resolution → Zoom level 18
- Older imagery (pre-2022): Lower resolution → Zoom level 17

**What you see:**
- System automatically adjusts zoom based on imagery date
- You don't need to do anything
- Ensures best viewing experience

### "Can I compare two dates from the same year?"

**Yes!**
1. Enable Comparison Mode
2. Set interval to "Custom"
3. Drag yellow scrubber to first date
4. Drag green scrubber to second date
5. Both scrubbers move independently

**Example:** Compare January 2024 vs. March 2024

---

## Map Settings Explained

Each map has two toggles in the **bottom-left corner**:

### ☑ Zoom to Site

**When ON:**
- Clicking a site → Map automatically zooms to that location
- Useful for quick exploration of multiple sites

**When OFF:**
- Clicking a site → Site highlights, but map stays at current zoom/position
- Useful when comparing multiple sites in one area

**Tip:** Turn OFF when investigating a neighborhood with multiple sites.

### ☑ Show Map Markers

**When ON:**
- All filtered sites show as colored markers
- Colors indicate status (red = destroyed, etc.)
- Useful for spatial context

**When OFF:**
- Only selected site marker appears
- Clearer satellite imagery (no clutter)
- Useful for examining fine details

**Tip:** Turn OFF for presentations/screenshots - cleaner imagery.

---

## Comparison Mode vs. Single Mode - When to Use Each

### Use Single Mode When:

✅ Browsing through history of one site
- Drag scrubber through time
- Watch site change over months/years

✅ Finding the best imagery
- Quickly step through releases (Previous/Next)
- Pick clearest image

✅ Getting overview of area
- Pan around Gaza
- See current state

### Use Comparison Mode When:

✅ Investigating a destruction event
- See before/after side by side
- Compare intact vs. damaged/destroyed

✅ Creating documentation
- Screenshot both maps for reports
- Visual proof of change

✅ Verifying destruction dates
- Confirm site intact in "before" imagery
- Confirm site damaged in "after" imagery

✅ Presenting to others
- Side-by-side is more convincing
- Easier for audience to understand

---

## Tips for Different Users

### Journalists

**Verifying Reports:**
1. Filter by Destruction Date (e.g., "October 2023")
2. Enable Comparison Mode with 1-week interval
3. Click site on timeline → Auto-syncs to destruction date
4. Screenshot before/after imagery
5. Click site name → Copy sources for citations

**Finding Stories:**
1. Play through Site Timeline (Previous/Next)
2. Watch how destruction accelerated in certain periods
3. Look for clusters of destruction in specific areas
4. Use Filter Bar to find unique sites (UNESCO listed, etc.)

### Researchers

**Data Collection:**
1. Systematically go through all sites (export via the filter bar's CSV/JSON/GeoJSON buttons)
2. For each destroyed site:
   - Enable Comparison Mode
   - Find clearest before/after imagery
   - Note exact dates of imagery used
   - Screenshot both maps
   - Record coordinates and sources
3. Export filtered results to CSV with destruction dates

**Temporal Analysis:**
1. Use Site Timeline to identify destruction patterns
2. Note clustering of events (many sites destroyed in short period)
3. Compare satellite imagery quality over time
4. Cross-reference with other sources in site details modal

### Educators

**Teaching Historical Events:**
1. Filter to specific time period
2. Enable Comparison Mode with 1-month interval
3. Click through sites destroyed during that period
4. Use date labels to discuss timeline
5. Show sources (click site name → scroll to Sources section)

**Visual Storytelling:**
1. Start with Site Timeline showing all events
2. Click first red dot → Show intact site
3. Progress through timeline → Show gradual destruction
4. Use Comparison Mode for dramatic before/after
5. Discuss verified sources and documentation methods

### Activists & Advocates

**Creating Awareness:**
1. Use Filter Bar to show scale (e.g., "70 mosques destroyed")
2. Comparison Mode for powerful visuals
3. Screenshot side-by-side maps for social media
4. Include date labels in screenshots (built-in to maps)
5. Click site name → Share verified sources

**Countering Misinformation:**
1. Point to verified sources (UNESCO, Forensic Architecture)
2. Show exact dates of satellite imagery
3. Demonstrate transparency (all sources linked)
4. Use before/after to show undeniable evidence

---

## Keyboard Shortcuts Reference

### Wayback Slider
- **Left/Right Arrows**: Previous/Next release
- **PageUp/PageDown**: Jump 10 releases
- **Home**: First release (2014)
- **End**: Last release (2025)

### Site Timeline
- **Left/Right Arrows**: Previous/Next destruction event
- **Home**: First event
- **End**: Last event
- **Space**: (Play/Pause hidden on Timeline page)

### General
- **Tab**: Navigate between controls
- **Enter**: Activate button
- **Escape**: Close modal/dropdown

---

## Technical Details

### ESRI Wayback Archive

**What It Is:**
- Collection of historical satellite imagery from ESRI
- 186 releases from 2014-2025
- Publicly available (no API key required)
- Updates regularly with new releases

**Image Quality:**
- Resolution improves in recent years
- Some dates have cloud cover
- Not all areas captured at same frequency
- Gaza coverage: Good (high-interest area)

**Frequency:**
- Early years (2014-2018): ~4-6 releases/year
- Middle years (2019-2022): ~8-12 releases/year
- Recent years (2023-2025): ~12-20 releases/year

### Performance

**Optimization:**
- Imagery loaded on-demand (not all 186 at once)
- Map tiles cached for faster viewing
- Scrubber snapping prevents excessive requests
- Lazy loading for smooth performance

**Best Experience:**
- Modern browser (Chrome, Firefox, Safari, Edge)
- Broadband internet (satellite tiles are large)
- Screen width: 1024px minimum for side-by-side

---

## Accessibility

### Keyboard Users
- Full keyboard navigation support
- All controls accessible via Tab
- Scrubbers draggable with arrow keys
- Focus visible on all interactive elements

### Screen Readers
- ARIA labels on all controls
- Date changes announced
- Site selections announced
- Comparison mode state announced

### Visual Accessibility
- Date labels: 70% opacity on dark background
- High contrast markers
- 1.5x larger tooltips for better readability
- Color-blind friendly (status indicated by both color and labels)

---

## Troubleshooting

### "Maps won't load"
- Check internet connection (satellite tiles are large)
- Refresh page (F5)
- Clear browser cache
- Try different browser

### "Scrubber not moving"
- Click directly on handle (not timeline background)
- Drag smoothly (don't click-and-release too fast)
- Use Previous/Next buttons instead
- Try keyboard arrows

### "Can't see site markers"
- Check "Show Map Markers" is ON (bottom-left)
- Zoom in (markers may be too small at low zoom)
- Check Filter Bar (site may be filtered out)
- Site may not have coordinates (rare)

### "Before/After looks the same"
- Some sites have minimal visible changes from satellite
- Try adjusting comparison interval (wider time window)
- Zoom in closer
- Check if imagery is cloudy (try Previous/Next release)
- Some destruction not visible from satellite altitude

### "Page is slow"
- Close other tabs (satellite imagery is memory-intensive)
- Disable browser extensions temporarily
- Check internet speed (large tile downloads)
- Refresh page to clear memory

---

## Key Takeaways

**Remember:**
1. **Wayback Slider** = Choose which satellite image to view (186 options)
2. **Comparison Mode** = See before/after side-by-side
3. **Site Timeline** = Find destruction events
4. **Sync map on dot click** = Automatically jump to relevant imagery
5. **Comparison Interval** = Set time window between before/after

**Start Simple:**
- Pick a site from Site Timeline (click red dot)
- Enable Comparison Mode
- Let "Sync map on dot click" do the work
- Look at before/after imagery

**Get Advanced:**
- Turn off auto-sync
- Manually drag scrubbers
- Find optimal imagery releases
- Compare multiple time periods

---

## Ethical Reminder

This tool documents **real destruction** of cultural heritage sites.

**Please use responsibly:**
- Respect the significance of these sites
- Verify information before sharing
- Cite sources when using data
- Use for education, research, advocacy - not sensationalism
- Remember these represent loss to Palestinian culture and history

**Every site represents:**
- Cultural heritage lost
- Community gathering places destroyed
- Historical connections severed
- Irreplaceable artifacts and architecture

---

*Last updated: 2026-09-26 (post single-page-app cleanup)*
