import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
    tutorialSidebar: [
        {
            type: 'category',
            label: 'Getting Started',
            collapsed: false,
            items: ['getting-started/introduction', 'getting-started/installation', 'getting-started/quick-start'],
        },
        {
            type: 'category',
            label: 'Core Concepts',
            collapsed: false,
            items: [
                'core-concepts/modules',
                'core-concepts/providers-injection',
                'core-concepts/commands',
                'core-concepts/listeners',
                'core-concepts/interceptors',
                'core-concepts/exception-handlers',
            ],
        },
        {
            type: 'category',
            label: 'Testing',
            collapsed: false,
            items: ['testing/overview', 'testing/testing-module', 'testing/e2e-testing'],
        },
        {
            type: 'category',
            label: 'Adapters',
            collapsed: false,
            items: ['adapters/overview', 'adapters/param-decorators', 'adapters/discordjs-adapter'],
        },
    ],
};

export default sidebars;
