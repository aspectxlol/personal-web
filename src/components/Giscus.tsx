"use client";

import Giscus from "@giscus/react";

export default function GiscusComponent() {
  return (
    <Giscus
      repo="aspectxlol/content-repo"
      repoId="YOUR_REPO_ID"
      category="Blog Comments"
      categoryId="DIC_kwDOP7D40M4CwZZj"
      mapping="pathname"
      reactionsEnabled="1"
      theme="dark_dimmed"
    />
  );
}