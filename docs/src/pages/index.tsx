import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="A lightweight, customizable widget for manual QA and bug reporting in web applications. Capture screenshots, record screen sessions, add annotations, and generate detailed bug reports without leaving the page.">
      <main>
        <div className="container padding-vert--xl">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <h2>Introduction</h2>
              <p>
                Exterminator Bar is a lightweight, customizable widget for manual QA and bug reporting in web applications. 
                It allows you to capture screenshots, record screen sessions, add annotations, and generate detailed bug reports without leaving the page.
              </p>

              <h3>Features</h3>
              <ul>
                <li>📸 Screenshot capture with annotation tools (highlight, arrow, text)</li>
                <li>🎥 Screen recording</li>
                <li>📝 Customizable bug report forms</li>
                <li>🔄 Multiple integration options (GitHub, Linear, Asana, Custom Webhook)</li>
                <li>🎨 Simple, unobtrusive UI</li>
                <li>⌨️ Error handling and callbacks</li>
              </ul>

              <div className={styles.buttons} style={{ marginTop: '2rem' }}>
                <Link
                  className="button button--secondary button--lg"
                  to="/docs/intro"
                  style={{ marginRight: '1rem' }}>
                  Getting Started
                </Link>
                <Link
                  className="button button--secondary button--lg"
                  to="/docs/category/api-reference"
                  style={{ marginRight: '1rem' }}>
                  API Reference
                </Link>
                <Link
                  className="button button--secondary button--lg"
                  to="/docs/category/integrations">
                  Integrations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
