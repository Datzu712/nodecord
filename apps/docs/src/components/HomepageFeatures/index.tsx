import { type ReactNode, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
    number: string;
    title: string;
    description: ReactNode;
    snippet?: ReactNode;
};

const FeatureList: FeatureItem[] = [
    {
        number: '01',
        title: 'Dependency Injection',
        description: (
            <>
                Built on top of Inversify, Nodecord provides a fully-featured IoC container with scoped modules, global
                providers, and parent-child container hierarchies.
            </>
        ),
    },
    {
        number: '02',
        title: 'Decorator-driven',
        description: (
            <>
                Define commands, listeners, interceptors, and providers with expressive decorators like{' '}
                <code>@SlashCommand</code>, <code>@ContextMenu</code>, <code>@Module</code>, and{' '}
                <code>@Injectable</code>.
            </>
        ),
    },
    {
        number: '03',
        title: 'Composable execution pipeline',
        description: (
            <>
                Every interaction flows through a layered pipeline: module-scoped interceptors, handler interceptors,
                and param resolvers. All composable, all replaceable. Add logging, guards, or response transforms
                without touching your handlers.
            </>
        ),
    },
    {
        number: '04',
        title: 'Framework, not a wrapper',
        description: (
            <>
                <code>@nodecord/core</code> has zero knowledge of any Discord library. The framework defines the
                pipeline; adapters connect it to the outside world. One ships for discord.js, and you can build your own
                for anything else.
            </>
        ),
    },
    {
        number: '05',
        title: 'Built for testing',
        description: (
            <>
                Full unit and integration testing without a live Discord connection. Override providers with{' '}
                <code>TestingModule</code>, or run end-to-end flows with <code>simulateInteraction()</code>.
            </>
        ),
        snippet: (
            <pre className={styles.cardCode}>
                <span className={styles.ckw}>const</span>
                {' ctx = '}
                <span className={styles.cfn}>createMockChatInputInteraction</span>
                {'('}
                <span className={styles.cstr}>'ping'</span>
                {');\n'}
                <span className={styles.ckw}>await</span>
                {' adapter.'}
                <span className={styles.cfn}>simulateInteraction</span>
                {'(ctx);\n'}
                <span className={styles.cfn}>expect</span>
                {'(ctx.reply).'}
                <span className={styles.cfn}>toHaveBeenCalledWith</span>
                {'('}
                <span className={styles.cstr}>'Pong!'</span>
                {');'}
            </pre>
        ),
    },
];

function Feature({ number, title, description, snippet, delay = 0 }: FeatureItem & { delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={clsx('padding--md', styles.featureCard, visible && styles.cardVisible)}
            style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
        >
            <span className={styles.cardNumber}>{number}</span>
            <Heading as="h3" className={styles.cardTitle}>
                {title}
            </Heading>
            <p className={styles.cardDesc}>{description}</p>
            {snippet}
        </div>
    );
}

export default function HomepageFeatures(): ReactNode {
    const firstRow = FeatureList.slice(0, 3);
    const secondRow = FeatureList.slice(3);

    return (
        <section className={styles.features}>
            <div className="container">
                <div className={styles.grid3}>
                    {firstRow.map((props, idx) => (
                        <Feature key={idx} {...props} delay={idx * 120} />
                    ))}
                </div>
                <div className={styles.grid2}>
                    {secondRow.map((props, idx) => (
                        <Feature key={idx + 3} {...props} delay={idx * 120} />
                    ))}
                </div>
            </div>
        </section>
    );
}
