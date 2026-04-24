import { useEffect } from "react";

export default function PublicLayout({ children, seo }) {
  useEffect(() => {
    if (seo) {
      if (seo.title) {
        document.title = seo.title;
      }
      if (seo.description) {
        setMetaTag("description", seo.description);
      }
      if (seo.keywords) {
        setMetaTag("keywords", seo.keywords);
      }
      if (seo.ogTitle) {
        setMetaTag("og:title", seo.ogTitle, "property");
      }
      if (seo.ogDescription) {
        setMetaTag("og:description", seo.ogDescription, "property");
      }
      if (seo.ogImage) {
        setMetaTag("og:image", seo.ogImage, "property");
      }
      if (seo.ogUrl) {
        setMetaTag("og:url", seo.ogUrl, "property");
      }
      if (seo.ogType) {
        setMetaTag("og:type", seo.ogType, "property");
      }
      if (seo.canonical) {
        setLinkTag("canonical", seo.canonical);
      }
    }

    document.body.classList.add("public-page-body");

    return () => {
      document.body.classList.remove("public-page-body");
      resetMetaTags();
    };
  }, [seo]);

  return (
    <div className="public-page">
      {children}
    </div>
  );
}

function setMetaTag(name, content, type = "name") {
  let meta = document.querySelector(`meta[${type}="${name}"]`);
  if (!meta) {
    meta = document.createElementt("meta");
    meta.setAttribute(type, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setLinkTag(rel, href) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElementt("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function resetMetaTags() {
  const metaTags = document.querySelectorAll('meta[name^="og:"], meta[name="description"], meta[name="keywords"]');
  metaTags.forEach((tag) => tag.remove());
  
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) canonicalLink.remove();
}
