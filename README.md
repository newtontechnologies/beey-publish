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

Accessing the media player for programmatic control.

E.g. change volume programmatically (number in unit interval [0,1]):

```js
publish.mediaPlayer.volume = 0.3
```

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
      "label": "Osoba"
    },
    "mentions": [
      { "indices": [31, 32] },
      { "indices": [138, 139] },
      { "indices": [461, 462] }
    ]
  },
  {
    "text": "Top Gun",
    "group": {
      "id": "entity-movie",
      "label": "Film"
    },
    "mentions": [
      { "indices": [17, 18] },
      { "indices": [66, 67] }
    ]
  }
]
```

Changing localization (to Czech, Polish or Slovak):

```html
<script type="module">
import cz from 'https://unpkg.com/@beey/publish@latest/dist/cs-CZ.json';
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
