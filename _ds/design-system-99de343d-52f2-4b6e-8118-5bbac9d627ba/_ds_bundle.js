/* @ds-bundle: {"format":4,"namespace":"DesignSystem_99de34","components":[{"name":"AdvCard","sourcePath":"components/cards/AdvCard.jsx"},{"name":"CaseCard","sourcePath":"components/cards/CaseCard.jsx"},{"name":"FlipCard","sourcePath":"components/cards/FlipCard.jsx"},{"name":"LinkCard","sourcePath":"components/cards/LinkCard.jsx"},{"name":"ModelCard","sourcePath":"components/cards/ModelCard.jsx"},{"name":"ObjCard","sourcePath":"components/cards/ObjCard.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"GhostLink","sourcePath":"components/core/GhostLink.jsx"},{"name":"Pill","sourcePath":"components/core/Pill.jsx"},{"name":"SectionHead","sourcePath":"components/core/SectionHead.jsx"},{"name":"Counter","sourcePath":"components/data/Counter.jsx"},{"name":"FaqItem","sourcePath":"components/data/FaqItem.jsx"},{"name":"Spec","sourcePath":"components/data/Spec.jsx"},{"name":"Timeline","sourcePath":"components/data/Timeline.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"TextArea","sourcePath":"components/forms/TextArea.jsx"},{"name":"Banner","sourcePath":"components/sections/Banner.jsx"},{"name":"Footer","sourcePath":"components/sections/Footer.jsx"},{"name":"Nav","sourcePath":"components/sections/Nav.jsx"}],"sourceHashes":{"components/cards/AdvCard.jsx":"9fe0ee2b970a","components/cards/CaseCard.jsx":"183f66f8870b","components/cards/FlipCard.jsx":"ff891af1b994","components/cards/LinkCard.jsx":"676ab9f29bfb","components/cards/ModelCard.jsx":"eff711ecfa87","components/cards/ObjCard.jsx":"acfac25c8d3d","components/core/Eyebrow.jsx":"1e0234e6bfd4","components/core/GhostLink.jsx":"2f64f69ed1fe","components/core/Pill.jsx":"659cc8991d05","components/core/SectionHead.jsx":"6ce124afd84d","components/data/Counter.jsx":"82c21e9bbd14","components/data/FaqItem.jsx":"c29634be7d18","components/data/Spec.jsx":"df407137fd4f","components/data/Timeline.jsx":"b32d31ba131e","components/forms/Field.jsx":"78eb6b8ea1ce","components/forms/TextArea.jsx":"3fdff3877a55","components/sections/Banner.jsx":"49aae78daa1d","components/sections/Footer.jsx":"7526e8894ee9","components/sections/Nav.jsx":"2ef04de95e8c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_99de34 = window.DesignSystem_99de34 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/cards/AdvCard.jsx
try { (() => {
/** AdvCard — advantage cell: icon + title + copy. Group in an .adv-grid. */
function AdvCard({
  icon,
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "adv"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "ico",
    "aria-hidden": true
  }, icon), /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("p", null, children));
}
Object.assign(__ds_scope, { AdvCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/AdvCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/CaseCard.jsx
try { (() => {
/** CaseCard — case study: photo, client kicker, ROI headline (green mono), meta pairs. */
function CaseCard({
  image,
  alt = '',
  client,
  roi,
  meta = []
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "case"
  }, /*#__PURE__*/React.createElement("div", {
    className: "case-media"
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: alt
  })), /*#__PURE__*/React.createElement("div", {
    className: "case-body"
  }, client && /*#__PURE__*/React.createElement("div", {
    className: "case-client"
  }, client), /*#__PURE__*/React.createElement("div", {
    className: "roi"
  }, roi), /*#__PURE__*/React.createElement("div", {
    className: "case-meta"
  }, meta.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "cv mono"
  }, m.value), /*#__PURE__*/React.createElement("div", {
    className: "ck"
  }, m.label))))));
}
Object.assign(__ds_scope, { CaseCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/CaseCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/FlipCard.jsx
try { (() => {
const {
  useState
} = React;
/** FlipCard — 3D flip card: front (icon + title) → back (copy + payback). No bounce. */
function FlipCard({
  icon,
  title,
  hint,
  children,
  payback
}) {
  const [flipped, setFlipped] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: 'flip' + (flipped ? ' flipped' : ''),
    onClick: () => setFlipped(f => !f)
  }, /*#__PURE__*/React.createElement("div", {
    className: "flip-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flip-face flip-front"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "ico",
    "aria-hidden": true
  }, icon), /*#__PURE__*/React.createElement("h3", null, title), hint && /*#__PURE__*/React.createElement("span", {
    className: "hint"
  }, hint)), /*#__PURE__*/React.createElement("div", {
    className: "flip-face flip-back"
  }, /*#__PURE__*/React.createElement("p", null, children), payback && /*#__PURE__*/React.createElement("span", {
    className: "payback"
  }, payback))));
}
Object.assign(__ds_scope, { FlipCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/FlipCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/ObjCard.jsx
try { (() => {
/** ObjCard — objection → answer. Question is auto-wrapped in «ёлочки». */
function ObjCard({
  q,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "obj"
  }, /*#__PURE__*/React.createElement("div", {
    className: "q"
  }, q), /*#__PURE__*/React.createElement("div", {
    className: "a"
  }, children));
}
Object.assign(__ds_scope, { ObjCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ObjCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Eyebrow — short uppercase thematic label above a heading. */
function Eyebrow({
  children,
  signal = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("p", _extends({
    className: ['t-eyebrow', className].filter(Boolean).join(' '),
    style: signal ? {
      color: 'var(--signal-blue)'
    } : undefined
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/GhostLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** GhostLink — inline "read more" link with a › that slides right on hover. */
function GhostLink({
  href = '#',
  children,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    className: ['ghost', className].filter(Boolean).join(' ')
  }, rest), children);
}
Object.assign(__ds_scope, { GhostLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/GhostLink.jsx", error: String((e && e.message) || e) }); }

// components/cards/LinkCard.jsx
try { (() => {
/** LinkCard — hub card: title, copy, ghost link. Lifts −4px on hover. */
function LinkCard({
  title,
  children,
  href = '#',
  linkLabel = 'Подробнее'
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "lcard"
  }, /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("p", null, children), /*#__PURE__*/React.createElement(__ds_scope.GhostLink, {
    href: href
  }, linkLabel));
}
Object.assign(__ds_scope, { LinkCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/LinkCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Pill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Pill — the brand's only button shape (fully rounded, 980px radius).
 * variant: 'primary' (apple-blue fill) | 'outline' (link-blue border) | 'ghost' (text + › arrow)
 */
function Pill({
  variant = 'primary',
  as = 'button',
  children,
  className = '',
  ...rest
}) {
  const cls = variant === 'ghost' ? 'ghost' : variant === 'outline' ? 'pill pill-outline' : 'pill pill-primary';
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: [cls, className].filter(Boolean).join(' ')
  }, rest), children);
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Pill.jsx", error: String((e && e.message) || e) }); }

// components/cards/ModelCard.jsx
try { (() => {
/** ModelCard — product card: render on the fff→f0f0f3 gradient, tag, title, spec pairs, CTA. */
function ModelCard({
  image,
  alt = '',
  tag,
  title,
  specs = [],
  href = '#',
  cta = 'Подробнее'
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "model-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "model-media"
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: alt
  })), /*#__PURE__*/React.createElement("div", {
    className: "model-body"
  }, tag && /*#__PURE__*/React.createElement("div", {
    className: "model-tag"
  }, tag), /*#__PURE__*/React.createElement("h3", null, title), /*#__PURE__*/React.createElement("div", {
    className: "model-specs"
  }, specs.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "mv"
  }, s.value), /*#__PURE__*/React.createElement("div", {
    className: "mk"
  }, s.label)))), /*#__PURE__*/React.createElement(__ds_scope.Pill, {
    variant: "outline",
    as: "a",
    href: href,
    style: {
      alignSelf: 'flex-start',
      marginTop: 'auto',
      padding: '9px 18px',
      fontSize: 14
    }
  }, cta)));
}
Object.assign(__ds_scope, { ModelCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ModelCard.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHead.jsx
try { (() => {
/** SectionHead — eyebrow + heading + optional sub, the standard section intro. */
function SectionHead({
  eyebrow,
  signal = false,
  title,
  sub,
  center = true,
  level = 'h2',
  size = 't-heading'
}) {
  const H = level;
  return /*#__PURE__*/React.createElement("div", {
    className: ['col', 'stack', center ? 'center' : ''].filter(Boolean).join(' ')
  }, eyebrow && /*#__PURE__*/React.createElement("p", {
    className: "t-eyebrow",
    style: signal ? {
      color: 'var(--signal-blue)'
    } : undefined
  }, eyebrow), /*#__PURE__*/React.createElement(H, {
    className: size
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    className: "t-sub"
  }, sub));
}
Object.assign(__ds_scope, { SectionHead });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHead.jsx", error: String((e && e.message) || e) }); }

// components/data/Counter.jsx
try { (() => {
/** Counter — big mono number + label, divided by hairline in a row of 3. */
function Counter({
  value,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "counter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num mono"
  }, value), /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, label));
}
Object.assign(__ds_scope, { Counter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Counter.jsx", error: String((e && e.message) || e) }); }

// components/data/FaqItem.jsx
try { (() => {
const {
  useState
} = React;
/** FaqItem — accordion row with the CSS-drawn +/× toggle. */
function FaqItem({
  q,
  children,
  defaultOpen = false
}) {
  const [open, setOpen] = useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", {
    className: 'faq-item' + (open ? ' open' : '')
  }, /*#__PURE__*/React.createElement("button", {
    className: "faq-q",
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", null, q), /*#__PURE__*/React.createElement("span", {
    className: "plus"
  })), /*#__PURE__*/React.createElement("div", {
    className: "faq-a",
    style: {
      maxHeight: open ? 400 : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "faq-a-inner"
  }, children)));
}
Object.assign(__ds_scope, { FaqItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/FaqItem.jsx", error: String((e && e.message) || e) }); }

// components/data/Spec.jsx
try { (() => {
/** Spec — mono value + small label, hairline-divided in a .spec-row. */
function Spec({
  value,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "spec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v mono"
  }, value), /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, label));
}
Object.assign(__ds_scope, { Spec });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Spec.jsx", error: String((e && e.message) || e) }); }

// components/data/Timeline.jsx
try { (() => {
/** Timeline — horizontal process track with numbered steps and a filled progress line. */
function Timeline({
  steps = [],
  progress = 1
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "timeline"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tl-line"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fill",
    style: {
      width: progress * 100 + '%'
    }
  })), steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: 'tl-step' + (i / Math.max(steps.length - 1, 1) <= progress ? ' on' : '')
  }, /*#__PURE__*/React.createElement("span", {
    className: "tl-dot"
  }), /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("h4", null, s.title), /*#__PURE__*/React.createElement("p", null, s.text)))));
}
Object.assign(__ds_scope, { Timeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Timeline.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Field — labelled text input with the hairline box + apple-blue focus ring. Optional unit suffix. */
function Field({
  label,
  unit,
  mono = true,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['field', className].filter(Boolean).join(' ')
  }, label && /*#__PURE__*/React.createElement("label", null, label), /*#__PURE__*/React.createElement("div", {
    className: "field-input"
  }, /*#__PURE__*/React.createElement("input", _extends({
    style: mono ? {
      fontFamily: 'var(--font-mono)'
    } : {
      fontFamily: 'var(--font-text)'
    }
  }, rest)), unit && /*#__PURE__*/React.createElement("span", {
    className: "unit"
  }, unit)));
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextArea.jsx
try { (() => {
/** TextArea — multi-line field matching Field's box + focus ring. */
function TextArea({
  label,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['field', className].filter(Boolean).join(' ')
  }, label && /*#__PURE__*/React.createElement("label", null, label), /*#__PURE__*/React.createElement("textarea", rest));
}
Object.assign(__ds_scope, { TextArea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextArea.jsx", error: String((e && e.message) || e) }); }

// components/sections/Banner.jsx
try { (() => {
/** Banner — full-bleed photo section with protective left/bottom gradient and overlaid copy. */
function Banner({
  image,
  alt = '',
  eyebrow,
  title,
  sub,
  cta,
  ctaHref = '#',
  center = false
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: 'banner' + (center ? ' center-grad' : '')
  }, /*#__PURE__*/React.createElement("img", {
    className: "bg",
    src: image,
    alt: alt
  }), /*#__PURE__*/React.createElement("div", {
    className: "banner-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-l stack"
  }, eyebrow && /*#__PURE__*/React.createElement("p", {
    className: "t-eyebrow",
    style: {
      color: 'var(--signal-blue)'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    className: "t-heading-lg"
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    className: "t-sub light"
  }, sub), cta && /*#__PURE__*/React.createElement("div", {
    className: "btn-row",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Pill, {
    variant: "primary",
    as: "a",
    href: ctaHref
  }, cta)))));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sections/Banner.jsx", error: String((e && e.message) || e) }); }

// components/sections/Footer.jsx
try { (() => {
/** Footer — brand blurb + link columns + bottom bar. */
function Footer({
  blurb,
  columns = [],
  bottom = '© 2026 ИнтеллектКАЗС · Санкт-Петербург',
  logo = 'assets/logo-mark.png'
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "foot-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "foot-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: logo,
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "word",
    style: {
      color: 'var(--carbon)'
    }
  }, "\u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442", /*#__PURE__*/React.createElement("b", null, "\u041A\u0410\u0417\u0421"))), /*#__PURE__*/React.createElement("p", null, blurb || 'Производство контейнерных АЗС полного цикла. Санкт-Петербург, работаем по всей России.')), columns.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h5", null, c.title), c.links.map((l, j) => /*#__PURE__*/React.createElement("a", {
    key: j,
    href: l.href || '#'
  }, l.label))))), /*#__PURE__*/React.createElement("div", {
    className: "foot-bottom"
  }, /*#__PURE__*/React.createElement("span", null, bottom), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438"))));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sections/Footer.jsx", error: String((e && e.message) || e) }); }

// components/sections/Nav.jsx
try { (() => {
const {
  useState
} = React;
/** Nav — fixed glass navigation: brand mark + word, links, phone, primary CTA. */
function Nav({
  links = [],
  phone = '8 812 219 34 85',
  solid = true,
  cta = 'Заказать звонок',
  onCta,
  logo = 'assets/logo-mark.png'
}) {
  const [open, setOpen] = useState(false);
  return /*#__PURE__*/React.createElement("nav", {
    className: 'nav' + (solid ? ' solid' : '') + (open ? ' open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-inner"
  }, /*#__PURE__*/React.createElement("a", {
    className: "brand",
    href: "#top"
  }, /*#__PURE__*/React.createElement("img", {
    src: logo,
    alt: "\u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u041A\u0410\u0417\u0421"
  }), /*#__PURE__*/React.createElement("span", {
    className: "word"
  }, "\u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442", /*#__PURE__*/React.createElement("b", null, "\u041A\u0410\u0417\u0421"))), /*#__PURE__*/React.createElement("div", {
    className: "nav-links"
  }, links.map((l, i) => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: l.href || '#'
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    className: "nav-cta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "nav-phone mono"
  }, phone), /*#__PURE__*/React.createElement(__ds_scope.Pill, {
    variant: "primary",
    onClick: onCta
  }, cta), /*#__PURE__*/React.createElement("button", {
    className: 'nav-burger' + (open ? ' x' : ''),
    "aria-label": "\u041C\u0435\u043D\u044E",
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)))));
}
Object.assign(__ds_scope, { Nav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/sections/Nav.jsx", error: String((e && e.message) || e) }); }

__ds_ns.AdvCard = __ds_scope.AdvCard;

__ds_ns.CaseCard = __ds_scope.CaseCard;

__ds_ns.FlipCard = __ds_scope.FlipCard;

__ds_ns.LinkCard = __ds_scope.LinkCard;

__ds_ns.ModelCard = __ds_scope.ModelCard;

__ds_ns.ObjCard = __ds_scope.ObjCard;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.GhostLink = __ds_scope.GhostLink;

__ds_ns.Pill = __ds_scope.Pill;

__ds_ns.SectionHead = __ds_scope.SectionHead;

__ds_ns.Counter = __ds_scope.Counter;

__ds_ns.FaqItem = __ds_scope.FaqItem;

__ds_ns.Spec = __ds_scope.Spec;

__ds_ns.Timeline = __ds_scope.Timeline;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.TextArea = __ds_scope.TextArea;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.Nav = __ds_scope.Nav;

})();
