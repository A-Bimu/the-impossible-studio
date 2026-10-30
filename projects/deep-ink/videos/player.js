/* Deep Ink · approved motion study loader
 *
 * The two approved Deep Ink scroll studies are archived in this repository as
 * base64 chunks (videos/<file>.mp4.b64/part-NN.txt) so the exact approved files
 * can be restored byte for byte instead of being replaced by a re-render.
 *
 * This module reassembles those bytes in the browser, plays them through a blob
 * URL, and reports honest progress. Nothing about the video content is altered.
 *
 * Markup contract
 * ---------------
 *   <figure data-di-player
 *           data-src="…/concept-01-full-bleed.mp4.b64"
 *           data-parts="13"
 *           data-size="8.3 MB"
 *           data-note="Concept 01 · Wonders Beneath the Surface">
 *     <video controls muted loop playsinline preload="none" poster="…"></video>
 *     <p data-role="status">…</p>
 *     <button type="button" data-role="download" hidden>Download original MP4</button>
 *   </figure>
 *
 * Players load lazily the first time they scroll into view, so the front of the
 * page is not forced to download ~17 MB of archived video before it can be read.
 */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  root.DeepInkVideo = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var PART_STEP = 860000; /* archived chunk size, informational only */

  function partUrl(base, index) {
    var name = String(index);
    while (name.length < 2) name = '0' + name;
    return base.replace(/\/$/, '') + '/part-' + name + '.txt';
  }

  /* Chunks are split mid-base64, so the part texts must be joined first and
     decoded once. Decoding each chunk on its own would fail on padding. */
  function joinChunks(texts) {
    var joined = '';
    for (var i = 0; i < texts.length; i += 1) {
      joined += String(texts[i]).replace(/\s+/g, '');
    }
    return joined;
  }

  function toBytes(base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function reassemble(options) {
    var opts = options || {};
    var base = opts.src;
    var count = opts.parts;
    var load = opts.load || root.fetch;
    var onProgress = opts.onProgress || function () {};
    var texts = new Array(count);
    var done = 0;

    if (!base || !count) {
      return Promise.reject(new Error('Missing data-src or data-parts on the player.'));
    }
    if (typeof load !== 'function') {
      return Promise.reject(new Error('No fetch implementation available.'));
    }

    var jobs = [];
    for (var i = 0; i < count; i += 1) {
      jobs.push(
        (function (index) {
          return load(partUrl(base, index)).then(function (response) {
            if (!response.ok) {
              throw new Error('Archived part ' + index + ' returned ' + response.status);
            }
            return response.text();
          }).then(function (text) {
            texts[index] = text;
            done += 1;
            onProgress(done, count);
            return text;
          });
        })(i)
      );
    }

    return Promise.all(jobs).then(function () {
      return toBytes(joinChunks(texts));
    });
  }

  function megabytes(bytes) {
    return (bytes / 1000000).toFixed(1) + ' MB';
  }

  function attach(figure, options) {
    var opts = options || {};
    var video = figure.querySelector('video');
    var status = figure.querySelector('[data-role="status"]');
    var button = figure.querySelector('[data-role="download"]');
    var src = figure.getAttribute('data-src');
    var parts = parseInt(figure.getAttribute('data-parts'), 10) || 0;
    var note = figure.getAttribute('data-note') || 'Approved motion study';
    var url = null;

    function say(message) {
      if (status) status.textContent = message;
    }

    if (!video) return;
    if (figure.getAttribute('data-state') === 'ready' || figure.getAttribute('data-state') === 'loading') {
      return;
    }

    function loadNow() {
      if (figure.getAttribute('data-state') === 'loading' || figure.getAttribute('data-state') === 'ready') {
        return;
      }
      figure.setAttribute('data-state', 'loading');
      say('Reassembling the approved original from ' + parts + ' archived parts · 0%');

      reassemble({
        src: src,
        parts: parts,
        load: opts.load,
        onProgress: function (done, total) {
          say('Reassembling the approved original · ' + Math.round((done / total) * 100) + '%');
        }
      }).then(function (bytes) {
        url = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
        video.src = url;
        figure.setAttribute('data-state', 'ready');
        say('Approved original restored · ' + megabytes(bytes.length) + ' · ' + note);

        video.addEventListener('loadedmetadata', function () {
          var size = video.videoWidth + ' x ' + video.videoHeight;
          say(
            'Approved original restored · ' + megabytes(bytes.length) + ' · ' + size +
            ' · ' + Math.round(video.duration) + ' s · ' + note
          );
        });

        if (button) {
          button.hidden = false;
          button.addEventListener('click', function () {
            var link = document.createElement('a');
            link.href = url;
            link.download = note.replace(/[^A-Za-z0-9]+/g, '_') + '.mp4';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        }

        var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduce) {
          var played = video.play();
          if (played && played.catch) played.catch(function () { /* controls remain for manual play */ });
        }
      }).catch(function (error) {
        figure.setAttribute('data-state', 'failed');
        say(
          'The archived video parts could not be fetched here (' + error.message +
          '). Open the standalone video page, or serve the site over http(s).'
        );
      });
    }

    if ('IntersectionObserver' in root) {
      var seen = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i += 1) {
          if (entries[i].isIntersecting) {
            seen.disconnect();
            loadNow();
          }
        }
      }, { rootMargin: '250px 0px' });
      seen.observe(figure);
      say('Lazy: ' + parts + ' archived parts load when this section scrolls into view.');
    } else {
      loadNow();
    }
  }

  function boot() {
    var figures = document.querySelectorAll('[data-di-player]');
    for (var i = 0; i < figures.length; i += 1) {
      attach(figures[i]);
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }

  return {
    PART_STEP: PART_STEP,
    partUrl: partUrl,
    joinChunks: joinChunks,
    toBytes: toBytes,
    reassemble: reassemble,
    attach: attach,
    boot: boot
  };
});
