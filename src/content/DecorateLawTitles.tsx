import React, { useEffect } from 'react';
import { createProcessLock } from '../utils/processControl';

const DecorateLawTitles: React.FC = () => {
  useEffect(() => {
    const processLock = createProcessLock();

    const decorateElements = async () => {
      // 優先順位の高い処理から順番に実行
      await processLock(async () => {
        await addClassToArticleTitleAndParagraphTitle();
        await addClassToArticleTitle();
        await addClassToParagraphTitle();
        await addClassToItemTitle();
        await addClassToPortionTitle();
      });
    };

    decorateElements();
  }, []);

  return null;
};

export default DecorateLawTitles; 