# Beey Publish

JavaScript library for publishing Beey transcriptions with recordings on third-party web pages.

## How to use Beey Publish library

1) TRSX as string:
trsxSrc: { url: 'adresa' }
2) TRSX as XML:
trsxSrc: { content: '<?xml atd atd...' }

If you want to use player and transcription separately:

```
new BeeyPublish({
  playerParent: container for player,
  transcriptParent: container for transcription,
}, ...
```
