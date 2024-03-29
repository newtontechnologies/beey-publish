# Beey Publish

JavaScript library for publishing [Beey](https://www.beey.io/en/) transcriptions with recordings on third-party web pages.

## 🔌 Include in your project 

Install with

```
npm install @beey/publish
```

or 

```
yarn add @beey/publish
```

or use CDN (see below)

```
https://unpkg.com/@beey/publish@latest
```

Include using NPM or Yarn

```js
import BeeyPublish from '@beey/publish';
import '@beey/publish/dist/beey-publish.css';
```

or CDN

```html
<link rel="stylesheet" href="https://unpkg.com/@beey/publish@latest/dist/beey-publish.min.css" />

<script type="module">
  import BeeyPublish from 'https://unpkg.com/@beey/publish@latest/dist/beey-publish.min.js';
  
  // ...
</script>
```

## 🔨 Usage

This library uses the TRSX format for transcriptions.

```js
const container = document.querySelector('#publish-container');

const publish = new BeeyPublish(container, {
  media: {
    url: '<url of audio/video file>'
  },
});

await publish.loadTrsx({
  url: '<url of TRSX file>',
});
```

You can also load TRSX as a string:

```js
await publish.loadTrsx({
  content: '<?xml ...',
});
```

If you want to use player and transcription separately, specify two containers:

```js
const publish = new BeeyPublish(
  {
    playerParent: playerContainer,
    transcriptParent: transcriptContainer,
  }, 
  {
    media: {
      // ...
    },
  },
);
```
### Media player control
Accessing the media player for programmatic control.

E.g. change volume programmatically (number in unit interval [0,1]):

```js
publish.mediaPlayer.volume = 0.3
```
### Styling keywords

Adding keywords for highlighting in CSS:

```js
publish.loadTrsx({
  url: '<url of TRSX file>'
}).then(() => fetch('<url of keywords JSON>'))
  .then((resp) => resp.json())
  .then((json) => publish.attachKeywords(json))
```

Example of keywords JSON, CSS styles to be added according to id with prefix pkw- (e.g. pkw-entity-person)

```json
[
  {
    "text": "Tom Cruise",
    "group": {
      "id": "entity-person",
      "label": "Person"
    },
    "mentions": [
      { "indices": [31, 32] },
      { "indices": [138, 139] },
      { "indices": [461, 462] },
      { "speakerId": 2,
        "accent" ["role", "surname"]
      }
    ]
  },
  {
    "text": "Top Gun",
    "group": {
      "id": "entity-movie",
      "label": "Movie"
    },
    "mentions": [
      { "indices": [17, 18] },
      { "indices": [66, 67] },
      { "speakerId": 1,
        "accent": "firstname"
      }
    ]
  },
  {
    "text": "Václav Rybář",
    "group": {
      "id": "entity-guest",
      "label": "Host"
    },
    "mentions": [
      { "indices": [51, 52] },
      { "speakerId": 1 }
    ]
  },
   {
    "text": "republika",
    "group": [
      {
        "id": "#E0id1",
        "label": "Česko"
      },
      {
        "id": "#E0M",
        "label": "Česko"
      }
    ],
    "mentions": [
      { "indices": [294, 295] },
      { "indices": [498] }
    ]
  },
]
```
It is possible to style speaker's parts (first name, surname and role) separately. If needed, add "accent" property to keyword JSON as showed above. Accent can be either array of strings or string ("firstname", "surname" or "role"). If accent is not present, all three speaker's parts will get the CSS class.

To style a keyword group with id `entity-person` in phrases, create a CSS class `pkw-entity-person` and apply CSS accordingly:

```css
.pkw-entity-person {
  color: blue;
  background-color: yellow;
}
```

To style a keyword group with id `entity-guest` in a speaker, create a CSS class `skw-entity-guest` and apply CSS accordingly:

```css
.skw-entity-quest {
  color: white;
  background-color: orange;
}
```

### Localization

Changing localization (to Czech, Polish or Slovak):

```html
<script type="module">
import cz from 'https://unpkg.com/@beey/publish@latest/dist/locale/cs-CZ.json' assert {type: 'json'};
const publish = new BeeyPublish(container, {
  media: {
    url: '<url of audio/video file>',
  },
  subtitlesUrl: '<url of vtt file>',
  locale: cz
});

await publish.loadTrsx({
  url: '<url of TRSX file>',
});
</script>
```
