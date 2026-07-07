import React from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {usePluralForm} from '@docusaurus/theme-common';
import {useDateTimeFormat} from '@docusaurus/theme-common/internal';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import styles from './styles.module.css';
// Very simple pluralization: probably good enough for now
function useReadingTimePlural() {
  const {selectMessage} = usePluralForm();
  return (readingTimeFloat) => {
    const readingTime = Math.ceil(readingTimeFloat);
    return selectMessage(
      readingTime,
      translate(
        {
          id: 'theme.blog.post.readingTime.plurals',
          description:
            'Pluralized label for "{readingTime} min read". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: 'One min read|{readingTime} min read',
        },
        {readingTime},
      ),
    );
  };
}
function ReadingTime({readingTime}) {
  const readingTimePlural = useReadingTimePlural();
  return <>{readingTimePlural(readingTime)}</>;
}
function DateTime({date, formattedDate}) {
  return <time dateTime={date}>{formattedDate}</time>;
}
function Spacer() {
  return <>{' · '}</>;
}

const SHANGHAI_OFFSET = 8 * 60 * 60 * 1000;

export default function BlogPostItemHeaderInfo({className}) {
  const {metadata} = useBlogPost();
  const {date, readingTime} = metadata;
  const dateTimeFormat = useDateTimeFormat({
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai',
  });
  const formatDate = (blogDate) => {
    const adjusted = new Date(new Date(blogDate).getTime() - SHANGHAI_OFFSET);
    return dateTimeFormat.format(adjusted);
  };
  return (
    <div className={clsx(styles.container, 'margin-vert--md', className)}>
      <DateTime date={date} formattedDate={formatDate(date)} />
      {typeof readingTime !== 'undefined' && (
        <>
          <Spacer />
          <ReadingTime readingTime={readingTime} />
        </>
      )}
    </div>
  );
}
