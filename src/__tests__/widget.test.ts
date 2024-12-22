import { describe, it, expect } from 'vitest';
import type { WidgetConfig } from '../types/config';
import type { GithubConfig } from '../types/integrations';

describe('WidgetConfig', () => {
  it('should validate a basic widget configuration', () => {
    const config: Partial<WidgetConfig> = {
      position: 'right',
      theme: {
        primary: '#FF4444',
        secondary: '#333333',
        text: '#FFFFFF',
        background: '#FFFFFF'
      }
    };

    expect(config.position).toBe('right');
    expect(config.theme?.primary).toBe('#FF4444');
  });

  it('should validate a configuration with tools', () => {
    const config: Partial<WidgetConfig> = {
      tools: {
        screenshot: {
          enabled: true,
          hotkey: 'ctrl+shift+s'
        },
        annotations: {
          enabled: true,
          tools: ['highlight', 'arrow', 'text']
        }
      }
    };

    expect(config.tools?.screenshot?.enabled).toBe(true);
    expect(config.tools?.annotations?.tools).toContain('highlight');
  });

  it('should validate a GitHub integration configuration', () => {
    const config: Partial<WidgetConfig> = {
      integration: {
        type: 'github',
        owner: 'test-owner',
        repo: 'test-repo',
        token: 'test-token',
        labels: ['bug']
      } as GithubConfig
    };

    const githubConfig = config.integration as GithubConfig;
    expect(githubConfig.type).toBe('github');
    expect(githubConfig.owner).toBe('test-owner');
  });
}); 