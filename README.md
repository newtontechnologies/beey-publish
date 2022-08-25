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
