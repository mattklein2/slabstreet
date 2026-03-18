'use client';

import { useTheme } from '../ThemeProvider';
import { ExpandableSection } from '../shared/ExpandableSection';
import { BOX_TYPE_DESCRIPTIONS } from '../../../lib/format';

const RETAIL_TYPES = ['blaster', 'mega_box', 'hanger', 'fat_pack', 'cello', 'value_pack', 'gravity_feed'];

export function BoxTypeEducation() {
  const { colors } = useTheme();

  return (
    <ExpandableSection title="What Are Box Types?">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {RETAIL_TYPES.map(ct => {
          const info = BOX_TYPE_DESCRIPTIONS[ct];
          if (!info) return null;
          return (
            <div key={ct} style={{ padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                {info.name}
              </div>
              <div style={{ fontSize: 13, color: colors.secondary, lineHeight: 1.6 }}>
                {info.description}
              </div>
            </div>
          );
        })}
      </div>
    </ExpandableSection>
  );
}
