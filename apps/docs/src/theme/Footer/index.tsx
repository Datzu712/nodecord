import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

function Footer(): ReactNode {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <div className={styles.brandLockup}>
                            <span className={styles.brandName}>Nodecord</span>
                        </div>
                        <p className={styles.brandDesc}>Your bot deserves an architecture.</p>
                    </div>
                    <div className={styles.linksWrapper}>
                        <div className={styles.linkGroup}>
                            <span className={styles.groupTitle}>Docs</span>
                            <Link className={styles.link} to="/docs/getting-started/introduction">
                                Get Started
                            </Link>
                        </div>
                        <div className={styles.linkGroup}>
                            <span className={styles.groupTitle}>Community</span>
                            <a
                                className={styles.link}
                                href="https://discord.com/invite/BSaERbS"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Discord
                            </a>
                            <a
                                className={styles.link}
                                href="https://github.com/Datzu712/nodecord"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <span className={styles.copyright}>
                        <span className={styles.commentPunct}>{'/* '}</span>
                        Copyright © {new Date().getFullYear()} Nodecord
                        <span className={styles.commentPunct}>{' */'}</span>
                    </span>
                    <a
                        className={styles.license}
                        href="https://github.com/Datzu712/nodecord/blob/main/LICENSE"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        MIT License
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default React.memo(Footer);
