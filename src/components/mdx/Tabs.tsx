'use client';

import { useState, ReactNode } from 'react';

interface TabContentItem {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  children?: ReactNode;
  tabs?: TabContentItem[];
}

interface TabItemProps {
  label: string;
  children: ReactNode;
}

/**
 * TabItem - wraps content with metadata for Tabs to extract
 * Key: Must return a div with data-tab-label attribute for MDX compatibility
 */
export function TabItem({ label, children }: TabItemProps) {
  // Return a div that Tabs can identify and extract
  return (
    <div data-tab-label={label} data-tab-content="true">
      {children}
    </div>
  );
}

export function Tabs({ children, tabs: providedTabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  // If tabs were provided directly as props, use those
  if (providedTabs && providedTabs.length > 0) {
    return (
      <div className="my-6 border border-blue-400/30 rounded-lg bg-blue-400/5 overflow-hidden">
        <div className="flex border-b border-blue-400/30 flex-wrap">
          {providedTabs.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-3 font-mono text-sm transition ${
                activeTab === index
                  ? 'bg-blue-500/20 border-b-2 border-blue-400 text-blue-300'
                  : 'hover:bg-blue-500/10 text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-6">{providedTabs[activeTab]?.content}</div>
      </div>
    );
  }

  // Extract tabs from children (MDX-rendered divs with data-tab-label)
  const tabItems: TabContentItem[] = [];

  if (children) {
    // Flatten children since MDX might nest them differently
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flattenChildren = (node: any): any[] => {
      if (!node) return [];
      if (Array.isArray(node)) return node.flatMap(flattenChildren);
      if (typeof node === 'object' && node.props) {
        // If this is a tab content div, include it
        if (node.props['data-tab-label']) {
          return [node];
        }
        // Otherwise, flatten any children
        if (node.props.children) {
          return flattenChildren(node.props.children);
        }
      }
      return [];
    };

    const flatChildren = flattenChildren(children);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    flatChildren.forEach((child: any) => {
      if (
        typeof child === 'object' &&
        child.props &&
        child.props['data-tab-label']
      ) {
        tabItems.push({
          label: child.props['data-tab-label'],
          content: child.props.children,
        });
      }
    });
  }

  if (tabItems.length === 0) {
    return (
      <div className="my-6 p-4 bg-red-400/10 border border-red-400/30 rounded text-red-400 text-sm">
        <div className="font-mono">❌ No tabs found</div>
        <div className="text-xs mt-3 text-slate-300 space-y-1">
          <div>✓ Use nested TabItem components:</div>
          <code className="block bg-slate-900 p-2 rounded mt-2 text-cyan-300">
            &lt;Tabs&gt;{'\n'}  &lt;TabItem label="Tab 1"&gt;Content&lt;/TabItem&gt;{'\n'}&lt;/Tabs&gt;
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 border border-blue-400/30 rounded-lg bg-blue-400/5 overflow-hidden">
      <div className="flex border-b border-blue-400/30 flex-wrap">
        {tabItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 font-mono text-sm transition ${
              activeTab === index
                ? 'bg-blue-500/20 border-b-2 border-blue-400 text-blue-300'
                : 'hover:bg-blue-500/10 text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="p-6">{tabItems[activeTab]?.content}</div>
    </div>
  );
}
