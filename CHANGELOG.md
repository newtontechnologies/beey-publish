## 1.8.0 (2022-09-06)
- 🛠 Improvement: redesigned media player to handle width as small as 180px.

## 1.8.0 (2022-08-25)
- ⚠️ Breaking: keyword CSS classes have new: prefixes `pkw-` for phrases, `skw-` for speakers and `tkw-` for timeline.
- ✨ Feature: text autoscrolling when playing media
- 🛠 Improvement: allow programmatic access to media player instance (see readme)
- 🛠 Improvement: hide subtitles button when there are no subtitles
- 🐞 Fix: all keywords are properly cleared before every call to `attachKeywords`
- 🐞 Fix: correctly position 'play from' tooltip when container does not start at the left edge of the page
- 🐞 Fix: CSS class `dropdown` renamed to `speaker-dropdown` to avoid name clashes with frameworks like Bootstrap

## 1.7.0 (2022-07-21)
- ⚠️ Breaking: the unminifed CSS file is now called `dist/beey-publish.css` instead of `dist/styles.css`
- ✨ Feature: speakers are marked with colors in transcript
- ✨ Feature: playing speed is saved to local storage
- ✨ Feature: build for CDN to be able to unclude the library in `<script>` tag
- 🛠 Improvement: cycling colors to allow unlimited number of speakers
- 🛠 Improvement: The player can now automatically detect video. The config property `hasVideo` has been removed.

## 1.6.3 (2022-07-12)

- ✨ Feature: option to select/remove all speakers 
- 🛠 Improvement: behaviour of dropdowns and forms

## 1.6.2 (2022-06-22)

- ✨ Feature: option to load and switch on/off VTT subtitles in video player

## 1.6.1 (2022-06-22)

- 🐞 Fix: information in package.json

## 1.6.0 (2022-06-22)

- ⚠️ Breaking: changed `type` in keywords to `group`. It can also be an array now.
- ✨ Feature: merging consecutive speeches of the same speaker to one speech
- 🛠 Improvement: same generic name for all uknown speakers
- 🛠 Improvement: behaviour of the 'play from word' tooltip
- 🛠 Improvement: minor styling improvements and bugfixes

## 1.6.3 (2022-07-12)

- ✨ Feature: option to select/remove all speakers 
- 🛠 Improvement: behaviour of dropdowns and forms

## 1.6.2 (2022-06-22)

- ✨ Feature: option to load and switch on/off VTT subtitles in video player

## 1.6.1 (2022-06-22)

- 🐞 Fix: information in package.json

## 1.6.0 (2022-06-22)

- ⚠️ Breaking: changed `type` in keywords to `group`. It can also be an array now.
- ✨ Feature: merging consecutive speeches of the same speaker to one speech
- 🛠 Improvement: same generic name for all uknown speakers
- 🛠 Improvement: behaviour of the 'play from word' tooltip
- 🛠 Improvement: minor styling improvements and bugfixes
