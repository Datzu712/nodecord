import { useState, useEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

const TAGLINE =
    'A powerful TypeScript framework for building Discord bots with dependency injection, scoped modules, and decorator-driven commands.';

function TypewriterTagline() {
    const [text, setText] = useState('');
    const [cursorDone, setCursorDone] = useState(false);

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            i++;
            setText(TAGLINE.slice(0, i));
            if (i >= TAGLINE.length) {
                clearInterval(timer);
                setTimeout(() => setCursorDone(true), 2000);
            }
        }, 25);
        return () => clearInterval(timer);
    }, []);

    return (
        <p className={styles.heroSubtitle}>
            {text}
            <span className={clsx(styles.cursor, cursorDone && styles.cursorHidden)} />
        </p>
    );
}

function HeroCodeBlock() {
    return (
        <div className={styles.heroCode}>
            <pre className={styles.heroCodePre}>
                <span className={styles.cdec}>@SlashCommand</span>
                {'('}
                {')\n'}
                <span className={styles.ckw}>export</span> <span className={styles.ckw}>class</span>{' '}
                <span className={styles.ctype}>StatusCommand</span>
                {' {\n  '}
                <span className={styles.cfn}>constructor</span>
                {'('}
                <span className={styles.ckw}>private</span> <span className={styles.ckw}>readonly</span>{' '}
                <span className={styles.cvar}>db</span>
                {': '}
                <span className={styles.ctype}>DatabaseService</span>
                {') {}\n\n  '}
                <span className={styles.cdec}>@DeferReply</span>
                {'()\n  '}
                <span className={styles.cdec}>@UseInterceptors</span>
                {'('}
                <span className={styles.ctype}>EmbedFormatInterceptor</span>
                {')\n  '}
                <span className={styles.cfn}>execute</span>
                {'('}
                <span className={styles.cdec}>@Author</span>
                {'() '}
                <span className={styles.cvar}>user</span>
                {': '}
                <span className={styles.ctype}>User</span>
                {'): '}
                <span className={styles.ctype}>string</span>
                {' {\n    '}
                <span className={styles.ckw}>return</span> <span className={styles.cstr}>{`\`Hello \``}</span>
                <span className={styles.cpunct}>{'${'}</span>
                <span className={styles.cvar}>user</span>
                <span className={styles.cpunct}>{'.'}</span>
                <span className={styles.cvar}>username</span>
                <span className={styles.cpunct}>{'}'}</span>
                <span className={styles.cstr}>{`\`, bot is online\``}</span>
                {';\n  }\n}'}
            </pre>
        </div>
    );
}

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={styles.heroBanner}>
            <div className={clsx('container', styles.heroContent)}>
                <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
                <TypewriterTagline />
                <HeroCodeBlock />
                <div className={styles.buttons}>
                    <Link
                        className={clsx('button button--lg', styles.primaryButton)}
                        to="/docs/getting-started/introduction"
                    >
                        Get Started
                    </Link>
                    <Link
                        className={clsx('button button--lg', styles.secondaryButton)}
                        to="https://github.com/Datzu712/nodecord"
                    >
                        View on GitHub
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout title={siteConfig.title} description={siteConfig.tagline}>
            <HomepageHeader />
            <main>
                <HomepageFeatures />
            </main>
        </Layout>
    );
}
