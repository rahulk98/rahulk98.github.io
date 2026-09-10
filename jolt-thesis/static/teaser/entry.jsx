// Entry for the JoLT thesis teaser. The three imported files are the Claude
// Design project "KV Compression Animation" (thesis-teaser.jsx on the
// animations-v3 engine), copied verbatim except for one keyboard guard in
// animations-v3.jsx. Build: static/teaser/build.sh
import './animations-v3.jsx';
import './tweaks-panel.jsx';
import './thesis-teaser.jsx';

window.OM_SCENES = '[{"name":"Cache","dur":6},{"name":"Tensor","dur":6},{"name":"Allocate","dur":5},{"name":"FreeZone","dur":8},{"name":"LongContext","dur":7},{"name":"Credit","dur":4}]';
window.OM_PLAYBACK = '{"mode":"loop"}';
window.TWEAK_DEFAULTS = { motionEditor: false, authorName: 'Rahul Krishnan', captions: true, accent: '#1f8a5b' };

function mount() {
    var host = document.getElementById('jolt-teaser');
    if (!host || !window.React || !window.ReactDOM) return;
    ReactDOM.createRoot(host).render(React.createElement(window.ThesisTeaser));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
