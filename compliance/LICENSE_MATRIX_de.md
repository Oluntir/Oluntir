> **Sprache:** Deutsch · [English (reference)](LICENSE_MATRIX.md)

# License matrix

Audit date: 2026-07-27

| Component | Upstream | License | Bundled location | Audit result |
|---|---|---|---|---|
| Oluntir code and geometric demo assets | this repository | MIT | project-owned files and `assets/images/` | cleared |
| Bootstrap 4.6.2 / 5.3.8 | `github.com/twbs/bootstrap` | MIT | `frameworks/` | cleared; banners retained |
| GrapesJS 0.23.2 | `github.com/GrapesJS/grapesjs` | BSD-3-Clause | `plugins/editor/grapesjs/` | cleared |
| GrapesJS Preset Webpage 0.1.11 | `github.com/GrapesJS/preset-webpage` | BSD-3-Clause | `plugins/editor/grapesjs-preset-webpage/` | cleared |
| JSZip 3.10.1 | `github.com/Stuk/jszip` | MIT selected from MIT/GPL-3.0 dual license | `plugins/editor/jszip/` | cleared |
| FileSaver.js | `github.com/eligrey/FileSaver.js` | MIT | `plugins/editor/filesaver/` | cleared; exact bundled patch version not encoded |
| Font Awesome 4.7.0 | `github.com/FortAwesome/Font-Awesome` | MIT + SIL OFL 1.1 | `plugins/editor/font-awesome/` | cleared |
| Inter | `github.com/rsms/inter` | SIL OFL 1.1 | `assets/fonts/` | cleared |
| jQuery 3.4.1 | `github.com/jquery/jquery` | MIT | `plugins/site/js/jquery-3.4.1.min.js` | cleared |
| animate.css 3.7.2 | `github.com/animate-css/animate.css` | MIT | `plugins/site/css/animate/` | cleared |
| Tempus Dominus Bootstrap 4 5.1.2 | `github.com/tempusdominus/bootstrap-4` | MIT | `plugins/site/css/datetimepicker/` | cleared |
| Swiper 4.5.0 | `github.com/nolimits4web/swiper` | MIT | `plugins/site/css/swiper/`, `plugins/site/js/swiper/` | cleared |
| Swiper Animation 1.3.0 | `github.com/cycjimmy/swiper-animation` | MIT | `plugins/site/js/swiperanimation/` | cleared |
| Owl Carousel 2.3.4 | `github.com/OwlCarousel2/OwlCarousel2` | MIT | `plugins/site/css/owl-carousel/`, `plugins/site/js/owl-carousel/` | cleared |
| Magnific Popup 1.1.0 | `github.com/dimsemenov/Magnific-Popup` | MIT | `plugins/site/css/magnific-popup/`, `plugins/site/js/magnific-popup/` | cleared |
| Jarallax 1.10.7 / video 1.0.1 | `github.com/nk-o/jarallax` | MIT | `plugins/site/js/jarallax/` | cleared |
| Popper.js 1.14.7 | `github.com/FezVrasta/popper.js` | MIT | `plugins/site/js/popper/` | cleared |
| Shuffle | `github.com/Vestride/Shuffle` | MIT | `plugins/site/js/shuffle/` | cleared; exact bundled version not encoded |
| jQuery Appear | `github.com/bas2k/jquery.appear` | MIT | `plugins/site/js/jquery.appear.js` | cleared |
| jQuery CountTo | `github.com/mhuggins/jquery-countTo` | MIT | `plugins/site/js/counter/` | cleared |
| downCount | `github.com/sonnyt/downCount` | MIT | `plugins/site/js/countdown/` | cleared |

## Result

All distributed dependencies use permissive licenses compatible with an MIT
application distribution. The project license does not relicense third-party
files; their notices and upstream terms remain effective.
