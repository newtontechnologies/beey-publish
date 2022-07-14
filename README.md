# Beey Publish

JavaScript library for publishing [Beey](https://www.beey.io/en/) transcriptions with recordings on third-party web pages.

## 📦 Install

```
npm install @beey/publish
```

or 

```
yarn add @beey/publish
```

## 🔨 Usage

This library uses the TRSX format for transcriptions.

```js
import BeeyPublish from '@beey/publish';
import '@beey/publish/dist/style.css';

const container = document.querySelector('#publish-container');

const publish = new BeeyPublish(container, {
  media: {
  },
});

await publish.loadTrsx({
  url: '<url of TRSX file>',
});
```

You can also load TRSX as string:

```js
await publish.loadTrsx({
  content: '<?xml ...',
});
```

If you want to use player and transcription separately:

```js
new BeeyPublish(
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
